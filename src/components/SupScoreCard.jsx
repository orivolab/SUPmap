import {
  getSupScoreExplanation,
  getSupScoreLabel,
} from "../services/supScoreService";

function getScoreAppearance(score, status) {
  if (
    score === null ||
    score === undefined ||
    status === "insufficient"
  ) {
    return {
      background: "#f4f7f6",
      border: "#d8e2de",
      accent: "#6f7f79",
      icon: "❔",
    };
  }

  if (score >= 80) {
    return {
      background: "#edf8f3",
      border: "#a8d9c5",
      accent: "#287b63",
      icon: "🟢",
    };
  }

  if (score >= 55) {
    return {
      background: "#fffbea",
      border: "#ead88c",
      accent: "#8a7518",
      icon: "🟡",
    };
  }

  return {
    background: "#fff1ef",
    border: "#e7aaa4",
    accent: "#a7463e",
    icon: "🔴",
  };
}

function CategoryRow({ category }) {
  const score = category.available
    ? category.score
    : null;

  return (
    <article
      style={{
        padding: "15px 0",
        borderBottom: "1px solid #e4ebe8",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          marginBottom: "9px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: "21px",
              flexShrink: 0,
            }}
          >
            {category.icon}
          </span>

          <strong
            style={{
              fontSize: "16px",
            }}
          >
            {category.label}
          </strong>
        </div>

        <strong
          style={{
            fontSize: "17px",
            flexShrink: 0,
          }}
        >
          {score === null
            ? "Brak danych"
            : `${score}/100`}
        </strong>
      </div>

      <div
        style={{
          height: "9px",
          borderRadius: "999px",
          background: "#e8eeeb",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width:
              score === null
                ? "0%"
                : `${score}%`,
            height: "100%",
            borderRadius: "999px",
            background:
              score === null
                ? "#d5ded9"
                : score >= 80
                  ? "#287b63"
                  : score >= 55
                    ? "#c3a72c"
                    : "#b95349",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </article>
  );
}

function SourceCard({
  icon,
  value,
  label,
}) {
  return (
    <article
      className="infoCard"
      style={{
        minHeight: "105px",
        display: "grid",
        alignContent: "center",
        textAlign: "center",
        gap: "6px",
      }}
    >
      <span
        style={{
          fontSize: "23px",
        }}
      >
        {icon}
      </span>

      <strong
        style={{
          fontSize: "23px",
        }}
      >
        {value}
      </strong>

      <span
        style={{
          fontSize: "14px",
          color: "#5c6c66",
        }}
      >
        {label}
      </span>
    </article>
  );
}

function SupScoreCard({ result }) {
  if (!result) {
    return null;
  }

  const score =
    result.score === null ||
    result.score === undefined
      ? null
      : Number(result.score);

  const appearance =
    getScoreAppearance(
      score,
      result.status
    );

  const explanation =
    getSupScoreExplanation(result);

  const label =
    score === null
      ? "Brak wyniku"
      : getSupScoreLabel(score);

  const dataSources =
    result.dataSources ?? {};

  const categories =
    result.categories ?? [];

  return (
    <section
      className="adminCard"
      style={{
        padding: "26px",
        marginTop: "32px",
        border: `1px solid ${appearance.border}`,
        background: appearance.background,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "24px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 7px",
              color: appearance.accent,
              fontWeight: 800,
              fontSize: "14px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Ocena miejsca dla SUP
          </p>

          <h2
            style={{
              margin: "0 0 8px",
              fontSize: "28px",
            }}
          >
            ⭐ SUP Score
          </h2>

          <p
            style={{
              margin: 0,
              color: "#5c6c66",
              lineHeight: 1.55,
              maxWidth: "600px",
            }}
          >
            Automatyczna ocena oparta na
            informacjach o miejscu, opiniach,
            potwierdzeniach i aktualizacjach
            użytkowników.
          </p>
        </div>

        <div
          style={{
            minWidth: "190px",
            textAlign: "center",
            padding: "20px 24px",
            borderRadius: "20px",
            background: "#ffffff",
            border: `1px solid ${appearance.border}`,
          }}
        >
          <span
            style={{
              display: "block",
              fontSize: "28px",
              marginBottom: "5px",
            }}
          >
            {appearance.icon}
          </span>

          <strong
            style={{
              display: "block",
              fontSize: "40px",
              lineHeight: 1.1,
              color: appearance.accent,
            }}
          >
            {score === null
              ? "—"
              : score}
          </strong>

          <span
            style={{
              display: "block",
              marginTop: "2px",
              fontWeight: 700,
            }}
          >
            {score === null
              ? ""
              : "/ 100"}
          </span>
        </div>
      </div>

      <div
        style={{
          marginTop: "24px",
          padding: "18px",
          borderRadius: "16px",
          background: "#ffffff",
          border: `1px solid ${appearance.border}`,
        }}
      >
        <strong
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "20px",
            color: appearance.accent,
          }}
        >
          {result.statusLabel}
        </strong>

        <p
          style={{
            margin: 0,
            lineHeight: 1.55,
          }}
        >
          {label}
        </p>
      </div>

      <section
        style={{
          marginTop: "28px",
        }}
      >
        <h3
          style={{
            marginBottom: "15px",
            fontSize: "21px",
          }}
        >
          Wiarygodność wyniku
        </h3>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "14px",
            marginBottom: "9px",
          }}
        >
          <span>
            Uzupełnienie danych
          </span>

          <strong>
            {result.confidence ?? 0}%
          </strong>
        </div>

        <div
          style={{
            height: "12px",
            borderRadius: "999px",
            background: "#dfe7e3",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${Math.min(
                Math.max(
                  Number(
                    result.confidence
                  ) || 0,
                  0
                ),
                100
              )}%`,
              height: "100%",
              borderRadius: "999px",
              background: appearance.accent,
            }}
          />
        </div>
      </section>

      <section
        style={{
          marginTop: "30px",
        }}
      >
        <h3
          style={{
            fontSize: "21px",
          }}
        >
          Dane użyte do obliczenia
        </h3>

        <div
          className="infoGrid"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(150px, 1fr))",
          }}
        >
          <SourceCard
            icon="💬"
            value={
              dataSources.reviewsCount ??
              0
            }
            label="Opinie"
          />

          <SourceCard
            icon="✅"
            value={
              dataSources.verificationsCount ??
              0
            }
            label="Potwierdzenia"
          />

          <SourceCard
            icon="🔴"
            value={
              dataSources.liveReportsCount ??
              0
            }
            label="Aktualizacje"
          />

          <SourceCard
            icon="📋"
            value={`${
              dataSources.completedFields ??
              0
            }/${
              dataSources.totalFields ?? 0
            }`}
            label="Uzupełnione pola"
          />
        </div>
      </section>

      <section
        style={{
          marginTop: "34px",
        }}
      >
        <h3
          style={{
            marginBottom: "5px",
            fontSize: "22px",
          }}
        >
          Kategorie SUP Score
        </h3>

        <p
          style={{
            marginTop: 0,
            color: "#5c6c66",
            lineHeight: 1.5,
          }}
        >
          Wynik końcowy powstaje z dostępnych
          kategorii. Brak danych w jednej kategorii
          nie obniża automatycznie oceny.
        </p>

        <div
          style={{
            marginTop: "18px",
            padding: "0 18px",
            borderRadius: "16px",
            background: "#ffffff",
            border: `1px solid ${appearance.border}`,
          }}
        >
          {categories.map((category) => (
            <CategoryRow
              key={category.key}
              category={category}
            />
          ))}
        </div>
      </section>

      <div
        style={{
          marginTop: "26px",
          padding: "17px",
          borderRadius: "14px",
          background: "#ffffff",
          lineHeight: 1.6,
        }}
      >
        <strong>
          Jak powstał ten wynik?
        </strong>

        <p
          style={{
            margin: "7px 0 0",
          }}
        >
          {explanation}
        </p>
      </div>

      {result.status ===
        "insufficient" && (
        <div
          style={{
            marginTop: "18px",
            padding: "16px",
            borderRadius: "14px",
            background: "#fffbea",
            border: "1px solid #ead88c",
            lineHeight: 1.55,
          }}
        >
          ℹ️ Wynik pojawi się po uzupełnieniu
          większej liczby informacji lub dodaniu
          opinii, raportów i potwierdzeń przez
          społeczność.
        </div>
      )}

      {result.status ===
        "preliminary" && (
        <div
          style={{
            marginTop: "18px",
            padding: "16px",
            borderRadius: "14px",
            background: "#fffbea",
            border: "1px solid #ead88c",
            lineHeight: 1.55,
          }}
        >
          ℹ️ To jest wynik wstępny. Może się
          zmienić, gdy pojawi się więcej opinii,
          potwierdzeń i aktualnych raportów.
        </div>
      )}
    </section>
  );
}

export default SupScoreCard;