import { supabase } from "../lib/supabase";

export async function submitPlaceUpdate({
  placeId,
  userId,
  proposedData,
  changedFields,
  message,
}) {
  if (!placeId) {
    throw new Error("Nie wybrano miejsca.");
  }

  if (!userId) {
    throw new Error("Musisz się zalogować.");
  }

  const { data, error } = await supabase
    .from("place_update_requests")
    .insert({
      place_id: placeId,
      user_id: userId,
      proposed_data: proposedData ?? {},
      changed_fields: changedFields ?? [],
      message: String(message ?? "").trim() || null,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function submitPlaceUpdateRequest({
  placeId,
  category,
  currentValue,
  proposedValue,
  sourceUrl,
}) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("Musisz się zalogować.");
  }

  if (!placeId) {
    throw new Error("Nie wybrano miejsca.");
  }

  const cleanCategory = String(category ?? "").trim();
  const cleanProposedValue = String(proposedValue ?? "").trim();
  const cleanCurrentValue = String(currentValue ?? "").trim();
  const cleanSourceUrl = String(sourceUrl ?? "").trim();

  if (!cleanCategory) {
    throw new Error("Wybierz kategorię zmian.");
  }

  if (cleanProposedValue.length < 5) {
    throw new Error("Opisz proponowaną zmianę dokładniej.");
  }

  return submitPlaceUpdate({
    placeId,
    userId: user.id,
    proposedData: {
      category: cleanCategory,
      current_value: cleanCurrentValue || null,
      proposed_value: cleanProposedValue,
      source_url: cleanSourceUrl || null,
    },
    changedFields: [cleanCategory],
    message: cleanProposedValue,
  });
}

export async function getPendingPlaceUpdates() {
  const { data, error } = await supabase
    .from("place_update_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function approvePlaceUpdate(id) {
  if (!id) {
    throw new Error("Nie wybrano aktualizacji.");
  }

  const { data, error } = await supabase
    .from("place_update_requests")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function rejectPlaceUpdate(id) {
  if (!id) {
    throw new Error("Nie wybrano aktualizacji.");
  }

  const { data, error } = await supabase
    .from("place_update_requests")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}