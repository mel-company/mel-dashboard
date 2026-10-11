import { useEffect } from "react";
import { MapContainer, Marker, useMap } from "react-leaflet";
import { brandPinIcon } from "@/components/map/brand-pin";
import VectorBaseLayer from "@/components/map/VectorBaseLayer";
import "leaflet/dist/leaflet.css";
import { useResolvedTheme } from "@/hooks/use-resolved-theme";



function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
}

type Props = {
  lat: number;
  lng: number;
};

const StoreMapPreview = ({ lat, lng }: Props) => {
  const theme = useResolvedTheme();

  return (
    <MapContainer
      key={`${theme}-${lat}-${lng}`}
      center={[lat, lng]}
      zoom={15}
      className="size-full z-0"
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
      zoomControl={false}
      attributionControl={false}
    >
      <VectorBaseLayer theme={theme} />
      <RecenterMap lat={lat} lng={lng} />
      <Marker position={[lat, lng]} icon={brandPinIcon} />
    </MapContainer>
  );
};

export default StoreMapPreview;
