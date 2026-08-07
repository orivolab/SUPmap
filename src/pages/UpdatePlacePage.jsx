import {
  useMemo,
  useState,
} from "react";

import {
  submitPlaceUpdateRequest,
} from "../services/placeUpdatesService";

const UPDATE_CATEGORIES = [
  {
    value: "basic",
    label: "📍 Nazwa, miejscowość lub opis",
  },
  {
    value: "parking",
    label: "🚗 Parking",
  },
  {
    value: "dogs",
    label: "🐶 Psy",
  },
  {
    value: "toilets",
    label: "🚻 Toalety",
  },
  {
    value: "showers",
    label: "🚿 Prysznice",
  },
  {
    value: "changing_rooms",
    label: "👕 Przebieralnie",
  },
  {
    value: "gastronomy",
    label: "🍔 Gastronomia",
  },
  {
    value: "rental",
    label: "🏄 Wypożyczalnia",
  },
  {
    value: "lifeguard",
    label: "🛟 Ratownik",
  },
  {
    value: "camping",
    label: "⛺ Camping",
  },
  {
    value: "accommodation",
    label: "🏠 Noclegi",
  },
  {
    value: "access",
    label: "🛣️ Dojazd i dostępność",
  },
  {
    value: "water",
    label: "🌊 Woda i brzeg",
  },
  {
    value: "children",
    label: "👶 Dzieci",
  },
  {
    value: "beginners",
    label: "🏄 Początkujący",
  },
  {
    value: "water_traffic",
    label: "🚤 Ruch wodny i przeszkody",
  },
  {
    value: "important",
    label: "📌 Ważne informacje",
  },
  {
    value: "other",
    label: "➕ Inne",
  },
];

function formatValues(values) {
  return values
    .filter(
      (value) =>
        value !== null &&
        value !== undefined &&
        value !== ""
    )
    .map((value) => {
      if (Array.isArray(value)) {
        return value.join(", ");
      }

      if (value === true) {
        return "Tak";
      }

      if (value === false) {
        return "Nie";
      }

      return String(value);
    })
    .filter(Boolean)
    .join("\n");
}

function getCurrentCategoryValue(
  place,
  category
) {
  if (!place) {
    return "Brak informacji";
  }

  const categoryValues = {
    basic: [
      place.name,
      place.city,
      place.description,
    ],

    parking: [
      place.parking_available,
      place.parking_type,
      place.parking_price,
      place.parking_distance,
      place.parking_description,
      place.parking_restrictions,
    ],

    dogs: [
      place.dogs_allowed,
      place.dogs_description,
    ],

    toilets: [
      place.toilets_available,
      place.toilets_paid,
      place.toilets_price,
      place.toilets_opening_hours,
      place.toilets_description,
    ],

    showers: [
      place.showers_available,
      place.showers_paid,
      place.showers_price,
      place.showers_opening_hours,
      place.showers_description,
    ],

    changing_rooms: [
      place.changing_rooms_available,
      place.changing_rooms_paid,
      place.changing_rooms_price,
      place.changing_rooms_opening_hours,
      place.changing_rooms_description,
    ],

    gastronomy: [
      place.gastronomy_available,
      place.gastronomy_types,
      place.gastronomy_opening_hours,
      place.gastronomy_description,
    ],

    rental: [
      place.rental_available,
      place.rental_equipment,
      place.rental_other,
      place.rental_prices,
      place.rental_opening_hours,
      place.rental_contact,
      place.rental_description,
    ],

    lifeguard: [
      place.lifeguard_available,
      place.lifeguard_description,
    ],

    camping: [
      place.campsite_status,
      place.campsite_price,
      place.campsite_distance,
      place.campsite_description,
      place.campsite_contact,
    ],

    accommodation: [
      place.accommodation_status,
      place.accommodation_link,
      place.accommodation_description,
    ],

    access: [
  place.public_transport,
  place.public_transport_distance,
  place.stroller_access,
  place.access_road_type,
  place.sup_carry_distance,
],

    water: [
      place.shore_depth,
      place.bottom_types,
      place.beach_types,
      place.water_entry_type,
      place.water_entry_description,
    ],

    children: [
      place.children_rating,
      place.children_features,
      place.children_description,
    ],

    beginners: [
      place.beginner_rating,
      place.beginner_reasons,
      place.beginner_description,
    ],

    water_traffic: [
      place.water_traffic,
      place.water_traffic_description,
    ],

    important: [
      place.important_info,
    ],

    other: [],
  };

  const result = formatValues(
    categoryValues[category] ?? []
  );

  return result || "Brak informacji";
}

function UpdatePlacePage({
  place,
  user,
  onBack,
  onSuccess,
}) {
  const [
    category,
    setCategory,
  ] = useState("");

  const [
    proposedValue,
    setProposedValue,
  ] = useState("");

  const [
    sourceUrl,
    setSourceUrl,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const currentValue = useMemo(
    () =>
      getCurrentCategoryValue(
        place,
        category
      ),
    [place, category]
  );

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    if (!user) {
      setMessage(
        "Musisz się zalogować."
      );
      return;
    }

    if (!category) {
      setMessage(
        "Wybierz kategorię zmian."
      );
      return;
    }

    if (
      proposedValue.trim().length < 5
    ) {
      setMessage(
        "Opisz proponowaną zmianę dokładniej."
      );
      return;
    }

    setSubmitting(true);
    setMessage(
      "Wysyłanie propozycji..."
    );

    try {
      await submitPlaceUpdateRequest({
        placeId: place.id,
        category,
        currentValue,
        proposedValue,
        sourceUrl,
      });

      setMessage(
        "Dziękujemy! Propozycja została wysłana i czeka na zatwierdzenie przez administratora."
      );

      setCategory("");
      setProposedValue("");
      setSourceUrl("");

      onSuccess?.();
    } catch (error) {
      console.error(
        "Błąd wysyłania aktualizacji:",
        error
      );

      setMessage(
        `Błąd: ${error.message}`
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="placeDetails">
      <button
        type="button"
        className="backButton"
        onClick={onBack}
      >
        ← Wróć do miejsca
      </button>

      <section
        className="adminCard"
        style={{
          marginTop: "24px",
          padding: "28px",
        }}
      >
      <h1
  style={{
    margin: "0 0 24px",
    textAlign: "center",
    whiteSpace: "nowrap",
    fontSize: "clamp(28px, 4vw, 46px)",
    lineHeight: 1.15,
  }}
>
  ✏️ Zaproponuj aktualizację
</h1>

        <p>
          Aktualizujesz miejsce:{" "}
          <strong>
            {place.name}
          </strong>
        </p>

        <p
          style={{
            color: "#5c6c66",
            lineHeight: 1.6,
          }}
        >
          Wybierz kategorię i wpisz
          aktualne informacje. Zgłoszenie
          zostanie sprawdzone przed
          opublikowaniem.
        </p>

        <form
          className="addPlaceForm"
          onSubmit={handleSubmit}
          style={{
            marginTop: "26px",
          }}
        >
          <label>
            Co chcesz zmienić?

            <select
              value={category}
              onChange={(event) => {
                setCategory(
                  event.target.value
                );

                setMessage("");
              }}
              required
            >
              <option value="">
                Wybierz kategorię
              </option>

              {UPDATE_CATEGORIES.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>
          </label>

          {category && (
            <section
              style={{
                padding: "18px",
                borderRadius: "15px",
                background: "#f4f7f6",
              }}
            >
              <strong>
                Obecne informacje:
              </strong>

              <p
                className="preserveTextFormatting"
                style={{
                  marginBottom: 0,
                  lineHeight: 1.6,
                }}
              >
                {currentValue}
              </p>
            </section>
          )}

          <label>
            Nowe lub poprawione informacje

            <textarea
              value={proposedValue}
              onChange={(event) =>
                setProposedValue(
                  event.target.value
                )
              }
              rows="8"
              minLength="5"
              maxLength="5000"
              placeholder="Wpisz dokładnie, co należy zmienić. Możesz używać Entera i zapisać każdą informację w osobnej linii."
              required
            />
          </label>

          <label>
            Źródło informacji — opcjonalnie

            <input
              type="url"
              value={sourceUrl}
              onChange={(event) =>
                setSourceUrl(
                  event.target.value
                )
              }
              placeholder="Link do strony zarządcy, cennika lub oficjalnego komunikatu"
            />
          </label>

          <button
            type="submit"
            className="addPlaceButton"
            disabled={submitting}
          >
            {submitting
              ? "Wysyłanie..."
              : "Wyślij propozycję"}
          </button>

          {message && (
            <p className="formMessage">
              {message}
            </p>
          )}
        </form>
      </section>
    </div>
  );
}

export default UpdatePlacePage;