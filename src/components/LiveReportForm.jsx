import { useState } from "react";

import {
  submitLiveReport,
} from "../services/liveReportsService";

const CROWD_OPTIONS = [
  "",
  "Pusto",
  "Mało osób",
  "Umiarkowanie",
  "Dużo osób",
  "Bardzo tłoczno",
];

const WIND_OPTIONS = [
  "",
  "Brak wiatru",
  "Lekki",
  "Umiarkowany",
  "Silny",
  "Bardzo silny",
];

const WATER_OPTIONS = [
  "",
  "Gładka woda",
  "Małe fale",
  "Umiarkowane fale",
  "Duże fale",
];

const PARKING_OPTIONS = [
  "",
  "Dużo wolnych miejsc",
  "Są wolne miejsca",
  "Prawie pełny",
  "Brak miejsc",
];

const ALGAE_OPTIONS = [
  "",
  "Brak oznak sinic",
  "Podejrzenie sinic",
  "Potwierdzone sinice",
  "Nie wiem",
];

function SelectField({
  label,
  name,
  options,
}) {
  return (
    <label
      style={{
        display: "grid",
        gap: "8px",
        fontSize: "17px",
        fontWeight: 700,
      }}
    >
      {label}

      <select
        name={name}
        defaultValue=""
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
        {options.map((option) => (
          <option
            key={option || "empty"}
            value={option}
          >
            {option || "Nie podaję"}
          </option>
        ))}
      </select>
    </label>
  );
}

function LiveReportForm({
  placeId,
  user,
  onReportAdded,
  onLoginRequired,
}) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!user) {
      setMessage(
        "Musisz się zalogować, aby dodać aktualizację."
      );

      onLoginRequired?.();
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    const lifeguardValue = String(
      formData.get("lifeguardPresent") ?? ""
    );

    let lifeguardPresent = null;

    if (lifeguardValue === "yes") {
      lifeguardPresent = true;
    }

    if (lifeguardValue === "no") {
      lifeguardPresent = false;
    }

    setSubmitting(true);
    setMessage("Dodawanie aktualizacji...");

    try {
      const report = await submitLiveReport({
        placeId,
        waterTemperature: formData.get(
          "waterTemperature"
        ),
        crowdLevel: formData.get("crowdLevel"),
        windLevel: formData.get("windLevel"),
        waterCondition: formData.get(
          "waterCondition"
        ),
        parkingStatus: formData.get(
          "parkingStatus"
        ),
        algaeStatus: formData.get("algaeStatus"),
        lifeguardPresent,
        note: formData.get("note"),
      });

      form.reset();

      setMessage(
        "Aktualizacja została dodana. Inni użytkownicy już mogą ją zobaczyć."
      );

      await onReportAdded?.(report);
    } catch (error) {
      console.error(
        "Błąd dodawania aktualizacji:",
        error
      );

      setMessage(`Błąd: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      className="adminCard"
      style={{
        padding: "26px",
        marginTop: "28px",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: "8px",
          fontSize: "26px",
        }}
      >
        📍 Jesteś teraz na miejscu?
      </h2>

      <p
        style={{
          marginTop: 0,
          marginBottom: "24px",
          color: "#5c6c66",
          lineHeight: 1.6,
        }}
      >
        Dodaj krótką aktualizację, żeby inni wiedzieli,
        jakie warunki są teraz. Nie musisz uzupełniać
        wszystkich pól.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "20px",
        }}
      >
        <label
          style={{
            display: "grid",
            gap: "8px",
            fontSize: "17px",
            fontWeight: 700,
          }}
        >
          Temperatura wody

          <div
            style={{
              position: "relative",
            }}
          >
            <input
              type="number"
              name="waterTemperature"
              min="0"
              max="40"
              step="0.1"
              placeholder="Np. 22.5"
              inputMode="decimal"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px 52px 14px 15px",
                border: "1px solid #d8e2de",
                borderRadius: "12px",
                fontSize: "16px",
              }}
            />

            <span
              style={{
                position: "absolute",
                right: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                fontWeight: 700,
                color: "#5c6c66",
              }}
            >
              °C
            </span>
          </div>

          <small
            style={{
              fontSize: "13px",
              fontWeight: 400,
              color: "#5c6c66",
            }}
          >
            Podaj tylko wtedy, gdy temperatura była
            rzeczywiście zmierzona.
          </small>
        </label>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "18px",
          }}
        >
          <SelectField
            label="Liczba ludzi"
            name="crowdLevel"
            options={CROWD_OPTIONS}
          />

          <SelectField
            label="Wiatr"
            name="windLevel"
            options={WIND_OPTIONS}
          />

          <SelectField
            label="Stan wody"
            name="waterCondition"
            options={WATER_OPTIONS}
          />

          <SelectField
            label="Parking"
            name="parkingStatus"
            options={PARKING_OPTIONS}
          />

          <SelectField
            label="Sinice"
            name="algaeStatus"
            options={ALGAE_OPTIONS}
          />

          <label
            style={{
              display: "grid",
              gap: "8px",
              fontSize: "17px",
              fontWeight: 700,
            }}
          >
            Czy ratownik jest obecny?

            <select
              name="lifeguardPresent"
              defaultValue=""
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
              <option value="">
                Nie podaję
              </option>
              <option value="yes">
                Tak
              </option>
              <option value="no">
                Nie
              </option>
            </select>
          </label>
        </div>

        <label
          style={{
            display: "grid",
            gap: "8px",
            fontSize: "17px",
            fontWeight: 700,
          }}
        >
          Krótka uwaga

          <textarea
            name="note"
            rows="4"
            maxLength="500"
            placeholder="Np. wieje od strony głównej plaży, przy bocznym wejściu jest spokojniej"
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
        </label>

        <button
          type="submit"
          className="addPlaceButton"
          disabled={submitting}
        >
          {submitting
            ? "Dodawanie..."
            : "Dodaj aktualizację na żywo"}
        </button>

        {message && (
          <p className="formMessage">
            {message}
          </p>
        )}
      </form>
    </section>
  );
}

export default LiveReportForm;