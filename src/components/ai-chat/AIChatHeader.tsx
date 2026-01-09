
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UsageLimitsBanner } from '@/components/premium/UsageLimitsBanner';
import { useSubscription } from '@/hooks/useSubscription';
import { useBranding } from '@/contexts/BrandingContext';
import { Skeleton } from '@/components/ui/skeleton';

interface AIChatHeaderProps {
  onBack: () => void;
  onClear: () => void;
  hasMessages: boolean;
}

const AIChatHeader: React.FC<AIChatHeaderProps> = ({ onBack, onClear, hasMessages }) => {
  const { isPremium } = useSubscription();
  const { branding, loading } = useBranding();

  return (
    <div
      className="flex items-center justify-between p-4 bg-background sticky top-0 z-10"
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2 hover:bg-muted transition-colors active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        {loading ? (
          <>
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
          </>
        ) : (
          <>
            <div className={cn(
              "w-8 h-8 rounded-full overflow-hidden flex items-center justify-center",
              "ring-2 ring-primary/20 transition-all duration-200"
            )}>
              <img
                src={branding.logoImageUrl}
                alt={`${branding.companyName} Avatar`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-2">
              <div>
                <h1 className="font-semibold text-lg text-foreground">{branding.companyName}</h1>
                <p className="text-xs text-muted-foreground">Tu asistente personal de fitness</p>
              </div>
              {/* Mostrar banner de límites solo para usuarios no premium */}
              {!isPremium && (
                <UsageLimitsBanner type="ai_chat" className="ml-2" />
              )}
            </div>
          </>
        )}
      </div>
      {hasMessages && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-xs hover:bg-muted transition-colors active:scale-95"
        >
          Limpiar
        </Button>
      )}
    </div>
  );
};

export default AIChatHeader;
