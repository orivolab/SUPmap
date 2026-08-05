import {
  useState,
} from "react";

import SupportModal from "./SupportModal";

function SupportWidget({
  user,
}) {
  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() =>
          setModalOpen(true)
        }
        aria-label="Otwórz kontakt i pomoc"
        style={{
          position: "fixed",
          right: "22px",
          bottom: "22px",
          zIndex: 4500,
          display: "flex",
          alignItems: "center",
          gap: "9px",
          border: "none",
          borderRadius: "999px",
          padding: "13px 19px",
          background: "#287b63",
          color: "#ffffff",
          boxShadow:
            "0 10px 28px rgba(21, 73, 57, 0.28)",
          font: "inherit",
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            fontSize: "19px",
          }}
        >
          💬
        </span>

        Pomoc
      </button>

      {modalOpen && (
        <SupportModal
          user={user}
          onClose={() =>
            setModalOpen(false)
          }
        />
      )}
    </>
  );
}

export default SupportWidget;