import NavigationButtons from "./NavigationButtons";

function getPlaceRating(place) {
  const rating =
    place?.average_rating;

  if (
    rating === null ||
    rating === undefined ||
    rating === ""
  ) {
    return null;
  }

  const number =
    Number(rating);

  return Number.isFinite(number)
    ? number
        .toFixed(1)
        .replace(".", ",")
    : null;
}

function getPlaceImage(place) {
  return (
    place?.image_url ||
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=80"
  );
}

function PlaceCard({
  place,
  focused,
  distanceLabel,
  onFocus,
  onOpen,
}) {
  const rating =
    getPlaceRating(place);

  const reviewsCount =
    Number(
      place.reviews_count ?? 0
    );

  function handleOpen() {
    onOpen(place);
  }

  function handleKeyDown(event) {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      onOpen(place);
    }
  }

  return (
    <article
      className="placeListCard"
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      onMouseEnter={() =>
        onFocus?.(place)
      }
      style={{
        border: focused
          ? "2px solid #287b63"
          : "1px solid #d8e2de",

        background: focused
          ? "#edf8f3"
          : "#ffffff",

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
              📍 {place.city}
            </p>

            {distanceLabel && (
              <p
                style={{
                  margin:
                    "6px 0 0",
                  color:
                    "#287b63",
                  fontSize:
                    "14px",
                  fontWeight:
                    800,
                }}
              >
                🚗 {distanceLabel}
              </p>
            )}
          </div>

          <span
            title={
              reviewsCount > 0
                ? `${reviewsCount} opinii`
                : "Brak opinii"
            }
            style={{
              flexShrink: 0,
              padding: "6px 9px",
              borderRadius:
                "10px",
              background:
                "#f4f7f6",
              fontSize: "13px",
              fontWeight: 800,
            }}
          >
            {rating
              ? `${rating} ⭐`
              : "Brak opinii"}
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
          Kliknij, aby zobaczyć szczegóły
        </p>
      </div>

      <div
        style={{
          padding: "0 15px 15px",
        }}
        onClick={(event) =>
          event.stopPropagation()
        }
        onKeyDown={(event) =>
          event.stopPropagation()
        }
      >
        <button
          type="button"
          className="addPlaceButton"
          style={{
            width: "100%",
          }}
          onClick={() =>
            onOpen(place)
          }
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

export default PlaceCard;