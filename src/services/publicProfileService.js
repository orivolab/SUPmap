import { supabase } from "../lib/supabase";

export async function getPublicProfile(userId) {
  if (!userId) {
    throw new Error("Nie wybrano użytkownika.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      avatar_url,
      points,
      created_at
    `)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "Nie znaleziono profilu użytkownika."
    );
  }

  return data;
}

export async function getPublicProfileStats(userId) {
  if (!userId) {
    return {
      friendsCount: 0,
      reviewsCount: 0,
      photosCount: 0,
      placesCount: 0,
    };
  }

  const [
    friendshipsResult,
    reviewsResult,
    photosResult,
    placesResult,
  ] = await Promise.all([
    supabase
      .from("friendships")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "accepted")
      .or(
        `sender_id.eq.${userId},receiver_id.eq.${userId}`
      ),

    supabase
      .from("place_reviews")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", userId)
      .eq("status", "approved"),

    supabase
      .from("place_photos")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", userId)
      .eq("status", "approved"),

    supabase
      .from("place_submissions")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", userId)
      .eq("status", "approved"),
  ]);

  const firstError =
    friendshipsResult.error ||
    reviewsResult.error ||
    photosResult.error ||
    placesResult.error;

  if (firstError) {
    throw firstError;
  }

  return {
    friendsCount:
      friendshipsResult.count ?? 0,
    reviewsCount:
      reviewsResult.count ?? 0,
    photosCount:
      photosResult.count ?? 0,
    placesCount:
      placesResult.count ?? 0,
  };
}

export async function getPublicUserReviews(userId) {
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("place_reviews")
    .select(`
      id,
      rating,
      comment,
      created_at,
      place_submissions (
        id,
        name,
        city
      )
    `)
    .eq("user_id", userId)
    .eq("status", "approved")
    .order("created_at", {
      ascending: false,
    })
    .limit(10);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getPublicUserPhotos(userId) {
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("place_photos")
    .select(`
      id,
      image_url,
      created_at,
      place_submissions (
        id,
        name,
        city
      )
    `)
    .eq("user_id", userId)
    .eq("status", "approved")
    .order("created_at", {
      ascending: false,
    })
    .limit(12);

  if (error) {
    throw error;
  }

  return data ?? [];
}