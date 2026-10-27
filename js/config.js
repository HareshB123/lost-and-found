// LOST AND FOUND - Application Configuration
// Supports seamless switching between local demo mode (localStorage) and Supabase cloud.

export const CONFIG = {
  APP_NAME: "LOST AND FOUND",
  TAGLINE: "Lost it? Found it? Let's bring it home.",
  BRAND_MESSAGE: "Every lost item deserves a way back.",
  
  // Set your Supabase credentials here or leave empty to use instant Demo Mode
  SUPABASE_URL: window.__ENV?.SUPABASE_URL || "",
  SUPABASE_ANON_KEY: window.__ENV?.SUPABASE_ANON_KEY || "",

  // Chat auto-expiration limit in hours (default 24h as per spec)
  CHAT_INACTIVITY_HOURS: 24,

  // Matching algorithm score threshold (0-100)
  MATCH_THRESHOLD: 40,

  // Storage keys for demo mode
  STORAGE_KEYS: {
    USER: "campustrace_auth_user",
    REPORTS: "campustrace_reports",
    CONVERSATIONS: "campustrace_conversations",
    MESSAGES: "campustrace_messages",
    NOTIFICATIONS: "campustrace_notifications"
  }
};

export function isSupabaseConfigured() {
  return Boolean(
    CONFIG.SUPABASE_URL && 
    CONFIG.SUPABASE_ANON_KEY && 
    CONFIG.SUPABASE_URL !== "YOUR_SUPABASE_URL" &&
    CONFIG.SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY"
  );
}
