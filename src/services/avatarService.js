import { supabase } from "../lib/supabase";

const BUCKET = "avatars";
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

function getSafeExtension(file) {
  const extension =
    file.name.split(".").pop()?.toLowerCase() || "jpg";

  return extension.replace(/[^a-z0-9]/g, "") || "jpg";
}

export async function uploadAvatar(file) {
  if (!file) {
    throw new Error("Najpierw wybierz zdjęcie.");
  }

  if (!file.type?.startsWith("image/")) {
    throw new Error(
      "Możesz wybrać tylko plik ze zdjęciem."
    );
  }

  if (file.size > MAX_AVATAR_SIZE) {
    throw new Error(
      "Zdjęcie profilowe może mieć maksymalnie 5 MB."
    );
  }

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

  const buffer = await file.arrayBuffer();

  if (!buffer.byteLength) {
    throw new Error(
      "Zdjęcie nie zawiera danych. Wybierz je ponownie."
    );
  }

  const extension = getSafeExtension(file);

  const uniqueId =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  const filePath =
    `${user.id}/${Date.now()}-${uniqueId}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, buffer, {
      contentType: file.type || "image/jpeg",
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData?.publicUrl;

  if (!publicUrl) {
    throw new Error(
      "Nie udało się utworzyć adresu zdjęcia."
    );
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileError) {
    throw profileError;
  }

  return publicUrl;
}

export async function removeAvatar() {
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

  const { error } = await supabase
    .from("profiles")
    .update({
      avatar_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    throw error;
  }
}