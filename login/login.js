import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { supabaseUrl, supabaseAnonKey } from "../api/config.js";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");
const btn = document.getElementById("loginBtn");
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

function setStatus(text, type = "") {
  msg.textContent = text;
  msg.className = `status ${type}`.trim();
}

togglePassword?.addEventListener("click", () => {
  passwordInput.type = passwordInput.type === "password" ? "text" : "password";
});

async function getOwnSubscription(userId) {
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

function hasAccess(subscription) {
  if (!subscription) return false;

  const now = new Date();

  const isPaid =
    subscription.access_type === "paid" &&
    subscription.status === "active";

  const isTrialActive =
    subscription.access_type === "trial" &&
    subscription.status === "active" &&
    subscription.trial_ends_at &&
    new Date(subscription.trial_ends_at) >= now;

  return isPaid || isTrialActive;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = passwordInput.value;

  if (!email || !password) {
    setStatus("Add meg az email címet és a jelszót.", "error");
    return;
  }

  btn.disabled = true;
  setStatus("Belépés folyamatban...");

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });
const isExpired = new Date(subscription.trial_ends_at) < new Date();
  if (signInError) {
    setStatus("Hibás email vagy jelszó, vagy a fiók nincs megerősítve.", "error");
    btn.disabled = false;
    return;
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    setStatus("Nem sikerült ellenőrizni a felhasználót.", "error");
    btn.disabled = false;
    return;
  }

  try {
    let subscription = await getOwnSubscription(userData.user.id);
    subscription = await expireIfNeeded(subscription);

    if (hasAccess(subscription)) {
      setStatus("Sikeres belépés. Átirányítás...", "success");
      window.location.href = "/app/demo/app/index.html";
      return;
    }

    setStatus("A demo hozzáférés lejárt. Átirányítás fizetésre...", "error");
    window.location.href = "/pay/index.html";
  } catch (err) {
    console.error(err);
    setStatus("Nem található hozzáférési rekord ehhez a fiókhoz.", "error");
    btn.disabled = false;
  }
});
