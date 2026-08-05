import {
  formatStatisticsDate,
} from "../services/statisticsService";

function StatisticCard({
  icon,
  value,
  label,
  description,
}) {
  return (
    <article
      className="infoCard"
      style={{
        minHeight: "108px",
        display: "grid",
        alignContent: "center",
        gap: "5px",
        textAlign: "center",
        padding: "16px",
      }}
    >
      <span
        style={{
          fontSize: "22px",
          lineHeight: 1,
        }}
      >
        {icon}
      </span>

      <strong
        style={{
          fontSize: "20px",
          lineHeight: 1.15,
        }}
      >
        {value}
      </strong>

      <span
        style={{
          fontSize: "14px",
          fontWeight: 700,
          lineHeight: 1.25,
        }}
      >
        {label}
      </span>

      {description && (
        <small
          style={{
            color: "#5c6c66",
            fontSize: "12px",
            lineHeight: 1.35,
          }}
        >
          {description}
        </small>
      )}
    </article>
  );
}

function PlaceStatistics({
  statistics,
}) {
  const safeStatistics = {
    reviewsCount: 0,
    averageRating: null,
    photosCount: 0,
    liveReportsCount: 0,
    visitsCount: 0,
    uniqueVisitorsCount: 0,
    favoritesCount: 0,
    verificationsCount: 0,
    uniqueRecentVerifiersCount: 0,
    lastLiveReportAt: null,
    lastVerificationAt: null,
    communityVerified: false,
    hasFreshLiveData: false,
    hasActiveWarnings: false,
    ...statistics,
  };

  const averageRating =
    safeStatistics.averageRating === null ||
    safeStatistics.averageRating === undefined
      ? "Brak"
      : `${safeStatistics.averageRating}/5`;

  return (
    <section
      className="adminCard"
      style={{
        padding: "22px",
        marginTop: "28px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <div>
          <h2
            style={{
              margin: "0 0 6px",
              fontSize: "23px",
            }}
          >
            📊 Statystyki miejsca
          </h2>

          <p
            style={{
              margin: 0,
              color: "#5c6c66",
              fontSize: "14px",
              lineHeight: 1.5,
            }}
          >
            Dane o aktywności społeczności,
            wizytach i aktualności informacji.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {safeStatistics.communityVerified && (
            <span
              style={{
                padding: "7px 11px",
                borderRadius: "999px",
                background: "#e8f4ef",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              ✅ Zweryfikowane
            </span>
          )}

          {safeStatistics.hasFreshLiveData && (
            <span
              style={{
                padding: "7px 11px",
                borderRadius: "999px",
                background: "#fff1ef",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              🔴 Dane na żywo
            </span>
          )}

          {safeStatistics.hasActiveWarnings && (
            <span
              style={{
                padding: "7px 11px",
                borderRadius: "999px",
                background: "#fff4e8",
                border: "1px solid #e7bd8b",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              ⚠️ Ostrzeżenie
            </span>
          )}
        </div>
      </div>

      <div
        className="infoGrid"
        style={{
          gridTemplateColumns:
            "repeat(auto-fit, minmax(145px, 1fr))",
          gap: "14px",
        }}
      >
        <StatisticCard
          icon="⭐"
          value={averageRating}
          label="Średnia ocen"
          description={
            safeStatistics.reviewsCount > 0
              ? `${safeStatistics.reviewsCount} ${
                  safeStatistics.reviewsCount === 1
                    ? "opinia"
                    : "opinii"
                }`
              : "Brak opinii"
          }
        />

        <StatisticCard
          icon="💬"
          value={safeStatistics.reviewsCount}
          label="Opinie"
        />

        <StatisticCard
          icon="📷"
          value={safeStatistics.photosCount}
          label="Zdjęcia"
        />

        <StatisticCard
          icon="🔴"
          value={safeStatistics.liveReportsCount}
          label="Aktualizacje"
          description={
            safeStatistics.hasFreshLiveData
              ? "Są świeże dane"
              : "Brak świeżych danych"
          }
        />

        <StatisticCard
          icon="✅"
          value={safeStatistics.visitsCount}
          label="Wizyty"
        />

        <StatisticCard
          icon="👥"
          value={safeStatistics.uniqueVisitorsCount}
          label="Odwiedzający"
        />

        <StatisticCard
          icon="❤️"
          value={safeStatistics.favoritesCount}
          label="Ulubione"
        />

        <StatisticCard
          icon="✔️"
          value={safeStatistics.verificationsCount}
          label="Potwierdzenia"
          description={`${safeStatistics.uniqueRecentVerifiersCount} osób w 30 dni`}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "14px",
          marginTop: "20px",
        }}
      >
        <article
          style={{
            padding: "15px",
            borderRadius: "14px",
            background: "#f4f7f6",
          }}
        >
          <strong
            style={{
              display: "block",
              marginBottom: "5px",
              fontSize: "15px",
            }}
          >
            🕒 Ostatni raport na żywo
          </strong>

          <p
            style={{
              margin: 0,
              fontSize: "14px",
              lineHeight: 1.45,
            }}
          >
            {formatStatisticsDate(
              safeStatistics.lastLiveReportAt
            )}
          </p>
        </article>

        <article
          style={{
            padding: "15px",
            borderRadius: "14px",
            background: "#f4f7f6",
          }}
        >
          <strong
            style={{
              display: "block",
              marginBottom: "5px",
              fontSize: "15px",
            }}
          >
            📅 Ostatnie potwierdzenie
          </strong>

          <p
            style={{
              margin: 0,
              fontSize: "14px",
              lineHeight: 1.45,
            }}
          >
            {formatStatisticsDate(
              safeStatistics.lastVerificationAt
            )}
          </p>
        </article>
      </div>

      <p
        style={{
          margin: "18px 0 0",
          fontSize: "12px",
          color: "#5c6c66",
          lineHeight: 1.45,
        }}
      >
        Liczby aktualizują się automatycznie po dodaniu
        opinii, zdjęć, wizyt, raportów i potwierdzeń.
      </p>
    </section>
  );
}

export default PlaceStatistics;