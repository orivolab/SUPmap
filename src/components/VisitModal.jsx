import { useEffect, useState } from "react";

import ImageCropModal from "./ImageCropModal";

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

  const [selectedImages, setSelectedImages] =
    useState([]);

  const [cropQueue, setCropQueue] =
    useState([]);

  const [cropImageUrl, setCropImageUrl] =
    useState(null);

  const [cropOriginalFileName, setCropOriginalFileName] =
    useState("");

  const [photoInputKey, setPhotoInputKey] =
    useState(0);

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

  useEffect(() => {
    return () => {
      if (cropImageUrl) {
        URL.revokeObjectURL(cropImageUrl);
      }

      cropQueue.forEach((queuedImage) => {
        URL.revokeObjectURL(queuedImage.url);
      });

      selectedImages.forEach((selectedImage) => {
        URL.revokeObjectURL(selectedImage.previewUrl);
      });
    };
  }, []);

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

  function openNextImageForCropping(queue) {
    const [nextImage, ...rest] = queue;

    setCropQueue(rest);

    if (!nextImage) {
      setCropImageUrl(null);
      setCropOriginalFileName("");
      return;
    }

    setCropImageUrl(nextImage.url);
    setCropOriginalFileName(nextImage.name);
  }

  function clearSelectedImages() {
    selectedImages.forEach((selectedImage) => {
      URL.revokeObjectURL(selectedImage.previewUrl);
    });

    cropQueue.forEach((queuedImage) => {
      URL.revokeObjectURL(queuedImage.url);
    });

    if (cropImageUrl) {
      URL.revokeObjectURL(cropImageUrl);
    }

    setSelectedImages([]);
    setCropQueue([]);
    setCropImageUrl(null);
    setCropOriginalFileName("");
    setPhotoInputKey((current) => current + 1);
  }

  function removeSelectedImage(imageId) {
    setSelectedImages((currentImages) => {
      const imageToRemove = currentImages.find(
        (image) => image.id === imageId
      );

      if (imageToRemove) {
        URL.revokeObjectURL(
          imageToRemove.previewUrl
        );
      }

      return currentImages.filter(
        (image) => image.id !== imageId
      );
    });
  }

  function handleImageChange(event) {
    const files = Array.from(
      event.target.files || []
    );

    if (files.length === 0) {
      return;
    }

    const availableSlots =
      10 -
      selectedImages.length -
      cropQueue.length -
      (cropImageUrl ? 1 : 0);

    if (availableSlots <= 0) {
      setMessage(
        "Możesz dodać maksymalnie 10 zdjęć do jednej wizyty."
      );
      event.target.value = "";
      return;
    }

    const filesToProcess =
      files.slice(0, availableSlots);

    const maximumSize =
      20 * 1024 * 1024;

    const validFiles = [];
    const rejectedFiles = [];

    filesToProcess.forEach((file) => {
      if (
        !file.type.startsWith("image/")
      ) {
        rejectedFiles.push(
          `${file.name} — to nie jest zdjęcie`
        );
        return;
      }

      if (file.size > maximumSize) {
        rejectedFiles.push(
          `${file.name} — przekracza 20 MB`
        );
        return;
      }

      validFiles.push({
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        url: URL.createObjectURL(file),
      });
    });

    if (validFiles.length === 0) {
      setMessage(
        rejectedFiles.join("; ") ||
          "Nie wybrano prawidłowych zdjęć."
      );
      event.target.value = "";
      return;
    }

    const combinedQueue = [
      ...cropQueue,
      ...validFiles,
    ];

    if (cropImageUrl) {
      setCropQueue(combinedQueue);
    } else {
      openNextImageForCropping(
        combinedQueue
      );
    }

    const skippedByLimit =
      files.length -
      filesToProcess.length;

    const parts = [
      `Wybrano ${validFiles.length} zdjęć. Ustaw kadr każdego z nich.`,
    ];

    if (rejectedFiles.length > 0) {
      parts.push(
        `Pominięto: ${rejectedFiles.join("; ")}.`
      );
    }

    if (skippedByLimit > 0) {
      parts.push(
        `Pominięto ${skippedByLimit} zdjęć z powodu limitu 10.`
      );
    }

    setMessage(parts.join(" "));
    event.target.value = "";
  }

  function handleCropCancel() {
    if (cropImageUrl) {
      URL.revokeObjectURL(cropImageUrl);
    }

    setCropImageUrl(null);
    setCropOriginalFileName("");

    if (cropQueue.length > 0) {
      openNextImageForCropping(
        cropQueue
      );

      setMessage(
        "Pominięto to zdjęcie. Ustaw kadr następnego."
      );
    } else {
      setMessage(
        selectedImages.length > 0
          ? "Kadrowanie zakończone. Możesz zapisać wizytę."
          : "Anulowano wybór zdjęć."
      );
    }
  }

  async function handleCropSave(croppedFile) {
    if (!croppedFile) {
      setMessage(
        "Nie udało się przygotować zdjęcia."
      );
      return;
    }

    try {
      const finalFile = new File(
        [croppedFile],
        cropOriginalFileName ||
          `wizyta-${Date.now()}.jpg`,
        {
          type:
            croppedFile.type ||
            "image/jpeg",
          lastModified: Date.now(),
        }
      );

      const preparedImage =
        await prepareVisitImage(
          finalFile
        );

      const previewUrl =
        URL.createObjectURL(finalFile);

      setSelectedImages(
        (currentImages) => [
          ...currentImages,
          {
            id: `${Date.now()}-${Math.random()}`,
            file: preparedImage,
            previewUrl,
            name: finalFile.name,
          },
        ]
      );

      if (cropImageUrl) {
        URL.revokeObjectURL(
          cropImageUrl
        );
      }

      setCropImageUrl(null);
      setCropOriginalFileName("");

      if (cropQueue.length > 0) {
        openNextImageForCropping(
          cropQueue
        );

        setMessage(
          `Kadr zapisany. Pozostało do wykadrowania: ${cropQueue.length}.`
        );
      } else {
        setMessage(
          "Wszystkie kadry zapisane. Możesz zapisać wizytę."
        );
      }
    } catch (error) {
      console.error(
        "Błąd przygotowania zdjęcia:",
        error
      );

      setMessage(
        `Nie udało się przygotować zdjęcia: ${error.message}`
      );
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;

    if (!user) {
      setMessage(
        "Musisz się zalogować, aby oznaczyć wizytę."
      );

      onLoginRequired?.();
      return;
    }

    if (cropImageUrl) {
      setMessage(
        "Najpierw zakończ kadrowanie wszystkich zdjęć."
      );
      return;
    }

    setSubmitting(true);
    setMessage("Zapisywanie wizyty...");

    try {
      const visit = await addPlaceVisit({
        placeId: place.id,
        visitedAt,
        privateNote,
        images: selectedImages.map(
          (selectedImage) =>
            selectedImage.file
        ),
      });

      form.reset();

      setVisitedAt(
        getCurrentLocalDateTime()
      );

      setPrivateNote("");
      clearSelectedImages();

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
  <>
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
              Zdjęcia z wizyty — opcjonalnie

              <input
                key={photoInputKey}
                type="file"
                accept="image/*"
                multiple
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
                  lineHeight: 1.45,
                }}
              >
                Możesz dodać maksymalnie 10 zdjęć.
                Każde może mieć do 20 MB.
                Po wybraniu ustawisz osobny kadr
                każdego zdjęcia.
              </small>
            </label>

            {selectedImages.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <strong>
                    Wybrane zdjęcia:{" "}
                    {selectedImages.length}
                  </strong>

                  <button
                    type="button"
                    className="backButton"
                    onClick={
                      clearSelectedImages
                    }
                  >
                    Usuń wszystkie
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "12px",
                  }}
                >
                  {selectedImages.map(
                    (selectedImage) => (
                      <article
                        key={selectedImage.id}
                        style={{
                          overflow: "hidden",
                          border:
                            "1px solid #d8e2de",
                          borderRadius: "14px",
                          background: "#ffffff",
                        }}
                      >
                        <img
                          src={
                            selectedImage.previewUrl
                          }
                          alt={`Podgląd: ${selectedImage.name}`}
                          style={{
                            width: "100%",
                            height: "140px",
                            display: "block",
                            objectFit: "cover",
                          }}
                        />

                        <div
                          style={{
                            display: "grid",
                            gap: "8px",
                            padding: "10px",
                          }}
                        >
                          <small
                            style={{
                              overflow: "hidden",
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                            }}
                            title={
                              selectedImage.name
                            }
                          >
                            {selectedImage.name}
                          </small>

                          <button
                            type="button"
                            className="backButton"
                            onClick={() =>
                              removeSelectedImage(
                                selectedImage.id
                              )
                            }
                          >
                            Usuń
                          </button>
                        </div>
                      </article>
                    )
                  )}
                </div>
              </div>
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

                        {(
                          Array.isArray(
                            visit.image_urls
                          )
                            ? visit.image_urls
                            : visit.image_url
                              ? [visit.image_url]
                              : []
                        ).length > 0 && (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(180px, 1fr))",
                              gap: "12px",
                              marginTop: "18px",
                            }}
                          >
                            {(
                              Array.isArray(
                                visit.image_urls
                              )
                                ? visit.image_urls
                                : [visit.image_url]
                            ).map(
                              (imageUrl, index) => (
                                <img
                                  key={`${visit.id}-${index}`}
                                  src={imageUrl}
                                  alt={`Zdjęcie ${index + 1} z wizyty w ${place.name}`}
                                  style={{
                                    width: "100%",
                                    height: "220px",
                                    objectFit: "cover",
                                    borderRadius:
                                      "14px",
                                  }}
                                />
                              )
                            )}
                          </div>
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

    {cropImageUrl && (
      <ImageCropModal
        imageUrl={cropImageUrl}
        allowAspectSelection
        initialAspectId="landscape"
        onCancel={handleCropCancel}
        onSave={handleCropSave}
      />
    )}
  </>
);
}

export default VisitModal;