(() => {
  "use strict";

  const d = document;
  const html = d.documentElement;

  // ====== CONFIG ======
  const THEME_KEY = "extorei_theme"; // "light" | "dark" | "system"
  const THEME_COLOR_LIGHT = "#ffffff";
  const THEME_COLOR_DARK = "#070914";

  // ====== ELEMENTS ======
  const toggle = d.getElementById("themeToggle");
  const burger = d.getElementById("hamburger");
  const drawer = d.getElementById("mobileDrawer");
  const closeBtn = d.getElementById("mobileClose");
  const themeMeta = d.querySelector('meta[name="theme-color"]');

  // ====== HELPERS ======
  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const systemPrefersDark = () =>
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  const getStoredTheme = () => {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" || v === "system" ? v : "system";
  };

  const resolveTheme = (mode) => {
    if (mode === "light" || mode === "dark") return mode;
    return systemPrefersDark() ? "dark" : "light"; // system
  };

  function paintTheme(mode) {
    const resolved = resolveTheme(mode);
    html.setAttribute("data-theme", resolved);
    html.setAttribute("data-theme-mode", mode); // hasznos debug/feature miatt

    // Toggle UI (ha van)
    const icon = toggle?.querySelector(".theme-toggle__icon");
    const text = toggle?.querySelector(".theme-toggle__text");

    if (icon) icon.textContent = resolved === "dark" ? "🌙" : "☀️";

    // Ha szeretnéd: jelenítse meg a módot is
    // pl: "Dark (System)" vagy "Light"
    if (text) {
      const label =
        resolved === "dark" ? "Dark" : "Light";
      text.textContent = mode === "system" ? `${label} (System)` : label;
    }

    // theme-color meta
    if (themeMeta) themeMeta.setAttribute("content", resolved === "dark" ? THEME_COLOR_DARK : THEME_COLOR_LIGHT);
  }

  // ====== THEME INIT + LIVE SYSTEM CHANGE ======
  let themeMode = getStoredTheme();
  paintTheme(themeMode);

  // Ha "system"-en vagy, és a rendszer vált, frissítsünk automatikusan
  let colorSchemeMQ = null;
  if (window.matchMedia) {
    colorSchemeMQ = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if (themeMode === "system") paintTheme("system");
    };
    // modern + fallback
    colorSchemeMQ.addEventListener?.("change", onSystemChange);
    colorSchemeMQ.addListener?.(onSystemChange);
  }

  // Toggle: 2 mód (light/dark) vagy 3 mód (system -> light -> dark)
  // Itt 3 módot adok, mert sokkal jobb UX.
  function cycleThemeMode() {
    themeMode = getStoredTheme();
    const next =
      themeMode === "system" ? "light" :
      themeMode === "light" ? "dark" :
      "system";

    localStorage.setItem(THEME_KEY, next);
    themeMode = next;
    paintTheme(themeMode);
  }

  toggle?.addEventListener("click", cycleThemeMode);

  // ====== DRAWER: scroll lock + focus trap ======
  let lastFocused = null;
  let unlockScroll = null;

  function lockBodyScroll() {
    const scrollY = window.scrollY || 0;
    const prevOverflow = d.body.style.overflow;
    const prevPosition = d.body.style.position;
    const prevTop = d.body.style.top;
    const prevWidth = d.body.style.width;

    d.body.style.overflow = "hidden";
    d.body.style.position = "fixed";
    d.body.style.top = `-${scrollY}px`;
    d.body.style.width = "100%";

    return () => {
      d.body.style.overflow = prevOverflow;
      d.body.style.position = prevPosition;
      d.body.style.top = prevTop;
      d.body.style.width = prevWidth;
      window.scrollTo(0, scrollY);
    };
  }

  function getFocusable(container) {
    if (!container) return [];
    return Array.from(
      container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el.offsetParent !== null);
  }

  function trapFocus(e) {
    if (!drawer?.classList.contains("open")) return;
    if (e.key !== "Tab") return;

    const focusables = getFocusable(drawer);
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && d.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && d.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function openDrawer() {
    if (!drawer) return;

    lastFocused = d.activeElement;

    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    burger?.setAttribute("aria-expanded", "true");

    unlockScroll = lockBodyScroll();

    // első fókusz
    const focusables = getFocusable(drawer);
    (focusables[0] || closeBtn || drawer).focus?.();
  }

  function closeDrawer() {
    if (!drawer) return;

    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    burger?.setAttribute("aria-expanded", "false");

    unlockScroll?.();
    unlockScroll = null;

    // fókusz vissza
    lastFocused?.focus?.();
    lastFocused = null;
  }

  burger?.addEventListener("click", () => {
    if (!drawer) return;
    drawer.classList.contains("open") ? closeDrawer() : openDrawer();
  });

  closeBtn?.addEventListener("click", closeDrawer);

  // overlay click (ha a drawer maga az overlay)
  drawer?.addEventListener("click", (e) => {
    if (e.target === drawer) closeDrawer();
  });

  // ESC + focus trap
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer?.classList.contains("open")) closeDrawer();
    trapFocus(e);
  });

  // link click -> close (event delegation)
  drawer?.addEventListener("click", (e) => {
    const a = e.target?.closest?.("a");
    if (!a) return;
    closeDrawer();
  });

  // ====== SMOOTH ANCHORS (respects reduced motion) ======
  d.addEventListener("click", (e) => {
    const a = e.target?.closest?.('a[href^="#"]');
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href || href === "#") return;

    const target = d.querySelector(href);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });

    // URL hash update (nice)
    history.pushState(null, "", href);
  });
})();
