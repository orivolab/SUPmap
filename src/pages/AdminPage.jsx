import { useState } from "react";

const TABS = {
  PENDING_PLACES: "pending-places",
  PENDING_REVIEWS: "pending-reviews",
  PENDING_PHOTOS: "pending-photos",
  APPROVED_PLACES: "approved-places",
};

function AdminPage({
  approvedPlaces,
  pendingPlaces,
  pendingReviews,
  pendingPhotos,
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
}) {
  const [activeTab, setActiveTab] = useState(
    TABS.PENDING_PLACES
  );

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
      </div>

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