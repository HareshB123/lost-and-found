// Supabase Edge Function: cleanup-inactive-chats
// Can be invoked by Supabase pg_cron or an external periodic scheduler (e.g., GitHub Actions, cron job)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Uses trusted service role key to trigger administrative cleanup RPC
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase.rpc("cleanup_inactive_conversations");
    
    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, expired_chats_cleaned: data }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
