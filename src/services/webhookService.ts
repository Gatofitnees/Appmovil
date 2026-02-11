
import { getImageExtension } from '@/utils/imageUtils';

export const sendToWebhook = async (imageUrl: string, imageBlob: Blob) => {
  try {
    console.log('Sending image to webhook...', {
      imageUrl,
      blobSize: imageBlob.size,
      mimeType: imageBlob.type || 'unknown'
    });

    const formData = new FormData();
    formData.append('imageUrl', imageUrl);

    // Use original image format
    const extension = getImageExtension(imageBlob);
    formData.append('image', imageBlob, `food-image.${extension}`);
    formData.append('timestamp', new Date().toISOString());

    const response = await fetch('https://n8n.gatofit.com/webhook/escaner-de-comida', {
      method: 'POST',
      mode: 'no-cors', // Handle CORS issues
      body: formData,
    });

    // With no-cors mode, we can't read the response status
    // but the request will be sent if the endpoint is accessible
    console.log('Image sent to webhook successfully (no-cors mode)');
  } catch (error) {
    console.error('Error sending to webhook:', error);
    // Don't throw the error to avoid blocking the main flow
  }
};
