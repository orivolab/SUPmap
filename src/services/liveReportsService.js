import { supabase } from "../lib/supabase";

const ACTIVE_REPORT_HOURS = 6;
const VERY_FRESH_REPORT_HOURS = 3;
const WARNING_HOURS = 24;
const VERIFICATION_COOLDOWN_HOURS = 3;
const VERIFIED_MIN_USERS = 5;
const LIVE_IMAGES_BUCKET = "place-images";

export async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user?.id ?? null;
}

function normalizeNullableText(value) {
  const cleanValue = String(value ?? "").trim();

  return cleanValue || null;
}

function parseNullableNumber(value) {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : null;
}

function createLiveImagePath(
  fileName,
  userId
) {
  const extension =
    String(fileName)
      .split(".")
      .pop()
      ?.toLowerCase() || "jpg";

  const safeExtension =
    extension.replace(/[^a-z0-9]/g, "") ||
    "jpg";

  const uniqueId =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return `${userId}/live-reports/${Date.now()}-${uniqueId}.${safeExtension}`;
}

export async function prepareLiveReportImage(file) {
  if (!file) {
    return null;
  }

  if (!file.type?.startsWith("image/")) {
    throw new Error(
      "Możesz wybrać tylko plik ze zdjęciem."
    );
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error(
      "Zdjęcie może mieć maksymalnie 5 MB."
    );
  }

  const buffer = await file.arrayBuffer();

  if (!buffer.byteLength) {
    throw new Error(
      "Zdjęcie nie zawiera danych."
    );
  }

  return {
    name: file.name,
    type: file.type || "image/jpeg",
    size: file.size,
    buffer,
  };
}

export async function uploadLiveReportImage(
  image
) {
  if (!image) {
    return null;
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error(
      "Musisz się zalogować, aby dodać zdjęcie."
    );
  }

  if (!image.buffer?.byteLength) {
    throw new Error(
      "Zdjęcie nie zawiera danych."
    );
  }

  const filePath = createLiveImagePath(
    image.name,
    userId
  );

  const { error: uploadError } =
    await supabase.storage
      .from(LIVE_IMAGES_BUCKET)
      .upload(filePath, image.buffer, {
        cacheControl: "3600",
        upsert: false,
        contentType:
          image.type || "image/jpeg",
      });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from(LIVE_IMAGES_BUCKET)
    .getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error(
      "Nie udało się utworzyć adresu zdjęcia."
    );
  }

  return data.publicUrl;
}

export async function submitLiveReport({
  placeId,
  waterTemperature,
  airTemperature,
  crowdLevel,
  windLevel,
  waterCondition,
  parkingStatus,
  algaeStatus,
  lifeguardPresent,
  toiletsOpen,
  gastronomyOpen,
  waterCleanliness,
  rainStatus,
  entranceStatus,
  swimmingBan,
  note,
  liveImage,
}) {
  if (!placeId) {
    throw new Error("Nie wybrano miejsca.");
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error(
      "Musisz się zalogować, aby dodać aktualizację."
    );
  }

  const parsedWaterTemperature =
    parseNullableNumber(waterTemperature);

  const parsedAirTemperature =
    parseNullableNumber(airTemperature);

  if (
    parsedWaterTemperature !== null &&
    (
      parsedWaterTemperature < 0 ||
      parsedWaterTemperature > 40
    )
  ) {
    throw new Error(
      "Temperatura wody musi wynosić od 0 do 40°C."
    );
  }

  if (
    parsedAirTemperature !== null &&
    (
      parsedAirTemperature < -40 ||
      parsedAirTemperature > 60
    )
  ) {
    throw new Error(
      "Temperatura powietrza musi wynosić od -40 do 60°C."
    );
  }

  let liveImageUrl = null;

  if (liveImage) {
    liveImageUrl =
      await uploadLiveReportImage(
        liveImage
      );
  }

  const report = {
    place_id: placeId,
    user_id: userId,

    water_temperature:
      parsedWaterTemperature,

    air_temperature:
      parsedAirTemperature,

    crowd_level:
      normalizeNullableText(crowdLevel),

    wind_level:
      normalizeNullableText(windLevel),

    water_condition:
      normalizeNullableText(
        waterCondition
      ),

    parking_status:
      normalizeNullableText(
        parkingStatus
      ),

    algae_status:
      normalizeNullableText(algaeStatus),

    lifeguard_present:
      typeof lifeguardPresent === "boolean"
        ? lifeguardPresent
        : null,

    toilets_open:
      normalizeNullableText(toiletsOpen),

    gastronomy_open:
      normalizeNullableText(
        gastronomyOpen
      ),

    water_cleanliness:
      normalizeNullableText(
        waterCleanliness
      ),

    rain_status:
      normalizeNullableText(rainStatus),

    entrance_status:
      normalizeNullableText(
        entranceStatus
      ),

    swimming_ban:
      typeof swimmingBan === "boolean"
        ? swimmingBan
        : null,

    note: normalizeNullableText(note),
    live_image_url: liveImageUrl,
  };

  const hasContent = Object.entries(
    report
  ).some(
    ([key, value]) =>
      !["place_id", "user_id"].includes(
        key
      ) &&
      value !== null &&
      value !== ""
  );

  if (!hasContent) {
    throw new Error(
      "Dodaj przynajmniej jedną informację o sytuacji na miejscu."
    );
  }

  const { data, error } = await supabase
    .from("place_live_reports")
    .insert(report)
    .select(`
      *,
      profiles (
        id,
        username,
        avatar_url
      )
    `)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getLiveReports(
  placeId,
  limit = 50
) {
  if (!placeId) {
    return [];
  }

  const { data, error } = await supabase
    .from("active_place_live_reports")
    .select(`
      *,
      profiles (
        id,
        username,
        avatar_url
      )
    `)
    .eq("place_id", placeId)
    .order("created_at", {
      ascending: false,
    })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getActiveLiveReports(
  placeId,
  limit = 20
) {
  if (!placeId) {
    return [];
  }

  const activeSince = new Date(
    Date.now() -
      ACTIVE_REPORT_HOURS *
        60 *
        60 *
        1000
  ).toISOString();

  const { data, error } = await supabase
    .from("active_place_live_reports")
    .select(`
      *,
      profiles (
        id,
        username,
        avatar_url
      )
    `)
    .eq("place_id", placeId)
    .gte("created_at", activeSince)
    .order("created_at", {
      ascending: false,
    })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getActiveWarnings(
  placeId,
  limit = 20
) {
  if (!placeId) {
    return [];
  }

  const warningSince = new Date(
    Date.now() -
      WARNING_HOURS *
        60 *
        60 *
        1000
  ).toISOString();

  const { data, error } = await supabase
    .from("active_place_live_reports")
    .select(`
      *,
      profiles (
        id,
        username,
        avatar_url
      )
    `)
    .eq("place_id", placeId)
    .eq("active_warning", true)
    .gte("created_at", warningSince)
    .order("created_at", {
      ascending: false,
    })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getLatestLiveReport(
  placeId
) {
  if (!placeId) {
    return null;
  }

  const { data, error } = await supabase
    .from("active_place_live_reports")
    .select(`
      *,
      profiles (
        id,
        username,
        avatar_url
      )
    `)
    .eq("place_id", placeId)
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}

export async function deleteOwnLiveReport(
  reportId
) {
  if (!reportId) {
    throw new Error(
      "Nie wybrano aktualizacji."
    );
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error(
      "Musisz się zalogować."
    );
  }

  const { error } = await supabase
    .from("place_live_reports")
    .delete()
    .eq("id", reportId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export async function canVerifyPlace(
  placeId
) {
  if (!placeId) {
    return false;
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    return false;
  }

  const cooldownSince = new Date(
    Date.now() -
      VERIFICATION_COOLDOWN_HOURS *
        60 *
        60 *
        1000
  ).toISOString();

  const { data, error } = await supabase
    .from("place_verifications")
    .select("id")
    .eq("place_id", placeId)
    .eq("user_id", userId)
    .gte("created_at", cooldownSince)
    .limit(1);

  if (error) {
    throw error;
  }

  return (data ?? []).length === 0;
}

export async function verifyPlace(
  placeId
) {
  if (!placeId) {
    throw new Error("Nie wybrano miejsca.");
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error(
      "Musisz się zalogować, aby potwierdzić aktualność miejsca."
    );
  }

  const allowed =
    await canVerifyPlace(placeId);

  if (!allowed) {
    throw new Error(
      "Możesz ponownie potwierdzić to miejsce po upływie 3 godzin."
    );
  }

  const { data, error } = await supabase
    .from("place_verifications")
    .insert({
      place_id: placeId,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getPlaceVerificationInfo(
  placeId
) {
  if (!placeId) {
    return {
      totalCount: 0,
      uniqueRecentCount: 0,
      verified: false,
      latestVerificationAt: null,
      canCurrentUserVerify: false,
    };
  }

  const validSince = new Date(
    Date.now() -
      30 *
        24 *
        60 *
        60 *
        1000
  ).toISOString();

  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("place_verifications")
    .select("id, user_id, created_at")
    .eq("place_id", placeId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  const verifications = data ?? [];

  const recentVerifications =
    verifications.filter(
      (item) =>
        new Date(item.created_at) >=
        new Date(validSince)
    );

  const uniqueRecentUserIds =
    new Set(
      recentVerifications.map(
        (item) => item.user_id
      )
    );

  const cooldownSince = new Date(
    Date.now() -
      VERIFICATION_COOLDOWN_HOURS *
        60 *
        60 *
        1000
  );

  const currentUserRecentlyVerified =
    Boolean(
      userId &&
        verifications.some(
          (item) =>
            item.user_id === userId &&
            new Date(item.created_at) >
              cooldownSince
        )
    );

  return {
    totalCount: verifications.length,

    uniqueRecentCount:
      uniqueRecentUserIds.size,

    verified:
      uniqueRecentUserIds.size >=
      VERIFIED_MIN_USERS,

    latestVerificationAt:
      verifications[0]?.created_at ??
      null,

    canCurrentUserVerify:
      Boolean(
        userId &&
          !currentUserRecentlyVerified
      ),
  };
}

export function getReportFreshness(
  createdAt
) {
  if (!createdAt) {
    return "history";
  }

  const createdTime =
    new Date(createdAt).getTime();

  if (!Number.isFinite(createdTime)) {
    return "history";
  }

  const ageMs =
    Date.now() - createdTime;

  if (
    ageMs <=
    VERY_FRESH_REPORT_HOURS *
      60 *
      60 *
      1000
  ) {
    return "very_fresh";
  }

  if (
    ageMs <=
    ACTIVE_REPORT_HOURS *
      60 *
      60 *
      1000
  ) {
    return "fresh";
  }

  return "history";
}

export function isReportActive(
  createdAt
) {
  return (
    getReportFreshness(createdAt) !==
    "history"
  );
}

export function isWarningActive(
  report
) {
  if (!report?.created_at) {
    return false;
  }

  const createdTime = new Date(
    report.created_at
  ).getTime();

  if (!Number.isFinite(createdTime)) {
    return false;
  }

  const withinWarningTime =
    Date.now() - createdTime <=
    WARNING_HOURS *
      60 *
      60 *
      1000;

  const hasWarning =
    [
      "Podejrzenie sinic",
      "Potwierdzone sinice",
    ].includes(report.algae_status) ||
    report.entrance_status ===
      "Wejście zamknięte" ||
    report.swimming_ban === true;

  return withinWarningTime && hasWarning;
}

export function formatReportAge(
  createdAt
) {
  if (!createdAt) {
    return "brak daty";
  }

  const createdTime =
    new Date(createdAt).getTime();

  if (!Number.isFinite(createdTime)) {
    return "nieznany czas";
  }

  const differenceMs = Math.max(
    Date.now() - createdTime,
    0
  );

  const minutes = Math.floor(
    differenceMs / (60 * 1000)
  );

  if (minutes < 1) {
    return "przed chwilą";
  }

  if (minutes < 60) {
    return `${minutes} min temu`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours} godz. temu`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days === 1) {
    return "wczoraj";
  }

  return `${days} dni temu`;
}

export function getLiveSummary(
  reports
) {
  if (!reports?.length) {
    return {
      waterTemperature: null,
      airTemperature: null,
      crowdLevel: null,
      windLevel: null,
      waterCondition: null,
      parkingStatus: null,
      algaeStatus: null,
      lifeguardPresent: null,
      toiletsOpen: null,
      gastronomyOpen: null,
      waterCleanliness: null,
      rainStatus: null,
      entranceStatus: null,
      swimmingBan: null,
      reportsCount: 0,
    };
  }

  const newestValue = (fieldName) => {
    const report = reports.find(
      (item) =>
        item[fieldName] !== null &&
        item[fieldName] !== undefined &&
        item[fieldName] !== ""
    );

    return report?.[fieldName] ?? null;
  };

  return {
    waterTemperature: newestValue(
      "water_temperature"
    ),

    airTemperature: newestValue(
      "air_temperature"
    ),

    crowdLevel: newestValue(
      "crowd_level"
    ),

    windLevel: newestValue(
      "wind_level"
    ),

    waterCondition: newestValue(
      "water_condition"
    ),

    parkingStatus: newestValue(
      "parking_status"
    ),

    algaeStatus: newestValue(
      "algae_status"
    ),

    lifeguardPresent: newestValue(
      "lifeguard_present"
    ),

    toiletsOpen: newestValue(
      "toilets_open"
    ),

    gastronomyOpen: newestValue(
      "gastronomy_open"
    ),

    waterCleanliness: newestValue(
      "water_cleanliness"
    ),

    rainStatus: newestValue(
      "rain_status"
    ),

    entranceStatus: newestValue(
      "entrance_status"
    ),

    swimmingBan: newestValue(
      "swimming_ban"
    ),

    reportsCount: reports.length,
  };
}