(async () => {

  try {

    const r = await fetch("/api/config", { cache: "no-store" });
    const cfg = await r.json();

    const supabaseClient = supabase.createClient(cfg.url, cfg.anon);

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      console.error("Logout hiba:", error.message);
    }

    // vissza a főoldalra
    window.location.href = "/";

  } catch (err) {

    console.error("Logout exception:", err);

    window.location.href = "/";
  }

})();
