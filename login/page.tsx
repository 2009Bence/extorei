import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * LoginPage.tsx
 * - A te HTML-ed TSX-re (React) átírva.
 * - A külső login.css + login.js helyett inline logika van:
 *   - theme toggle (light/dark)
 *   - reduce motion toggle
 *   - jelszó show/hide
 *   - enyhe “tilt” effekt az #tiltCard-on
 *   - egyszerű canvas háttér (demo)
 *
 * Megjegyzés: a Google font linkeket tedd az index.html <head>-be (Vite/Next esetén).
 */

export default function LoginPage() {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const themeLabel = useMemo(() => (theme === "light" ? "Light" : "Dark"), [theme]);
  const themeIcon = useMemo(() => (theme === "light" ? "☀" : "🌙"), [theme]);

  // ===== THEME APPLY =====
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.dataset.theme = theme;
    document.documentElement.setAttribute("data-reduce-motion", reduceMotion ? "true" : "false");
  }, [theme, reduceMotion]);

  // ===== TILT EFFECT =====
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    if (reduceMotion) {
      el.style.transform = "none";
      return;
    }

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rx = ((y / rect.height) - 0.5) * -10; // rotateX
      const ry = ((x / rect.width) - 0.5) * 10;  // rotateY
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    };

    const onLeave = () => {
      el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
    };

    window.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [reduceMotion]);

  // ===== CANVAS BACKGROUND (DEMO) =====
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;

    const resize = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const dots = Array.from({ length: 90 }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 1 + Math.random() * 2,
      vx: (-0.3 + Math.random() * 0.6),
      vy: (-0.3 + Math.random() * 0.6),
      a: 0.12 + Math.random() * 0.18,
    }));

    const tick = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // háttér fátyol
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = theme === "light" ? "#ffffff" : "#07080a";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // pöttyök
      ctx.globalAlpha = reduceMotion ? 0.25 : 0.35;
      ctx.fillStyle = theme === "light" ? "#111827" : "#e5e7eb";
      for (const d of dots) {
        if (!reduceMotion) {
          d.x += d.vx;
          d.y += d.vy;
        }
        if (d.x < -10) d.x = window.innerWidth + 10;
        if (d.x > window.innerWidth + 10) d.x = -10;
        if (d.y < -10) d.y = window.innerHeight + 10;
        if (d.y > window.innerHeight + 10) d.y = -10;

        ctx.globalAlpha = d.a;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = window.requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(raf);
    };
  }, [theme, reduceMotion]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Demo: ide jön majd az auth API.");
  };

  return (
    <div className="page">
      {/* Multi-layer animated background */}
      <div className="bg">
        <canvas id="bg" ref={canvasRef} />
        <div className="aurora a1" aria-hidden="true" />
        <div className="aurora a2" aria-hidden="true" />
        <div className="aurora a3" aria-hidden="true" />
        <div className="noise" aria-hidden="true" />
        <div className="vignette" aria-hidden="true" />
      </div>

      <header className="topbar">
        <a className="brand" href="index.html" aria-label="Vissza a főoldalra">
          <span className="brand-mark">E</span>
          <span className="brand-text">
            EXTOREI <b>BeautySuite</b>
          </span>
        </a>

        <div className="top-actions">
          <button
            className="chip"
            type="button"
            id="reduceMotion"
            aria-label="Animációk csökkentése"
            onClick={() => setReduceMotion((v) => !v)}
          >
            ⚡ Smooth
          </button>

          <button
            className="theme-toggle"
            id="themeToggle"
            type="button"
            aria-label="Téma váltása (light/dark)"
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
          >
            <span className="theme-toggle__icon" aria-hidden="true">
              {themeIcon}
            </span>
            <span className="theme-toggle__text">{themeLabel}</span>
          </button>
        </div>
      </header>

      <main className="wrap">
        <section className="card" id="tiltCard" aria-label="Bejelentkezés" ref={cardRef}>
          <div className="card-shine" aria-hidden="true" />

          <div className="card-head">
            <h1>Bejelentkezés</h1>
            <p>Gyors, elegáns, automatikus — a szalonod új vezérlőpultja.</p>
          </div>

          <form className="form" onSubmit={onSubmit}>
            <label className="field">
              <span>Email</span>
              <input type="email" required placeholder="szalon@ceg.hu" autoComplete="email" />
            </label>

            <label className="field">
              <span>Jelszó</span>
              <div className="pw">
                <input
                  id="pw"
                  type={showPw ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  className="pw-toggle"
                  id="pwToggle"
                  type="button"
                  aria-label="Jelszó megjelenítése"
                  onClick={() => setShowPw((v) => !v)}
                >
                  👁
                </button>
              </div>
            </label>

            <div className="row">
              <label className="check">
                <input type="checkbox" />
                <span>Emlékezz rám</span>
              </label>
              <a className="link" href="#">
                Elfelejtett jelszó?
              </a>
            </div>

            <button className="btn btn-primary" type="submit">
              <span>Belépek</span>
              <span className="btn-arrow" aria-hidden="true">
                →
              </span>
            </button>

            <div className="divider">
              <span>vagy</span>
            </div>

            <button className="btn btn-ghost" type="button" onClick={() => alert("Demo: Google login")}>
              <span className="g-dot" aria-hidden="true" />
              Belépés Google-lel
            </button>

            <p className="bottom">
              Nincs még fiókod? <a className="link" href="index.html#demo">Kérj demót</a>
            </p>
          </form>
        </section>

        <aside className="side">
          <div className="side-card">
            <h2>Tele naptár. Kevesebb káosz.</h2>
            <p>Időpontok, előleg, automatizmusok, kampányok — mind egy helyen.</p>

            <div className="mini-kpis">
              <div className="kpi">
                <span className="k">No-show</span>
                <span className="v">−22%</span>
              </div>
              <div className="kpi">
                <span className="k">Átlag kosár</span>
                <span className="v">+18%</span>
              </div>
              <div className="kpi">
                <span className="k">Visszatérők</span>
                <span className="v">+31%</span>
              </div>
            </div>

            <div className="pulse-pill" aria-hidden="true">
              <span className="dot" /> Live: 12 foglalás ma
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
