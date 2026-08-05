import { supabase } from "../lib/supabase";

const VISIT_IMAGES_BUCKET = "place-images";
const MAX_VISIT_IMAGE_SIZE =
  5 * 1024 * 1024;

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

function createVisitImagePath(
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

  return `${userId}/visits/${Date.now()}-${uniqueId}.${safeExtension}`;
}

export async function prepareVisitImage(file) {
  if (!file) {
    return null;
  }

  if (!file.type?.startsWith("image/")) {
    throw new Error(
      "Możesz wybrać tylko plik ze zdjęciem."
    );
  }

  if (file.size > MAX_VISIT_IMAGE_SIZE) {
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

export async function uploadVisitImage(
  image
) {
  if (!image) {
    return null;
  }

  const user = await getCurrentUser();

  if (!user) {
    throw new Error(
      "Musisz się zalogować, aby dodać zdjęcie."
    );
  }

  if (!image.buffer?.byteLength) {
    throw new Error(
      "Zdjęcie nie zawiera danych."
    );
  }

  const filePath = createVisitImagePath(
    image.name,
    user.id
  );

  const { error: uploadError } =
    await supabase.storage
      .from(VISIT_IMAGES_BUCKET)
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
    .from(VISIT_IMAGES_BUCKET)
    .getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error(
      "Nie udało się utworzyć adresu zdjęcia."
    );
  }

  return data.publicUrl;
}

export async function addPlaceVisit({
  placeId,
  visitedAt,
  privateNote,
  image,
}) {
  if (!placeId) {
    throw new Error("Nie wybrano miejsca.");
  }

  const user = await getCurrentUser();

  if (!user) {
    throw new Error(
      "Musisz się zalogować, aby oznaczyć wizytę."
    );
  }

  let imageUrl = null;

  if (image) {
    imageUrl = await uploadVisitImage(image);
  }

  const cleanPrivateNote = String(
    privateNote ?? ""
  ).trim();

  const parsedVisitedAt = visitedAt
    ? new Date(visitedAt)
    : new Date();

  if (
    Number.isNaN(parsedVisitedAt.getTime())
  ) {
    throw new Error(
      "Nieprawidłowa data wizyty."
    );
  }

  if (
    parsedVisitedAt.getTime() >
    Date.now() + 5 * 60 * 1000
  ) {
    throw new Error(
      "Data wizyty nie może być z przyszłości."
    );
  }

  const { data, error } = await supabase
    .from("place_visits")
    .insert({
      place_id: placeId,
      user_id: user.id,
      visited_at:
        parsedVisitedAt.toISOString(),
      private_note:
        cleanPrivateNote || null,
      image_url: imageUrl,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getPlaceVisitStats(
  placeId
) {
  if (!placeId) {
    return {
      visitsCount: 0,
      uniqueVisitorsCount: 0,
      currentUserVisitsCount: 0,
      currentUserLastVisitAt: null,
    };
  }

  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("place_visits")
    .select(
      "id, user_id, visited_at"
    )
    .eq("place_id", placeId)
    .order("visited_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  const visits = data ?? [];

  const uniqueVisitors = new Set(
    visits.map((visit) => visit.user_id)
  );

  const currentUserVisits = user
    ? visits.filter(
        (visit) =>
          visit.user_id === user.id
      )
    : [];

  return {
    visitsCount: visits.length,
    uniqueVisitorsCount:
      uniqueVisitors.size,
    currentUserVisitsCount:
      currentUserVisits.length,
    currentUserLastVisitAt:
      currentUserVisits[0]
        ?.visited_at ?? null,
  };
}

export async function getCurrentUserVisits(
  placeId
) {
  if (!placeId) {
    return [];
  }

  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("place_visits")
    .select("*")
    .eq("place_id", placeId)
    .eq("user_id", user.id)
    .order("visited_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getUserVisits(
  userId
) {
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("place_visits")
    .select(`
      *,
      place_submissions (
        id,
        name,
        city,
        image_url,
        lat,
        lng
      )
    `)
    .eq("user_id", userId)
    .order("visited_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function updateOwnVisit(
  visitId,
  changes
) {
  if (!visitId) {
    throw new Error(
      "Nie wybrano wizyty."
    );
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
      changes,
      "privateNote"
    )
  ) {
    const cleanNote = String(
      changes.privateNote ?? ""
    ).trim();

    payload.private_note =
      cleanNote || null;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      changes,
      "visitedAt"
    )
  ) {
    const parsedDate = new Date(
      changes.visitedAt
    );

    if (
      Number.isNaN(parsedDate.getTime())
    ) {
      throw new Error(
        "Nieprawidłowa data wizyty."
      );
    }

    if (
      parsedDate.getTime() >
      Date.now() + 5 * 60 * 1000
    ) {
      throw new Error(
        "Data wizyty nie może być z przyszłości."
      );
    }

    payload.visited_at =
      parsedDate.toISOString();
  }

  if (
    Object.keys(payload).length === 0
  ) {
    throw new Error(
      "Nie podano zmian do zapisania."
    );
  }

  const { data, error } = await supabase
    .from("place_visits")
    .update(payload)
    .eq("id", visitId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteOwnVisit(
  visitId
) {
  if (!visitId) {
    throw new Error(
      "Nie wybrano wizyty."
    );
  }

  const user = await getCurrentUser();

  if (!user) {
    throw new Error(
      "Musisz się zalogować."
    );
  }

  const { error } = await supabase
    .from("place_visits")
    .delete()
    .eq("id", visitId)
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }
}

export function formatVisitDate(
  visitedAt
) {
  if (!visitedAt) {
    return "Brak daty";
  }

  const date = new Date(visitedAt);

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