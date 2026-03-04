itt van (() => {
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
    html.setAttribute("data-theme-mode", mode);

    const icon = toggle?.querySelector(".theme-toggle__icon");
    const text = toggle?.querySelector(".theme-toggle__text");

    if (icon) icon.textContent = resolved === "dark" ? "🌙" : "☀️";
    if (text) {
      text.textContent =
        mode === "system" ? `System (${resolved})` : resolved[0].toUpperCase() + resolved.slice(1);
    }

    if (themeMeta) {
      themeMeta.setAttribute("content", resolved === "dark" ? THEME_COLOR_DARK : THEME_COLOR_LIGHT);
    }
  }

  // ====== THEME INIT + LIVE SYSTEM CHANGE ======
  let themeMode = getStoredTheme();
  paintTheme(themeMode);

  if (window.matchMedia) {
    const colorSchemeMQ = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if (themeMode === "system") paintTheme("system");
    };
    colorSchemeMQ.addEventListener?.("change", onSystemChange);
    colorSchemeMQ.addListener?.(onSystemChange);
  }

  function cycleThemeMode() {
    themeMode = getStoredTheme();
    const next = themeMode === "system" ? "light" : themeMode === "light" ? "dark" : "system";
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

    lastFocused?.focus?.();
    lastFocused = null;
  }

  burger?.addEventListener("click", () => {
    if (!drawer) return;
    drawer.classList.contains("open") ? closeDrawer() : openDrawer();
  });

  closeBtn?.addEventListener("click", closeDrawer);

  drawer?.addEventListener("click", (e) => {
    if (e.target === drawer) closeDrawer();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer?.classList.contains("open")) closeDrawer();
    trapFocus(e);
  });

  drawer?.addEventListener("click", (e) => {
    const a = e.target?.closest?.("a");
    if (!a) return;
    closeDrawer();
  });

  // ====== SMOOTH ANCHORS ======
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
    history.pushState(null, "", href);
  });

  // ===========================
  // ✅ SUPABASE INIT (ONLY ONCE)
  // ===========================
  async function initSupabase() {
    if (window.supabaseClient) return window.supabaseClient;

    if (!window.supabase?.createClient) {
      throw new Error("Supabase library nincs betöltve. Kell: <script src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'></script>");
    }

    const r = await fetch("/api/config", { cache: "no-store" });
    if (!r.ok) throw new Error("Config fetch failed: " + r.status);

    const cfg = await r.json();
    if (!cfg?.url || !cfg?.anon) throw new Error("Missing Supabase config (/api/config)");

    window.supabaseClient = window.supabase.createClient(cfg.url, cfg.anon);

    console.log("✅ Supabase ready:", cfg.url);
    document.documentElement.setAttribute("data-supabase", "ready");
    return window.supabaseClient;
  }

  // Init azonnal (de nem blokkolja a page-et)
  initSupabase().catch((e) => {
    console.error("❌ Supabase init error:", e);
    document.documentElement.setAttribute("data-supabase", "error");
  });

  // ===========================
  // ✅ DEMO FORM SUBMIT + DEBUG
  // ===========================
  d.addEventListener("DOMContentLoaded", () => {
    const form = d.getElementById("demoForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("🚀 DemoForm submit");

      try {
        const supa = await initSupabase();

        const name = form.querySelector('input[type="text"]')?.value?.trim();
        const email = form.querySelector('input[type="email"]')?.value?.trim();
        const business = form.querySelector("select")?.value?.trim();

        console.log("📦 Küldött adatok:", { name, email, business });

        if (!name || !email || !business) {
          throw new Error("Valamelyik mező üres (name/email/business)");
        }

        const payload = { name, email, business_type: business };

        const { data, error } = await supa
          .from("leads")
          .insert([payload])
          .select();

        if (error) {
          console.error("❌ Supabase error:", error);

          const msg = (error.message || "").toLowerCase();

          if (msg.includes("row-level security")) {
            throw new Error("RLS policy blokkolja az INSERT-et. (Supabase → Policies)");
          }
          if (msg.includes("permission denied")) {
            throw new Error("Nincs jogosultság (permission denied). RLS / grant gond.");
          }
          if (msg.includes("column") || msg.includes("does not exist")) {
            throw new Error("Oszlopnév hiba. Ellenőrizd: business_type pontosan így van-e a táblában.");
          }
          if (msg.includes("null value")) {
            throw new Error("NOT NULL constraint sérül. Valami null/üres mentésre megy.");
          }
          if (msg.includes("uuid")) {
            throw new Error("UUID/ID default hiba. ID default legyen: gen_random_uuid()");
          }

          // fallback: teljes error message
          throw new Error(error.message || "Ismeretlen Supabase hiba");
        }

        console.log("✅ Mentve:", data);
        form.reset();
        alert("Köszi! ✅ Lead elmentve a Supabase-be.");
      } catch (err) {
        console.error("🔥 Részletes hiba:", err);
        alert(
          "Hiba történt 😕\n\n" +
          (err?.message || "Ismeretlen hiba") +
          "\n\nNyisd meg: F12 → Console (ott a teljes részlet)."
        );
      }
    });
  });
})();
