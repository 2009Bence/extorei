(() => {
  const sidebar = document.getElementById("xSidebar");
  const btn = document.getElementById("xSidebarCollapse");
  if (!sidebar || !btn) return;

  const KEY = "extorei_sidebar_mini";

  // init from storage
  const saved = localStorage.getItem(KEY);
  if (saved === "1") sidebar.classList.add("is-mini");

  btn.addEventListener("click", () => {
    sidebar.classList.toggle("is-mini");
    localStorage.setItem(KEY, sidebar.classList.contains("is-mini") ? "1" : "0");
  });

  // Keyboard accessibility: ESC -> mini (optional)
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      sidebar.classList.add("is-mini");
      localStorage.setItem(KEY, "1");
    }
  });
})();
