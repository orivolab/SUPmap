import { useState } from "react";
import {
  signIn,
  signUp,
} from "../services/authService";

function AuthModal({ onClose, onSuccess }) {
  const [register, setRegister] = useState(false);

  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const email = form.get("email");
    const password = form.get("password");
    const username = form.get("username");

    try {
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

  return (
    <div className="placeDetails">
      <button
        className="backButton"
        onClick={onClose}
      >
        ← Wróć
      </button>

      <h1>
        {register
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

        <label>
          Hasło

          <input
            type="password"
            name="password"
            required
          />
        </label>

        <button
          className="addPlaceButton"
          type="submit"
        >
          {register
            ? "Utwórz konto"
            : "Zaloguj"}
        </button>

        <button
          type="button"
          className="adminButton"
          onClick={() =>
            setRegister(!register)
          }
        >
          {register
            ? "Mam już konto"
            : "Załóż konto"}
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

export default AuthModal;