import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const phrases = [
    "Analizando solicitud...",
    "Investigando registros...",
    "Pensando...",
    "Consultando base de conocimientos...",
    "Generando respuesta..."
];

const AILoadingIndicator: React.FC = () => {
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [displayText, setDisplayText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(50);

    useEffect(() => {
        const handleTyping = () => {
            const i = loopNum % phrases.length;
            const fullText = phrases[i];

            setDisplayText(isDeleting
                ? fullText.substring(0, displayText.length - 1)
                : fullText.substring(0, displayText.length + 1)
            );

            setTypingSpeed(isDeleting ? 30 : 50);

            if (!isDeleting && displayText === fullText) {
                setTimeout(() => setIsDeleting(true), 1500); // Pause at end
            } else if (isDeleting && displayText === "") {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [displayText, isDeleting, loopNum, phrases, typingSpeed]);

    return (
        <div className="flex items-center gap-3 text-sm text-muted-foreground animate-in fade-in duration-300">
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur-sm opacity-50 animate-pulse" />
                <Loader2 className="h-4 w-4 animate-spin relative z-10 text-primary" />
            </div>
            <span className="font-medium tracking-wide min-w-[150px] inline-block">
                {displayText}
                <span className="animate-pulse">|</span>
            </span>
        </div>
    );
};

export default AILoadingIndicator;
