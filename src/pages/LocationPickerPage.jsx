import {
  useState,
} from "react";

import {
  MapContainer,
  TileLayer,
  useMap,
} from "react-leaflet";

import LocationPicker from "../components/LocationPicker";

function MapSearchController({
  target,
}) {
  const map = useMap();

  if (target) {
    map.setView(
      [
        Number(target.lat),
        Number(target.lng),
      ],
      15
    );
  }

  return null;
}

function LocationPickerPage({
  position,
  onSelect,
  onBack,
  onConfirm,
  title = "Wybierz lokalizację",
}) {
  const [
    searchText,
    setSearchText,
  ] = useState("");

  const [
    searchResults,
    setSearchResults,
  ] = useState([]);

  const [
    searchTarget,
    setSearchTarget,
  ] = useState(null);

  const [
    isSearching,
    setIsSearching,
  ] = useState(false);

  const [
    searchMessage,
    setSearchMessage,
  ] = useState("");

  const center = position
    ? [
        Number(position.lat),
        Number(position.lng),
      ]
    : [52.1, 19.4];

  async function handleSearch(
    event
  ) {
    event?.preventDefault();

    const query =
      searchText.trim();

    if (query.length < 2) {
      setSearchMessage(
        "Wpisz nazwę miejsca, jeziora, miejscowości lub adres."
      );

      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchMessage("");

    try {
      const params =
        new URLSearchParams({
          q: query,
          format: "jsonv2",
          addressdetails: "1",
          limit: "6",
          countrycodes:
            "pl,cz,de,sk,at,hr,it,si,hu,lt,lv,ee,fi,se,no,dk,nl,be,fr,es,pt",
        });

      const response =
        await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
          {
            headers: {
              Accept:
                "application/json",
            },
          }
        );

      if (!response.ok) {
        throw new Error(
          "Nie udało się wyszukać miejsca."
        );
      }

      const results =
        await response.json();

      setSearchResults(
        results ?? []
      );

      if (
        !results ||
        results.length === 0
      ) {
        setSearchMessage(
          "Nie znaleziono pasującego miejsca."
        );
      }
    } catch (error) {
      console.error(
        "Błąd wyszukiwania lokalizacji:",
        error
      );

      setSearchResults([]);

      setSearchMessage(
        "Nie udało się wyszukać miejsca. Spróbuj ponownie."
      );
    } finally {
      setIsSearching(false);
    }
  }

  function handleSelectSearchResult(
    result
  ) {
    const newPosition = {
      lat: Number(result.lat),
      lng: Number(result.lon),
    };

    setSearchTarget(
      newPosition
    );

    onSelect(
      newPosition
    );

    setSearchResults([]);
    setSearchMessage("");

    setSearchText(
      result.display_name
    );
  }

  return (
    <div className="locationPickerPage">
      <div className="locationPickerHeader">
        <button
          type="button"
          className="backButton"
          onClick={onBack}
        >
          ← Wróć do formularza
        </button>

        <div>
          <h1>{title}</h1>

          <p>
            Wyszukaj miejsce lub adres,
            a następnie ustaw dokładną
            pinezkę zejścia do wody.
          </p>
        </div>
      </div>

      <section
        style={{
          marginBottom: "18px",
          position: "relative",
          zIndex: 1000,
        }}
      >
        <form
          onSubmit={handleSearch}
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="search"
            value={searchText}
            onChange={(event) => {
              setSearchText(
                event.target.value
              );

              setSearchMessage("");
            }}
            placeholder="Np. Jezioro Dominickie, Boszkowo lub konkretny adres"
            style={{
              flex: "1 1 320px",
              minWidth: 0,
              padding: "14px 16px",
              border:
                "1px solid #d8e2de",
              borderRadius: "14px",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            className="addPlaceButton"
            disabled={
              isSearching ||
              searchText.trim().length <
                2
            }
            style={{
              width: "auto",
              margin: 0,
            }}
          >
            {isSearching
              ? "Szukam..."
              : "🔎 Szukaj"}
          </button>
        </form>

        {searchMessage && (
          <p
            style={{
              margin:
                "10px 0 0",
              color: "#5c6c66",
            }}
          >
            {searchMessage}
          </p>
        )}

        {searchResults.length >
          0 && (
          <div
            style={{
              marginTop: "8px",
              border:
                "1px solid #d8e2de",
              borderRadius: "14px",
              overflow: "hidden",
              background:
                "#ffffff",
              boxShadow:
                "0 8px 24px rgba(0,0,0,0.08)",
            }}
          >
            {searchResults.map(
              (result) => (
                <button
                  key={
                    result.place_id
                  }
                  type="button"
                  onClick={() =>
                    handleSelectSearchResult(
                      result
                    )
                  }
                  style={{
                    display: "block",
                    width: "100%",
                    padding:
                      "13px 15px",
                    border: "none",
                    borderBottom:
                      "1px solid #edf1ef",
                    background:
                      "#ffffff",
                    textAlign:
                      "left",
                    cursor:
                      "pointer",
                    fontSize:
                      "15px",
                    lineHeight:
                      1.45,
                  }}
                >
                  📍{" "}
                  {
                    result.display_name
                  }
                </button>
              )
            )}
          </div>
        )}
      </section>

      <MapContainer
        center={center}
        zoom={position ? 15 : 6}
        style={{
          height: "65vh",
          width: "100%",
          borderRadius: "20px",
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapSearchController
          target={
            searchTarget
          }
        />

        <LocationPicker
          position={position}
          onSelect={onSelect}
        />
      </MapContainer>

      <div className="locationPickerFooter">
        {position ? (
          <p>
            Wybrano:{" "}
            {Number(
              position.lat
            ).toFixed(6)}
            ,{" "}
            {Number(
              position.lng
            ).toFixed(6)}
          </p>
        ) : (
          <p>
            Nie wybrano jeszcze miejsca.
          </p>
        )}

        <button
          type="button"
          className="addPlaceButton"
          disabled={!position}
          onClick={onConfirm}
        >
          Zatwierdź lokalizację
        </button>
      </div>
    </div>
  );
}

export default LocationPickerPage;