function StarRating({
  value,
  onChange,
  disabled = false,
  size = 30,
}) {
  return (
    <div
      aria-label={`Ocena: ${value} z 5`}
      style={{
        display: "flex",
        gap: "6px",
        marginTop: "8px",
        marginBottom: "8px",
      }}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange?.(star)}
          aria-label={`${star} gwiazdek`}
          style={{
            border: "none",
            background: "transparent",
            padding: 0,
            fontSize: `${size}px`,
            lineHeight: 1,
            cursor: disabled ? "default" : "pointer",
            opacity: star <= value ? 1 : 0.25,
          }}
        >
          ⭐
        </button>
      ))}
    </div>
  );
}

export default StarRating;