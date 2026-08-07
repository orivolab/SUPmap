function MessageModal({
  open,
  type = "success",
  title,
  message,
  onClose,
}) {
  if (!open) {
    return null;
  }

  const isError = type === "error";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(18, 38, 32, 0.55)",
        display: "grid",
        placeItems: "center",
        padding: "20px",
        boxSizing: "border-box",
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        style={{
          width: "min(430px, 100%)",
          background: "#ffffff",
          borderRadius: "22px",
          padding: "30px",
          boxSizing: "border-box",
          textAlign: "center",
          boxShadow:
            "0 20px 60px rgba(0, 0, 0, 0.22)",
        }}
      >
        <div
          style={{
            fontSize: "46px",
            marginBottom: "12px",
          }}
        >
          {isError ? "❌" : "✅"}
        </div>

        <h2
          style={{
            margin: "0 0 10px",
            fontSize: "24px",
          }}
        >
          {title ||
            (isError
              ? "Coś poszło nie tak"
              : "Gotowe!")}
        </h2>

        <p
          style={{
            margin: "0 0 24px",
            color: "#5c6c66",
            lineHeight: 1.6,
            fontSize: "16px",
          }}
        >
          {message}
        </p>

        <button
          type="button"
          className="addPlaceButton"
          onClick={onClose}
          style={{
            width: "100%",
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}

export default MessageModal;