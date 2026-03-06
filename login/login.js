import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { supabaseUrl, supabaseAnonKey } from "../api/config.js";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");

async function markExpiredIfNeeded(subscription) {
  if (!subscription?.trial_ends_at) return subscription;

  const now = new Date();
  const end = new Date(subscription.trial_ends_at);

  if (subscription.status === "active" && end < now) {
    await supabase
      .from("subscriptions")
      .update({
        status: "expired",
        updated_at: new Date().toISOString()
      })
      .eq("user_id", subscription.user_id);

    return { ...subscription, status: "expired" };
  }

  return subscription;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;

  msg.textContent = "Belépés...";

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    msg.textContent = "Hibás belépési adatok vagy a fiók nem használható ezzel a móddal.";
    return;
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    msg.textContent = "A felhasználó ellenőrzése sikertelen.";
    return;
  }

  const user = userData.user;

  const { data: subscription, error: subError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (subError || !subscription) {
    msg.textContent = "Nem található hozzáférési rekord.";
    return;
  }

  const fixed = await markExpiredIfNeeded(subscription);

  if (fixed.access_type === "paid" && fixed.status === "active") {
    window.location.href = "/app/demo/app/index.html";
    return;
  }

  if (
    fixed.access_type === "trial" &&
    fixed.status === "active" &&
    fixed.trial_ends_at &&
    new Date(fixed.trial_ends_at) >= new Date()
  ) {
    window.location.href = "/app/demo/app/index.html";
    return;
  }

  window.location.href = "/pay/index.html";
});
