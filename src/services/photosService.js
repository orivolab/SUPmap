import { supabase } from "../lib/supabase";

const BUCKET_NAME = "place-images";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const PHOTO_CATEGORIES = [
  "Wejście do wody",
  "Plaża",
  "Parking",
  "Woda",
  "Udogodnienia",
  "Inne",
];

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

function normalizeNullableText(value) {
  const cleanValue = String(value ?? "").trim();

  return cleanValue || null;
}

function validatePhotoCategory(category) {
  const cleanCategory =
    normalizeNullableText(category);

  if (!cleanCategory) {
    return null;
  }

  if (!PHOTO_CATEGORIES.includes(cleanCategory)) {
    throw new Error(
      "Wybrano nieprawidłową kategorię zdjęcia."
    );
  }

  return cleanCategory;
}

function validateTakenAt(takenAt) {
  if (!takenAt) {
    return null;
  }

  const date = new Date(takenAt);

  if (Number.isNaN(date.getTime())) {
    throw new Error(
      "Nieprawidłowa data wykonania zdjęcia."
    );
  }

  if (
    date.getTime() >
    Date.now() + 5 * 60 * 1000
  ) {
    throw new Error(
      "Data wykonania zdjęcia nie może być z przyszłości."
    );
  }

  return date.toISOString();
}

function createFileName(
  image,
  userId,
  folder = "place-photos"
) {
  const extension =
    String(image.name)
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

  return `${userId}/${folder}/${Date.now()}-${uniqueId}.${safeExtension}`;
}

export function getPhotoCategories() {
  return [...PHOTO_CATEGORIES];
}

export async function prepareImageFile(file) {
  if (!file) {
    throw new Error("Wybierz zdjęcie.");
  }

  if (!file.type?.startsWith("image/")) {
    throw new Error(
      "Możesz wybrać tylko plik ze zdjęciem."
    );
  }

  if (file.size > MAX_IMAGE_SIZE) {
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

export async function uploadUserImage(
  image,
  folder = "place-photos"
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error(
      "Musisz się zalogować, aby dodać zdjęcie."
    );
  }

  if (!image?.buffer?.byteLength) {
    throw new Error(
      "Zdjęcie nie zawiera danych. Wybierz je ponownie."
    );
  }

  const filePath = createFileName(
    image,
    user.id,
    folder
  );

  const { error: uploadError } =
    await supabase.storage
      .from(BUCKET_NAME)
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
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error(
      "Nie udało się utworzyć adresu zdjęcia."
    );
  }

  return {
    imageUrl: data.publicUrl,
    filePath,
    userId: user.id,
  };
}

export async function submitPlacePhoto({
  placeId,
  image,
  category = null,
  takenAt = null,
}) {
  if (!placeId) {
    throw new Error("Nie wybrano miejsca.");
  }

  if (!image) {
    throw new Error("Wybierz zdjęcie.");
  }

  const cleanCategory =
    validatePhotoCategory(category);

  const parsedTakenAt =
    validateTakenAt(takenAt);

  const upload = await uploadUserImage(
    image,
    "place-photos"
  );

  const { data, error } = await supabase
    .from("place_photos")
    .insert({
      place_id: placeId,
      user_id: upload.userId,
      image_url: upload.imageUrl,
      photo_category: cleanCategory,
      taken_at: parsedTakenAt,
      status: "pending",
    })
    .select(`
      *,
      profiles (
        id,
        username,
        avatar_url
      ),
      place_submissions (
        id,
        name,
        city
      )
    `)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getApprovedPlacePhotos(
  placeId,
  {
    category = null,
    limit = 100,
  } = {}
) {
  if (!placeId) {
    return [];
  }

  let query = supabase
    .from("place_photos")
    .select(`
      *,
      profiles (
        id,
        username,
        avatar_url
      )
    `)
    .eq("place_id", placeId)
    .eq("status", "approved")
    .order("taken_at", {
      ascending: false,
      nullsFirst: false,
    })
    .order("created_at", {
      ascending: false,
    })
    .limit(Math.max(Number(limit) || 100, 1));

  const cleanCategory =
    normalizeNullableText(category);

  if (cleanCategory) {
    validatePhotoCategory(cleanCategory);

    query = query.eq(
      "photo_category",
      cleanCategory
    );
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getPendingPhotos() {
  const { data, error } = await supabase
    .from("place_photos")
    .select(`
      *,
      place_submissions (
        id,
        name,
        city
      ),
      profiles (
        id,
        username,
        avatar_url
      )
    `)
    .eq("status", "pending")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getRejectedPhotos() {
  const { data, error } = await supabase
    .from("place_photos")
    .select(`
      *,
      place_submissions (
        id,
        name,
        city
      ),
      profiles (
        id,
        username,
        avatar_url
      )
    `)
    .eq("status", "rejected")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function approvePhoto(photoId) {
  if (!photoId) {
    throw new Error("Nie wybrano zdjęcia.");
  }

  const { data, error } = await supabase
    .from("place_photos")
    .update({
      status: "approved",
    })
    .eq("id", photoId)
    .select(`
      *,
      profiles (
        id,
        username,
        avatar_url
      ),
      place_submissions (
        id,
        name,
        city
      )
    `)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function rejectPhoto(photoId) {
  if (!photoId) {
    throw new Error("Nie wybrano zdjęcia.");
  }

  const { data, error } = await supabase
    .from("place_photos")
    .update({
      status: "rejected",
    })
    .eq("id", photoId)
    .select(`
      *,
      profiles (
        id,
        username,
        avatar_url
      ),
      place_submissions (
        id,
        name,
        city
      )
    `)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deletePhoto(photoId) {
  if (!photoId) {
    throw new Error("Nie wybrano zdjęcia.");
  }

  const { error } = await supabase
    .from("place_photos")
    .delete()
    .eq("id", photoId);

  if (error) {
    throw error;
  }
}

export async function deleteOwnPhoto(photoId) {
  if (!photoId) {
    throw new Error("Nie wybrano zdjęcia.");
  }

  const user = await getCurrentUser();

  if (!user) {
    throw new Error(
      "Musisz się zalogować."
    );
  }

  const { error } = await supabase
    .from("place_photos")
    .delete()
    .eq("id", photoId)
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }
}

export async function getUserPhotos(userId) {
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("place_photos")
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

  return data ?? [];
}

export async function getCurrentUserPhotos() {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  return getUserPhotos(user.id);
}

export async function updateOwnPhotoDetails(
  photoId,
  {
    category,
    takenAt,
  }
) {
  if (!photoId) {
    throw new Error("Nie wybrano zdjęcia.");
  }

  const user = await getCurrentUser();

  if (!user) {
    throw new Error(
      "Musisz się zalogować."
    );
  }

  const payload = {};

  if (
    Object.prototype.hasOwnProperty.call(
      arguments[1] ?? {},
      "category"
    )
  ) {
    payload.photo_category =
      validatePhotoCategory(category);
  }

  if (
    Object.prototype.hasOwnProperty.call(
      arguments[1] ?? {},
      "takenAt"
    )
  ) {
    payload.taken_at =
      validateTakenAt(takenAt);
  }

  if (Object.keys(payload).length === 0) {
    throw new Error(
      "Nie podano zmian do zapisania."
    );
  }

  const { data, error } = await supabase
    .from("place_photos")
    .update(payload)
    .eq("id", photoId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function reportPhoto({
  photoId,
  reason,
  description,
}) {
  if (!photoId) {
    throw new Error("Nie wybrano zdjęcia.");
  }

  const user = await getCurrentUser();

  if (!user) {
    throw new Error(
      "Musisz się zalogować, aby zgłosić zdjęcie."
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
      content_type: "photo",
      content_id: photoId,
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

export function sortPlacePhotos(
  photos,
  sortMode = "newest"
) {
  const items = [...(photos ?? [])];

  if (sortMode === "oldest") {
    return items.sort(
      (a, b) =>
        new Date(
          a.taken_at || a.created_at
        ) -
        new Date(
          b.taken_at || b.created_at
        )
    );
  }

  return items.sort(
    (a, b) =>
      new Date(
        b.taken_at || b.created_at
      ) -
      new Date(
        a.taken_at || a.created_at
      )
  );
}

export function groupPhotosByCategory(
  photos
) {
  return (photos ?? []).reduce(
    (groups, photo) => {
      const category =
        photo.photo_category || "Inne";

      if (!groups[category]) {
        groups[category] = [];
      }

      groups[category].push(photo);

      return groups;
    },
    {}
  );
}

export function formatPhotoDate(photo) {
  const value =
    photo?.taken_at ||
    photo?.created_at;

  if (!value) {
    return "Brak daty";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Brak daty";
  }

  return date.toLocaleDateString(
    "pl-PL",
    {
      dateStyle: "medium",
    }
  );
}