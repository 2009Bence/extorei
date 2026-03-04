(async () => {
  const PAY_URL = "/pay/index.html";
  const LOGIN_URL = "/login.html";

  // Supabase client init a te /api/config endpointodból
  const cfgRes = await fetch("/api/config", { cache: "no-store" });
  if (!cfgRes.ok) { location.href = PAY_URL; return; }
  const cfg = await cfgRes.json();

  const supa = window.supabase.createClient(cfg.url, cfg.anon);

  // van session?
  const { data } = await supa.auth.getSession();
  const session = data?.session;

  if (!session) {
    location.replace(LOGIN_URL);
    return;
  }

  // szerver oldali entitlement check (JWT-vel)
  const entRes = await fetch("/api/entitlement", {
    headers: { Authorization: "Bearer " + session.access_token }
  });

  if (!entRes.ok) {
    location.replace(PAY_URL);
    return;
  }

  const ent = await entRes.json();

  if (!ent.access) {
    location.replace(PAY_URL);
    return;
  }

  // ha access ok, hagyjuk betölteni az appot
})();
