import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MapPin, Search } from "lucide-react";
import { toast } from "sonner";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const pinIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DEFAULT_LAT = 33.3152;
const DEFAULT_LNG = 44.3661;
const IRAQ_BBOX = "38.7,29.0,49.0,37.5";

type GeocodeResult = {
  id: string;
  display_name: string;
  lat: number;
  lon: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  latitude: number | null;
  longitude: number | null;
  address: string;
  onConfirm: (data: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
};

function formatPhotonAddress(properties: Record<string, string | undefined>) {
  return [
    properties.name,
    properties.street,
    properties.district,
    properties.city,
    properties.state,
    properties.country,
  ]
    .filter(Boolean)
    .join("، ");
}

async function searchPlaces(query: string): Promise<GeocodeResult[]> {
  const res = await fetch(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=ar&bbox=${IRAQ_BBOX}`,
  );
  if (!res.ok) throw new Error("search failed");

  const data = await res.json();
  return (data.features ?? []).map(
  (
    feature: {
      properties: Record<string, string | undefined>;
      geometry: { coordinates: [number, number] };
    },
    index: number,
  ) => ({
    id: String(feature.properties.osm_id ?? index),
    display_name: formatPhotonAddress(feature.properties),
    lat: feature.geometry.coordinates[1],
    lon: feature.geometry.coordinates[0],
  }),
  );
}

async function reverseGeocodePlace(
  lat: number,
  lng: number,
): Promise<string | null> {
  const res = await fetch(
    `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}&lang=ar`,
  );
  if (!res.ok) return null;

  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) return null;

  return formatPhotonAddress(feature.properties);
}

function MapClickHandler({
  onPositionChange,
}: {
  onPositionChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapResizeFix() {
  const map = useMap();
  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => window.clearTimeout(timer);
  }, [map]);
  return null;
}

function RecenterMap({
  lat,
  lng,
  zoom,
}: {
  lat: number;
  lng: number;
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], zoom, { duration: 0.6 });
  }, [lat, lng, zoom, map]);
  return null;
}

function LocationMarker({
  position,
  onPositionChange,
}: {
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    markerRef.current?.setLatLng(position);
  }, [position]);

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={pinIcon}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const pos = (e.target as L.Marker).getLatLng();
          onPositionChange(pos.lat, pos.lng);
        },
      }}
    />
  );
}

const LocationDialog = ({
  open,
  onOpenChange,
  latitude,
  longitude,
  address,
  onConfirm,
}: Props) => {
  const [draftLat, setDraftLat] = useState(DEFAULT_LAT);
  const [draftLng, setDraftLng] = useState(DEFAULT_LNG);
  const [mapZoom, setMapZoom] = useState(14);
  const [draftAddress, setDraftAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraftLat(latitude ?? DEFAULT_LAT);
    setDraftLng(longitude ?? DEFAULT_LNG);
    setMapZoom(latitude != null && longitude != null ? 15 : 14);
    setDraftAddress(address);
    setSearchQuery("");
    setSearchResults([]);
  }, [open, latitude, longitude, address]);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const placeName = await reverseGeocodePlace(lat, lng);
      if (placeName) {
        setDraftAddress(placeName);
      }
    } catch {
      // keep current address on failure
    } finally {
      setIsReverseGeocoding(false);
    }
  }, []);

  const handlePositionChange = useCallback(
    (lat: number, lng: number) => {
      setDraftLat(lat);
      setDraftLng(lng);
      void reverseGeocode(lat, lng);
    },
    [reverseGeocode],
  );

  const handleSearch = useCallback(async () => {
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    try {
      const results = await searchPlaces(query);
      setSearchResults(results);
      if (results.length === 0) {
        toast.error("لم يتم العثور على نتائج");
      }
    } catch {
      toast.error("تعذر البحث عن العنوان");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleSelectResult = (result: GeocodeResult) => {
    setDraftLat(result.lat);
    setDraftLng(result.lon);
    setMapZoom(16);
    setDraftAddress(result.display_name);
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleConfirm = () => {
    onConfirm({
      latitude: draftLat,
      longitude: draftLng,
      address: draftAddress.trim(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="size-5" />
            تغيير موقع المتجر
          </DialogTitle>
          <DialogDescription>
            ابحث عن العنوان أو انقر على الخريطة لتحديد الموقع
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location-search">بحث عن عنوان</Label>
            <div className="flex gap-2">
              <Input
                id="location-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleSearch();
                  }
                }}
                placeholder="مثال: بغداد، زيونة"
                dir="rtl"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => void handleSearch()}
                disabled={isSearching}
              >
                {isSearching ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
              </Button>
            </div>
            {searchResults.length > 0 && (
              <ul className="max-h-40 overflow-y-auto rounded-xl border bg-background">
                {searchResults.map((result) => (
                  <li key={result.id}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-right text-sm hover:bg-muted"
                      onClick={() => handleSelectResult(result)}
                    >
                      {result.display_name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative h-80 overflow-hidden rounded-2xl border sm:h-96">
            {open && (
              <MapContainer
                key={`map-${open}`}
                center={[draftLat, draftLng]}
                zoom={mapZoom}
                className="size-full z-0"
                scrollWheelZoom
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapResizeFix />
                <RecenterMap lat={draftLat} lng={draftLng} zoom={mapZoom} />
                <LocationMarker
                  position={[draftLat, draftLng]}
                  onPositionChange={handlePositionChange}
                />
                <MapClickHandler onPositionChange={handlePositionChange} />
              </MapContainer>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location-address">العنوان</Label>
            <Textarea
              id="location-address"
              value={draftAddress}
              onChange={(e) => setDraftAddress(e.target.value)}
              rows={3}
              placeholder="أدخل عنوان المتجر"
              dir="rtl"
            />
            {isReverseGeocoding && (
              <p className="text-xs text-muted-foreground">
                جاري تحديث العنوان...
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button type="button" onClick={handleConfirm}>
              تأكيد الموقع
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationDialog;
