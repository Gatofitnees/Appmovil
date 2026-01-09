import React, { useState, useEffect } from 'react';

interface TypewriterEffectProps {
    text: string;
    speed?: number;
    onComplete?: () => void;
    className?: string; // Allow passing className
}

const TypewriterEffect: React.FC<TypewriterEffectProps> = ({
    text,
    speed = 10,
    onComplete,
    className
}) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // Reset if text prop changes drastically (optional, but good for stability)
        // Actually, normally we want to reset if text changes completely. 
        // But for streaming, we strictly append.
        // If text prop *changes* (e.g. from "Hello" to "Hello World"), we want to type out " World".
        // This is complex. Let's stick to "typing out the whole new string if it's longer" logic?
        // Or just simple typing from 0. 
        // For a static final message, simple typing from 0 is fine.
        // For streaming, we need to only type the *new* part.
        // Given the user request "mostrar letra por letra el texto", let's assume valid fully loaded response first?
        // "letra por letra... y cambie de palabras mientras carga" -> That's loading state.
        // The message itself: "no deberia estar encerrado en un cuadro de texto".

        // Simplest implementation:
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, speed);

            return () => clearTimeout(timeout);
        } else if (onComplete) {
            onComplete();
        }
    }, [currentIndex, text, speed, onComplete]);

    return <span className={className}>{displayedText}</span>;
};

export default TypewriterEffect;
