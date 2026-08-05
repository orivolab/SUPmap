function ValueCard({
  icon,
  label,
  value,
  description,
}) {
  const hasValue =
    value !== null &&
    value !== undefined &&
    value !== "" &&
    value !== "Brak informacji";

  return (
    <article
      className="infoCard"
      style={{
        minHeight: "125px",
        display: "grid",
        alignContent: "center",
        gap: "7px",
        opacity: hasValue ? 1 : 0.65,
      }}
    >
      <span
        style={{
          fontSize: "27px",
        }}
      >
        {icon}
      </span>

      <h3
        style={{
          margin: 0,
          fontSize: "16px",
        }}
      >
        {label}
      </h3>

      <strong
        style={{
          fontSize: "16px",
          lineHeight: 1.45,
        }}
      >
        {hasValue
          ? value
          : "Brak informacji"}
      </strong>

      {description && (
        <small
          style={{
            color: "#5c6c66",
            lineHeight: 1.45,
          }}
        >
          {description}
        </small>
      )}
    </article>
  );
}

function BooleanCard({
  icon,
  label,
  value,
  description,
}) {
  const known =
    value === true || value === false;

  return (
    <article
      className="infoCard"
      style={{
        minHeight: "125px",
        display: "grid",
        alignContent: "center",
        gap: "7px",
        opacity:
          known && value === false
            ? 0.65
            : 1,
      }}
    >
      <span
        style={{
          fontSize: "27px",
        }}
      >
        {icon}
      </span>

      <h3
        style={{
          margin: 0,
          fontSize: "16px",
        }}
      >
        {label}
      </h3>

      <strong
        style={{
          fontSize: "16px",
        }}
      >
        {!known
          ? "Brak informacji"
          : value
            ? "Tak"
            : "Nie"}
      </strong>

      {description && (
        <small
          style={{
            color: "#5c6c66",
            lineHeight: 1.45,
          }}
        >
          {description}
        </small>
      )}
    </article>
  );
}

function ListValue({
  values,
  emptyText = "Brak informacji",
}) {
  const safeValues = Array.isArray(values)
    ? values.filter(Boolean)
    : [];

  if (safeValues.length === 0) {
    return <>{emptyText}</>;
  }

  return <>{safeValues.join(", ")}</>;
}

function DetailBlock({
  title,
  children,
}) {
  return (
    <section
      style={{
        marginTop: "30px",
      }}
    >
      <h3
        style={{
          marginBottom: "16px",
          fontSize: "22px",
        }}
      >
        {title}
      </h3>

      {children}
    </section>
  );
}

function TextPanel({
  title,
  text,
}) {
  if (!text) {
    return null;
  }

  return (
    <article
      style={{
        padding: "20px",
        borderRadius: "16px",
        background: "#f4f7f6",
        lineHeight: 1.6,
      }}
    >
      <h4
        style={{
          margin: "0 0 8px",
          fontSize: "18px",
        }}
      >
        {title}
      </h4>

      <p
        style={{
          margin: 0,
        }}
      >
        {text}
      </p>
    </article>
  );
}

function PlaceAmenities({ place }) {
  if (!place) {
    return null;
  }

  return (
    <section
      className="adminCard"
      style={{
        padding: "26px",
        marginTop: "32px",
      }}
    >
      <div
        style={{
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            margin: "0 0 8px",
            fontSize: "26px",
          }}
        >
          ℹ️ Informacje o miejscu
        </h2>

        <p
          style={{
            margin: 0,
            color: "#5c6c66",
            lineHeight: 1.55,
          }}
        >
          Szczegóły dotyczące parkingu,
          infrastruktury, zejścia do wody,
          pobytu z dziećmi, psami i noclegu.
        </p>
      </div>

      <DetailBlock title="🚗 Parking">
        <div
          className="infoGrid"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(175px, 1fr))",
          }}
        >
          <ValueCard
            icon="🅿️"
            label="Parking"
            value={place.parking_available}
          />

          <ValueCard
            icon="💳"
            label="Rodzaj parkingu"
            value={place.parking_type}
          />

          <ValueCard
            icon="💰"
            label="Cena"
            value={place.parking_price}
          />

          <ValueCard
            icon="📏"
            label="Odległość od wody"
            value={
              place.parking_distance ||
              place.parking_to_water_distance
            }
          />

          <ValueCard
            icon="🚘"
            label="Wielkość parkingu"
            value={place.parking_size}
          />

          <ValueCard
            icon="💵"
            label="Sposoby płatności"
            value={
              <ListValue
                values={
                  place.parking_payment_methods
                }
              />
            }
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
            marginTop: "18px",
          }}
        >
          <TextPanel
            title="Opis parkingu"
            text={place.parking_description}
          />

          <TextPanel
            title="Ograniczenia"
            text={place.parking_restrictions}
          />
        </div>
      </DetailBlock>

      <DetailBlock title="🐶 Psy">
        <div
          className="infoGrid"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <ValueCard
            icon="🐾"
            label="Psy dozwolone"
            value={place.dogs_allowed}
            description={
              place.dogs_description
            }
          />
        </div>
      </DetailBlock>

      <DetailBlock title="🚻 Toalety, prysznice i przebieralnie">
        <div
          className="infoGrid"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <ValueCard
            icon="🚻"
            label="Toalety"
            value={place.toilets_available}
            description={
              place.toilets_description
            }
          />

          <ValueCard
            icon="💰"
            label="Toalety — opłata"
            value={place.toilets_paid}
            description={
              place.toilets_price
                ? `Cena: ${place.toilets_price}`
                : null
            }
          />

          <ValueCard
            icon="🕒"
            label="Godziny toalet"
            value={
              place.toilets_opening_hours
            }
          />

          <BooleanCard
            icon="♿"
            label="Toaleta dostępna"
            value={
              place.toilets_accessible
            }
            description="Dla osób z niepełnosprawnościami"
          />

          <ValueCard
            icon="🚿"
            label="Prysznice"
            value={place.showers_available}
            description={
              place.showers_description
            }
          />

          <ValueCard
            icon="💰"
            label="Prysznice — opłata"
            value={place.showers_paid}
            description={
              place.showers_price
                ? `Cena: ${place.showers_price}`
                : null
            }
          />

          <ValueCard
            icon="🕒"
            label="Godziny pryszniców"
            value={
              place.showers_opening_hours
            }
          />

          <ValueCard
            icon="👕"
            label="Przebieralnie"
            value={
              place.changing_rooms_available
            }
            description={
              place.changing_rooms_description
            }
          />

          <ValueCard
            icon="💰"
            label="Przebieralnie — opłata"
            value={
              place.changing_rooms_paid
            }
            description={
              place.changing_rooms_price
                ? `Cena: ${place.changing_rooms_price}`
                : null
            }
          />

          <ValueCard
            icon="🕒"
            label="Godziny przebieralni"
            value={
              place.changing_rooms_opening_hours
            }
          />
        </div>
      </DetailBlock>

      <DetailBlock title="🍔 Gastronomia i wypożyczalnia">
        <div
          className="infoGrid"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <ValueCard
            icon="🍔"
            label="Gastronomia"
            value={
              place.gastronomy_available
            }
            description={
              place.gastronomy_description
            }
          />

          <ValueCard
            icon="🍽️"
            label="Rodzaj gastronomii"
            value={
              <ListValue
                values={
                  place.gastronomy_types
                }
              />
            }
          />

          <ValueCard
            icon="🕒"
            label="Godziny gastronomii"
            value={
              place.gastronomy_opening_hours
            }
          />

          <BooleanCard
            icon="💳"
            label="Płatność kartą"
            value={
              place.gastronomy_card_payment
            }
          />

          <ValueCard
            icon="🏄"
            label="Wypożyczalnia"
            value={place.rental_available}
            description={
              place.rental_description
            }
          />

          <ValueCard
            icon="🛶"
            label="Sprzęt"
            value={
              <ListValue
                values={
                  place.rental_equipment
                }
              />
            }
            description={place.rental_other}
          />

          <ValueCard
            icon="💰"
            label="Cennik"
            value={place.rental_prices}
          />

          <ValueCard
            icon="🔐"
            label="Kaucja"
            value={place.rental_deposit}
          />

          <ValueCard
            icon="🪪"
            label="Wymagany dokument"
            value={
              place.rental_document_required
            }
          />

          <ValueCard
            icon="🕒"
            label="Godziny wypożyczalni"
            value={
              place.rental_opening_hours
            }
          />

          <BooleanCard
            icon="📅"
            label="Rezerwacja"
            value={
              place.rental_reservation
            }
          />

          <ValueCard
            icon="☎️"
            label="Kontakt"
            value={place.rental_contact}
          />
        </div>
      </DetailBlock>

      <DetailBlock title="🛟 Ratownik, grill i ognisko">
        <div
          className="infoGrid"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <ValueCard
            icon="🛟"
            label="Ratownik"
            value={
              place.lifeguard_available
            }
            description={
              place.lifeguard_description
            }
          />

          <ValueCard
            icon="🔥"
            label="Grill"
            value={place.grill_status}
            description={
              place.grill_description
            }
          />

          <ValueCard
            icon="🔥"
            label="Ognisko"
            value={place.bonfire_status}
            description={
              place.bonfire_description
            }
          />
        </div>
      </DetailBlock>

      <DetailBlock title="🌳 Cień i odpoczynek">
        <div
          className="infoGrid"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(170px, 1fr))",
          }}
        >
          <ValueCard
            icon="🌳"
            label="Cień"
            value={place.shade_level}
          />

          <BooleanCard
            icon="🪑"
            label="Ławki"
            value={place.benches}
          />

          <BooleanCard
            icon="🧺"
            label="Stoły piknikowe"
            value={place.picnic_tables}
          />

          <BooleanCard
            icon="🏕️"
            label="Altany lub wiaty"
            value={place.shelters}
          />

          <BooleanCard
            icon="🌱"
            label="Trawnik na koc"
            value={place.lawn}
          />

          <BooleanCard
            icon="🛝"
            label="Plac zabaw"
            value={place.playground}
          />

          <BooleanCard
            icon="⚽"
            label="Boisko"
            value={place.sports_field}
          />

          <ValueCard
            icon="➕"
            label="Inne"
            value={place.rest_other}
          />
        </div>
      </DetailBlock>

      <DetailBlock title="⛺ Nocleg i dłuższy pobyt">
        <div
          className="infoGrid"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <ValueCard
            icon="⛺"
            label="Pole namiotowe"
            value={place.campsite_status}
            description={
              place.campsite_description
            }
          />

          <ValueCard
            icon="💰"
            label="Cena pola"
            value={place.campsite_price}
          />

          <ValueCard
            icon="📏"
            label="Odległość pola"
            value={place.campsite_distance}
          />

          <BooleanCard
            icon="⚡"
            label="Prąd na polu"
            value={
              place.campsite_electricity
            }
          />

          <BooleanCard
            icon="🚰"
            label="Woda na polu"
            value={place.campsite_water}
          />

          <BooleanCard
            icon="🐶"
            label="Psy na polu"
            value={place.campsite_dogs}
          />

          <ValueCard
            icon="🚐"
            label="Kampery"
            value={place.camper_status}
            description={
              place.camper_description
            }
          />

          <BooleanCard
            icon="⚡"
            label="Prąd dla kamperów"
            value={
              place.camper_electricity
            }
          />

          <BooleanCard
            icon="🚰"
            label="Woda dla kamperów"
            value={place.camper_water}
          />

          <BooleanCard
            icon="🐶"
            label="Psy w kamperach"
            value={place.camper_dogs}
          />

          <ValueCard
            icon="🏠"
            label="Noclegi"
            value={
              place.accommodation_status
            }
            description={
              place.accommodation_description
            }
          />

          <ValueCard
            icon="🔗"
            label="Link do noclegu"
            value={place.accommodation_link}
          />

          <BooleanCard
            icon="🐶"
            label="Nocleg z psem"
            value={
              place.accommodation_dogs
            }
          />
        </div>
      </DetailBlock>

      <DetailBlock title="🛣️ Dojazd i dostępność">
        <div
          className="infoGrid"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <BooleanCard
            icon="🚲"
            label="Stojaki rowerowe"
            value={place.bicycle_racks}
          />

          <ValueCard
            icon="🚌"
            label="Komunikacja publiczna"
            value={place.public_transport}
          />

          <ValueCard
            icon="👶"
            label="Dostęp dla wózków"
            value={place.stroller_access}
          />

          <ValueCard
            icon="♿"
            label="Ograniczona mobilność"
            value={
              place.limited_mobility_access
            }
          />

          <ValueCard
            icon="🛣️"
            label="Droga dojazdowa"
            value={place.access_road_type}
          />

          <ValueCard
            icon="🏄"
            label="Przenoszenie SUP"
            value={place.sup_carry_distance}
          />

          <BooleanCard
            icon="🪜"
            label="Schody po drodze"
            value={place.stairs_on_route}
          />
        </div>
      </DetailBlock>

      <DetailBlock title="🌊 Charakter wody i brzegu">
        <div
          className="infoGrid"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <ValueCard
            icon="📏"
            label="Głębokość przy brzegu"
            value={place.shore_depth}
          />

          <ValueCard
            icon="🪨"
            label="Rodzaj dna"
            value={
              <ListValue
                values={place.bottom_types}
              />
            }
          />

          <ValueCard
            icon="🏖️"
            label="Rodzaj plaży"
            value={
              <ListValue
                values={place.beach_types}
              />
            }
          />

          <ValueCard
            icon="🚶"
            label="Wejście do wody"
            value={place.water_entry_type}
            description={
              place.water_entry_description
            }
          />
        </div>
      </DetailBlock>

      <DetailBlock title="👶 Dzieci i początkujący">
        <div
          className="infoGrid"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <ValueCard
            icon="👶"
            label="Dla dzieci"
            value={place.children_rating}
            description={
              place.children_description
            }
          />

          <ValueCard
            icon="🧸"
            label="Cechy dla dzieci"
            value={
              <ListValue
                values={
                  place.children_features
                }
              />
            }
          />

          <ValueCard
            icon="🏄"
            label="Dla początkujących"
            value={place.beginner_rating}
            description={
              place.beginner_description
            }
          />

          <ValueCard
            icon="💡"
            label="Powody"
            value={
              <ListValue
                values={
                  place.beginner_reasons
                }
              />
            }
          />
        </div>
      </DetailBlock>

      <DetailBlock title="🚤 Ruch wodny i przeszkody">
        <div
          className="infoGrid"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <ValueCard
            icon="🚤"
            label="Ruch wodny"
            value={place.water_traffic}
            description={
              place.water_traffic_description
            }
          />

          <BooleanCard
            icon="🎣"
            label="Wędkarze"
            value={place.anglers}
          />

          <BooleanCard
            icon="🚩"
            label="Bojki i strefy"
            value={place.marked_zones}
          />

          <BooleanCard
            icon="🌾"
            label="Trzciny i przeszkody"
            value={
              place.reeds_obstacles
            }
          />

          <BooleanCard
            icon="🌊"
            label="Silny nurt"
            value={place.strong_current}
          />
        </div>
      </DetailBlock>

      {(place.important_info ||
        place.description) && (
        <DetailBlock title="📌 Ważne informacje">
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            <TextPanel
              title="Ważne przed przyjazdem"
              text={place.important_info}
            />

            <TextPanel
              title="Opis miejsca"
              text={place.description}
            />
          </div>
        </DetailBlock>
      )}

      <p
        style={{
          margin: "28px 0 0",
          fontSize: "13px",
          color: "#5c6c66",
          lineHeight: 1.5,
        }}
      >
        Brak informacji nie oznacza, że dane
        udogodnienie nie istnieje. Może po prostu
        nie zostało jeszcze uzupełnione przez
        społeczność lub administratora.
      </p>
    </section>
  );
}

export default PlaceAmenities;