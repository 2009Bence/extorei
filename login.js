(function () {
  const html = document.documentElement;
  const toggle = document.getElementById("themeToggle");
  const pw = document.getElementById("pw");
  const pwToggle = document.getElementById("pwToggle");

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
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  }

  setTheme(getInitialTheme());

  toggle?.addEventListener("click", () => {
    const current = html.getAttribute("data-theme") || "light";
    const next = current === "light" ? "dark" : "light";
    localStorage.setItem(THEME_KEY, next);
    setTheme(next);
  });

  pwToggle?.addEventListener("click", () => {
    const isPw = pw.type === "password";
    pw.type = isPw ? "text" : "password";
    pwToggle.textContent = isPw ? "🙈" : "👁";
  });

  // ===== Animated background (canvas particles + connections) =====
  const canvas = document.getElementById("bg");
  const ctx = canvas.getContext("2d", { alpha: true });

  let w = 0, h = 0, dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let points = [];
  const COUNT = 78;

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function seed() {
    points = Array.from({ length: COUNT }, () => ({
      x: rand(0, w),
      y: rand(0, h),
      vx: rand(-0.35, 0.35),
      vy: rand(-0.35, 0.35),
      r: rand(1.2, 2.4)
    }));
  }

  function getThemeStroke() {
    const theme = html.getAttribute("data-theme") || "light";
    if (theme === "dark") return { dot: "rgba(0,230,255,.85)", line: "rgba(124,136,255,.20)" };
    return { dot: "rgba(91,107,255,.85)", line: "rgba(0,212,255,.16)" };
  }

  function step() {
    ctx.clearRect(0, 0, w, h);

    const { dot, line } = getThemeStroke();

    // background tint (super subtle)
    ctx.fillStyle = (html.getAttribute("data-theme") === "dark")
      ? "rgba(7,9,20,.25)"
      : "rgba(255,255,255,.22)";
    ctx.fillRect(0, 0, w, h);

    // move points
    for (const p of points) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;
    }

    // lines
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i], b = points[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          ctx.strokeStyle = line;
          ctx.globalAlpha = 1 - dist / 140;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;

    // dots
    ctx.fillStyle = dot;
    for (const p of points) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(step);
  }

  resize();
  seed();
  step();

  window.addEventListener("resize", () => {
    resize();
    seed();
  });

})();
