import {
  useMemo,
  useState,
} from "react";

import Header from "../components/Header";
import PlaceMap from "../components/PlaceMap";
import SearchBar from "../components/SearchBar";

const RADIUS_OPTIONS = [
  {
    value: 20,
    label: "Do 20 km",
  },
  {
    value: 50,
    label: "Do 50 km",
  },
  {
    value: 100,
    label: "Do 100 km",
  },
];

function getPlaceScore(place) {
  const score =
    place?.sup_score ??
    place?.statistics?.sup_score ??
    null;

  const number = Number(score);

  return Number.isFinite(number)
    ? Math.round(number)
    : null;
}

function getPlaceImage(place) {
  return (
    place?.image_url ||
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=80"
  );
}

function calculateDistanceKm(
  firstPosition,
  secondPosition
) {
  if (
    !firstPosition ||
    !secondPosition
  ) {
    return null;
  }

  const lat1 = Number(
    firstPosition.lat
  );

  const lng1 = Number(
    firstPosition.lng
  );

  const lat2 = Number(
    secondPosition.lat
  );

  const lng2 = Number(
    secondPosition.lng
  );

  if (
    !Number.isFinite(lat1) ||
    !Number.isFinite(lng1) ||
    !Number.isFinite(lat2) ||
    !Number.isFinite(lng2)
  ) {
    return null;
  }

  const earthRadiusKm = 6371;

  const toRadians = (value) =>
    (value * Math.PI) / 180;

  const latitudeDifference =
    toRadians(lat2 - lat1);

  const longitudeDifference =
    toRadians(lng2 - lng1);

  const a =
    Math.sin(
      latitudeDifference / 2
    ) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(
        longitudeDifference / 2
      ) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadiusKm * c;
}

function formatDistance(distance) {
  if (
    distance === null ||
    distance === undefined
  ) {
    return null;
  }

  if (distance < 1) {
    return `${Math.round(
      distance * 1000
    )} m`;
  }

  return `${distance.toFixed(1)} km`;
}

function openGoogleMaps(place) {
  const lat = Number(place?.lat);
  const lng = Number(place?.lng);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    window.alert(
      "To miejsce nie ma poprawnych współrzędnych."
    );

    return;
  }

  const destination =
    encodeURIComponent(
      `${lat},${lng}`
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
  const lat = Number(place?.lat);
  const lng = Number(place?.lng);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    window.alert(
      "To miejsce nie ma poprawnych współrzędnych."
    );

    return;
  }

  const destination =
    encodeURIComponent(
      `${lat},${lng}`
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

function NavigationButtons({
  place,
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(2, minmax(0, 1fr))",
        gap: "8px",
        marginTop: "9px",
      }}
    >
      <button
        type="button"
        onClick={() =>
          openGoogleMaps(place)
        }
        style={{
          padding: "9px 8px",
          border:
            "1px solid #d8e2de",
          borderRadius: "10px",
          background: "#ffffff",
          color: "#263630",
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
          padding: "9px 8px",
          border:
            "1px solid #d8e2de",
          borderRadius: "10px",
          background: "#ffffff",
          color: "#263630",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
         Mapy
      </button>
    </div>
  );
}

function HomePage({
  user,
  profile,
  isAdmin,
  pendingCount = 0,
  places,
  searchText = "",
  filters,
  activeFilters,
  onSearchChange,
  onClearSearch,
  onToggleFilter,
  onSelectPlace,
  onOpenAdmin,
  onOpenAuth,
  onOpenProfile,
  onAddPlace,
  onGoHome,
}) {
  const safePlaces =
    Array.isArray(places)
      ? places
      : [];

  const safeFilters =
    Array.isArray(filters)
      ? filters
      : [];

  const safeActiveFilters =
    Array.isArray(activeFilters)
      ? activeFilters
      : [];

  const [
    focusedPlaceId,
    setFocusedPlaceId,
  ] = useState(null);

  const [
    userPosition,
    setUserPosition,
  ] = useState(null);

  const [
    selectedRadius,
    setSelectedRadius,
  ] = useState(null);

  const placesWithDistance =
    useMemo(() => {
      return safePlaces
        .map((place) => {
          const distance =
            calculateDistanceKm(
              userPosition,
              {
                lat: place?.lat,
                lng: place?.lng,
              }
            );

          return {
            ...place,
            distanceFromUser:
              distance,
          };
        })
        .filter((place) => {
          if (
            !userPosition ||
            !selectedRadius
          ) {
            return true;
          }

          return (
            place.distanceFromUser !==
              null &&
            place.distanceFromUser <=
              selectedRadius
          );
        })
        .sort((first, second) => {
          if (!userPosition) {
            return 0;
          }

          const firstDistance =
            first.distanceFromUser;

          const secondDistance =
            second.distanceFromUser;

          if (
            firstDistance === null
          ) {
            return 1;
          }

          if (
            secondDistance === null
          ) {
            return -1;
          }

          return (
            firstDistance -
            secondDistance
          );
        });
    }, [
      safePlaces,
      userPosition,
      selectedRadius,
    ]);

  function handleFocusPlace(place) {
    if (!place?.id) {
      return;
    }

    setFocusedPlaceId(place.id);
  }

  function handleUserLocationChange(
    position
  ) {
    setUserPosition(position);

    setSelectedRadius(
      (currentRadius) =>
        currentRadius || 50
    );
  }

  function clearRadiusFilter() {
    setSelectedRadius(null);
  }

  return (
    <main className="app">
      <Header
        user={user}
        profile={profile}
        isAdmin={isAdmin}
        pendingCount={pendingCount}
        onOpenAdmin={onOpenAdmin}
        onOpenAuth={onOpenAuth}
        onOpenProfile={onOpenProfile}
        onAddPlace={onAddPlace}
        onGoHome={onGoHome}
      />

      <section className="hero">
        <div className="heroContent">
          <p className="eyebrow">
            ODKRYWAJ POLSKĘ Z PERSPEKTYWY WODY
          </p>

          <h1>
            Znajdź idealne miejsce na SUP
          </h1>

          <p className="heroDescription">
            Sprawdzaj wejście do wody,
            parking, udogodnienia, warunki
            dla psów i opinie innych osób.
          </p>

          <SearchBar
            searchText={searchText}
            onSearchChange={
              onSearchChange
            }
            onClear={onClearSearch}
            places={placesWithDistance}
            onSelectPlace={
              onSelectPlace
            }
          />

          <div className="filters">
            {safeFilters.map(
              (filter) => {
                const active =
                  safeActiveFilters.includes(
                    filter
                  );

                return (
                  <button
                    type="button"
                    key={filter}
                    className="filterButton"
                    onClick={() =>
                      onToggleFilter?.(
                        filter
                      )
                    }
                    aria-pressed={
                      active
                    }
                    style={{
                      fontWeight: active
                        ? "700"
                        : "400",

                      outline: active
                        ? "2px solid currentColor"
                        : "none",
                    }}
                  >
                    {filter}
                  </button>
                );
              }
            )}
          </div>
        </div>
      </section>

      <section
        style={{
          width:
            "min(1500px, calc(100% - 32px))",
          margin: "34px auto 0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "flex-end",
            gap: "18px",
            flexWrap: "wrap",
            marginBottom: "18px",
          }}
        >
          <div>
            <h2
              style={{
                margin: "0 0 6px",
                fontSize: "27px",
              }}
            >
              🗺️ Miejsca na SUP
            </h2>

            <p
              style={{
                margin: 0,
                color: "#5c6c66",
              }}
            >
              Znaleziono:{" "}
              <strong>
                {
                  placesWithDistance.length
                }
              </strong>
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "9px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {userPosition &&
              RADIUS_OPTIONS.map(
                (option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setSelectedRadius(
                        option.value
                      )
                    }
                    style={{
                      padding:
                        "9px 13px",

                      border:
                        selectedRadius ===
                        option.value
                          ? "2px solid #287b63"
                          : "1px solid #d8e2de",

                      borderRadius:
                        "999px",

                      background:
                        selectedRadius ===
                        option.value
                          ? "#e8f4ef"
                          : "#ffffff",

                      color:
                        "#263630",

                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    📍 {option.label}
                  </button>
                )
              )}

            {userPosition &&
              selectedRadius && (
                <button
                  type="button"
                  className="backButton"
                  onClick={
                    clearRadiusFilter
                  }
                >
                  Wszystkie miejsca
                </button>
              )}

            {searchText && (
              <button
                type="button"
                className="backButton"
                onClick={() =>
                  onClearSearch?.()
                }
              >
                Wyczyść wyszukiwanie
              </button>
            )}
          </div>
        </div>
                {userPosition &&
          selectedRadius && (
            <div
              style={{
                marginBottom: "16px",
                padding: "12px 15px",
                borderRadius: "14px",
                background: "#edf8f3",
                border:
                  "1px solid #b9dece",
              }}
            >
              📍 Pokazujemy miejsca
              maksymalnie{" "}
              <strong>
                {selectedRadius} km
              </strong>{" "}
              od Twojej lokalizacji.
            </div>
          )}

        <div className="homeMapLayout">
          <aside className="placesSidebar">
            <div
              style={{
                display: "grid",
                gap: "14px",
              }}
            >
              {placesWithDistance.map(
                (place) => {
                  const score =
                    getPlaceScore(place);

                  const distance =
                    formatDistance(
                      place.distanceFromUser
                    );

                  return (
                    <article
                      key={place.id}
                      className="placeListCard"
                    >
                      <img
                        src={getPlaceImage(
                          place
                        )}
                        alt={place.name}
                        style={{
                          width: "100%",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius:
                            "15px 15px 0 0",
                        }}
                      />

                      <div
                        style={{
                          padding: "15px",
                        }}
                      >
                        <h3>
                          {place.name}
                        </h3>

                        <p>
                          📍{" "}
                          {place.city ||
                            "Brak miasta"}
                        </p>

                        {distance && (
                          <p>
                            🚗 {distance}
                          </p>
                        )}

                        <p>
                          ⭐{" "}
                          {score ??
                            "Brak"}
                        </p>

                        <button
                          className="addPlaceButton"
                          onClick={() => {
                            handleFocusPlace(
                              place
                            );
                          }}
                        >
                          Pokaż na mapie
                        </button>

                        <button
                          className="addPlaceButton"
                          onClick={() =>
                            onSelectPlace(
                              place
                            )
                          }
                          style={{
                            marginTop:
                              "8px",
                          }}
                        >
                          Zobacz miejsce
                        </button>

                        <NavigationButtons
                          place={place}
                        />
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          </aside>

          <section className="homeMapContainer">
            <PlaceMap
              places={
                placesWithDistance
              }
              focusedPlaceId={
                focusedPlaceId
              }
              onSelectPlace={
                onSelectPlace
              }
              onUserLocationChange={
                handleUserLocationChange
              }
            />
          </section>
        </div>
      </section>
    </main>
  );
}

export default HomePage;