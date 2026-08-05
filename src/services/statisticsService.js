import { supabase } from "../lib/supabase";

const EMPTY_STATISTICS = {
  placeId: null,
  reviewsCount: 0,
  averageRating: null,
  photosCount: 0,
  liveReportsCount: 0,
  visitsCount: 0,
  uniqueVisitorsCount: 0,
  favoritesCount: 0,
  verificationsCount: 0,
  uniqueRecentVerifiersCount: 0,
  lastLiveReportAt: null,
  lastVerificationAt: null,
};

function normalizeNumber(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function normalizeStatistics(row) {
  if (!row) {
    return {
      ...EMPTY_STATISTICS,
    };
  }

  return {
    placeId: row.place_id ?? null,

    reviewsCount: normalizeNumber(
      row.reviews_count
    ),

    averageRating:
      row.average_rating === null ||
      row.average_rating === undefined
        ? null
        : normalizeNumber(
            row.average_rating,
            null
          ),

    photosCount: normalizeNumber(
      row.photos_count
    ),

    liveReportsCount: normalizeNumber(
      row.live_reports_count
    ),

    visitsCount: normalizeNumber(
      row.visits_count
    ),

    uniqueVisitorsCount: normalizeNumber(
      row.unique_visitors_count
    ),

    favoritesCount: normalizeNumber(
      row.favorites_count
    ),

    verificationsCount: normalizeNumber(
      row.verifications_count
    ),

    uniqueRecentVerifiersCount:
      normalizeNumber(
        row.unique_recent_verifiers_count
      ),

    lastLiveReportAt:
      row.last_live_report_at ?? null,

    lastVerificationAt:
      row.last_verification_at ?? null,
  };
}

export async function getPlaceStatistics(
  placeId
) {
  if (!placeId) {
    return {
      ...EMPTY_STATISTICS,
    };
  }

  const { data, error } = await supabase
    .from("place_statistics")
    .select("*")
    .eq("place_id", placeId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return normalizeStatistics(data);
}

export async function getManyPlaceStatistics(
  placeIds
) {
  const ids = [
    ...new Set(
      (placeIds ?? []).filter(Boolean)
    ),
  ];

  if (ids.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("place_statistics")
    .select("*")
    .in("place_id", ids);

  if (error) {
    throw error;
  }

  return new Map(
    (data ?? []).map((row) => [
      row.place_id,
      normalizeStatistics(row),
    ])
  );
}

export async function getPlaceReviewsStatistics(
  placeId
) {
  if (!placeId) {
    return {
      count: 0,
      average: null,
      ratingDistribution: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
    };
  }

  const { data, error } = await supabase
    .from("place_reviews")
    .select("rating")
    .eq("place_id", placeId)
    .eq("status", "approved");

  if (error) {
    throw error;
  }

  const reviews = data ?? [];

  const ratingDistribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  let totalRating = 0;

  reviews.forEach((review) => {
    const rating = normalizeNumber(
      review.rating
    );

    if (
      rating >= 1 &&
      rating <= 5
    ) {
      ratingDistribution[rating] += 1;
      totalRating += rating;
    }
  });

  return {
    count: reviews.length,

    average:
      reviews.length > 0
        ? Number(
            (
              totalRating /
              reviews.length
            ).toFixed(1)
          )
        : null,

    ratingDistribution,
  };
}

export async function getPlaceLiveStatistics(
  placeId
) {
  if (!placeId) {
    return {
      totalReports: 0,
      reportsLast24Hours: 0,
      reportsLast6Hours: 0,
      lastReportAt: null,
      activeWarningsCount: 0,
    };
  }

  const last24Hours = new Date(
    Date.now() -
      24 * 60 * 60 * 1000
  ).toISOString();

  const last6Hours = new Date(
    Date.now() -
      6 * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from("active_place_live_reports")
    .select(
      "id, created_at, active_warning"
    )
    .eq("place_id", placeId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  const reports = data ?? [];

  return {
    totalReports: reports.length,

    reportsLast24Hours:
      reports.filter(
        (report) =>
          report.created_at >= last24Hours
      ).length,

    reportsLast6Hours:
      reports.filter(
        (report) =>
          report.created_at >= last6Hours
      ).length,

    lastReportAt:
      reports[0]?.created_at ?? null,

    activeWarningsCount:
      reports.filter(
        (report) =>
          report.active_warning === true
      ).length,
  };
}

export async function getPlaceCommunityStatistics(
  placeId
) {
  if (!placeId) {
    return {
      helpfulVotesCount: 0,
      contentReportsCount: 0,
    };
  }

  const {
    data: reviews,
    error: reviewsError,
  } = await supabase
    .from("place_reviews")
    .select("id")
    .eq("place_id", placeId);

  if (reviewsError) {
    throw reviewsError;
  }

  const reviewIds = (reviews ?? []).map(
    (review) => review.id
  );

  let helpfulVotesCount = 0;

  if (reviewIds.length > 0) {
    const {
      count,
      error: helpfulError,
    } = await supabase
      .from("review_helpful_votes")
      .select("id", {
        count: "exact",
        head: true,
      })
      .in("review_id", reviewIds);

    if (helpfulError) {
      throw helpfulError;
    }

    helpfulVotesCount = count ?? 0;
  }

  const {
    count: reportsCount,
    error: reportsError,
  } = await supabase
    .from("content_reports")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("content_type", "place")
    .eq("content_id", placeId);

  if (reportsError) {
    /*
     * Zwykły użytkownik może nie mieć prawa
     * odczytywania zgłoszeń innych osób.
     * Nie blokujemy przez to karty miejsca.
     */
    console.warn(
      "Nie udało się pobrać liczby zgłoszeń miejsca:",
      reportsError
    );
  }

  return {
    helpfulVotesCount,
    contentReportsCount:
      reportsError
        ? 0
        : reportsCount ?? 0,
  };
}

export async function getCompletePlaceStatistics(
  placeId
) {
  const [
    baseResult,
    reviewsResult,
    liveResult,
  ] = await Promise.all([
    getPlaceStatistics(placeId),
    getPlaceReviewsStatistics(placeId),
    getPlaceLiveStatistics(placeId),
  ]);

  return {
    ...baseResult,

    reviews: reviewsResult,
    live: liveResult,

    hasFreshLiveData:
      liveResult.reportsLast6Hours > 0,

    hasActiveWarnings:
      liveResult.activeWarningsCount > 0,

    communityVerified:
      baseResult
        .uniqueRecentVerifiersCount >= 5,
  };
}

export function formatStatisticsDate(
  value
) {
  if (!value) {
    return "Brak danych";
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "Nieprawidłowa data";
  }

  return date.toLocaleString(
    "pl-PL",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

export function getStatisticsSummary(
  statistics
) {
  const safeStatistics =
    statistics ?? EMPTY_STATISTICS;

  return [
    {
      key: "rating",
      icon: "⭐",
      label: "Średnia ocen",
      value:
        safeStatistics.averageRating ===
        null
          ? "Brak"
          : `${safeStatistics.averageRating}/5`,
    },
    {
      key: "reviews",
      icon: "💬",
      label: "Opinie",
      value:
        safeStatistics.reviewsCount ?? 0,
    },
    {
      key: "photos",
      icon: "📷",
      label: "Zdjęcia",
      value:
        safeStatistics.photosCount ?? 0,
    },
    {
      key: "visits",
      icon: "✅",
      label: "Wizyty",
      value:
        safeStatistics.visitsCount ?? 0,
    },
    {
      key: "visitors",
      icon: "👥",
      label: "Odwiedzający",
      value:
        safeStatistics
          .uniqueVisitorsCount ?? 0,
    },
    {
      key: "favorites",
      icon: "❤️",
      label: "Ulubione",
      value:
        safeStatistics.favoritesCount ?? 0,
    },
    {
      key: "updates",
      icon: "🔴",
      label: "Aktualizacje",
      value:
        safeStatistics
          .liveReportsCount ?? 0,
    },
    {
      key: "verifications",
      icon: "✅",
      label: "Potwierdzenia",
      value:
        safeStatistics
          .verificationsCount ?? 0,
    },
  ];
}