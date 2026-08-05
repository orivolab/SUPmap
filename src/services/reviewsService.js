import { supabase } from "../lib/supabase";

async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user ?? null;
}

async function getProfilesMap(userIds) {
  const uniqueUserIds = [
    ...new Set(
      (userIds ?? []).filter(Boolean)
    ),
  ];

  if (uniqueUserIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .in("id", uniqueUserIds);

  if (error) {
    console.warn(
      "Nie udało się pobrać profili autorów opinii:",
      error
    );

    return new Map();
  }

  return new Map(
    (data ?? []).map((profile) => [
      profile.id,
      profile,
    ])
  );
}

async function attachProfilesToReviews(reviews) {
  const safeReviews = reviews ?? [];

  const profilesMap =
    await getProfilesMap(
      safeReviews.map(
        (review) => review.user_id
      )
    );

  return safeReviews.map((review) => ({
    ...review,

    profiles:
      profilesMap.get(review.user_id) ??
      null,
  }));
}

export async function getApprovedReviews(
  placeId
) {
  if (!placeId) {
    return [];
  }

  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("place_reviews")
    .select(`
      *,
      review_helpful_votes (
        id,
        user_id
      )
    `)
    .eq("place_id", placeId)
    .eq("status", "approved")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  const reviewsWithProfiles =
    await attachProfilesToReviews(
      data ?? []
    );

  return reviewsWithProfiles.map(
    (review) => {
      const helpfulVotes =
        review.review_helpful_votes ?? [];

      return {
        ...review,

        helpfulCount:
          helpfulVotes.length,

        currentUserMarkedHelpful:
          Boolean(
            user &&
              helpfulVotes.some(
                (vote) =>
                  vote.user_id === user.id
              )
          ),
      };
    }
  );
}

export async function getPendingReviews() {
  const { data, error } = await supabase
    .from("place_reviews")
    .select(`
      *,
      place_submissions (
        id,
        name,
        city
      )
    `)
    .eq("status", "pending")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return attachProfilesToReviews(
    data ?? []
  );
}

export async function getRejectedReviews() {
  const { data, error } = await supabase
    .from("place_reviews")
    .select(`
      *,
      place_submissions (
        id,
        name,
        city
      )
    `)
    .eq("status", "rejected")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return attachProfilesToReviews(
    data ?? []
  );
}

export async function submitReview({
  placeId,
  author,
  rating,
  comment,
}) {
  if (!placeId) {
    throw new Error(
      "Nie wybrano miejsca."
    );
  }

  const user = await getCurrentUser();

  if (!user) {
    throw new Error(
      "Musisz się zalogować, aby dodać opinię."
    );
  }

  const cleanAuthor = String(
    author ?? ""
  ).trim();

  const cleanComment = String(
    comment ?? ""
  ).trim();

  const parsedRating =
    Number(rating);

  if (cleanAuthor.length < 2) {
    throw new Error(
      "Wpisz swoje imię lub nazwę użytkownika."
    );
  }

  if (
    !Number.isInteger(parsedRating) ||
    parsedRating < 1 ||
    parsedRating > 5
  ) {
    throw new Error(
      "Ocena musi wynosić od 1 do 5."
    );
  }

  if (cleanComment.length < 5) {
    throw new Error(
      "Opinia musi mieć co najmniej 5 znaków."
    );
  }

  if (cleanComment.length > 1000) {
    throw new Error(
      "Opinia może mieć maksymalnie 1000 znaków."
    );
  }

  const { data, error } = await supabase
    .from("place_reviews")
    .insert({
      place_id: placeId,
      user_id: user.id,
      author: cleanAuthor,
      rating: parsedRating,
      comment: cleanComment,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    ...data,

    profiles: {
      id: user.id,

      username:
        user.user_metadata?.username ||
        cleanAuthor,

      avatar_url:
        user.user_metadata?.avatar_url ||
        null,
    },
  };
}

export async function approveReview(
  reviewId
) {
  if (!reviewId) {
    throw new Error(
      "Nie wybrano opinii."
    );
  }

  const { data, error } = await supabase
    .from("place_reviews")
    .update({
      status: "approved",
    })
    .eq("id", reviewId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function rejectReview(
  reviewId
) {
  if (!reviewId) {
    throw new Error(
      "Nie wybrano opinii."
    );
  }

  const { data, error } = await supabase
    .from("place_reviews")
    .update({
      status: "rejected",
    })
    .eq("id", reviewId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteReview(
  reviewId
) {
  if (!reviewId) {
    throw new Error(
      "Nie wybrano opinii."
    );
  }

  const { error } = await supabase
    .from("place_reviews")
    .delete()
    .eq("id", reviewId);

  if (error) {
    throw error;
  }
}

export async function getUserReviews(
  userId
) {
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("place_reviews")
    .select(`
      *,
      place_submissions (
        id,
        name,
        city,
        image_url
      )
    `)
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  const profileMap =
    await getProfilesMap([userId]);

  return (data ?? []).map(
    (review) => ({
      ...review,

      profiles:
        profileMap.get(review.user_id) ??
        null,
    })
  );
}

export async function markReviewHelpful(
  reviewId
) {
  if (!reviewId) {
    throw new Error(
      "Nie wybrano opinii."
    );
  }

  const user = await getCurrentUser();

  if (!user) {
    throw new Error(
      "Musisz się zalogować, aby oznaczyć opinię jako pomocną."
    );
  }

  const { data, error } = await supabase
    .from("review_helpful_votes")
    .insert({
      review_id: reviewId,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "Ta opinia jest już oznaczona przez Ciebie jako pomocna."
      );
    }

    throw error;
  }

  return data;
}

export async function removeHelpfulVote(
  reviewId
) {
  if (!reviewId) {
    throw new Error(
      "Nie wybrano opinii."
    );
  }

  const user = await getCurrentUser();

  if (!user) {
    throw new Error(
      "Musisz się zalogować."
    );
  }

  const { error } = await supabase
    .from("review_helpful_votes")
    .delete()
    .eq("review_id", reviewId)
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }
}

export async function toggleReviewHelpful({
  reviewId,
  currentlyHelpful,
}) {
  if (currentlyHelpful) {
    await removeHelpfulVote(reviewId);

    return {
      helpful: false,
    };
  }

  await markReviewHelpful(reviewId);

  return {
    helpful: true,
  };
}

export async function reportReview({
  reviewId,
  reason,
  description,
}) {
  if (!reviewId) {
    throw new Error(
      "Nie wybrano opinii."
    );
  }

  const user = await getCurrentUser();

  if (!user) {
    throw new Error(
      "Musisz się zalogować, aby zgłosić opinię."
    );
  }

  const cleanReason = String(
    reason ?? ""
  ).trim();

  const cleanDescription = String(
    description ?? ""
  ).trim();

  if (!cleanReason) {
    throw new Error(
      "Wybierz powód zgłoszenia."
    );
  }

  const { data, error } = await supabase
    .from("content_reports")
    .insert({
      reporter_id: user.id,
      content_type: "review",
      content_id: reviewId,
      reason: cleanReason,
      description:
        cleanDescription || null,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export function calculateAverageRating(
  reviews
) {
  if (!reviews?.length) {
    return null;
  }

  const validRatings = reviews
    .map((review) =>
      Number(review.rating)
    )
    .filter(
      (rating) =>
        Number.isFinite(rating) &&
        rating >= 1 &&
        rating <= 5
    );

  if (validRatings.length === 0) {
    return null;
  }

  const total = validRatings.reduce(
    (sum, rating) =>
      sum + rating,
    0
  );

  return Number(
    (
      total /
      validRatings.length
    ).toFixed(1)
  );
}

export function getRatingDistribution(
  reviews
) {
  const distribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  (reviews ?? []).forEach(
    (review) => {
      const rating =
        Number(review.rating);

      if (
        Number.isInteger(rating) &&
        rating >= 1 &&
        rating <= 5
      ) {
        distribution[rating] += 1;
      }
    }
  );

  return distribution;
}

export function sortReviews(
  reviews,
  sortMode
) {
  const items = [
    ...(reviews ?? []),
  ];

  if (sortMode === "helpful") {
    return items.sort(
      (a, b) =>
        Number(
          b.helpfulCount ?? 0
        ) -
        Number(
          a.helpfulCount ?? 0
        )
    );
  }

  if (sortMode === "highest") {
    return items.sort(
      (a, b) =>
        Number(b.rating ?? 0) -
        Number(a.rating ?? 0)
    );
  }

  if (sortMode === "lowest") {
    return items.sort(
      (a, b) =>
        Number(a.rating ?? 0) -
        Number(b.rating ?? 0)
    );
  }

  return items.sort(
    (a, b) =>
      new Date(b.created_at) -
      new Date(a.created_at)
  );
}
export async function getApprovedReviewStats() {
  const { data, error } = await supabase
    .from("place_reviews")
    .select("place_id, rating")
    .eq("status", "approved");

  if (error) {
    throw error;
  }

  const groupedReviews = {};

  (data ?? []).forEach((review) => {
    const placeId = String(
      review.place_id
    );

    const rating = Number(
      review.rating
    );

    if (
      !Number.isFinite(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return;
    }

    if (!groupedReviews[placeId]) {
      groupedReviews[placeId] = {
        total: 0,
        count: 0,
      };
    }

    groupedReviews[placeId].total +=
      rating;

    groupedReviews[placeId].count += 1;
  });

  const result = {};

  Object.entries(
    groupedReviews
  ).forEach(
    ([placeId, values]) => {
      result[placeId] = {
        averageRating: Number(
          (
            values.total /
            values.count
          ).toFixed(1)
        ),

        reviewsCount:
          values.count,
      };
    }
  );

  return result;
}