"use client";

import { useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";

export default function Page() {
  const [theme, setTheme] = useState<Theme>("light");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // első rendernél: localStorage + system theme
  useEffect(() => {
    const saved = (localStorage.getItem("theme") as Theme | null) ?? null;

    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
      return;
    }

    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const initial: Theme = prefersDark ? "dark" : "light";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
    localStorage.setItem("theme", initial);
  }, []);

  // ha theme változik
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // mobil drawer scroll lock + ESC
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const themeLabel = useMemo(() => (theme === "light" ? "Light" : "Dark"), [theme]);
  const themeIcon = useMemo(() => (theme === "light" ? "☀" : "🌙"), [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      {/* Top progress blur (decor) */}
      <div className="top-glow" aria-hidden="true" />

      {/* Header */}
      <header className="header" id="top">
        <div className="container header-inner">
          <a className="brand" href="#top" aria-label="Főoldal">
            <span className="brand-mark">E</span>
            <span className="brand-text">
              EXTOREI <b>BeautySuite</b>
            </span>
          </a>

          <nav className="nav-desktop" aria-label="Fő navigáció">
            <a href="#features">Funkciók</a>
            <a href="#how">Hogyan működik</a>
            <a href="#pricing">Árazás</a>
            <a href="#faq">GYIK</a>
          </nav>

          <div className="header-actions">
            <button
              className="theme-toggle"
              id="themeToggle"
              type="button"
              aria-label="Téma váltása (light/dark)"
              onClick={toggleTheme}
            >
              <span className="theme-toggle__icon" aria-hidden="true">
                {themeIcon}
              </span>
              <span className="theme-toggle__text">{themeLabel}</span>
            </button>

            <a className="btn btn-ghost" href="#demo">
              Demo kérése
            </a>

            <a className="btn btn-primary" href="#start">
              <span className="btn-long">Ingyen kipróbálom</span>
            </a>

            <button
              className={`hamburger ${drawerOpen ? "is-open" : ""}`}
              id="hamburger"
              type="button"
              aria-label="Menü megnyitása"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`mobile-drawer ${drawerOpen ? "is-open" : ""}`}
          id="mobileDrawer"
          aria-hidden={!drawerOpen}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDrawer();
          }}
        >
          <div className="mobile-drawer__panel" role="dialog" aria-label="Mobil menü">
            <div className="mobile-drawer__top">
              <span className="mobile-brand">BeautySuite</span>
              <button
                className="mobile-close"
                id="mobileClose"
                type="button"
                aria-label="Menü bezárása"
                onClick={closeDrawer}
              >
                ✕
              </button>
            </div>

            <nav className="mobile-nav" aria-label="Mobil navigáció">
              <a href="#features" className="m-link" onClick={closeDrawer}>
                Funkciók
              </a>
              <a href="#how" className="m-link" onClick={closeDrawer}>
                Hogyan működik
              </a>
              <a href="#pricing" className="m-link" onClick={closeDrawer}>
                Árazás
              </a>
              <a href="#faq" className="m-link" onClick={closeDrawer}>
                GYIK
              </a>
              <a href="#demo" className="m-link" onClick={closeDrawer}>
                Demo kérése
              </a>
            </nav>

            <div className="mobile-cta">
              <a className="btn btn-primary btn-block" href="#start" onClick={closeDrawer}>
                Ingyen kipróbálom
              </a>
              <p className="tiny muted">1 perc setup • lemondható bármikor</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="pill-row">
                <span className="pill">Online foglalás</span>
                <span className="pill">POS & fizetés</span>
                <span className="pill">CRM & automatizálás</span>
              </div>

              <h1 className="h1">
                Töltsd tele a naptárad. <span className="accent">Kevesebb admin</span>, több vendég.
              </h1>

              <p className="lead">
                BeautySuite egy all-in-one rendszer szépségvállalkozásoknak: foglalás, naptár, fizetés/POS,
                ügyfélkezelés, csomagok, bérletek, ajándékkártya, üzenet automatizmusok és riportok — egy helyen.
              </p>

              <div className="hero-cta" id="start">
                <a className="btn btn-primary" href="#demo">
                  Kérek demót
                </a>
                <a className="btn btn-ghost" href="#pricing">
                  Árazás megnézése
                </a>
              </div>

              <div className="trust">
                <div className="trust-item">
                  <span className="trust-kpi">⚡</span>
                  <span className="trust-text">Gyors foglalási flow</span>
                </div>
                <div className="trust-item">
                  <span className="trust-kpi">🔒</span>
                  <span className="trust-text">Biztonságos adatok</span>
                </div>
                <div className="trust-item">
                  <span className="trust-kpi">📱</span>
                  <span className="trust-text">Mobilra optimalizált</span>
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="hero-visual" aria-hidden="true">
              <div className="glass-card">
                <div className="glass-top">
                  <div className="dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="glass-title">Mai naptár</span>
                  <span className="glass-badge">+12 foglalás</span>
                </div>

                <div className="calendar">
                  <div className="calendar-row">
                    <span className="t">09:00</span>
                    <div className="appt a1">
                      <b>Balayage + vágás</b>
                      <span>Szabó Anna • 2 óra</span>
                    </div>
                  </div>
                  <div className="calendar-row">
                    <span className="t">11:30</span>
                    <div className="appt a2">
                      <b>Gél lakk</b>
                      <span>Kiss Lili • 60 perc</span>
                    </div>
                  </div>
                  <div className="calendar-row">
                    <span className="t">13:00</span>
                    <div className="appt a3">
                      <b>Kozmetika</b>
                      <span>Nagy Dóra • 90 perc</span>
                    </div>
                  </div>

                  <div className="mini-stats">
                    <div className="mini">
                      <span className="mini-k">No-show</span>
                      <span className="mini-v">−22%</span>
                    </div>
                    <div className="mini">
                      <span className="mini-k">Átlag kosár</span>
                      <span className="mini-v">+18%</span>
                    </div>
                    <div className="mini">
                      <span className="mini-k">Visszatérők</span>
                      <span className="mini-v">+31%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="floating-chip fc1">Automatikus emlékeztetők</div>
              <div className="floating-chip fc2">Kártyás fizetés</div>
              <div className="floating-chip fc3">Csomagok & bérletek</div>
            </div>
          </div>
        </section>

        {/* Logos strip */}
        <section className="strip">
          <div className="container strip-inner">
            <span className="strip-text">
              Készen áll szalonoknak, egyéni vállalkozóknak és több telephelyre is.
            </span>
            <div className="strip-logos" aria-hidden="true">
              <span>Hair</span>
              <span>Nails</span>
              <span>Beauty</span>
              <span>Massage</span>
              <span>Spa</span>
              <span>Barber</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="section" id="features">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">/ Funkciók</span>
              <h2 className="h2">Minden, amit a foglalástól a fizetésig használsz</h2>
              <p className="sublead">
                A piacon bevált “all-in-one” modell: foglalás + naptár + fizetés/POS + ügyfélkezelés +
                marketing/automatizálás.
              </p>
            </div>

            <div className="feature-grid">
              <article className="feature">
                <div className="icon">📅</div>
                <h3>Online foglalás + okos naptár</h3>
                <p>Szabályok, szünetek, kapacitás, szolgáltatás-idők, személyzet, több erőforrás (szék/szoba).</p>
                <ul className="ticks">
                  <li>Gyors foglalási link</li>
                  <li>Áttekinthető heti nézet</li>
                  <li>Ütközésvédelem</li>
                </ul>
              </article>

              <article className="feature">
                <div className="icon">💳</div>
                <h3>Fizetés & POS</h3>
                <p>Egyszerű pénztár, borravaló, számlázási exportok, termékértékesítés, előleg kezelés.</p>
                <ul className="ticks">
                  <li>Előleg / no-show védelem</li>
                  <li>Termékek és készlet alap</li>
                  <li>Napi zárás riport</li>
                </ul>
              </article>

              <article className="feature">
                <div className="icon">👥</div>
                <h3>CRM & vendégprofil</h3>
                <p>Vendégtörténet, preferenciák, megjegyzések, szokások, visszatérés követése.</p>
                <ul className="ticks">
                  <li>Okos címkék</li>
                  <li>Érték/gyakoriság szegmensek</li>
                  <li>Gyors visszafoglalás</li>
                </ul>
              </article>

              <article className="feature">
                <div className="icon">✉️</div>
                <h3>Automatizálás</h3>
                <p>Emlékeztetők, visszahívó kampányok, “régen járt nálunk” flow-k — beépítve.</p>
                <ul className="ticks">
                  <li>Email/SMS sablonok</li>
                  <li>Időzített üzenetek</li>
                  <li>Akciók és kuponok</li>
                </ul>
              </article>

              <article className="feature">
                <div className="icon">🎁</div>
                <h3>Csomagok, bérletek, ajándékkártya</h3>
                <p>Új bevételi lábak: előre fizetett csomagok és ajándékozás, egyszerű beváltással.</p>
                <ul className="ticks">
                  <li>Rugalmas csomagok</li>
                  <li>Lejárat kezelése</li>
                  <li>Ajándékkártya kódok</li>
                </ul>
              </article>

              <article className="feature">
                <div className="icon">📈</div>
                <h3>Riportok, teljesítmény, növekedés</h3>
                <p>Bevétel, kihasználtság, visszatérők, szolgáltatás-toplista, csapat teljesítmény.</p>
                <ul className="ticks">
                  <li>Heti összefoglalók</li>
                  <li>Szolgáltatás profitability</li>
                  <li>Exportok</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="section soft" id="how">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">/ Hogyan működik</span>
              <h2 className="h2">3 lépés, és él a rendszer</h2>
            </div>

            <div className="steps">
              <div className="step">
                <span className="step-n">01</span>
                <h3>Beállítod a szolgáltatásokat</h3>
                <p>Időtartamok, árak, személyzet, erőforrások — 10–15 perc.</p>
              </div>
              <div className="step">
                <span className="step-n">02</span>
                <h3>Megosztod a foglalási linket</h3>
                <p>Website, Instagram bio, Google profil, QR kód a pultnál.</p>
              </div>
              <div className="step">
                <span className="step-n">03</span>
                <h3>Automatizálsz és növekedsz</h3>
                <p>Emlékeztetők, utánkövetés, visszahívás — kevesebb no-show.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="section" id="pricing">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">/ Árazás</span>
              <h2 className="h2">Egyszerű csomagok, amik veled nőnek</h2>
              <p className="sublead">Light alapból, Dark egy kattintás — mobilon is tökéletes.</p>
            </div>

            <div className="pricing">
              <article className="plan">
                <div className="plan-top">
                  <h3>Solo</h3>
                  <p className="muted">Egyéni vállalkozóknak</p>
                  <div className="price">
                    <span className="amount">9 990</span>
                    <span className="unit">Ft / hó</span>
                  </div>
                </div>
                <ul className="plan-list">
                  <li>Online foglalás</li>
                  <li>Naptár</li>
                  <li>Automatikus emlékeztetők</li>
                  <li>Alap riportok</li>
                </ul>
                <a className="btn btn-ghost btn-block" href="#demo">
                  Kérek demót
                </a>
              </article>

              <article className="plan featured">
                <div className="plan-badge">Legnépszerűbb</div>
                <div className="plan-top">
                  <h3>Studio</h3>
                  <p className="muted">Kis csapatoknak</p>
                  <div className="price">
                    <span className="amount">24 990</span>
                    <span className="unit">Ft / hó</span>
                  </div>
                </div>
                <ul className="plan-list">
                  <li>Minden a Solo-ból</li>
                  <li>POS & előleg kezelés</li>
                  <li>CRM szegmensek</li>
                  <li>Csomagok & ajándékkártya</li>
                </ul>
                <a className="btn btn-primary btn-block" href="#demo">
                  Ingyen kipróbálom
                </a>
              </article>

              <article className="plan">
                <div className="plan-top">
                  <h3>Multi</h3>
                  <p className="muted">Több telephelyre</p>
                  <div className="price">
                    <span className="amount">Egyedi</span>
                    <span className="unit"> / ajánlat</span>
                  </div>
                </div>
                <ul className="plan-list">
                  <li>Telephely kezelés</li>
                  <li>Jogosultságok</li>
                  <li>Haladó riportok</li>
                  <li>Onboarding támogatás</li>
                </ul>
                <a className="btn btn-ghost btn-block" href="#demo">
                  Kapcsolat
                </a>
              </article>
            </div>

            <div className="pricing-note">
              <p className="tiny muted">
                Tipp: Ha szeretnéd, össze tudjuk rakni úgy is, hogy “foglalható munkatárs” alapú legyen (team member
                pricing), mert ez tipikus modell ebben a piaci kategóriában.
              </p>
            </div>
          </div>
        </section>

        {/* Demo / CTA */}
        <section className="section soft" id="demo">
          <div className="container">
            <div className="cta-card">
              <div className="cta-copy">
                <h2 className="h2">Kérsz egy 5 perces demót?</h2>
                <p className="sublead">
                  Megmutatom, hogyan nézne ki a te szalonodra szabva: szolgáltatások, csapat, foglalási flow.
                </p>
                <div className="cta-bullets">
                  <span className="pill">Foglalási link</span>
                  <span className="pill">Naptár</span>
                  <span className="pill">POS</span>
                  <span className="pill">Automatizmusok</span>
                </div>
              </div>

              <form
                className="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Köszi! (Itt majd mehet az API hívás.)");
                }}
              >
                <label className="field">
                  <span>Név</span>
                  <input type="text" required placeholder="Pl. Viasz-Kádi Bence" />
                </label>
                <label className="field">
                  <span>Email</span>
                  <input type="email" required placeholder="bence@ceg.hu" />
                </label>
                <label className="field">
                  <span>Vállalkozás típusa</span>
                  <select required defaultValue="">
                    <option value="" disabled>
                      Válassz…
                    </option>
                    <option>Fodrászat</option>
                    <option>Kozmetika</option>
                    <option>Körmös</option>
                    <option>Masszázs</option>
                    <option>Spa</option>
                    <option>Barber</option>
                    <option>Egyéb</option>
                  </select>
                </label>
                <button className="btn btn-primary btn-block" type="submit">
                  Időpontot kérek
                </button>
                <p className="tiny muted">Nem spam. 24 órán belül válasz.</p>
              </form>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section" id="faq">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">/ GYIK</span>
              <h2 className="h2">Kérdések, amik mindig előjönnek</h2>
            </div>

            <div className="faq">
              <details>
                <summary>Lehet előleget kérni foglaláskor?</summary>
                <p>
                  Igen. Beállítható szolgáltatásonként, illetve szabályokkal (pl. új vendégnek kötelező).
                </p>
              </details>
              <details>
                <summary>Van CRM és vendégtörténet?</summary>
                <p>Igen, vendégprofil, jegyzetek, címkék, visszatérési adatok és szegmensek.</p>
              </details>
              <details>
                <summary>Mobilon is tökéletes?</summary>
                <p>Igen. A landing és a foglalási flow is mobil-first, és a menü/téma váltó is touch-barát.</p>
              </details>
              <details>
                <summary>Light/Dark mód megjegyzi a választást?</summary>
                <p>Igen, localStorage-ben mentjük, és a rendszer témáját is figyelembe vesszük első látogatáskor.</p>
              </details>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="container footer-inner">
            <div className="footer-left">
              <div className="brand-mini">EXTOREI BeautySuite</div>
              <p className="tiny muted">All-in-one foglalás + POS + CRM szépségvállalkozásoknak.</p>
            </div>
            <div className="footer-links">
              <a href="#features">Funkciók</a>
              <a href="#pricing">Árazás</a>
              <a href="#demo">Demo</a>
              <a href="#top">Vissza a tetejére</a>
            </div>
          </div>
          <div className="container footer-bottom">
            <span className="tiny muted">© 2026 EXTOREI</span>
            <span className="tiny muted">Light/Dark • Responsive • Fast</span>
          </div>
        </footer>
      </main>
    </>
  );
}
