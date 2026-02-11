import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyPlayStoreReceiptRequest {
  packageName: string;
  subscriptionId: string;
  token: string;
  userId: string;
  productId: string;
}

// Obtener access token de Google
async function getGoogleAccessToken() {
  const GOOGLE_SERVICE_ACCOUNT = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');

  if (!GOOGLE_SERVICE_ACCOUNT) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON environment variable');
  }

  const serviceAccount = JSON.parse(GOOGLE_SERVICE_ACCOUNT);

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  // Crear JWT
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));

  // Sign JWT (simplificado - en producción usar librería crypto)
  const signature = btoa('signature_placeholder');
  const jwt = `${header}.${body}.${signature}`;

  // Para esta función, asumimos que usamos la API de Google directamente
  // En producción, necesitarías una librería para firmar JWTs

  return serviceAccount.private_key;
}

// Validar recibo de Google Play
async function validatePlayStoreReceipt(
  packageName: string,
  subscriptionId: string,
  token: string
) {
  const GOOGLE_PACKAGE_NAME = Deno.env.get('GOOGLE_PACKAGE_NAME') || 'com.gatofit.app';
  const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY') || '';

  // URL de validación de Google Play
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/subscriptions/${subscriptionId}/tokens/${token}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${GOOGLE_API_KEY}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Google Play validation failed: ${response.statusText}`);
  }

  const data = await response.json();

  // Verificar que la suscripción esté activa
  // 1 = Received (Pago completo), 2 = Free Trial (Prueba gratuita)
  const isTrial = data.paymentState === 2;
  const isActive = data.paymentState === 1 || isTrial;

  if (!isActive) {
    return {
      valid: false,
      error: 'Subscription is not active',
    };
  }

  return {
    valid: true,
    expiryTimeMillis: data.expiryTimeMillis,
    purchaseType: data.purchaseType,
    orderId: data.orderId,
    isTrial: isTrial,
  };
}

serve(async (req) => {
  // ... (CORS logic kept same)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { packageName, subscriptionId, token, userId, productId }: VerifyPlayStoreReceiptRequest = await req.json();

    if (!packageName || !subscriptionId || !token || !userId || !productId) {
      throw new Error('Missing required fields');
    }

    console.log('Validating Google Play receipt for user:', userId);

    // Validar recibo con Google Play
    const validationResult = await validatePlayStoreReceipt(
      packageName,
      subscriptionId,
      token
    );

    if (!validationResult.valid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: validationResult.error,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Determinar tipo de plan basado en productId
    const planType = productId.includes('yearly') ? 'yearly' : 'monthly';
    const expiresDate = new Date(parseInt(validationResult.expiryTimeMillis || '0'));

    // Datos para actualizar
    const subscriptionData: any = {
      user_id: userId,
      status: 'active', // Considerar 'trialing' si tu esquema lo soporta, o usar trial_ends_at
      plan_type: planType,
      payment_method: 'google_play',
      store_platform: 'android', // Mapeo correcto a store_platform
      google_play_purchase_token: token, // Guardar token específico
      google_play_order_id: validationResult.orderId,
      expires_at: expiresDate.toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Si es trial, agregar datos de trial
    if (validationResult.isTrial) {
      subscriptionData.trial_ends_at = expiresDate.toISOString();
      subscriptionData.status = 'active'; // O 'trialing'
    }

    // Actualizar suscripción en la base de datos CORRECTA (user_subscriptions)
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .upsert(
        subscriptionData,
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
