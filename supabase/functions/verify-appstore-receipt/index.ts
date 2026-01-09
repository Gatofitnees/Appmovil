import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyAppleReceiptRequest {
  receipt: string;
  userId: string;
  productId: string;
}

// Validar recibo de App Store
async function validateAppleReceipt(receipt: string) {
  const APPLE_SHARED_SECRET = Deno.env.get('APPLE_SHARED_SECRET') || '';
  const isProduction = Deno.env.get('ENVIRONMENT') === 'production';
  const appleUrl = isProduction
    ? 'https://buy.itunes.apple.com/verifyReceipt'
    : 'https://sandbox.itunes.apple.com/verifyReceipt';

  const response = await fetch(appleUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'receipt-data': receipt,
      password: APPLE_SHARED_SECRET,
      'exclude-old-transactions': false,
    }),
  });

  const data = await response.json();

  // Códigos de respuesta de Apple
  // 0 = válido
  // 21007 = está en sandbox pero se envió a producción (o viceversa)
  // 21008 = está en producción pero se envió a sandbox

  if (data.status === 0 || data.status === 21007 || data.status === 21008) {
    return {
      valid: true,
      latestReceipt: data.latest_receipt,
      latestReceiptInfo: data.latest_receipt_info,
      expiresDate: data.latest_receipt_info?.[0]?.expires_date_ms,
    };
  }

  return {
    valid: false,
    error: `Apple receipt validation failed with status: ${data.status}`,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { receipt, userId, productId }: VerifyAppleReceiptRequest = await req.json();

    if (!receipt || !userId || !productId) {
      throw new Error('Missing required fields: receipt, userId, productId');
    }

    console.log('Validating Apple receipt for user:', userId);

    // Validar recibo con Apple
    const validationResult = await validateAppleReceipt(receipt);

    if (!validationResult.valid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: validationResult.error,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extraer información de la suscripción del recibo
    const expiresDate = new Date(parseInt(validationResult.expiresDate || '0'));

    // Determinar tipo de plan basado en productId
    const planType = productId.includes('yearly') ? 'yearly' : 'monthly';

    // Actualizar suscripción en la base de datos
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .upsert(
        {
          user_id: userId,
          status: 'active',
          plan_type: planType,
          payment_method: 'app_store',
          platform: 'ios',
          receipt_data: validationResult.latestReceipt,
          expires_at: expiresDate.toISOString(),
          created_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select('*')
      .single();

    if (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscription: subscription,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
