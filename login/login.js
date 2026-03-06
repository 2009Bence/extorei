(async () => {
  const html = document.documentElement;

  // ===== Supabase config betöltése az API-ból =====
  let supabase;

  try {
    const res = await fetch("/api/config");
    const config = await res.json();

    if (!config.url || !config.anon) {
      throw new Error("Hiányzik a Supabase URL vagy ANON kulcs az /api/config válaszból.");
    }

    supabase = window.supabase.createClient(config.url, config.anon);
    console.log("Supabase config betöltve:", config.url);
  } catch (err) {
    console.error("Config betöltési hiba:", err);
    const msg = document.getElementById("msg");
    if (msg) {
      msg.textContent = "Hiba az API config betöltésekor: " + err.message;
      msg.style.color = "#ff6b6b";
    }
    return;
  }

  // ===== Theme =====
  const THEME_KEY = "extorei_theme";
  const themeToggle = document.getElementById("themeToggle");
  const reduceBtn = document.getElementById("reduceMotion");

  const pw = document.getElementById("pw");
  const pwToggle = document.getElementById("pwToggle");

  // ===== Register form =====
  const registerForm = document.getElementById("registerForm");
  const emailInput = document.getElementById("email");
  const msg = document.getElementById("msg");

  function setMessage(text, isError = false) {
    if (!msg) return;
    msg.textContent = text;
    msg.style.color = isError ? "#ff6b6b" : "#22c55e";
  }

  function setTheme(theme) {
    html.setAttribute("data-theme", theme);
    const isDark = theme === "dark";

    const icon = themeToggle?.querySelector(".theme-toggle__icon");
    const text = themeToggle?.querySelector(".theme-toggle__text");
    if (icon) icon.textContent = isDark ? "🌙" : "☀";
    if (text) text.textContent = isDark ? "Dark" : "Light";

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", isDark ? "#070914" : "#ffffff");
  }

  function getInitialTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    return prefersDark ? "dark" : "light";
  }

  setTheme(getInitialTheme());

  themeToggle?.addEventListener("click", () => {
    const current = html.getAttribute("data-theme") || "light";
    const next = current === "light" ? "dark" : "light";
    localStorage.setItem(THEME_KEY, next);
    setTheme(next);
  });

  // ===== Reduce motion toggle =====
  let reduced = false;
  reduceBtn?.addEventListener("click", () => {
    reduced = !reduced;
    html.classList.toggle("reduce-motion", reduced);
    reduceBtn.textContent = reduced ? "⚡ Calm" : "⚡ Smooth";
  });

  // ===== Password show/hide =====
  pwToggle?.addEventListener("click", () => {
    const isPw = pw.type === "password";
    pw.type = isPw ? "text" : "password";
    pwToggle.textContent = isPw ? "🙈" : "👁";
  });

  // ===== Register submit =====
  registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput?.value.trim();
    const password = pw?.value.trim();

    if (!email || !password) {
      setMessage("Add meg az email címet és a jelszót.", true);
      return;
    }

    if (password.length < 6) {
      setMessage("A jelszónak legalább 6 karakteresnek kell lennie.", true);
      return;
    }

    setMessage("Regisztráció folyamatban...");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      console.log("SIGNUP DATA:", data);
      console.log("SIGNUP ERROR:", error);

      if (error) {
        setMessage("Hiba: " + error.message, true);
        return;
      }

      setMessage("Sikeres regisztráció! Most már be tudsz lépni.");
      registerForm.reset();
    } catch (err) {
      console.error("Váratlan hiba:", err);
      setMessage("Váratlan hiba történt: " + err.message, true);
    }
  });

  // ===== Card shine follows mouse + tilt =====
  const tiltCard = document.getElementById("tiltCard");
  const isTouch = matchMedia?.("(hover: none), (pointer: coarse)")?.matches;

  if (tiltCard && !isTouch) {
    tiltCard.addEventListener("mousemove", (e) => {
      const r = tiltCard.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;

      const mx = (x / r.width) * 100;
      const my = (y / r.height) * 100;

      tiltCard.style.setProperty("--mx", `${mx}%`);
      tiltCard.style.setProperty("--my", `${my}%`);

      const rx = ((y / r.height) - 0.5) * -6;
      const ry = ((x / r.width) - 0.5) * 6;

      tiltCard.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-1px)`;
    });

    tiltCard.addEventListener("mouseleave", () => {
      tiltCard.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
    });
  }

  // ===== Canvas constellation + parallax =====
  const canvas = document.getElementById("bg");
  const ctx = canvas?.getContext("2d", { alpha: true });

  let w = 0, h = 0;
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let points = [];
  let mouse = { x: 0.5, y: 0.5 };
  let par = { x: 0, y: 0 };

  function resize() {
    if (!canvas || !ctx) return;
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const rand = (min, max) => Math.random() * (max - min) + min;

  function countForScreen() {
    const base = Math.min(110, Math.floor((w * h) / 18000));
    return Math.max(48, base);
  }

  function seed() {
    const COUNT = countForScreen();
    points = Array.from({ length: COUNT }, () => ({
      x: rand(0, w),
      y: rand(0, h),
      vx: rand(-0.28, 0.28),
      vy: rand(-0.28, 0.28),
      r: rand(1.1, 2.5)
    }));
  }

  function themeColors() {
    const theme = html.getAttribute("data-theme") || "light";
    if (theme === "dark") {
      return {
        tint: "rgba(7,9,20,.25)",
        dot: "rgba(0,230,255,.85)",
        line: "rgba(124,136,255,.22)"
      };
    }
    return {
      tint: "rgba(255,255,255,.24)",
      dot: "rgba(91,107,255,.82)",
      line: "rgba(0,212,255,.18)"
    };
  }

  function step() {
    if (!canvas || !ctx) return;

    const { tint, dot, line } = themeColors();

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, w, h);

    par.x += (mouse.x - par.x) * 0.05;
    par.y += (mouse.y - par.y) * 0.05;
    const px = (par.x - 0.5) * 22;
    const py = (par.y - 0.5) * 22;

    for (const p of points) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -30) p.x = w + 30;
      if (p.x > w + 30) p.x = -30;
      if (p.y < -30) p.y = h + 30;
      if (p.y > h + 30) p.y = -30;
    }

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i], b = points[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const max = reduced ? 110 : 150;
        if (dist < max) {
          ctx.strokeStyle = line;
          ctx.globalAlpha = 1 - dist / max;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x + px, a.y + py);
          ctx.lineTo(b.x + px, b.y + py);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = dot;
    for (const p of points) {
      ctx.beginPath();
      ctx.arc(p.x + px, p.y + py, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(step);
  }

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX / window.innerWidth;
    mouse.y = e.clientY / window.innerHeight;
  });

  if (canvas && ctx) {
    resize();
    seed();
    step();

    window.addEventListener("resize", () => {
      resize();
      seed();
    });
  }
})();
