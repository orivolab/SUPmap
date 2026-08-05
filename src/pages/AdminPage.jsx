import { useState } from "react";

const TABS = {
  PENDING_PLACES: "pending-places",
  PENDING_REVIEWS: "pending-reviews",
  PENDING_PHOTOS: "pending-photos",
  SUPPORT_TICKETS: "support-tickets",
  APPROVED_PLACES: "approved-places",
};

function AdminPage({
  approvedPlaces,
  pendingPlaces,
  pendingReviews,
  pendingPhotos,
  supportTickets = [],
  message,
  onBack,
  onLogout,
  onEditPlace,
  onApprovePlace,
  onRejectPlace,
  onApproveReview,
  onRejectReview,
  onApprovePhoto,
  onRejectPhoto,
  onSupportStatusChange,
  onDeleteSupportTicket,
}) {
  const [activeTab, setActiveTab] = useState(
    TABS.PENDING_PLACES
  );
  
const newSupportTicketsCount =
  supportTickets.filter(
    (ticket) =>
      ticket.status === "new"
  ).length;

  function TabButton({
    tab,
    label,
    count,
  }) {
    const active = activeTab === tab;

    return (
      <button
        type="button"
        onClick={() => setActiveTab(tab)}
        style={{
          border: active
            ? "2px solid #287b63"
            : "1px solid #d8e2de",
          background: active
            ? "#287b63"
            : "#ffffff",
          color: active ? "#ffffff" : "#263630",
          borderRadius: "999px",
          padding: "11px 18px",
          fontWeight: active ? "700" : "600",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {label} ({count})
      </button>
    );
  }

  return (
    <div className="placeDetails">
      <div className="sectionHeader">
        <button
          type="button"
          className="backButton"
          onClick={onBack}
        >
          ← Wróć do mapy
        </button>

        <button
          type="button"
          className="rejectButton"
          onClick={onLogout}
        >
          Wyloguj
        </button>
      </div>

      <h1>Panel administratora</h1>

      <p>
        Zatwierdzone miejsca:{" "}
        <strong>{approvedPlaces.length}</strong>
        {" · "}
        Oczekujące miejsca:{" "}
        <strong>{pendingPlaces.length}</strong>
        {" · "}
        Oczekujące opinie:{" "}
        <strong>{pendingReviews.length}</strong>
        {" · "}
        Oczekujące zdjęcia:{" "}
<strong>{pendingPhotos.length}</strong>
{" · "}
Nowe zgłoszenia pomocy:{" "}
<strong>{newSupportTicketsCount}</strong>
      </p>

      {message && (
        <p className="formMessage">
          {message}
        </p>
      )}

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginTop: "30px",
          marginBottom: "34px",
        }}
      >
        <TabButton
          tab={TABS.PENDING_PLACES}
          label="Nowe miejsca"
          count={pendingPlaces.length}
        />

        <TabButton
          tab={TABS.PENDING_REVIEWS}
          label="Opinie"
          count={pendingReviews.length}
        />

        <TabButton
          tab={TABS.PENDING_PHOTOS}
          label="Zdjęcia"
          count={pendingPhotos.length}
        />

        <TabButton
          tab={TABS.APPROVED_PLACES}
          label="Zatwierdzone"
          count={approvedPlaces.length}
        />

        <TabButton
          tab={TABS.SUPPORT_TICKETS}
          label="Zgłoszenia pomocy"
          count={newSupportTicketsCount}
        />
      </div>

{activeTab === TABS.SUPPORT_TICKETS && (
  <section>
    <h2>📬 Zgłoszenia użytkowników</h2>

    {supportTickets.length === 0 ? (
      <div className="emptyPhotos">
        <p>
          Nie ma jeszcze żadnych zgłoszeń.
        </p>
      </div>
    ) : (
      <div className="adminList">
        {supportTickets.map((ticket) => {
          const statusLabels = {
            new: "🟢 Nowe",
            in_progress: "🟡 W trakcie",
            resolved: "✅ Rozwiązane",
            closed: "⚪ Zamknięte",
          };

          return (
            <article
              className="adminCard"
              key={`support-${ticket.id}`}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "flex-start",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 8px",
                      fontWeight: 800,
                    }}
                  >
                    {statusLabels[
                      ticket.status
                    ] || ticket.status}
                  </p>

                  <h2
                    style={{
                      margin:
                        "0 0 10px",
                    }}
                  >
                    {ticket.subject}
                  </h2>

                  <p
                    style={{
                      margin:
                        "0 0 8px",
                    }}
                  >
                    Kategoria:{" "}
                    <strong>
                      {ticket.category}
                    </strong>
                  </p>
                </div>

                <select
                  value={ticket.status}
                  onChange={(event) =>
                    onSupportStatusChange?.(
                      ticket,
                      event.target.value
                    )
                  }
                  style={{
                    padding: "10px 12px",
                    border:
                      "1px solid #d8e2de",
                    borderRadius: "12px",
                    background: "#ffffff",
                    font: "inherit",
                    fontWeight: 700,
                  }}
                >
                  <option value="new">
                    Nowe
                  </option>

                  <option value="in_progress">
                    W trakcie
                  </option>

                  <option value="resolved">
                    Rozwiązane
                  </option>

                  <option value="closed">
                    Zamknięte
                  </option>
                </select>
              </div>

              <div
                style={{
                  marginTop: "18px",
                  padding: "16px",
                  borderRadius: "14px",
                  background: "#f4f7f6",
                  lineHeight: 1.65,
                  whiteSpace: "pre-wrap",
                }}
              >
                {ticket.message}
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "8px",
                  marginTop: "18px",
                  color: "#5c6c66",
                  fontSize: "14px",
                }}
              >
                <p style={{ margin: 0 }}>
                  ✉️ E-mail:{" "}
                  <strong>
                    {ticket.email ||
                      "Nie podano"}
                  </strong>
                </p>

                <p style={{ margin: 0 }}>
                  👤 ID użytkownika:{" "}
                  <strong>
                    {ticket.user_id ||
                      "Osoba niezalogowana"}
                  </strong>
                </p>

                <p style={{ margin: 0 }}>
                  🕒 Wysłano:{" "}
                  <strong>
                    {new Date(
                      ticket.created_at
                    ).toLocaleString(
                      "pl-PL",
                      {
                        dateStyle:
                          "medium",
                        timeStyle:
                          "short",
                      }
                    )}
                  </strong>
                </p>

                {ticket.page_url && (
                  <p style={{ margin: 0 }}>
                    📄 Strona:{" "}
                    <a
                      href={ticket.page_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {ticket.page_url}
                    </a>
                  </p>
                )}

                {ticket.app_version && (
                  <p style={{ margin: 0 }}>
                    📦 Wersja aplikacji:{" "}
                    <strong>
                      {ticket.app_version}
                    </strong>
                  </p>
                )}

                {ticket.user_agent && (
                  <details>
                    <summary
                      style={{
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      Dane urządzenia i
                      przeglądarki
                    </summary>

                    <p
                      style={{
                        overflowWrap:
                          "anywhere",
                        lineHeight: 1.5,
                      }}
                    >
                      {ticket.user_agent}
                    </p>
                  </details>
                )}
              </div>

              {ticket.screenshot_url && (
                <div
                  style={{
                    marginTop: "18px",
                  }}
                >
                  <p
                    style={{
                      margin:
                        "0 0 10px",
                      fontWeight: 800,
                    }}
                  >
                    📷 Załączony zrzut ekranu
                  </p>

                  <a
                    href={
                      ticket.screenshot_url
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={
                        ticket.screenshot_url
                      }
                      alt="Zrzut ekranu ze zgłoszenia"
                      style={{
                        width:
                          "min(100%, 620px)",
                        maxHeight: "520px",
                        objectFit: "contain",
                        borderRadius:
                          "16px",
                        border:
                          "1px solid #d8e2de",
                        display: "block",
                      }}
                    />
                  </a>
                </div>
              )}

              <div
                className="adminActions"
                style={{
                  marginTop: "20px",
                }}
              >
                <button
                  type="button"
                  className="rejectButton"
                  onClick={() =>
                    onDeleteSupportTicket?.(
                      ticket
                    )
                  }
                >
                  🗑 Usuń zgłoszenie
                </button>
              </div>
            </article>
          );
        })}
      </div>
    )}
  </section>
)}

      {activeTab === TABS.PENDING_PLACES && (
        <section>
          <h2>Zgłoszenia nowych miejsc</h2>

          {pendingPlaces.length === 0 ? (
            <div className="emptyPhotos">
              <p>
                Nie ma miejsc do sprawdzenia.
              </p>
            </div>
          ) : (
            <div className="adminList">
              {pendingPlaces.map((place) => (
                <article
                  className="adminCard"
                  key={`pending-${place.id}`}
                >
                  {place.image_url && (
                    <img
                      src={place.image_url}
                      alt={place.name}
                      className="placeHero"
                    />
                  )}

                  <h2>{place.name}</h2>

                  <p>
                    📍 Miejscowość: {place.city}
                  </p>

                  <p>
                    🚗 Parking: {place.parking}
                  </p>

                  <p>
                    🐶 Psy: {place.dogs}
                  </p>

                  <p>
                    🏄 Początkujący:{" "}
                    {place.beginner}
                  </p>

                  <p>{place.description}</p>

                  <div className="adminActions">
                    <button
                      type="button"
                      className="approveButton"
                      onClick={() =>
                        onApprovePlace(place)
                      }
                    >
                      ✓ Zatwierdź
                    </button>

                    <button
                      type="button"
                      className="rejectButton"
                      onClick={() =>
                        onRejectPlace(place)
                      }
                    >
                      Odrzuć
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === TABS.PENDING_REVIEWS && (
        <section>
          <h2>Opinie do zatwierdzenia</h2>

          {pendingReviews.length === 0 ? (
            <div className="emptyPhotos">
              <p>
                Nie ma opinii do sprawdzenia.
              </p>
            </div>
          ) : (
            <div className="adminList">
              {pendingReviews.map((review) => (
                <article
                  className="adminCard"
                  key={`review-${review.id}`}
                >
                  <p>
                    📍 Miejsce:{" "}
                    <strong>
                      {review.place_submissions
                        ?.name ||
                        `ID ${review.place_id}`}
                    </strong>
                  </p>

                  {review.place_submissions
                    ?.city && (
                    <p>
                      Miejscowość:{" "}
                      {
                        review
                          .place_submissions
                          .city
                      }
                    </p>
                  )}

                  <h3>{review.author}</h3>

                  <p>
                    {"⭐".repeat(
                      Number(review.rating)
                    )}

                    <span
                      style={{
                        opacity: 0.25,
                      }}
                    >
                      {"⭐".repeat(
                        5 -
                          Number(
                            review.rating
                          )
                      )}
                    </span>
                  </p>

                  <p>{review.comment}</p>

                  <div className="adminActions">
                    <button
                      type="button"
                      className="approveButton"
                      onClick={() =>
                        onApproveReview(review)
                      }
                    >
                      ✓ Zatwierdź opinię
                    </button>

                    <button
                      type="button"
                      className="rejectButton"
                      onClick={() =>
                        onRejectReview(review)
                      }
                    >
                      Odrzuć opinię
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === TABS.PENDING_PHOTOS && (
        <section>
          <h2>Zdjęcia do zatwierdzenia</h2>

          {pendingPhotos.length === 0 ? (
            <div className="emptyPhotos">
              <p>
                Nie ma zdjęć do sprawdzenia.
              </p>
            </div>
          ) : (
            <div className="adminList">
              {pendingPhotos.map((photo) => (
                <article
                  className="adminCard"
                  key={`photo-${photo.id}`}
                >
                  <img
                    src={photo.image_url}
                    alt="Zdjęcie oczekujące na zatwierdzenie"
                    className="placeHero"
                  />

                  <p>
                    📍 Miejsce:{" "}
                    <strong>
                      {photo.place_submissions
                        ?.name ||
                        `ID ${photo.place_id}`}
                    </strong>
                  </p>

                  {photo.place_submissions
                    ?.city && (
                    <p>
                      Miejscowość:{" "}
                      {
                        photo
                          .place_submissions
                          .city
                      }
                    </p>
                  )}

                  {photo.profiles?.username && (
                    <p>
                      👤 Autor:{" "}
                      {photo.profiles.username}
                    </p>
                  )}

                  <div className="adminActions">
                    <button
                      type="button"
                      className="approveButton"
                      onClick={() =>
                        onApprovePhoto(photo)
                      }
                    >
                      ✓ Zatwierdź zdjęcie
                    </button>

                    <button
                      type="button"
                      className="rejectButton"
                      onClick={() =>
                        onRejectPhoto(photo)
                      }
                    >
                      Odrzuć zdjęcie
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === TABS.APPROVED_PLACES && (
        <section>
          <h2>Zatwierdzone miejsca</h2>

          {approvedPlaces.length === 0 ? (
            <div className="emptyPhotos">
              <p>
                Nie ma zatwierdzonych miejsc.
              </p>
            </div>
          ) : (
            <div className="adminList">
              {approvedPlaces.map((place) => (
                <article
                  className="adminCard"
                  key={`approved-${place.id}`}
                >
                  {place.image_url && (
                    <img
                      src={place.image_url}
                      alt={place.name}
                      className="placeHero"
                    />
                  )}

                  <h2>{place.name}</h2>

                  <p>
                    📍 Miejscowość: {place.city}
                  </p>

                  <p>
                    🚗 Parking: {place.parking}
                  </p>

                  <p>
                    🐶 Psy: {place.dogs}
                  </p>

                  <p>
                    🏄 Początkujący:{" "}
                    {place.beginner}
                  </p>

                  <p>{place.description}</p>

                  <div className="adminActions">
                    <button
                      type="button"
                      className="approveButton"
                      onClick={() =>
                        onEditPlace(place)
                      }
                    >
                      ✏️ Edytuj miejsce
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default AdminPage;