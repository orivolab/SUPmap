import {
  useEffect,
  useMemo,
  useState,
} from "react";

function getValueParts(value) {
  if (!value) {
    return {
      date: "",
      hour: "",
      minute: "",
    };
  }

  const [datePart, timePart = ""] =
    String(value).split("T");

  const [hourPart = "", minutePart = ""] =
    timePart.split(":");

  return {
    date: datePart,
    hour: hourPart,
    minute: minutePart,
  };
}

function DateTimePicker({
  value,
  onChange,
  max,
}) {
  const initialParts =
    getValueParts(value);

  const [date, setDate] = useState(
    initialParts.date
  );

  const [hour, setHour] = useState(
    initialParts.hour
  );

  const [minute, setMinute] = useState(
    initialParts.minute
  );

  const maxParts = useMemo(
    () => getValueParts(max),
    [max]
  );

  const hours = useMemo(
    () =>
      Array.from(
        { length: 24 },
        (_, index) =>
          String(index).padStart(2, "0")
      ),
    []
  );

  const minutes = useMemo(
    () =>
      Array.from(
        { length: 60 },
        (_, index) =>
          String(index).padStart(2, "0")
      ),
    []
  );

  useEffect(() => {
    const parts =
      getValueParts(value);

    setDate(parts.date);
    setHour(parts.hour);
    setMinute(parts.minute);
  }, [value]);

  function emitChange({
    nextDate = date,
    nextHour = hour,
    nextMinute = minute,
  }) {
    if (
      !nextDate ||
      nextHour === "" ||
      nextMinute === ""
    ) {
      return;
    }

    onChange?.(
      `${nextDate}T${nextHour}:${nextMinute}`
    );
  }

  function handleDateChange(event) {
    const nextDate =
      event.target.value;

    setDate(nextDate);

    let nextHour = hour;
    let nextMinute = minute;

    if (
      maxParts.date &&
      nextDate === maxParts.date &&
      nextHour &&
      maxParts.hour &&
      Number(nextHour) >
        Number(maxParts.hour)
    ) {
      nextHour = maxParts.hour;
      nextMinute =
        maxParts.minute || "00";

      setHour(nextHour);
      setMinute(nextMinute);
    }

    emitChange({
      nextDate,
      nextHour,
      nextMinute,
    });
  }

  function handleHourChange(event) {
    const nextHour =
      event.target.value;

    let nextMinute = minute;

    if (
      date === maxParts.date &&
      nextHour === maxParts.hour &&
      nextMinute &&
      maxParts.minute &&
      Number(nextMinute) >
        Number(maxParts.minute)
    ) {
      nextMinute =
        maxParts.minute;

      setMinute(nextMinute);
    }

    setHour(nextHour);

    emitChange({
      nextHour,
      nextMinute,
    });
  }

  function handleMinuteChange(event) {
    const nextMinute =
      event.target.value;

    setMinute(nextMinute);

    emitChange({
      nextMinute,
    });
  }

  const availableHours =
    date === maxParts.date &&
    maxParts.hour
      ? hours.filter(
          (item) =>
            Number(item) <=
            Number(maxParts.hour)
        )
      : hours;

  const availableMinutes =
    date === maxParts.date &&
    hour === maxParts.hour &&
    maxParts.minute
      ? minutes.filter(
          (item) =>
            Number(item) <=
            Number(maxParts.minute)
        )
      : minutes;

  const fieldStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px",
    border:
      "1px solid #d8e2de",
    borderRadius: "12px",
    fontSize: "16px",
    background: "#ffffff",
  };

  const labelStyle = {
    display: "grid",
    gap: "8px",
    fontWeight: 700,
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "16px",
      }}
    >
      <label style={labelStyle}>
        📅 Data

        <input
          type="date"
          value={date}
          max={maxParts.date || undefined}
          onChange={
            handleDateChange
          }
          required
          style={fieldStyle}
        />
      </label>

      <label style={labelStyle}>
        🕒 Godzina

        <select
          value={hour}
          onChange={
            handleHourChange
          }
          required
          style={fieldStyle}
        >
          <option value="">
            Wybierz
          </option>

          {availableHours.map(
            (item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            )
          )}
        </select>
      </label>

      <label style={labelStyle}>
        Minuty

        <select
          value={minute}
          onChange={
            handleMinuteChange
          }
          required
          style={fieldStyle}
        >
          <option value="">
            Wybierz
          </option>

          {availableMinutes.map(
            (item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            )
          )}
        </select>
      </label>
    </div>
  );
}

export default DateTimePicker;