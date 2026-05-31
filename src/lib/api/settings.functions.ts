import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getSettings = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("settings")
      .select("*");
    
    if (error) throw error;
    
    // Transform array to a convenient object
    const settingsMap: Record<string, any> = {};
    data.forEach(s => {
      settingsMap[s.key] = s.value;
    });
    
    return settingsMap;
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