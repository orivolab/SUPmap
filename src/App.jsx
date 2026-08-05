import {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./App.css";
import "leaflet/dist/leaflet.css";

import { filters } from "./data/places";

import HomePage from "./pages/HomePage";
import PlaceDetailsPage from "./pages/PlaceDetailsPage";
import AddPlacePage from "./pages/AddPlacePage";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import LocationPickerPage from "./pages/LocationPickerPage";
import EditPlacePage from "./pages/EditPlacePage";
import PublicProfilePage from "./pages/PublicProfilePage";
import SupportWidget from "./components/SupportWidget";
import {
  deleteSupportTicket,
  getSupportTickets,
  updateSupportTicketStatus,
} from "./services/supportService";

import {
  approvePlace,
  filterPlaces,
  getApprovedPlaceById,
  getApprovedPlaces,
  getPendingPlaces,
  rejectPlace,
  searchPlaces,
  submitPlace,
  updatePlace,
} from "./services/placesService";

import {
  approveReview,
  getApprovedReviewStats,
  getPendingReviews,
  rejectReview,
} from "./services/reviewsService";

import {
  approvePhoto,
  getPendingPhotos,
  prepareImageFile,
  rejectPhoto,
  uploadUserImage,
} from "./services/photosService";

import {
  getProfile,
  getUserFavorites,
  getUserLevel,
} from "./services/profileService";

import {
  getSession,
  listenToAuthChanges,
  signOut,
} from "./services/authService";

const ADMIN_EMAIL = "orivolab@gmail.com";

const PAGE = {
  HOME: "home",
  DETAILS: "details",
  ADD_PLACE: "add-place",
  ADD_LOCATION: "add-location",
  EDIT_PLACE: "edit-place",
  EDIT_LOCATION: "edit-location",
  AUTH: "auth",
  PROFILE: "profile",
  PUBLIC_PROFILE: "public-profile",
  ADMIN: "admin",
};

function getPlaceIdFromPath() {
  const match =
    window.location.pathname.match(
      /^\/miejsce\/([^/]+)\/?$/
    );

  return match
    ? decodeURIComponent(match[1])
    : null;
}

function changeBrowserAddress(
  path,
  replace = false
) {
  if (
    window.location.pathname === path
  ) {
    return;
  }

  if (replace) {
    window.history.replaceState(
      {},
      "",
      path
    );

    return;
  }

  window.history.pushState(
    {},
    "",
    path
  );
}

function getText(
  formData,
  name,
  fallback = null
) {
  const value = String(
    formData.get(name) ?? ""
  ).trim();

  return value || fallback;
}

function getBoolean(formData, name) {
  return formData.get(name) === "on";
}

function getArray(formData, name) {
  return formData
    .getAll(name)
    .map((value) =>
      String(value).trim()
    )
    .filter(Boolean);
}

function buildPlacePayload({
  formData,
  position,
  imageUrl,
}) {
  const parkingAvailable = getText(
    formData,
    "parking_available"
  );

  const parkingDescription = getText(
    formData,
    "parking_description"
  );

  const dogsAllowed = getText(
    formData,
    "dogs_allowed"
  );

  const dogsDescription = getText(
    formData,
    "dogs_description"
  );

  const beginnerRating = getText(
    formData,
    "beginner_rating"
  );

  const waterEntryType = getText(
    formData,
    "water_entry_type"
  );

  const waterTraffic = getText(
    formData,
    "water_traffic"
  );

  return {
    name:
      getText(formData, "name", "") ||
      "",

    city:
      getText(formData, "city", "") ||
      "",

    description:
      getText(
        formData,
        "description",
        ""
      ) || "",

    important_info: getText(
      formData,
      "important_info"
    ),

    place_status:
      getText(
        formData,
        "place_status",
        "active"
      ) || "active",

    lat: Number(position.lat),
    lng: Number(position.lng),
    image_url: imageUrl,

    // Pola zgodności ze starszą wersją
    parking:
      parkingDescription ||
      getText(
        formData,
        "parking_price"
      ) ||
      parkingAvailable ||
      "Brak informacji",

    dogs:
      dogsDescription ||
      dogsAllowed ||
      "Brak informacji",

    beginner:
      beginnerRating ||
      "Brak informacji",

    water_entry:
      waterEntryType,

    difficulty:
      beginnerRating,

    motorboats:
      waterTraffic,

    toilet:
      parkingAvailable !== null &&
      getText(
        formData,
        "toilets_available"
      ) === "Tak",

    shower:
      getText(
        formData,
        "showers_available"
      ) === "Tak",

    changing_room:
      getText(
        formData,
        "changing_rooms_available"
      ) === "Tak",

    shade:
      getText(
        formData,
        "shade_level"
      ) === "Dużo cienia",

    grill_allowed: [
      "Dozwolony",
      "Tylko w wyznaczonym miejscu",
    ].includes(
      getText(
        formData,
        "grill_status"
      )
    ),

    lifeguard: [
      "Tak",
      "Sezonowo",
    ].includes(
      getText(
        formData,
        "lifeguard_available"
      )
    ),

    rental: [
      "Tak",
      "Sezonowo",
    ].includes(
      getText(
        formData,
        "rental_available"
      )
    ),

    gastronomy: [
      "Tak",
      "Sezonowo",
    ].includes(
      getText(
        formData,
        "gastronomy_available"
      )
    ),

    // Parking
    parking_available:
      parkingAvailable,

    parking_type: getText(
      formData,
      "parking_type"
    ),

    parking_price: getText(
      formData,
      "parking_price"
    ),

    parking_payment_methods:
      getArray(
        formData,
        "parking_payment_methods"
      ),

    parking_distance: getText(
      formData,
      "parking_distance"
    ),

    parking_size: getText(
      formData,
      "parking_size"
    ),

    parking_restrictions: getText(
      formData,
      "parking_restrictions"
    ),

    parking_description:
      parkingDescription,

    // Psy
    dogs_allowed: dogsAllowed,

    dogs_description:
      dogsDescription,

    // Toalety
    toilets_available: getText(
      formData,
      "toilets_available"
    ),

    toilets_paid: getText(
      formData,
      "toilets_paid"
    ),

    toilets_price: getText(
      formData,
      "toilets_price"
    ),

    toilets_opening_hours: getText(
      formData,
      "toilets_opening_hours"
    ),

    toilets_description: getText(
      formData,
      "toilets_description"
    ),

    toilets_accessible: getBoolean(
      formData,
      "toilets_accessible"
    ),

    // Prysznice
    showers_available: getText(
      formData,
      "showers_available"
    ),

    showers_paid: getText(
      formData,
      "showers_paid"
    ),

    showers_price: getText(
      formData,
      "showers_price"
    ),

    showers_opening_hours: getText(
      formData,
      "showers_opening_hours"
    ),

    showers_description: getText(
      formData,
      "showers_description"
    ),

    // Przebieralnie
    changing_rooms_available:
      getText(
        formData,
        "changing_rooms_available"
      ),

    changing_rooms_paid: getText(
      formData,
      "changing_rooms_paid"
    ),

    changing_rooms_price: getText(
      formData,
      "changing_rooms_price"
    ),

    changing_rooms_opening_hours:
      getText(
        formData,
        "changing_rooms_opening_hours"
      ),

    changing_rooms_description:
      getText(
        formData,
        "changing_rooms_description"
      ),

    // Gastronomia
    gastronomy_available: getText(
      formData,
      "gastronomy_available"
    ),

    gastronomy_types: getArray(
      formData,
      "gastronomy_types"
    ),

    gastronomy_opening_hours:
      getText(
        formData,
        "gastronomy_opening_hours"
      ),

    gastronomy_card_payment:
      getBoolean(
        formData,
        "gastronomy_card_payment"
      ),

    gastronomy_description:
      getText(
        formData,
        "gastronomy_description"
      ),

    // Ratownik
    lifeguard_available: getText(
      formData,
      "lifeguard_available"
    ),

    lifeguard_description:
      getText(
        formData,
        "lifeguard_description"
      ),

    // Wypożyczalnia
    rental_available: getText(
      formData,
      "rental_available"
    ),

    rental_equipment: getArray(
      formData,
      "rental_equipment"
    ),

    rental_other: getText(
      formData,
      "rental_other"
    ),

    rental_prices: getText(
      formData,
      "rental_prices"
    ),


    rental_opening_hours: getText(
      formData,
      "rental_opening_hours"
    ),

    rental_reservation: getBoolean(
      formData,
      "rental_reservation"
    ),

    rental_contact: getText(
      formData,
      "rental_contact"
    ),

    rental_description: getText(
      formData,
      "rental_description"
    ),

    // Grill i ognisko
    grill_status: getText(
      formData,
      "grill_status"
    ),

    grill_description: getText(
      formData,
      "grill_description"
    ),

    bonfire_status: getText(
      formData,
      "bonfire_status"
    ),

    bonfire_description: getText(
      formData,
      "bonfire_description"
    ),

    // Cień i odpoczynek
    shade_level: getText(
      formData,
      "shade_level"
    ),

    benches: getBoolean(
      formData,
      "benches"
    ),

    picnic_tables: getBoolean(
      formData,
      "picnic_tables"
    ),

    shelters: getBoolean(
      formData,
      "shelters"
    ),

    rest_other: getText(
      formData,
      "rest_other"
    ),

    lawn: getBoolean(
      formData,
      "lawn"
    ),

    playground: getBoolean(
      formData,
      "playground"
    ),

    sports_field: getBoolean(
      formData,
      "sports_field"
    ),

    // Camping
campsite_status: getText(
  formData,
  "campsite_status"
),

campsite_price: getText(
  formData,
  "campsite_price"
),

campsite_distance: getText(
  formData,
  "campsite_distance"
),

campsite_contact: getText(
  formData,
  "campsite_contact"
),

campsite_description: getText(
  formData,
  "campsite_description"
),

campsite_electricity: getBoolean(
  formData,
  "campsite_electricity"
),

campsite_water: getBoolean(
  formData,
  "campsite_water"
),

campsite_dogs: getBoolean(
  formData,
  "campsite_dogs"
),

    // Noclegi
    accommodation_status: getText(
      formData,
      "accommodation_status"
    ),

    accommodation_description:
      getText(
        formData,
        "accommodation_description"
      ),

    accommodation_link: getText(
      formData,
      "accommodation_link"
    ),

    accommodation_electricity:
      getBoolean(
        formData,
        "accommodation_electricity"
      ),

    accommodation_water: getBoolean(
      formData,
      "accommodation_water"
    ),

    accommodation_dogs: getBoolean(
      formData,
      "accommodation_dogs"
    ),

    // Dojazd
    bicycle_racks: getBoolean(
      formData,
      "bicycle_racks"
    ),

    public_transport: getText(
      formData,
      "public_transport"
    ),

    stroller_access: getText(
      formData,
      "stroller_access"
    ),

    limited_mobility_access:
      getText(
        formData,
        "limited_mobility_access"
      ),

    parking_to_water_distance:
      getText(
        formData,
        "parking_to_water_distance"
      ),

    access_road_type: getText(
      formData,
      "access_road_type"
    ),

    sup_carry_distance: getText(
      formData,
      "sup_carry_distance"
    ),

    stairs_on_route: getBoolean(
      formData,
      "stairs_on_route"
    ),

    // Woda i brzeg
    shore_depth: getText(
      formData,
      "shore_depth"
    ),

    bottom_types: getArray(
      formData,
      "bottom_types"
    ),

    beach_types: getArray(
      formData,
      "beach_types"
    ),

    water_entry_type:
      waterEntryType,

    water_entry_description:
      getText(
        formData,
        "water_entry_description"
      ),

    // Dzieci
    children_rating: getText(
      formData,
      "children_rating"
    ),

    children_features: getArray(
      formData,
      "children_features"
    ),

    children_description: getText(
      formData,
      "children_description"
    ),

    // Początkujący
    beginner_rating:
      beginnerRating,

    beginner_reasons: getArray(
      formData,
      "beginner_reasons"
    ),

    beginner_description: getText(
      formData,
      "beginner_description"
    ),

    // Ruch wodny
    water_traffic: waterTraffic,

    anglers: getBoolean(
      formData,
      "anglers"
    ),

    marked_zones: getBoolean(
      formData,
      "marked_zones"
    ),

    reeds_obstacles: getBoolean(
      formData,
      "reeds_obstacles"
    ),

    strong_current: getBoolean(
      formData,
      "strong_current"
    ),

    water_traffic_description:
      getText(
        formData,
        "water_traffic_description"
      ),
  };
}
function App() {
  const [page, setPage] =
    useState(PAGE.HOME);

  const [
    returnPageAfterAuth,
    setReturnPageAfterAuth,
  ] = useState(PAGE.HOME);

  const [places, setPlaces] =
    useState([]);

  const [
    pendingPlaces,
    setPendingPlaces,
  ] = useState([]);

  const [
    pendingReviews,
    setPendingReviews,
  ] = useState([]);

  const [
    pendingPhotos,
    setPendingPhotos,
  ] = useState([]);
  const [
  supportTickets,
  setSupportTickets,
] = useState([]);

  const [
    selectedPlace,
    setSelectedPlace,
  ] = useState(null);

  const [
    editingPlace,
    setEditingPlace,
  ] = useState(null);

  const [
    newPlacePosition,
    setNewPlacePosition,
  ] = useState(null);

  const [
    editPlacePosition,
    setEditPlacePosition,
  ] = useState(null);

  const [
    selectedImage,
    setSelectedImage,
  ] = useState(null);

  const [
    editPlaceImage,
    setEditPlaceImage,
  ] = useState(null);

  const [searchText, setSearchText] =
    useState("");

  const [
    activeFilters,
    setActiveFilters,
  ] = useState([]);

  const [user, setUser] =
    useState(null);

  const [profile, setProfile] =
    useState(null);

  const [
    publicProfileUserId,
    setPublicProfileUserId,
  ] = useState(null);

  const [favorites, setFavorites] =
    useState([]);

  const [
    formMessage,
    setFormMessage,
  ] = useState("");

  const [
    editMessage,
    setEditMessage,
  ] = useState("");

  const [
    adminMessage,
    setAdminMessage,
  ] = useState("");

  const [
    isSubmittingPlace,
    setIsSubmittingPlace,
  ] = useState(false);

  const [
    isSavingPlace,
    setIsSavingPlace,
  ] = useState(false);

  const isAdmin =
    user?.email?.toLowerCase() ===
    ADMIN_EMAIL;
    
  function renderWithSupport(
  content
) {
  return (
    <>
      {content}

      <SupportWidget
        user={user}
      />
    </>
  );
}

  const visiblePlaces = useMemo(() => {
    const searchedPlaces =
      searchPlaces(
        places,
        searchText
      );

    return filterPlaces(
      searchedPlaces,
      activeFilters
    );
  }, [
    places,
    searchText,
    activeFilters,
  ]);

  const newSupportTicketsCount =
  supportTickets.filter(
    (ticket) =>
      ticket.status === "new"
  ).length;

const pendingCount =
  pendingPlaces.length +
  pendingReviews.length +
  pendingPhotos.length +
  newSupportTicketsCount;

  useEffect(() => {
    initializeApp();

    const stopListening =
      listenToAuthChanges(
        (_event, session) => {
          const currentUser =
            session?.user ?? null;

          setUser(currentUser);

          if (currentUser) {
            loadUserData(currentUser);
          } else {
            setProfile(null);
            setFavorites([]);
            setPendingPlaces([]);
            setPendingReviews([]);
            setPendingPhotos([]);
          }
        }
      );

    return () => {
      stopListening?.();
    };
  }, []);

  useEffect(() => {
    async function handlePopState() {
      const placeId =
        getPlaceIdFromPath();

      if (!placeId) {
        setSelectedPlace(null);
        setEditingPlace(null);
        setPublicProfileUserId(null);
        setPage(PAGE.HOME);

        window.scrollTo({
          top: 0,
          behavior: "auto",
        });

        return;
      }

      try {
        let place =
          places.find(
            (item) =>
              String(item.id) ===
              String(placeId)
          ) ?? null;

        if (!place) {
          place =
            await getApprovedPlaceById(
              placeId
            );
        }

        if (!place) {
          setSelectedPlace(null);
          setPage(PAGE.HOME);

          changeBrowserAddress(
            "/",
            true
          );

          return;
        }

        setSelectedPlace(place);
        setPage(PAGE.DETAILS);

        window.scrollTo({
          top: 0,
          behavior: "auto",
        });
      } catch (error) {
        console.error(
          "Błąd nawigacji przeglądarki:",
          error
        );

        setSelectedPlace(null);
        setPage(PAGE.HOME);
      }
    }

    window.addEventListener(
      "popstate",
      handlePopState
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState
      );
    };
  }, [places]);

  async function loadPlaces() {
  try {
    const [
      placesData,
      reviewStats,
    ] = await Promise.all([
      getApprovedPlaces(),
      getApprovedReviewStats(),
    ]);

    const placesWithRatings =
      placesData.map((place) => {
        const placeReviewStats =
          reviewStats[
            String(place.id)
          ];

        return {
          ...place,

          average_rating:
            placeReviewStats
              ?.averageRating ??
            null,

          reviews_count:
            placeReviewStats
              ?.reviewsCount ??
            0,
        };
      });

    setPlaces(
      placesWithRatings
    );

    return placesWithRatings;
  } catch (error) {
    console.error(
      "Błąd pobierania miejsc:",
      error
    );

    return [];
  }
}
async function initializeApp() {
  try {
    const [
      session,
      loadedPlaces,
    ] = await Promise.all([
      getSession(),
      loadPlaces(),
    ]);

    const currentUser =
      session?.user ?? null;

    setUser(currentUser);

    if (currentUser) {
      await loadUserData(
        currentUser
      );
    }

    await openPageFromCurrentAddress(
      loadedPlaces
    );
  } catch (error) {
    console.error(
      "Błąd uruchamiania aplikacji:",
      error
    );

    setUser(null);
    setProfile(null);
    setFavorites([]);

    await openPageFromCurrentAddress(
      []
    );
  }
}

  async function openPageFromCurrentAddress(
    loadedPlaces = null
  ) {
    const placeId =
      getPlaceIdFromPath();

    if (!placeId) {
      setSelectedPlace(null);
      setPage(PAGE.HOME);
      return;
    }

    try {
      const availablePlaces =
        loadedPlaces ?? places;

      let place =
        availablePlaces.find(
          (item) =>
            String(item.id) ===
            String(placeId)
        ) ?? null;

      if (!place) {
        place =
          await getApprovedPlaceById(
            placeId
          );
      }

      if (!place) {
        setSelectedPlace(null);
        setPage(PAGE.HOME);

        changeBrowserAddress(
          "/",
          true
        );

        return;
      }

      setSelectedPlace(place);
      setPage(PAGE.DETAILS);

      window.scrollTo({
        top: 0,
        behavior: "auto",
      });
    } catch (error) {
      console.error(
        "Błąd otwierania miejsca z linku:",
        error
      );

      setSelectedPlace(null);
      setPage(PAGE.HOME);
    }
  }

  async function loadUserData(
    currentUser
  ) {
    try {
      const [
        profileData,
        favoritesData,
      ] = await Promise.all([
        getProfile(currentUser.id),

        getUserFavorites(
          currentUser.id
        ),
      ]);

      setProfile(profileData);
      setFavorites(favoritesData);

      if (
        currentUser.email?.toLowerCase() ===
        ADMIN_EMAIL
      ) {
        await loadAdminData();
      }
    } catch (error) {
      console.error(
        "Błąd pobierania danych użytkownika:",
        error
      );
    }
  }

  async function loadAdminData() {
  try {
    const [
      placesData,
      reviewsData,
      photosData,
      ticketsData,
    ] = await Promise.all([
      getPendingPlaces(),
      getPendingReviews(),
      getPendingPhotos(),
      getSupportTickets(),
    ]);

    setPendingPlaces(
      placesData
    );

    setPendingReviews(
      reviewsData
    );

    setPendingPhotos(
      photosData
    );

    setSupportTickets(
      ticketsData
    );
  } catch (error) {
    console.error(
      "Błąd pobierania panelu administratora:",
      error
    );

    setAdminMessage(
      `Błąd: ${error.message}`
    );
  }
}

  function goHome() {
    changeBrowserAddress("/");

    setPage(PAGE.HOME);
    setSelectedPlace(null);
    setEditingPlace(null);
    setPublicProfileUserId(null);
    setFormMessage("");
    setEditMessage("");
    setAdminMessage("");

    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }

  function openAuth(
    returnPage = PAGE.HOME
  ) {
    setReturnPageAfterAuth(
      returnPage
    );

    setPage(PAGE.AUTH);
  }

  function openPublicProfile(
    userId
  ) {
    if (!userId) {
      return;
    }

    if (userId === user?.id) {
      openProfile();
      return;
    }

    setPublicProfileUserId(
      userId
    );

    setPage(
      PAGE.PUBLIC_PROFILE
    );
  }

  async function handleAuthSuccess() {
    try {
      const session =
        await getSession();

      const currentUser =
        session?.user ?? null;

      setUser(currentUser);

      if (currentUser) {
        await loadUserData(
          currentUser
        );
      }

      setPage(
        returnPageAfterAuth
      );
    } catch (error) {
      console.error(
        "Błąd po zalogowaniu:",
        error
      );

      setPage(PAGE.HOME);
    }
  }

  async function handleLogout() {
    try {
      await signOut();
    } catch (error) {
      console.error(
        "Błąd wylogowania:",
        error
      );
    } finally {
      setUser(null);
      setProfile(null);
      setFavorites([]);
      setPendingPlaces([]);
      setPendingReviews([]);
      setPendingPhotos([]);
      goHome();
    }
  }

  function openProfile() {
    if (!user) {
      openAuth(PAGE.PROFILE);
      return;
    }

    loadUserData(user);
    setPage(PAGE.PROFILE);
  }

  function openAddPlace() {
    if (!user) {
      openAuth(
        PAGE.ADD_PLACE
      );

      return;
    }

    setNewPlacePosition(null);
    setSelectedImage(null);
    setFormMessage("");
    setPage(PAGE.ADD_PLACE);
  }

  function openAdmin() {
    if (!isAdmin) {
      openAuth(PAGE.ADMIN);
      return;
    }

    setAdminMessage("");
    loadPlaces();
    loadAdminData();
    setPage(PAGE.ADMIN);
  }

  function handleSelectPlace(
    place
  ) {
    if (!place?.id) {
      return;
    }

    changeBrowserAddress(
      `/miejsce/${encodeURIComponent(
        place.id
      )}`
    );

    setSelectedPlace(place);
    setPage(PAGE.DETAILS);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleToggleFilter(
    filter
  ) {
    setActiveFilters(
      (currentFilters) =>
        currentFilters.includes(
          filter
        )
          ? currentFilters.filter(
              (item) =>
                item !== filter
            )
          : [
              ...currentFilters,
              filter,
            ]
    );
  }

  async function handleNewPlaceImageChange(
  file
) {
  if (!file) {
    setSelectedImage(null);
    return;
  }

  try {
    const image =
      await prepareImageFile(file);

    image.previewUrl =
      URL.createObjectURL(image);

    setSelectedImage(image);
    setFormMessage("");
  } catch (error) {
    setSelectedImage(null);

    setFormMessage(
      error.message
    );
  }
}

  async function handleSubmitPlace(
    event
  ) {
    event.preventDefault();

    if (!user) {
      openAuth(
        PAGE.ADD_PLACE
      );

      return;
    }

    if (!newPlacePosition) {
      setFormMessage(
        "Najpierw wybierz lokalizację na mapie."
      );

      return;
    }

    if (!selectedImage) {
      setFormMessage(
        "Dodaj zdjęcie miejsca."
      );

      return;
    }

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    setIsSubmittingPlace(true);

    setFormMessage(
      "Wysyłanie zdjęcia..."
    );

    try {
      const upload =
        await uploadUserImage(
          selectedImage,
          "place-submissions"
        );

      setFormMessage(
        "Zapisywanie zgłoszenia..."
      );

      const payload =
        buildPlacePayload({
          formData,
          position:
            newPlacePosition,
          imageUrl:
            upload.imageUrl,
        });

      await submitPlace(payload);

      form.reset();

      setSelectedImage(null);
      setNewPlacePosition(null);

      setFormMessage(
        "Zgłoszenie zostało wysłane i czeka na zatwierdzenie."
      );

      if (isAdmin) {
        await loadAdminData();
      }
    } catch (error) {
      console.error(
        "Błąd wysyłania miejsca:",
        error
      );

      setFormMessage(
        `Błąd: ${error.message}`
      );
    } finally {
      setIsSubmittingPlace(false);
    }
  }

  function openEditPlace(
    place
  ) {
    setEditingPlace(place);

    setEditPlacePosition({
      lat: Number(place.lat),
      lng: Number(place.lng),
    });

    setEditPlaceImage(null);
    setEditMessage("");
    setPage(PAGE.EDIT_PLACE);
  }

  async function handleEditImageChange(
    event
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      setEditPlaceImage(null);
      return;
    }

    try {
      const image =
        await prepareImageFile(
          file
        );

      setEditPlaceImage(image);
      setEditMessage("");
    } catch (error) {
      event.target.value = "";
      setEditPlaceImage(null);
      setEditMessage(
        error.message
      );
    }
  }

  async function handleEditPlace(
    event
  ) {
    event.preventDefault();

    if (
      !isAdmin ||
      !editingPlace
    ) {
      setEditMessage(
        "Nie masz uprawnień administratora."
      );

      return;
    }

    if (!editPlacePosition) {
      setEditMessage(
        "Wybierz lokalizację pinezki na mapie."
      );

      return;
    }

    const formData =
      new FormData(
        event.currentTarget
      );

    setIsSavingPlace(true);

    setEditMessage(
      "Zapisywanie zmian..."
    );

    try {
      let imageUrl =
        editingPlace.image_url ??
        null;

      if (editPlaceImage) {
        setEditMessage(
          "Wysyłanie nowego zdjęcia..."
        );

        const upload =
          await uploadUserImage(
            editPlaceImage,
            "place-main-images"
          );

        imageUrl =
          upload.imageUrl;
      }

      const payload =
        buildPlacePayload({
          formData,
          position:
            editPlacePosition,
          imageUrl,
        });

      await updatePlace(
        editingPlace.id,
        payload
      );

      await loadPlaces();

      setEditingPlace(null);
      setEditPlaceImage(null);
      setEditPlacePosition(null);
      setEditMessage("");

      setAdminMessage(
        "Zmiany zostały zapisane."
      );

      setPage(PAGE.ADMIN);
    } catch (error) {
      console.error(
        "Błąd edycji miejsca:",
        error
      );

      setEditMessage(
        `Błąd: ${error.message}`
      );
    } finally {
      setIsSavingPlace(false);
    }
  }
  async function handleApprovePlace(
    place
  ) {
    setAdminMessage(
      "Zatwierdzanie miejsca..."
    );

    try {
      await approvePlace(place.id);

      await Promise.all([
        loadPlaces(),
        loadAdminData(),
      ]);

      setAdminMessage(
        `Zatwierdzono miejsce: ${place.name}`
      );
    } catch (error) {
      setAdminMessage(
        `Błąd: ${error.message}`
      );
    }
  }

  async function handleRejectPlace(
    place
  ) {
    setAdminMessage(
      "Odrzucanie miejsca..."
    );

    try {
      await rejectPlace(place.id);

      await loadAdminData();

      setAdminMessage(
        `Odrzucono miejsce: ${place.name}`
      );
    } catch (error) {
      setAdminMessage(
        `Błąd: ${error.message}`
      );
    }
  }

  async function handleApproveReview(
    review
  ) {
    setAdminMessage(
      "Zatwierdzanie opinii..."
    );

    try {
      await approveReview(review.id);

      await loadAdminData();

      setAdminMessage(
        `Zatwierdzono opinię użytkownika ${review.author}.`
      );
    } catch (error) {
      setAdminMessage(
        `Błąd: ${error.message}`
      );
    }
  }

  async function handleRejectReview(
    review
  ) {
    setAdminMessage(
      "Odrzucanie opinii..."
    );

    try {
      await rejectReview(review.id);

      await loadAdminData();

      setAdminMessage(
        `Odrzucono opinię użytkownika ${review.author}.`
      );
    } catch (error) {
      setAdminMessage(
        `Błąd: ${error.message}`
      );
    }
  }

  async function handleApprovePhoto(
    photo
  ) {
    setAdminMessage(
      "Zatwierdzanie zdjęcia..."
    );

    try {
      await approvePhoto(photo.id);

      await loadAdminData();

      setAdminMessage(
        "Zdjęcie zostało zatwierdzone."
      );
    } catch (error) {
      setAdminMessage(
        `Błąd: ${error.message}`
      );
    }
  }

  async function handleRejectPhoto(
    photo
  ) {
    setAdminMessage(
      "Odrzucanie zdjęcia..."
    );

    try {
      await rejectPhoto(photo.id);

      await loadAdminData();

      setAdminMessage(
        "Zdjęcie zostało odrzucone."
      );
    } catch (error) {
      setAdminMessage(
        `Błąd: ${error.message}`
      );
    }
  }

  if (
  page === PAGE.DETAILS &&
  selectedPlace
) {
  return renderWithSupport(
    <PlaceDetailsPage
      place={selectedPlace}
      user={user}
      onBack={goHome}
      onOpenAuth={() =>
        openAuth(PAGE.DETAILS)
      }
      onOpenPublicProfile={
        openPublicProfile
      }
    />
  );
}
async function handleSupportStatusChange(
  ticket,
  status
) {
  setAdminMessage(
    "Zapisywanie statusu zgłoszenia..."
  );

  try {
    await updateSupportTicketStatus(
      ticket.id,
      status
    );

    await loadAdminData();

    setAdminMessage(
      "Status zgłoszenia został zmieniony."
    );
  } catch (error) {
    console.error(
      "Błąd zmiany statusu zgłoszenia:",
      error
    );

    setAdminMessage(
      `Błąd: ${error.message}`
    );
  }
}

async function handleDeleteSupportTicket(
  ticket
) {
  const confirmed =
    window.confirm(
      `Czy na pewno chcesz usunąć zgłoszenie „${ticket.subject}”?`
    );

  if (!confirmed) {
    return;
  }

  setAdminMessage(
    "Usuwanie zgłoszenia..."
  );

  try {
    await deleteSupportTicket(
      ticket.id
    );

    await loadAdminData();

    setAdminMessage(
      "Zgłoszenie zostało usunięte."
    );
  } catch (error) {
    console.error(
      "Błąd usuwania zgłoszenia:",
      error
    );

    setAdminMessage(
      `Błąd: ${error.message}`
    );
  }
}
if (
  page === PAGE.PUBLIC_PROFILE &&
  publicProfileUserId
) {
    return renderWithSupport(
  <PublicProfilePage
        userId={publicProfileUserId}
        currentUser={user}
        onBack={() => {
          setPublicProfileUserId(null);

          if (
            selectedPlace &&
            getPlaceIdFromPath()
          ) {
            setPage(PAGE.DETAILS);
          } else {
            setPage(PAGE.HOME);
          }
        }}
      />
    );
  }

  if (page === PAGE.ADD_PLACE) {
    return renderWithSupport(
      <AddPlacePage
        position={newPlacePosition}
        selectedImage={selectedImage}
        message={formMessage}
        isSubmitting={
          isSubmittingPlace
        }
        onBack={goHome}
        onOpenLocationPicker={() =>
          setPage(
            PAGE.ADD_LOCATION
          )
        }
        onImageChange={
          handleNewPlaceImageChange
        }
        onSubmit={
          handleSubmitPlace
        }
      />
    );
  }

  if (
    page === PAGE.ADD_LOCATION
  ) {
    return renderWithSupport(
      <LocationPickerPage
        position={newPlacePosition}
        onSelect={
          setNewPlacePosition
        }
        onBack={() =>
          setPage(PAGE.ADD_PLACE)
        }
        onConfirm={() =>
          setPage(PAGE.ADD_PLACE)
        }
      />
    );
  }

  if (
    page === PAGE.EDIT_PLACE &&
    editingPlace &&
    isAdmin
  ) {
    return renderWithSupport(
      <EditPlacePage
        place={editingPlace}
        position={
          editPlacePosition
        }
        selectedImage={
          editPlaceImage
        }
        message={editMessage}
        isSubmitting={
          isSavingPlace
        }
        onBack={openAdmin}
        onOpenLocationPicker={() =>
          setPage(
            PAGE.EDIT_LOCATION
          )
        }
        onImageChange={
          handleEditImageChange
        }
        onSubmit={
          handleEditPlace
        }
      />
    );
  }

  if (
    page === PAGE.EDIT_LOCATION &&
    editingPlace &&
    isAdmin
  ) {
    return renderWithSupport(
      <LocationPickerPage
        title={`Zmień lokalizację: ${editingPlace.name}`}
        position={
          editPlacePosition
        }
        onSelect={
          setEditPlacePosition
        }
        onBack={() =>
          setPage(PAGE.EDIT_PLACE)
        }
        onConfirm={() =>
          setPage(PAGE.EDIT_PLACE)
        }
      />
    );
  }

  if (page === PAGE.AUTH) {
    return renderWithSupport(
      <AuthPage
        onBack={() => {
          if (
            returnPageAfterAuth ===
              PAGE.DETAILS &&
            selectedPlace
          ) {
            setPage(PAGE.DETAILS);
            return;
          }

          goHome();
        }}
        onSuccess={
          handleAuthSuccess
        }
      />
    );
  }

  if (
    page === PAGE.PROFILE &&
    user
  ) {
    const points =
      Number(profile?.points) ||
      0;

    return renderWithSupport(
      <ProfilePage
        profile={profile}
        user={user}
        favorites={favorites}
        points={points}
        level={getUserLevel(
          points
        )}
        onBack={() => {
          if (
            selectedPlace &&
            getPlaceIdFromPath()
          ) {
            setPage(PAGE.DETAILS);
          } else {
            goHome();
          }
        }}
        onLogout={
          handleLogout
        }
        onOpenPublicProfile={
          openPublicProfile
        }
      />
    );
  }

  if (
    page === PAGE.ADMIN &&
    isAdmin
  ) {
    return renderWithSupport(
      <AdminPage
        approvedPlaces={places}
        pendingPlaces={
          pendingPlaces
        }
        pendingReviews={
          pendingReviews
        }
        pendingPhotos={
          pendingPhotos
        }
        supportTickets={
  supportTickets
}
        message={adminMessage}
        onBack={goHome}
        onLogout={
          handleLogout
        }
        onEditPlace={
          openEditPlace
        }
        onApprovePlace={
          handleApprovePlace
        }
        onRejectPlace={
          handleRejectPlace
        }
        onApproveReview={
          handleApproveReview
        }
        onRejectReview={
          handleRejectReview
        }
        onApprovePhoto={
          handleApprovePhoto
        }
        onRejectPhoto={
          handleRejectPhoto
        }
        onSupportStatusChange={
  handleSupportStatusChange
}
onDeleteSupportTicket={
  handleDeleteSupportTicket
}
      />
    );
  }

  return renderWithSupport(
    <HomePage
      user={user}
      profile={profile}
      isAdmin={isAdmin}
      pendingCount={
        pendingCount
      }
      places={visiblePlaces}
      searchText={searchText}
      filters={filters}
      activeFilters={
        activeFilters
      }
      onSearchChange={
        setSearchText
      }
      onClearSearch={() =>
        setSearchText("")
      }
      onToggleFilter={
        handleToggleFilter
      }
      onSelectPlace={
        handleSelectPlace
      }
      onOpenAdmin={
        openAdmin
      }
      onOpenAuth={() =>
        openAuth(PAGE.HOME)
      }
      onOpenProfile={
        openProfile
      }
      onAddPlace={
        openAddPlace
      }
      onGoHome={goHome}
    />
  );
}

export default App;