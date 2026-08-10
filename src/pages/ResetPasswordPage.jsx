import { useState } from "react";

import {
  updatePassword,
} from "../services/authService";

function ResetPasswordPage({
  onBack,
  onSuccess,
}) {
  const [message, setMessage] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const form =
      new FormData(event.currentTarget);

    const password =
      form.get("password");

    const repeatPassword =
      form.get("repeatPassword");

    if (password !== repeatPassword) {
      setMessage(
        "Hasła nie są takie same."
      );

      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      await updatePassword(password);

      setMessage(
        "Hasło zostało zmienione."
      );

      setTimeout(() => {
        onSuccess?.();
      }, 1200);
    } catch (error) {
      setMessage(
        error.message ||
          "Nie udało się zmienić hasła."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="placeDetails">
      <button
        type="button"
        className="backButton"
        onClick={onBack}
      >
        ← Wróć
      </button>

      <h1>Ustaw nowe hasło</h1>

      <p
        style={{
          lineHeight: 1.6,
          color: "#5c6c66",
        }}
      >
        Wpisz nowe hasło do swojego
        konta SUPmap.
      </p>

      <form
        className="addPlaceForm"
        onSubmit={handleSubmit}
      >
        <label>
          Nowe hasło

          <input
            type="password"
            name="password"
            minLength="6"
            required
          />
        </label>

        <label>
          Powtórz nowe hasło

          <input
            type="password"
            name="repeatPassword"
            minLength="6"
            required
          />
        </label>

        <button
          type="submit"
          className="addPlaceButton"
          disabled={submitting}
        >
          {submitting
            ? "Zapisywanie..."
            : "Zmień hasło"}
        </button>

        {message && (
          <p className="formMessage">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

export default ResetPasswordPage;