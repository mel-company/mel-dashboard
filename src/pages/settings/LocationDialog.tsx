import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2, MapPin, Search, X } from "lucide-react";
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
import { useFetchStates } from "@/api/wrappers/state.wrappers";
import { useFetchRegionsByState } from "@/api/wrappers/region.wrappers";
import {
  DARK_MAP_TILES,
  LIGHT_MAP_TILES,
  useResolvedTheme,
} from "@/hooks/use-resolved-theme";

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

const STATE_COORDS: Record<string, [number, number]> = {
  بغداد: [33.3152, 44.3661],
  البصرة: [30.5081, 47.7835],
  نينوى: [36.3489, 43.1575],
  أربيل: [36.1911, 44.0092],
  اربيل: [36.1911, 44.0092],
  السليمانية: [35.555, 45.435],
  دهوك: [36.867, 42.988],
  كركوك: [35.4681, 44.3922],
  الأنبار: [33.425, 43.3],
  الانبار: [33.425, 43.3],
  ديالى: [33.75, 44.65],
  واسط: [32.5, 45.83],
  بابل: [32.47, 44.42],
  كربلاء: [32.616, 44.025],
  النجف: [32.0, 44.33],
  القادسية: [31.99, 44.92],
  المثنى: [31.32, 45.28],
  "ذي قار": [31.05, 46.26],
  ميسان: [31.84, 47.14],
  "صلاح الدين": [34.6, 43.68],
  حلبجة: [35.18, 45.98],
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

function getDisplayName(name: unknown): string {
  if (!name) return "";
  if (typeof name === "string") return name;
  if (typeof name === "object") {
    const n = name as Record<string, string>;
    return n.ar || n.arabic || n.en || n.english || "";
  }
  return String(name);
}

function resolveStateCoords(stateName: string): [number, number] {
  const trimmed = stateName.trim();
  if (STATE_COORDS[trimmed]) return STATE_COORDS[trimmed];
  const key = Object.keys(STATE_COORDS).find(
    (k) => trimmed.includes(k) || k.includes(trimmed),
  );
  return key ? STATE_COORDS[key] : [DEFAULT_LAT, DEFAULT_LNG];
}

function normalizeList(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.states)) return obj.states;
    if (Array.isArray(obj.regions)) return obj.regions;
  }
  return [];
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
  const theme = useResolvedTheme();
  const tiles = theme === "dark" ? DARK_MAP_TILES : LIGHT_MAP_TILES;

  const [draftLat, setDraftLat] = useState(DEFAULT_LAT);
  const [draftLng, setDraftLng] = useState(DEFAULT_LNG);
  const [mapZoom, setMapZoom] = useState(14);
  const [draftAddress, setDraftAddress] = useState("");
  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [listFilter, setListFilter] = useState("");
  const [shouldRecenter, setShouldRecenter] = useState(false);

  const { data: statesData, isLoading: isLoadingStates } = useFetchStates(
    undefined,
    open,
  );
  const { data: regionsData, isLoading: isLoadingRegions } =
    useFetchRegionsByState(selectedStateId, open && !!selectedStateId);

  const states = useMemo(() => normalizeList(statesData), [statesData]);
  const regions = useMemo(() => normalizeList(regionsData), [regionsData]);

  const selectedState = states.find((s: any) => s.id === selectedStateId);
  const selectedStateName = getDisplayName(selectedState?.name);

  const filteredStates = useMemo(() => {
    const q = listFilter.trim();
    if (!q || selectedStateId) return states;
    return states.filter((s: any) => getDisplayName(s.name).includes(q));
  }, [states, listFilter, selectedStateId]);

  const filteredRegions = useMemo(() => {
    const q = listFilter.trim();
    if (!q) return regions;
    return regions.filter((r: any) => getDisplayName(r.name).includes(q));
  }, [regions, listFilter]);

  useEffect(() => {
    if (!open) return;
    setDraftLat(latitude ?? DEFAULT_LAT);
    setDraftLng(longitude ?? DEFAULT_LNG);
    setMapZoom(latitude != null && longitude != null ? 15 : 14);
    setDraftAddress(address);
    setSelectedStateId("");
    setSelectedRegionId("");
    setListFilter("");
    setShouldRecenter(false);
  }, [open, latitude, longitude, address]);

  useEffect(() => {
    setSelectedRegionId("");
    setListFilter("");
  }, [selectedStateId]);

  const applyPlace = useCallback((stateName: string, regionName?: string) => {
    const [lat, lng] = resolveStateCoords(stateName);
    const label = regionName ? `${regionName}، ${stateName}` : stateName;
    setShouldRecenter(true);
    setDraftLat(lat);
    setDraftLng(lng);
    setMapZoom(regionName ? 14 : 11);
    setDraftAddress(label);
  }, []);

  const handleSelectState = (state: any) => {
    setSelectedStateId(state.id);
    applyPlace(getDisplayName(state.name));
  };

  const handleSelectRegion = (region: any) => {
    setSelectedRegionId(region.id);
    applyPlace(selectedStateName || "العراق", getDisplayName(region.name));
  };

  const handlePositionChange = useCallback((lat: number, lng: number) => {
    setShouldRecenter(false);
    setDraftLat(lat);
    setDraftLng(lng);
  }, []);

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
      <DialogContent
        dir="rtl"
        showCloseButton={false}
        className={cn(
          "max-h-[90vh] gap-0 overflow-hidden rounded-3xl border-0 p-0 shadow-xl sm:max-w-xl",
          "bg-white dark:bg-slate-950",
        )}
      >
        <div className="max-h-[90vh] overflow-y-auto p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex size-9 items-center justify-center rounded-xl bg-violet-100 text-[#1a2b5a] hover:bg-violet-200 dark:bg-violet-950/60 dark:text-violet-200 dark:hover:bg-violet-900/70"
              aria-label="إغلاق"
            >
              <X className="size-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <DialogTitle className="text-lg font-bold tracking-tight text-[#1a2b5a] dark:text-slate-50">
                تغيير موقع المتجر
              </DialogTitle>
              <div className="flex size-10 items-center justify-center rounded-2xl bg-sky-100 text-[#00b7ff] dark:bg-sky-950/50 dark:text-sky-300">
                <MapPin className="size-5" strokeWidth={2} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {selectedStateId ? "اختر المنطقة" : "اختر المحافظة"}
                </p>
                {selectedStateId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStateId("");
                      setSelectedRegionId("");
                      setListFilter("");
                    }}
                    className="text-xs font-semibold text-[#00b7ff] hover:underline dark:text-sky-400"
                  >
                    تغيير المحافظة
                  </button>
                )}
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <SettingsInput
                  value={listFilter}
                  onChange={(e) => setListFilter(e.target.value)}
                  placeholder={
                    selectedStateId ? "فلتر المناطق..." : "فلتر المحافظات..."
                  }
                  className="pr-10"
                />
              </div>

              <div className="max-h-44 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80">
                {!selectedStateId ? (
                  isLoadingStates ? (
                    <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-400 dark:text-slate-500">
                      <Loader2 className="size-4 animate-spin" />
                      جاري تحميل المحافظات...
                    </div>
                  ) : filteredStates.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                      لا توجد محافظات
                    </p>
                  ) : (
                    filteredStates.map((state: any) => (
                      <button
                        key={state.id}
                        type="button"
                        onClick={() => handleSelectState(state)}
                        className="w-full border-b border-slate-100/80 px-4 py-2.5 text-right text-sm font-medium text-slate-800 last:border-0 hover:bg-sky-50 dark:border-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-800"
                      >
                        {getDisplayName(state.name)}
                      </button>
                    ))
                  )
                ) : isLoadingRegions ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-400 dark:text-slate-500">
                    <Loader2 className="size-4 animate-spin" />
                    جاري تحميل المناطق...
                  </div>
                ) : filteredRegions.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                    لا توجد مناطق لهذه المحافظة
                  </p>
                ) : (
                  filteredRegions.map((region: any) => {
                    const active = region.id === selectedRegionId;
                    return (
                      <button
                        key={region.id}
                        type="button"
                        onClick={() => handleSelectRegion(region)}
                        className={cn(
                          "w-full border-b border-slate-100/80 px-4 py-2.5 text-right text-sm font-medium last:border-0 dark:border-slate-800/80",
                          active
                            ? "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-200"
                            : "text-slate-800 hover:bg-sky-50 dark:text-slate-100 dark:hover:bg-slate-800",
                        )}
                      >
                        {getDisplayName(region.name)}
                      </button>
                    );
                  })
                )}
              </div>

              {selectedStateName && (
                <p className="text-xs leading-relaxed text-slate-400 dark:text-slate-500">
                  المحافظة:{" "}
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {selectedStateName}
                  </span>
                  {selectedRegionId ? (
                    <>
                      {" · "}
                      المنطقة:{" "}
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        {getDisplayName(
                          regions.find((r: any) => r.id === selectedRegionId)
                            ?.name,
                        )}
                      </span>
                    </>
                  ) : null}
                </p>
              )}
            </div>

            <div className="relative h-64 overflow-hidden rounded-2xl border border-slate-200/80 sm:h-72 dark:border-slate-800">
              {open && (
                <MapContainer
                  key={`map-${theme}-${open}`}
                  center={[draftLat, draftLng]}
                  zoom={mapZoom}
                  className="size-full z-0"
                  scrollWheelZoom
                >
                  <TileLayer url={tiles} />
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
                rows={2}
                placeholder="اختر من القائمة أو عدّل العنوان يدوياً"
                className="min-h-[72px]"
              />
            </SettingsField>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="h-12 rounded-2xl bg-slate-100 text-sm font-semibold text-[#1a2b5a] hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                الغاء
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="h-12 rounded-2xl bg-[#00b7ff] text-sm font-semibold text-white hover:bg-[#00a3e6]"
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
