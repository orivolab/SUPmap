function FieldSection({
  title,
  description,
  children,
}) {
  return (
    <section
      style={{
        marginTop: "38px",
        paddingTop: "8px",
      }}
    >
      <h2
        style={{
          marginBottom: "8px",
          fontSize: "26px",
        }}
      >
        {title}
      </h2>

      {description && (
        <p
          style={{
            marginTop: 0,
            marginBottom: "22px",
            color: "#5c6c66",
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>
      )}

      <div
        style={{
          display: "grid",
          gap: "20px",
        }}
      >
        {children}
      </div>
    </section>
  );
}

function Grid({
  children,
  minimumWidth = 240,
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(${minimumWidth}px, 1fr))`,
        gap: "18px",
      }}
    >
      {children}
    </div>
  );
}

function TextField({
  label,
  name,
  defaultValue = "",
  placeholder = "",
  required = false,
  maxLength,
  type = "text",
  description,
}) {
  return (
    <label
      style={{
        display: "grid",
        gap: "9px",
        fontSize: "17px",
        fontWeight: 700,
      }}
    >
      <span>
  {label}
  {required && (
    <span
      style={{
        color: "#d64545",
        marginLeft: "4px",
      }}
    >
      *
    </span>
  )}
</span>

      <input
        type={type}
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "14px 15px",
          border: "1px solid #d8e2de",
          borderRadius: "12px",
          fontSize: "16px",
        }}
      />

      {description && (
        <small
          style={{
            fontSize: "13px",
            fontWeight: 400,
            color: "#5c6c66",
            lineHeight: 1.45,
          }}
        >
          {description}
        </small>
      )}
    </label>
  );
}

function TextareaField({
  label,
  name,
  defaultValue = "",
  placeholder = "",
  required = false,
  maxLength,
  minLength,
  rows = 4,
  description,
}) {
  return (
    <label
      style={{
        display: "grid",
        gap: "9px",
        fontSize: "17px",
        fontWeight: 700,
      }}
    >
      {label}

      <textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        minLength={minLength}
        rows={rows}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "14px 15px",
          border: "1px solid #d8e2de",
          borderRadius: "12px",
          fontSize: "16px",
          resize: "vertical",
        }}
      />

      {description && (
        <small
          style={{
            fontSize: "13px",
            fontWeight: 400,
            color: "#5c6c66",
            lineHeight: 1.45,
          }}
        >
          {description}
        </small>
      )}
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  defaultValue = "",
  required = false,
  description,
}) {
  return (
    <label
      style={{
        display: "grid",
        gap: "9px",
        fontSize: "17px",
        fontWeight: 700,
      }}
    >
      {label}

      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "14px 15px",
          border: "1px solid #d8e2de",
          borderRadius: "12px",
          fontSize: "16px",
          background: "#ffffff",
        }}
      >
        {options.map((option) => {
          const optionData =
            typeof option === "string"
              ? {
                  value: option,
                  label: option,
                }
              : option;

          return (
            <option
              key={
                optionData.value ||
                optionData.label
              }
              value={optionData.value}
            >
              {optionData.label}
            </option>
          );
        })}
      </select>

      {description && (
        <small
          style={{
            fontSize: "13px",
            fontWeight: 400,
            color: "#5c6c66",
            lineHeight: 1.45,
          }}
        >
          {description}
        </small>
      )}
    </label>
  );
}

function CheckboxField({
  label,
  name,
  defaultChecked = false,
  icon,
  description,
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "15px 16px",
        border: "1px solid #d8e2de",
        borderRadius: "14px",
        background: "#ffffff",
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        name={name}
        defaultChecked={Boolean(
          defaultChecked
        )}
        style={{
          width: "20px",
          height: "20px",
          marginTop: "2px",
          flexShrink: 0,
        }}
      />

      {icon && (
        <span
          style={{
            fontSize: "22px",
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
      )}

      <span
        style={{
          display: "grid",
          gap: "4px",
        }}
      >
        <strong>{label}</strong>

        {description && (
          <small
            style={{
              color: "#5c6c66",
              lineHeight: 1.4,
            }}
          >
            {description}
          </small>
        )}
      </span>
    </label>
  );
}

function CheckboxGroup({
  label,
  name,
  options,
  defaultValues = [],
  description,
}) {
  const selectedValues = Array.isArray(
    defaultValues
  )
    ? defaultValues
    : [];

  return (
    <fieldset
      style={{
        margin: 0,
        padding: "18px",
        border: "1px solid #d8e2de",
        borderRadius: "16px",
      }}
    >
      <legend
        style={{
          padding: "0 8px",
          fontSize: "17px",
          fontWeight: 800,
        }}
      >
        {label}
      </legend>

      {description && (
        <p
          style={{
            margin: "0 0 14px",
            color: "#5c6c66",
            lineHeight: 1.45,
          }}
        >
          {description}
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
        }}
      >
        {options.map((option) => (
          <label
            key={option}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "11px 12px",
              borderRadius: "12px",
              background: "#f7f9f8",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              name={name}
              value={option}
              defaultChecked={selectedValues.includes(
                option
              )}
              style={{
                width: "18px",
                height: "18px",
              }}
            />

            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const YES_NO_UNKNOWN = [
  {
    value: "",
    label: "Brak informacji",
  },
  {
    value: "Tak",
    label: "Tak",
  },
  {
    value: "Nie",
    label: "Nie",
  },
];

const PAYMENT_OPTIONS = [
  {
    value: "",
    label: "Brak informacji",
  },
  {
    value: "Bezpłatne",
    label: "Bezpłatne",
  },
  {
    value: "Płatne",
    label: "Płatne",
  },
];

function PlaceFormFields({
  place = {},
  position,
  onOpenLocationPicker,
}) {
  return (
    <>
      <FieldSection
        title="📍 Podstawowe informacje"
        description="Najważniejsze dane, które pozwolą znaleźć miejsce i dokładne zejście do wody."
      >
        <Grid>
          <TextField
            label="Nazwa miejsca"
            name="name"
            defaultValue={place.name}
            placeholder="Np. Zalew Stradomia Wierzchnia"
            required
            maxLength={120}
          />

          <TextField
            label="Miejscowość"
            name="city"
            defaultValue={place.city}
            placeholder="Np. Stradomia Wierzchnia"
            required
            maxLength={120}
          />
        </Grid>

        <div
          className="locationField"
          style={{
            display: "grid",
            gap: "10px",
          }}
        >
          <span
            className="locationLabel"
            style={{
              fontSize: "17px",
              fontWeight: 700,
            }}
          >
           Dokładna pinezka wejścia do wody
<span
  style={{
    color: "#d64545",
    marginLeft: "4px",
  }}
>
  *
</span>
</span>

          <button
            type="button"
            className="locationButton"
            onClick={onOpenLocationPicker}
          >
            {position
              ? "✓ Lokalizacja wybrana — zmień"
              : "📍 Wybierz lokalizację na mapie"}
          </button>

          {position && (
            <small
              style={{
                color: "#5c6c66",
              }}
            >
              {Number(position.lat).toFixed(
                6
              )}
              ,{" "}
              {Number(position.lng).toFixed(
                6
              )}
            </small>
          )}
        </div>

        <TextareaField
          label="Opis miejsca"
          name="description"
          defaultValue={place.description}
          placeholder="Opisz miejsce, dostęp do wody, najważniejsze zalety i ewentualne utrudnienia."
          maxLength={3000}
          rows={7}
        />

        <TextareaField
          label="Ważne informacje przed przyjazdem"
          name="important_info"
          defaultValue={
            place.important_info
          }
          placeholder="Np. brama zamykana o 22:00, wjazd tylko od jednej strony, czasowy zakaz kąpieli."
          maxLength={1500}
          rows={4}
        />

        <SelectField
          label="Status miejsca"
          name="place_status"
          defaultValue={
            place.place_status || "active"
          }
          options={[
            {
              value: "active",
              label: "Aktywne",
            },
            {
              value:
                "temporarily_closed",
              label:
                "Tymczasowo zamknięte",
            },
            {
              value: "closed",
              label:
                "Zamknięte na stałe",
            },
          ]}
        />
      </FieldSection>

      <FieldSection
        title="🚗 Parking"
        description="Rozdzielamy dostępność, rodzaj, cenę i praktyczne ograniczenia parkingu."
      >
        <Grid>
          <SelectField
            label="Czy parking jest dostępny?"
            name="parking_available"
            defaultValue={
              place.parking_available
            }
            options={YES_NO_UNKNOWN}
          />

          <SelectField
            label="Rodzaj parkingu"
            name="parking_type"
            defaultValue={
              place.parking_type
            }
            options={[
              {
                value: "",
                label:
                  "Brak informacji",
              },
              {
                value: "Bezpłatny",
                label: "Bezpłatny",
              },
              {
                value: "Płatny",
                label: "Płatny",
              },
              {
                value:
                  "Częściowo płatny",
                label:
                  "Częściowo płatny",
              },
            ]}
          />

          <TextField
            label="Cena parkingu"
            name="parking_price"
            defaultValue={
              place.parking_price
            }
            placeholder="Np. 15 zł za cały dzień"
            maxLength={200}
          />

          <TextField
            label="Odległość od parkingu do wody"
            name="parking_distance"
            defaultValue={
              place.parking_distance
            }
            placeholder="Np. 100 m, około 5 minut pieszo"
            maxLength={200}
          />

          <SelectField
            label="Wielkość parkingu"
            name="parking_size"
            defaultValue={
              place.parking_size
            }
            options={[
              {
                value: "",
                label:
                  "Brak informacji",
              },
              {
                value: "Mały",
                label: "Mały",
              },
              {
                value: "Średni",
                label: "Średni",
              },
              {
                value: "Duży",
                label: "Duży",
              },
            ]}
          />
        </Grid>

        <CheckboxGroup
          label="Sposoby płatności"
          name="parking_payment_methods"
          defaultValues={
            place.parking_payment_methods
          }
          options={[
            "Gotówka",
            "Karta",
            "BLIK",
            "Aplikacja",
            "Inne",
          ]}
        />

        <TextareaField
          label="Ograniczenia parkingu"
          name="parking_restrictions"
          defaultValue={
            place.parking_restrictions
          }
          placeholder="Np. parking zamykany o 22:00, ograniczenie wysokości, zakaz nocowania kamperem."
          maxLength={1000}
        />

        <TextareaField
          label="Dodatkowy opis parkingu"
          name="parking_description"
          defaultValue={
            place.parking_description ||
            place.parking
          }
          placeholder="Opisz wjazd, nawierzchnię, dostępność w weekendy i inne praktyczne informacje."
          maxLength={1500}
        />
      </FieldSection>

      <FieldSection
        title="🐶 Psy"
        description="Określ ogólną zasadę i dopisz szczegóły, gdy dostęp jest tylko częściowy."
      >
        <Grid>
          <SelectField
            label="Czy psy są dozwolone?"
            name="dogs_allowed"
            defaultValue={
              place.dogs_allowed
            }
            options={[
              {
                value: "",
                label:
                  "Brak informacji",
              },
              {
                value: "Tak",
                label: "Tak",
              },
              {
                value: "Nie",
                label: "Nie",
              },
              {
                value: "Częściowo",
                label: "Częściowo",
              },
            ]}
          />

          <TextareaField
            label="Zasady dotyczące psów"
            name="dogs_description"
            defaultValue={
              place.dogs_description
            }
            placeholder="Np. tylko na smyczy, zakaz na głównej plaży, wejście możliwe bocznym zejściem."
            maxLength={1000}
            rows={3}
          />
        </Grid>
      </FieldSection>

      <FieldSection
        title="🚻 Toalety"
        description="Dostępność, opłaty, godziny działania i dostępność dla osób z niepełnosprawnościami."
      >
        <Grid>
          <SelectField
            label="Czy toalety są dostępne?"
            name="toilets_available"
            defaultValue={
              place.toilets_available
            }
            options={YES_NO_UNKNOWN}
          />

          <SelectField
            label="Czy toalety są płatne?"
            name="toilets_paid"
            defaultValue={
              place.toilets_paid
            }
            options={PAYMENT_OPTIONS}
          />

          <TextField
            label="Cena toalety"
            name="toilets_price"
            defaultValue={
              place.toilets_price
            }
            placeholder="Np. 3 zł, w cenie biletu"
            maxLength={200}
          />

          <TextField
            label="Godziny otwarcia"
            name="toilets_opening_hours"
            defaultValue={
              place.toilets_opening_hours
            }
            placeholder="Np. 9:00–20:00, tylko w sezonie"
            maxLength={300}
          />
        </Grid>

        <CheckboxField
          label="Toaleta dostępna dla osób z niepełnosprawnościami"
          name="toilets_accessible"
          icon="♿"
          defaultChecked={
            place.toilets_accessible
          }
        />

        <TextareaField
          label="Dodatkowy opis toalet"
          name="toilets_description"
          defaultValue={
            place.toilets_description
          }
          placeholder="Np. toalety znajdują się przy barze, wymagany żeton."
          maxLength={1000}
        />
      </FieldSection>

      {/* KONIEC CZĘŚCI 1 */}
            <FieldSection
        title="🚿 Prysznice"
        description="Dostępność, opłaty, godziny działania i dodatkowe informacje."
      >
        <Grid>
          <SelectField
            label="Czy prysznice są dostępne?"
            name="showers_available"
            defaultValue={
              place.showers_available
            }
            options={YES_NO_UNKNOWN}
          />

          <SelectField
            label="Czy prysznice są płatne?"
            name="showers_paid"
            defaultValue={
              place.showers_paid
            }
            options={PAYMENT_OPTIONS}
          />

          <TextField
            label="Cena prysznica"
            name="showers_price"
            defaultValue={
              place.showers_price
            }
            placeholder="Np. 5 zł za 5 minut"
            maxLength={200}
          />

          <TextField
            label="Godziny otwarcia"
            name="showers_opening_hours"
            defaultValue={
              place.showers_opening_hours
            }
            placeholder="Np. 9:00–20:00, tylko w sezonie"
            maxLength={300}
          />
        </Grid>

        <TextareaField
          label="Dodatkowy opis pryszniców"
          name="showers_description"
          defaultValue={
            place.showers_description
          }
          placeholder="Np. prysznice z zimną wodą, dostępne przy sanitariatach."
          maxLength={1000}
        />
      </FieldSection>

      <FieldSection
        title="👕 Przebieralnie"
        description="Dostępność przebieralni, opłaty oraz godziny działania."
      >
        <Grid>
          <SelectField
            label="Czy przebieralnie są dostępne?"
            name="changing_rooms_available"
            defaultValue={
              place.changing_rooms_available
            }
            options={YES_NO_UNKNOWN}
          />

          <SelectField
            label="Czy przebieralnie są płatne?"
            name="changing_rooms_paid"
            defaultValue={
              place.changing_rooms_paid
            }
            options={PAYMENT_OPTIONS}
          />

          <TextField
            label="Cena przebieralni"
            name="changing_rooms_price"
            defaultValue={
              place.changing_rooms_price
            }
            placeholder="Np. bezpłatne, 2 zł"
            maxLength={200}
          />

          <TextField
            label="Godziny otwarcia"
            name="changing_rooms_opening_hours"
            defaultValue={
              place.changing_rooms_opening_hours
            }
            placeholder="Np. 8:00–21:00"
            maxLength={300}
          />
        </Grid>

        <TextareaField
          label="Dodatkowy opis przebieralni"
          name="changing_rooms_description"
          defaultValue={
            place.changing_rooms_description
          }
          placeholder="Np. dwie przebieralnie przy głównej plaży."
          maxLength={1000}
        />
      </FieldSection>

      <FieldSection
        title="🍔 Gastronomia"
        description="Określ dostępność, rodzaj punktów gastronomicznych i sposób płatności."
      >
        <Grid>
          <SelectField
            label="Czy gastronomia jest dostępna?"
            name="gastronomy_available"
            defaultValue={
              place.gastronomy_available
            }
            options={[
              {
                value: "",
                label: "Brak informacji",
              },
              {
                value: "Tak",
                label: "Tak",
              },
              {
                value: "Nie",
                label: "Nie",
              },
              {
                value: "Sezonowo",
                label: "Sezonowo",
              },
            ]}
          />

          <TextField
            label="Godziny otwarcia"
            name="gastronomy_opening_hours"
            defaultValue={
              place.gastronomy_opening_hours
            }
            placeholder="Np. 10:00–20:00, maj–wrzesień"
            maxLength={300}
          />
        </Grid>

        <CheckboxGroup
          label="Rodzaje gastronomii"
          name="gastronomy_types"
          defaultValues={
            place.gastronomy_types
          }
          options={[
            "Bar",
            "Restauracja",
            "Food truck",
            "Sklep",
            "Automat",
            "Inne",
          ]}
        />

        <CheckboxField
          label="Możliwość płatności kartą"
          name="gastronomy_card_payment"
          icon="💳"
          defaultChecked={
            place.gastronomy_card_payment
          }
        />

        <TextareaField
          label="Dodatkowy opis gastronomii"
          name="gastronomy_description"
          defaultValue={
            place.gastronomy_description
          }
          placeholder="Np. bar przy głównej plaży, długi czas oczekiwania w weekendy."
          maxLength={1200}
        />
      </FieldSection>

      <FieldSection
        title="🛟 Ratownik"
        description="Stała lub sezonowa obecność ratownika oraz dodatkowe informacje."
      >
        <Grid>
          <SelectField
            label="Czy jest ratownik?"
            name="lifeguard_available"
            defaultValue={
              place.lifeguard_available
            }
            options={[
              {
                value: "",
                label: "Brak informacji",
              },
              {
                value: "Tak",
                label: "Tak",
              },
              {
                value: "Nie",
                label: "Nie",
              },
              {
                value: "Sezonowo",
                label: "Sezonowo",
              },
            ]}
          />

          <TextareaField
            label="Opis obecności ratownika"
            name="lifeguard_description"
            defaultValue={
              place.lifeguard_description
            }
            placeholder="Np. ratownik obecny codziennie w wakacje od 10:00 do 18:00."
            maxLength={1000}
            rows={3}
          />
        </Grid>
      </FieldSection>

      <FieldSection
  title="🏄 Wypożyczalnia"
  description="Dostępność sprzętu, cennik, godziny, możliwość rezerwacji i kontakt."
>
  <Grid>
    <SelectField
      label="Czy wypożyczalnia jest dostępna?"
      name="rental_available"
      defaultValue={
        place.rental_available
      }
      options={[
        {
          value: "",
          label: "Brak informacji",
        },
        {
          value: "Tak",
          label: "Tak",
        },
        {
          value: "Nie",
          label: "Nie",
        },
        {
          value: "Sezonowo",
          label: "Sezonowo",
        },
      ]}
    />

    <TextareaField
  label="Godziny działania"
  name="rental_opening_hours"
  defaultValue={
    place.rental_opening_hours
  }
  placeholder="Np. pon.–pt. 10:00–18:00&#10;sob.–niedz. 9:00–20:00"
  maxLength={500}
  rows={3}
/>

    <TextareaField
  label="Kontakt lub strona"
  name="rental_contact"
  defaultValue={
    place.rental_contact
  }
  placeholder="Telefon, strona internetowa lub profil społecznościowy"
  maxLength={500}
  rows={3}
/>
  </Grid>

  <CheckboxGroup
    label="Co można wypożyczyć?"
    name="rental_equipment"
    defaultValues={
      place.rental_equipment
    }
    options={[
      "SUP",
      "Kajak",
      "Rower wodny",
      "Łódka",
      "Inne",
    ]}
  />

  <TextField
    label="Inny dostępny sprzęt"
    name="rental_other"
    defaultValue={
      place.rental_other
    }
    placeholder="Np. kapoki, deski windsurfingowe"
    maxLength={500}
  />

  <TextareaField
    label="Cennik"
    name="rental_prices"
    defaultValue={
      place.rental_prices
    }
    placeholder="Np. SUP 40 zł/h, kajak 50 zł/h"
    maxLength={1500}
  />

  <CheckboxField
    label="Możliwość wcześniejszej rezerwacji"
    name="rental_reservation"
    icon="📅"
    defaultChecked={
      place.rental_reservation
    }
  />

  <TextareaField
    label="Dodatkowy opis wypożyczalni"
    name="rental_description"
    defaultValue={
      place.rental_description
    }
    placeholder="Np. w weekendy warto rezerwować sprzęt wcześniej."
    maxLength={1200}
  />
</FieldSection>

      <FieldSection
        title="🔥 Grill i ognisko"
        description="Grill i ognisko mają osobne zasady."
      >
        <Grid>
          <SelectField
            label="Grill"
            name="grill_status"
            defaultValue={
              place.grill_status
            }
            options={[
              {
                value: "",
                label: "Brak informacji",
              },
              {
                value: "Dozwolony",
                label: "Dozwolony",
              },
              {
                value: "Niedozwolony",
                label: "Niedozwolony",
              },
              {
                value:
                  "Tylko w wyznaczonym miejscu",
                label:
                  "Tylko w wyznaczonym miejscu",
              },
            ]}
          />

          <SelectField
            label="Ognisko"
            name="bonfire_status"
            defaultValue={
              place.bonfire_status
            }
            options={[
              {
                value: "",
                label: "Brak informacji",
              },
              {
                value: "Dozwolone",
                label: "Dozwolone",
              },
              {
                value: "Niedozwolone",
                label: "Niedozwolone",
              },
              {
                value:
                  "Tylko w wyznaczonym miejscu",
                label:
                  "Tylko w wyznaczonym miejscu",
              },
            ]}
          />
        </Grid>

        <Grid>
          <TextareaField
            label="Opis zasad grillowania"
            name="grill_description"
            defaultValue={
              place.grill_description
            }
            placeholder="Np. grill tylko przy wyznaczonych stołach."
            maxLength={800}
            rows={3}
          />

          <TextareaField
            label="Opis zasad dotyczących ogniska"
            name="bonfire_description"
            defaultValue={
              place.bonfire_description
            }
            placeholder="Np. wymagane wcześniejsze zgłoszenie zarządcy."
            maxLength={800}
            rows={3}
          />
        </Grid>
      </FieldSection>

      <FieldSection
        title="🌳 Cień i odpoczynek"
        description="Warunki do odpoczynku przed lub po pływaniu."
      >
        <SelectField
          label="Ilość cienia"
          name="shade_level"
          defaultValue={
            place.shade_level
          }
          options={[
            {
              value: "",
              label: "Brak informacji",
            },
            {
              value: "Dużo cienia",
              label: "Dużo cienia",
            },
            {
              value: "Średnio cienia",
              label: "Średnio cienia",
            },
            {
              value: "Brak cienia",
              label: "Brak cienia",
            },
          ]}
        />

        <Grid minimumWidth={210}>
          <CheckboxField
            label="Ławki"
            name="benches"
            icon="🪑"
            defaultChecked={
              place.benches
            }
          />

          <CheckboxField
            label="Stoły piknikowe"
            name="picnic_tables"
            icon="🧺"
            defaultChecked={
              place.picnic_tables
            }
          />

          <CheckboxField
            label="Altany lub wiaty"
            name="shelters"
            icon="🏕️"
            defaultChecked={
              place.shelters
            }
          />

          <CheckboxField
            label="Trawnik na koc"
            name="lawn"
            icon="🌱"
            defaultChecked={
              place.lawn
            }
          />

          <CheckboxField
            label="Plac zabaw"
            name="playground"
            icon="🛝"
            defaultChecked={
              place.playground
            }
          />

          <CheckboxField
            label="Boisko"
            name="sports_field"
            icon="⚽"
            defaultChecked={
              place.sports_field
            }
          />
        </Grid>

        <TextField
          label="Inne miejsca lub udogodnienia do odpoczynku"
          name="rest_other"
          defaultValue={
            place.rest_other
          }
          placeholder="Np. hamaki, drewniane szałasy, leżaki"
          maxLength={800}
        />
      </FieldSection>

      <FieldSection
  title="⛺ Camping"
  description="Informacje o campingu dla namiotów i kamperów, na miejscu lub w pobliżu."
>
  <Grid>
    <SelectField
      label="Dostępność campingu"
      name="campsite_status"
      defaultValue={
        place.campsite_status ||
        place.camper_status
      }
     options={[
  {
    value: "Brak informacji",
    label: "Brak informacji",
  },
  {
    value: "Tak",
    label: "Tak",
  },
  {
    value: "Nie",
    label: "Nie",
  },
  {
    value: "W pobliżu",
    label: "W pobliżu",
  },
]}
    />

    <TextareaField
  label="Cena"
  name="campsite_price"
  defaultValue={
    place.campsite_price
  }
  placeholder="Np. namiot 40 zł&#10;kamper 80 zł&#10;prąd 20 zł"
  maxLength={800}
  rows={4}
/>

    <TextField
      label="Odległość"
      name="campsite_distance"
      defaultValue={
        place.campsite_distance
      }
      placeholder="Np. na miejscu, 500 m od plaży"
      maxLength={300}
    />

    <TextareaField
  label="Kontakt do campingu"
  name="campsite_contact"
  defaultValue={
    place.campsite_contact
  }
  placeholder="Telefon, strona internetowa lub profil społecznościowy"
  maxLength={700}
  rows={3}
/>
  </Grid>

  <Grid minimumWidth={210}>
    <CheckboxField
      label="Dostęp do prądu"
      name="campsite_electricity"
      icon="⚡"
      defaultChecked={
        place.campsite_electricity ??
        place.camper_electricity
      }
    />

    <CheckboxField
      label="Dostęp do wody"
      name="campsite_water"
      icon="🚰"
      defaultChecked={
        place.campsite_water ??
        place.camper_water
      }
    />

    <CheckboxField
      label="Możliwość pobytu z psem"
      name="campsite_dogs"
      icon="🐶"
      defaultChecked={
        place.campsite_dogs ??
        place.camper_dogs
      }
    />
  </Grid>

  <TextareaField
    label="Dodatkowy opis campingu"
    name="campsite_description"
    defaultValue={
      place.campsite_description ||
      place.camper_description
    }
    placeholder="Np. stanowiska dla kamperów, miejsce na namioty, sanitariaty, cisza nocna i zasady rezerwacji."
    maxLength={1500}
  />
</FieldSection>

      <FieldSection
        title="🏠 Noclegi"
        description="Noclegi na miejscu lub w pobliżu."
      >
        <Grid>
          <SelectField
            label="Dostępność noclegów"
            name="accommodation_status"
            defaultValue={
              place.accommodation_status
            }
            options={[
              {
                value: "",
                label: "Brak informacji",
              },
              {
                value: "Na miejscu",
                label: "Na miejscu",
              },
              {
                value: "W pobliżu",
                label: "W pobliżu",
              },
              {
                value: "Brak",
                label: "Brak",
              },
            ]}
          />

          <TextField
            label="Link do noclegu"
            name="accommodation_link"
            defaultValue={
              place.accommodation_link
            }
            placeholder="Strona obiektu, Booking, Airbnb lub inny adres"
            maxLength={1000}
            type="url"
          />
        </Grid>

        <Grid minimumWidth={210}>
          <CheckboxField
            label="Dostęp do prądu"
            name="accommodation_electricity"
            icon="⚡"
            defaultChecked={
              place.accommodation_electricity
            }
          />

          <CheckboxField
            label="Dostęp do wody"
            name="accommodation_water"
            icon="🚰"
            defaultChecked={
              place.accommodation_water
            }
          />

          <CheckboxField
            label="Nocleg z psem"
            name="accommodation_dogs"
            icon="🐶"
            defaultChecked={
              place.accommodation_dogs
            }
          />
        </Grid>

        <TextareaField
          label="Dodatkowy opis noclegów"
          name="accommodation_description"
          defaultValue={
            place.accommodation_description
          }
          placeholder="Np. domki przy samej plaży, apartamenty około 1 km od wejścia do wody."
          maxLength={1500}
        />
      </FieldSection>

      <FieldSection
  title="🛣️ Dojazd i dostępność"
  description="Praktyczne informacje dotyczące dojazdu, dojścia i przenoszenia deski."
>
  <Grid>
    <TextField
      label="Dojazd komunikacją publiczną"
      name="public_transport"
      defaultValue={
        place.public_transport
      }
      placeholder="Np. autobus 812, najbliższy przystanek Stradomia Wierzchnia"
      maxLength={800}
    />

    <TextField
      label="Odległość od przystanku do wody"
      name="public_transport_distance"
      defaultValue={
        place.public_transport_distance
      }
      placeholder="Np. 600 m, około 8 minut pieszo"
      maxLength={300}
    />

    <TextField
      label="Dostęp dla wózków"
      name="stroller_access"
      defaultValue={
        place.stroller_access
      }
      placeholder="Np. dobry, częściowy, utrudniony przez piasek"
      maxLength={600}
    />

    <TextField
      label="Rodzaj drogi dojazdowej"
      name="access_road_type"
      defaultValue={
        place.access_road_type
      }
      placeholder="Np. asfaltowa, szutrowa, leśna"
      maxLength={500}
    />
  </Grid>

  <Grid minimumWidth={210}>
    <CheckboxField
      label="Stojaki rowerowe"
      name="bicycle_racks"
      icon="🚲"
      defaultChecked={
        place.bicycle_racks
      }
    />

    <CheckboxField
      label="Schody po drodze"
      name="stairs_on_route"
      defaultChecked={
        place.stairs_on_route
      }
    />
  </Grid>
</FieldSection>

      <FieldSection
        title="🌊 Charakter wody i brzegu"
        description="Głębokość, dno, rodzaj plaży i sposób wejścia do wody."
      >
        <Grid>
          <SelectField
            label="Głębokość przy brzegu"
            name="shore_depth"
            defaultValue={
              place.shore_depth
            }
            options={[
              {
                value: "",
                label: "Brak informacji",
              },
              {
                value: "Bardzo płytko",
                label: "Bardzo płytko",
              },
              {
                value:
                  "Stopniowo robi się głębiej",
                label:
                  "Stopniowo robi się głębiej",
              },
              {
                value:
                  "Szybko robi się głęboko",
                label:
                  "Szybko robi się głęboko",
              },
            ]}
          />

          <SelectField
            label="Wejście do wody"
            name="water_entry_type"
            defaultValue={
              place.water_entry_type ||
              place.water_entry
            }
            options={[
              {
                value: "",
                label: "Brak informacji",
              },
              {
                value: "Łagodne zejście",
                label: "Łagodne zejście",
              },
              {
                value: "Pomost",
                label: "Pomost",
              },
              {
                value: "Schody",
                label: "Schody",
              },
              {
                value: "Stromy brzeg",
                label: "Stromy brzeg",
              },
              {
                value: "Kamieniste",
                label: "Kamieniste",
              },
              {
                value: "Błotniste",
                label: "Błotniste",
              },
              {
                value: "Przez trzciny",
                label: "Przez trzciny",
              },
              {
                value:
                  "Kilka różnych wejść",
                label:
                  "Kilka różnych wejść",
              },
              {
                value: "Inne",
                label: "Inne",
              },
            ]}
          />
        </Grid>

        <CheckboxGroup
          label="Rodzaj dna"
          name="bottom_types"
          defaultValues={
            place.bottom_types
          }
          options={[
            "Piasek",
            "Kamienie",
            "Żwir",
            "Muł",
            "Trawa lub roślinność",
            "Mieszane",
          ]}
        />

        <CheckboxGroup
          label="Rodzaj plaży"
          name="beach_types"
          defaultValues={
            place.beach_types
          }
          options={[
            "Piaszczysta",
            "Trawiasta",
            "Kamienista",
            "Betonowa",
            "Dzika",
            "Brak plaży",
            "Mieszana",
          ]}
        />

        <TextareaField
          label="Dokładny opis wejścia do wody"
          name="water_entry_description"
          defaultValue={
            place.water_entry_description
          }
          placeholder="Np. najlepsze wejście znajduje się po lewej stronie pomostu, dno jest piaszczyste."
          maxLength={1500}
        />
      </FieldSection>

      <FieldSection
        title="👶 Dla dzieci"
        description="Ocena miejsca pod kątem rodzin z dziećmi."
      >
        <SelectField
          label="Ocena dla dzieci"
          name="children_rating"
          defaultValue={
            place.children_rating
          }
          options={[
            {
              value: "",
              label: "Brak informacji",
            },
            {
              value:
                "Bardzo dobre dla dzieci",
              label:
                "Bardzo dobre dla dzieci",
            },
            {
              value:
                "Dobre pod opieką dorosłych",
              label:
                "Dobre pod opieką dorosłych",
            },
            {
              value: "Raczej nie",
              label: "Raczej nie",
            },
            {
              value: "Niebezpieczne",
              label: "Niebezpieczne",
            },
          ]}
        />

        <CheckboxGroup
          label="Cechy ważne dla dzieci"
          name="children_features"
          defaultValues={
            place.children_features
          }
          options={[
            "Płytka woda",
            "Ratownik",
            "Plac zabaw",
            "Piaszczysta plaża",
            "Brak cienia",
            "Stromy brzeg",
            "Duży ruch motorówek",
          ]}
        />

        <TextareaField
          label="Dodatkowy opis dla rodzin z dziećmi"
          name="children_description"
          defaultValue={
            place.children_description
          }
          placeholder="Np. przy brzegu jest płytko, ale poza bojkami szybko robi się głęboko."
          maxLength={1200}
        />
      </FieldSection>

      <FieldSection
        title="🏄 Dla początkujących"
        description="Ocena miejsca dla osób zaczynających pływanie na SUP-ie."
      >
        <SelectField
          label="Ocena dla początkujących"
          name="beginner_rating"
          defaultValue={
            place.beginner_rating ||
            place.difficulty
          }
          options={[
            {
              value: "",
              label: "Brak informacji",
            },
            {
              value: "Bardzo dobre",
              label: "Bardzo dobre",
            },
            {
              value:
                "Dobre przy spokojnej pogodzie",
              label:
                "Dobre przy spokojnej pogodzie",
            },
            {
              value: "Średnie",
              label: "Średnie",
            },
            {
              value: "Trudne",
              label: "Trudne",
            },
          ]}
        />

        <CheckboxGroup
          label="Powody oceny"
          name="beginner_reasons"
          defaultValues={
            place.beginner_reasons
          }
          options={[
            "Spokojna woda",
            "Dużo miejsca",
            "Silny wiatr",
            "Fale",
            "Motorówki",
            "Trudne wejście",
            "Szybko robi się głęboko",
          ]}
        />

        <TextareaField
          label="Dodatkowy opis dla początkujących"
          name="beginner_description"
          defaultValue={
            place.beginner_description
          }
          placeholder="Np. rano woda jest spokojna, po południu często mocniej wieje."
          maxLength={1200}
        />
      </FieldSection>

      {/* KONIEC CZĘŚCI 3 */}
            <FieldSection
        title="🚤 Ruch wodny"
        description="Informacje o motorówkach, strefach ciszy i przeszkodach na wodzie."
      >
        <Grid>
          <SelectField
            label="Ruch wodny"
            name="water_traffic"
            defaultValue={place.water_traffic}
            options={[
              {
                value: "",
                label: "Brak informacji",
              },
              {
                value: "Strefa ciszy",
                label: "Strefa ciszy",
              },
              {
                value: "Zakaz motorówek",
                label: "Zakaz motorówek",
              },
              {
                value: "Mały ruch",
                label: "Mały ruch",
              },
              {
                value: "Umiarkowany ruch",
                label: "Umiarkowany ruch",
              },
              {
                value: "Duży ruch",
                label: "Duży ruch",
              },
              {
                value: "Skutery wodne",
                label: "Skutery wodne",
              },
              {
                value: "Statki lub promy",
                label: "Statki lub promy",
              },
            ]}
          />
        </Grid>

        <Grid minimumWidth={220}>
          <CheckboxField
            label="Wędkarze"
            name="anglers"
            icon="🎣"
            defaultChecked={place.anglers}
          />

          <CheckboxField
            label="Bojki i wydzielone strefy"
            name="marked_zones"
            icon="🚩"
            defaultChecked={place.marked_zones}
          />

          <CheckboxField
            label="Trzciny lub przeszkody"
            name="reeds_obstacles"
            icon="🌾"
            defaultChecked={place.reeds_obstacles}
          />

          <CheckboxField
            label="Silny nurt"
            name="strong_current"
            icon="🌊"
            defaultChecked={place.strong_current}
          />
        </Grid>

        <TextareaField
          label="Dodatkowe informacje"
          name="water_traffic_description"
          defaultValue={
            place.water_traffic_description
          }
          placeholder="Np. po południu pojawia się dużo skuterów wodnych."
          maxLength={1200}
        />
      </FieldSection>

    </>
  );
}

export default PlaceFormFields;