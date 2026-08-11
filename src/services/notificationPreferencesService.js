import { supabase } from "../lib/supabase";

export async function getNotificationPreferences(
  userId
) {
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}

export async function createDefaultNotificationPreferences(
  userId
) {
  if (!userId) {
    throw new Error(
      "Nie znaleziono użytkownika."
    );
  }

  const { data, error } = await supabase
    .from("notification_preferences")
    .insert({
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return getNotificationPreferences(
        userId
      );
    }

    throw error;
  }

  return data;
}

export async function ensureNotificationPreferences(
  userId
) {
  const existing =
    await getNotificationPreferences(
      userId
    );

  if (existing) {
    return existing;
  }

  return createDefaultNotificationPreferences(
    userId
  );
}

export async function updateNotificationPreferences(
  userId,
  changes
) {
  if (!userId) {
    throw new Error(
      "Nie znaleziono użytkownika."
    );
  }

  const allowedChanges = {
    new_places:
      Boolean(changes.new_places),
    place_updates:
      Boolean(changes.place_updates),
    place_edits:
      Boolean(changes.place_edits),
    new_messages:
      Boolean(changes.new_messages),
    watched_places:
      Boolean(changes.watched_places),
    push_enabled:
      Boolean(changes.push_enabled),
    email_enabled:
      Boolean(changes.email_enabled),
    email_frequency:
      changes.email_frequency ||
      "instant",
    updated_at:
      new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("notification_preferences")
    .update(allowedChanges)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}