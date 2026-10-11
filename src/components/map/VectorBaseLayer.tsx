import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "@maplibre/maplibre-gl-leaflet";

/**
 * The base map: OpenFreeMap vector tiles, drawn by MapLibre under Leaflet.
 *
 * Replaces raster OpenStreetMap tiles (busy, dated) and CARTO's dark tiles,
 * which now answer "API KEY REQUIRED" for keyless use. OpenFreeMap is free
 * with no key and no request limit, and being vector it stays sharp at any
 * zoom. Labels are switched to Arabic names where the map has them, with the
 * RTL plugin so they shape and join correctly.
 */
const STYLES = {
  light: "https://tiles.openfreemap.org/styles/liberty",
  dark: "https://tiles.openfreemap.org/styles/dark",
} as const;

const RTL_PLUGIN =
  "https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js";

let rtlRequested = false;
const ensureRtlPlugin = () => {
  if (rtlRequested) return;
  rtlRequested = true;
  try {
    if (maplibregl.getRTLTextPluginStatus() === "unavailable") {
      void maplibregl.setRTLTextPlugin(RTL_PLUGIN, true);
    }
  } catch {
    // Labels still render, just unshaped — never worth breaking the map.
  }
};

const ARABIC_LABEL = [
  "coalesce",
  ["get", "name:ar"],
  ["get", "name"],
  ["get", "name_en"],
];

type MapLibreLayer = L.Layer & { getMaplibreMap: () => maplibregl.Map };

const VectorBaseLayer = ({ theme }: { theme: "light" | "dark" }) => {
  const map = useMap();

  useEffect(() => {
    ensureRtlPlugin();
    const layer = (
      L as unknown as {
        maplibreGL: (options: Record<string, unknown>) => MapLibreLayer;
      }
    ).maplibreGL({
      style: STYLES[theme],
      attributionControl: false,
    });
    layer.addTo(map);

    const gl = layer.getMaplibreMap();
    const toArabic = () => {
      for (const styleLayer of gl.getStyle()?.layers ?? []) {
        if (
          styleLayer.type === "symbol" &&
          gl.getLayoutProperty(styleLayer.id, "text-field")
        ) {
          gl.setLayoutProperty(styleLayer.id, "text-field", ARABIC_LABEL);
        }
      }
    };
    gl.once("styledata", toArabic);

    return () => {
      map.removeLayer(layer);
    };
  }, [map, theme]);

  return null;
};

export default VectorBaseLayer;
