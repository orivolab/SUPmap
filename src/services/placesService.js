import { supabase } from "../lib/supabase";
import { supabase } from "../lib/supabase";

function normalizePlace(place, statistics = null) {
  if (!place) {
    return null;
  }

  return {
    ...place,
    source: "database",
    statistics,
  };
}

async function getStatisticsMap(placeIds) {
  const uniqueIds = [
    ...new Set(
      (placeIds ?? []).filter(
        (id) =>
          id !== null &&
          id !== undefined
      )
    ),
  ];

  if (uniqueIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("place_statistics")
    .select("*")
    .in("place_id", uniqueIds);

  if (error) {
    /*
     * Brak statystyk nie może ukrywać miejsc.
     * Miejsca zostaną pokazane bez statystyk.
     */
    console.warn(
      "Nie udało się pobrać statystyk miejsc:",
      error
    );

    return new Map();
  }

  return new Map(
    (data ?? []).map((row) => [
      row.place_id,
      row,
    ])
  );
}

async function attachStatistics(places) {
  const safePlaces = places ?? [];

  const statisticsMap =
    await getStatisticsMap(
      safePlaces.map(
        (place) => place.id
      )
    );

  return safePlaces
    .map((place) =>
      normalizePlace(
        place,
        statisticsMap.get(place.id) ??
          null
      )
    )
    .filter(Boolean);
}

export async function getApprovedPlaces() {
  const { data, error } = await supabase
    .from("place_submissions")
    .select("*")
    .eq("status", "approved")
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Błąd pobierania zatwierdzonych miejsc:",
      error
    );

    throw error;
  }

  /*
   * Nie filtrujemy tutaj po place_status,
   * żeby zamknięte miejsce nie znikało
   * z panelu administratora ani mapy.
   */
  return attachStatistics(data ?? []);
}

export async function getApprovedPlaceById(
  placeId
) {
  if (
    placeId === null ||
    placeId === undefined
  ) {
    return null;
  }

  const { data, error } = await supabase
    .from("place_submissions")
    .select("*")
    .eq("id", placeId)
    .eq("status", "approved")
    .maybeSingle();

  if (error) {
    console.error(
      "Błąd pobierania miejsca:",
      error
    );

    throw error;
  }

  if (!data) {
    return null;
  }

  const places =
    await attachStatistics([data]);

  return places[0] ?? null;
}

export async function getPendingPlaces() {
  const { data, error } = await supabase
    .from("place_submissions")
    .select("*")
    .eq("status", "pending")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Błąd pobierania oczekujących miejsc:",
      error
    );

    throw error;
  }

  return data ?? [];
}

export async function getRejectedPlaces() {
  const { data, error } = await supabase
    .from("place_submissions")
    .select("*")
    .eq("status", "rejected")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Błąd pobierania odrzuconych miejsc:",
      error
    );

    throw error;
  }

  return data ?? [];
}

export async function getAllPlacesForAdmin() {
  const { data, error } = await supabase
    .from("place_submissions")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Błąd pobierania wszystkich miejsc:",
      error
    );

    throw error;
  }

  return data ?? [];
}

export async function submitPlace(
  placeData
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error(
      "Musisz się zalogować, aby dodać miejsce."
    );
  }

  const submission = {
    ...placeData,
    user_id: user.id,
    status: "pending",

    place_status:
      placeData.place_status ||
      "active",

    static_data_updated_at:
      new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("place_submissions")
    .insert(submission)
    .select("*")
    .single();

  if (error) {
    console.error(
      "Błąd dodawania miejsca:",
      error
    );

    throw error;
  }

  return data;
}

export async function updatePlace(
  placeId,
  changes
) {
  if (
    placeId === null ||
    placeId === undefined
  ) {
    throw new Error(
      "Nie wybrano miejsca."
    );
  }

  const payload = {
    ...changes,

    static_data_updated_at:
      new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("place_submissions")
    .update(payload)
    .eq("id", placeId)
    .select("*")
    .single();

  if (error) {
    console.error(
      "Błąd aktualizacji miejsca:",
      error
    );

    throw error;
  }

  return data;
}

export async function approvePlace(
  placeId
) {
  return updatePlace(placeId, {
    status: "approved",
  });
}

export async function rejectPlace(
  placeId
) {
  return updatePlace(placeId, {
    status: "rejected",
  });
}

export async function movePlaceToPending(
  placeId
) {
  return updatePlace(placeId, {
    status: "pending",
  });
}

export async function setPlaceStatus(
  placeId,
  placeStatus
) {
  const allowedStatuses = [
    "active",
    "temporarily_closed",
    "closed",
  ];

  if (
    !allowedStatuses.includes(
      placeStatus
    )
  ) {
    throw new Error(
      "Nieprawidłowy status miejsca."
    );
  }

  return updatePlace(placeId, {
    place_status: placeStatus,
  });
}

export async function deletePlace(
  placeId
) {
  if (
    placeId === null ||
    placeId === undefined
  ) {
    throw new Error(
      "Nie wybrano miejsca."
    );
  }

  const { error } = await supabase
    .from("place_submissions")
    .delete()
    .eq("id", placeId);

  if (error) {
    console.error(
      "Błąd usuwania miejsca:",
      error
    );

    throw error;
  }
}

export async function getUserPlaceSubmissions(
  userId
) {
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("place_submissions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export function searchPlaces(
  places,
  searchText
) {
  const text = String(
    searchText ?? ""
  )
    .trim()
    .toLowerCase();

  if (!text) {
    return places ?? [];
  }

  return (places ?? []).filter(
    (place) => {
      const searchableValues = [
        place.name,
        place.city,
        place.description,
        place.important_info,
        place.parking_description,
        place.dogs_description,
        place.toilets_description,
        place.showers_description,
        place.changing_rooms_description,
        place.gastronomy_description,
        place.rental_description,
        place.grill_description,
        place.bonfire_description,
        place.campsite_description,
        place.camper_description,
        place.accommodation_description,
        place.public_transport,
        place.access_road_type,
        place.water_entry_description,
        place.children_description,
        place.beginner_description,
        place.water_traffic_description,
        place.parking_type,
        place.parking_available,
        place.dogs_allowed,
        place.children_rating,
        place.beginner_rating,
        place.water_traffic,
        place.water_entry_type,
        ...(place.beach_types ?? []),
        ...(place.bottom_types ?? []),
        ...(place.gastronomy_types ?? []),
        ...(place.rental_equipment ?? []),
      ];

      return searchableValues.some(
        (value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(text)
      );
    }
  );
}

function hasActiveLiveReport(place) {
  const lastReportAt =
    place.statistics
      ?.last_live_report_at;

  if (!lastReportAt) {
    return false;
  }

  const created = new Date(
    lastReportAt
  ).getTime();

  if (!Number.isFinite(created)) {
    return false;
  }

  return (
    Date.now() - created <=
    6 * 60 * 60 * 1000
  );
}

function isVerifiedPlace(place) {
  return (
    Number(
      place.statistics
        ?.unique_recent_verifiers_count ??
        0
    ) >= 5
  );
}

function hasHighSupScore(place) {
  return (
    Number(place.sup_score ?? 0) >=
    80
  );
}

export function filterPlaces(
  places,
  activeFilters
) {
  if (!activeFilters?.length) {
    return places ?? [];
  }

  return (places ?? []).filter(
    (place) =>
      activeFilters.every(
        (filter) => {
          switch (filter) {
            case "🏄 Dla początkujących":
              return [
                "Bardzo dobre",
                "Dobre przy spokojnej pogodzie",
              ].includes(
                place.beginner_rating
              );

            case "👶 Dla dzieci":
              return [
                "Bardzo dobre dla dzieci",
                "Dobre pod opieką dorosłych",
              ].includes(
                place.children_rating
              );

            case "🐶 Z psem":
              return [
                "Tak",
                "Częściowo",
              ].includes(
                place.dogs_allowed
              );

            case "🅿️ Parking":
              return (
                place.parking_available ===
                "Tak"
              );

            case "🆓 Darmowy parking":
              return (
                place.parking_type ===
                "Bezpłatny"
              );

            case "🚻 Toaleta":
              return (
                place.toilets_available ===
                "Tak"
              );

            case "🚿 Prysznic":
              return (
                place.showers_available ===
                "Tak"
              );

            case "👕 Przebieralnia":
              return (
                place
                  .changing_rooms_available ===
                "Tak"
              );

            case "🛟 Ratownik":
              return [
                "Tak",
                "Sezonowo",
              ].includes(
                place.lifeguard_available
              );

            case "🍔 Gastronomia":
              return [
                "Tak",
                "Sezonowo",
              ].includes(
                place.gastronomy_available
              );

            case "🏄 Wypożyczalnia":
              return [
                "Tak",
                "Sezonowo",
              ].includes(
                place.rental_available
              );

            case "🏖️ Piaszczysta plaża":
              return (
                place.beach_types?.includes(
                  "Piaszczysta"
                ) ?? false
              );

            case "🌊 Łagodne wejście":
              return (
                place.water_entry_type ===
                "Łagodne zejście"
              );

            case "⛺ Pole namiotowe":
              return [
                "Tak",
                "W pobliżu",
              ].includes(
                place.campsite_status
              );

            case "🚐 Kampery":
              return [
                "Dozwolone",
                "Tylko parking dzienny",
                "Specjalne stanowiska",
              ].includes(
                place.camper_status
              );

            case "🤫 Strefa ciszy":
              return (
                place.water_traffic ===
                "Strefa ciszy"
              );

            case "🚫 Bez motorówek":
              return [
                "Strefa ciszy",
                "Zakaz motorówek",
              ].includes(
                place.water_traffic
              );

            case "✅ Zweryfikowane":
              return isVerifiedPlace(
                place
              );

            case "🔴 Aktualizacja na żywo":
              return hasActiveLiveReport(
                place
              );

            case "⭐ Wysoki SUP Score":
              return hasHighSupScore(
                place
              );

            default:
              return true;
          }
        }
      )
  );
}

export function getPlaceMarkerState(
  place
) {
  if (
    place.place_status === "closed"
  ) {
    return "closed";
  }

  if (
    place.place_status ===
    "temporarily_closed"
  ) {
    return "warning";
  }

  if (place.has_active_warning) {
    return "danger";
  }

  if (hasHighSupScore(place)) {
    return "recommended";
  }

  if (!hasActiveLiveReport(place)) {
    return "stale";
  }

  return "default";
}
export async function getPlaceById(placeId) {
  if (!placeId) {
    return null;
  }

  const { data, error } = await supabase
    .from("places")
    .select("*")
    .eq("id", placeId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}