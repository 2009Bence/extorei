const supabaseUrl = "https://kskvssesdnnivawsfjfm.supabase.co";
const supabaseKey = "b_publishable_ARj6K36ENV8g9LOtZrWwXw_tBK00b9g";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

console.log("client:", supabase);
console.log("auth:", supabase.auth);
