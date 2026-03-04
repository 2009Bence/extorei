(async () => {
  const $ = (id) => document.getElementById(id);

  const statusTitle = $("statusTitle");
  const statusSub   = $("statusSub");
  const statusDot   = document.querySelector(".dot");
  const logEl       = $("log");

  const servicesEl  = $("services");
  const chosenLabel = $("chosenLabel");
  const entLabel    = $("entLabel");
  const trialLabel  = $("trialLabel");

  const startBtn    = $("startBtn");
  const logoutBtn   = $("logoutBtn");

  const themeBtn    = $("themeBtn");
  const themeIcon   = $("themeIcon");
  const themeLabel  = $("themeLabel");

  const STORAGE_KEY = "extorei_demo_service";
  const PAY_URL     = "/pay/index.html";
  const LOGIN_URL   = "/login.html";
  const APP_URL     = "/demo/app/index.html";

  // --- Simple services list (te ezt később jöhet DB/API-ból) ---
  const SERVICES = [
    { id: "booking", name: "Online foglalás", desc: "Időpontok, naptár, foglalási oldal", tag: "Demo" },
    { id: "pos",     name: "POS / Pénztár",   desc: "Fizetések, termékek, blokk logika",   tag: "Pro" },
    { id: "crm",     name: "CRM",            desc: "Ügyfél adatlap, jegyzetek, history",  tag: "Pro" },
    { id: "reports", name: "Riportok",       desc: "Bevétel, kihasználtság, toplisták",   tag: "Plus" }
  ];

  function setLog(msg){
    logEl.textContent = "Log: " + msg;
  }

  // --- Theme toggle (simple) ---
  const THEME_KEY = "extorei_theme";
  const getTheme = () => localStorage.getItem(THEME_KEY) || document.documentElement.dataset.theme || "light";
  const applyTheme = (t) => {
    document.documentElement.dataset.theme = t;
    const isDark = t === "dark";
    themeIcon.textContent = isDark ? "🌙" : "☀️";
    themeLabel.textContent = isDark ? "Sötét" : "Világos";
  };
  applyTheme(getTheme());

  themeBtn.addEventListener("click", () => {
    const next = (document.documentElement.dataset.theme === "dark") ? "light" : "dark";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });

  // --- Render services ---
  function renderServices(selectedId){
    servicesEl.innerHTML = "";
    for (const s of SERVICES){
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "service" + (s.id === selectedId ? " active" : "");
      btn.innerHTML = `
        <div class="s-left">
          <b>${escapeHtml(s.name)}</b>
          <small>${escapeHtml(s.desc)}</small>
        </div>
        <span class="tag">${escapeHtml(s.tag)}</span>
      `;
      btn.addEventListener("click", () => {
        localStorage.setItem(STORAGE_KEY, s.id);
        renderServices(s.id);
        chosenLabel.textContent = s.name;
        setLog("Szolgáltatás kiválasztva: " + s.id);
      });
      servicesEl.appendChild(btn);
    }
  }

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, (m) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"
    }[m]));
  }

  function getQueryParam(name){
    const u = new URL(location.href);
    return u.searchParams.get(name);
  }

  // Preselect from query ?service=pos
  const fromQuery = getQueryParam("service");
  if (fromQuery && SERVICES.some(s => s.id === fromQuery)){
    localStorage.setItem(STORAGE_KEY, fromQuery);
  }

  const selected = localStorage.getItem(STORAGE_KEY) || SERVICES[0].id;
  const selectedObj = SERVICES.find(s => s.id === selected) || SERVICES[0];
  chosenLabel.textContent = selectedObj.name;
  renderServices(selectedObj.id);

  // --- Supabase init via /api/config ---
  let supa;
  let session;

  try{
    const cfgRes = await fetch("/api/config", { cache: "no-store" });
    if (!cfgRes.ok) throw new Error("Config fetch failed: " + cfgRes.status);
    const cfg = await cfgRes.json();
    if (!cfg.url || !cfg.anon) throw new Error("Hiányzó cfg: url/anon");

    supa = window.supabase.createClient(cfg.url, cfg.anon);

    const { data, error } = await supa.auth.getSession();
    if (error) throw error;
    session = data?.session;

    if (!session){
      location.replace(LOGIN_URL);
      return;
    }
  } catch (e){
    statusTitle.textContent = "Hiba";
    statusSub.textContent = e.message || String(e);
    statusDot.style.background = "var(--bad)";
    setLog("Init error: " + (e.message || e));
    return;
  }

  // Logout
  logoutBtn.addEventListener("click", async () => {
    try{
      await supa.auth.signOut();
    } finally {
      location.replace(LOGIN_URL);
    }
  });

  // --- Entitlement check ---
  async function checkEntitlement(){
    statusTitle.textContent = "Ellenőrzés…";
    statusSub.textContent = "Jogosultság (trial/paid) ellenőrzése.";
    statusDot.style.background = "var(--warn)";
    entLabel.textContent = "–";
    trialLabel.textContent = "–";

    const res = await fetch("/api/entitlement", {
      headers: { Authorization: "Bearer " + session.access_token }
    });

    if (!res.ok){
      entLabel.textContent = "Ismeretlen";
      statusTitle.textContent = "Nem ellenőrizhető";
      statusSub.textContent = "Nem érhető el az entitlement endpoint. (api/entitlement)";
      statusDot.style.background = "var(--bad)";
      return { access: false, reason: "entitlement_unreachable" };
    }

    const ent = await res.json();
    if (!ent.ok){
      statusTitle.textContent = "Hiba";
      statusSub.textContent = "Entitlement válasz: " + (ent.reason || "unknown");
      statusDot.style.background = "var(--bad)";
      return { access: false, reason: ent.reason || "entitlement_error" };
    }

    // UI labels
    const access = !!ent.access;
    const label = access ? "Hozzáférés OK" : "Lejárt / nincs hozzáférés";
    entLabel.textContent = label;
    trialLabel.textContent = ent.trialEndsAt ? new Date(ent.trialEndsAt).toLocaleString("hu-HU") : "–";

    if (access){
      statusTitle.textContent = "Belépve ✅";
      statusSub.textContent = "User: " + (session.user.email || session.user.id);
      statusDot.style.background = "var(--ok)";
    } else {
      statusTitle.textContent = "Hozzáférés nincs";
      statusSub.textContent = "Trial lejárt vagy nincs aktív előfizetés.";
      statusDot.style.background = "var(--bad)";
    }

    return ent;
  }

  let entitlement;
  try{
    entitlement = await checkEntitlement();
  } catch (e){
    setLog("Entitlement check crash: " + (e.message || e));
  }

  // --- Start demo ---
  startBtn.addEventListener("click", async () => {
    startBtn.disabled = true;
    startBtn.textContent = "Ellenőrzés…";

    try{
      // always re-check on click
      entitlement = await checkEntitlement();

      const chosen = localStorage.getItem(STORAGE_KEY) || SERVICES[0].id;
      localStorage.setItem(STORAGE_KEY, chosen);

      if (entitlement && entitlement.access){
        setLog("Access OK → " + APP_URL + " (service=" + chosen + ")");
        // opcionális: queryben is átadhatod
        location.href = APP_URL + "?service=" + encodeURIComponent(chosen);
      } else {
        setLog("Nincs access → " + PAY_URL);
        location.href = PAY_URL;
      }
    } catch (e){
      setLog("Start error: " + (e.message || e));
      location.href = PAY_URL;
    } finally {
      startBtn.disabled = false;
      startBtn.textContent = "Demo indítása →";
    }
  });

  setLog("Készen. Válassz szolgáltatást és indítsd a demót.");
})();
