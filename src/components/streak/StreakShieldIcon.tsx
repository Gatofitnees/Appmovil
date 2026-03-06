import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import fireProtectorAnimation from '@/assets/lottie/fuego_protector.lottie';

interface StreakShieldIconProps {
    className?: string;
    width?: number;
    height?: number;
}

export const StreakShieldIcon: React.FC<StreakShieldIconProps> = ({
    className,
    width,
    height
}) => {
    const style = (width || height) ? { width, height } : {};

    return (
        <div
            className={`relative flex items-center justify-center ${className || "w-6 h-6"}`}
            style={style}
        >
            <DotLottieReact
                src={fireProtectorAnimation}
                loop
                autoplay
                renderConfig={{ autoResize: true, freezeOnOffscreen: false }}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
};
