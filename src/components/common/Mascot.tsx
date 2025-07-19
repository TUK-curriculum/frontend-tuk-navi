import React from 'react';
import mascot from '../../assets/mascot.png';

interface MascotProps {
    size?: number;
    style?: React.CSSProperties;
    className?: string;
    animate?: boolean; // true면 살짝 bounce 애니메이션
}

const Mascot: React.FC<MascotProps> = ({ size = 160, style, className, animate = true }) => {
    return (
        <img
            src={mascot}
            alt="한국공학대 마스코트"
            width={size}
            height={size}
            className={className}
            style={{
                display: 'block',
                margin: '0 auto',
                background: 'none',
                borderRadius: '50%', // 동그랗게
                boxShadow: '0 4px 24px #0ea5e955',
                objectFit: 'cover',
                animation: animate ? 'mascot-bounce 2.2s infinite cubic-bezier(.4,0,.2,1)' : undefined,
                ...style,
            }}
        />
    );
};

export default Mascot;

// 전역 스타일에 아래 CSS 추가 필요 (예: App.css)
/*
@keyframes mascot-bounce {
  0%, 100% { transform: translateY(0); }
  20% { transform: translateY(-10px) scale(1.03); }
  40% { transform: translateY(0); }
  60% { transform: translateY(-6px) scale(1.01); }
  80% { transform: translateY(0); }
}
*/ 