function Header({
  user,
  profile,
  isAdmin,
  pendingCount,
  onOpenAdmin,
  onOpenAuth,
  onOpenProfile,
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
          <button
            type="button"
            className="adminButton"
            onClick={onOpenProfile}
          >
            👤 {profile?.username || "Mój profil"}
          </button>
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