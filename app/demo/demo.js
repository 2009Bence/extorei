(() => {
  "use strict";

  const d = document;

  async function getClient() {
    if (window.supabaseClient) return window.supabaseClient;

    if (!window.supabase?.createClient) {
      throw new Error("Supabase lib nincs betöltve. Kell: @supabase/supabase-js@2");
    }

    // FONTOS: API route a gyökérből fut: /api/config
    const r = await fetch("/api/config", { cache: "no-store" });
    if (!r.ok) throw new Error("Config fetch failed: " + r.status);

    const cfg = await r.json();
    if (!cfg?.url || !cfg?.anon) throw new Error("Missing Supabase config (/api/config)");

    window.supabaseClient = window.supabase.createClient(cfg.url, cfg.anon);
    return window.supabaseClient;
  }

  async function requireLoginAndAccess(supa) {
    // 1) login kell
    const { data: sess } = await supa.auth.getSession();
    if (!sess.session) {
      // login oldalad útvonala: állítsd be ahogy nálad van
      location.href = "/login/index.html";
      throw new Error("Not logged in");
    }

    // 2) trial/előfizetés check
    const { data, error } = await supa
      .from("profiles")
      .select("trial_end, subscription_status")
      .single();

    if (error) throw new Error("Profile read failed: " + error.message);

    const now = new Date();
    const trialEnd = new Date(data.trial_end);

    const active =
      data.subscription_status === "active" ||
      (data.subscription_status === "trial" && trialEnd > now);

    if (!active) {
      location.href = "/paywall.html";
      throw new Error("Trial expired");
    }

    return sess.session;
  }

  d.addEventListener("DOMContentLoaded", () => {
    const form = d.getElementById("demoForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      try {
        const supa = await getClient();
        await requireLoginAndAccess(supa);

        const name = d.getElementById("name").value.trim();
        const email = d.getElementById("email").value.trim();
        const business = d.getElementById("business").value.trim();

        if (!name || !email || !business) throw new Error("Hiányzó mező.");

        const payload = { name, email, business_type: business };

        const { data, error } = await supa
          .from("leads")
          .insert([payload])
          .select();

        if (error) {
          const msg = (error.message || "").toLowerCase();
          if (msg.includes("row-level security") || msg.includes("permission denied")) {
            location.href = "/paywall.html";
            return;
          }
          throw new Error(error.message);
        }

        form.reset();
        alert("Köszi! ✅ Lead elmentve.");
        console.log("Saved:", data);
      } catch (err) {
        if (String(err?.message).includes("Not logged in")) return;
        if (String(err?.message).includes("Trial expired")) return;

        console.error(err);
        alert("Hiba 😕\n" + (err?.message || "Ismeretlen hiba"));
      }
    });
  });
})();
