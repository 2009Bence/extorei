(() => {
  "use strict";

  const d = document;

  async function getClient() {
    if (window.supabaseClient) return window.supabaseClient;

    if (!window.supabase?.createClient) {
      throw new Error("Supabase lib nincs betöltve. Kell: @supabase/supabase-js@2");
    }

    const r = await fetch("/api/config", { cache: "no-store" });
    if (!r.ok) throw new Error("Config fetch failed: " + r.status);
    const cfg = await r.json();
    if (!cfg?.url || !cfg?.anon) throw new Error("Missing Supabase config (/api/config)");

    window.supabaseClient = window.supabase.createClient(cfg.url, cfg.anon);
    return window.supabaseClient;
  }

  async function requireLoginAndAccess(supa) {
    // 1) login kötelező
    const { data: sess } = await supa.auth.getSession();
    if (!sess.session) {
      location.href = "/login/index.html";
      throw new Error("Not logged in");
    }

    // 2) trial/előfizetés ellenőrzés (profiles-ból)
    const { data, error } = await supa
      .from("profiles")
      .select("trial_end, subscription_status")
      .single();

    if (error) {
      // ha nincs profil valamiért, a triggerrel általában nem fordul elő,
      // de legyen safe:
      throw new Error("Profile read failed: " + error.message);
    }

    const now = new Date();
    const trialEnd = new Date(data.trial_end);
    const active =
      data.subscription_status === "active" ||
      (data.subscription_status === "trial" && trialEnd > now);

    if (!active) {
      location.href = "/paywall.html";
      throw new Error("Trial expired / not active");
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

        const name = form.querySelector('input[type="text"]')?.value?.trim();
        const email = form.querySelector('input[type="email"]')?.value?.trim();
        const business = form.querySelector("select")?.value?.trim();

        if (!name || !email || !business) throw new Error("Hiányzó mező.");

        const payload = { name, email, business_type: business };

        const { data, error } = await supa
          .from("leads")
          .insert([payload])
          .select();

        if (error) {
          // ha mégis RLS, akkor paywall (lejárt/tiltott)
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
        // ha redirect volt, nem kell alert-spam
        if (String(err?.message).includes("Not logged in")) return;
        if (String(err?.message).includes("Trial expired")) return;

        console.error(err);
        alert("Hiba 😕\n" + (err?.message || "Ismeretlen hiba"));
      }
    });
  });
})();
