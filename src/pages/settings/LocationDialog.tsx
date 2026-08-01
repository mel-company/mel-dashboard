import { useCallback, useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2, MapPin, Search, X } from "lucide-react";
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
import {
  SettingsField,
  SettingsInput,
  SettingsTextarea,
} from "@/new-pages/settings/components/SettingsField";
import { cn } from "@/lib/utils";

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
  const parts = [
    properties.name,
    properties.street,
    properties.housenumber,
    properties.suburb,
    properties.district,
    properties.locality,
    properties.neighbourhood,
    properties.city,
    properties.town,
    properties.county,
    properties.state,
    properties.country,
  ].filter(Boolean);

  return [...new Set(parts)].join("، ");
}

async function searchNominatim(query: string): Promise<GeocodeResult[]> {
  const params = new URLSearchParams({
    format: "jsonv2",
    q: query,
    countrycodes: "iq",
    "accept-language": "ar",
    limit: "6",
    addressdetails: "1",
  });

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) throw new Error("nominatim search failed");

  const data = await res.json();
  if (!Array.isArray(data)) return [];

  return data.map(
    (
      item: {
        place_id?: number | string;
        display_name?: string;
        lat?: string;
        lon?: string;
      },
      index: number,
    ) => ({
      id: String(item.place_id ?? `nom-${index}`),
      display_name: item.display_name?.trim() || query,
      lat: Number(item.lat),
      lon: Number(item.lon),
    }),
  ).filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lon));
}

async function searchPhoton(query: string): Promise<GeocodeResult[]> {
  const params = new URLSearchParams({
    q: query,
    limit: "6",
    lang: "ar",
    lat: String(DEFAULT_LAT),
    lon: String(DEFAULT_LNG),
  });

  const res = await fetch(`https://photon.komoot.io/api/?${params.toString()}`);
  if (!res.ok) throw new Error("photon search failed");

  const data = await res.json();
  return (data.features ?? []).map(
    (
      feature: {
        properties: Record<string, string | undefined> & { osm_id?: number };
        geometry: { coordinates: [number, number] };
      },
      index: number,
    ) => ({
      id: String(feature.properties.osm_id ?? `ph-${index}`),
      display_name:
        formatPhotonAddress(feature.properties) ||
        feature.properties.name ||
        query,
      lat: feature.geometry.coordinates[1],
      lon: feature.geometry.coordinates[0],
    }),
  );
}

async function searchPlaces(query: string): Promise<GeocodeResult[]> {
  // Nominatim first — better Arabic / Iraq place coverage
  try {
    const nominatim = await searchNominatim(query);
    if (nominatim.length > 0) return nominatim;
  } catch {
    // fallback below
  }

  try {
    return await searchPhoton(query);
  } catch {
    return [];
  }
}

async function reverseGeocodePhoton(
  lat: number,
  lng: number,
): Promise<string | null> {
  const res = await fetch(
    `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}&lang=ar`,
  );
  if (!res.ok) return null;

  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature?.properties) return null;

  return formatPhotonAddress(feature.properties) || null;
}

async function reverseGeocodeNominatim(
  lat: number,
  lng: number,
): Promise<string | null> {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(lat),
    lon: String(lng),
    "accept-language": "ar",
    addressdetails: "1",
  });

  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) return null;

  const data = await res.json();
  if (typeof data?.display_name === "string" && data.display_name.trim()) {
    return data.display_name.trim();
  }
  return null;
}

async function reverseGeocodePlace(
  lat: number,
  lng: number,
): Promise<string | null> {
  try {
    const photon = await reverseGeocodePhoton(lat, lng);
    if (photon) return photon;
  } catch {
    /* try nominatim */
  }

  try {
    return await reverseGeocodeNominatim(lat, lng);
  } catch {
    return null;
  }
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
    const timer = window.setTimeout(() => map.invalidateSize(), 150);
    return () => window.clearTimeout(timer);
  }, [map]);
  return null;
}

function RecenterMap({
  lat,
  lng,
  zoom,
  enabled,
}: {
  lat: number;
  lng: number;
  zoom: number;
  enabled: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    if (!enabled) return;
    map.flyTo([lat, lng], zoom, { duration: 0.55 });
  }, [lat, lng, zoom, map, enabled]);
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
  const [shouldRecenter, setShouldRecenter] = useState(false);
  const reverseRequestId = useRef(0);

  useEffect(() => {
    if (!open) return;
    setDraftLat(latitude ?? DEFAULT_LAT);
    setDraftLng(longitude ?? DEFAULT_LNG);
    setMapZoom(latitude != null && longitude != null ? 15 : 14);
    setDraftAddress(address);
    setSearchQuery("");
    setSearchResults([]);
    setShouldRecenter(false);
  }, [open, latitude, longitude, address]);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    const requestId = ++reverseRequestId.current;
    setIsReverseGeocoding(true);
    try {
      const placeName = await reverseGeocodePlace(lat, lng);
      if (requestId !== reverseRequestId.current) return;

      setDraftAddress(
        placeName || `موقع محدد (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
      );
    } catch {
      if (requestId !== reverseRequestId.current) return;
      setDraftAddress(`موقع محدد (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
    } finally {
      if (requestId === reverseRequestId.current) {
        setIsReverseGeocoding(false);
      }
    }
  }, []);

  const handlePositionChange = useCallback(
    (lat: number, lng: number) => {
      setShouldRecenter(false);
      setDraftLat(lat);
      setDraftLng(lng);
      setDraftAddress("");
      void reverseGeocode(lat, lng);
    },
    [reverseGeocode],
  );

  const handleSearch = useCallback(async () => {
    const query = searchQuery.trim();
    if (!query) {
      toast.error("اكتب اسم المنطقة أو العنوان للبحث");
      return;
    }

    setIsSearching(true);
    setSearchResults([]);
    try {
      const results = await searchPlaces(query);
      setSearchResults(results);
      if (results.length === 0) {
        toast.error("لم يتم العثور على نتائج — جرّب اسم أوضح مثل: بغداد الكرادة");
      }
    } catch {
      toast.error("تعذر البحث عن العنوان. تحقق من الاتصال وحاول مرة أخرى");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleSelectResult = (result: GeocodeResult) => {
    setShouldRecenter(true);
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

  const busy = isSearching || isReverseGeocoding;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        showCloseButton={false}
        className="max-h-[90vh] gap-0 overflow-hidden rounded-3xl border-0 p-0 shadow-xl sm:max-w-xl"
      >
        <div className="max-h-[90vh] overflow-y-auto p-5 sm:p-6">
          {/* Header — نفس ثيم الإعدادات */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex size-9 items-center justify-center rounded-xl bg-violet-100 text-[#1a2b5a] hover:bg-violet-200"
              aria-label="إغلاق"
            >
              <X className="size-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <DialogTitle className="text-lg font-bold text-[#1a2b5a]">
                تغيير موقع المتجر
              </DialogTitle>
              <div className="flex size-10 items-center justify-center rounded-2xl bg-sky-100 text-[#00b7ff]">
                <MapPin className="size-5" strokeWidth={2} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <SettingsField label="بحث عن عنوان" htmlFor="location-search">
              <div className="flex gap-2">
                <SettingsInput
                  id="location-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void handleSearch();
                    }
                  }}
                  placeholder="مثال: بغداد، الكرادة"
                  disabled={isSearching}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => void handleSearch()}
                  disabled={isSearching}
                  className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#00b7ff] px-4 text-sm font-semibold text-white hover:bg-[#00a3e6] disabled:opacity-50"
                >
                  {isSearching ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Search className="size-4" />
                  )}
                  بحث
                </button>
              </div>
            </SettingsField>

            {searchResults.length > 0 && (
              <ul className="max-h-40 overflow-y-auto rounded-2xl bg-slate-50 dark:bg-slate-900">
                {searchResults.map((result) => (
                  <li key={result.id}>
                    <button
                      type="button"
                      className={cn(
                        "w-full px-4 py-2.5 text-right text-sm text-[#1a2b5a]",
                        "hover:bg-sky-50 dark:text-blue-100 dark:hover:bg-slate-800",
                      )}
                      onClick={() => handleSelectResult(result)}
                    >
                      {result.display_name}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="relative h-72 overflow-hidden rounded-2xl border border-slate-100 sm:h-80 dark:border-slate-800">
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
                  <RecenterMap
                    lat={draftLat}
                    lng={draftLng}
                    zoom={mapZoom}
                    enabled={shouldRecenter}
                  />
                  <LocationMarker
                    position={[draftLat, draftLng]}
                    onPositionChange={handlePositionChange}
                  />
                  <MapClickHandler onPositionChange={handlePositionChange} />
                </MapContainer>
              )}
            </div>

            <SettingsField label="العنوان" htmlFor="location-address">
              <SettingsTextarea
                id="location-address"
                value={draftAddress}
                onChange={(e) => setDraftAddress(e.target.value)}
                rows={3}
                placeholder={
                  isReverseGeocoding
                    ? "جاري جلب اسم الموقع..."
                    : "أدخل عنوان المتجر أو اسحب الدبوس"
                }
                className="min-h-[88px]"
              />
              {isReverseGeocoding && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
                  <Loader2 className="size-3 animate-spin" />
                  جاري تحديث العنوان من الموقع...
                </p>
              )}
            </SettingsField>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={busy}
                className="h-12 rounded-2xl bg-slate-100 text-sm font-semibold text-[#1a2b5a] hover:bg-slate-200 disabled:opacity-50"
              >
                الغاء
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={busy}
                className="h-12 rounded-2xl bg-[#00b7ff] text-sm font-semibold text-white hover:bg-[#00a3e6] disabled:opacity-50"
              >
                تأكيد الموقع
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationDialog;
