import { useState } from "react";
import {
  signIn,
  signUp,
  resetPassword,
} from "../services/authService";

function AuthModal({ onClose, onSuccess }) {
  const [register, setRegister] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const email = form.get("email");
    const password = form.get("password");
    const username = form.get("username");

    try {
      setMessage("");

      if (forgotPassword) {
        await resetPassword(email);

        setMessage(
          "Wysłaliśmy link do zmiany hasła na podany adres e-mail."
        );

        return;
      }

      if (register) {
        await signUp({
          email,
          password,
          username,
        });

        setMessage(
          "Konto utworzone. Możesz się zalogować."
        );

        setRegister(false);

        return;
      }

      await signIn(email, password);

      onSuccess?.();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function showLogin() {
    setRegister(false);
    setForgotPassword(false);
    setMessage("");
  }

  function showRegister() {
    setRegister(true);
    setForgotPassword(false);
    setMessage("");
  }

  function showForgotPassword() {
    setRegister(false);
    setForgotPassword(true);
    setMessage("");
  }

  return (
    <div className="placeDetails">
      <button
        className="backButton"
        onClick={onClose}
      >
        ← Wróć
      </button>

      <h1>
        {forgotPassword
          ? "Zresetuj hasło"
          : register
          ? "Załóż konto"
          : "Logowanie"}
      </h1>

      <form
        className="addPlaceForm"
        onSubmit={handleSubmit}
      >
        {register && (
          <label>
            Nazwa użytkownika

            <input
              name="username"
              required
            />
          </label>
        )}

        <label>
          E-mail

          <input
            type="email"
            name="email"
            required
          />
        </label>

        {!forgotPassword && (
          <label>
            Hasło

            <input
              type="password"
              name="password"
              required
            />
          </label>
        )}

        <button
          className="addPlaceButton"
          type="submit"
        >
          {forgotPassword
            ? "Wyślij link do zmiany hasła"
            : register
            ? "Utwórz konto"
            : "Zaloguj"}
        </button>

        {forgotPassword ? (
          <button
            type="button"
            className="adminButton"
            onClick={showLogin}
          >
            Wróć do logowania
          </button>
        ) : register ? (
          <button
            type="button"
            className="adminButton"
            onClick={showLogin}
          >
            Mam już konto
          </button>
        ) : (
          <>
            <button
              type="button"
              className="adminButton"
              onClick={showForgotPassword}
            >
              Nie pamiętam hasła
            </button>

            <button
              type="button"
              className="adminButton"
              onClick={showRegister}
            >
              Załóż konto
            </button>
          </>
        )}

        {message && (
          <p className="formMessage">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

export default AuthModal;