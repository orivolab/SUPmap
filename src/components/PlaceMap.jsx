import L from "leaflet";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultMarkerIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],

  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

function PlaceMap({
  places = [],
  onSelectPlace,
  center = [52.1, 19.4],
  zoom = 6,
  height = "500px",
}) {
  const validPlaces = places.filter(
    (place) => {
      const lat = Number(place.lat);
      const lng = Number(place.lng);

      return (
        Number.isFinite(lat) &&
        Number.isFinite(lng)
      );
    }
  );

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{
        height,
        width: "100%",
        borderRadius: "20px",
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {validPlaces.map((place) => (
        <Marker
          key={`place-${place.id}`}
          position={[
            Number(place.lat),
            Number(place.lng),
          ]}
          icon={defaultMarkerIcon}
        >
          <Popup>
            <strong>{place.name}</strong>

            {place.city && (
              <>
                <br />
                <span>{place.city}</span>
              </>
            )}

            <br />

            <button
              type="button"
              onClick={() =>
                onSelectPlace?.(place)
              }
            >
              Zobacz szczegóły
            </button>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default PlaceMap;