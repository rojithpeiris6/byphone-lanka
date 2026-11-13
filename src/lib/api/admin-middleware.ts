import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/** Authenticate on the server before any service-role report/settings query. */
export const requireAdmin = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const header = getRequest().headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("Unauthorized");
  const token = header.slice(7).trim();
  if (!token) throw new Error("Unauthorized");
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) throw new Error("Unauthorized");
  const role = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (role.error || !role.data) throw new Error("Forbidden");
  return next();
});
