import PlaceFormFields from "../components/PlaceFormFields";

function AddPlacePage({
  position,
  selectedImage,
  message,
  isSubmitting,
  onBack,
  onOpenLocationPicker,
  onImageChange,
  onSubmit,
}) {
  return (
    <div className="placeDetails">
      <button
        type="button"
        className="backButton"
        onClick={onBack}
      >
        ← Wróć do mapy
      </button>

      <h1>Dodaj nowe miejsce</h1>

      <p
        style={{
          lineHeight: 1.6,
          color: "#5c6c66",
        }}
      >
        Uzupełnij tyle informacji, ile znasz.
        Miejsce pojawi się na mapie po zatwierdzeniu
        przez administratora.
      </p>

      <form
        className="addPlaceForm"
        onSubmit={onSubmit}
      >
        <PlaceFormFields
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

          <label>
            Dodaj zdjęcie miejsca

            <input
              name="image"
              type="file"
              accept="image/*"
              onChange={onImageChange}
              required
            />

            <small>
              Maksymalny rozmiar zdjęcia: 5 MB.
              Najlepiej wybrać zdjęcie pokazujące
              wejście do wody lub całą plażę.
            </small>
          </label>

          {selectedImage && (
            <p>
              Wybrane zdjęcie:{" "}
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
            ? "Wysyłanie..."
            : "Wyślij do zatwierdzenia"}
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

export default AddPlacePage;