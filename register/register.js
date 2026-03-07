const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { full_name: fullName }
  }
});

console.log("signUp data:", data);
console.log("signUp error:", error);

if (error) {
  console.error("signUp hiba:", error);
  return;
}

const user = data?.user;

console.log("user:", user);

if (!user) {
  console.error("Nincs user a signUp után");
  return;
}

const { data: profileData, error: pErr } = await supabase
  .from("profiles")
  .insert({
    id: user.id,
    email,
    full_name: fullName || null
  })
  .select();

console.log("profiles data:", profileData);
console.log("profiles insert hiba:", pErr);

const { data: subData, error: sErr } = await supabase
  .from("subscriptions")
  .insert({
    user_id: user.id,
    access_type: "trial",
    status: "active",
    trial_started_at: new Date().toISOString(),
    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    trial_used: true
  })
  .select();

console.log("subscriptions data:", subData);
console.log("subscriptions insert hiba:", sErr);
