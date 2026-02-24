import styles from "./LoginPage.module.css";
import "./login.global.css";

// ...
<header className={styles.topbar}>
  <a className={styles.brand} href="index.html" aria-label="Vissza a főoldalra">
    <span className={styles.brandMark}>E</span>
    <span className={styles.brandText}>
      EXTOREI <b>BeautySuite</b>
    </span>
  </a>

  <div className={styles.topActions}>
    <button className={styles.chip} type="button" onClick={() => setReduceMotion(v => !v)}>
      ⚡ Smooth
    </button>

    <button className={styles.themeToggle} type="button" onClick={() => setTheme(t => t === "light" ? "dark" : "light")}>
      <span className={styles.themeToggleIcon} aria-hidden="true">{themeIcon}</span>
      <span className={styles.themeToggleText}>{themeLabel}</span>
    </button>
  </div>
</header>

// ...

<main className={styles.wrap}>
  <section className={styles.card} ref={cardRef} aria-label="Bejelentkezés">
    <div className={styles.cardShine} aria-hidden="true" />

    <div className={styles.cardHead}>
      <h1>Bejelentkezés</h1>
      <p>Gyors, elegáns, automatikus — a szalonod új vezérlőpultja.</p>
    </div>

    <form className={styles.form} onSubmit={onSubmit}>
      <label className={styles.field}>
        <span>Email</span>
        <input className={styles.input} type="email" required placeholder="szalon@ceg.hu" autoComplete="email" />
      </label>

      <label className={styles.field}>
        <span>Jelszó</span>
        <div className={styles.pw}>
          <input
            className={styles.input}
            type={showPw ? "text" : "password"}
            required
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <button className={styles.pwToggle} type="button" onClick={() => setShowPw(v => !v)} aria-label="Jelszó megjelenítése">
            👁
          </button>
        </div>
      </label>

      <div className={styles.row}>
        <label className={styles.check}>
          <input type="checkbox" />
          <span>Emlékezz rám</span>
        </label>
        <a className={styles.link} href="#">Elfelejtett jelszó?</a>
      </div>

      <button className={`${styles.btn} ${styles.btnPrimary}`} type="submit">
        <span>Belépek</span>
        <span className={styles.btnArrow} aria-hidden="true">→</span>
      </button>

      <div className={styles.divider}><span>vagy</span></div>

      <button className={`${styles.btn} ${styles.btnGhost}`} type="button" onClick={() => alert("Demo: Google login")}>
        <span className={styles.gDot} aria-hidden="true" />
        Belépés Google-lel
      </button>

      <p className={styles.bottom}>
        Nincs még fiókod? <a className={styles.link} href="index.html#demo">Kérj demót</a>
      </p>
    </form>
  </section>

  <aside className={styles.side}>
    <div className={styles.sideCard}>
      <h2>Tele naptár. Kevesebb káosz.</h2>
      <p>Időpontok, előleg, automatizmusok, kampányok — mind egy helyen.</p>

      <div className={styles.miniKpis}>
        <div className={styles.kpi}><span className={styles.k}>No-show</span><span className={styles.v}>−22%</span></div>
        <div className={styles.kpi}><span className={styles.k}>Átlag kosár</span><span className={styles.v}>+18%</span></div>
        <div className={styles.kpi}><span className={styles.k}>Visszatérők</span><span className={styles.v}>+31%</span></div>
      </div>

      <div className={styles.pulsePill} aria-hidden="true">
        <span className={styles.dot} /> Live: 12 foglalás ma
      </div>
    </div>
  </aside>
</main>
