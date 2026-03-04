// /api/entitlement.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ ok: false, reason: "no_token" });

    // Service role kell, mert a token ellenőrzést és user lekérést szerver oldalon végezzük
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Token -> user
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) return res.status(401).json({ ok: false, reason: "bad_token" });

    const userId = userData.user.id;

    // profil
    const { data: prof, error: profErr } = await supabaseAdmin
      .from("profiles")
      .select("trial_ends_at, paid_until, plan")
      .eq("id", userId)
      .single();

    if (profErr || !prof) return res.status(404).json({ ok: false, reason: "no_profile" });

    const now = new Date();
    const trialEnds = new Date(prof.trial_ends_at);
    const paidUntil = prof.paid_until ? new Date(prof.paid_until) : null;

    const trialActive = now < trialEnds;
    const paidActive = paidUntil ? now < paidUntil : false;

    const access = trialActive || paidActive;

    return res.status(200).json({
      ok: true,
      access,
      trialActive,
      paidActive,
      trialEndsAt: prof.trial_ends_at,
      paidUntil: prof.paid_until,
      plan: prof.plan
    });
  } catch (e) {
    return res.status(500).json({ ok: false, reason: "server_error", message: e.message });
  }
}
