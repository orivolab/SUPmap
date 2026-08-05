import { useEffect, useMemo, useState } from "react";

import {
  deleteOwnLiveReport,
  formatReportAge,
  getLiveReports,
  prepareLiveReportImage,
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

const CLEANLINESS_OPTIONS = [
  "",
  "Bardzo czysta",
  "Czysta",
  "Średnia",
  "Brudna",
  "Bardzo brudna",
];

const RAIN_OPTIONS = [
  "",
  "Brak opadów",
  "Lekki deszcz",
  "Umiarkowany deszcz",
  "Silny deszcz",
  "Burza",
];

const ENTRANCE_OPTIONS = [
  "",
  "Bez utrudnień",
  "Utrudnione wejście",
  "Wejście zamknięte",
];

function SelectField({
  label,
  name,
  options,
  description,
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

function YesNoField({
  label,
  name,
  yesLabel = "Tak",
  noLabel = "Nie",
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
        <option value="">Nie podaję</option>
        <option value="yes">{yesLabel}</option>
        <option value="no">{noLabel}</option>
      </select>
    </label>
  );
}

function getBooleanValue(value) {
  if (value === "yes") {
    return true;
  }

  if (value === "no") {
    return false;
  }

  return null;
}

function LiveReportModal({
  place,
  user,
  onClose,
  onLoginRequired,
  onReportAdded,
}) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

  const [loadingReports, setLoadingReports] =
    useState(true);

  const [reports, setReports] = useState([]);

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [deletingReportId, setDeletingReportId] =
    useState(null);

  useEffect(() => {
    loadReports();
  }, [place?.id, user?.id]);

  const ownReports = useMemo(() => {
    if (!user?.id) {
      return [];
    }

    return reports.filter(
      (report) => report.user_id === user.id
    );
  }, [reports, user?.id]);

  async function loadReports() {
    if (!place?.id) {
      setReports([]);
      setLoadingReports(false);
      return;
    }

    setLoadingReports(true);

    try {
      const data = await getLiveReports(
        place.id,
        50
      );

      setReports(data);
    } catch (error) {
      console.error(
        "Błąd pobierania raportów:",
        error
      );

      setMessage(
        `Nie udało się pobrać raportów: ${error.message}`
      );
    } finally {
      setLoadingReports(false);
    }
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedImage(null);
      return;
    }

    try {
      const preparedImage =
        await prepareLiveReportImage(file);

      setSelectedImage(preparedImage);
      setMessage("");
    } catch (error) {
      event.target.value = "";
      setSelectedImage(null);
      setMessage(error.message);
    }
  }

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

    setSubmitting(true);
    setMessage("Dodawanie aktualizacji...");

    try {
      const report = await submitLiveReport({
        placeId: place.id,

        waterTemperature:
          formData.get("waterTemperature"),

        airTemperature:
          formData.get("airTemperature"),

        crowdLevel:
          formData.get("crowdLevel"),

        windLevel:
          formData.get("windLevel"),

        waterCondition:
          formData.get("waterCondition"),

        parkingStatus:
          formData.get("parkingStatus"),

        algaeStatus:
          formData.get("algaeStatus"),

        lifeguardPresent:
          getBooleanValue(
            formData.get("lifeguardPresent")
          ),

        toiletsOpen:
          formData.get("toiletsOpen"),

        gastronomyOpen:
          formData.get("gastronomyOpen"),

        waterCleanliness:
          formData.get("waterCleanliness"),

        rainStatus:
          formData.get("rainStatus"),

        entranceStatus:
          formData.get("entranceStatus"),

        swimmingBan:
          getBooleanValue(
            formData.get("swimmingBan")
          ),

        note: formData.get("note"),
        liveImage: selectedImage,
      });

      form.reset();
      setSelectedImage(null);

      setMessage(
        "Aktualizacja została dodana. Inni użytkownicy już mogą ją zobaczyć."
      );

      await loadReports();
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

  async function handleDeleteReport(
    reportId
  ) {
    const confirmed = window.confirm(
      "Czy na pewno chcesz usunąć tę aktualizację?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingReportId(reportId);
    setMessage("Usuwanie aktualizacji...");

    try {
      await deleteOwnLiveReport(reportId);

      await loadReports();
      await onReportAdded?.();

      setMessage(
        "Aktualizacja została usunięta."
      );
    } catch (error) {
      console.error(
        "Błąd usuwania aktualizacji:",
        error
      );

      setMessage(`Błąd: ${error.message}`);
    } finally {
      setDeletingReportId(null);
    }
  }

  if (!place) {
    return null;
  }
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(18, 38, 32, 0.58)",
        display: "grid",
        placeItems: "center",
        padding: "20px",
        overflowY: "auto",
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        className="adminCard"
        style={{
          width: "min(920px, 100%)",
          maxHeight: "92vh",
          overflowY: "auto",
          padding: "28px",
          boxSizing: "border-box",
          borderRadius: "24px",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 6px",
                color: "#287b63",
                fontWeight: 800,
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Aktualizacja na żywo
            </p>

            <h2
              style={{
                margin: 0,
                fontSize: "30px",
              }}
            >
              🔴 Co dzieje się teraz?
            </h2>

            <p
              style={{
                margin: "8px 0 0",
                color: "#5c6c66",
                lineHeight: 1.5,
              }}
            >
              {place.name}
              {place.city ? ` · ${place.city}` : ""}
            </p>
          </div>

          <button
            type="button"
            className="backButton"
            onClick={onClose}
          >
            ✕ Zamknij
          </button>
        </div>

        {!user ? (
          <section
            className="emptyPhotos"
            style={{
              marginTop: "28px",
            }}
          >
            <p>
              Zaloguj się, aby dodać aktualizację z miejsca.
            </p>

            <button
              type="button"
              className="addPlaceButton"
              onClick={onLoginRequired}
            >
              Zaloguj się
            </button>
          </section>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gap: "24px",
              marginTop: "30px",
            }}
          >
            <section>
              <h3
                style={{
                  marginTop: 0,
                  fontSize: "23px",
                }}
              >
                🌡️ Temperatura
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "18px",
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
                      inputMode="decimal"
                      placeholder="Np. 22.5"
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

                <label
                  style={{
                    display: "grid",
                    gap: "8px",
                    fontSize: "17px",
                    fontWeight: 700,
                  }}
                >
                  Temperatura powietrza

                  <div
                    style={{
                      position: "relative",
                    }}
                  >
                    <input
                      type="number"
                      name="airTemperature"
                      min="-40"
                      max="60"
                      step="0.1"
                      inputMode="decimal"
                      placeholder="Np. 27"
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
                </label>
              </div>
            </section>

            <section>
              <h3
                style={{
                  marginTop: 0,
                  fontSize: "23px",
                }}
              >
                🌊 Warunki na wodzie
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "18px",
                }}
              >
                <SelectField
                  label="Wiatr"
                  name="windLevel"
                  options={WIND_OPTIONS}
                />

                <SelectField
                  label="Fale"
                  name="waterCondition"
                  options={WATER_OPTIONS}
                />

                <SelectField
                  label="Liczba ludzi"
                  name="crowdLevel"
                  options={CROWD_OPTIONS}
                />

                <SelectField
                  label="Czystość wody"
                  name="waterCleanliness"
                  options={CLEANLINESS_OPTIONS}
                />

                <SelectField
                  label="Sinice / zielona woda"
                  name="algaeStatus"
                  options={ALGAE_OPTIONS}
                />

                <SelectField
                  label="Opady w tej chwili"
                  name="rainStatus"
                  options={RAIN_OPTIONS}
                />
              </div>
            </section>

            <section>
              <h3
                style={{
                  marginTop: 0,
                  fontSize: "23px",
                }}
              >
                🚗 Dostęp i infrastruktura
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "18px",
                }}
              >
                <SelectField
                  label="Stan parkingu"
                  name="parkingStatus"
                  options={PARKING_OPTIONS}
                />

                <select
                  name="toiletsOpen"
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
                    Toalety — nie podaję
                  </option>

                  <option value="Otwarte">
                    Toalety otwarte
                  </option>

                  <option value="Zamknięte">
                    Toalety zamknięte
                  </option>
                </select>

                <select
                  name="gastronomyOpen"
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
                    Gastronomia — nie podaję
                  </option>

                  <option value="Otwarta">
                    Gastronomia otwarta
                  </option>

                  <option value="Zamknięta">
                    Gastronomia zamknięta
                  </option>
                </select>

                <YesNoField
                  label="Czy ratownik jest obecny?"
                  name="lifeguardPresent"
                  yesLabel="Obecny"
                  noLabel="Nieobecny"
                />

                <SelectField
                  label="Wejście do wody"
                  name="entranceStatus"
                  options={ENTRANCE_OPTIONS}
                />

                <YesNoField
                  label="Czy obowiązuje zakaz kąpieli?"
                  name="swimmingBan"
                  yesLabel="Tak, obowiązuje"
                  noLabel="Nie"
                />
              </div>
            </section>

            <section>
              <h3
                style={{
                  marginTop: 0,
                  fontSize: "23px",
                }}
              >
                📸 Zdjęcie i wiadomość
              </h3>

              <div
                style={{
                  display: "grid",
                  gap: "20px",
                }}
              >
                <label
                  style={{
                    display: "grid",
                    gap: "9px",
                    fontSize: "17px",
                    fontWeight: 700,
                  }}
                >
                  Zdjęcie z teraz — opcjonalnie

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "13px",
                      border: "1px solid #d8e2de",
                      borderRadius: "12px",
                      fontSize: "15px",
                    }}
                  />

                  <small
                    style={{
                      fontSize: "13px",
                      fontWeight: 400,
                      color: "#5c6c66",
                    }}
                  >
                    Maksymalnie 5 MB. Zdjęcie będzie pokazane
                    przy aktualizacji i później trafi do historii.
                  </small>
                </label>

                {selectedImage && (
                  <p
                    style={{
                      margin: 0,
                    }}
                  >
                    Wybrane zdjęcie:{" "}
                    <strong>
                      {selectedImage.name}
                    </strong>
                  </p>
                )}

                <label
                  style={{
                    display: "grid",
                    gap: "9px",
                    fontSize: "17px",
                    fontWeight: 700,
                  }}
                >
                  Krótka wiadomość

                  <textarea
                    name="note"
                    rows="5"
                    maxLength="500"
                    placeholder="Np. wieje od strony głównej plaży, boczne wejście jest spokojniejsze"
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
              </div>
            </section>

            <button
              type="submit"
              className="addPlaceButton"
              disabled={submitting}
            >
              {submitting
                ? "Dodawanie..."
                : "🔴 Dodaj aktualizację na żywo"}
            </button>
          </form>
        )}

        {message && (
          <p className="formMessage">
            {message}
          </p>
        )}

        <section
          style={{
            marginTop: "38px",
            paddingTop: "28px",
            borderTop: "1px solid #dfe7e3",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h3
                style={{
                  margin: "0 0 6px",
                  fontSize: "23px",
                }}
              >
                Historia aktualizacji
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#5c6c66",
                }}
              >
                Raporty do 3 godzin są bardzo aktualne,
                od 3 do 6 godzin aktualne, a starsze trafiają
                do historii.
              </p>
            </div>

            <strong>
              {reports.length} raportów
            </strong>
          </div>

          {loadingReports ? (
            <p
              style={{
                marginTop: "22px",
              }}
            >
              Ładowanie aktualizacji...
            </p>
          ) : reports.length === 0 ? (
            <div
              className="emptyPhotos"
              style={{
                marginTop: "22px",
              }}
            >
              <p>
                Nie ma jeszcze żadnych aktualizacji.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "18px",
                marginTop: "22px",
              }}
            >
              {reports.map((report) => {
                const isOwnReport =
                  report.user_id === user?.id;

                return (
                  <article
                    key={report.id}
                    className="adminCard"
                    style={{
                      padding: "22px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "18px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            fontSize: "18px",
                          }}
                        >
                          {report.profiles?.username ||
                            "Użytkownik SUPMap"}
                        </strong>

                        <p
                          style={{
                            margin: "5px 0 0",
                            color: "#5c6c66",
                          }}
                        >
                          {formatReportAge(
                            report.created_at
                          )}
                        </p>
                      </div>

                      {isOwnReport && (
                        <button
                          type="button"
                          className="rejectButton"
                          disabled={
                            deletingReportId ===
                            report.id
                          }
                          onClick={() =>
                            handleDeleteReport(
                              report.id
                            )
                          }
                        >
                          {deletingReportId ===
                          report.id
                            ? "Usuwanie..."
                            : "Usuń"}
                        </button>
                      )}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(170px, 1fr))",
                        gap: "12px",
                        marginTop: "18px",
                      }}
                    >
                      {report.water_temperature !==
                        null && (
                        <div className="infoCard">
                          🌡️ Woda:{" "}
                          <strong>
                            {
                              report.water_temperature
                            }
                            °C
                          </strong>
                        </div>
                      )}

                      {report.air_temperature !==
                        null && (
                        <div className="infoCard">
                          🌤️ Powietrze:{" "}
                          <strong>
                            {
                              report.air_temperature
                            }
                            °C
                          </strong>
                        </div>
                      )}

                      {report.crowd_level && (
                        <div className="infoCard">
                          👥{" "}
                          <strong>
                            {report.crowd_level}
                          </strong>
                        </div>
                      )}

                      {report.wind_level && (
                        <div className="infoCard">
                          💨{" "}
                          <strong>
                            {report.wind_level}
                          </strong>
                        </div>
                      )}

                      {report.water_condition && (
                        <div className="infoCard">
                          🌊{" "}
                          <strong>
                            {
                              report.water_condition
                            }
                          </strong>
                        </div>
                      )}

                      {report.parking_status && (
                        <div className="infoCard">
                          🚗{" "}
                          <strong>
                            {
                              report.parking_status
                            }
                          </strong>
                        </div>
                      )}
                    </div>

                    {report.note && (
                      <p
                        style={{
                          marginTop: "18px",
                          lineHeight: 1.6,
                        }}
                      >
                        💬 {report.note}
                      </p>
                    )}

                    {report.live_image_url && (
                      <img
                        src={report.live_image_url}
                        alt={`Aktualizacja z ${place.name}`}
                        style={{
                          width: "100%",
                          maxHeight: "380px",
                          objectFit: "cover",
                          borderRadius: "16px",
                          marginTop: "18px",
                        }}
                      />
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default LiveReportModal;