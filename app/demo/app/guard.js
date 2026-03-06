import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { supabaseUrl, supabaseAnonKey } from "../../../api/config.js";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const loading = document.getElementById("loading");
const app = document.getElementById("app");

async function guard() {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    window.location.href = "/login/index.html";
    return;
  }

  const user = userData.user;

  const { data: subscription, error: subError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (subError || !subscription) {
    window.location.href = "/login/index.html";
    return;
  }

  const now = new Date();
  const trialEnd = subscription.trial_ends_at ? new Date(subscription.trial_ends_at) : null;

  const isPaid = subscription.access_type === "paid" && subscription.status === "active";
  const isTrialActive =
    subscription.access_type === "trial" &&
    subscription.status === "active" &&
    trialEnd &&
    trialEnd >= now;

  if (!isPaid && !isTrialActive) {
    if (subscription.status === "active" && trialEnd && trialEnd < now) {
      await supabase
        .from("subscriptions")
        .update({
          status: "expired",
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);
    }

    window.location.href = "/pay/index.html";
    return;
  }

  loading.hidden = true;
  app.hidden = false;
}

guard();

document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "/login/index.html";
});
