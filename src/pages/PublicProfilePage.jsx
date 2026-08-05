import { useEffect, useState } from "react";
import { getPublicProfile } from "../services/publicProfileService";
import { getUserLevel } from "../services/profileService";

function PublicProfilePage({
  userId,
  currentUser,
  onBack,
}) {
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState(
    "Ładowanie profilu..."
  );

  useEffect(() => {
    async function loadProfile() {
      if (!userId) {
        setMessage("Nie wybrano użytkownika.");
        return;
      }

      try {
        const data = await getPublicProfile(userId);

        setProfile(data);
        setMessage("");
      } catch (error) {
        console.error(
          "Błąd pobierania publicznego profilu:",
          error
        );

        setMessage(
          `Nie udało się otworzyć profilu: ${error.message}`
        );
      }
    }

    loadProfile();
  }, [userId]);

  if (!profile) {
    return (
      <div className="placeDetails">
        <button
          type="button"
          className="backButton"
          onClick={onBack}
        >
          ← Wróć
        </button>

        <div className="emptyPhotos">
          <p>{message}</p>
        </div>
      </div>
    );
  }

  const points = Number(profile.points) || 0;
  const level = getUserLevel(points);

  const firstLetter =
    String(profile.username || "?")
      .trim()
      .charAt(0)
      .toUpperCase() || "?";

  return (
    <div className="placeDetails">
      <button
        type="button"
        className="backButton"
        onClick={onBack}
      >
        ← Wróć
      </button>

      <section
        style={{
          display: "flex",
          alignItems: "center",
          gap: "22px",
          marginTop: "28px",
          marginBottom: "32px",
          flexWrap: "wrap",
        }}
      >
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.username}
            style={{
              width: "110px",
              height: "110px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "110px",
              height: "110px",
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: "#e8f4ef",
              fontSize: "42px",
              fontWeight: 800,
            }}
          >
            {firstLetter}
          </div>
        )}

        <div>
          <h1 style={{ margin: "0 0 8px" }}>
            {profile.username || "Użytkownik"}
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            {level.icon} {level.name}
          </p>

          {currentUser?.id === profile.id && (
            <p style={{ marginTop: "10px" }}>
              To jest Twój profil.
            </p>
          )}
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
          gap: "18px",
        }}
      >
        <article
          className="infoCard"
          style={{ textAlign: "center" }}
        >
          <h3>Punkty</h3>
          <p
            style={{
              fontSize: "26px",
              fontWeight: 800,
            }}
          >
            {points}
          </p>
        </article>

        <article
          className="infoCard"
          style={{ textAlign: "center" }}
        >
          <h3>Poziom</h3>
          <p
            style={{
              fontSize: "18px",
              fontWeight: 800,
            }}
          >
            {level.icon} {level.name}
          </p>
        </article>
      </section>
    </div>
  );
}

export default PublicProfilePage;