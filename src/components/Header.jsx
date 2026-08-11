function Header({
  user,
  profile,
  isAdmin,
  pendingCount,
  unreadMessagesCount,
  unreadNotificationsCount,
  onOpenAdmin,
  onOpenAuth,
  onOpenProfile,
  onOpenMessages,
  onOpenNotifications,
  onAddPlace,
  onGoHome,
}) {
  return (
    <header className="topbar">
      <button
        type="button"
        className="logo"
        onClick={onGoHome}
      >
        <span className="logoIcon">🌊</span>
        <span>SUPmap</span>
      </button>

      <div className="headerActions">
        {isAdmin && (
          <button
            type="button"
            className="adminButton"
            onClick={onOpenAdmin}
          >
            Panel administratora
            {pendingCount > 0
              ? ` (${pendingCount})`
              : ""}
          </button>
        )}

        {user ? (
  <>
    <button
      type="button"
      className="adminButton"
      onClick={onOpenProfile}
    >
      👤 {profile?.username || "Mój profil"}
    </button>

<button
  type="button"
  className="adminButton"
  onClick={onOpenMessages}
  aria-label="Wiadomości"
  style={{
    position: "relative",
    minWidth: "48px",
  }}
>
  💬

  {unreadMessagesCount > 0 && (
    <span
      style={{
        position: "absolute",
        top: "-7px",
        right: "-7px",
        minWidth: "20px",
        height: "20px",
        padding: "0 5px",
        borderRadius: "999px",
        background: "#287b63",
        color: "#ffffff",
        display: "grid",
        placeItems: "center",
        fontSize: "12px",
        fontWeight: 800,
        border: "2px solid #ffffff",
        boxSizing: "border-box",
      }}
    >
      {unreadMessagesCount > 99
        ? "99+"
        : unreadMessagesCount}
    </span>
  )}
</button>

    <button
      type="button"
      className="adminButton"
      onClick={onOpenNotifications}
      aria-label="Powiadomienia"
      style={{
        position: "relative",
        minWidth: "48px",
      }}
    >
      🔔

      {unreadNotificationsCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: "-7px",
            right: "-7px",
            minWidth: "20px",
            height: "20px",
            padding: "0 5px",
            borderRadius: "999px",
            background: "#287b63",
            color: "#ffffff",
            display: "grid",
            placeItems: "center",
            fontSize: "12px",
            fontWeight: 800,
            border: "2px solid #ffffff",
            boxSizing: "border-box",
          }}
        >
          {unreadNotificationsCount > 99
            ? "99+"
            : unreadNotificationsCount}
        </span>
      )}
    </button>
  </>
) : (
          <button
            type="button"
            className="adminButton"
            onClick={onOpenAuth}
          >
            Zaloguj się
          </button>
        )}

        <button
          type="button"
          className="addPlaceButton"
          onClick={onAddPlace}
        >
          + Dodaj miejsce
        </button>
      </div>
    </header>
  );
}

export default Header;