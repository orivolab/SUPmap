const WEATHER_API_URL =
  "https://api.open-meteo.com/v1/forecast";

const CACHE_DURATION_MS =
  15 * 60 * 1000;

const weatherCache = new Map();

const WEATHER_CODES = {
  0: {
    label: "Bezchmurnie",
    icon: "☀️",
  },
  1: {
    label: "Przeważnie bezchmurnie",
    icon: "🌤️",
  },
  2: {
    label: "Częściowe zachmurzenie",
    icon: "⛅",
  },
  3: {
    label: "Pochmurno",
    icon: "☁️",
  },
  45: {
    label: "Mgła",
    icon: "🌫️",
  },
  48: {
    label: "Mgła osadzająca szadź",
    icon: "🌫️",
  },
  51: {
    label: "Lekka mżawka",
    icon: "🌦️",
  },
  53: {
    label: "Umiarkowana mżawka",
    icon: "🌦️",
  },
  55: {
    label: "Silna mżawka",
    icon: "🌧️",
  },
  56: {
    label: "Lekka marznąca mżawka",
    icon: "🌧️",
  },
  57: {
    label: "Silna marznąca mżawka",
    icon: "🌧️",
  },
  61: {
    label: "Lekki deszcz",
    icon: "🌦️",
  },
  63: {
    label: "Umiarkowany deszcz",
    icon: "🌧️",
  },
  65: {
    label: "Silny deszcz",
    icon: "🌧️",
  },
  66: {
    label: "Lekki marznący deszcz",
    icon: "🌧️",
  },
  67: {
    label: "Silny marznący deszcz",
    icon: "🌧️",
  },
  71: {
    label: "Lekki śnieg",
    icon: "🌨️",
  },
  73: {
    label: "Umiarkowany śnieg",
    icon: "🌨️",
  },
  75: {
    label: "Silny śnieg",
    icon: "❄️",
  },
  77: {
    label: "Ziarna śnieżne",
    icon: "🌨️",
  },
  80: {
    label: "Lekkie przelotne opady",
    icon: "🌦️",
  },
  81: {
    label: "Umiarkowane przelotne opady",
    icon: "🌧️",
  },
  82: {
    label: "Silne przelotne opady",
    icon: "⛈️",
  },
  85: {
    label: "Lekkie przelotne opady śniegu",
    icon: "🌨️",
  },
  86: {
    label: "Silne przelotne opady śniegu",
    icon: "❄️",
  },
  95: {
    label: "Burza",
    icon: "⛈️",
  },
  96: {
    label: "Burza z lekkim gradem",
    icon: "⛈️",
  },
  99: {
    label: "Burza z silnym gradem",
    icon: "⛈️",
  },
};

function roundValue(
  value,
  digits = 0
) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  const multiplier =
    10 ** digits;

  return (
    Math.round(number * multiplier) /
    multiplier
  );
}

function isValidCoordinate(value) {
  return Number.isFinite(
    Number(value)
  );
}

function createCacheKey(
  latitude,
  longitude
) {
  return [
    Number(latitude).toFixed(4),
    Number(longitude).toFixed(4),
  ].join(",");
}

function getCachedWeather(cacheKey) {
  const cached =
    weatherCache.get(cacheKey);

  if (!cached) {
    return null;
  }

  const stillValid =
    Date.now() - cached.savedAt <
    CACHE_DURATION_MS;

  if (!stillValid) {
    weatherCache.delete(cacheKey);
    return null;
  }

  return cached.data;
}

function saveWeatherToCache(
  cacheKey,
  data
) {
  weatherCache.set(cacheKey, {
    savedAt: Date.now(),
    data,
  });
}

export function getWeatherDescription(
  weatherCode
) {
  const code = Number(weatherCode);

  return (
    WEATHER_CODES[code] ?? {
      label: "Nieznane warunki",
      icon: "🌤️",
    }
  );
}

export function getWindDirectionLabel(
  degrees
) {
  const value = Number(degrees);

  if (!Number.isFinite(value)) {
    return "Brak danych";
  }

  const normalized =
    ((value % 360) + 360) % 360;

  const directions = [
    "N",
    "NE",
    "E",
    "SE",
    "S",
    "SW",
    "W",
    "NW",
  ];

  const index = Math.round(
    normalized / 45
  ) % 8;

  return directions[index];
}

export function getWindStrengthLabel(
  windSpeed
) {
  const speed = Number(windSpeed);

  if (!Number.isFinite(speed)) {
    return "Brak danych";
  }

  if (speed < 5) {
    return "Bardzo słaby";
  }

  if (speed < 12) {
    return "Lekki";
  }

  if (speed < 20) {
    return "Umiarkowany";
  }

  if (speed < 30) {
    return "Silny";
  }

  return "Bardzo silny";
}

export function getSupWeatherAssessment({
  windSpeed,
  windGusts,
  precipitation,
  weatherCode,
}) {
  const wind =
    Number(windSpeed) || 0;

  const gusts =
    Number(windGusts) || 0;

  const rain =
    Number(precipitation) || 0;

  const code =
    Number(weatherCode);

  if (
    [95, 96, 99].includes(code)
  ) {
    return {
      status: "danger",
      label:
        "Niebezpieczne warunki",
      message:
        "Prognozowana jest burza. Nie wypływaj na wodę.",
      icon: "⛔",
    };
  }

  if (
    wind >= 30 ||
    gusts >= 45
  ) {
    return {
      status: "danger",
      label:
        "Bardzo trudne warunki",
      message:
        "Silny wiatr lub porywy mogą być niebezpieczne na SUP-ie.",
      icon: "⛔",
    };
  }

  if (
    wind >= 20 ||
    gusts >= 35
  ) {
    return {
      status: "warning",
      label: "Trudne warunki",
      message:
        "Warunki mogą być odpowiednie tylko dla doświadczonych osób.",
      icon: "⚠️",
    };
  }

  if (
    wind >= 12 ||
    gusts >= 25 ||
    rain >= 1
  ) {
    return {
      status: "caution",
      label:
        "Warunki wymagają ostrożności",
      message:
        "Sprawdź kierunek wiatru i prognozę przed wypłynięciem.",
      icon: "🟡",
    };
  }

  return {
    status: "good",
    label:
      "Dobre warunki pogodowe",
    message:
      "Prognoza wygląda korzystnie, ale zawsze oceń warunki bezpośrednio na miejscu.",
    icon: "🟢",
  };
}

function createHourlyForecast(
  hourly
) {
  if (
    !hourly?.time?.length
  ) {
    return [];
  }

  return hourly.time.map(
    (time, index) => {
      const weather =
        getWeatherDescription(
          hourly.weather_code?.[
            index
          ]
        );

      return {
        time,

        temperature:
          roundValue(
            hourly.temperature_2m?.[
              index
            ],
            1
          ),

        apparentTemperature:
          roundValue(
            hourly.apparent_temperature?.[
              index
            ],
            1
          ),

        precipitationProbability:
          roundValue(
            hourly
              .precipitation_probability?.[
              index
            ]
          ),

        precipitation:
          roundValue(
            hourly.precipitation?.[
              index
            ],
            1
          ),

        windSpeed:
          roundValue(
            hourly.wind_speed_10m?.[
              index
            ],
            1
          ),

        windDirection:
          roundValue(
            hourly.wind_direction_10m?.[
              index
            ]
          ),

        windGusts:
          roundValue(
            hourly.wind_gusts_10m?.[
              index
            ],
            1
          ),

        cloudCover:
          roundValue(
            hourly.cloud_cover?.[
              index
            ]
          ),

        weatherCode:
          hourly.weather_code?.[
            index
          ] ?? null,

        weatherLabel:
          weather.label,

        weatherIcon:
          weather.icon,
      };
    }
  );
}

function createDailyForecast(
  daily
) {
  if (
    !daily?.time?.length
  ) {
    return [];
  }

  return daily.time.map(
    (date, index) => {
      const weather =
        getWeatherDescription(
          daily.weather_code?.[
            index
          ]
        );

      return {
        date,

        sunrise:
          daily.sunrise?.[
            index
          ] ?? null,

        sunset:
          daily.sunset?.[
            index
          ] ?? null,

        temperatureMax:
          roundValue(
            daily
              .temperature_2m_max?.[
              index
            ],
            1
          ),

        temperatureMin:
          roundValue(
            daily
              .temperature_2m_min?.[
              index
            ],
            1
          ),

        precipitationProbabilityMax:
          roundValue(
            daily
              .precipitation_probability_max?.[
              index
            ]
          ),

        precipitationSum:
          roundValue(
            daily
              .precipitation_sum?.[
              index
            ],
            1
          ),

        windSpeedMax:
          roundValue(
            daily
              .wind_speed_10m_max?.[
              index
            ],
            1
          ),

        windGustsMax:
          roundValue(
            daily
              .wind_gusts_10m_max?.[
              index
            ],
            1
          ),

        weatherCode:
          daily.weather_code?.[
            index
          ] ?? null,

        weatherLabel:
          weather.label,

        weatherIcon:
          weather.icon,
      };
    }
  );
}

function normalizeWeatherResponse(
  response
) {
  const current =
    response.current ?? {};

  const currentWeather =
    getWeatherDescription(
      current.weather_code
    );

  const normalizedCurrent = {
    time:
      current.time ?? null,

    temperature:
      roundValue(
        current.temperature_2m,
        1
      ),

    apparentTemperature:
      roundValue(
        current.apparent_temperature,
        1
      ),

    precipitation:
      roundValue(
        current.precipitation,
        1
      ),

    rain:
      roundValue(
        current.rain,
        1
      ),

    cloudCover:
      roundValue(
        current.cloud_cover
      ),

    windSpeed:
      roundValue(
        current.wind_speed_10m,
        1
      ),

    windDirection:
      roundValue(
        current.wind_direction_10m
      ),

    windDirectionLabel:
      getWindDirectionLabel(
        current.wind_direction_10m
      ),

    windGusts:
      roundValue(
        current.wind_gusts_10m,
        1
      ),

    weatherCode:
      current.weather_code ?? null,

    weatherLabel:
      currentWeather.label,

    weatherIcon:
      currentWeather.icon,

    isDay:
      current.is_day === 1,
  };

  const assessment =
    getSupWeatherAssessment({
      windSpeed:
        normalizedCurrent.windSpeed,

      windGusts:
        normalizedCurrent.windGusts,

      precipitation:
        normalizedCurrent
          .precipitation,

      weatherCode:
        normalizedCurrent.weatherCode,
    });

  return {
    latitude:
      response.latitude ?? null,

    longitude:
      response.longitude ?? null,

    elevation:
      response.elevation ?? null,

    timezone:
      response.timezone ?? null,

    timezoneAbbreviation:
      response.timezone_abbreviation ??
      null,

    fetchedAt:
      new Date().toISOString(),

    current:
      normalizedCurrent,

    assessment,

    hourly:
      createHourlyForecast(
        response.hourly
      ),

    daily:
      createDailyForecast(
        response.daily
      ),
  };
}

export async function getPlaceWeather({
  latitude,
  longitude,
  forceRefresh = false,
}) {
  if (
    !isValidCoordinate(latitude) ||
    !isValidCoordinate(longitude)
  ) {
    throw new Error(
      "Nieprawidłowe współrzędne miejsca."
    );
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    throw new Error(
      "Współrzędne miejsca są poza dozwolonym zakresem."
    );
  }

  const cacheKey =
    createCacheKey(lat, lng);

  if (!forceRefresh) {
    const cached =
      getCachedWeather(cacheKey);

    if (cached) {
      return cached;
    }
  }

  const params =
    new URLSearchParams({
      latitude: String(lat),
      longitude: String(lng),

      current: [
        "temperature_2m",
        "apparent_temperature",
        "precipitation",
        "rain",
        "weather_code",
        "cloud_cover",
        "wind_speed_10m",
        "wind_direction_10m",
        "wind_gusts_10m",
        "is_day",
      ].join(","),

      hourly: [
        "temperature_2m",
        "apparent_temperature",
        "precipitation_probability",
        "precipitation",
        "weather_code",
        "cloud_cover",
        "wind_speed_10m",
        "wind_direction_10m",
        "wind_gusts_10m",
      ].join(","),

      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "sunrise",
        "sunset",
        "precipitation_probability_max",
        "precipitation_sum",
        "wind_speed_10m_max",
        "wind_gusts_10m_max",
      ].join(","),

      timezone: "auto",
      forecast_days: "3",
      wind_speed_unit: "kmh",
      temperature_unit: "celsius",
      precipitation_unit: "mm",
    });

  let response;

  try {
    response = await fetch(
      `${WEATHER_API_URL}?${params.toString()}`
    );
  } catch (error) {
    console.error(
      "Błąd połączenia z pogodą:",
      error
    );

    throw new Error(
      "Nie udało się połączyć z usługą pogodową."
    );
  }

  if (!response.ok) {
    throw new Error(
      `Usługa pogodowa zwróciła błąd ${response.status}.`
    );
  }

  let rawData;

  try {
    rawData = await response.json();
  } catch (error) {
    console.error(
      "Błąd odczytu danych pogodowych:",
      error
    );

    throw new Error(
      "Nie udało się odczytać danych pogodowych."
    );
  }

  if (rawData?.error) {
    throw new Error(
      rawData.reason ||
        "Nie udało się pobrać pogody."
    );
  }

  const weather =
    normalizeWeatherResponse(
      rawData
    );

  saveWeatherToCache(
    cacheKey,
    weather
  );

  return weather;
}

export function getUpcomingHours(
  weather,
  hoursCount = 12
) {
  if (
    !weather?.hourly?.length
  ) {
    return [];
  }

  const now = Date.now();

  return weather.hourly
    .filter((item) => {
      const time =
        new Date(item.time).getTime();

      return (
        Number.isFinite(time) &&
        time >= now - 30 * 60 * 1000
      );
    })
    .slice(
      0,
      Math.max(
        Number(hoursCount) || 12,
        1
      )
    );
}

export function formatWeatherTime(
  value
) {
  if (!value) {
    return "Brak danych";
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "Brak danych";
  }

  return date.toLocaleTimeString(
    "pl-PL",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

export function formatWeatherDate(
  value
) {
  if (!value) {
    return "Brak danych";
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "Brak danych";
  }

  return date.toLocaleDateString(
    "pl-PL",
    {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    }
  );
}

export function clearWeatherCache() {
  weatherCache.clear();
}