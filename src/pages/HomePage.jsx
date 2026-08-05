import Header from "../components/Header";
import PlaceMap from "../components/PlaceMap";
import SearchBar from "../components/SearchBar";

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

      <section className="mapPreview">
        <PlaceMap
          places={places}
          onSelectPlace={onSelectPlace}
        />
      </section>
    </main>
  );
}

export default HomePage;