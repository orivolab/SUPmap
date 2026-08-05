import { supabase } from "../lib/supabase";

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user ?? null;
}

export async function getProfile(userId) {
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}

export async function updateProfile(userId, changes) {
  if (!userId) {
    throw new Error("Nie znaleziono użytkownika.");
  }

  const allowedChanges = {
    username: String(changes.username ?? "").trim(),
    avatar_url: changes.avatar_url ?? null,
    updated_at: new Date().toISOString(),
  };

  if (allowedChanges.username.length < 2) {
    throw new Error(
      "Nazwa użytkownika musi mieć co najmniej 2 znaki."
    );
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(allowedChanges)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getUserFavorites(userId) {
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("favorite_places")
    .select(`
      id,
      place_id,
      created_at,
      place_submissions (
        *
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((favorite) => ({
    favoriteId: favorite.id,
    placeId: favorite.place_id,
    createdAt: favorite.created_at,
    place: favorite.place_submissions
      ? {
          ...favorite.place_submissions,
          source: "database",
        }
      : null,
  }));
}

export async function addFavorite(placeId) {
  if (!placeId) {
    throw new Error("Nie wybrano miejsca.");
  }

  const user = await getCurrentUser();

  if (!user) {
    throw new Error(
      "Musisz się zalogować, aby zapisać miejsce."
    );
  }

  const { data, error } = await supabase
    .from("favorite_places")
    .insert({
      user_id: user.id,
      place_id: placeId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "To miejsce jest już zapisane w ulubionych."
      );
    }

    throw error;
  }

  return data;
}

export async function removeFavorite(placeId) {
  if (!placeId) {
    throw new Error("Nie wybrano miejsca.");
  }

  const user = await getCurrentUser();

  if (!user) {
    throw new Error(
      "Musisz się zalogować, aby usunąć miejsce z ulubionych."
    );
  }

  const { error } = await supabase
    .from("favorite_places")
    .delete()
    .eq("user_id", user.id)
    .eq("place_id", placeId);

  if (error) {
    throw error;
  }
}

export async function isPlaceFavorite(userId, placeId) {
  if (!userId || !placeId) {
    return false;
  }

  const { data, error } = await supabase
    .from("favorite_places")
    .select("id")
    .eq("user_id", userId)
    .eq("place_id", placeId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function getPointsHistory(userId) {
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("points_events")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export function getUserLevel(points = 0) {
  const safePoints = Number(points) || 0;

  if (safePoints >= 1000) {
    return {
      name: "Legenda SUP",
      icon: "🏆",
      minimum: 1000,
      nextMinimum: null,
    };
  }

  if (safePoints >= 500) {
    return {
      name: "Ekspert SUP",
      icon: "🌊",
      minimum: 500,
      nextMinimum: 1000,
    };
  }

  if (safePoints >= 200) {
    return {
      name: "Odkrywca jezior",
      icon: "🧭",
      minimum: 200,
      nextMinimum: 500,
    };
  }

  if (safePoints >= 50) {
    return {
      name: "Początkujący odkrywca",
      icon: "🏄",
      minimum: 50,
      nextMinimum: 200,
    };
  }

  return {
    name: "Nowy użytkownik",
    icon: "🌱",
    minimum: 0,
    nextMinimum: 50,
  };
}

export function getPointsToNextLevel(points = 0) {
  const safePoints = Number(points) || 0;
  const level = getUserLevel(safePoints);

  if (!level.nextMinimum) {
    return 0;
  }

  return Math.max(level.nextMinimum - safePoints, 0);
}