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
  className="preserveTextFormatting"
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
          className="preserveTextFormatting"
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
  className="preserveTextFormatting"
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
          className="preserveTextFormatting"
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
  const safeValues =
    Array.isArray(values)
      ? values.filter(Boolean)
      : [];

  if (safeValues.length === 0) {
    return <>{emptyText}</>;
  }

  return (
    <>
      {safeValues.join(", ")}
    </>
  );
}

function getDetailBlockId(title) {
  const sectionIds = {
    "🚗 Parking":
      "overview-parking",

    "🐶 Psy":
      "overview-dogs",

    "🚻 Toalety":
      "overview-toilets",

    "🚿 Prysznice":
      "overview-showers",

    "👕 Przebieralnie":
      "overview-changing-rooms",

    "🍔 Gastronomia":
      "overview-gastronomy",

    "🏄 Wypożyczalnia":
      "overview-rental",

    "🛟 Ratownik":
      "overview-lifeguard",

    "🔥 Grill":
      "overview-grill",

    "🔥 Ognisko":
      "overview-bonfire",

    "🌳 Cień i odpoczynek":
      "overview-rest",

    "⛺ Nocleg i dłuższy pobyt":
      "overview-stay",

    "🛣️ Dojazd i dostępność":
      "overview-access",

    "🌊 Charakter wody i brzegu":
      "overview-water",

    "👶 Dzieci":
      "overview-children",

    "🏄 Początkujący":
      "overview-beginners",

    "🚤 Ruch wodny i przeszkody":
      "overview-water-traffic",

    "📌 Ważne informacje":
      "overview-important-details",
  };

  return sectionIds[title];
}

function DetailBlock({
  title,
  children,
}) {
  const sectionId =
    getDetailBlockId(title);

  return (
    <section
      id={sectionId}
      className="overviewScrollSection placeAmenitiesSection"
    >
      <h3>{title}</h3>

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
  className="preserveTextFormatting"
  style={{
    margin: 0,
  }}
>
  {text}
</p>
    </article>
  );
}
function StackedInfoRow({
  icon,
  label,
  value,
  description,
  isBoolean = false,
}) {
  let displayedValue = value;

  if (isBoolean) {
    const known =
      value === true ||
      value === false;

    displayedValue = !known
      ? "Brak informacji"
      : value
        ? "Tak"
        : "Nie";
  }

  const hasValue =
    displayedValue !== null &&
    displayedValue !== undefined &&
    displayedValue !== "" &&
    displayedValue !==
      "Brak informacji";

  return (
    <article
      style={{
        display: "grid",
        gridTemplateColumns:
          "42px minmax(0, 1fr)",
        gap: "14px",
        alignItems: "center",
        padding: "16px 18px",
        borderBottom:
          "1px solid #dce7e2",
        opacity: hasValue ? 1 : 0.65,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: "grid",
          placeItems: "center",
          fontSize: "25px",
        }}
      >
        {icon}
      </span>

      <div
        style={{
          minWidth: 0,
        }}
      >
        <h4
          style={{
            margin: "0 0 4px",
            fontSize: "16px",
          }}
        >
          {label}
        </h4>

       <strong
  className="preserveTextFormatting"
  style={{
    display: "block",
    fontSize: "16px",
    lineHeight: 1.5,
  }}
>
          {hasValue
            ? displayedValue
            : "Brak informacji"}
        </strong>

        {description && (
  <p
    className="preserveTextFormatting"
    style={{
      margin: "5px 0 0",
      color: "#5c6c66",
      fontSize: "14px",
      lineHeight: 1.5,
    }}
  >
    {description}
  </p>
)}
      </div>
    </article>
  );
}

function StackedInfoGroup({
  icon,
  title,
  description,
  children,
}) {
  return (
    <section
      style={{
        overflow: "hidden",
        border:
          "1px solid #dce7e2",
        borderRadius: "18px",
        background: "#ffffff",
      }}
    >
      <header
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          padding: "18px",
          background: "#f4f7f6",
          borderBottom:
            "1px solid #dce7e2",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            fontSize: "27px",
          }}
        >
          {icon}
        </span>

        <div>
          <h4
            style={{
              margin: 0,
              fontSize: "19px",
            }}
          >
            {title}
          </h4>

          {description && (
  <p
    className="preserveTextFormatting"
    style={{
      margin: "4px 0 0",
      color: "#5c6c66",
      fontSize: "14px",
      lineHeight: 1.45,
    }}
  >
    {description}
  </p>
)}
        </div>
      </header>

      <div
        style={{
          display: "grid",
        }}
      >
        {children}
      </div>
    </section>
  );
}

function PlaceAmenities({ place }) {
  if (!place) {
    return null;
  }

  return (
    <section
      className="placeAmenitiesCard"
      style={{
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
            value={
              place.parking_available
            }
          />

          <ValueCard
            icon="💳"
            label="Rodzaj parkingu"
            value={
              place.parking_type
            }
          />

          <ValueCard
            icon="💰"
            label="Cena"
            value={
              place.parking_price
            }
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
            value={
              place.parking_size
            }
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
            text={
              place.parking_description
            }
          />

          <TextPanel
            title="Ograniczenia"
            text={
              place.parking_restrictions
            }
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
            value={
              place.dogs_allowed
            }
            description={
              place.dogs_description
            }
          />
        </div>
      </DetailBlock>
            <DetailBlock title="🚻 Toalety">
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
            value={
              place.toilets_available
            }
            description={
              place.toilets_description
            }
          />

          <ValueCard
            icon="💰"
            label="Toalety — opłata"
            value={
              place.toilets_paid
            }
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
        </div>
      </DetailBlock>

      <DetailBlock title="🚿 Prysznice">
        <div
          className="infoGrid"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <ValueCard
            icon="🚿"
            label="Prysznice"
            value={
              place.showers_available
            }
            description={
              place.showers_description
            }
          />

          <ValueCard
            icon="💰"
            label="Prysznice — opłata"
            value={
              place.showers_paid
            }
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
        </div>
      </DetailBlock>

      <DetailBlock title="👕 Przebieralnie">
        <div
          className="infoGrid"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
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

      <DetailBlock title="🍔 Gastronomia">
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
        </div>
      </DetailBlock>

      <DetailBlock title="🏄 Wypożyczalnia">
  <StackedInfoGroup
    icon="🏄"
    title="Wypożyczalnia"
    description={
      place.rental_description
    }
  >

    <StackedInfoRow
      icon="🛶"
      label="Sprzęt"
      value={
        <ListValue
          values={
            place.rental_equipment
          }
        />
      }
      description={
        place.rental_other
      }
    />

    <StackedInfoRow
      icon="💰"
      label="Cennik"
      value={
        place.rental_prices
      }
    />

    <StackedInfoRow
      icon="🕒"
      label="Godziny"
      value={
        place.rental_opening_hours
      }
    />

    <StackedInfoRow
      icon="📅"
      label="Rezerwacja"
      value={
        place.rental_reservation
      }
      isBoolean
    />

    <StackedInfoRow
      icon="☎️"
      label="Kontakt"
      value={
        place.rental_contact
      }
    />
  </StackedInfoGroup>
</DetailBlock>

      <DetailBlock title="🛟 Ratownik">
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
        </div>
      </DetailBlock>

      <DetailBlock title="🔥 Grill">
        <div
          className="infoGrid"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <ValueCard
            icon="🔥"
            label="Grill"
            value={
              place.grill_status
            }
            description={
              place.grill_description
            }
          />
        </div>
      </DetailBlock>

      <DetailBlock title="🔥 Ognisko">
        <div
          className="infoGrid"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <ValueCard
            icon="🔥"
            label="Ognisko"
            value={
              place.bonfire_status
            }
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
            value={
              place.shade_level
            }
          />

          <BooleanCard
            icon="🪑"
            label="Ławki"
            value={
              place.benches
            }
          />

          <BooleanCard
            icon="🧺"
            label="Stoły piknikowe"
            value={
              place.picnic_tables
            }
          />

          <BooleanCard
            icon="🏕️"
            label="Altany lub wiaty"
            value={
              place.shelters
            }
          />

          <BooleanCard
            icon="🌱"
            label="Trawnik na koc"
            value={
              place.lawn
            }
          />

          <BooleanCard
            icon="🛝"
            label="Plac zabaw"
            value={
              place.playground
            }
          />

          <BooleanCard
            icon="⚽"
            label="Boisko"
            value={
              place.sports_field
            }
          />

          <ValueCard
            icon="➕"
            label="Inne"
            value={
              place.rest_other
            }
          />
        </div>
      </DetailBlock>

            <DetailBlock title="⛺ Nocleg i dłuższy pobyt">
  <div
    style={{
      display: "grid",
      gap: "22px",
    }}
  >
    <StackedInfoGroup
      icon="⛺"
      title="Camping"
      description={
        place.campsite_description ||
        place.camper_description
      }
    >
      <StackedInfoRow
        icon="💰"
        label="Cena"
        value={
          place.campsite_price
        }
      />

      <StackedInfoRow
        icon="⚡"
        label="Prąd"
        value={
          place.campsite_electricity ??
          place.camper_electricity
        }
        isBoolean
      />
      <StackedInfoRow
        icon="🚰"
        label="Woda"
        value={
          place.campsite_water ??
          place.camper_water
        }
        isBoolean
      />

      <StackedInfoRow
        icon="🐶"
        label="Psy"
        value={
          place.campsite_dogs ??
          place.camper_dogs
        }
        isBoolean
      />

      <StackedInfoRow
        icon="☎️"
        label="Kontakt"
        value={
  place.campsite_contact
}
      />
    </StackedInfoGroup>

    <StackedInfoGroup
      icon="🏠"
      title="Noclegi"
      description={
        place.accommodation_description
      }
    >
      <StackedInfoRow
        icon="🏠"
        label="Noclegi"
        value={
          place.accommodation_status
        }
      />
      <StackedInfoRow
        icon="🔗"
        label="Link do noclegu"
        value={
          place.accommodation_link
        }
      />
      <StackedInfoRow
        icon="🐶"
        label="Psy"
        value={
          place.accommodation_dogs
        }
        isBoolean
      />
    </StackedInfoGroup>
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

      <DetailBlock title="👶 Dzieci">
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
            value={
              place.children_rating
            }
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
        </div>
      </DetailBlock>

      <DetailBlock title="🏄 Początkujący">
        <div
          className="infoGrid"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <ValueCard
            icon="🏄"
            label="Dla początkujących"
            value={
              place.beginner_rating
            }
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