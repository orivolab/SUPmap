import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Cropper from "react-easy-crop";

const DEFAULT_ASPECT_OPTIONS = [
  {
    id: "portrait",
    label: "Pionowe 4:5",
    value: 4 / 5,
  },
  {
    id: "landscape",
    label: "Poziome 4:3",
    value: 4 / 3,
  },
  {
    id: "square",
    label: "Kwadrat 1:1",
    value: 1,
  },
  {
    id: "original",
    label: "Oryginalne",
    value: null,
  },
];

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

function getRotatedDimensions(
  width,
  height,
  rotation
) {
  const radians =
    (rotation * Math.PI) / 180;

  return {
    width: Math.abs(
      Math.cos(radians) * width
    ) +
      Math.abs(
        Math.sin(radians) * height
      ),

    height: Math.abs(
      Math.sin(radians) * width
    ) +
      Math.abs(
        Math.cos(radians) * height
      ),
  };
}

async function getOriginalAspect(
  imageUrl
) {
  const image =
    await createImage(imageUrl);

  if (
    !image.width ||
    !image.height
  ) {
    return 1;
  }

  return image.width / image.height;
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

  const rotatedDimensions =
    getRotatedDimensions(
      image.width,
      image.height,
      rotation
    );

  canvas.width =
    Math.round(
      rotatedDimensions.width
    );

  canvas.height =
    Math.round(
      rotatedDimensions.height
    );

  context.translate(
    canvas.width / 2,
    canvas.height / 2
  );

  context.rotate(
    (rotation * Math.PI) / 180
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
    Math.max(
      1,
      Math.round(pixelCrop.width)
    );

  croppedCanvas.height =
    Math.max(
      1,
      Math.round(pixelCrop.height)
    );

  croppedContext.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    croppedCanvas.width,
    croppedCanvas.height
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

  allowAspectSelection = false,

  aspectOptions =
    DEFAULT_ASPECT_OPTIONS,

  initialAspectId = null,

  cropShape = "rect",
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

  const [
    originalAspect,
    setOriginalAspect,
  ] = useState(null);

  const defaultSelectedId =
    useMemo(() => {
      if (initialAspectId) {
        return initialAspectId;
      }

      const matchingOption =
        aspectOptions.find(
          (option) =>
            option.value === aspect
        );

      return (
        matchingOption?.id ||
        aspectOptions[0]?.id ||
        "fixed"
      );
    }, [
      initialAspectId,
      aspectOptions,
      aspect,
    ]);

  const [
    selectedAspectId,
    setSelectedAspectId,
  ] = useState(
    defaultSelectedId
  );

  useEffect(() => {
    let cancelled = false;

    async function loadOriginalAspect() {
      try {
        const value =
          await getOriginalAspect(
            imageUrl
          );

        if (!cancelled) {
          setOriginalAspect(value);
        }
      } catch (error) {
        console.error(
          "Nie udało się odczytać proporcji zdjęcia:",
          error
        );

        if (!cancelled) {
          setOriginalAspect(1);
        }
      }
    }

    loadOriginalAspect();

    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  const selectedAspect =
    useMemo(() => {
      if (!allowAspectSelection) {
        return aspect;
      }

      const option =
        aspectOptions.find(
          (item) =>
            item.id ===
            selectedAspectId
        );

      if (!option) {
        return aspect;
      }

      if (option.value === null) {
        return (
          originalAspect ||
          aspect ||
          1
        );
      }

      return option.value;
    }, [
      allowAspectSelection,
      aspectOptions,
      selectedAspectId,
      originalAspect,
      aspect,
    ]);

 const onCropComplete = useCallback(
  (croppedArea, croppedPixels) => {
    console.log("Crop complete");
    console.log(croppedPixels);

    setCroppedAreaPixels(croppedPixels);
  },
  []
);

  function handleAspectChange(
    aspectId
  ) {
    setSelectedAspectId(
      aspectId
    );

    setCrop({
      x: 0,
      y: 0,
    });

    setZoom(1);

    setCroppedAreaPixels(null);
  }

  async function handleSave() {
  if (!croppedAreaPixels) {
    window.alert(
      "Kadr nie jest jeszcze gotowy. Porusz lekko zdjęciem i spróbuj ponownie."
    );
    return;
  }

  setSaving(true);

  try {
    const croppedFile = await getCroppedImage(
      imageUrl,
      croppedAreaPixels,
      rotation
    );

    if (
      !croppedFile ||
      croppedFile.size === 0
    ) {
      throw new Error(
        "Wykadrowany plik jest pusty."
      );
    }

    await onSave(croppedFile, {
      aspect: selectedAspect,
      aspectId: selectedAspectId,
      rotation,
    });
  } catch (error) {
    console.error(
      "Błąd zapisywania kadru:",
      error
    );

    window.alert(
      `Nie udało się zapisać kadru: ${
        error?.message ||
        "Nieznany błąd"
      }`
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
            Przesuń zdjęcie, ustaw
            przybliżenie i wybierz
            odpowiedni układ.
          </p>
        </div>

        {allowAspectSelection && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              padding:
                "0 22px 16px",
            }}
          >
            {aspectOptions.map(
              (option) => {
                const active =
                  selectedAspectId ===
                  option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      handleAspectChange(
                        option.id
                      )
                    }
                    style={{
                      padding:
                        "9px 13px",
                      border: active
                        ? "2px solid #287b63"
                        : "1px solid #d8e2de",
                      borderRadius:
                        "999px",
                      background: active
                        ? "#e8f4ef"
                        : "#ffffff",
                      color:
                        "#263630",
                      fontWeight: 700,
                      cursor:
                        "pointer",
                    }}
                  >
                    {option.label}
                  </button>
                );
              }
            )}
          </div>
        )}

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
            aspect={
              selectedAspect ||
              1
            }
            cropShape={
              cropShape
            }
            onCropChange={
              setCrop
            }
            onZoomChange={
              setZoom
            }
            onRotationChange={
              setRotation
            }
            onCropComplete={
              onCropComplete
            }
            showGrid={
              cropShape !==
              "round"
            }
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