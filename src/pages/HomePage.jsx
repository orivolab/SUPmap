import { useState } from "react";

import Header from "../components/Header";
import PlaceMap from "../components/PlaceMap";
import SearchBar from "../components/SearchBar";

function getPlaceScore(place) {
  const score =
    place.sup_score ??
    place.statistics?.sup_score ??
    null;

  const number = Number(score);

  return Number.isFinite(number)
    ? Math.round(number)
    : null;
}

function getPlaceImage(place) {
  return (
    place.image_url ||
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=80"
  );
}

function HomePage({
  user,
  profile,
  isAdmin,
  pendingCount,
  places,
  searchText,
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
  const [
    focusedPlaceId,
    setFocusedPlaceId,
  ] = useState(null);

  function handleFocusPlace(place) {
    if (!place?.id) {
      return;
    }

    setFocusedPlaceId(place.id);
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
            Sprawdzaj wejście do wody, parking,
            udogodnienia, warunki dla psów i opinie
            innych osób.
          </p>

          <SearchBar
            searchText={searchText}
            onSearchChange={onSearchChange}
            onClear={onClearSearch}
            places={places}
            onSelectPlace={onSelectPlace}
          />

          <div className="filters">
            {filters.map((filter) => {
              const active =
                activeFilters.includes(filter);

              return (
                <button
                  type="button"
                  key={filter}
                  className="filterButton"
                  onClick={() =>
                    onToggleFilter(filter)
                  }
                  aria-pressed={active}
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
            })}
          </div>
        </div>
      </section>

      <section
        style={{
          width: "min(1500px, calc(100% - 32px))",
          margin: "34px auto 0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
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
              <strong>{places.length}</strong>
            </p>
          </div>

          {searchText && (
            <button
              type="button"
              className="backButton"
              onClick={onClearSearch}
            >
              Wyczyść wyszukiwanie
            </button>
          )}
        </div>

        <div className="homeMapLayout">
          <aside className="placesSidebar">
            {places.length === 0 ? (
              <div
                className="emptyPhotos"
                style={{
                  minHeight: "250px",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <div>
                  <p>
                    Nie znaleziono miejsc pasujących
                    do wyszukiwania lub filtrów.
                  </p>

                  <button
                    type="button"
                    className="backButton"
                    onClick={onClearSearch}
                  >
                    Wyczyść wyszukiwanie
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "14px",
                }}
              >
                {places.map((place) => {
                  const score =
                    getPlaceScore(place);

                  const focused =
                    focusedPlaceId === place.id;

                  return (
                    <article
                      key={place.id}
                      className="placeListCard"
                      style={{
                        border: focused
                          ? "2px solid #287b63"
                          : "1px solid #d8e2de",

                        background: focused
                          ? "#edf8f3"
                          : "#ffffff",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleFocusPlace(place)
                        }
                        style={{
                          width: "100%",
                          padding: 0,
                          border: "none",
                          background: "transparent",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        <img
                          src={getPlaceImage(place)}
                          alt={place.name}
                          style={{
                            width: "100%",
                            height: "150px",
                            display: "block",
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
                          <div
                            style={{
                              display: "flex",
                              justifyContent:
                                "space-between",
                              alignItems:
                                "flex-start",
                              gap: "12px",
                            }}
                          >
                            <div>
                              <h3
                                style={{
                                  margin: "0 0 5px",
                                  fontSize: "18px",
                                }}
                              >
                                {place.name}
                              </h3>

                              <p
                                style={{
                                  margin: 0,
                                  color: "#5c6c66",
                                  fontSize: "14px",
                                }}
                              >
                                📍{" "}
                                {place.city ||
                                  "Brak miejscowości"}
                              </p>
                            </div>

                            <span
                              style={{
                                flexShrink: 0,
                                padding: "6px 9px",
                                borderRadius: "10px",
                                background:
                                  "#f4f7f6",
                                fontSize: "13px",
                                fontWeight: 800,
                              }}
                            >
                              ⭐{" "}
                              {score === null
                                ? "—"
                                : score}
                            </span>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: "7px",
                              flexWrap: "wrap",
                              marginTop: "13px",
                            }}
                          >
                            {place.parking_available ===
                              "Tak" && (
                              <span className="placeMiniTag">
                                🅿️ Parking
                              </span>
                            )}

                            {[
                              "Tak",
                              "Częściowo",
                            ].includes(
                              place.dogs_allowed
                            ) && (
                              <span className="placeMiniTag">
                                🐶 Psy
                              </span>
                            )}

                            {place.toilets_available ===
                              "Tak" && (
                              <span className="placeMiniTag">
                                🚻 Toaleta
                              </span>
                            )}

                            {[
                              "Tak",
                              "Sezonowo",
                            ].includes(
                              place.gastronomy_available
                            ) && (
                              <span className="placeMiniTag">
                                🍔 Jedzenie
                              </span>
                            )}
                          </div>

                          <p
                            style={{
                              margin: "13px 0 0",
                              color: "#287b63",
                              fontSize: "13px",
                              fontWeight: 800,
                            }}
                          >
                            Kliknij, aby pokazać na mapie
                          </p>
                        </div>
                      </button>

                      <div
                        style={{
                          padding: "0 15px 15px",
                        }}
                      >
                        <button
                          type="button"
                          className="addPlaceButton"
                          style={{
                            width: "100%",
                          }}
                          onClick={() =>
                            onSelectPlace(place)
                          }
                        >
                          Zobacz miejsce
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </aside>

          <section className="homeMapContainer">
            <PlaceMap
              places={places}
              focusedPlaceId={focusedPlaceId}
              onSelectPlace={onSelectPlace}
            />
          </section>
        </div>
      </section>
    </main>
  );
}

export default HomePage;