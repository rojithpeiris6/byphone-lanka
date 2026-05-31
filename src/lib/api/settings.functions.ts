import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getSettings = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from("settings")
        .select("*");
      
      if (error) {
        console.error("Database error fetching settings:", error);
        return {}; // Return empty object if table doesn't exist or query fails
      }
      
      const settingsMap: Record<string, any> = {};
      data?.forEach(s => {
        settingsMap[s.key] = s.value;
      });
      
      return settingsMap;
    } catch (e) {
      console.error("Server function error in getSettings:", e);
      return {}; // Graceful fallback
    }
  });

export const updateSetting = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    key: z.string(),
    value: z.any()
  }))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("settings")
      .upsert({ 
        key: data.key, 
        value: data.value,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
    return { success: true };
  });