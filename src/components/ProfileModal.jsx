import { useEffect, useMemo, useState } from "react";

import {
  updateProfile,
  getPointsHistory,
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

import {
  getConversation,
  getConversationList,
  getUnreadMessagesCount,
  markConversationAsRead,
  sendMessage,
} from "../services/messagesService";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const PROFILE_TABS = {
  PROFILE: "profile",
  POINTS: "points",
  PASSWORD: "password",
  FRIENDS: "friends",
  MESSAGES: "messages",
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
    
const [unreadMessagesCount, setUnreadMessagesCount] =
  useState(0);

const [conversationList, setConversationList] =
  useState([]);

const [loadingConversationList, setLoadingConversationList] =
  useState(false);

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
  const [selectedFriend, setSelectedFriend] =
  useState(null);

const [conversationMessages, setConversationMessages] =
  useState([]);

const [messageText, setMessageText] =
  useState("");

const [loadingConversation, setLoadingConversation] =
  useState(false);

const [sendingMessage, setSendingMessage] =
  useState(false);

const [messagesMessage, setMessagesMessage] =
  useState("");
  const [pointsHistory, setPointsHistory] = useState([]);
const [loadingPointsHistory, setLoadingPointsHistory] =
  useState(true);

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

  useEffect(() => {
  if (user?.id) {
    loadUnreadMessagesCount();
  }
}, [user?.id]);

useEffect(() => {
  if (user?.id) {
    loadConversationList();
  }
}, [user?.id]);

  useEffect(() => {
  if (user?.id) {
    loadPointsHistory();
  }
}, [user?.id]);

useEffect(() => {
  if (!user?.id) {
    return undefined;
  }

  const channel = supabase
    .channel(`messages-${user.id}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `receiver_id=eq.${user.id}`,
      },
      async (payload) => {
        const newMessage = payload.new;

        await Promise.all([
          loadUnreadMessagesCount(),
          loadConversationList(),
        ]);

        if (
          selectedFriend?.id &&
          newMessage.sender_id ===
            selectedFriend.id
        ) {
          try {
            const messages =
              await getConversation(
                selectedFriend.id
              );

            setConversationMessages(
              messages ?? []
            );

            await markConversationAsRead(
              selectedFriend.id
            );

            await Promise.all([
              loadUnreadMessagesCount(),
              loadConversationList(),
            ]);
          } catch (error) {
            console.error(
              "Błąd aktualizacji rozmowy na żywo:",
              error
            );
          }
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user?.id, selectedFriend?.id]);

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

  async function loadPointsHistory() {
  if (!user?.id) {
    setPointsHistory([]);
    setLoadingPointsHistory(false);
    return;
  }

  setLoadingPointsHistory(true);

  try {
    const history = await getPointsHistory(
      user.id
    );

    setPointsHistory(history ?? []);
  } catch (error) {
    console.error(
      "Błąd pobierania historii punktów:",
      error
    );

    setPointsHistory([]);
  } finally {
    setLoadingPointsHistory(false);
  }
}

async function handleOpenConversation(friendship) {
  const friendId =
    friendship.profile?.id ||
    (friendship.sender_id === user.id
      ? friendship.receiver_id
      : friendship.sender_id);

  if (!friendId) {
    return;
  }

  setSelectedFriend({
    id: friendId,
    username:
      friendship.profile?.username ||
      "Użytkownik",
    avatar_url:
      friendship.profile?.avatar_url ||
      null,
  });

  setLoadingConversation(true);
  setMessagesMessage("");

  try {
    const messages =
      await getConversation(friendId);

    setConversationMessages(
      messages ?? []
    );

    await markConversationAsRead(
      friendId
    );
    await Promise.all([
  loadUnreadMessagesCount(),
  loadConversationList(),
]);
  } catch (error) {
    console.error(
      "Błąd otwierania rozmowy:",
      error
    );

    setConversationMessages([]);

    setMessagesMessage(
      `Nie udało się otworzyć rozmowy: ${error.message}`
    );
  } finally {
    setLoadingConversation(false);
  }
}

async function handleSendMessage(event) {
  event.preventDefault();

  if (!selectedFriend?.id) {
    return;
  }

  const cleanMessage = messageText.trim();

  if (!cleanMessage) {
    return;
  }

  setSendingMessage(true);
  setMessagesMessage("");

  try {
    await sendMessage(
      selectedFriend.id,
      cleanMessage
    );

    setMessageText("");

    const messages =
      await getConversation(
        selectedFriend.id
      );

    setConversationMessages(
      messages ?? []
    );
    await loadConversationList();
  } catch (error) {
    console.error(
      "Błąd wysyłania wiadomości:",
      error
    );

    setMessagesMessage(
      `Nie udało się wysłać wiadomości: ${error.message}`
    );
  } finally {
    setSendingMessage(false);
  }
}

async function loadUnreadMessagesCount() {
  try {
    const count =
      await getUnreadMessagesCount();

    setUnreadMessagesCount(
      count ?? 0
    );
  } catch (error) {
    console.error(
      "Błąd pobierania liczby nieprzeczytanych wiadomości:",
      error
    );

    setUnreadMessagesCount(0);
  }
}

async function loadConversationList() {
  setLoadingConversationList(true);

  try {
    const conversations =
      await getConversationList();

    setConversationList(
      conversations ?? []
    );
  } catch (error) {
    console.error(
      "Błąd pobierania listy rozmów:",
      error
    );

    setConversationList([]);
  } finally {
    setLoadingConversationList(false);
  }
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
  tab={PROFILE_TABS.POINTS}
  label="Punkty i poziom"
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
  tab={PROFILE_TABS.MESSAGES}
  label={
    unreadMessagesCount > 0
      ? `Wiadomości (${unreadMessagesCount})`
      : "Wiadomości"
  }
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

     {activeTab === PROFILE_TABS.POINTS && (
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
          marginBottom: "10px",
          fontSize: "26px",
        }}
      >
        {level.icon} {level.name}
      </h2>

      <p
        style={{
          margin: 0,
          fontSize: "18px",
          color: "#5c6c66",
        }}
      >
        Masz obecnie <strong>{points} pkt</strong>.
      </p>
    </div>

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
          fontSize: "24px",
        }}
      >
        📈 Postęp do kolejnego poziomu
      </h2>

      {level.nextMinimum ? (
        <>
          <div
            style={{
              width: "100%",
              height: "18px",
              background: "#e8efec",
              borderRadius: "999px",
              overflow: "hidden",
              margin: "18px 0 12px",
            }}
          >
            <div
              style={{
                width: `${Math.min(
                  Math.max(
                    ((points - level.minimum) /
                      (level.nextMinimum -
                        level.minimum)) *
                      100,
                    0
                  ),
                  100
                )}%`,
                height: "100%",
                background: "#287b63",
                borderRadius: "999px",
              }}
            />
          </div>

          <p
            style={{
              margin: 0,
              fontSize: "16px",
            }}
          >
            Do kolejnego poziomu brakuje Ci{" "}
            <strong>
              {Math.max(
                level.nextMinimum - points,
                0
              )}{" "}
              pkt
            </strong>
            .
          </p>
        </>
      ) : (
        <p
          style={{
            margin: 0,
            fontSize: "16px",
          }}
        >
          Masz najwyższy poziom. 🏆
        </p>
      )}
    </div>

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
          fontSize: "24px",
        }}
      >
        🎯 Jak zdobywać punkty?
      </h2>

      <div
        style={{
          display: "grid",
          gap: "14px",
          marginTop: "18px",
        }}
      >
        <div>
          📍 Zaakceptowane miejsce —{" "}
          <strong>+50 pkt</strong>
        </div>

        <div>
          📷 Zaakceptowane zdjęcie —{" "}
          <strong>+15 pkt</strong>
        </div>

        <div>
          ⭐ Zaakceptowana opinia —{" "}
          <strong>+10 pkt</strong>
        </div>
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
          fontSize: "24px",
        }}
      >
        🏅 Poziomy
      </h2>

      <div
        style={{
          display: "grid",
          gap: "12px",
          marginTop: "18px",
        }}
      >
        {[
          {
            name: "Nowy użytkownik",
            icon: "🌱",
            minimum: 0,
          },
          {
            name: "Początkujący odkrywca",
            icon: "🏄",
            minimum: 50,
          },
          {
            name: "Odkrywca jezior",
            icon: "🧭",
            minimum: 200,
          },
          {
            name: "Ekspert SUP",
            icon: "🌊",
            minimum: 500,
          },
          {
            name: "Legenda SUP",
            icon: "🏆",
            minimum: 1000,
          },
        ].map((item) => {
          const isCurrent =
            item.name === level.name;

          return (
            <div
              key={item.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "14px",
                padding: "14px 16px",
                borderRadius: "12px",
                border: isCurrent
                  ? "2px solid #287b63"
                  : "1px solid #e1e8e5",
                background: isCurrent
                  ? "#eef8f4"
                  : "#ffffff",
              }}
            >
              <div>
                <strong>
                  {item.icon} {item.name}
                </strong>

                <div
                  style={{
                    marginTop: "4px",
                    fontSize: "14px",
                    color: "#6b7a75",
                  }}
                >
                  od {item.minimum} pkt
                </div>
              </div>

              {isCurrent && (
                <span
                  style={{
                    padding: "6px 10px",
                    borderRadius: "999px",
                    background: "#287b63",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  Twój poziom
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>

    <div
      className="adminCard"
      style={{
        padding: "26px",
        marginTop: "26px",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          fontSize: "24px",
        }}
      >
        🧾 Historia punktów
      </h2>

      {loadingPointsHistory ? (
        <p>Ładowanie historii punktów...</p>
      ) : pointsHistory.length === 0 ? (
        <p
          style={{
            marginBottom: 0,
            color: "#5c6c66",
          }}
        >
          Nie masz jeszcze historii zdobytych punktów.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "12px",
            marginTop: "18px",
          }}
        >
          {pointsHistory.map((event) => {
            let label = "Zdobyte punkty";
            let icon = "⭐";

            if (event.source_type === "place") {
              label = "Zaakceptowane miejsce";
              icon = "📍";
            }

            if (event.source_type === "photo") {
              label = "Zaakceptowane zdjęcie";
              icon = "📷";
            }

            if (event.source_type === "review") {
              label = "Zaakceptowana opinia";
              icon = "⭐";
            }

            const date = event.created_at
              ? new Date(
                  event.created_at
                ).toLocaleDateString("pl-PL", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "";

            return (
              <div
                key={event.id}
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  gap: "16px",
                  padding: "14px 0",
                  borderBottom:
                    "1px solid #e5ece9",
                }}
              >
                <div>
                  <strong>
                    {icon} {label}
                  </strong>

                  {date && (
                    <div
                      style={{
                        marginTop: "4px",
                        fontSize: "14px",
                        color: "#6b7a75",
                      }}
                    >
                      {date}
                    </div>
                  )}
                </div>

                <strong
                  style={{
                    whiteSpace: "nowrap",
                  }}
                >
                  +{event.points} pkt
                </strong>
              </div>
            );
          })}
        </div>
      )}
    </div>
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

                      <div
  style={{
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  }}
>
  <button
    type="button"
    className="approveButton"
    onClick={() =>
      handleOpenConversation(
        friendship
      )
    }
  >
    💬 Napisz wiadomość
  </button>

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
</div>
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

{activeTab === PROFILE_TABS.MESSAGES && (
  <section>
    <h2
      style={{
        fontSize: "26px",
        marginTop: 0,
      }}
    >
      💬 Wiadomości
    </h2>

    {loadingConversationList ? (
      <div className="emptyPhotos">
        <p>Ładowanie rozmów...</p>
      </div>
    ) : conversationList.length === 0 ? (
      <div className="emptyPhotos">
        <p>
          Nie masz jeszcze żadnych rozmów.
        </p>
      </div>
    ) : (
      <div className="adminList">
        {conversationList.map(
          (conversation) => {
            const friend =
              friends.find(
                (friendship) => {
                  const friendId =
                    friendship.profile?.id ||
                    (friendship.sender_id ===
                    user.id
                      ? friendship.receiver_id
                      : friendship.sender_id);

                  return (
                    friendId ===
                    conversation.otherUserId
                  );
                }
              );

            const profile =
              friend?.profile ?? null;

            const lastMessage =
              conversation.lastMessage;

            const received =
              lastMessage.receiver_id ===
              user.id;

            const unread =
              received &&
              !lastMessage.is_read;

            const date =
              lastMessage.created_at
                ? new Date(
                    lastMessage.created_at
                  ).toLocaleString("pl-PL", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";

            return (
              <article
                key={
                  conversation.otherUserId
                }
                className="adminCard"
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (friend) {
                    handleOpenConversation(
                      friend
                    );
                  }
                }}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();

                    if (friend) {
                      handleOpenConversation(
                        friend
                      );
                    }
                  }
                }}
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  gap: "16px",
                  cursor: friend
                    ? "pointer"
                    : "default",
                  border: unread
                    ? "2px solid #287b63"
                    : undefined,
                  background: unread
                    ? "#f2faf7"
                    : undefined,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    minWidth: 0,
                  }}
                >
                  <UserAvatar
                    avatarUrl={
                      profile?.avatar_url
                    }
                    username={
                      profile?.username ||
                      "Użytkownik"
                    }
                    size={56}
                  />

                  <div
                    style={{
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <strong
                        style={{
                          fontSize: "18px",
                        }}
                      >
                        {profile?.username ||
                          "Użytkownik"}
                      </strong>

                      {unread && (
                        <span
                          style={{
                            background:
                              "#287b63",
                            color:
                              "#ffffff",
                            borderRadius:
                              "999px",
                            padding:
                              "3px 8px",
                            fontSize:
                              "12px",
                            fontWeight:
                              700,
                          }}
                        >
                          Nowa
                        </span>
                      )}
                    </div>

                    <p
                      style={{
                        margin:
                          "5px 0 0",
                        color:
                          "#5c6c66",
                        overflow:
                          "hidden",
                        textOverflow:
                          "ellipsis",
                        whiteSpace:
                          "nowrap",
                        maxWidth:
                          "420px",
                      }}
                    >
                      {lastMessage.sender_id ===
                      user.id
                        ? "Ty: "
                        : ""}
                      {
                        lastMessage.content
                      }
                    </p>
                  </div>
                </div>

                {date && (
                  <span
                    style={{
                      fontSize:
                        "13px",
                      color:
                        "#6b7a75",
                      flexShrink: 0,
                    }}
                  >
                    {date}
                  </span>
                )}
              </article>
            );
          }
        )}
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
{selectedFriend && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.35)",
      display: "grid",
      placeItems: "center",
      padding: "20px",
      zIndex: 1000,
    }}
    onClick={() => {
      setSelectedFriend(null);
      setConversationMessages([]);
      setMessageText("");
      setMessagesMessage("");
    }}
  >
    <section
      className="adminCard"
      style={{
        width: "min(720px, 100%)",
        maxHeight: "85vh",
        display: "grid",
        gridTemplateRows: "auto minmax(0, 1fr) auto",
        padding: 0,
        overflow: "hidden",
      }}
      onClick={(event) =>
        event.stopPropagation()
      }
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          padding: "18px 20px",
          borderBottom: "1px solid #e1e8e5",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <UserAvatar
            avatarUrl={selectedFriend.avatar_url}
            username={selectedFriend.username}
            size={48}
          />

          <div>
            <strong
              style={{
                display: "block",
                fontSize: "18px",
              }}
            >
              {selectedFriend.username}
            </strong>

            <span
              style={{
                fontSize: "13px",
                color: "#6b7a75",
              }}
            >
              Prywatna rozmowa
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedFriend(null);
            setConversationMessages([]);
            setMessageText("");
            setMessagesMessage("");
          }}
          style={{
            border: "none",
            background: "transparent",
            fontSize: "24px",
            cursor: "pointer",
            lineHeight: 1,
          }}
          aria-label="Zamknij rozmowę"
        >
          ×
        </button>
      </div>

      <div
        style={{
          overflowY: "auto",
          padding: "20px",
          background: "#f7faf8",
        }}
      >
        {loadingConversation ? (
          <p>Ładowanie rozmowy...</p>
        ) : conversationMessages.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#6b7a75",
            }}
          >
            <p
              style={{
                margin: 0,
              }}
            >
              Nie macie jeszcze żadnych wiadomości.
            </p>

            <p
              style={{
                margin: "7px 0 0",
                fontSize: "14px",
              }}
            >
              Napisz pierwszą wiadomość.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "12px",
            }}
          >
            {conversationMessages.map(
              (message) => {
                const mine =
                  message.sender_id === user.id;

                const date =
                  message.created_at
                    ? new Date(
                        message.created_at
                      ).toLocaleString("pl-PL", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "";

                return (
                  <div
                    key={message.id}
                    style={{
                      display: "flex",
                      justifyContent: mine
                        ? "flex-end"
                        : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "78%",
                        padding: "11px 14px",
                        borderRadius: mine
                          ? "16px 16px 4px 16px"
                          : "16px 16px 16px 4px",
                        background: mine
                          ? "#287b63"
                          : "#ffffff",
                        color: mine
                          ? "#ffffff"
                          : "#263630",
                        border: mine
                          ? "none"
                          : "1px solid #dfe7e3",
                        overflowWrap: "anywhere",
                      }}
                    >
                      <div
                        style={{
                          whiteSpace: "pre-wrap",
                          lineHeight: 1.5,
                        }}
                      >
                        {message.content}
                      </div>

                      {date && (
                        <div
                          style={{
                            marginTop: "5px",
                            fontSize: "11px",
                            opacity: 0.75,
                            textAlign: "right",
                          }}
                        >
                          {date}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

        {messagesMessage && (
          <p
            className="formMessage"
            style={{
              marginBottom: 0,
            }}
          >
            {messagesMessage}
          </p>
        )}
      </div>

      <form
  onSubmit={handleSendMessage}
  style={{
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1fr) auto",
    gap: "10px",
    padding: "16px",
    borderTop: "1px solid #e1e8e5",
    background: "#ffffff",
    alignItems: "stretch",
  }}
>
  <textarea
    value={messageText}
    onChange={(event) =>
      setMessageText(event.target.value)
    }
    placeholder="Napisz wiadomość..."
    maxLength={2000}
    rows={2}
    style={{
      width: "100%",
      minWidth: 0,
      boxSizing: "border-box",
      resize: "none",
      padding: "12px 14px",
      border: "1px solid #d8e2de",
      borderRadius: "12px",
      font: "inherit",
      lineHeight: 1.4,
    }}
  />

  <button
    type="submit"
    className="approveButton"
    disabled={
      sendingMessage ||
      !messageText.trim()
    }
    style={{
      width: "auto",
      minWidth: "92px",
      padding: "0 16px",
      margin: 0,
      alignSelf: "stretch",
      whiteSpace: "nowrap",
    }}
  >
    {sendingMessage
      ? "..."
      : "Wyślij"}
  </button>
</form>
    </section>
  </div>
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