import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";

function PlaceMap({
  places,
  onSelectPlace,
  center = [52.1, 19.4],
  zoom = 6,
  height = "500px",
}) {
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

      {places.map((place, index) => (
        <Marker
          key={`${place.source || "database"}-${place.id}-${index}`}
          position={[
            Number(place.lat),
            Number(place.lng),
          ]}
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
              onClick={() => onSelectPlace(place)}
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