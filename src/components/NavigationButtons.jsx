import AppleIcon from "./AppleIcon";

function getCoordinates(place) {
  const lat = Number(place?.lat);
  const lng = Number(place?.lng);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    window.alert(
      "To miejsce nie ma poprawnych współrzędnych."
    );

    return null;
  }

  return {
    lat,
    lng,
  };
}

function openGoogleMaps(place) {
  const coordinates =
    getCoordinates(place);

  if (!coordinates) {
    return;
  }

  const destination =
    encodeURIComponent(
      `${coordinates.lat},${coordinates.lng}`
    );

  const url =
    `https://www.google.com/maps/dir/?api=1` +
    `&destination=${destination}` +
    `&travelmode=driving`;

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
}

function openAppleMaps(place) {
  const coordinates =
    getCoordinates(place);

  if (!coordinates) {
    return;
  }

  const destination =
    encodeURIComponent(
      `${coordinates.lat},${coordinates.lng}`
    );

  const label =
    encodeURIComponent(
      place?.name || "Miejsce SUP"
    );

  const url =
    `https://maps.apple.com/?daddr=${destination}` +
    `&q=${label}&dirflg=d`;

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
}

async function copyCoordinates(place) {
  const coordinates =
    getCoordinates(place);

  if (!coordinates) {
    return;
  }

  const text =
    `${coordinates.lat}, ${coordinates.lng}`;

  try {
    await navigator.clipboard.writeText(
      text
    );

    window.alert(
      "Współrzędne zostały skopiowane. Możesz wkleić je w Yanosiku."
    );
  } catch (error) {
    console.error(
      "Błąd kopiowania współrzędnych:",
      error
    );

    window.prompt(
      "Skopiuj współrzędne:",
      text
    );
  }
}

function NavigationButtons({
  place,
  compact = false,
}) {
  return (
    <div
      style={{
        display: "grid",
        gap: "8px",
        marginTop: compact
          ? "8px"
          : "10px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
          gap: "8px",
        }}
      >
        <button
          type="button"
          onClick={() =>
            openGoogleMaps(place)
          }
          style={{
            padding: compact
              ? "8px 7px"
              : "9px 8px",
            border:
              "1px solid #d8e2de",
            borderRadius: "10px",
            background: "#ffffff",
            color: "#263630",
            fontSize: compact
              ? "12px"
              : "14px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          🗺️ Google
        </button>

        <button
          type="button"
          onClick={() =>
            openAppleMaps(place)
          }
          style={{
            padding: compact
              ? "8px 7px"
              : "9px 8px",
            border:
              "1px solid #d8e2de",
            borderRadius: "10px",
            background: "#ffffff",
            color: "#263630",
            fontSize: compact
              ? "12px"
              : "14px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <AppleIcon
              size={compact ? 14 : 16}
            />
            Mapy
          </span>
        </button>
      </div>

      <button
        type="button"
        onClick={() =>
          copyCoordinates(place)
        }
        style={{
          width: "100%",
          padding: compact
            ? "8px 7px"
            : "9px 8px",
          border:
            "1px solid #d8e2de",
          borderRadius: "10px",
          background: "#ffffff",
          color: "#263630",
          fontSize: compact
            ? "12px"
            : "14px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        📋 Skopiuj do Yanosika
      </button>
    </div>
  );
}

export default NavigationButtons;