import ProfileModal from "../components/ProfileModal";

function ProfilePage({
  profile,
  user,
  favorites,
  points,
  level,
  initialTab,
  onBack,
  onLogout,
  onOpenPublicProfile,
}) {
  return (
    <ProfileModal
      profile={profile}
      user={user}
      favorites={favorites}
      points={points}
      level={level}
      initialTab={initialTab}
      onClose={onBack}
      onLogout={onLogout}
      onOpenPublicProfile={onOpenPublicProfile}
    />
  );
}

export default ProfilePage;