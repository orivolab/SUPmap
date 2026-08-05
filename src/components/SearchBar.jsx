import { useMemo } from "react";

function HighlightText({ text, searchText }) {
  const value = String(text ?? "");
  const query = searchText.trim();

  if (!query) {
    return value;
  }

  const index = value
    .toLowerCase()
    .indexOf(query.toLowerCase());

  if (index === -1) {
    return value;
  }

  const before = value.slice(0, index);
  const match = value.slice(
    index,
    index + query.length
  );
  const after = value.slice(
    index + query.length
  );

  return (
    <>
      {before}

      <mark
        style={{
          background: "#d9f2e7",
          borderRadius: "4px",
          padding: "1px 2px",
        }}
      >
        {match}
      </mark>

      {after}
    </>
  );
}

function SearchBar({
  searchText,
  onSearchChange,
  onClear,
  places,
  onSelectPlace,
}) {
  const results = useMemo(() => {
    const query = searchText
      .trim()
      .toLowerCase();

    if (!query) {
      return [];
    }

    return places
      .filter((place) => {
        const values = [
          place.name,
          place.city,
          place.description,
          place.parking,
        ];

        return values.some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query)
        );
      })
      .slice(0, 8);
  }, [places, searchText]);

  function selectResult(place) {
    onSelectPlace(place);
    onClear();
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
      }}
    >
      <form
        className="searchBox"
        onSubmit={(event) => {
          event.preventDefault();

          if (results.length > 0) {
            selectResult(results[0]);
          }
        }}
      >
        <span className="searchIcon">⌕</span>

        <input
          type="search"
          value={searchText}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Wpisz jezioro, miasto lub województwo"
          aria-label="Wyszukaj miejsce na SUP"
          autoComplete="off"
        />

        {searchText ? (
          <button
            type="button"
            onClick={onClear}
          >
            Wyczyść
          </button>
        ) : (
          <button type="submit">
            Szukaj
          </button>
        )}
      </form>

      {searchText.trim() &&
        results.length > 0 && (
          <div
            className="searchResults"
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              right: 0,
              zIndex: 2000,
              background: "white",
              borderRadius: "18px",
              boxShadow:
                "0 14px 40px rgba(0, 0, 0, 0.14)",
              overflow: "hidden",
              textAlign: "left",
            }}
          >
            {results.map((place) => (
              <button
                key={place.id}
                type="button"
                className="searchResult"
                onClick={() =>
                  selectResult(place)
                }
                style={{
                  display: "block",
                  width: "100%",
                  padding: "14px 18px",
                  border: "none",
                  borderBottom:
                    "1px solid #eeeeee",
                  background: "white",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <strong>
                  <HighlightText
                    text={place.name}
                    searchText={searchText}
                  />
                </strong>

                {place.city && (
                  <>
                    <br />

                    <small>
                      📍{" "}
                      <HighlightText
                        text={place.city}
                        searchText={searchText}
                      />
                    </small>
                  </>
                )}
              </button>
            ))}
          </div>
        )}

      {searchText.trim() &&
        results.length === 0 && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              right: 0,
              zIndex: 2000,
              padding: "16px",
              background: "white",
              borderRadius: "18px",
              boxShadow:
                "0 14px 40px rgba(0, 0, 0, 0.14)",
              textAlign: "left",
            }}
          >
            Nie znaleziono takiego miejsca.
          </div>
        )}
    </div>
  );
}

export default SearchBar;