import { useEffect, useMemo, useState } from "react";

import {
  updateProfile,
} from "../services/profileService";

import {
  uploadAvatar,
  removeAvatar,
} from "../services/avatarService";

import {
  acceptFriendRequest,
  getFriendsData,
  removeFriendship,
  searchUsers,
  sendFriendRequest,
} from "../services/friendsService";

import { supabase } from "../lib/supabase";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const PROFILE_TABS = {
  PROFILE: "profile",
  PASSWORD: "password",
  FRIENDS: "friends",
  FAVORITES: "favorites",
};

function UserAvatar({
  avatarUrl,
  username,
  size = 58,
  onClick,
}) {
  const firstLetter =
    String(username || "?")
      .trim()
      .charAt(0)
      .toUpperCase() || "?";

  const clickable = typeof onClick === "function";

  if (avatarUrl) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={!clickable}
        aria-label={
          clickable
            ? `Otwórz profil użytkownika ${username}`
            : `Zdjęcie profilowe użytkownika ${username}`
        }
        style={{
          border: "none",
          padding: 0,
          background: "transparent",
          cursor: clickable ? "pointer" : "default",
          borderRadius: "50%",
          flexShrink: 0,
        }}
      >
        <img
          src={avatarUrl}
          alt={`Zdjęcie profilowe: ${
            username || "użytkownik"
          }`}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: "50%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      aria-label={
        clickable
          ? `Otwórz profil użytkownika ${username}`
          : `Brak zdjęcia profilowego użytkownika ${username}`
      }
      style={{
        width: `${size}px`,
        height: `${size}px`,
        border: "none",
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        background: "#e8f4ef",
        fontSize: `${Math.round(size * 0.42)}px`,
        fontWeight: 700,
        cursor: clickable ? "pointer" : "default",
      }}
    >
      {firstLetter}
    </button>
  );
}

function ProfileModal({
  profile,
  user,
  favorites,
  points,
  level,
  onClose,
  onLogout,
  onOpenPublicProfile,
}) {
  const [activeTab, setActiveTab] = useState(
    PROFILE_TABS.PROFILE
  );

  const [username, setUsername] = useState(
    profile?.username || ""
  );

  const [avatarUrl, setAvatarUrl] = useState(
    profile?.avatar_url || null
  );

  const [avatarFile, setAvatarFile] = useState(null);

  const [profileMessage, setProfileMessage] =
    useState("");

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [friendsMessage, setFriendsMessage] =
    useState("");

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [savingPassword, setSavingPassword] =
    useState(false);

  const [savingAvatar, setSavingAvatar] =
    useState(false);

  const [loadingFriends, setLoadingFriends] =
    useState(true);

  const [friendSearchText, setFriendSearchText] =
    useState("");

  const [
    friendSearchResults,
    setFriendSearchResults,
  ] = useState([]);

  const [friends, setFriends] = useState([]);

  const [
    incomingRequests,
    setIncomingRequests,
  ] = useState([]);

  const [
    outgoingRequests,
    setOutgoingRequests,
  ] = useState([]);

  useEffect(() => {
    setUsername(profile?.username || "");
    setAvatarUrl(profile?.avatar_url || null);
  }, [profile?.username, profile?.avatar_url]);

  useEffect(() => {
    if (user?.id) {
      loadFriends();
    }
  }, [user?.id]);

  const outgoingUserIds = useMemo(() => {
    return new Set(
      outgoingRequests.map(
        (request) => request.receiver_id
      )
    );
  }, [outgoingRequests]);

  const incomingUserIds = useMemo(() => {
    return new Set(
      incomingRequests.map(
        (request) => request.sender_id
      )
    );
  }, [incomingRequests]);

  const friendUserIds = useMemo(() => {
    return new Set(
      friends.map((friendship) =>
        friendship.sender_id === user?.id
          ? friendship.receiver_id
          : friendship.sender_id
      )
    );
  }, [friends, user?.id]);

  if (!user) {
    return null;
  }

  function openPublicProfile(userId) {
    if (!userId || !onOpenPublicProfile) {
      return;
    }

    onOpenPublicProfile(userId);
  }

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
          color: active
            ? "#ffffff"
            : "#263630",
          borderRadius: "999px",
          padding: "11px 18px",
          fontSize: "15px",
          fontWeight: 700,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {label}
        {typeof count === "number"
          ? ` (${count})`
          : ""}
      </button>
    );
  }

  function ClickableUsername({
    userId,
    children,
  }) {
    return (
      <button
        type="button"
        onClick={() =>
          openPublicProfile(userId)
        }
        disabled={
          !userId || !onOpenPublicProfile
        }
        style={{
          border: "none",
          padding: 0,
          background: "transparent",
          color: "inherit",
          font: "inherit",
          fontWeight: 700,
          textAlign: "left",
          cursor:
            userId && onOpenPublicProfile
              ? "pointer"
              : "default",
        }}
      >
        {children}
      </button>
    );
  }

  async function loadFriends() {
    setLoadingFriends(true);

    try {
      const data = await getFriendsData(user.id);

      setFriends(data.friends ?? []);

      setIncomingRequests(
        data.incomingRequests ?? []
      );

      setOutgoingRequests(
        data.outgoingRequests ?? []
      );
    } catch (error) {
      console.error(
        "Błąd pobierania znajomych:",
        error
      );

      setFriendsMessage(
        `Nie udało się pobrać znajomych: ${error.message}`
      );
    } finally {
      setLoadingFriends(false);
    }
  }

  async function handleSaveProfile(event) {
    event.preventDefault();

    const cleanUsername = username.trim();

    if (cleanUsername.length < 2) {
      setProfileMessage(
        "Nazwa użytkownika musi mieć co najmniej 2 znaki."
      );
      return;
    }

    setSavingProfile(true);
    setProfileMessage("Zapisywanie nazwy...");

    try {
      const updatedProfile =
        await updateProfile(user.id, {
          username: cleanUsername,
          avatar_url: avatarUrl,
        });

      setUsername(updatedProfile.username);

      setProfileMessage(
        "Nazwa użytkownika została zmieniona."
      );
    } catch (error) {
      console.error(
        "Błąd zmiany nazwy użytkownika:",
        error
      );

      setProfileMessage(
        `Błąd: ${error.message}`
      );
    } finally {
      setSavingProfile(false);
    }
  }

  function handleAvatarChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      setAvatarFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      event.target.value = "";
      setAvatarFile(null);

      setProfileMessage(
        "Możesz wybrać tylko plik ze zdjęciem."
      );
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      event.target.value = "";
      setAvatarFile(null);

      setProfileMessage(
        "Zdjęcie profilowe może mieć maksymalnie 5 MB."
      );
      return;
    }

    setAvatarFile(file);
    setProfileMessage("");
  }

  async function handleUploadAvatar() {
    if (!avatarFile) {
      setProfileMessage(
        "Najpierw wybierz zdjęcie profilowe."
      );
      return;
    }

    setSavingAvatar(true);

    setProfileMessage(
      "Wysyłanie zdjęcia profilowego..."
    );

    try {
      const newAvatarUrl =
        await uploadAvatar(avatarFile);

      setAvatarUrl(newAvatarUrl);
      setAvatarFile(null);

      setProfileMessage(
        "Zdjęcie profilowe zostało zmienione."
      );
    } catch (error) {
      console.error(
        "Błąd wysyłania zdjęcia profilowego:",
        error
      );

      setProfileMessage(
        `Błąd: ${error.message}`
      );
    } finally {
      setSavingAvatar(false);
    }
  }

  async function handleRemoveAvatar() {
    setSavingAvatar(true);

    setProfileMessage(
      "Usuwanie zdjęcia profilowego..."
    );

    try {
      await removeAvatar();

      setAvatarUrl(null);
      setAvatarFile(null);

      setProfileMessage(
        "Zdjęcie profilowe zostało usunięte."
      );
    } catch (error) {
      console.error(
        "Błąd usuwania zdjęcia profilowego:",
        error
      );

      setProfileMessage(
        `Błąd: ${error.message}`
      );
    } finally {
      setSavingAvatar(false);
    }
  }

  async function handleChangePassword(
    event
  ) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const newPassword = String(
      formData.get("newPassword")
    );

    const repeatedPassword = String(
      formData.get("repeatedPassword")
    );

    if (newPassword.length < 6) {
      setPasswordMessage(
        "Nowe hasło musi mieć co najmniej 6 znaków."
      );
      return;
    }

    if (
      newPassword !== repeatedPassword
    ) {
      setPasswordMessage(
        "Wpisane hasła nie są takie same."
      );
      return;
    }

    setSavingPassword(true);
    setPasswordMessage(
      "Zmienianie hasła..."
    );

    try {
      const { error } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (error) {
        throw error;
      }

      form.reset();

      setPasswordMessage(
        "Hasło zostało zmienione."
      );
    } catch (error) {
      console.error(
        "Błąd zmiany hasła:",
        error
      );

      setPasswordMessage(
        `Nie udało się zmienić hasła: ${error.message}`
      );
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleSearchUsers(
    event
  ) {
    event.preventDefault();

    const query = friendSearchText.trim();

    if (query.length < 2) {
      setFriendsMessage(
        "Wpisz co najmniej 2 znaki nazwy użytkownika."
      );

      setFriendSearchResults([]);
      return;
    }

    setFriendsMessage(
      "Wyszukiwanie użytkowników..."
    );

    try {
      const results = await searchUsers(
        user.id,
        query
      );

      setFriendSearchResults(results);

      setFriendsMessage(
        results.length === 0
          ? "Nie znaleziono użytkowników."
          : ""
      );
    } catch (error) {
      console.error(
        "Błąd wyszukiwania użytkowników:",
        error
      );

      setFriendSearchResults([]);

      setFriendsMessage(
        `Błąd wyszukiwania: ${error.message}`
      );
    }
  }

  async function handleSendFriendRequest(
    receiverId
  ) {
    setFriendsMessage(
      "Wysyłanie zaproszenia..."
    );

    try {
      await sendFriendRequest(receiverId);
      await loadFriends();

      setFriendsMessage(
        "Zaproszenie do znajomych zostało wysłane."
      );
    } catch (error) {
      setFriendsMessage(error.message);
    }
  }

  async function handleAcceptRequest(
    friendshipId
  ) {
    setFriendsMessage(
      "Akceptowanie zaproszenia..."
    );

    try {
      await acceptFriendRequest(
        friendshipId
      );

      await loadFriends();

      setFriendsMessage(
        "Zaproszenie zostało zaakceptowane."
      );
    } catch (error) {
      setFriendsMessage(
        `Błąd: ${error.message}`
      );
    }
  }

  async function handleRemoveFriendship(
    friendshipId,
    successMessage
  ) {
    setFriendsMessage(
      "Zapisywanie zmian..."
    );

    try {
      await removeFriendship(
        friendshipId
      );

      await loadFriends();

      setFriendsMessage(successMessage);
    } catch (error) {
      setFriendsMessage(
        `Błąd: ${error.message}`
      );
    }
  }
  return (
    <div className="placeDetails">
      <button
        type="button"
        className="backButton"
        onClick={onClose}
      >
        ← Wróć
      </button>

      <section
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          marginTop: "24px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        <UserAvatar
          avatarUrl={avatarUrl}
          username={username}
          size={92}
          onClick={() =>
            openPublicProfile(user.id)
          }
        />

        <div>
          <ClickableUsername userId={user.id}>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(32px, 5vw, 48px)",
              }}
            >
              {username || "Mój profil"}
            </h1>
          </ClickableUsername>

          <p
            style={{
              margin: "6px 0 0",
              fontSize: "16px",
              color: "#5c6c66",
            }}
          >
            {user.email}
          </p>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
          gap: "18px",
          marginBottom: "30px",
        }}
      >
        <article
          className="infoCard"
          style={{
            minHeight: "125px",
            display: "grid",
            alignContent: "center",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              margin: "0 0 10px",
              fontSize: "18px",
            }}
          >
            Punkty
          </h3>

          <p
            style={{
              margin: 0,
              fontSize: "25px",
              fontWeight: 800,
            }}
          >
            {points}
          </p>
        </article>

        <article
          className="infoCard"
          style={{
            minHeight: "125px",
            display: "grid",
            alignContent: "center",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              margin: "0 0 10px",
              fontSize: "18px",
            }}
          >
            Poziom
          </h3>

          <p
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 800,
            }}
          >
            {level.icon} {level.name}
          </p>
        </article>

        <article
          className="infoCard"
          style={{
            minHeight: "125px",
            display: "grid",
            alignContent: "center",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              margin: "0 0 10px",
              fontSize: "18px",
            }}
          >
            Znajomi
          </h3>

          <p
            style={{
              margin: 0,
              fontSize: "25px",
              fontWeight: 800,
            }}
          >
            {friends.length}
          </p>
        </article>
      </section>

      <nav
        aria-label="Zakładki profilu"
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "34px",
        }}
      >
        <TabButton
          tab={PROFILE_TABS.PROFILE}
          label="Profil"
        />

        <TabButton
          tab={PROFILE_TABS.PASSWORD}
          label="Hasło"
        />

        <TabButton
          tab={PROFILE_TABS.FRIENDS}
          label="Znajomi"
          count={friends.length}
        />

        <TabButton
          tab={PROFILE_TABS.FAVORITES}
          label="Ulubione"
          count={favorites.length}
        />
      </nav>

      {activeTab === PROFILE_TABS.PROFILE && (
        <section>
          <div
            className="adminCard"
            style={{
              padding: "26px",
              marginBottom: "26px",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                fontSize: "26px",
              }}
            >
              🖼️ Zdjęcie profilowe
            </h2>

            <label
              style={{
                display: "grid",
                gap: "10px",
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              Wybierz nowe zdjęcie

              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "14px",
                  fontSize: "16px",
                  border: "1px solid #d8e2de",
                  borderRadius: "12px",
                  background: "#ffffff",
                }}
              />
            </label>

            <p
              style={{
                fontSize: "15px",
                color: "#5c6c66",
              }}
            >
              Maksymalny rozmiar zdjęcia: 5 MB.
            </p>

            {avatarFile && (
              <p
                style={{
                  fontSize: "16px",
                }}
              >
                Wybrane zdjęcie:{" "}
                <strong>{avatarFile.name}</strong>
              </p>
            )}

            <div
              className="adminActions"
              style={{
                marginTop: "18px",
              }}
            >
              <button
                type="button"
                className="approveButton"
                disabled={
                  savingAvatar || !avatarFile
                }
                onClick={handleUploadAvatar}
              >
                {savingAvatar
                  ? "Zapisywanie..."
                  : "Zmień zdjęcie"}
              </button>

              {avatarUrl && (
                <button
                  type="button"
                  className="rejectButton"
                  disabled={savingAvatar}
                  onClick={handleRemoveAvatar}
                >
                  Usuń zdjęcie
                </button>
              )}
            </div>
          </div>

          <div
            className="adminCard"
            style={{
              padding: "26px",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                fontSize: "26px",
              }}
            >
              ⚙️ Ustawienia profilu
            </h2>

            <form
              onSubmit={handleSaveProfile}
              style={{
                display: "grid",
                gap: "22px",
              }}
            >
              <label
                style={{
                  display: "grid",
                  gap: "10px",
                  fontSize: "18px",
                  fontWeight: 700,
                }}
              >
                Nazwa użytkownika

                <input
                  type="text"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value)
                  }
                  minLength="2"
                  maxLength="60"
                  required
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "15px 16px",
                    fontSize: "17px",
                    fontWeight: 400,
                    border: "1px solid #d8e2de",
                    borderRadius: "12px",
                  }}
                />
              </label>

              <label
                style={{
                  display: "grid",
                  gap: "10px",
                  fontSize: "18px",
                  fontWeight: 700,
                }}
              >
                Adres e-mail

                <input
                  type="email"
                  value={user.email || ""}
                  readOnly
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "15px 16px",
                    fontSize: "17px",
                    fontWeight: 400,
                    border: "1px solid #d8e2de",
                    borderRadius: "12px",
                    background: "#f4f7f6",
                  }}
                />

                <small
                  style={{
                    fontSize: "14px",
                    fontWeight: 400,
                    color: "#5c6c66",
                  }}
                >
                  Adres e-mail służy do logowania.
                </small>
              </label>

              <button
                type="submit"
                className="addPlaceButton"
                disabled={savingProfile}
              >
                {savingProfile
                  ? "Zapisywanie..."
                  : "Zapisz nazwę"}
              </button>
            </form>
          </div>

          {profileMessage && (
            <p className="formMessage">
              {profileMessage}
            </p>
          )}
        </section>
      )}

      {activeTab === PROFILE_TABS.PASSWORD && (
        <section
          className="adminCard"
          style={{
            padding: "26px",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: "26px",
            }}
          >
            🔒 Zmień hasło
          </h2>

          <form
            onSubmit={handleChangePassword}
            style={{
              display: "grid",
              gap: "22px",
            }}
          >
            <label
              style={{
                display: "grid",
                gap: "10px",
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              Nowe hasło

              <input
                type="password"
                name="newPassword"
                placeholder="Minimum 6 znaków"
                minLength="6"
                autoComplete="new-password"
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "15px 16px",
                  fontSize: "17px",
                  fontWeight: 400,
                  border: "1px solid #d8e2de",
                  borderRadius: "12px",
                }}
              />
            </label>

            <label
              style={{
                display: "grid",
                gap: "10px",
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              Powtórz nowe hasło

              <input
                type="password"
                name="repeatedPassword"
                placeholder="Wpisz nowe hasło ponownie"
                minLength="6"
                autoComplete="new-password"
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "15px 16px",
                  fontSize: "17px",
                  fontWeight: 400,
                  border: "1px solid #d8e2de",
                  borderRadius: "12px",
                }}
              />
            </label>

            <button
              type="submit"
              className="addPlaceButton"
              disabled={savingPassword}
            >
              {savingPassword
                ? "Zmienianie..."
                : "Zmień hasło"}
            </button>
          </form>

          {passwordMessage && (
            <p className="formMessage">
              {passwordMessage}
            </p>
          )}
        </section>
      )}

      {activeTab === PROFILE_TABS.FRIENDS && (
        <section>
          <div
            className="adminCard"
            style={{
              padding: "26px",
              marginBottom: "28px",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                fontSize: "26px",
              }}
            >
              🔎 Znajdź użytkownika
            </h2>

            <form
              onSubmit={handleSearchUsers}
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "stretch",
                flexWrap: "wrap",
              }}
            >
              <input
                type="search"
                value={friendSearchText}
                onChange={(event) =>
                  setFriendSearchText(
                    event.target.value
                  )
                }
                placeholder="Wpisz nazwę użytkownika"
                aria-label="Wyszukaj użytkownika"
                style={{
                  flex: "1 1 300px",
                  boxSizing: "border-box",
                  padding: "15px 16px",
                  fontSize: "17px",
                  border: "1px solid #d8e2de",
                  borderRadius: "12px",
                }}
              />

              <button
                type="submit"
                className="addPlaceButton"
                style={{
                  width: "auto",
                  minWidth: "130px",
                }}
              >
                Szukaj
              </button>
            </form>
          </div>

          {friendsMessage && (
            <p className="formMessage">
              {friendsMessage}
            </p>
          )}

          {friendSearchResults.length > 0 && (
            <div
              style={{
                marginBottom: "36px",
              }}
            >
              <h2>Wyniki wyszukiwania</h2>

              <div className="adminList">
                {friendSearchResults.map(
                  (result) => {
                    const alreadyFriend =
                      friendUserIds.has(result.id);

                    const requestSent =
                      outgoingUserIds.has(result.id);

                    const requestReceived =
                      incomingUserIds.has(result.id);

                    return (
                      <article
                        className="adminCard"
                        key={result.id}
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          alignItems: "center",
                          gap: "18px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                          }}
                        >
                          <UserAvatar
                            avatarUrl={
                              result.avatar_url
                            }
                            username={
                              result.username
                            }
                            size={60}
                            onClick={() =>
                              openPublicProfile(
                                result.id
                              )
                            }
                          />

                          <div>
                            <ClickableUsername
                              userId={result.id}
                            >
                              <h3
                                style={{
                                  margin: 0,
                                  fontSize: "20px",
                                }}
                              >
                                {result.username ||
                                  "Użytkownik"}
                              </h3>
                            </ClickableUsername>

                            <p
                              style={{
                                margin: "5px 0 0",
                              }}
                            >
                              {result.points ?? 0} pkt
                            </p>
                          </div>
                        </div>

                        {alreadyFriend ? (
                          <strong>
                            ✓ Znajomy
                          </strong>
                        ) : requestSent ? (
                          <span>
                            Zaproszenie wysłane
                          </span>
                        ) : requestReceived ? (
                          <span>
                            Oczekuje na Twoją odpowiedź
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="approveButton"
                            onClick={() =>
                              handleSendFriendRequest(
                                result.id
                              )
                            }
                          >
                            + Dodaj do znajomych
                          </button>
                        )}
                      </article>
                    );
                  }
                )}
              </div>
            </div>
          )}

          <div
            style={{
              marginBottom: "36px",
            }}
          >
            <h2>
              Zaproszenia do znajomych (
              {incomingRequests.length})
            </h2>

            {loadingFriends ? (
              <div className="emptyPhotos">
                <p>Ładowanie...</p>
              </div>
            ) : incomingRequests.length === 0 ? (
              <div className="emptyPhotos">
                <p>
                  Nie masz nowych zaproszeń.
                </p>
              </div>
            ) : (
              <div className="adminList">
                {incomingRequests.map(
                  (request) => (
                    <article
                      className="adminCard"
                      key={request.id}
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        gap: "18px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                        }}
                      >
                        <UserAvatar
                          avatarUrl={
                            request.profile
                              ?.avatar_url
                          }
                          username={
                            request.profile
                              ?.username
                          }
                          size={60}
                          onClick={() =>
                            openPublicProfile(
                              request.profile?.id ||
                                request.sender_id
                            )
                          }
                        />

                        <ClickableUsername
                          userId={
                            request.profile?.id ||
                            request.sender_id
                          }
                        >
                          <h3
                            style={{
                              margin: 0,
                              fontSize: "20px",
                            }}
                          >
                            {request.profile
                              ?.username ||
                              "Użytkownik"}
                          </h3>
                        </ClickableUsername>
                      </div>

                      <div className="adminActions">
                        <button
                          type="button"
                          className="approveButton"
                          onClick={() =>
                            handleAcceptRequest(
                              request.id
                            )
                          }
                        >
                          ✓ Akceptuj
                        </button>

                        <button
                          type="button"
                          className="rejectButton"
                          onClick={() =>
                            handleRemoveFriendship(
                              request.id,
                              "Zaproszenie zostało odrzucone."
                            )
                          }
                        >
                          Odrzuć
                        </button>
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
          </div>

          <div
            style={{
              marginBottom: "36px",
            }}
          >
            <h2>Moi znajomi ({friends.length})</h2>

            {loadingFriends ? (
              <div className="emptyPhotos">
                <p>Ładowanie...</p>
              </div>
            ) : friends.length === 0 ? (
              <div className="emptyPhotos">
                <p>
                  Nie masz jeszcze znajomych.
                </p>
              </div>
            ) : (
              <div className="adminList">
                {friends.map((friendship) => {
                  const friendId =
                    friendship.profile?.id ||
                    (friendship.sender_id ===
                    user.id
                      ? friendship.receiver_id
                      : friendship.sender_id);

                  return (
                    <article
                      className="adminCard"
                      key={friendship.id}
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        gap: "18px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                        }}
                      >
                        <UserAvatar
                          avatarUrl={
                            friendship.profile
                              ?.avatar_url
                          }
                          username={
                            friendship.profile
                              ?.username
                          }
                          size={60}
                          onClick={() =>
                            openPublicProfile(friendId)
                          }
                        />

                        <div>
                          <ClickableUsername
                            userId={friendId}
                          >
                            <h3
                              style={{
                                margin: 0,
                                fontSize: "20px",
                              }}
                            >
                              {friendship.profile
                                ?.username ||
                                "Użytkownik"}
                            </h3>
                          </ClickableUsername>

                          <p
                            style={{
                              margin: "5px 0 0",
                            }}
                          >
                            {friendship.profile
                              ?.points ?? 0}{" "}
                            pkt
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="rejectButton"
                        onClick={() =>
                          handleRemoveFriendship(
                            friendship.id,
                            "Użytkownik został usunięty ze znajomych."
                          )
                        }
                      >
                        Usuń ze znajomych
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {outgoingRequests.length > 0 && (
            <div>
              <h2>
                Wysłane zaproszenia (
                {outgoingRequests.length})
              </h2>

              <div className="adminList">
                {outgoingRequests.map(
                  (request) => (
                    <article
                      className="adminCard"
                      key={request.id}
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        gap: "18px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                        }}
                      >
                        <UserAvatar
                          avatarUrl={
                            request.profile
                              ?.avatar_url
                          }
                          username={
                            request.profile
                              ?.username
                          }
                          size={60}
                          onClick={() =>
                            openPublicProfile(
                              request.profile?.id ||
                                request.receiver_id
                            )
                          }
                        />

                        <ClickableUsername
                          userId={
                            request.profile?.id ||
                            request.receiver_id
                          }
                        >
                          <h3
                            style={{
                              margin: 0,
                              fontSize: "20px",
                            }}
                          >
                            {request.profile
                              ?.username ||
                              "Użytkownik"}
                          </h3>
                        </ClickableUsername>
                      </div>

                      <button
                        type="button"
                        className="rejectButton"
                        onClick={() =>
                          handleRemoveFriendship(
                            request.id,
                            "Zaproszenie zostało anulowane."
                          )
                        }
                      >
                        Anuluj zaproszenie
                      </button>
                    </article>
                  )
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {activeTab === PROFILE_TABS.FAVORITES && (
        <section>
          <h2
            style={{
              fontSize: "26px",
            }}
          >
            ❤️ Ulubione miejsca
          </h2>

          {favorites.length === 0 ? (
            <div className="emptyPhotos">
              <p>
                Nie masz jeszcze zapisanych miejsc.
              </p>
            </div>
          ) : (
            <div className="adminList">
              {favorites.map((favorite) => (
                <article
                  key={favorite.favoriteId}
                  className="adminCard"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "18px",
                  }}
                >
                  {favorite.place?.image_url && (
                    <img
                      src={
                        favorite.place.image_url
                      }
                      alt={
                        favorite.place.name ||
                        "Ulubione miejsce"
                      }
                      style={{
                        width: "110px",
                        height: "85px",
                        objectFit: "cover",
                        borderRadius: "14px",
                        flexShrink: 0,
                      }}
                    />
                  )}

                  <div>
                    <h3
                      style={{
                        margin: "0 0 7px",
                        fontSize: "21px",
                      }}
                    >
                      {favorite.place?.name ||
                        "Nieznane miejsce"}
                    </h3>

                    {favorite.place?.city && (
                      <p
                        style={{
                          margin: 0,
                        }}
                      >
                        📍 {favorite.place.city}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <button
        type="button"
        className="rejectButton"
        style={{
          marginTop: "42px",
        }}
        onClick={onLogout}
      >
        Wyloguj
      </button>
    </div>
  );
}

export default ProfileModal;