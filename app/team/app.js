// ===============================
// THEME TOGGLE (Light default)
// ===============================
(function () {
  const html = document.documentElement;
  const toggle = document.getElementById("themeToggle");
  const THEME_KEY = "extorei_theme";

  function setTheme(theme) {
    html.setAttribute("data-theme", theme);

    const isDark = theme === "dark";
    const icon = toggle?.querySelector(".theme-toggle__icon");
    const text = toggle?.querySelector(".theme-toggle__text");

    if (icon) icon.textContent = isDark ? "🌙" : "☀";
    if (text) text.textContent = isDark ? "Dark" : "Light";

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", isDark ? "#070914" : "#ffffff");
  }

  function getInitialTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
    return "light"; // LIGHT az alap
  }

  setTheme(getInitialTheme());

  toggle?.addEventListener("click", () => {
    const cur = html.getAttribute("data-theme") || "light";
    const next = cur === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, next);
    setTheme(next);
  });
})();
