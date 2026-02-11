
import { useState } from 'react';
import { validateImageFile, sanitizeFoodName } from '@/utils/validation';
import { sanitizeWebhookData, createSecureFormData } from '@/utils/securityHelpers';
import { createSecureErrorMessage, logSecurityEvent } from '@/utils/errorHandling';
import { shouldCompressForWebhook, compressForWebhook } from '@/utils/imageCompression';

export interface WebhookIngredient {
  name: string;
  grams: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

export interface WebhookComidaData {
  custom_food_name: string;
  quantity_consumed: number;
  unit_consumed: string;
  calories_consumed: string;
  protein_g_consumed: string;
  carbs_g_consumed: string;
  fat_g_consumed: string;
  healthScore: string;
  ingredients: WebhookIngredient[];
}

export interface WebhookOutputItem {
  output: WebhookComidaData;
}

export interface WebhookResponse {
  Comida?: WebhookComidaData | string;
  error?: string;
}

export type WebhookArrayResponse = WebhookOutputItem[];

export interface FoodAnalysisResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
  healthScore: number;
  ingredients: Array<{
    name: string;
    grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
}

export const useWebhookResponse = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const sendToWebhookWithResponse = async (imageUrl: string, imageBlob: Blob, isFromGallery: boolean = false): Promise<FoodAnalysisResult | null> => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    console.log('📤 Sending to webhook:', {
      blobSize: imageBlob.size,
      mimeType: imageBlob.type || 'no-type',
      isFromGallery,
      imageUrl
    });

    // Validate that blob is not empty
    if (!imageBlob || imageBlob.size === 0) {
      console.error('❌ Invalid blob: empty or null');
      setAnalysisError('Imagen inválida. Intenta de nuevo.');
      setIsAnalyzing(false);
      return null;
    }

    // Validate image file - more permissive for gallery images
    const validation = validateImageFile(
      new File([imageBlob], 'image.jpg', { type: imageBlob.type || 'image/jpeg' }),
      isFromGallery // Skip type check for gallery images
    );

    if (!validation.isValid) {
      console.error('❌ Validation failed:', validation.error);
      setAnalysisError(validation.error || 'Archivo de imagen inválido');
      setIsAnalyzing(false);
      logSecurityEvent('invalid_file_upload', validation.error);
      return null;
    }

    // Check if we need to compress the image
    let processedBlob = imageBlob;
    if (shouldCompressForWebhook(imageBlob)) {
      try {
        setIsCompressing(true);
        console.log('Image is too large for webhook, compressing...');
        processedBlob = await compressForWebhook(imageBlob);
      } catch (compressionError) {
        console.warn('Image compression failed, using original:', compressionError);
        processedBlob = imageBlob;
      } finally {
        setIsCompressing(false);
      }
    }

    try {
      const formData = createSecureFormData(processedBlob, imageUrl);

      const response = await fetch('https://n8n.gatofit.com/webhook/escaner-de-comida', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const responseText = await response.text();
        console.log('Webhook response received');

        let parsedResponse: any;
        try {
          parsedResponse = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse webhook response');
          setAnalysisError(createSecureErrorMessage(parseError, 'webhook'));
          logSecurityEvent('webhook_parse_error', 'Invalid JSON response');
          return null;
        }

        // Sanitize the response data
        const sanitizedResponse = sanitizeWebhookData(parsedResponse);

        // Check for new array format first
        if (Array.isArray(parsedResponse)) {
          if (parsedResponse.length === 0) {
            setAnalysisError('No se detectó información de comida');
            return null;
          }

          const firstItem = parsedResponse[0];
          if (firstItem && firstItem.output) {
            return parseWebhookFoodResponse(sanitizeWebhookData(firstItem.output));
          } else {
            // Try to see if the first item IS the food data
            if (firstItem && firstItem.custom_food_name) {
              return parseWebhookFoodResponse(sanitizeWebhookData(firstItem));
            }
            setAnalysisError(createSecureErrorMessage(new Error('Invalid response structure'), 'webhook'));
            logSecurityEvent('webhook_invalid_structure', 'Array format missing output');
            return null;
          }
        }

        // Check if response IS the food data (Flat structure)
        if (parsedResponse && parsedResponse.custom_food_name) {
          console.log('Detected flat response structure');
          return parseWebhookFoodResponse(sanitizeWebhookData(parsedResponse));
        }

        // Check if response has 'output' key directly (Root object wrapper)
        if (parsedResponse && parsedResponse.output && parsedResponse.output.custom_food_name) {
          console.log('Detected root output wrapper');
          return parseWebhookFoodResponse(sanitizeWebhookData(parsedResponse.output));
        }

        // Fallback to legacy format
        const legacyResult = parsedResponse as WebhookResponse;

        if (legacyResult.error) {
          setAnalysisError(createSecureErrorMessage(new Error(legacyResult.error), 'webhook'));
          return null;
        }

        if (legacyResult.Comida) {
          if (typeof legacyResult.Comida === 'string') {
            if (legacyResult.Comida === '[object Object]') {
              setAnalysisError(createSecureErrorMessage(new Error('Serialization error'), 'webhook'));
              logSecurityEvent('webhook_serialization_error', 'Object serialization issue');
              return null;
            }

            try {
              const parsedComida = JSON.parse(legacyResult.Comida);
              return parseWebhookFoodResponse(sanitizeWebhookData(parsedComida));
            } catch (stringParseError) {
              setAnalysisError(createSecureErrorMessage(stringParseError, 'webhook'));
              return null;
            }
          }

          return parseWebhookFoodResponse(sanitizeWebhookData(legacyResult.Comida));
        } else {
          setAnalysisError('No se detectó información de comida');
          return null;
        }
      } else if (response.status === 413) {
        // Handle 413 Request Entity Too Large specifically
        console.warn('Request too large (413), attempting with higher compression');

        if (!shouldCompressForWebhook(imageBlob)) {
          // If original wasn't compressed, try compressing now
          try {
            setIsCompressing(true);
            const highlyCompressed = await compressForWebhook(imageBlob);
            setIsCompressing(false);

            // Retry with compressed image
            return await sendToWebhookWithResponse(imageUrl, highlyCompressed);
          } catch (retryError) {
            setIsCompressing(false);
            setAnalysisError('La imagen es demasiado grande. Intenta con una imagen más pequeña.');
            return null;
          }
        } else {
          setAnalysisError('La imagen es demasiado grande incluso después de comprimirla. Intenta con una imagen más pequeña.');
          return null;
        }
      } else {
        console.warn('Webhook request failed:', response.status);
        setAnalysisError(createSecureErrorMessage(new Error(`HTTP ${response.status}`), 'network'));
        logSecurityEvent('webhook_http_error', `Status: ${response.status}`);
        return null;
      }
    } catch (error) {
      console.error('Error sending to webhook:', error);
      logSecurityEvent('webhook_network_error', error instanceof Error ? error.message : 'Unknown error');

      // If it's a network error and we haven't tried compression yet, try it
      if (!shouldCompressForWebhook(processedBlob) && error instanceof Error && error.message.includes('fetch')) {
        try {
          setIsCompressing(true);
          const compressedBlob = await compressForWebhook(imageBlob);
          setIsCompressing(false);

          console.log('Retrying with compressed image after network error');
          return await sendToWebhookWithResponse(imageUrl, compressedBlob);
        } catch (retryError) {
          setIsCompressing(false);
          console.error('Retry with compression also failed');
        }
      }

      // Fallback with no-cors
      try {
        const fallbackFormData = createSecureFormData(processedBlob, imageUrl);
        await fetch('https://n8n.gatofit.com/webhook-test/escaner-de-comida', {
          method: 'POST',
          mode: 'no-cors',
          body: fallbackFormData,
        });
        console.log('Fallback request sent');
      } catch (fallbackError) {
        console.error('Fallback request failed');
      }

      setAnalysisError(createSecureErrorMessage(error, 'network'));
      return null;
    } finally {
      setIsAnalyzing(false);
      setIsCompressing(false);
    }
  };

  const parseWebhookFoodResponse = (comidaData: WebhookComidaData): FoodAnalysisResult => {
    if (!comidaData) {
      throw new Error('No food data received');
    }

    console.log('Parsing webhook food data with validation');

    // Parse and validate ingredients
    const ingredients = comidaData.ingredients?.map(ingredient => ({
      name: sanitizeFoodName(ingredient.name || ''),
      grams: parseFloat(ingredient.grams) || 0,
      calories: parseFloat(ingredient.calories) || 0,
      protein: parseFloat(ingredient.protein) || 0,
      carbs: parseFloat(ingredient.carbs) || 0,
      fat: parseFloat(ingredient.fat) || 0
    })) || [];

    const parsedResult = {
      name: sanitizeFoodName(comidaData.custom_food_name || 'Alimento detectado'),
      calories: parseFloat(comidaData.calories_consumed) || 0,
      protein: parseFloat(comidaData.protein_g_consumed) || 0,
      carbs: parseFloat(comidaData.carbs_g_consumed) || 0,
      fat: parseFloat(comidaData.fat_g_consumed) || 0,
      servingSize: typeof comidaData.quantity_consumed === 'string'
        ? parseFloat(comidaData.quantity_consumed) || 1
        : comidaData.quantity_consumed || 1,
      servingUnit: sanitizeFoodName(comidaData.unit_consumed || 'porción'),
      healthScore: Math.min(Math.max(parseFloat(String(comidaData.healthScore)) || 7, 1), 10),
      ingredients
    };

    console.log('Food data parsed and validated');
    return parsedResult;
  };

  return {
    sendToWebhookWithResponse,
    isAnalyzing: isAnalyzing || isCompressing,
    analysisError,
    isCompressing,
    clearError: () => setAnalysisError(null)
  };
};
