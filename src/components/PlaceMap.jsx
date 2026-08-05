import {
  useEffect,
  useMemo,
  useRef,
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
  const state =
    getPlaceMarkerState(place);

  switch (state) {
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
  const color =
    getMarkerColor(place);

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
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.28);
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
  focusedPlaceId,
  markerRefs,
  defaultCenter,
  defaultZoom,
}) {
  const map = useMap();

  useEffect(() => {
    if (!focusedPlaceId) {
      return;
    }

    const focusedPlace =
      places.find(
        (place) =>
          String(place.id) ===
          String(focusedPlaceId)
      );

    if (!focusedPlace) {
      return;
    }

    const lat =
      Number(focusedPlace.lat);

    const lng =
      Number(focusedPlace.lng);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      return;
    }

    map.flyTo(
      [lat, lng],
      14,
      {
        duration: 0.9,
      }
    );

    window.setTimeout(() => {
      markerRefs.current[
        focusedPlace.id
      ]?.openPopup();
    }, 950);
  }, [
    map,
    places,
    focusedPlaceId,
    markerRefs,
  ]);

  useEffect(() => {
    if (focusedPlaceId) {
      return;
    }

    const positions = places
      .map((place) => [
        Number(place.lat),
        Number(place.lng),
      ])
      .filter(
        ([lat, lng]) =>
          Number.isFinite(lat) &&
          Number.isFinite(lng)
      );

    if (positions.length === 0) {
      map.setView(
        defaultCenter,
        defaultZoom
      );

      return;
    }

    if (positions.length === 1) {
      map.flyTo(
        positions[0],
        12,
        {
          duration: 0.7,
        }
      );

      return;
    }

    map.flyToBounds(
      L.latLngBounds(positions),
      {
        padding: [55, 55],
        maxZoom: 11,
        duration: 0.7,
      }
    );
  }, [
    map,
    places,
    focusedPlaceId,
    defaultCenter,
    defaultZoom,
  ]);

  return null;
}

function MarkerLegend() {
  const items = [
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
      label: "Zagrożenie",
    },
    {
      color: "#868e96",
      label: "Brak świeżych danych",
    },
  ];

  return (
    <div className="markerLegend">
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
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
  focusedPlaceId = null,
  onSelectPlace,
  center = [52.1, 19.4],
  zoom = 6,
  height = "700px",
}) {
  const markerRefs =
    useRef({});

  const validPlaces = useMemo(
    () =>
      places.filter((place) => {
        const lat =
          Number(place.lat);

        const lng =
          Number(place.lng);

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
          focusedPlaceId={
            focusedPlaceId
          }
          markerRefs={markerRefs}
          defaultCenter={center}
          defaultZoom={zoom}
        />

        {markers.map(
          ({ place, icon }) => (
            <Marker
              key={`place-${place.id}`}
              ref={(marker) => {
                if (marker) {
                  markerRefs.current[
                    place.id
                  ] = marker;
                } else {
                  delete markerRefs.current[
                    place.id
                  ];
                }
              }}
              position={[
                Number(place.lat),
                Number(place.lng),
              ]}
              icon={icon}
            >
              <Popup>
                <div
                  style={{
                    width: "210px",
                  }}
                >
                  {place.image_url && (
                    <img
                      src={place.image_url}
                      alt={place.name}
                      style={{
                        width: "100%",
                        height: "110px",
                        display: "block",
                        objectFit: "cover",
                        borderRadius: "10px",
                        marginBottom: "10px",
                      }}
                    />
                  )}

                  <strong
                    style={{
                      fontSize: "16px",
                    }}
                  >
                    {place.name}
                  </strong>

                  {place.city && (
                    <p
                      style={{
                        margin: "5px 0 10px",
                        color: "#5c6c66",
                      }}
                    >
                      📍 {place.city}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      onSelectPlace?.(place)
                    }
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "none",
                      borderRadius: "9px",
                      background: "#377f6a",
                      color: "#ffffff",
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