// =========================================================
// EXTOREI BeautySuite Landing — Theme + Mobile Menu
// =========================================================

(function () {
  const html = document.documentElement;
  const toggle = document.getElementById("themeToggle");
  const burger = document.getElementById("hamburger");
  const drawer = document.getElementById("mobileDrawer");
  const closeBtn = document.getElementById("mobileClose");

  const THEME_KEY = "extorei_theme";

  function setTheme(theme) {
    html.setAttribute("data-theme", theme);
    const isDark = theme === "dark";

    // toggle label
    const icon = toggle?.querySelector(".theme-toggle__icon");
    const text = toggle?.querySelector(".theme-toggle__text");
    if (icon) icon.textContent = isDark ? "🌙" : "☀";
    if (text) text.textContent = isDark ? "Dark" : "Light";

    // theme-color meta
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", isDark ? "#070914" : "#ffffff");
  }

  function getInitialTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;

    // first visit: follow system
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  }

  // Init theme
  const initial = getInitialTheme();
  setTheme(initial);

  toggle?.addEventListener("click", () => {
    const current = html.getAttribute("data-theme") || "light";
    const next = current === "light" ? "dark" : "light";
    localStorage.setItem(THEME_KEY, next);
    setTheme(next);
  });

  // Mobile drawer
  function openDrawer() {
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    burger?.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    burger?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  burger?.addEventListener("click", () => {
    const isOpen = drawer.classList.contains("open");
    isOpen ? closeDrawer() : openDrawer();
  });

  closeBtn?.addEventListener("click", closeDrawer);

  drawer?.addEventListener("click", (e) => {
    // click outside panel closes
    if (e.target === drawer) closeDrawer();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("open")) closeDrawer();
  });

  // Close drawer on link click
  drawer?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeDrawer));

  // Smooth anchor (lightweight)
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();
