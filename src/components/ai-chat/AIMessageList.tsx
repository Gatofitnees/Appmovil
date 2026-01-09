import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatAIText } from '@/utils/textFormatter';
import { ChatMessage } from '@/hooks/ai-chat';
import DOMPurify from 'dompurify';
import AILoadingIndicator from './AILoadingIndicator';

interface AIMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onButtonClick: (buttonText: string) => void;
}

const AIMessageList: React.FC<AIMessageListProps> = ({ messages, isLoading, onButtonClick }) => {
  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div key={message.id} className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
          {message.type === 'ai' ? (
            <div className="flex flex-col gap-2 w-full px-1">
              {/* AI Gemini Icon */}
              <Sparkles className="w-6 h-6 text-[#4F8BE7] fill-[#4F8BE7]/20 shrink-0" />

              {/* AI Content - No Bubble */}
              <div className="w-full min-w-0 overflow-hidden">
                <div
                  className="whitespace-pre-wrap leading-relaxed text-foreground/90 text-[15px]"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(formatAIText(message.content), {
                      ALLOWED_TAGS: ['strong', 'em', 'u', 'br', 'p', 'ul', 'ol', 'li'],
                      ALLOWED_ATTR: []
                    })
                  }}
                />

                {/* Action Buttons */}
                {message.buttons && message.buttons.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {message.buttons
                      .flatMap(btn => btn.split(',').map(b => b.trim()).filter(b => b.length > 0))
                      .map((buttonText, index) => (
                        <Button
                          key={`${index}-${buttonText}`}
                          variant="outline"
                          size="sm"
                          onClick={() => onButtonClick(buttonText)}
                          disabled={isLoading}
                          className="text-xs bg-background hover:bg-muted transition-all duration-200 active:scale-95 border-border/50 rounded-full px-4"
                        >
                          {buttonText}
                        </Button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* User Message - Bubble Style */
            <div className="flex justify-end px-1">
              <div className="max-w-[85%] bg-primary text-primary-foreground p-3.5 rounded-2xl rounded-br-sm shadow-md">
                <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{message.content}</p>
              </div>
            </div>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="px-14 py-2">
          <AILoadingIndicator />
        </div>
      )}
    </div>
  );
};

export default AIMessageList;
