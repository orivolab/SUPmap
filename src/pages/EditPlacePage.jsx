import PlaceFormFields from "../components/PlaceFormFields";

function EditPlacePage({
  place,
  position,
  selectedImage,
  message,
  isSubmitting,
  onBack,
  onOpenLocationPicker,
  onImageChange,
  onSubmit,
}) {
  if (!place) {
    return (
      <div className="placeDetails">
        <button
          type="button"
          className="backButton"
          onClick={onBack}
        >
          ← Wróć
        </button>

        <h1>Nie znaleziono miejsca.</h1>
      </div>
    );
  }

  return (
    <div className="placeDetails">
      <button
        type="button"
        className="backButton"
        onClick={onBack}
      >
        ← Wróć
      </button>

      <h1>Edytuj miejsce</h1>

      <p
        style={{
          lineHeight: 1.6,
          color: "#5c6c66",
        }}
      >
        Zmień informacje o miejscu. Wszystkie
        zmiany zostaną zapisane po zatwierdzeniu.
      </p>

      <form
        className="addPlaceForm"
        onSubmit={onSubmit}
      >
        <PlaceFormFields
          place={place}
          position={position}
          onOpenLocationPicker={
            onOpenLocationPicker
          }
        />

        <section
          style={{
            marginTop: "38px",
          }}
        >
          <h2>📷 Zdjęcie główne</h2>

          {place.image_url && (
            <img
              src={place.image_url}
              alt={place.name}
              style={{
                width: "100%",
                maxWidth: "500px",
                borderRadius: "16px",
                marginBottom: "16px",
              }}
            />
          )}

          <label>
            Zmień zdjęcie (opcjonalnie)

            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
            />
          </label>

          {selectedImage && (
            <p>
              Nowe zdjęcie:{" "}
              <strong>
                {selectedImage.name}
              </strong>
            </p>
          )}
        </section>

        <button
          type="submit"
          className="addPlaceButton"
          disabled={isSubmitting}
          style={{
            marginTop: "34px",
          }}
        >
          {isSubmitting
            ? "Zapisywanie..."
            : "Zapisz zmiany"}
        </button>

        {message && (
          <p className="formMessage">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

export default EditPlacePage;