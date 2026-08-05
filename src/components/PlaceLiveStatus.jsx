import {
  formatReportAge,
  getLiveSummary,
} from "../services/liveReportsService";

function StatusCard({
  icon,
  label,
  value,
  warning = false,
}) {
  return (
    <article
      className="infoCard"
      style={{
        minHeight: "120px",
        display: "grid",
        alignContent: "center",
        gap: "7px",
        border: warning
          ? "1px solid #e7aaa4"
          : undefined,
        background: warning
          ? "#fff4f2"
          : undefined,
      }}
    >
      <span
        style={{
          fontSize: "26px",
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

      <p
        style={{
          margin: 0,
          fontSize: "17px",
          fontWeight: 700,
        }}
      >
        {value || "Brak informacji"}
      </p>
    </article>
  );
}

function ReportAuthor({
  report,
  onOpenPublicProfile,
}) {
  const profile = report?.profiles;

  if (!profile) {
    return <span>użytkownik SUPMap</span>;
  }

  const content = (
    <>
      {profile.avatar_url && (
        <img
          src={profile.avatar_url}
          alt={profile.username || "Użytkownik"}
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      )}

      <strong>
        {profile.username || "Użytkownik"}
      </strong>
    </>
  );

  if (!onOpenPublicProfile) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
        }}
      >
        {content}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() =>
        onOpenPublicProfile(profile.id)
      }
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        padding: 0,
        border: "none",
        background: "transparent",
        color: "inherit",
        cursor: "pointer",
      }}
    >
      {content}
    </button>
  );
}

function PlaceLiveStatus({
  reports = [],
  loading = false,
  onOpenPublicProfile,
}) {
  const summary = getLiveSummary(reports);
  const latestReport = reports[0] ?? null;

  const algaeWarning =
    summary.algaeStatus === "Podejrzenie sinic" ||
    summary.algaeStatus === "Potwierdzone sinice";

  if (loading) {
    return (
      <section
        className="adminCard"
        style={{
          padding: "26px",
          marginTop: "32px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>
          🔴 Sytuacja na żywo
        </h2>

        <p>Ładowanie aktualnych informacji...</p>
      </section>
    );
  }

  if (reports.length === 0) {
    return (
      <section
        className="adminCard"
        style={{
          padding: "26px",
          marginTop: "32px",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "8px",
            fontSize: "26px",
          }}
        >
          🔴 Sytuacja na żywo
        </h2>

        <p
          style={{
            marginBottom: 0,
            color: "#5c6c66",
            lineHeight: 1.6,
          }}
        >
          Nikt nie dodał jeszcze aktualizacji z
          ostatnich 6 godzin. Osoba będąca na miejscu
          może podać temperaturę wody, liczbę ludzi,
          wiatr, stan parkingu i inne bieżące informacje.
        </p>
      </section>
    );
  }

  return (
    <section
      className="adminCard"
      style={{
        padding: "26px",
        marginTop: "32px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2
            style={{
              margin: "0 0 8px",
              fontSize: "26px",
            }}
          >
            🔴 Sytuacja na żywo
          </h2>

          <p
            style={{
              margin: 0,
              color: "#5c6c66",
            }}
          >
            Dane z aktualizacji dodanych w ciągu
            ostatnich 6 godzin.
          </p>
        </div>

        <span
          style={{
            padding: "9px 13px",
            borderRadius: "999px",
            background: "#e8f4ef",
            fontWeight: 700,
          }}
        >
          {summary.reportsCount}{" "}
          {summary.reportsCount === 1
            ? "aktualizacja"
            : "aktualizacje"}
        </span>
      </div>

      <div
        className="infoGrid"
        style={{
          gridTemplateColumns:
            "repeat(auto-fit, minmax(170px, 1fr))",
        }}
      >
        <StatusCard
          icon="🌡️"
          label="Temperatura wody"
          value={
            summary.waterTemperature !== null
              ? `${summary.waterTemperature}°C`
              : null
          }
        />

        <StatusCard
          icon="👥"
          label="Liczba ludzi"
          value={summary.crowdLevel}
        />

        <StatusCard
          icon="💨"
          label="Wiatr"
          value={summary.windLevel}
        />

        <StatusCard
          icon="🌊"
          label="Stan wody"
          value={summary.waterCondition}
        />

        <StatusCard
          icon="🚗"
          label="Parking"
          value={summary.parkingStatus}
        />

        <StatusCard
          icon="🛟"
          label="Ratownik"
          value={
            summary.lifeguardPresent === null
              ? null
              : summary.lifeguardPresent
                ? "Jest obecny"
                : "Nie ma ratownika"
          }
        />

        <StatusCard
          icon="⚠️"
          label="Sinice"
          value={summary.algaeStatus}
          warning={algaeWarning}
        />
      </div>

      {latestReport && (
        <div
          style={{
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid #dfe7e3",
          }}
        >
          <p
            style={{
              margin: "0 0 9px",
              color: "#5c6c66",
            }}
          >
            Ostatnia aktualizacja:{" "}
            <strong>
              {formatReportAge(
                latestReport.created_at
              )}
            </strong>
            {" · "}
            dodał/a{" "}
            <ReportAuthor
              report={latestReport}
              onOpenPublicProfile={
                onOpenPublicProfile
              }
            />
          </p>

          {latestReport.note && (
            <div
              style={{
                padding: "16px",
                borderRadius: "14px",
                background: "#f4f7f6",
                lineHeight: 1.6,
              }}
            >
              💬 {latestReport.note}
            </div>
          )}
        </div>
      )}

      {algaeWarning && (
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            borderRadius: "14px",
            background: "#fff1ef",
            border: "1px solid #e7aaa4",
            fontWeight: 700,
            lineHeight: 1.5,
          }}
        >
          ⚠️ To zgłoszenie pochodzi od użytkownika i
          nie zastępuje oficjalnego komunikatu o
          przydatności wody do kąpieli.
        </div>
      )}
    </section>
  );
}

export default PlaceLiveStatus;