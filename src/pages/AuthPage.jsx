import AuthModal from "../components/AuthModal";

function AuthPage({
  onBack,
  onSuccess,
}) {
  return (
    <AuthModal
      onClose={onBack}
      onSuccess={onSuccess}
    />
  );
}

export default AuthPage;