
import { useState } from 'react';
import { ChatMessage } from './types';
import { useDataCollection } from './dataCollectionService';
import { sendToWebhook } from './webhookService';
import { processWebhookResponse } from './responseProcessor';

export const useAIChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { collectUserData } = useDataCollection();

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const userData = collectUserData(messages);
      const responseText = await sendToWebhook(content.trim(), userData);
      const aiMessage = processWebhookResponse(responseText);

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('❌ [AI CHAT ERROR] Error completo:', error);
      console.error('❌ [AI CHAT ERROR] Tipo de error:', error instanceof Error ? error.constructor.name : typeof error);

      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('❌ [AI CHAT ERROR] Error de red - problema de conectividad');
      }

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}. Por favor, inténtalo de nuevo.`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      console.log('🔍 [AI CHAT DEBUG] Proceso completado, isLoading = false');
    }
  };

  const clearMessages = async () => {
    setMessages([]);
    try {
      // Enviar señal de reset al webhook
      const userData = collectUserData([]);
      await sendToWebhook('', userData, 'reset_memory');
      console.log('🧹 [AI CHAT] Memoria limpiada en el servidor');
    } catch (error) {
      console.error('❌ [AI CHAT] Error al limpiar memoria:', error);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
};
