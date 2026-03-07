const supabaseUrl = "https://kskvssesdnnivawsfjfm.supabase.co";
const supabaseKey = "sb_publishable_ARj6K36ENV8g9LOtZrWwXw_tBK00b9g";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase config betöltve");
console.log("URL:", supabaseUrl);
console.log("Client:", supabase);
