import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { supabaseUrl, supabaseAnonKey } from "../api/config.js";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const form = document.getElementById("registerForm");
const msg = document.getElementById("msg");
const btn = document.getElementById("registerBtn");
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

function setStatus(text, type = "") {
  msg.textContent = text;
  msg.className = `status ${type}`.trim();
}

togglePassword?.addEventListener("click", () => {
  passwordInput.type = passwordInput.type === "password" ? "text" : "password";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = passwordInput.value;

  if (!email || !password) {
    setStatus("Add meg az email címet és a jelszót.", "error");
    return;
  }

  if (password.length < 6) {
    setStatus("A jelszónak legalább 6 karakter hosszúnak kell lennie.", "error");
    return;
  }

  btn.disabled = true;
  setStatus("Fiók létrehozása folyamatban...");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/login/index.html`,
      data: {
        full_name: fullName
      }
    }
  });

  if (error) {
    setStatus(error.message, "error");
    btn.disabled = false;
    return;
  }

  const user = data?.user;

  if (user) {
    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update({ full_name: fullName || null })
      .eq("id", user.id);

    if (updateProfileError) {
      console.warn("Profil név mentési hiba:", updateProfileError.message);
    }
  }

  setStatus(
    "Sikeres regisztráció. Ha kötelező az email megerősítés, nézd meg a postaládádat, majd jelentkezz be.",
    "success"
  );

  setTimeout(() => {
    window.location.href = "/login/index.html";
  }, 1800);
});
