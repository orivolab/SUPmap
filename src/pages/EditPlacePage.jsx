import PlaceFormFields from "../components/PlaceFormFields";

function EditPlacePage({
  place,
  placeUpdate,
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

      {placeUpdate && (
        <section
          className="adminCard"
          style={{
            marginTop: "24px",
            marginBottom: "28px",
            padding: "22px",
            background: "#f4f7f6",
          }}
        >
          <h2
            style={{
              marginTop: 0,
            }}
          >
            📨 Zgłoszona aktualizacja
          </h2>

          <p>
            Kategoria:{" "}
            <strong>
              {placeUpdate.proposed_data?.category ||
                "Nie podano"}
            </strong>
          </p>

          {placeUpdate.proposed_data?.current_value && (
            <div
              style={{
                marginTop: "14px",
              }}
            >
              <strong>Obecne informacje:</strong>

              <p
                style={{
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.6,
                }}
              >
                {placeUpdate.proposed_data.current_value}
              </p>
            </div>
          )}

          <div
            style={{
              marginTop: "14px",
              padding: "16px",
              borderRadius: "12px",
              background: "#ffffff",
            }}
          >
            <strong>Proponowana zmiana:</strong>

            <p
              style={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.6,
                marginBottom: 0,
              }}
            >
              {placeUpdate.proposed_data?.proposed_value ||
                placeUpdate.message ||
                "Brak treści"}
            </p>
          </div>

          {placeUpdate.proposed_data?.source_url && (
            <p
              style={{
                marginTop: "16px",
              }}
            >
              🔗 Źródło:{" "}
              <a
                href={placeUpdate.proposed_data.source_url}
                target="_blank"
                rel="noreferrer"
              >
                Otwórz link
              </a>
            </p>
          )}
        </section>
      )}

      <form
        className="addPlaceForm"
        onSubmit={onSubmit}
      >
        <PlaceFormFields
          place={place}
          position={position}
          highlightedCategory={
            placeUpdate?.proposed_data?.category
          }
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
