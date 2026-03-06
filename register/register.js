const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { full_name: fullName }
  }
});

if (error) {
  console.error(error);
  return;
}

const user = data?.user;

if (user) {
  const { error: pErr } = await supabase.from("profiles").insert({
    id: user.id,
    email,
    full_name: fullName || null
  });

  console.log("profiles insert hiba:", pErr);

  const { error: sErr } = await supabase.from("subscriptions").insert({
    user_id: user.id,
    access_type: "trial",
    status: "active",
    trial_started_at: new Date().toISOString(),
    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    trial_used: true
  });

  console.log("subscriptions insert hiba:", sErr);
}
