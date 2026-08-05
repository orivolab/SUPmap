import {
  MapContainer,
  TileLayer,
} from "react-leaflet";
import LocationPicker from "../components/LocationPicker";

function LocationPickerPage({
  position,
  onSelect,
  onBack,
  onConfirm,
  title = "Wybierz lokalizację",
}) {
  const center = position
    ? [Number(position.lat), Number(position.lng)]
    : [52.1, 19.4];

  return (
    <div className="locationPickerPage">
      <div className="locationPickerHeader">
        <button
          type="button"
          className="backButton"
          onClick={onBack}
        >
          ← Wróć do formularza
        </button>

        <div>
          <h1>{title}</h1>
          <p>Kliknij dokładne miejsce zejścia do wody.</p>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={position ? 15 : 6}
        style={{
          height: "65vh",
          width: "100%",
          borderRadius: "20px",
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationPicker
          position={position}
          onSelect={onSelect}
        />
      </MapContainer>

      <div className="locationPickerFooter">
        {position ? (
          <p>
            Wybrano: {Number(position.lat).toFixed(6)},{" "}
            {Number(position.lng).toFixed(6)}
          </p>
        ) : (
          <p>Nie wybrano jeszcze miejsca.</p>
        )}

        <button
          type="button"
          className="addPlaceButton"
          disabled={!position}
          onClick={onConfirm}
        >
          Zatwierdź lokalizację
        </button>
      </div>
    </div>
  );
}

export default LocationPickerPage;