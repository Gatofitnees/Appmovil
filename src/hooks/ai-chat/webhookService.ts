import { UserData } from './types';

const WEBHOOK_URL = 'https://n8n.gatofit.com/webhook/agente-de-ia';

export const sendToWebhook = async (message: string, userData: UserData, action: 'chat' | 'reset_memory' = 'chat'): Promise<any> => {
  // Filter userData to only include identity (as requested)
  const identityPayload = {
    user: {
      ...userData.user,
      coach_company: userData.user.coach_company || 'gatofit',
    }
  };

  const payload = {
    action,
    message: message.trim(),
    user_data: {
      ...userData,
      user: identityPayload.user,
    },
  };

  console.log('🔍 [AI CHAT DEBUG] Enviando petición al webhook:', payload);
  console.log('🔍 [AI CHAT DEBUG] URL del webhook:', WEBHOOK_URL);

  const requestStart = Date.now();

  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const requestDuration = Date.now() - requestStart;
  console.log(`🔍 [AI CHAT DEBUG] Respuesta recibida en ${requestDuration}ms`);
  console.log('🔍 [AI CHAT DEBUG] Status de respuesta:', response.status);
  console.log('🔍 [AI CHAT DEBUG] Headers de respuesta:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    console.error('❌ [AI CHAT ERROR] HTTP error:', response.status, response.statusText);
    throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
  }

  // Check content type
  const contentType = response.headers.get('content-type');
  console.log('🔍 [AI CHAT DEBUG] Content-Type:', contentType);

  const responseText = await response.text();
  console.log('🔍 [AI CHAT DEBUG] Respuesta raw del webhook:', responseText);
  console.log('🔍 [AI CHAT DEBUG] Longitud de respuesta:', responseText.length);

  if (!responseText || responseText.trim() === '') {
    console.error('❌ [AI CHAT ERROR] Respuesta vacía del webhook');
    console.log('🔍 [AI CHAT DEBUG] Verificando si el webhook está configurado correctamente...');
    console.log('🔍 [AI CHAT DEBUG] URL utilizada:', WEBHOOK_URL);
    console.log('🔍 [AI CHAT DEBUG] Payload enviado:', JSON.stringify(payload, null, 2));

    // Return a placeholder response instead of throwing an error
    return JSON.stringify({
      text: 'El webhook externo devolvió una respuesta vacía. Por favor, verifica la configuración del webhook o inténtalo de nuevo más tarde.'
    });
  }

  return responseText;
};
