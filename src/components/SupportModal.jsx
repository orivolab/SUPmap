import {
  useEffect,
  useState,
} from "react";

import {
  submitSupportTicket,
} from "../services/supportService";

const SUPPORT_CATEGORIES = [
  "🐞 Błąd aplikacji",
  "📍 Problem z miejscem",
  "📷 Problem ze zdjęciem",
  "🚨 Nieodpowiednia treść",
  "💡 Pomysł na nową funkcję",
  "❓ Pytanie",
  "✉️ Inne",
];

function SupportModal({
  user,
  onClose,
}) {
  const [
    category,
    setCategory,
  ] = useState(
    SUPPORT_CATEGORIES[0]
  );

  const [
    subject,
    setSubject,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState(
    user?.email || ""
  );

  const [
    screenshot,
    setScreenshot,
  ] = useState(null);

  const [
    screenshotPreview,
    setScreenshotPreview,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    formMessage,
    setFormMessage,
  ] = useState("");

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (screenshotPreview) {
        URL.revokeObjectURL(
          screenshotPreview
        );
      }
    };
  }, [screenshotPreview]);

  function handleScreenshotChange(
    event
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      setScreenshot(null);
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setFormMessage(
        "Załącznik musi być zdjęciem."
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setFormMessage(
        "Zrzut ekranu może mieć maksymalnie 10 MB."
      );

      event.target.value = "";
      return;
    }

    if (screenshotPreview) {
      URL.revokeObjectURL(
        screenshotPreview
      );
    }

    setScreenshot(file);

    setScreenshotPreview(
      URL.createObjectURL(file)
    );

    setFormMessage("");
  }

  function removeScreenshot() {
    if (screenshotPreview) {
      URL.revokeObjectURL(
        screenshotPreview
      );
    }

    setScreenshot(null);
    setScreenshotPreview("");
  }

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setSubmitting(true);
    setFormMessage(
      "Wysyłanie zgłoszenia..."
    );

    try {
      await submitSupportTicket({
        category,
        subject,
        message,
        email,
        screenshot,
      });

      setFormMessage(
        "✅ Dziękujemy! Zgłoszenie zostało wysłane."
      );

      setCategory(
        SUPPORT_CATEGORIES[0]
      );

      setSubject("");
      setMessage("");
      setScreenshot(null);

      if (screenshotPreview) {
        URL.revokeObjectURL(
          screenshotPreview
        );
      }

      setScreenshotPreview("");
    } catch (error) {
      console.error(
        "Błąd wysyłania zgłoszenia:",
        error
      );

      setFormMessage(
        `Błąd: ${error.message}`
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Kontakt i pomoc"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose?.();
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 6000,
        display: "grid",
        placeItems: "center",
        padding: "20px",
        background:
          "rgba(15, 24, 21, 0.72)",
      }}
    >
      <div
        style={{
          width:
            "min(680px, 100%)",
          maxHeight:
            "calc(100vh - 40px)",
          overflowY: "auto",
          borderRadius: "22px",
          background: "#ffffff",
          boxShadow:
            "0 24px 70px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "flex-start",
            gap: "16px",
            padding:
              "22px 22px 14px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "27px",
              }}
            >
              💬 Kontakt i pomoc
            </h2>

            <p
              style={{
                margin:
                  "8px 0 0",
                color: "#5c6c66",
                lineHeight: 1.55,
              }}
            >
              Masz problem, pytanie albo
              pomysł? Napisz do nas.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij"
            style={{
              width: "38px",
              height: "38px",
              border:
                "1px solid #d8e2de",
              borderRadius: "50%",
              background: "#ffffff",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gap: "18px",
            padding:
              "10px 22px 24px",
          }}
        >
          <label
            style={{
              display: "grid",
              gap: "8px",
              fontWeight: 700,
            }}
          >
            Kategoria

            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
              style={{
                padding: "13px 14px",
                border:
                  "1px solid #d8e2de",
                borderRadius: "12px",
                background: "#ffffff",
                font: "inherit",
              }}
            >
              {SUPPORT_CATEGORIES.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </label>

          <label
            style={{
              display: "grid",
              gap: "8px",
              fontWeight: 700,
            }}
          >
            Temat

            <input
              type="text"
              value={subject}
              onChange={(event) =>
                setSubject(
                  event.target.value
                )
              }
              minLength="3"
              maxLength="120"
              placeholder="Krótko opisz problem"
              required
              style={{
                padding: "13px 14px",
                border:
                  "1px solid #d8e2de",
                borderRadius: "12px",
                font: "inherit",
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
            Opis

            <textarea
              value={message}
              onChange={(event) =>
                setMessage(
                  event.target.value
                )
              }
              minLength="10"
              maxLength="3000"
              rows="6"
              placeholder="Napisz dokładnie, co się dzieje"
              required
              style={{
                padding: "13px 14px",
                border:
                  "1px solid #d8e2de",
                borderRadius: "12px",
                resize: "vertical",
                font: "inherit",
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
            E-mail — opcjonalnie

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="kontakt@example.com"
              style={{
                padding: "13px 14px",
                border:
                  "1px solid #d8e2de",
                borderRadius: "12px",
                font: "inherit",
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
            Zrzut ekranu — opcjonalnie

            <input
              type="file"
              accept="image/*"
              onChange={
                handleScreenshotChange
              }
            />

            <small
              style={{
                color: "#5c6c66",
              }}
            >
              Maksymalnie 10 MB.
            </small>
          </label>

          {screenshotPreview && (
            <div
              style={{
                display: "grid",
                gap: "10px",
                justifyItems: "start",
              }}
            >
              <img
                src={screenshotPreview}
                alt="Podgląd zrzutu ekranu"
                style={{
                  width:
                    "min(100%, 420px)",
                  maxHeight: "360px",
                  objectFit: "contain",
                  borderRadius: "14px",
                  border:
                    "1px solid #d8e2de",
                }}
              />

              <button
                type="button"
                className="backButton"
                onClick={
                  removeScreenshot
                }
              >
                Usuń załącznik
              </button>
            </div>
          )}

          {formMessage && (
            <p
              className="formMessage"
              style={{
                margin: 0,
              }}
            >
              {formMessage}
            </p>
          )}

          <div
            style={{
              display: "flex",
              justifyContent:
                "flex-end",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              className="backButton"
              onClick={onClose}
              disabled={submitting}
            >
              Anuluj
            </button>

            <button
              type="submit"
              className="addPlaceButton"
              style={{
                width: "auto",
              }}
              disabled={submitting}
            >
              {submitting
                ? "Wysyłanie..."
                : "Wyślij zgłoszenie"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SupportModal;