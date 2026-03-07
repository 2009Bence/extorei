const SUPABASE_URL = "https://kskvssesdnnivawsfjfm.supabase.co";
const SUPABASE_KEY = "sb_publishable_ARj6K36ENV8g9LOtZrWwXw_tBK00b9g";

const { createClient } = window.supabase;
window.sb = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log("Supabase kliens létrehozva:", !!window.sb);
console.log("window.sb.auth létezik:", !!window.sb?.auth);
