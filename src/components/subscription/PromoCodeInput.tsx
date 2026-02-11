import React, { useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import Button from '@/components/Button';
import { usePromoCode } from '@/hooks/usePromoCode';
import { cn } from '@/lib/utils';

interface PromoCodeInputProps {
    onCodeApplied?: () => void;
}

export const PromoCodeInput: React.FC<PromoCodeInputProps> = ({ onCodeApplied }) => {
    const {
        promoCode,
        setPromoCode,
        appliedCode,
        isValidating,
        error,
        applyCode,
        clearCode,
        hasAppliedCode
    } = usePromoCode();

    const [inputValue, setInputValue] = useState('');

    const handleApply = async () => {
        const success = await applyCode(inputValue);
        if (success && onCodeApplied) {
            onCodeApplied();
        }
    };

    const handleClear = () => {
        clearCode();
        setInputValue('');
    };

    return (
        <div className="space-y-2">
            {!hasAppliedCode ? (
                <>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                            placeholder="Código promocional"
                            className={cn(
                                "flex-1 px-4 py-3 rounded-xl",
                                "bg-white border-2 border-gray-200",
                                "text-gray-900 placeholder:text-gray-400",
                                "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                                "transition-all duration-200",
                                "uppercase text-sm font-medium"
                            )}
                            disabled={isValidating}
                            maxLength={20}
                        />
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleApply}
                            disabled={!inputValue.trim() || isValidating}
                            className="px-6 h-auto py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl"
                        >
                            {isValidating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Validando...
                                </>
                            ) : (
                                'Aplicar'
                            )}
                        </Button>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">
                            <X className="h-4 w-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex items-center justify-between p-3 bg-green-500/10 border-2 border-green-500/20 rounded-xl">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Check className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-green-600">Código aplicado</p>
                            <p className="text-xs text-gray-500">Código: {promoCode}</p>
                        </div>
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleClear}
                        className="h-8 px-3 text-sm"
                    >
                        Quitar
                    </Button>
                </div>
            )}
        </div>
    );
};
