import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { supabaseUrl, supabaseAnonKey } from "../api/config.js";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const form = document.getElementById("registerForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;

  msg.textContent = "Regisztráció folyamatban...";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/login/index.html`
    }
  });

  if (error) {
    msg.textContent = error.message;
    return;
  }

  msg.textContent = "Sikeres regisztráció. Ellenőrizd az emailedet a megerősítéshez.";
});
