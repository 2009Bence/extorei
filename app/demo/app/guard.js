import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { supabaseUrl, supabaseAnonKey } from "../../../api/config.js";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const loadingScreen = document.getElementById("loadingScreen");
const appShell = document.getElementById("appShell");
const accessBadge = document.getElementById("accessBadge");
const logoutBtn = document.getElementById("logoutBtn");

function showApp(text = "Aktív hozzáférés") {
  if (accessBadge) accessBadge.textContent = text;
  loadingScreen.hidden = true;
  appShell.hidden = false;
}

async function redirectToLogin() {
  window.location.href = "/login/index.html";
}

async function redirectToPay() {
  window.location.href = "/pay/index.html";
}

async function getSubscription(userId) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data;
}

async function expireIfNeeded(subscription) {
  if (!subscription?.trial_ends_at) return subscription;

  const now = new Date();
  const end = new Date(subscription.trial_ends_at);

  if (subscription.status === "active" && end < now) {
    await supabase
      .from("subscriptions")
      .update({ status: "expired" })
      .eq("user_id", subscription.user_id);

    return { ...subscription, status: "expired" };
  }

  return subscription;
}

function resolveAccess(subscription) {
  const now = new Date();

  const isPaid =
    subscription.access_type === "paid" &&
    subscription.status === "active";

  const isTrialActive =
    subscription.access_type === "trial" &&
    subscription.status === "active" &&
    subscription.trial_ends_at &&
    new Date(subscription.trial_ends_at) >= now;

  return {
    isPaid,
    isTrialActive,
    hasAccess: isPaid || isTrialActive
  };
}

async function guardRoute() {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    await redirectToLogin();
    return;
  }

  try {
    let subscription = await getSubscription(userData.user.id);
    subscription = await expireIfNeeded(subscription);

    const access = resolveAccess(subscription);

    if (!access.hasAccess) {
      await redirectToPay();
      return;
    }

    showApp(access.isPaid ? "Fizetett hozzáférés" : "Aktív trial");
  } catch (error) {
    console.error("Guard hiba:", error);
    await redirectToLogin();
  }
}

logoutBtn?.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "/login/index.html";
});

guardRoute();
