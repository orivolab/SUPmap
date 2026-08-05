import { useEffect, useMemo, useState } from "react";

import {
  formatWeatherDate,
  formatWeatherTime,
  getPlaceWeather,
  getUpcomingHours,
  getWindStrengthLabel,
} from "../services/weatherService";

function WeatherValueCard({
  icon,
  label,
  value,
  description,
}) {
  return (
    <article
      className="infoCard"
      style={{
        minHeight: "125px",
        display: "grid",
        alignContent: "center",
        gap: "7px",
      }}
    >
      <span
        style={{
          fontSize: "27px",
        }}
      >
        {icon}
      </span>

      <h3
        style={{
          margin: 0,
          fontSize: "16px",
        }}
      >
        {label}
      </h3>

      <strong
        style={{
          fontSize: "18px",
          lineHeight: 1.4,
        }}
      >
        {value ?? "Brak danych"}
      </strong>

      {description && (
        <small
          style={{
            color: "#5c6c66",
            lineHeight: 1.4,
          }}
        >
          {description}
        </small>
      )}
    </article>
  );
}

function AssessmentCard({ assessment }) {
  if (!assessment) {
    return null;
  }

  const styles = {
    good: {
      background: "#edf8f3",
      border: "#a8d9c5",
    },

    caution: {
      background: "#fffbea",
      border: "#ead88c",
    },

    warning: {
      background: "#fff4e8",
      border: "#e7bd8b",
    },

    danger: {
      background: "#fff1ef",
      border: "#e7aaa4",
    },
  };

  const selectedStyle =
    styles[assessment.status] ??
    styles.caution;

  return (
    <div
      style={{
        marginTop: "22px",
        padding: "18px",
        borderRadius: "16px",
        background:
          selectedStyle.background,
        border: `1px solid ${selectedStyle.border}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
        }}
      >
        <span
          style={{
            fontSize: "25px",
          }}
        >
          {assessment.icon}
        </span>

        <div>
          <strong
            style={{
              display: "block",
              marginBottom: "5px",
              fontSize: "18px",
            }}
          >
            {assessment.label}
          </strong>

          <p
            style={{
              margin: 0,
              lineHeight: 1.55,
            }}
          >
            {assessment.message}
          </p>
        </div>
      </div>
    </div>
  );
}

function HourlyForecast({ hours }) {
  if (!hours?.length) {
    return (
      <div className="emptyPhotos">
        <p>
          Brak prognozy godzinowej.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridAutoFlow: "column",
        gridAutoColumns: "minmax(145px, 1fr)",
        gap: "12px",
        overflowX: "auto",
        paddingBottom: "10px",
      }}
    >
      {hours.map((hour) => (
        <article
          key={hour.time}
          className="infoCard"
          style={{
            minWidth: "145px",
            textAlign: "center",
            display: "grid",
            gap: "7px",
          }}
        >
          <strong>
            {formatWeatherTime(
              hour.time
            )}
          </strong>

          <span
            style={{
              fontSize: "27px",
            }}
          >
            {hour.weatherIcon}
          </span>

          <strong
            style={{
              fontSize: "20px",
            }}
          >
            {hour.temperature !== null
              ? `${hour.temperature}°C`
              : "—"}
          </strong>

          <small>
            💨{" "}
            {hour.windSpeed !== null
              ? `${hour.windSpeed} km/h`
              : "brak danych"}
          </small>

          <small>
            🌧️{" "}
            {hour.precipitationProbability !==
            null
              ? `${hour.precipitationProbability}%`
              : "brak danych"}
          </small>
        </article>
      ))}
    </div>
  );
}

function DailyForecast({ days }) {
  if (!days?.length) {
    return null;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "14px",
      }}
    >
      {days.map((day) => (
        <article
          key={day.date}
          className="infoCard"
          style={{
            display: "grid",
            gap: "8px",
          }}
        >
          <strong
            style={{
              fontSize: "17px",
              textTransform: "capitalize",
            }}
          >
            {formatWeatherDate(
              day.date
            )}
          </strong>

          <span
            style={{
              fontSize: "27px",
            }}
          >
            {day.weatherIcon}
          </span>

          <strong>
            {day.weatherLabel}
          </strong>

          <p
            style={{
              margin: 0,
            }}
          >
            🌡️{" "}
            {day.temperatureMin !== null
              ? `${day.temperatureMin}°C`
              : "—"}
            {" / "}
            {day.temperatureMax !== null
              ? `${day.temperatureMax}°C`
              : "—"}
          </p>

          <p
            style={{
              margin: 0,
            }}
          >
            🌧️{" "}
            {day.precipitationProbabilityMax !==
            null
              ? `${day.precipitationProbabilityMax}%`
              : "brak danych"}
          </p>

          <p
            style={{
              margin: 0,
            }}
          >
            💨{" "}
            {day.windSpeedMax !== null
              ? `${day.windSpeedMax} km/h`
              : "brak danych"}
          </p>

          <small>
            🌅{" "}
            {formatWeatherTime(
              day.sunrise
            )}
            {" · "}
            🌇{" "}
            {formatWeatherTime(
              day.sunset
            )}
          </small>
        </article>
      ))}
    </div>
  );
}

function WeatherCard({
  latitude,
  longitude,
}) {
  const [weather, setWeather] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    loadWeather();
  }, [latitude, longitude]);

  const upcomingHours = useMemo(
    () =>
      getUpcomingHours(
        weather,
        12
      ),
    [weather]
  );

  async function loadWeather(
    forceRefresh = false
  ) {
    if (
      latitude === null ||
      latitude === undefined ||
      longitude === null ||
      longitude === undefined
    ) {
      setLoading(false);

      setMessage(
        "To miejsce nie ma zapisanych współrzędnych potrzebnych do pobrania pogody."
      );

      return;
    }

    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setMessage("");

    try {
      const data =
        await getPlaceWeather({
          latitude,
          longitude,
          forceRefresh,
        });

      setWeather(data);
    } catch (error) {
      console.error(
        "Błąd pobierania pogody:",
        error
      );

      setWeather(null);

      setMessage(
        `Nie udało się pobrać pogody: ${error.message}`
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  if (loading) {
    return (
      <section
        className="adminCard"
        style={{
          padding: "26px",
          marginTop: "32px",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            fontSize: "26px",
          }}
        >
          🌤️ Pogoda
        </h2>

        <p>
          Pobieranie aktualnej pogody...
        </p>
      </section>
    );
  }

  if (!weather) {
    return (
      <section
        className="adminCard"
        style={{
          padding: "26px",
          marginTop: "32px",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            fontSize: "26px",
          }}
        >
          🌤️ Pogoda
        </h2>

        <p className="formMessage">
          {message ||
            "Brak danych pogodowych."}
        </p>

        <button
          type="button"
          className="approveButton"
          onClick={() =>
            loadWeather(true)
          }
        >
          Spróbuj ponownie
        </button>
      </section>
    );
  }

  const current = weather.current;
  const today = weather.daily?.[0];

  return (
    <section
      className="adminCard"
      style={{
        padding: "26px",
        marginTop: "32px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "flex-start",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2
            style={{
              margin: "0 0 8px",
              fontSize: "26px",
            }}
          >
            🌤️ Pogoda
          </h2>

          <p
            style={{
              margin: 0,
              color: "#5c6c66",
              lineHeight: 1.5,
            }}
          >
            Automatyczna prognoza dla
            dokładnej lokalizacji miejsca.
          </p>
        </div>

        <button
          type="button"
          className="backButton"
          disabled={refreshing}
          onClick={() =>
            loadWeather(true)
          }
        >
          {refreshing
            ? "Odświeżanie..."
            : "↻ Odśwież pogodę"}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: "54px",
          }}
        >
          {current.weatherIcon}
        </span>

        <div>
          <strong
            style={{
              display: "block",
              fontSize: "34px",
            }}
          >
            {current.temperature !== null
              ? `${current.temperature}°C`
              : "Brak temperatury"}
          </strong>

          <p
            style={{
              margin: "5px 0 0",
              fontSize: "17px",
            }}
          >
            {current.weatherLabel}
          </p>
        </div>
      </div>

      <div
        className="infoGrid"
        style={{
          gridTemplateColumns:
            "repeat(auto-fit, minmax(170px, 1fr))",
        }}
      >
        <WeatherValueCard
          icon="🌡️"
          label="Odczuwalna"
          value={
            current.apparentTemperature !==
            null
              ? `${current.apparentTemperature}°C`
              : null
          }
        />

        <WeatherValueCard
          icon="💨"
          label="Wiatr"
          value={
            current.windSpeed !== null
              ? `${current.windSpeed} km/h`
              : null
          }
          description={
            current.windSpeed !== null
              ? getWindStrengthLabel(
                  current.windSpeed
                )
              : null
          }
        />

        <WeatherValueCard
          icon="🧭"
          label="Kierunek wiatru"
          value={
            current.windDirectionLabel
          }
          description={
            current.windDirection !== null
              ? `${current.windDirection}°`
              : null
          }
        />

        <WeatherValueCard
          icon="🌬️"
          label="Porywy"
          value={
            current.windGusts !== null
              ? `${current.windGusts} km/h`
              : null
          }
        />

        <WeatherValueCard
          icon="🌧️"
          label="Opady"
          value={
            current.precipitation !== null
              ? `${current.precipitation} mm`
              : null
          }
        />

        <WeatherValueCard
          icon="☁️"
          label="Zachmurzenie"
          value={
            current.cloudCover !== null
              ? `${current.cloudCover}%`
              : null
          }
        />

        <WeatherValueCard
          icon="🌅"
          label="Wschód słońca"
          value={formatWeatherTime(
            today?.sunrise
          )}
        />

        <WeatherValueCard
          icon="🌇"
          label="Zachód słońca"
          value={formatWeatherTime(
            today?.sunset
          )}
        />
      </div>

      <AssessmentCard
        assessment={weather.assessment}
      />

      <section
        style={{
          marginTop: "34px",
        }}
      >
        <h3
          style={{
            fontSize: "22px",
          }}
        >
          Prognoza na najbliższe godziny
        </h3>

        <HourlyForecast
          hours={upcomingHours}
        />
      </section>

      <section
        style={{
          marginTop: "34px",
        }}
      >
        <h3
          style={{
            fontSize: "22px",
          }}
        >
          Prognoza na 3 dni
        </h3>

        <DailyForecast
          days={weather.daily}
        />
      </section>

      {message && (
        <p className="formMessage">
          {message}
        </p>
      )}

      <p
        style={{
          margin: "24px 0 0",
          fontSize: "13px",
          color: "#5c6c66",
          lineHeight: 1.5,
        }}
      >
        Prognoza pogody nie zastępuje
        oceny warunków bezpośrednio nad
        wodą. Przed wypłynięciem sprawdź
        również raporty użytkowników.
      </p>
    </section>
  );
}

export default WeatherCard;