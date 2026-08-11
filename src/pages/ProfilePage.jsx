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
  onOpenPlace,
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
  onOpenPlace={onOpenPlace}
/>
  );
}

export default ProfilePage;