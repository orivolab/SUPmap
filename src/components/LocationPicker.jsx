import { Marker, Popup, useMapEvents } from "react-leaflet";

function LocationPicker({ position, onSelect }) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng);
    },
  });

  if (!position) {
    return null;
  }

  return (
    <Marker position={[position.lat, position.lng]}>
      <Popup>Wybrana lokalizacja</Popup>
    </Marker>
  );
}

export default LocationPicker;