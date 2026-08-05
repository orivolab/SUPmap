const CATEGORY_WEIGHTS = {
  beginner: 15,
  waterEntry: 12,
  safety: 13,
  parking: 10,
  infrastructure: 10,
  cleanliness: 8,
  calmWater: 10,
  dogs: 7,
  family: 8,
  crowds: 7,
};

const EMPTY_RESULT = {
  score: null,
  status: "insufficient",
  statusLabel: "Za mało danych",
  confidence: 0,
  categories: [],
  dataSources: {
    reviewsCount: 0,
    verificationsCount: 0,
    liveReportsCount: 0,
    completedFields: 0,
    totalFields: 0,
  },
};

function clamp(value, min = 0, max = 100) {
  return Math.min(
    Math.max(Number(value) || 0, min),
    max
  );
}

function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function hasText(value) {
  return normalizeText(value).length > 0;
}

function isTrue(value) {
  return value === true;
}

function isPositiveStatus(value) {
  return [
    "tak",
    "sezonowo",
    "dozwolone",
    "specjalne stanowiska",
    "na miejscu",
    "w pobliżu",
    "bezpłatny",
    "płatny",
    "częściowo płatny",
  ].includes(normalizeText(value));
}

function getAverage(values) {
  const validValues = values.filter(
    (value) =>
      value !== null &&
      value !== undefined &&
      Number.isFinite(Number(value))
  );

  if (validValues.length === 0) {
    return null;
  }

  const sum = validValues.reduce(
    (total, value) =>
      total + Number(value),
    0
  );

  return sum / validValues.length;
}

function getBeginnerScore(place) {
  const rating =
    normalizeText(place.beginner_rating);

  const scoreMap = {
    "bardzo dobre": 100,
    "dobre przy spokojnej pogodzie": 75,
    średnie: 50,
    trudne: 15,
    "brak informacji": null,
  };

  let score =
    scoreMap[rating] ?? null;

  if (score === null) {
    return null;
  }

  const reasons =
    place.beginner_reasons ?? [];

  const normalizedReasons = reasons.map(
    normalizeText
  );

  if (
    normalizedReasons.includes(
      "spokojna woda"
    )
  ) {
    score += 5;
  }

  if (
    normalizedReasons.includes(
      "dużo miejsca"
    )
  ) {
    score += 5;
  }

  if (
    normalizedReasons.includes(
      "silny wiatr"
    )
  ) {
    score -= 15;
  }

  if (
    normalizedReasons.includes("fale")
  ) {
    score -= 10;
  }

  if (
    normalizedReasons.includes(
      "motorówki"
    )
  ) {
    score -= 10;
  }

  if (
    normalizedReasons.includes(
      "trudne wejście"
    )
  ) {
    score -= 10;
  }

  if (
    normalizedReasons.includes(
      "szybko robi się głęboko"
    )
  ) {
    score -= 10;
  }

  return clamp(score);
}

function getWaterEntryScore(place) {
  const entry =
    normalizeText(
      place.water_entry_type
    );

  const scoreMap = {
    "łagodne zejście": 100,
    pomost: 85,
    "kilka różnych wejść": 90,
    schody: 65,
    kamieniste: 50,
    błotniste: 35,
    "przez trzciny": 30,
    "stromy brzeg": 20,
    inne: 50,
    "brak informacji": null,
  };

  let score =
    scoreMap[entry] ?? null;

  if (score === null) {
    return null;
  }

  if (place.stairs_on_route === true) {
    score -= 10;
  }

  const carryDistance =
    normalizeText(
      place.sup_carry_distance
    );

  if (
    carryDistance.includes("daleko") ||
    carryDistance.includes("długi")
  ) {
    score -= 15;
  }

  if (
    normalizeText(
      place.parking_to_water_distance
    ).includes("blisko")
  ) {
    score += 5;
  }

  return clamp(score);
}

function getSafetyScore(place) {
  const values = [];

  const lifeguard =
    normalizeText(
      place.lifeguard_available
    );

  if (lifeguard === "tak") {
    values.push(100);
  } else if (
    lifeguard === "sezonowo"
  ) {
    values.push(75);
  } else if (lifeguard === "nie") {
    values.push(35);
  }

  const waterTraffic =
    normalizeText(place.water_traffic);

  const trafficMap = {
    "strefa ciszy": 100,
    "zakaz motorówek": 95,
    "mały ruch": 85,
    "umiarkowany ruch": 60,
    "duży ruch": 25,
    "skutery wodne": 20,
    "statki lub promy": 30,
    "brak informacji": null,
  };

  if (
    trafficMap[waterTraffic] !==
    undefined &&
    trafficMap[waterTraffic] !== null
  ) {
    values.push(
      trafficMap[waterTraffic]
    );
  }

  if (place.strong_current === true) {
    values.push(15);
  }

  if (
    place.marked_zones === true
  ) {
    values.push(90);
  }

  const childrenRating =
    normalizeText(
      place.children_rating
    );

  if (
    childrenRating ===
    "bardzo dobre dla dzieci"
  ) {
    values.push(90);
  }

  if (
    childrenRating ===
    "niebezpieczne"
  ) {
    values.push(10);
  }

  return getAverage(values);
}

function getParkingScore(place) {
  const available =
    normalizeText(
      place.parking_available
    );

  if (available === "nie") {
    return 10;
  }

  if (
    available ===
    "brak informacji"
  ) {
    return null;
  }

  if (available !== "tak") {
    return null;
  }

  let score = 60;

  const type =
    normalizeText(place.parking_type);

  if (type === "bezpłatny") {
    score += 20;
  }

  if (
    type === "częściowo płatny"
  ) {
    score += 10;
  }

  const size =
    normalizeText(place.parking_size);

  if (size === "duży") {
    score += 15;
  } else if (size === "średni") {
    score += 8;
  } else if (size === "mały") {
    score -= 5;
  }

  const distance =
    normalizeText(
      place.parking_distance ||
        place.parking_to_water_distance
    );

  if (
    distance.includes("blisko") ||
    distance.includes("przy")
  ) {
    score += 5;
  }

  if (
    distance.includes("daleko")
  ) {
    score -= 15;
  }

  return clamp(score);
}

function getInfrastructureScore(place) {
  const infrastructureFields = [
    place.toilets_available,
    place.showers_available,
    place.changing_rooms_available,
    place.gastronomy_available,
    place.rental_available,
    place.bicycle_racks,
    place.benches,
    place.picnic_tables,
    place.shelters,
    place.playground,
    place.sports_field,
  ];

  let knownCount = 0;
  let points = 0;

  infrastructureFields.forEach(
    (value) => {
      if (
        value === true ||
        value === false
      ) {
        knownCount += 1;

        if (value === true) {
          points += 1;
        }

        return;
      }

      const text =
        normalizeText(value);

      if (!text) {
        return;
      }

      knownCount += 1;

      if (
        [
          "tak",
          "sezonowo",
          "w pobliżu",
        ].includes(text)
      ) {
        points += 1;
      }
    }
  );

  if (knownCount === 0) {
    return null;
  }

  return clamp(
    (points / knownCount) * 100
  );
}

function getCleanlinessScore({
  place,
  liveReports,
  reviewsAverage,
}) {
  const values = [];

  const cleanlinessValues = {
    "bardzo czysta": 100,
    czysta: 85,
    średnia: 55,
    brudna: 25,
    "bardzo brudna": 5,
  };

  const latestCleanliness =
    liveReports?.find(
      (report) =>
        report.water_cleanliness
    )?.water_cleanliness;

  const normalizedCleanliness =
    normalizeText(latestCleanliness);

  if (
    cleanlinessValues[
      normalizedCleanliness
    ] !== undefined
  ) {
    values.push(
      cleanlinessValues[
        normalizedCleanliness
      ]
    );
  }

  const algaeStatus =
    normalizeText(
      liveReports?.find(
        (report) =>
          report.algae_status
      )?.algae_status
    );

  if (
    algaeStatus ===
    "brak oznak sinic"
  ) {
    values.push(90);
  }

  if (
    algaeStatus ===
    "podejrzenie sinic"
  ) {
    values.push(20);
  }

  if (
    algaeStatus ===
    "potwierdzone sinice"
  ) {
    values.push(0);
  }

  if (
    reviewsAverage !== null &&
    reviewsAverage !== undefined
  ) {
    values.push(
      clamp(
        (Number(reviewsAverage) / 5) *
          100
      )
    );
  }

  return getAverage(values);
}

function getCalmWaterScore({
  place,
  liveReports,
}) {
  const values = [];

  const traffic =
    normalizeText(place.water_traffic);

  const trafficScores = {
    "strefa ciszy": 100,
    "zakaz motorówek": 95,
    "mały ruch": 80,
    "umiarkowany ruch": 55,
    "duży ruch": 20,
    "skutery wodne": 15,
    "statki lub promy": 25,
  };

  if (
    trafficScores[traffic] !==
    undefined
  ) {
    values.push(
      trafficScores[traffic]
    );
  }

  const waterCondition =
    normalizeText(
      liveReports?.find(
        (report) =>
          report.water_condition
      )?.water_condition
    );

  const waterConditionScores = {
    "gładka woda": 100,
    "małe fale": 75,
    "umiarkowane fale": 45,
    "duże fale": 10,
  };

  if (
    waterConditionScores[
      waterCondition
    ] !== undefined
  ) {
    values.push(
      waterConditionScores[
        waterCondition
      ]
    );
  }

  const wind =
    normalizeText(
      liveReports?.find(
        (report) =>
          report.wind_level
      )?.wind_level
    );

  const windScores = {
    "brak wiatru": 100,
    lekki: 85,
    umiarkowany: 55,
    silny: 20,
    "bardzo silny": 5,
  };

  if (
    windScores[wind] !== undefined
  ) {
    values.push(windScores[wind]);
  }

  return getAverage(values);
}

function getDogsScore(place) {
  const status =
    normalizeText(place.dogs_allowed);

  const scoreMap = {
    tak: 100,
    częściowo: 60,
    nie: 0,
    "brak informacji": null,
  };

  return scoreMap[status] ?? null;
}

function getFamilyScore(place) {
  const rating =
    normalizeText(
      place.children_rating
    );

  const scoreMap = {
    "bardzo dobre dla dzieci": 100,
    "dobre pod opieką dorosłych": 75,
    "raczej nie": 30,
    niebezpieczne: 0,
    "brak informacji": null,
  };

  let score =
    scoreMap[rating] ?? null;

  if (score === null) {
    return null;
  }

  const features =
    place.children_features ?? [];

  const normalizedFeatures =
    features.map(normalizeText);

  if (
    normalizedFeatures.includes(
      "plac zabaw"
    )
  ) {
    score += 5;
  }

  if (
    normalizedFeatures.includes(
      "płytka woda"
    )
  ) {
    score += 5;
  }

  if (
    normalizedFeatures.includes(
      "ratownik"
    )
  ) {
    score += 5;
  }

  if (
    normalizedFeatures.includes(
      "brak cienia"
    )
  ) {
    score -= 10;
  }

  if (
    normalizedFeatures.includes(
      "stromy brzeg"
    )
  ) {
    score -= 15;
  }

  if (
    normalizedFeatures.includes(
      "duży ruch motorówek"
    )
  ) {
    score -= 20;
  }

  return clamp(score);
}

function getCrowdsScore({
  place,
  liveReports,
}) {
  const liveCrowd =
    normalizeText(
      liveReports?.find(
        (report) =>
          report.crowd_level
      )?.crowd_level
    );

  const liveScores = {
    pusto: 100,
    "mało osób": 90,
    umiarkowanie: 65,
    "dużo osób": 35,
    "bardzo tłoczno": 10,
  };

  if (
    liveScores[liveCrowd] !==
    undefined
  ) {
    return liveScores[liveCrowd];
  }

  const weekendCrowds =
    normalizeText(
      place.weekend_crowds
    );

  const staticScores = {
    "zwykle spokojnie": 90,
    "umiarkowanie dużo ludzi": 60,
    "dużo ludzi": 35,
    "bardzo tłoczno": 10,
    "zależy od pogody": 55,
  };

  return (
    staticScores[weekendCrowds] ??
    null
  );
}

function buildCategory({
  key,
  label,
  icon,
  score,
  weight,
}) {
  return {
    key,
    label,
    icon,
    score:
      score === null
        ? null
        : Math.round(clamp(score)),
    weight,
    available: score !== null,
  };
}

function getDataCompleteness(place) {
  const fields = [
    place.parking_available,
    place.parking_type,
    place.dogs_allowed,
    place.toilets_available,
    place.showers_available,
    place.changing_rooms_available,
    place.gastronomy_available,
    place.lifeguard_available,
    place.rental_available,
    place.grill_status,
    place.bonfire_status,
    place.shade_level,
    place.campsite_status,
    place.camper_status,
    place.accommodation_status,
    place.shore_depth,
    place.water_entry_type,
    place.children_rating,
    place.beginner_rating,
    place.water_traffic,
  ];

  const completedFields =
    fields.filter((field) => {
      if (
        field === true ||
        field === false
      ) {
        return true;
      }

      const value =
        normalizeText(field);

      return (
        value &&
        value !== "brak informacji"
      );
    }).length;

  return {
    completedFields,
    totalFields: fields.length,
    percentage:
      fields.length > 0
        ? Math.round(
            (completedFields /
              fields.length) *
              100
          )
        : 0,
  };
}

function getScoreStatus({
  reviewsCount,
  completedFields,
  totalFields,
  categoriesAvailable,
}) {
  const completeness =
    totalFields > 0
      ? completedFields / totalFields
      : 0;

  if (
    reviewsCount < 3 &&
    completeness < 0.35 &&
    categoriesAvailable < 5
  ) {
    return {
      status: "insufficient",
      statusLabel: "Za mało danych",
    };
  }

  if (
    reviewsCount < 10 ||
    completeness < 0.65 ||
    categoriesAvailable < 8
  ) {
    return {
      status: "preliminary",
      statusLabel:
        "Wstępny SUP Score",
    };
  }

  return {
    status: "full",
    statusLabel: "SUP Score",
  };
}

function getConfidence({
  reviewsCount,
  verificationsCount,
  liveReportsCount,
  completenessPercentage,
  categoriesAvailable,
}) {
  const reviewsConfidence = clamp(
    (reviewsCount / 10) * 30,
    0,
    30
  );

  const verificationsConfidence =
    clamp(
      (verificationsCount / 5) * 20,
      0,
      20
    );

  const liveConfidence = clamp(
    (liveReportsCount / 5) * 15,
    0,
    15
  );

  const completenessConfidence =
    clamp(
      completenessPercentage * 0.25,
      0,
      25
    );

  const categoriesConfidence = clamp(
    (categoriesAvailable / 10) * 10,
    0,
    10
  );

  return Math.round(
    reviewsConfidence +
      verificationsConfidence +
      liveConfidence +
      completenessConfidence +
      categoriesConfidence
  );
}

export function calculateSupScore({
  place,
  statistics,
  liveReports = [],
}) {
  if (!place) {
    return {
      ...EMPTY_RESULT,
    };
  }

  const reviewsCount = Number(
    statistics?.reviewsCount ??
      statistics?.reviews_count ??
      0
  );

  const averageRating =
    statistics?.averageRating ??
    statistics?.average_rating ??
    null;

  const verificationsCount = Number(
    statistics
      ?.uniqueRecentVerifiersCount ??
      statistics
        ?.unique_recent_verifiers_count ??
      0
  );

  const liveReportsCount = Number(
    statistics?.liveReportsCount ??
      statistics?.live_reports_count ??
      liveReports.length ??
      0
  );

  const categories = [
    buildCategory({
      key: "beginner",
      label: "Dla początkujących",
      icon: "🏄",
      score: getBeginnerScore(place),
      weight:
        CATEGORY_WEIGHTS.beginner,
    }),

    buildCategory({
      key: "waterEntry",
      label: "Wejście do wody",
      icon: "🌊",
      score: getWaterEntryScore(place),
      weight:
        CATEGORY_WEIGHTS.waterEntry,
    }),

    buildCategory({
      key: "safety",
      label: "Bezpieczeństwo",
      icon: "🛟",
      score: getSafetyScore(place),
      weight:
        CATEGORY_WEIGHTS.safety,
    }),

    buildCategory({
      key: "parking",
      label: "Parking i dostęp",
      icon: "🚗",
      score: getParkingScore(place),
      weight:
        CATEGORY_WEIGHTS.parking,
    }),

    buildCategory({
      key: "infrastructure",
      label: "Infrastruktura",
      icon: "🚻",
      score:
        getInfrastructureScore(place),
      weight:
        CATEGORY_WEIGHTS.infrastructure,
    }),

    buildCategory({
      key: "cleanliness",
      label: "Czystość",
      icon: "✨",
      score: getCleanlinessScore({
        place,
        liveReports,
        reviewsAverage:
          averageRating,
      }),
      weight:
        CATEGORY_WEIGHTS.cleanliness,
    }),

    buildCategory({
      key: "calmWater",
      label: "Spokojna woda",
      icon: "💧",
      score: getCalmWaterScore({
        place,
        liveReports,
      }),
      weight:
        CATEGORY_WEIGHTS.calmWater,
    }),

    buildCategory({
      key: "dogs",
      label: "Przyjazność dla psów",
      icon: "🐶",
      score: getDogsScore(place),
      weight:
        CATEGORY_WEIGHTS.dogs,
    }),

    buildCategory({
      key: "family",
      label: "Komfort rodzinny",
      icon: "👨‍👩‍👧",
      score: getFamilyScore(place),
      weight:
        CATEGORY_WEIGHTS.family,
    }),

    buildCategory({
      key: "crowds",
      label: "Zatłoczenie",
      icon: "👥",
      score: getCrowdsScore({
        place,
        liveReports,
      }),
      weight:
        CATEGORY_WEIGHTS.crowds,
    }),
  ];

  const availableCategories =
    categories.filter(
      (category) =>
        category.available
    );

  const totalAvailableWeight =
    availableCategories.reduce(
      (sum, category) =>
        sum + category.weight,
      0
    );

  const weightedScore =
    totalAvailableWeight > 0
      ? availableCategories.reduce(
          (sum, category) =>
            sum +
            category.score *
              category.weight,
          0
        ) / totalAvailableWeight
      : null;

  const completeness =
    getDataCompleteness(place);

  const statusData = getScoreStatus({
    reviewsCount,
    completedFields:
      completeness.completedFields,
    totalFields:
      completeness.totalFields,
    categoriesAvailable:
      availableCategories.length,
  });

  const confidence = getConfidence({
    reviewsCount,
    verificationsCount,
    liveReportsCount,
    completenessPercentage:
      completeness.percentage,
    categoriesAvailable:
      availableCategories.length,
  });

  return {
    score:
      weightedScore === null
        ? null
        : Math.round(weightedScore),

    status: statusData.status,
    statusLabel:
      statusData.statusLabel,

    confidence,

    categories,

    availableCategoriesCount:
      availableCategories.length,

    dataSources: {
      reviewsCount,
      verificationsCount,
      liveReportsCount,

      completedFields:
        completeness.completedFields,

      totalFields:
        completeness.totalFields,

      completenessPercentage:
        completeness.percentage,
    },
  };
}

export function getSupScoreLabel(score) {
  if (
    score === null ||
    score === undefined
  ) {
    return "Brak wyniku";
  }

  const safeScore = clamp(score);

  if (safeScore >= 90) {
    return "Wyjątkowe miejsce";
  }

  if (safeScore >= 80) {
    return "Bardzo dobre miejsce";
  }

  if (safeScore >= 70) {
    return "Dobre miejsce";
  }

  if (safeScore >= 55) {
    return "Przeciętne miejsce";
  }

  if (safeScore >= 40) {
    return "Wymaga ostrożności";
  }

  return "Trudne warunki";
}

export function getSupScoreMarkerState(
  result
) {
  if (
    !result ||
    result.score === null
  ) {
    return "unknown";
  }

  if (
    result.status ===
    "insufficient"
  ) {
    return "unknown";
  }

  if (result.score >= 80) {
    return "recommended";
  }

  if (result.score >= 55) {
    return "standard";
  }

  return "warning";
}

export function getSupScoreExplanation(
  result
) {
  if (!result) {
    return "Brak danych do obliczenia wyniku.";
  }

  if (
    result.status ===
    "insufficient"
  ) {
    return (
      "Za mało danych społeczności i informacji " +
      "o miejscu, aby obliczyć wiarygodny SUP Score."
    );
  }

  const {
    reviewsCount,
    verificationsCount,
    liveReportsCount,
  } = result.dataSources;

  const parts = [];

  if (reviewsCount > 0) {
    parts.push(
      `${reviewsCount} ${
        reviewsCount === 1
          ? "opinii"
          : "opinii"
      }`
    );
  }

  if (verificationsCount > 0) {
    parts.push(
      `${verificationsCount} ${
        verificationsCount === 1
          ? "potwierdzenia"
          : "potwierdzeń"
      }`
    );
  }

  if (liveReportsCount > 0) {
    parts.push(
      `${liveReportsCount} ${
        liveReportsCount === 1
          ? "aktualizacji"
          : "aktualizacji"
      }`
    );
  }

  if (parts.length === 0) {
    return (
      "Wynik obliczono głównie na podstawie " +
      "stałych informacji o miejscu."
    );
  }

  return (
    "Wynik obliczono na podstawie: " +
    parts.join(", ") +
    "."
  );
}