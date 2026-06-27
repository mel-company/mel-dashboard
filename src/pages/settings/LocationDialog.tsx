import { useCallback, useEffect, useState } from "react";
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
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_LAT = 33.3152;
const DEFAULT_LNG = 44.3661;

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
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

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
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
  const [draftAddress, setDraftAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraftLat(latitude ?? DEFAULT_LAT);
    setDraftLng(longitude ?? DEFAULT_LNG);
    setDraftAddress(address);
    setSearchQuery("");
    setSearchResults([]);
  }, [open, latitude, longitude, address]);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`,
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data?.display_name) {
        setDraftAddress(data.display_name);
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
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=iq&limit=5&accept-language=ar`,
      );
      if (!res.ok) {
        toast.error("تعذر البحث عن العنوان");
        return;
      }
      const data = (await res.json()) as NominatimResult[];
      setSearchResults(data);
      if (data.length === 0) {
        toast.error("لم يتم العثور على نتائج");
      }
    } catch {
      toast.error("تعذر البحث عن العنوان");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleSelectResult = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setDraftLat(lat);
    setDraftLng(lng);
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
                  <li key={result.place_id}>
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

          <div className="relative h-64 overflow-hidden rounded-2xl border">
            {open && (
              <MapContainer
                center={[draftLat, draftLng]}
                zoom={14}
                className="size-full z-0"
                scrollWheelZoom
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap lat={draftLat} lng={draftLng} />
                <Marker
                  position={[draftLat, draftLng]}
                  draggable
                  eventHandlers={{
                    dragend: (e) => {
                      const marker = e.target as L.Marker;
                      const pos = marker.getLatLng();
                      handlePositionChange(pos.lat, pos.lng);
                    },
                  }}
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
