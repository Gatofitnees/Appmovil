
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { useAIChatWithLimits } from '@/hooks/useAIChatWithLimits';
import AIChatHeader from '@/components/ai-chat/AIChatHeader';
import AIMessageList from '@/components/ai-chat/AIMessageList';
import AIWelcomeScreen from '@/components/ai-chat/AIWelcomeScreen';
import AIMessageInput from '@/components/ai-chat/AIMessageInput';
import { PremiumModal } from '@/components/premium/PremiumModal';

const AIChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { isPremium } = useSubscription();
  const { usage, fetchUsage } = useUsageLimits();
  const {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    showPremiumModal,
    setShowPremiumModal,
    getAIChatUsageInfo
  } = useAIChatWithLimits();

  const [inputValue, setInputValue] = useState('');
  const [usageInfo, setUsageInfo] = useState({ current: 0, limit: 3, canSend: true, isOverLimit: false });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContentRef = useRef<HTMLDivElement>(null);

  // Cargar información de uso al montar el componente
  useEffect(() => {
    const loadUsageInfo = async () => {
      console.log('🔄 [AI CHAT PAGE] Loading usage info on mount');
      // Asegurar que tenemos datos frescos al entrar al chat
      await fetchUsage();
      const info = await getAIChatUsageInfo();
      setUsageInfo(info);
      console.log('📊 [AI CHAT PAGE] Usage info loaded:', info);
    };

    loadUsageInfo();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const isKeyboardOpen = window.visualViewport &&
        window.visualViewport.height < window.innerHeight * 0.75;

      if (chatContentRef.current) {
        if (isKeyboardOpen && window.visualViewport) {
          const keyboardHeight = window.innerHeight - window.visualViewport.height;
          chatContentRef.current.style.paddingBottom = `${keyboardHeight}px`;
        } else {
          chatContentRef.current.style.paddingBottom = '';
        }
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => {
        window.visualViewport?.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue;
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setInputValue('');
    await sendMessage(message);

    // Actualizar información de uso después de enviar mensaje
    const updatedInfo = await getAIChatUsageInfo();
    setUsageInfo(updatedInfo);
    console.log('📊 [AI CHAT PAGE] Usage info updated after send:', updatedInfo);
  };

  const handleButtonClick = async (buttonText: string) => {
    if (isLoading) return;
    await sendMessage(buttonText);

    // Actualizar información de uso después de enviar mensaje
    const updatedInfo = await getAIChatUsageInfo();
    setUsageInfo(updatedInfo);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col max-w-md mx-auto relative overflow-hidden">
      {/* Header con banner de límites integrado */}
      <div
        className="flex-shrink-0 z-20 relative bg-background"
        style={{ marginTop: 'max(var(--safe-area-inset-top), 50px)' }}
      >
        <AIChatHeader
          onBack={handleBack}
          onClear={clearMessages}
          hasMessages={messages.length > 0}
        />
      </div>

      {/* Contenido del chat scrollable */}
      <div
        ref={chatContentRef}
        className="flex-1 overflow-y-auto overscroll-contain relative"
        style={{
          paddingTop: 'var(--safe-area-inset-top, 0px)',
        }}
      >
        <div className="p-4 space-y-4 pb-4">
          {messages.length === 0 ? (
            <AIWelcomeScreen />
          ) : (
            <AIMessageList
              messages={messages}
              isLoading={isLoading}
              onButtonClick={handleButtonClick}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input fijo en la parte inferior */}
      <div
        className="flex-shrink-0 bg-background border-t border-muted/20 z-20"
        style={{
          paddingBottom: 'max(0.5rem, var(--safe-area-inset-bottom, 0px))',
          paddingLeft: 'max(0.5rem, var(--safe-area-inset-left, 0px))',
          paddingRight: 'max(0.5rem, var(--safe-area-inset-right, 0px))',
          paddingTop: '0.5rem'
        }}
      >
        <AIMessageInput
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={handleSend}
          isLoading={isLoading}
          textareaRef={textareaRef}
        />
      </div>

      {/* Premium Modal */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        feature="ai_chat"
        currentUsage={usageInfo.current}
        limit={usageInfo.limit}
      />
    </div>
  );
};

export default AIChatPage;
