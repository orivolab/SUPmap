import {
  useEffect,
  useMemo,
} from "react";

import L from "leaflet";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import {
  getPlaceMarkerState,
} from "../services/placesService";

function getMarkerColor(place) {
  const markerState =
    getPlaceMarkerState(place);

  switch (markerState) {
    case "recommended":
      return "#2f9e6f";

    case "danger":
      return "#dc3545";

    case "warning":
      return "#f59f00";

    case "stale":
      return "#868e96";

    case "closed":
      return "#495057";

    default:
      return "#2389da";
  }
}

function createMarkerIcon(place) {
  const color = getMarkerColor(place);

  return L.divIcon({
    className: "",
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -42],

    html: `
      <div
        style="
          position: relative;
          width: 34px;
          height: 34px;
          border-radius: 50% 50% 50% 0;
          background: ${color};
          border: 3px solid white;
          box-shadow:
            0 4px 10px rgba(0, 0, 0, 0.28);
          transform: rotate(-45deg);
        "
      >
        <div
          style="
            position: absolute;
            top: 8px;
            left: 8px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: white;
          "
        ></div>
      </div>
    `,
  });
}

function MapAutoFit({
  places,
  defaultCenter,
  defaultZoom,
}) {
  const map = useMap();

  useEffect(() => {
    const validPositions = places
      .map((place) => [
        Number(place.lat),
        Number(place.lng),
      ])
      .filter(
        ([lat, lng]) =>
          Number.isFinite(lat) &&
          Number.isFinite(lng)
      );

    if (validPositions.length === 0) {
      map.setView(
        defaultCenter,
        defaultZoom
      );

      return;
    }

    if (validPositions.length === 1) {
      map.flyTo(
        validPositions[0],
        12,
        {
          duration: 0.8,
        }
      );

      return;
    }

    const bounds =
      L.latLngBounds(validPositions);

    map.flyToBounds(bounds, {
      padding: [55, 55],
      maxZoom: 11,
      duration: 0.8,
    });
  }, [
    map,
    places,
    defaultCenter,
    defaultZoom,
  ]);

  return null;
}

function MarkerLegend() {
  const legendItems = [
    {
      color: "#2f9e6f",
      label: "Polecane",
    },
    {
      color: "#2389da",
      label: "Zwykłe miejsce",
    },
    {
      color: "#f59f00",
      label: "Ostrzeżenie",
    },
    {
      color: "#dc3545",
      label: "Aktualne zagrożenie",
    },
    {
      color: "#868e96",
      label: "Brak świeżych danych",
    },
  ];

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 1000,
        left: "14px",
        bottom: "14px",
        padding: "10px 12px",
        borderRadius: "12px",
        background:
          "rgba(255, 255, 255, 0.94)",
        boxShadow:
          "0 4px 16px rgba(0, 0, 0, 0.16)",
        fontSize: "12px",
        lineHeight: 1.4,
      }}
    >
      {legendItems.map((item) => (
        <div
          key={item.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            marginBottom: "4px",
          }}
        >
          <span
            style={{
              width: "10px",
              height: "10px",
              flexShrink: 0,
              borderRadius: "50%",
              background: item.color,
            }}
          />

          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function PlaceMap({
  places = [],
  onSelectPlace,
  center = [52.1, 19.4],
  zoom = 6,
  height = "500px",
}) {
  const validPlaces = useMemo(
    () =>
      places.filter((place) => {
        const lat = Number(place.lat);
        const lng = Number(place.lng);

        return (
          Number.isFinite(lat) &&
          Number.isFinite(lng)
        );
      }),
    [places]
  );

  const markers = useMemo(
    () =>
      validPlaces.map((place) => ({
        place,
        icon: createMarkerIcon(place),
      })),
    [validPlaces]
  );

  return (
    <div
      style={{
        position: "relative",
      }}
    >
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

        <MapAutoFit
          places={validPlaces}
          defaultCenter={center}
          defaultZoom={zoom}
        />

        {markers.map(
          ({ place, icon }) => (
            <Marker
              key={`place-${place.id}`}
              position={[
                Number(place.lat),
                Number(place.lng),
              ]}
              icon={icon}
            >
              <Popup>
                <div
                  style={{
                    minWidth: "170px",
                  }}
                >
                  <strong
                    style={{
                      fontSize: "15px",
                    }}
                  >
                    {place.name}
                  </strong>

                  {place.city && (
                    <p
                      style={{
                        margin:
                          "4px 0 10px",
                        color: "#5c6c66",
                      }}
                    >
                      {place.city}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      onSelectPlace?.(
                        place
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "none",
                      borderRadius: "9px",
                      background:
                        "#377f6a",
                      color: "white",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Zobacz szczegóły
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        )}
      </MapContainer>

      <MarkerLegend />
    </div>
  );
}

export default PlaceMap;