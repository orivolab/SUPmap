import { useEffect, useState } from "react";

import {
  addPlaceVisit,
  deleteOwnVisit,
  formatVisitDate,
  getCurrentUserVisits,
  getPlaceVisitStats,
  prepareVisitImage,
  updateOwnVisit,
} from "../services/visitsService";

function getCurrentLocalDateTime() {
  const now = new Date();

  const timezoneOffset =
    now.getTimezoneOffset() * 60 * 1000;

  return new Date(
    now.getTime() - timezoneOffset
  )
    .toISOString()
    .slice(0, 16);
}

function VisitModal({
  place,
  user,
  onClose,
  onLoginRequired,
  onVisitAdded,
}) {
  const [visitedAt, setVisitedAt] = useState(
    getCurrentLocalDateTime()
  );

  const [privateNote, setPrivateNote] =
    useState("");

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [visits, setVisits] = useState([]);

  const [stats, setStats] = useState({
    visitsCount: 0,
    uniqueVisitorsCount: 0,
    currentUserVisitsCount: 0,
    currentUserLastVisitAt: null,
  });

  const [editingVisitId, setEditingVisitId] =
    useState(null);

  const [editingDate, setEditingDate] =
    useState("");

  const [editingNote, setEditingNote] =
    useState("");

  useEffect(() => {
    loadVisits();
  }, [place?.id, user?.id]);

  async function loadVisits() {
    if (!place?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [statsData, visitsData] =
        await Promise.all([
          getPlaceVisitStats(place.id),
          user
            ? getCurrentUserVisits(place.id)
            : Promise.resolve([]),
        ]);

      setStats(statsData);
      setVisits(visitsData);
    } catch (error) {
      console.error(
        "Błąd pobierania wizyt:",
        error
      );

      setMessage(
        `Nie udało się pobrać wizyt: ${error.message}`
      );
    } finally {
      setLoading(false);
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
        await prepareVisitImage(file);

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
        "Musisz się zalogować, aby oznaczyć wizytę."
      );

      onLoginRequired?.();
      return;
    }

    setSubmitting(true);
    setMessage("Zapisywanie wizyty...");

    try {
      const visit = await addPlaceVisit({
        placeId: place.id,
        visitedAt,
        privateNote,
        image: selectedImage,
      });

      setVisitedAt(
        getCurrentLocalDateTime()
      );

      setPrivateNote("");
      setSelectedImage(null);

      event.currentTarget.reset();

      setMessage(
        "Wizyta została zapisana. Miejsce jest już na Twojej liście odwiedzonych."
      );

      await loadVisits();
      await onVisitAdded?.(visit);
    } catch (error) {
      console.error(
        "Błąd zapisywania wizyty:",
        error
      );

      setMessage(`Błąd: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  function startEditingVisit(visit) {
    const visitDate = new Date(
      visit.visited_at
    );

    const timezoneOffset =
      visitDate.getTimezoneOffset() *
      60 *
      1000;

    const localDate = new Date(
      visitDate.getTime() - timezoneOffset
    )
      .toISOString()
      .slice(0, 16);

    setEditingVisitId(visit.id);
    setEditingDate(localDate);
    setEditingNote(
      visit.private_note || ""
    );

    setMessage("");
  }

  function cancelEditingVisit() {
    setEditingVisitId(null);
    setEditingDate("");
    setEditingNote("");
  }

  async function handleUpdateVisit(
    visitId
  ) {
    setMessage("Zapisywanie zmian...");

    try {
      await updateOwnVisit(visitId, {
        visitedAt: editingDate,
        privateNote: editingNote,
      });

      cancelEditingVisit();
      await loadVisits();

      setMessage(
        "Wizyta została zaktualizowana."
      );
    } catch (error) {
      console.error(
        "Błąd edycji wizyty:",
        error
      );

      setMessage(`Błąd: ${error.message}`);
    }
  }

  async function handleDeleteVisit(
    visitId
  ) {
    const confirmed = window.confirm(
      "Czy na pewno chcesz usunąć tę wizytę?"
    );

    if (!confirmed) {
      return;
    }

    setMessage("Usuwanie wizyty...");

    try {
      await deleteOwnVisit(visitId);

      await loadVisits();
      await onVisitAdded?.();

      setMessage(
        "Wizyta została usunięta."
      );
    } catch (error) {
      console.error(
        "Błąd usuwania wizyty:",
        error
      );

      setMessage(`Błąd: ${error.message}`);
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
        background:
          "rgba(18, 38, 32, 0.58)",
        display: "grid",
        placeItems: "center",
        padding: "20px",
        overflowY: "auto",
      }}
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          onClose?.();
        }
      }}
    >
      <div
        className="adminCard"
        style={{
          width: "min(760px, 100%)",
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
            justifyContent:
              "space-between",
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
              Odwiedzone miejsce
            </p>

            <h2
              style={{
                margin: 0,
                fontSize: "30px",
              }}
            >
              ✅ Byłam tutaj
            </h2>

            <p
              style={{
                margin: "8px 0 0",
                color: "#5c6c66",
                lineHeight: 1.5,
              }}
            >
              {place.name}
              {place.city
                ? ` · ${place.city}`
                : ""}
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

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
            gap: "16px",
            marginTop: "26px",
          }}
        >
          <article
            className="infoCard"
            style={{
              textAlign: "center",
              minHeight: "110px",
              display: "grid",
              alignContent: "center",
            }}
          >
            <strong
              style={{
                fontSize: "28px",
              }}
            >
              {stats.visitsCount}
            </strong>

            <span>
              Wszystkie wizyty
            </span>
          </article>

          <article
            className="infoCard"
            style={{
              textAlign: "center",
              minHeight: "110px",
              display: "grid",
              alignContent: "center",
            }}
          >
            <strong
              style={{
                fontSize: "28px",
              }}
            >
              {stats.uniqueVisitorsCount}
            </strong>

            <span>
              Odwiedzający
            </span>
          </article>
        </section>

        {!user ? (
          <section
            className="emptyPhotos"
            style={{
              marginTop: "26px",
            }}
          >
            <p>
              Zaloguj się, aby oznaczyć,
              że byłaś w tym miejscu.
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
              gap: "20px",
              marginTop: "28px",
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
              Data i godzina wizyty

              <input
                type="datetime-local"
                value={visitedAt}
                max={getCurrentLocalDateTime()}
                onChange={(event) =>
                  setVisitedAt(
                    event.target.value
                  )
                }
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "14px 15px",
                  border:
                    "1px solid #d8e2de",
                  borderRadius: "12px",
                  fontSize: "16px",
                }}
              />
            </label>

            <label
              style={{
                display: "grid",
                gap: "9px",
                fontSize: "17px",
                fontWeight: 700,
              }}
            >
              Prywatna notatka

              <textarea
                value={privateNote}
                onChange={(event) =>
                  setPrivateNote(
                    event.target.value
                  )
                }
                rows="4"
                maxLength="1000"
                placeholder="Np. byłam rano, woda była spokojna. Ta notatka będzie widoczna tylko dla Ciebie."
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "14px 15px",
                  border:
                    "1px solid #d8e2de",
                  borderRadius: "12px",
                  fontSize: "16px",
                  resize: "vertical",
                }}
              />

              <small
                style={{
                  fontWeight: 400,
                  color: "#5c6c66",
                }}
              >
                Notatka nie będzie widoczna
                dla innych użytkowników.
              </small>
            </label>

            <label
              style={{
                display: "grid",
                gap: "9px",
                fontSize: "17px",
                fontWeight: 700,
              }}
            >
              Zdjęcie z wizyty — opcjonalnie

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "13px",
                  border:
                    "1px solid #d8e2de",
                  borderRadius: "12px",
                  fontSize: "15px",
                }}
              />

              <small
                style={{
                  fontWeight: 400,
                  color: "#5c6c66",
                }}
              >
                Maksymalny rozmiar zdjęcia:
                5 MB.
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

            <button
              type="submit"
              className="addPlaceButton"
              disabled={submitting}
            >
              {submitting
                ? "Zapisywanie..."
                : "✅ Zapisz wizytę"}
            </button>
          </form>
        )}

        {message && (
          <p className="formMessage">
            {message}
          </p>
        )}

        {user && (
          <section
            style={{
              marginTop: "38px",
              paddingTop: "28px",
              borderTop:
                "1px solid #dfe7e3",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                fontSize: "23px",
              }}
            >
              Moje wizyty w tym miejscu
            </h3>

            {loading ? (
              <p>Ładowanie wizyt...</p>
            ) : visits.length === 0 ? (
              <div className="emptyPhotos">
                <p>
                  Nie masz jeszcze zapisanej
                  wizyty w tym miejscu.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "16px",
                }}
              >
                {visits.map((visit) => (
                  <article
                    key={visit.id}
                    className="adminCard"
                    style={{
                      padding: "20px",
                    }}
                  >
                    {editingVisitId ===
                    visit.id ? (
                      <div
                        style={{
                          display: "grid",
                          gap: "16px",
                        }}
                      >
                        <label
                          style={{
                            display: "grid",
                            gap: "8px",
                            fontWeight: 700,
                          }}
                        >
                          Data wizyty

                          <input
                            type="datetime-local"
                            value={editingDate}
                            max={getCurrentLocalDateTime()}
                            onChange={(
                              event
                            ) =>
                              setEditingDate(
                                event.target
                                  .value
                              )
                            }
                            style={{
                              width: "100%",
                              boxSizing:
                                "border-box",
                              padding: "13px",
                              border:
                                "1px solid #d8e2de",
                              borderRadius:
                                "12px",
                            }}
                          />
                        </label>

                        <label
                          style={{
                            display: "grid",
                            gap: "8px",
                            fontWeight: 700,
                          }}
                        >
                          Prywatna notatka

                          <textarea
                            value={editingNote}
                            onChange={(
                              event
                            ) =>
                              setEditingNote(
                                event.target
                                  .value
                              )
                            }
                            rows="3"
                            maxLength="1000"
                            style={{
                              width: "100%",
                              boxSizing:
                                "border-box",
                              padding: "13px",
                              border:
                                "1px solid #d8e2de",
                              borderRadius:
                                "12px",
                              resize:
                                "vertical",
                            }}
                          />
                        </label>

                        <div className="adminActions">
                          <button
                            type="button"
                            className="approveButton"
                            onClick={() =>
                              handleUpdateVisit(
                                visit.id
                              )
                            }
                          >
                            Zapisz zmiany
                          </button>

                          <button
                            type="button"
                            className="backButton"
                            onClick={
                              cancelEditingVisit
                            }
                          >
                            Anuluj
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            gap: "16px",
                            flexWrap: "wrap",
                          }}
                        >
                          <div>
                            <strong
                              style={{
                                fontSize:
                                  "18px",
                              }}
                            >
                              📅{" "}
                              {formatVisitDate(
                                visit.visited_at
                              )}
                            </strong>

                            {visit.private_note && (
                              <p
                                style={{
                                  margin:
                                    "10px 0 0",
                                  lineHeight:
                                    1.6,
                                }}
                              >
                                📝{" "}
                                {
                                  visit.private_note
                                }
                              </p>
                            )}
                          </div>

                          <div className="adminActions">
                            <button
                              type="button"
                              className="approveButton"
                              onClick={() =>
                                startEditingVisit(
                                  visit
                                )
                              }
                            >
                              ✏️ Edytuj
                            </button>

                            <button
                              type="button"
                              className="rejectButton"
                              onClick={() =>
                                handleDeleteVisit(
                                  visit.id
                                )
                              }
                            >
                              Usuń
                            </button>
                          </div>
                        </div>

                        {visit.image_url && (
                          <img
                            src={visit.image_url}
                            alt={`Zdjęcie z wizyty w ${place.name}`}
                            style={{
                              width: "100%",
                              maxHeight: "320px",
                              objectFit: "cover",
                              borderRadius:
                                "14px",
                              marginTop:
                                "18px",
                            }}
                          />
                        )}
                      </>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default VisitModal;