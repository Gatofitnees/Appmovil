import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
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
    const { email } = await req.json();
    const normalizedEmail = email?.trim().toLowerCase();

    console.log(`Password reset requested for: ${normalizedEmail}`);

    if (!normalizedEmail) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Check if user exists using the secure RPC function
    const { data: userData, error: userError } = await supabaseAdmin
      .rpc("get_user_id_by_email", { email_params: normalizedEmail });

    if (userError) {
      console.error("Error checking user existence:", userError);
    }

    const userExists = userData && userData.length > 0;

    if (!userExists) {
      // For security, we don't reveal if user exists, but we return a generic success
      console.log(`Email not found in auth.users: ${normalizedEmail}`);
      return new Response(JSON.stringify({ success: true, message: "If an account exists, a code has been sent." }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const userId = userData[0].id;
    console.log(`User found (ID: ${userId}). Generating code...`);

    // 2. Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

    // 3. Store in password_resets
    const { error: resetError } = await supabaseAdmin
      .from("password_resets")
      .upsert({
        email: normalizedEmail,
        code: code,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      });

    if (resetError) {
      console.error("Error storing reset code:", resetError);
      throw resetError;
    }

    console.log(`Sending email to ${normalizedEmail} with code ${code}...`);

    // 4. Send email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Gatofit <noreply@gatofit.com>",
      to: [normalizedEmail],
      subject: `Tu código de recuperación: ${code}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f7f7f7; padding: 20px; }
              .card { max-width: 480px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: center; }
              .logo { font-size: 24px; font-weight: 800; color: #f97316; margin-bottom: 30px; letter-spacing: -0.025em; }
              .title { font-size: 20px; font-weight: 700; color: #1a1a1a; margin-bottom: 20px; }
              .description { font-size: 15px; color: #666666; margin-bottom: 30px; }
              .code-container { background: #fdf2f8; border: 1px dashed #f97316; padding: 20px; border-radius: 12px; margin-bottom: 30px; }
              .code { font-size: 36px; font-weight: 800; color: #f97316; letter-spacing: 0.25em; margin: 0; }
              .footer { font-size: 12px; color: #999999; margin-top: 40px; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="logo">Gatofit</div>
              <h2 class="title">Recuperar contraseña</h2>
              <p class="description">Usa este código de 6 dígitos para restablecer tu contraseña. El código expirará en 15 minutos.</p>
              
              <div class="code-container">
                <p class="code">${code}</p>
              </div>
              
              <p class="description" style="font-size: 13px;">Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
              
              <div class="footer">
                &copy; ${new Date().getFullYear()} Gatofit. Todos los derechos reservados.
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      throw emailError;
    }

    console.log(`Email sent successfully! Message ID: ${emailData?.id}`);

    return new Response(JSON.stringify({ success: true, message: "Recovery code sent" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-recovery-code:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
