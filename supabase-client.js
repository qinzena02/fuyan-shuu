
/* 《負驗書》Supabase 雲端連線 */

const SUPABASE_URL = "https://mvlbplmdmsrjxsqisuyf.supabase.co";

// 請將下方文字換成你的 Publishable key
const SUPABASE_KEY = "sb_publishable_pcWHA-kLUDcNMIf4LZ6hcQ_5qnzTiGu";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

window.fuyanshuDB = supabaseClient;
