import {
  useEffect,
  useMemo,
  useState,
} from "react";

const MAIN_SECTIONS = [

  {
    id: "overview-live",
    icon: "🔴",
    label: "Aktualności",
  },
  {
    id: "overview-weather",
    icon: "🌤️",
    label: "Pogoda",
  },
  {
    id: "overview-verification",
    icon: "✅",
    label: "Potwierdzenia",
  },
];

const INFORMATION_SECTIONS = [
  {
    id: "overview-important",
    icon: "📌",
    label: "Ważne informacje",
  },
  {
    id: "overview-parking",
    icon: "🅿️",
    label: "Parking",
  },
  {
    id: "overview-dogs",
    icon: "🐶",
    label: "Psy",
  },
  {
    id: "overview-toilets",
    icon: "🚻",
    label: "Toalety",
  },
  {
    id: "overview-showers",
    icon: "🚿",
    label: "Prysznice",
  },
  {
    id: "overview-changing-rooms",
    icon: "👕",
    label: "Przebieralnie",
  },
  {
    id: "overview-gastronomy",
    icon: "🍔",
    label: "Gastronomia",
  },
  {
    id: "overview-rental",
    icon: "🏄",
    label: "Wypożyczalnia",
  },
  {
    id: "overview-lifeguard",
    icon: "🛟",
    label: "Ratownik",
  },
  {
    id: "overview-grill",
    icon: "🔥",
    label: "Grill",
  },
  {
    id: "overview-bonfire",
    icon: "🔥",
    label: "Ognisko",
  },
  {
    id: "overview-rest",
    icon: "🌳",
    label: "Cień i odpoczynek",
  },
  {
    id: "overview-stay",
    icon: "⛺",
    label: "Noclegi",
  },
  {
    id: "overview-access",
    icon: "🛣️",
    label: "Dojazd",
  },
  {
    id: "overview-water",
    icon: "🌊",
    label: "Woda i brzeg",
  },
  {
    id: "overview-children",
    icon: "👶",
    label: "Dzieci",
  },
  {
    id: "overview-beginners",
    icon: "🏄",
    label: "Początkujący",
  },
  {
    id: "overview-water-traffic",
    icon: "🚤",
    label: "Ruch wodny",
  },
];

function scrollToSection(sectionId) {
  const section =
    document.getElementById(
      sectionId
    );

  if (!section) {
    return;
  }

  section.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function SidebarButton({
  section,
  active,
  onClick,
  nested = false,
}) {
  return (
    <button
      type="button"
      className={[
        "overviewSidebarButton",
        active
          ? "overviewSidebarButtonActive"
          : "",
        nested
          ? "overviewSidebarButtonNested"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      aria-current={
        active ? "location" : undefined
      }
    >
      <span
        className="overviewSidebarIcon"
        aria-hidden="true"
      >
        {section.icon}
      </span>

      <span>{section.label}</span>
    </button>
  );
}

function OverviewSidebar() {
 const [
  activeSection,
  setActiveSection,
] = useState(
  "overview-live"
);

  const [
    informationOpen,
    setInformationOpen,
  ] = useState(true);

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const allSections = useMemo(
    () => [
      ...MAIN_SECTIONS,
      ...INFORMATION_SECTIONS,
    ],
    []
  );

  useEffect(() => {
    const sections =
      allSections
        .map((section) =>
          document.getElementById(
            section.id
          )
        )
        .filter(Boolean);

    if (sections.length === 0) {
      return undefined;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const visibleEntries =
            entries
              .filter(
                (entry) =>
                  entry.isIntersecting
              )
              .sort(
                (first, second) =>
                  second.intersectionRatio -
                  first.intersectionRatio
              );

          const firstVisible =
            visibleEntries[0];

          if (!firstVisible) {
            return;
          }

          const sectionId =
            firstVisible.target.id;

          setActiveSection(sectionId);

          if (
            INFORMATION_SECTIONS.some(
              (section) =>
                section.id === sectionId
            )
          ) {
            setInformationOpen(true);
          }
        },
        {
          root: null,
          rootMargin:
            "-18% 0px -62% 0px",
          threshold: [
            0,
            0.15,
            0.35,
            0.6,
          ],
        }
      );

    sections.forEach((section) =>
      observer.observe(section)
    );

    return () => {
      observer.disconnect();
    };
  }, [allSections]);

  function handleSelect(sectionId) {
    setActiveSection(sectionId);
    scrollToSection(sectionId);
    setMobileOpen(false);
  }

  const activeInformationSection =
    INFORMATION_SECTIONS.some(
      (section) =>
        section.id === activeSection
    );

  return (
    <aside className="overviewSidebar">
      <button
        type="button"
        className="overviewMobileToggle"
        onClick={() =>
          setMobileOpen(
            (current) => !current
          )
        }
        aria-expanded={mobileOpen}
      >
        <span>
          📍 Przejdź do
        </span>

        <span>
          {mobileOpen ? "▲" : "▼"}
        </span>
      </button>

      <div
        className={[
          "overviewSidebarInner",
          mobileOpen
            ? "overviewSidebarInnerOpen"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <h3 className="overviewSidebarTitle">
          Przejdź do
        </h3>

        <nav
          className="overviewSidebarNavigation"
          aria-label="Podkategorie przeglądu"
        >
          {MAIN_SECTIONS.map(
            (section) => (
              <SidebarButton
                key={section.id}
                section={section}
                active={
                  activeSection ===
                  section.id
                }
                onClick={() =>
                  handleSelect(
                    section.id
                  )
                }
              />
            )
          )}

          <button
            type="button"
            className={[
              "overviewSidebarGroupButton",
              activeInformationSection
                ? "overviewSidebarGroupButtonActive"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() =>
              setInformationOpen(
                (current) => !current
              )
            }
            aria-expanded={
              informationOpen
            }
          >
            <span>
              📍 Informacje
            </span>

            <span>
              {informationOpen
                ? "▼"
                : "▶"}
            </span>
          </button>

          <div
            className={[
              "overviewSidebarSubmenu",
              informationOpen
                ? "overviewSidebarSubmenuOpen"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="overviewSidebarSubmenuInner">
              {INFORMATION_SECTIONS.map(
                (section) => (
                  <SidebarButton
                    key={section.id}
                    section={section}
                    nested
                    active={
                      activeSection ===
                      section.id
                    }
                    onClick={() =>
                      handleSelect(
                        section.id
                      )
                    }
                  />
                )
              )}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}

export default OverviewSidebar;