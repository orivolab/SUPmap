import {
  useCallback,
  useState,
} from "react";

import Cropper from "react-easy-crop";

function createImage(imageUrl) {
  return new Promise(
    (resolve, reject) => {
      const image = new Image();

      image.addEventListener(
        "load",
        () => resolve(image)
      );

      image.addEventListener(
        "error",
        reject
      );

      image.setAttribute(
        "crossOrigin",
        "anonymous"
      );

      image.src = imageUrl;
    }
  );
}

async function getCroppedImage(
  imageUrl,
  pixelCrop,
  rotation = 0
) {
  const image =
    await createImage(imageUrl);

  const canvas =
    document.createElement(
      "canvas"
    );

  const context =
    canvas.getContext("2d");

  if (!context) {
    throw new Error(
      "Nie udało się przygotować kadrowania."
    );
  }

  const rotationRadians =
    (rotation * Math.PI) / 180;

  const rotatedWidth =
    Math.abs(
      Math.cos(rotationRadians) *
        image.width
    ) +
    Math.abs(
      Math.sin(rotationRadians) *
        image.height
    );

  const rotatedHeight =
    Math.abs(
      Math.sin(rotationRadians) *
        image.width
    ) +
    Math.abs(
      Math.cos(rotationRadians) *
        image.height
    );

  canvas.width =
    Math.round(rotatedWidth);

  canvas.height =
    Math.round(rotatedHeight);

  context.translate(
    canvas.width / 2,
    canvas.height / 2
  );

  context.rotate(
    rotationRadians
  );

  context.translate(
    -image.width / 2,
    -image.height / 2
  );

  context.drawImage(
    image,
    0,
    0
  );

  const croppedCanvas =
    document.createElement(
      "canvas"
    );

  const croppedContext =
    croppedCanvas.getContext("2d");

  if (!croppedContext) {
    throw new Error(
      "Nie udało się utworzyć wykadrowanego zdjęcia."
    );
  }

  croppedCanvas.width =
    pixelCrop.width;

  croppedCanvas.height =
    pixelCrop.height;

  croppedContext.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise(
    (resolve, reject) => {
      croppedCanvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                "Nie udało się zapisać zdjęcia."
              )
            );

            return;
          }

          const file = new File(
            [blob],
            `cropped-${Date.now()}.jpg`,
            {
              type: "image/jpeg",
            }
          );

          resolve(file);
        },
        "image/jpeg",
        0.9
      );
    }
  );
}

function ImageCropModal({
  imageUrl,
  onCancel,
  onSave,
  aspect = 16 / 7,
}) {
  const [
    crop,
    setCrop,
  ] = useState({
    x: 0,
    y: 0,
  });

  const [
    zoom,
    setZoom,
  ] = useState(1);

  const [
    rotation,
    setRotation,
  ] = useState(0);

  const [
    croppedAreaPixels,
    setCroppedAreaPixels,
  ] = useState(null);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const onCropComplete =
    useCallback(
      (
        croppedArea,
        croppedPixels
      ) => {
        setCroppedAreaPixels(
          croppedPixels
        );
      },
      []
    );

  async function handleSave() {
    if (!croppedAreaPixels) {
      return;
    }

    setSaving(true);

    try {
      const croppedFile =
        await getCroppedImage(
          imageUrl,
          croppedAreaPixels,
          rotation
        );

      onSave(croppedFile);
    } catch (error) {
      console.error(
        "Błąd kadrowania:",
        error
      );

      window.alert(
        error.message
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Kadrowanie zdjęcia"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 5000,
        display: "grid",
        placeItems: "center",
        padding: "20px",
        background:
          "rgba(15, 24, 21, 0.72)",
      }}
    >
      <div
        style={{
          width:
            "min(920px, 100%)",
          maxHeight:
            "calc(100vh - 40px)",
          overflowY: "auto",
          borderRadius: "22px",
          background: "#ffffff",
          boxShadow:
            "0 24px 70px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div
          style={{
            padding:
              "20px 22px 14px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "26px",
            }}
          >
            ✂️ Kadrowanie zdjęcia
          </h2>

          <p
            style={{
              margin:
                "8px 0 0",
              color: "#5c6c66",
            }}
          >
            Przesuń zdjęcie i ustaw
            odpowiednie przybliżenie.
          </p>
        </div>

        <div
          style={{
            position: "relative",
            height:
              "min(520px, 58vh)",
            background: "#18201d",
          }}
        >
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={
              setRotation
            }
            onCropComplete={
              onCropComplete
            }
            showGrid
          />
        </div>

        <div
          style={{
            display: "grid",
            gap: "18px",
            padding: "20px 22px",
          }}
        >
          <label
            style={{
              display: "grid",
              gap: "8px",
              fontWeight: 700,
            }}
          >
            🔍 Przybliżenie

            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(event) =>
                setZoom(
                  Number(
                    event.target.value
                  )
                )
              }
            />
          </label>

          <label
            style={{
              display: "grid",
              gap: "8px",
              fontWeight: 700,
            }}
          >
            🔄 Obrót

            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={rotation}
              onChange={(event) =>
                setRotation(
                  Number(
                    event.target.value
                  )
                )
              }
            />

            <span
              style={{
                color: "#5c6c66",
                fontSize: "14px",
              }}
            >
              {rotation}°
            </span>
          </label>

          <div
            style={{
              display: "flex",
              justifyContent:
                "flex-end",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              className="backButton"
              onClick={onCancel}
              disabled={saving}
            >
              Anuluj
            </button>

            <button
              type="button"
              className="addPlaceButton"
              style={{
                width: "auto",
              }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving
                ? "Zapisywanie..."
                : "Zapisz kadr"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageCropModal;