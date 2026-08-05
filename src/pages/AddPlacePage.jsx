import {
  useEffect,
  useState,
} from "react";

import PlaceFormFields from "../components/PlaceFormFields";
import ImageCropModal from "../components/ImageCropModal";

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
  const [
    cropImageUrl,
    setCropImageUrl,
  ] = useState(null);

  const [
    originalFileName,
    setOriginalFileName,
  ] = useState("");

  useEffect(() => {
    return () => {
      if (cropImageUrl) {
        URL.revokeObjectURL(
          cropImageUrl
        );
      }
    };
  }, [cropImageUrl]);

  function handleFileSelection(
    event
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      window.alert(
        "Wybierz plik graficzny."
      );

      event.target.value = "";
      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      window.alert(
        "Zdjęcie może mieć maksymalnie 5 MB."
      );

      event.target.value = "";
      return;
    }

    if (cropImageUrl) {
      URL.revokeObjectURL(
        cropImageUrl
      );
    }

    setOriginalFileName(file.name);

    setCropImageUrl(
      URL.createObjectURL(file)
    );
  }

  async function handleCropSave(
    croppedFile
  ) {
    const finalFile =
      new File(
        [croppedFile],
        originalFileName ||
          croppedFile.name,
        {
          type:
            croppedFile.type ||
            "image/jpeg",

          lastModified:
            Date.now(),
        }
      );

    await onImageChange(
      finalFile
    );

    if (cropImageUrl) {
      URL.revokeObjectURL(
        cropImageUrl
      );
    }

    setCropImageUrl(null);
    setOriginalFileName("");
  }

  function handleCropCancel() {
    if (cropImageUrl) {
      URL.revokeObjectURL(
        cropImageUrl
      );
    }

    setCropImageUrl(null);
    setOriginalFileName("");
  }

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
        Uzupełnij tyle informacji,
        ile znasz. Miejsce pojawi się
        na mapie po zatwierdzeniu przez
        administratora.
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
              onChange={
                handleFileSelection
              }
            />

            <small>
              Maksymalny rozmiar zdjęcia:
              5 MB. Po wybraniu zdjęcia
              ustawisz jego kadr.
            </small>
          </label>

          {selectedImage && (
            <div
              style={{
                display: "grid",
                gap: "12px",
                marginTop: "16px",
              }}
            >
              <p
                style={{
                  margin: 0,
                }}
              >
                Wykadrowane zdjęcie:{" "}
                <strong>
                  {selectedImage.name}
                </strong>
              </p>

              <img
                src={
                  selectedImage.previewUrl
                }
                alt="Podgląd wykadrowanego zdjęcia"
                style={{
                  width:
                    "min(650px, 100%)",
                  aspectRatio: "16 / 7",
                  display: "block",
                  objectFit: "cover",
                  borderRadius: "18px",
                }}
              />
            </div>
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

      {cropImageUrl && (
        <ImageCropModal
          imageUrl={cropImageUrl}
          aspect={16 / 7}
          onCancel={
            handleCropCancel
          }
          onSave={handleCropSave}
        />
      )}
    </div>
  );
}

export default AddPlacePage;