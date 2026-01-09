import React, { memo } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface LottieIconProps {
    src: string;
    size?: number; // pixel size (square) by default, or provide width/height separately
    width?: number;
    height?: number;
    className?: string; // for margins/absolute positioning
    style?: React.CSSProperties;
}

export const LottieIcon: React.FC<LottieIconProps> = memo(({
    src,
    size = 24,
    width,
    height,
    className,
    style
}) => {
    const finalWidth = width ?? size;
    const finalHeight = height ?? size;

    return (
        <div
            className={className}
            style={{
                width: finalWidth,
                height: finalHeight,
                minWidth: finalWidth,
                minHeight: finalHeight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                ...style
            }}
        >
            <DotLottieReact
                src={src}
                loop
                autoplay
                // Ensure the canvas knows it should resize if the container changes, 
                // though our container is fixed.
                renderConfig={{
                    autoResize: true,
                    freezeOnOffscreen: false
                }}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
});

LottieIcon.displayName = 'LottieIcon';
