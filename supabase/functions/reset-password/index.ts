import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { email, code, newPassword } = await req.json();
        const normalizedEmail = email?.trim().toLowerCase();

        if (!normalizedEmail || !code || !newPassword) {
            return new Response(JSON.stringify({ error: "Email, code and new password are required" }), {
                status: 400,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            });
        }

        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // 1. Verify code
        const { data: resetData, error: verifyError } = await supabaseAdmin
            .from("password_resets")
            .select("*")
            .eq("email", normalizedEmail)
            .eq("code", code)
            .single();

        if (verifyError || !resetData) {
            return new Response(JSON.stringify({ error: "Código inválido o expirado" }), {
                status: 401,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            });
        }

        // 2. Check expiration
        const now = new Date();
        const expiresAt = new Date(resetData.expires_at);
        if (now > expiresAt) {
            return new Response(JSON.stringify({ error: "El código ha expirado" }), {
                status: 401,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            });
        }

        // 3. Update user password in Auth
        // First find the user ID by email using the secure RPC
        const { data: userData, error: userError } = await supabaseAdmin
            .rpc("get_user_id_by_email", { email_params: normalizedEmail });

        if (userError || !userData || userData.length === 0) {
            return new Response(JSON.stringify({ error: "Usuario no encontrado" }), {
                status: 404,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            });
        }

        const userId = userData[0].id;

        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { password: newPassword }
        );

        if (updateError) {
            console.error("Error updating password:", updateError);
            throw updateError;
        }

        // 4. Delete the recovery code on success
        await supabaseAdmin
            .from("password_resets")
            .delete()
            .eq("email", normalizedEmail);

        return new Response(JSON.stringify({ success: true, message: "Password updated successfully" }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    } catch (error: any) {
        console.error("Error in reset-password:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }
});
