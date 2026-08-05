import {
  useEffect,
  useMemo,
  useState,
} from "react";

import StarRating from "../components/StarRating";
import PlaceAmenities from "../components/PlaceAmenities";
import PlaceLiveStatus from "../components/PlaceLiveStatus";
import WeatherCard from "../components/WeatherCard";
import SupScoreCard from "../components/SupScoreCard";
import PlaceStatistics from "../components/PlaceStatistics";
import VisitModal from "../components/VisitModal";
import LiveReportModal from "../components/LiveReportModal";
import OverviewSidebar from "../components/OverviewSidebar";
import ImageCropModal from "../components/ImageCropModal";

import {
  addFavorite,
  isPlaceFavorite,
  removeFavorite,
} from "../services/profileService";

import {
  calculateAverageRating,
  getApprovedReviews,
  reportReview,
  sortReviews,
  submitReview,
  toggleReviewHelpful,
} from "../services/reviewsService";

import {
  getApprovedPlacePhotos,
  getPhotoCategories,
  prepareImageFile,
  reportPhoto,
  sortPlacePhotos,
  submitPlacePhoto,
} from "../services/photosService";

import {
  canVerifyPlace,
  deleteOwnLiveReport,
  getActiveLiveReports,
  getActiveWarnings,
  getLiveReports,
  getPlaceVerificationInfo,
  verifyPlace,
} from "../services/liveReportsService";

import {
  getCompletePlaceStatistics,
} from "../services/statisticsService";

import {
  calculateSupScore,
} from "../services/supScoreService";

const REVIEW_REPORT_REASONS = [
  "Spam lub reklama",
  "Obraźliwa treść",
  "Nieprawdziwe informacje",
  "Treść niezwiązana z miejscem",
  "Inny powód",
];

const PHOTO_REPORT_REASONS = [
  "Zdjęcie nie przedstawia tego miejsca",
  "Nieodpowiednia treść",
  "Naruszenie prywatności",
  "Spam lub reklama",
  "Inny powód",
];

function formatStaticUpdateDate(value) {
  if (!value) {
    return "Brak informacji";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Brak informacji";
  }

  return date.toLocaleString("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function UserAvatar({
  profile,
  size = 42,
  onClick,
}) {
  const username =
    profile?.username || "Użytkownik";

  const firstLetter =
    String(username)
      .trim()
      .charAt(0)
      .toUpperCase() || "?";

  const clickable =
    typeof onClick === "function";

  if (profile?.avatar_url) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={!clickable}
        style={{
          border: "none",
          padding: 0,
          background: "transparent",
          cursor: clickable
            ? "pointer"
            : "default",
          borderRadius: "50%",
          flexShrink: 0,
        }}
      >
        <img
          src={profile.avatar_url}
          alt={`Zdjęcie profilowe: ${username}`}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            display: "block",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        border: "none",
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        background: "#e8f4ef",
        fontSize: `${Math.round(
          size * 0.4
        )}px`,
        fontWeight: 800,
        cursor: clickable
          ? "pointer"
          : "default",
      }}
    >
      {firstLetter}
    </button>
  );
}

function SectionTabs({
  activeTab,
  onChange,
  reviewsCount,
  photosCount,
  reportsCount,
}) {
  const tabs = [
    {
      id: "overview",
      label: "Przegląd",
    },
    {
      id: "reviews",
      label: `Opinie (${reviewsCount})`,
    },
    {
      id: "photos",
      label: `Zdjęcia (${photosCount})`,
    },
    {
      id: "history",
      label: `Historia raportów (${reportsCount})`,
    },
  ];

  return (
    <nav
      aria-label="Sekcje miejsca"
      style={{
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
        marginTop: "34px",
        marginBottom: "28px",
      }}
    >
      {tabs.map((tab) => {
        const active =
          activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() =>
              onChange(tab.id)
            }
            style={{
              border: active
                ? "2px solid #287b63"
                : "1px solid #d8e2de",
              background: active
                ? "#287b63"
                : "#ffffff",
              color: active
                ? "#ffffff"
                : "#263630",
              borderRadius: "999px",
              padding: "11px 18px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

function PlaceDetailsPage({
  place,
  user,
  onBack,
  onOpenAuth,
  onOpenPublicProfile,
}) {
  const [
    activeTab,
    setActiveTab,
  ] = useState("overview");

  const [
    reviews,
    setReviews,
  ] = useState([]);

  const [
    photos,
    setPhotos,
  ] = useState([]);

  const [
    activeReports,
    setActiveReports,
  ] = useState([]);

  const [
    allReports,
    setAllReports,
  ] = useState([]);

  const [
    warnings,
    setWarnings,
  ] = useState([]);

  const [
    statistics,
    setStatistics,
  ] = useState(null);

  const [
    verificationInfo,
    setVerificationInfo,
  ] = useState({
    totalCount: 0,
    uniqueRecentCount: 0,
    verified: false,
    latestVerificationAt: null,
    canCurrentUserVerify: false,
  });

  const [
    favorite,
    setFavorite,
  ] = useState(false);

  const [
    reviewRating,
    setReviewRating,
  ] = useState(5);

  const [
    reviewSortMode,
    setReviewSortMode,
  ] = useState("newest");

  const [
    photoSortMode,
    setPhotoSortMode,
  ] = useState("newest");

  const [
    photoCategory,
    setPhotoCategory,
  ] = useState("");

  const [
    selectedPhotos,
    setSelectedPhotos,
  ] = useState([]);

  const [
    photoCropQueue,
    setPhotoCropQueue,
  ] = useState([]);

  const [
    photoCropImageUrl,
    setPhotoCropImageUrl,
  ] = useState(null);

  const [
    photoOriginalFileName,
    setPhotoOriginalFileName,
  ] = useState("");

  const [
    photoInputKey,
    setPhotoInputKey,
  ] = useState(0);

  const [
    submittingPhotos,
    setSubmittingPhotos,
  ] = useState(false);

  const [
    reviewMessage,
    setReviewMessage,
  ] = useState("");

  const [
    photoMessage,
    setPhotoMessage,
  ] = useState("");

  const [
    favoriteMessage,
    setFavoriteMessage,
  ] = useState("");

  const [
    verificationMessage,
    setVerificationMessage,
  ] = useState("");

  const [
    generalMessage,
    setGeneralMessage,
  ] = useState("");

  const [
    loadingReviews,
    setLoadingReviews,
  ] = useState(true);

  const [
    loadingPhotos,
    setLoadingPhotos,
  ] = useState(true);

  const [
    loadingReports,
    setLoadingReports,
  ] = useState(true);

  const [
    loadingStatistics,
    setLoadingStatistics,
  ] = useState(true);

  const [
    loadingVerification,
    setLoadingVerification,
  ] = useState(true);

  const [
    submittingVerification,
    setSubmittingVerification,
  ] = useState(false);

  const [
    visitModalOpen,
    setVisitModalOpen,
  ] = useState(false);

  const [
    liveReportModalOpen,
    setLiveReportModalOpen,
  ] = useState(false);

  useEffect(() => {
    if (!place?.id) {
      return;
    }

    loadAllPlaceData();
  }, [place?.id, user?.id]);

  useEffect(() => {
    return () => {
      if (photoCropImageUrl) {
        URL.revokeObjectURL(
          photoCropImageUrl
        );
      }

      photoCropQueue.forEach(
        (queuedPhoto) => {
          URL.revokeObjectURL(
            queuedPhoto.url
          );
        }
      );

      selectedPhotos.forEach(
        (selectedPhoto) => {
          URL.revokeObjectURL(
            selectedPhoto.previewUrl
          );
        }
      );
    };
  }, []);

  const sortedReviews = useMemo(
    () =>
      sortReviews(
        reviews,
        reviewSortMode
      ),
    [
      reviews,
      reviewSortMode,
    ]
  );

  const sortedPhotos = useMemo(
    () =>
      sortPlacePhotos(
        photos,
        photoSortMode
      ),
    [
      photos,
      photoSortMode,
    ]
  );

  const averageRating = useMemo(
    () =>
      calculateAverageRating(
        reviews
      ),
    [reviews]
  );

  const supScore = useMemo(() => {
    if (!statistics) {
      return null;
    }

    return calculateSupScore({
      place,
      statistics,
      liveReports:
        activeReports,
    });
  }, [
    place,
    statistics,
    activeReports,
  ]);
    async function loadAllPlaceData() {
    await Promise.allSettled([
      loadReviews(),
      loadPhotos(),
      loadReports(),
      loadStatistics(),
      loadVerificationInfo(),
      checkFavorite(),
    ]);
  }

  async function loadReviews() {
    setLoadingReviews(true);

    try {
      const data =
        await getApprovedReviews(
          place.id
        );

      setReviews(data);
    } catch (error) {
      console.error(
        "Błąd pobierania opinii:",
        error
      );

      setReviews([]);

      setReviewMessage(
        `Nie udało się pobrać opinii: ${error.message}`
      );
    } finally {
      setLoadingReviews(false);
    }
  }

  async function loadPhotos() {
    setLoadingPhotos(true);

    try {
      const data =
        await getApprovedPlacePhotos(
          place.id
        );

      setPhotos(data);
    } catch (error) {
      console.error(
        "Błąd pobierania zdjęć:",
        error
      );

      setPhotos([]);

      setPhotoMessage(
        `Nie udało się pobrać zdjęć: ${error.message}`
      );
    } finally {
      setLoadingPhotos(false);
    }
  }

  async function loadReports() {
    setLoadingReports(true);

    try {
      const [
        activeData,
        allData,
        warningData,
      ] = await Promise.all([
        getActiveLiveReports(
          place.id,
          20
        ),

        getLiveReports(
          place.id,
          100
        ),

        getActiveWarnings(
          place.id,
          20
        ),
      ]);

      setActiveReports(activeData);
      setAllReports(allData);
      setWarnings(warningData);
    } catch (error) {
      console.error(
        "Błąd pobierania raportów:",
        error
      );

      setActiveReports([]);
      setAllReports([]);
      setWarnings([]);

      setGeneralMessage(
        `Nie udało się pobrać raportów: ${error.message}`
      );
    } finally {
      setLoadingReports(false);
    }
  }

  async function loadStatistics() {
    setLoadingStatistics(true);

    try {
      const data =
        await getCompletePlaceStatistics(
          place.id
        );

      setStatistics(data);
    } catch (error) {
      console.error(
        "Błąd pobierania statystyk:",
        error
      );

      setStatistics(null);

      setGeneralMessage(
        `Nie udało się pobrać statystyk: ${error.message}`
      );
    } finally {
      setLoadingStatistics(false);
    }
  }

  async function loadVerificationInfo() {
    setLoadingVerification(true);

    try {
      const data =
        await getPlaceVerificationInfo(
          place.id
        );

      setVerificationInfo(data);
    } catch (error) {
      console.error(
        "Błąd pobierania potwierdzeń:",
        error
      );

      setVerificationInfo({
        totalCount: 0,
        uniqueRecentCount: 0,
        verified: false,
        latestVerificationAt: null,
        canCurrentUserVerify: false,
      });
    } finally {
      setLoadingVerification(false);
    }
  }

  async function checkFavorite() {
    if (!user?.id) {
      setFavorite(false);
      return;
    }

    try {
      const result =
        await isPlaceFavorite(
          user.id,
          place.id
        );

      setFavorite(result);
    } catch (error) {
      console.error(
        "Błąd sprawdzania ulubionych:",
        error
      );

      setFavorite(false);
    }
  }

  async function refreshCommunityData() {
    await Promise.allSettled([
      loadReports(),
      loadStatistics(),
      loadVerificationInfo(),
    ]);
  }

  async function handleToggleFavorite() {
    if (!user) {
      setFavoriteMessage(
        "Zaloguj się, aby zapisać miejsce."
      );

      onOpenAuth?.();
      return;
    }

    setFavoriteMessage(
      favorite
        ? "Usuwanie z ulubionych..."
        : "Zapisywanie miejsca..."
    );

    try {
      if (favorite) {
        await removeFavorite(
          place.id
        );

        setFavorite(false);

        setFavoriteMessage(
          "Usunięto miejsce z ulubionych."
        );
      } else {
        await addFavorite(
          place.id
        );

        setFavorite(true);

        setFavoriteMessage(
          "Miejsce zapisano w ulubionych."
        );
      }

      await loadStatistics();
    } catch (error) {
      setFavoriteMessage(
        `Błąd: ${error.message}`
      );
    }
  }

  async function handleVerifyPlace() {
    if (!user) {
      setVerificationMessage(
        "Zaloguj się, aby potwierdzić aktualność miejsca."
      );

      onOpenAuth?.();
      return;
    }

    const allowed =
      await canVerifyPlace(
        place.id
      );

    if (!allowed) {
      setVerificationMessage(
        "Możesz ponownie potwierdzić to miejsce po upływie 3 godzin."
      );

      return;
    }

    setSubmittingVerification(true);

    setVerificationMessage(
      "Zapisywanie potwierdzenia..."
    );

    try {
      await verifyPlace(
        place.id
      );

      await Promise.all([
        loadVerificationInfo(),
        loadStatistics(),
      ]);

      setVerificationMessage(
        "Dziękujemy! Potwierdzenie aktualności zostało zapisane."
      );
    } catch (error) {
      console.error(
        "Błąd potwierdzania miejsca:",
        error
      );

      setVerificationMessage(
        `Błąd: ${error.message}`
      );
    } finally {
      setSubmittingVerification(false);
    }
  }

  async function handleSubmitReview(
    event
  ) {
    event.preventDefault();

    if (!user) {
      setReviewMessage(
        "Zaloguj się, aby dodać opinię."
      );

      onOpenAuth?.();
      return;
    }

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    setReviewMessage(
      "Wysyłanie opinii..."
    );

    try {
      await submitReview({
        placeId: place.id,

        author:
          formData.get(
            "author"
          ),

        rating:
          reviewRating,

        comment:
          formData.get(
            "comment"
          ),
      });

      form.reset();
      setReviewRating(5);

      setReviewMessage(
        "Opinia została wysłana i czeka na zatwierdzenie przez administratora."
      );
    } catch (error) {
      setReviewMessage(
        `Błąd: ${error.message}`
      );
    }
  }

  async function handleToggleHelpful(
    review
  ) {
    if (!user) {
      setReviewMessage(
        "Zaloguj się, aby oznaczyć opinię jako pomocną."
      );

      onOpenAuth?.();
      return;
    }

    try {
      await toggleReviewHelpful({
        reviewId:
          review.id,

        currentlyHelpful:
          review.currentUserMarkedHelpful,
      });

      await loadReviews();
    } catch (error) {
      setReviewMessage(
        `Błąd: ${error.message}`
      );
    }
  }

  async function handleReportReview(
    reviewId
  ) {
    if (!user) {
      setReviewMessage(
        "Zaloguj się, aby zgłosić opinię."
      );

      onOpenAuth?.();
      return;
    }

    const reason =
      window.prompt(
        `Podaj powód zgłoszenia:\n\n${REVIEW_REPORT_REASONS.join(
          "\n"
        )}`
      );

    if (!reason?.trim()) {
      return;
    }

    const description =
      window.prompt(
        "Dodatkowy opis zgłoszenia — opcjonalnie:"
      );

    try {
      await reportReview({
        reviewId,
        reason,
        description,
      });

      setReviewMessage(
        "Opinia została zgłoszona administratorowi."
      );
    } catch (error) {
      setReviewMessage(
        `Błąd: ${error.message}`
      );
    }
  }

  function clearAllSelectedPhotos() {
    selectedPhotos.forEach(
      (selectedPhoto) => {
        URL.revokeObjectURL(
          selectedPhoto.previewUrl
        );
      }
    );

    photoCropQueue.forEach(
      (queuedPhoto) => {
        URL.revokeObjectURL(
          queuedPhoto.url
        );
      }
    );

    if (photoCropImageUrl) {
      URL.revokeObjectURL(
        photoCropImageUrl
      );
    }

    setSelectedPhotos([]);
    setPhotoCropQueue([]);
    setPhotoCropImageUrl(null);
    setPhotoOriginalFileName("");
    setPhotoInputKey(
      (current) => current + 1
    );
  }

  function removeSelectedPhoto(
    photoId
  ) {
    setSelectedPhotos(
      (currentPhotos) => {
        const photoToRemove =
          currentPhotos.find(
            (photo) =>
              photo.id === photoId
          );

        if (photoToRemove) {
          URL.revokeObjectURL(
            photoToRemove.previewUrl
          );
        }

        return currentPhotos.filter(
          (photo) =>
            photo.id !== photoId
        );
      }
    );
  }

  function openNextPhotoForCropping(
    queue
  ) {
    const [nextPhoto, ...rest] =
      queue;

    setPhotoCropQueue(rest);

    if (!nextPhoto) {
      setPhotoCropImageUrl(null);
      setPhotoOriginalFileName("");
      return;
    }

    setPhotoCropImageUrl(
      nextPhoto.url
    );
    setPhotoOriginalFileName(
      nextPhoto.name
    );
  }

  function handlePhotoChange(
    event
  ) {
    const files = Array.from(
      event.target.files || []
    );

    if (files.length === 0) {
      return;
    }

    const maximumSize =
      20 * 1024 * 1024;

    const validFiles = [];
    const rejectedFiles = [];

    files.forEach((file) => {
      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        rejectedFiles.push(
          `${file.name} — to nie jest zdjęcie`
        );
        return;
      }

      if (file.size > maximumSize) {
        rejectedFiles.push(
          `${file.name} — przekracza 20 MB`
        );
        return;
      }

      validFiles.push({
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        url: URL.createObjectURL(
          file
        ),
      });
    });

    if (validFiles.length === 0) {
      setPhotoMessage(
        rejectedFiles.join("; ") ||
          "Nie wybrano prawidłowych zdjęć."
      );
      event.target.value = "";
      return;
    }

    const combinedQueue = [
      ...photoCropQueue,
      ...validFiles,
    ];

    if (photoCropImageUrl) {
      setPhotoCropQueue(
        combinedQueue
      );
    } else {
      openNextPhotoForCropping(
        combinedQueue
      );
    }

    setPhotoMessage(
      rejectedFiles.length > 0
        ? `Wybrano ${validFiles.length} zdjęć. Pominięto: ${rejectedFiles.join("; ")}`
        : `Wybrano ${validFiles.length} zdjęć. Ustaw kadr każdego z nich.`
    );

    event.target.value = "";
  }

  function handlePhotoCropCancel() {
    if (photoCropImageUrl) {
      URL.revokeObjectURL(
        photoCropImageUrl
      );
    }

    setPhotoCropImageUrl(null);
    setPhotoOriginalFileName("");

    if (photoCropQueue.length > 0) {
      openNextPhotoForCropping(
        photoCropQueue
      );

      setPhotoMessage(
        "Pominięto to zdjęcie. Ustaw kadr następnego."
      );
    } else {
      setPhotoMessage(
        selectedPhotos.length > 0
          ? "Kadrowanie zakończone. Możesz wysłać wybrane zdjęcia."
          : "Anulowano wybór zdjęć."
      );
    }
  }

  async function handlePhotoCropSave(
    croppedFile
  ) {
    if (!croppedFile) {
      setPhotoMessage(
        "Nie udało się przygotować zdjęcia."
      );
      return;
    }

    try {
      const finalFile = new File(
        [croppedFile],
        photoOriginalFileName ||
          `zdjecie-${Date.now()}.jpg`,
        {
          type:
            croppedFile.type ||
            "image/jpeg",
          lastModified: Date.now(),
        }
      );

      const preparedPhoto =
        await prepareImageFile(
          finalFile
        );

     const previewUrl =
  URL.createObjectURL(
    finalFile
  );

      setSelectedPhotos(
        (currentPhotos) => [
          ...currentPhotos,
          {
            id: `${Date.now()}-${Math.random()}`,
            file: preparedPhoto,
            previewUrl,
            name: finalFile.name,
          },
        ]
      );

      if (photoCropImageUrl) {
        URL.revokeObjectURL(
          photoCropImageUrl
        );
      }

      setPhotoCropImageUrl(null);
      setPhotoOriginalFileName("");

      if (photoCropQueue.length > 0) {
        openNextPhotoForCropping(
          photoCropQueue
        );

        setPhotoMessage(
          `Kadr zapisany. Pozostało do wykadrowania: ${photoCropQueue.length}.`
        );
      } else {
        setPhotoMessage(
          "Wszystkie kadry zapisane. Możesz wysłać zdjęcia."
        );
      }
    } catch (error) {
      console.error(
        "Błąd przygotowania zdjęcia:",
        error
      );

      setPhotoMessage(
        `Nie udało się przygotować zdjęcia: ${error.message}`
      );
    }
  }

  async function handleSubmitPhoto(
    event
  ) {
    event.preventDefault();

    if (!user) {
      setPhotoMessage(
        "Zaloguj się, aby dodać zdjęcia."
      );
      onOpenAuth?.();
      return;
    }

    if (
      selectedPhotos.length === 0
    ) {
      setPhotoMessage(
        "Najpierw wybierz i wykadruj co najmniej jedno zdjęcie."
      );
      return;
    }

    if (photoCropImageUrl) {
      setPhotoMessage(
        "Najpierw zakończ kadrowanie wszystkich zdjęć."
      );
      return;
    }

    const form =
      event.currentTarget;
    const formData =
      new FormData(form);

    setSubmittingPhotos(true);
    setPhotoMessage(
      `Wysyłanie 0 z ${selectedPhotos.length} zdjęć...`
    );

    try {
      for (
        let index = 0;
        index <
        selectedPhotos.length;
        index += 1
      ) {
        setPhotoMessage(
          `Wysyłanie ${index + 1} z ${selectedPhotos.length} zdjęć...`
        );

        await submitPlacePhoto({
          placeId: place.id,
          image:
            selectedPhotos[index]
              .file,
          category:
            formData.get(
              "photoCategory"
            ),
          takenAt:
            formData.get(
              "takenAt"
            ),
        });
      }

      const sentCount =
        selectedPhotos.length;

      form.reset();
      setPhotoCategory("");
      clearAllSelectedPhotos();

      setPhotoMessage(
        `${sentCount} zdjęć zostało wysłanych i czeka na zatwierdzenie przez administratora.`
      );
    } catch (error) {
      console.error(
        "Błąd wysyłania zdjęć:",
        error
      );

      setPhotoMessage(
        `Błąd: ${error.message}`
      );
    } finally {
      setSubmittingPhotos(false);
    }
  }
    async function handleReportPhoto(
    photoId
  ) {
    if (!user) {
      setPhotoMessage(
        "Zaloguj się, aby zgłosić zdjęcie."
      );

      onOpenAuth?.();
      return;
    }

    const reason =
      window.prompt(
        `Podaj powód zgłoszenia:\n\n${PHOTO_REPORT_REASONS.join(
          "\n"
        )}`
      );

    if (!reason?.trim()) {
      return;
    }

    const description =
      window.prompt(
        "Dodatkowy opis zgłoszenia — opcjonalnie:"
      );

    try {
      await reportPhoto({
        photoId,
        reason,
        description,
      });

      setPhotoMessage(
        "Zdjęcie zostało zgłoszone administratorowi."
      );
    } catch (error) {
      setPhotoMessage(
        `Błąd: ${error.message}`
      );
    }
  }

  async function handleDeleteOwnReport(
    reportId
  ) {
    const confirmed =
      window.confirm(
        "Czy na pewno chcesz usunąć tę aktualizację?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteOwnLiveReport(
        reportId
      );

      await refreshCommunityData();

      setGeneralMessage(
        "Aktualizacja została usunięta."
      );
    } catch (error) {
      setGeneralMessage(
        `Błąd: ${error.message}`
      );
    }
  }

  function handleLoginRequired() {
    onOpenAuth?.();
  }

  return (
    <div className="placeDetails">
      <button
        type="button"
        className="backButton"
        onClick={onBack}
      >
        ← Wróć do mapy
      </button>

      <section
        style={{
          position: "relative",
          width: "min(1180px, 100%)",
          margin: "18px auto 0",
        }}
      >
        <img
          src={
            place.image_url ||
            "https://picsum.photos/1200/600"
          }
          alt={place.name}
          className="placeHero"
          style={{
            width: "100%",
            aspectRatio: "16 / 7",
            maxHeight: "520px",
            minHeight: "300px",
            objectFit: "cover",
            objectPosition: "center",
            borderRadius: "24px",
            display: "block",
          }}
        />

        {warnings.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "18px",
              left: "18px",
              maxWidth:
                "calc(100% - 36px)",
              padding: "12px 16px",
              borderRadius: "14px",
              background:
                "rgba(168, 45, 37, 0.94)",
              color: "#ffffff",
              fontWeight: 800,
              lineHeight: 1.45,
            }}
          >
            ⚠️ Aktywne ostrzeżenie
            użytkowników
          </div>
        )}
      </section>

      <section
        style={{
          marginTop: "28px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            width:
              "min(900px, 100%)",
            margin: "0 auto",
            textAlign: "center",
            fontSize:
              "clamp(40px, 5vw, 56px)",
            fontWeight: 800,
            lineHeight: 1.08,
          }}
        >
          {place.name}
        </h1>

        {place.city && (
          <p
            style={{
              marginTop: "10px",
              fontSize: "20px",
              color: "#5c6c66",
            }}
          >
            📍 {place.city}
          </p>
        )}

        <p
          style={{
            marginTop: "10px",
            color: "#6b746f",
          }}
        >
          Ostatnia aktualizacja danych
          stałych:
          <strong>
            {" "}
            {formatStaticUpdateDate(
              place.static_data_updated_at
            )}
          </strong>
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "14px",
            flexWrap: "wrap",
            marginTop: "22px",
          }}
        >
          <button
            type="button"
            className="addPhotoButton"
            onClick={
              handleToggleFavorite
            }
          >
            {favorite
              ? "❤️ Usuń z ulubionych"
              : "🤍 Zapisz miejsce"}
          </button>

          <button
            type="button"
            className="approveButton"
            onClick={() =>
              setVisitModalOpen(true)
            }
          >
            ✅ Byłam tutaj
          </button>

          <button
            type="button"
            className="addPlaceButton"
            style={{
              width: "auto",
            }}
            onClick={() =>
              setLiveReportModalOpen(
                true
              )
            }
          >
            🔴 Dodaj aktualizację
          </button>
        </div>
      </section>

      {favoriteMessage && (
        <p className="formMessage">
          {favoriteMessage}
        </p>
      )}

      {generalMessage && (
        <p className="formMessage">
          {generalMessage}
        </p>
      )}

      {place.important_info && (
        <section
          id="overview-important"
          className="overviewScrollSection"
          style={{
            marginTop: "26px",
            padding: "20px",
            borderRadius: "18px",
            background: "#fffbea",
            border:
              "1px solid #ead88c",
          }}
        >
          <strong
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "19px",
            }}
          >
            📌 Ważne przed przyjazdem
          </strong>

          <p
            style={{
              margin: 0,
              lineHeight: 1.65,
            }}
          >
            {place.important_info}
          </p>
        </section>
      )}

      {warnings.length > 0 && (
        <section
          style={{
            marginTop: "24px",
            padding: "22px",
            borderRadius: "18px",
            background: "#fff1ef",
            border:
              "1px solid #e7aaa4",
          }}
        >
          <h2
            style={{
              margin: "0 0 14px",
              fontSize: "24px",
            }}
          >
            ⚠️ Aktualne ostrzeżenia
          </h2>

          <div
            style={{
              display: "grid",
              gap: "14px",
            }}
          >
            {warnings.map(
              (warning) => (
                <article
                  key={warning.id}
                  style={{
                    padding: "16px",
                    borderRadius:
                      "14px",
                    background:
                      "#ffffff",
                  }}
                >
                  {warning.algae_status && (
                    <p
                      style={{
                        margin:
                          "0 0 7px",
                      }}
                    >
                      🦠{" "}
                      <strong>
                        {
                          warning.algae_status
                        }
                      </strong>
                    </p>
                  )}

                  {warning.entrance_status ===
                    "Wejście zamknięte" && (
                    <p
                      style={{
                        margin:
                          "0 0 7px",
                      }}
                    >
                      🚫{" "}
                      <strong>
                        Wejście do wody
                        jest zgłoszone jako
                        zamknięte.
                      </strong>
                    </p>
                  )}

                  {warning.swimming_ban ===
                    true && (
                    <p
                      style={{
                        margin:
                          "0 0 7px",
                      }}
                    >
                      ⛔{" "}
                      <strong>
                        Zgłoszono zakaz
                        kąpieli.
                      </strong>
                    </p>
                  )}

                  {warning.note && (
                    <p
                      style={{
                        margin: 0,
                        lineHeight:
                          1.55,
                      }}
                    >
                      💬 {warning.note}
                    </p>
                  )}
                </article>
              )
            )}
          </div>

          <p
            style={{
              margin: "16px 0 0",
              fontSize: "13px",
              lineHeight: 1.5,
            }}
          >
            Ostrzeżenia pochodzą od
            użytkowników i nie zastępują
            oficjalnych komunikatów służb
            lub zarządcy kąpieliska.
          </p>
        </section>
      )}

      <SectionTabs
        activeTab={activeTab}
        onChange={setActiveTab}
        reviewsCount={reviews.length}
        photosCount={photos.length}
        reportsCount={
          allReports.length
        }
      />

      {activeTab ===
        "overview" && (
        <div className="overviewLayout">
          <OverviewSidebar />

          <div className="overviewContent">
            <section
              id="overview-score"
              className="overviewScrollSection"
            >
              {loadingStatistics ? (
                <section
                  className="adminCard"
                  style={{
                    padding: "26px",
                  }}
                >
                  <p>
                    Ładowanie SUP Score i
                    statystyk...
                  </p>
                </section>
              ) : (
                <>
                  <SupScoreCard
                    result={supScore}
                  />

                  <PlaceStatistics
                    statistics={
                      statistics
                    }
                  />
                </>
              )}
            </section>

            <section
              id="overview-live"
              className="overviewScrollSection"
            >
              <PlaceLiveStatus
                reports={
                  activeReports
                }
                loading={
                  loadingReports
                }
                onOpenPublicProfile={
                  onOpenPublicProfile
                }
              />
            </section>

            <section
              id="overview-weather"
              className="overviewScrollSection"
            >
              <WeatherCard
                latitude={place.lat}
                longitude={place.lng}
              />
            </section>

            <section
              id="overview-verification"
              className="overviewScrollSection"
            >
              <section
                className="adminCard"
                style={{
                  padding: "26px",
                  marginTop: "32px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "flex-start",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        margin:
                          "0 0 8px",
                        fontSize:
                          "26px",
                      }}
                    >
                      ✅ Aktualność
                      informacji
                    </h2>

                    {loadingVerification ? (
                      <p>
                        Ładowanie
                        potwierdzeń...
                      </p>
                    ) : verificationInfo.verified ? (
                      <p
                        style={{
                          margin: 0,
                          lineHeight:
                            1.6,
                        }}
                      >
                        <strong>
                          Zweryfikowane
                          przez społeczność
                        </strong>
                        {" · "}
                        {
                          verificationInfo.uniqueRecentCount
                        }{" "}
                        unikalnych osób
                        potwierdziło dane w
                        ciągu ostatnich 30
                        dni.
                      </p>
                    ) : (
                      <p
                        style={{
                          margin: 0,
                          lineHeight:
                            1.6,
                          color:
                            "#5c6c66",
                        }}
                      >
                        Aktualność
                        potwierdziło{" "}
                        <strong>
                          {
                            verificationInfo.uniqueRecentCount
                          }
                        </strong>{" "}
                        unikalnych
                        użytkowników w ciągu
                        ostatnich 30 dni.
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    className="approveButton"
                    disabled={
                      submittingVerification ||
                      !verificationInfo.canCurrentUserVerify
                    }
                    onClick={
                      handleVerifyPlace
                    }
                  >
                    {submittingVerification
                      ? "Zapisywanie..."
                      : verificationInfo.canCurrentUserVerify
                        ? "Potwierdzam aktualność"
                        : user
                          ? "Ponownie za 3 godziny"
                          : "Zaloguj się"}
                  </button>
                </div>

                {verificationMessage && (
                  <p className="formMessage">
                    {
                      verificationMessage
                    }
                  </p>
                )}
              </section>
            </section>

            <PlaceAmenities
              place={place}
            />
          </div>
        </div>
      )}
            {activeTab === "reviews" && (
        <section>
          <div
            className="sectionHeader"
            style={{
              alignItems: "flex-start",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  marginBottom: "8px",
                  fontSize: "28px",
                }}
              >
                ⭐ Opinie użytkowników
              </h2>

              <p
                style={{
                  margin: 0,
                }}
              >
                {averageRating
                  ? `Średnia ${averageRating}/5 na podstawie ${reviews.length} opinii`
                  : "Nie ma jeszcze zatwierdzonych opinii."}
              </p>
            </div>

            <label
              style={{
                display: "grid",
                gap: "6px",
                fontWeight: 700,
              }}
            >
              Sortowanie

              <select
                value={reviewSortMode}
                onChange={(event) =>
                  setReviewSortMode(
                    event.target.value
                  )
                }
                style={{
                  padding: "11px 13px",
                  border:
                    "1px solid #d8e2de",
                  borderRadius: "12px",
                  background: "#ffffff",
                }}
              >
                <option value="newest">
                  Najnowsze
                </option>

                <option value="helpful">
                  Najbardziej pomocne
                </option>

                <option value="highest">
                  Najwyższe oceny
                </option>

                <option value="lowest">
                  Najniższe oceny
                </option>
              </select>
            </label>
          </div>

          {user ? (
            <form
              className="addPlaceForm"
              onSubmit={handleSubmitReview}
              style={{
                marginTop: "26px",
                marginBottom: "34px",
              }}
            >
              <h3>Dodaj opinię</h3>

              <label>
                Twoje imię lub nazwa

                <input
                  type="text"
                  name="author"
                  defaultValue={
                    user.user_metadata
                      ?.username || ""
                  }
                  placeholder="Np. Emilia"
                  maxLength="60"
                  required
                />
              </label>

              <label>
                Ocena

                <StarRating
                  value={reviewRating}
                  onChange={setReviewRating}
                />
              </label>

              <label>
                Treść opinii

                <textarea
                  name="comment"
                  rows="5"
                  placeholder="Opisz swoje doświadczenia z tym miejscem"
                  minLength="5"
                  maxLength="1000"
                  required
                />
              </label>

              <button
                type="submit"
                className="addPlaceButton"
              >
                Wyślij opinię
              </button>
            </form>
          ) : (
            <div className="emptyPhotos">
              <p>
                Zaloguj się, aby dodać
                opinię.
              </p>

              <button
                type="button"
                className="adminButton"
                onClick={onOpenAuth}
              >
                Zaloguj się
              </button>
            </div>
          )}

          {reviewMessage && (
            <p className="formMessage">
              {reviewMessage}
            </p>
          )}

          {loadingReviews ? (
            <p>Ładowanie opinii...</p>
          ) : sortedReviews.length === 0 ? (
            <div className="emptyPhotos">
              <p>
                Nie ma jeszcze zatwierdzonych
                opinii.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "18px",
              }}
            >
              {sortedReviews.map(
                (review) => (
                  <article
                    key={review.id}
                    className="adminCard"
                    style={{
                      padding: "22px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-start",
                        gap: "18px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "13px",
                        }}
                      >
                        <UserAvatar
                          profile={
                            review.profiles
                          }
                          onClick={
                            review.profiles
                              ?.id &&
                            onOpenPublicProfile
                              ? () =>
                                  onOpenPublicProfile(
                                    review
                                      .profiles
                                      .id
                                  )
                              : undefined
                          }
                        />

                        <div>
                          <button
                            type="button"
                            disabled={
                              !review.profiles
                                ?.id ||
                              !onOpenPublicProfile
                            }
                            onClick={() =>
                              onOpenPublicProfile?.(
                                review
                                  .profiles
                                  ?.id
                              )
                            }
                            style={{
                              border: "none",
                              padding: 0,
                              background:
                                "transparent",
                              font: "inherit",
                              fontWeight: 800,
                              cursor:
                                review.profiles
                                  ?.id &&
                                onOpenPublicProfile
                                  ? "pointer"
                                  : "default",
                            }}
                          >
                            {review.profiles
                              ?.username ||
                              review.author}
                          </button>

                          <p
                            style={{
                              margin:
                                "5px 0 0",
                              color:
                                "#5c6c66",
                            }}
                          >
                            {new Date(
                              review.created_at
                            ).toLocaleDateString(
                              "pl-PL"
                            )}
                          </p>
                        </div>
                      </div>

                      <div
                        aria-label={`${review.rating} z 5 gwiazdek`}
                      >
                        {"⭐".repeat(
                          Number(
                            review.rating
                          )
                        )}

                        <span
                          style={{
                            opacity: 0.2,
                          }}
                        >
                          {"⭐".repeat(
                            5 -
                              Number(
                                review.rating
                              )
                          )}
                        </span>
                      </div>
                    </div>

                    <p
                      style={{
                        margin:
                          "18px 0 0",
                        lineHeight: 1.7,
                      }}
                    >
                      {review.comment}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                        marginTop: "18px",
                      }}
                    >
                      <button
                        type="button"
                        className={
                          review.currentUserMarkedHelpful
                            ? "approveButton"
                            : "backButton"
                        }
                        onClick={() =>
                          handleToggleHelpful(
                            review
                          )
                        }
                      >
                        👍 Pomocna (
                        {review.helpfulCount ??
                          0}
                        )
                      </button>

                      <button
                        type="button"
                        className="backButton"
                        onClick={() =>
                          handleReportReview(
                            review.id
                          )
                        }
                      >
                        🚩 Zgłoś
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      )}

      {activeTab === "photos" && (
        <section>
          <div
            className="sectionHeader"
            style={{
              alignItems: "flex-start",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  marginBottom: "8px",
                  fontSize: "28px",
                }}
              >
                📷 Zdjęcia użytkowników
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#5c6c66",
                }}
              >
                Zdjęcia pojawiają się po
                zatwierdzeniu przez
                administratora.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <label
                style={{
                  display: "grid",
                  gap: "6px",
                  fontWeight: 700,
                }}
              >
                Kategoria

                <select
                  value={photoCategory}
                  onChange={(event) =>
                    setPhotoCategory(
                      event.target.value
                    )
                  }
                  style={{
                    padding: "11px 13px",
                    border:
                      "1px solid #d8e2de",
                    borderRadius: "12px",
                    background: "#ffffff",
                  }}
                >
                  <option value="">
                    Wszystkie
                  </option>

                  {getPhotoCategories().map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label
                style={{
                  display: "grid",
                  gap: "6px",
                  fontWeight: 700,
                }}
              >
                Sortowanie

                <select
                  value={photoSortMode}
                  onChange={(event) =>
                    setPhotoSortMode(
                      event.target.value
                    )
                  }
                  style={{
                    padding: "11px 13px",
                    border:
                      "1px solid #d8e2de",
                    borderRadius: "12px",
                    background: "#ffffff",
                  }}
                >
                  <option value="newest">
                    Najnowsze
                  </option>

                  <option value="oldest">
                    Najstarsze
                  </option>
                </select>
              </label>
            </div>
          </div>

          {user ? (
            <form
              className="addPlaceForm"
              onSubmit={handleSubmitPhoto}
              style={{
                marginTop: "26px",
                marginBottom: "34px",
              }}
            >
              <h3>Dodaj zdjęcie miejsca</h3>

              <label>
                Zdjęcie

                <input
                  key={photoInputKey}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                />

                <small>
                  Możesz wybrać kilka zdjęć naraz.
                  Każde może mieć maksymalnie 20 MB.
                  Następnie ustawisz osobny kadr
                  każdego zdjęcia.
                </small>
              </label>

              {selectedPhotos.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <strong>
                      Wybrane zdjęcia: {
                        selectedPhotos.length
                      }
                    </strong>

                    <button
                      type="button"
                      className="backButton"
                      onClick={
                        clearAllSelectedPhotos
                      }
                    >
                      Usuń wszystkie
                    </button>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(150px, 220px))",
                      gap: "14px",
                    }}
                  >
                    {selectedPhotos.map(
                      (selectedPhoto) => (
                        <article
                          key={
                            selectedPhoto.id
                          }
                          style={{
                            overflow: "hidden",
                            border:
                              "1px solid #d8e2de",
                            borderRadius:
                              "14px",
                            background:
                              "#ffffff",
                          }}
                        >
                          <img
                            src={
                              selectedPhoto.previewUrl
                            }
                            alt={`Podgląd: ${selectedPhoto.name}`}
                            style={{
                              width: "100%",
                              height: "160px",
                              display: "block",
                              objectFit: "cover",
                            }}
                          />

                          <div
                            style={{
                              display: "grid",
                              gap: "9px",
                              padding: "11px",
                            }}
                          >
                            <small
                              style={{
                                overflow:
                                  "hidden",
                                textOverflow:
                                  "ellipsis",
                                whiteSpace:
                                  "nowrap",
                              }}
                              title={
                                selectedPhoto.name
                              }
                            >
                              {
                                selectedPhoto.name
                              }
                            </small>

                            <button
                              type="button"
                              className="backButton"
                              onClick={() =>
                                removeSelectedPhoto(
                                  selectedPhoto.id
                                )
                              }
                            >
                              Usuń
                            </button>
                          </div>
                        </article>
                      )
                    )}
                  </div>
                </div>
              )}

              <label>
                Kategoria zdjęcia

                <select
                  name="photoCategory"
                  value={photoCategory}
                  onChange={(event) =>
                    setPhotoCategory(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Wybierz kategorię
                  </option>

                  {getPhotoCategories().map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                Data wykonania zdjęcia —
                opcjonalnie

                <input
                  type="datetime-local"
                  name="takenAt"
                  max={new Date()
                    .toISOString()
                    .slice(0, 16)}
                />
              </label>

              <button
                type="submit"
                className="addPlaceButton"
                disabled={
                  submittingPhotos
                }
              >
                {submittingPhotos
                  ? "Wysyłanie..."
                  : selectedPhotos.length > 1
                    ? `Wyślij ${selectedPhotos.length} zdjęć`
                    : "Wyślij zdjęcie"}
              </button>
            </form>
          ) : (
            <div className="emptyPhotos">
              <p>
                Zaloguj się, aby dodać
                zdjęcie.
              </p>

              <button
                type="button"
                className="adminButton"
                onClick={onOpenAuth}
              >
                Zaloguj się
              </button>
            </div>
          )}

          {photoMessage && (
            <p className="formMessage">
              {photoMessage}
            </p>
          )}
                    {loadingPhotos ? (
            <p>Ładowanie zdjęć...</p>
          ) : sortedPhotos.filter(
              (photo) =>
                !photoCategory ||
                photo.photo_category ===
                  photoCategory
            ).length === 0 ? (
            <div className="emptyPhotos">
              <p>
                Nie ma jeszcze zdjęć w tej
                kategorii.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "18px",
              }}
            >
              {sortedPhotos
                .filter(
                  (photo) =>
                    !photoCategory ||
                    photo.photo_category ===
                      photoCategory
                )
                .map((photo) => (
                  <article
                    key={photo.id}
                    className="adminCard"
                    style={{
                      padding: 0,
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={photo.image_url}
                      alt={`Zdjęcie miejsca ${place.name}`}
                      style={{
                        width: "100%",
                        height: "240px",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />

                    <div
                      style={{
                        padding: "18px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "11px",
                        }}
                      >
                        <UserAvatar
                          profile={
                            photo.profiles
                          }
                          size={38}
                          onClick={
                            photo.profiles
                              ?.id &&
                            onOpenPublicProfile
                              ? () =>
                                  onOpenPublicProfile(
                                    photo
                                      .profiles
                                      .id
                                  )
                              : undefined
                          }
                        />

                        <div>
                          <button
                            type="button"
                            disabled={
                              !photo.profiles
                                ?.id ||
                              !onOpenPublicProfile
                            }
                            onClick={() =>
                              onOpenPublicProfile?.(
                                photo.profiles
                                  ?.id
                              )
                            }
                            style={{
                              border: "none",
                              padding: 0,
                              background:
                                "transparent",
                              font: "inherit",
                              fontWeight: 800,
                              cursor:
                                photo.profiles
                                  ?.id &&
                                onOpenPublicProfile
                                  ? "pointer"
                                  : "default",
                            }}
                          >
                            {photo.profiles
                              ?.username ||
                              "Użytkownik SUPMap"}
                          </button>

                          <p
                            style={{
                              margin:
                                "4px 0 0",
                              color:
                                "#5c6c66",
                              fontSize:
                                "14px",
                            }}
                          >
                            {photo.photo_category ||
                              "Bez kategorii"}
                          </p>
                        </div>
                      </div>

                      <p
                        style={{
                          margin:
                            "15px 0 0",
                          color: "#5c6c66",
                          fontSize: "14px",
                        }}
                      >
                        📅{" "}
                        {new Date(
                          photo.taken_at ||
                            photo.created_at
                        ).toLocaleDateString(
                          "pl-PL"
                        )}
                      </p>

                      <button
                        type="button"
                        className="backButton"
                        style={{
                          marginTop: "15px",
                        }}
                        onClick={() =>
                          handleReportPhoto(
                            photo.id
                          )
                        }
                      >
                        🚩 Zgłoś zdjęcie
                      </button>
                    </div>
                  </article>
                ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "history" && (
        <section>
          <div
            className="sectionHeader"
            style={{
              alignItems: "flex-start",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  marginBottom: "8px",
                  fontSize: "28px",
                }}
              >
                🔴 Historia raportów
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#5c6c66",
                  lineHeight: 1.55,
                }}
              >
                Raporty starsze niż 6 godzin
                nie są już wyświetlane jako
                aktualna sytuacja, ale
                pozostają w historii miejsca.
              </p>
            </div>

            <button
              type="button"
              className="addPlaceButton"
              style={{
                width: "auto",
              }}
              onClick={() =>
                setLiveReportModalOpen(
                  true
                )
              }
            >
              🔴 Dodaj aktualizację
            </button>
          </div>

          {loadingReports ? (
            <p>
              Ładowanie raportów...
            </p>
          ) : allReports.length === 0 ? (
            <div className="emptyPhotos">
              <p>
                Nie ma jeszcze żadnych
                raportów.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "18px",
                marginTop: "26px",
              }}
            >
              {allReports.map(
                (report) => (
                  <article
                    key={report.id}
                    className="adminCard"
                    style={{
                      padding: "22px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-start",
                        gap: "18px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: "12px",
                        }}
                      >
                        <UserAvatar
                          profile={
                            report.profiles
                          }
                          onClick={
                            report.profiles
                              ?.id &&
                            onOpenPublicProfile
                              ? () =>
                                  onOpenPublicProfile(
                                    report
                                      .profiles
                                      .id
                                  )
                              : undefined
                          }
                        />

                        <div>
                          <button
                            type="button"
                            disabled={
                              !report.profiles
                                ?.id ||
                              !onOpenPublicProfile
                            }
                            onClick={() =>
                              onOpenPublicProfile?.(
                                report
                                  .profiles
                                  ?.id
                              )
                            }
                            style={{
                              border: "none",
                              padding: 0,
                              background:
                                "transparent",
                              font: "inherit",
                              fontWeight: 800,
                              cursor:
                                report.profiles
                                  ?.id &&
                                onOpenPublicProfile
                                  ? "pointer"
                                  : "default",
                            }}
                          >
                            {report.profiles
                              ?.username ||
                              "Użytkownik SUPMap"}
                          </button>

                          <p
                            style={{
                              margin:
                                "5px 0 0",
                              color:
                                "#5c6c66",
                            }}
                          >
                            {new Date(
                              report.created_at
                            ).toLocaleString(
                              "pl-PL",
                              {
                                dateStyle:
                                  "medium",
                                timeStyle:
                                  "short",
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      {report.user_id ===
                        user?.id && (
                        <button
                          type="button"
                          className="rejectButton"
                          onClick={() =>
                            handleDeleteOwnReport(
                              report.id
                            )
                          }
                        >
                          Usuń własny raport
                        </button>
                      )}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(170px, 1fr))",
                        gap: "12px",
                        marginTop: "18px",
                      }}
                    >
                      {report.water_temperature !==
                        null && (
                        <div className="infoCard">
                          🌡️ Woda:{" "}
                          <strong>
                            {
                              report.water_temperature
                            }
                            °C
                          </strong>
                        </div>
                      )}

                      {report.air_temperature !==
                        null && (
                        <div className="infoCard">
                          🌤️ Powietrze:{" "}
                          <strong>
                            {
                              report.air_temperature
                            }
                            °C
                          </strong>
                        </div>
                      )}

                      {report.wind_level && (
                        <div className="infoCard">
                          💨{" "}
                          <strong>
                            {
                              report.wind_level
                            }
                          </strong>
                        </div>
                      )}

                      {report.water_condition && (
                        <div className="infoCard">
                          🌊{" "}
                          <strong>
                            {
                              report.water_condition
                            }
                          </strong>
                        </div>
                      )}

                      {report.crowd_level && (
                        <div className="infoCard">
                          👥{" "}
                          <strong>
                            {
                              report.crowd_level
                            }
                          </strong>
                        </div>
                      )}

                      {report.parking_status && (
                        <div className="infoCard">
                          🚗{" "}
                          <strong>
                            {
                              report.parking_status
                            }
                          </strong>
                        </div>
                      )}

                      {report.toilets_open && (
                        <div className="infoCard">
                          🚻{" "}
                          <strong>
                            {
                              report.toilets_open
                            }
                          </strong>
                        </div>
                      )}

                      {report.gastronomy_open && (
                        <div className="infoCard">
                          🍔{" "}
                          <strong>
                            {
                              report.gastronomy_open
                            }
                          </strong>
                        </div>
                      )}

                      {report.algae_status && (
                        <div className="infoCard">
                          🦠{" "}
                          <strong>
                            {
                              report.algae_status
                            }
                          </strong>
                        </div>
                      )}

                      {report.rain_status && (
                        <div className="infoCard">
                          🌧️{" "}
                          <strong>
                            {
                              report.rain_status
                            }
                          </strong>
                        </div>
                      )}

                      {report.entrance_status && (
                        <div className="infoCard">
                          🚶{" "}
                          <strong>
                            {
                              report.entrance_status
                            }
                          </strong>
                        </div>
                      )}

                      {report.swimming_ban !==
                        null && (
                        <div className="infoCard">
                          ⛔ Zakaz kąpieli:{" "}
                          <strong>
                            {report.swimming_ban
                              ? "Tak"
                              : "Nie"}
                          </strong>
                        </div>
                      )}
                    </div>

                    {report.note && (
                      <div
                        style={{
                          marginTop: "18px",
                          padding: "16px",
                          borderRadius:
                            "14px",
                          background:
                            "#f4f7f6",
                          lineHeight: 1.6,
                        }}
                      >
                        💬 {report.note}
                      </div>
                    )}

                    {report.live_image_url && (
                      <img
                        src={
                          report.live_image_url
                        }
                        alt={`Aktualizacja z miejsca ${place.name}`}
                        style={{
                          width: "100%",
                          maxHeight: "420px",
                          objectFit: "cover",
                          borderRadius:
                            "16px",
                          marginTop: "18px",
                        }}
                      />
                    )}
                  </article>
                )
              )}
            </div>
          )}
        </section>
      )}
            {visitModalOpen && (
        <VisitModal
          place={place}
          user={user}
          onClose={() =>
            setVisitModalOpen(false)
          }
          onLoginRequired={
            handleLoginRequired
          }
          onVisitAdded={async () => {
            await loadStatistics();
          }}
        />
      )}

      {liveReportModalOpen && (
        <LiveReportModal
          place={place}
          user={user}
          onClose={() =>
            setLiveReportModalOpen(false)
          }
          onLoginRequired={
            handleLoginRequired
          }
          onReportAdded={async () => {
            await refreshCommunityData();
          }}
        />
      )}

      {photoCropImageUrl && (
  <ImageCropModal
    imageUrl={photoCropImageUrl}
    allowAspectSelection
    initialAspectId="landscape"
    onCancel={handlePhotoCropCancel}
    onSave={handlePhotoCropSave}
  />
      )}
    </div>
  );
}

export default PlaceDetailsPage;