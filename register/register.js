const now = new Date().toISOString();
const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

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
if (!user) return;

await supabase.from("profiles").insert({
  id: user.id,
  email,
  created_at: now
});

await supabase.from("subscriptions").insert({
  user_id: user.id,
  access_type: "trial",
  status: "active",
  trial_started_at: now,
  trial_ends_at: trialEnd,
  trial_used: true,
  created_at: now,
  updated_at: now
});
