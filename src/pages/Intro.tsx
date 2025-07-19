import { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import introImg from '../assets/intro.png';
import setup5 from '../assets/setup5.png';

// 고급 애니메이션 시퀀스 타이밍
const animationSequence = [
    { start: 0, duration: 900 },      // 파티클 + 마스코트
    { start: 900, duration: 1300 },  // 로고 + 파티클 변형
    { start: 900, duration: 2800 },  // 메인 카피
    { start: 2300, duration: 3800 },   // 버튼 + 최종 효과
];

// 파티클 시스템 컴포넌트
type ParticleSystemProps = { step: number };

class Particle {
    x!: number;
    y!: number;
    vx!: number;
    vy!: number;
    size!: number;
    hue!: number;
    life!: number;
    maxLife!: number;
    opacity!: number;
    constructor(canvas: HTMLCanvasElement, step: number) {
        this.reset(canvas, step);
        this.y = Math.random() * canvas.height;
        this.opacity = Math.random() * 0.5 + 0.3;
    }
    reset(canvas: HTMLCanvasElement, step: number) {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = Math.random() * 0.5 + 0.2;
        this.size = Math.random() * 3 + 1;
        this.hue = step === 1 ? 220 + Math.random() * 40 : 280 + Math.random() * 40;
        this.life = 0;
        this.maxLife = 100 + Math.random() * 100;
    }
    update(canvas: HTMLCanvasElement, step: number) {
        this.x += this.vx;
        this.y += this.vy;
        this.life++;
        if (step >= 2) {
            this.vx += (Math.random() - 0.5) * 0.02;
            this.vy += (Math.random() - 0.5) * 0.02;
        }
        if (this.life >= this.maxLife || this.y > canvas.height + 10) {
            this.reset(canvas, step);
        }
    }
    draw(ctx: CanvasRenderingContext2D) {
        const opacity = this.opacity * (1 - this.life / this.maxLife);
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = `hsl(${this.hue}, 70%, 60%)`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `hsl(${this.hue}, 70%, 60%)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

const ParticleSystem = ({ step }: ParticleSystemProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationRef = useRef<number | null>(null);
    const particlesRef = useRef<Particle[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particlesRef.current = Array.from({ length: 50 }, () => new Particle(canvas, step));
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particlesRef.current.forEach(particle => {
                particle.update(canvas, step);
                particle.draw(ctx);
            });
            animationRef.current = requestAnimationFrame(animate);
        };
        animate();
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [step]);
    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1,
            }}
        />
    );
};

// 메인 컴포넌트
export default function Intro() {
    const [step, setStep] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const nav = useNavigate();
    const controls = useAnimation();
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // 마우스 추적
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    // 애니메이션 시퀀스 제어
    useEffect(() => {
        if (step < animationSequence.length) {
            const timer = setTimeout(() => {
                setStep(prev => prev + 1);
            }, animationSequence[step]?.duration || 1000);

            return () => clearTimeout(timer);
        } else {
            setIsComplete(true);
        }
    }, [step]);

    // 패럴랙스 효과
    const parallaxY = useTransform(mouseY, [0, window.innerHeight], [-20, 20]);
    const parallaxX = useTransform(mouseX, [0, window.innerWidth], [-20, 20]);

    return (
        <Box sx={wrapperStyle}>
            <ParticleSystem step={step} />

            {/* 동적 배경 오버레이 */}
            <motion.div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at 30% 70%, rgba(56, 189, 248, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                    zIndex: 2,
                }}
                animate={{
                    background: step >= 2
                        ? 'radial-gradient(circle at 70% 30%, rgba(139, 92, 246, 0.15) 0%, rgba(56, 189, 248, 0.15) 100%)'
                        : 'radial-gradient(circle at 30% 70%, rgba(56, 189, 248, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                }}
                transition={{ duration: 2, ease: 'easeInOut' }}
            />

            <AnimatePresence mode="wait">
                {/* 0. 마스코트 (향상된 애니메이션) */}
                {step === 0 && (
                    <motion.div
                        key="mascot-container"
                        style={{ position: 'relative', zIndex: 10 }}
                        initial={{ opacity: 0, scale: 0.3, rotateY: -180, y: parallaxY.get(), x: parallaxX.get() }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            rotateY: 0,
                            y: parallaxY.get(),
                            x: parallaxX.get(),
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.8,
                            rotateY: 180,
                            filter: 'blur(10px)'
                        }}
                        transition={{
                            duration: 1.2,
                            ease: [0.23, 1, 0.32, 1],
                            rotateY: { duration: 1.5 }
                        }}
                    >
                        <motion.img
                            src={introImg}
                            style={enhancedMascotStyle}
                            animate={{
                                rotateZ: [-2, 2, -2],
                                scale: [1, 1.05, 1]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: 'easeInOut'
                            }}
                        />
                    </motion.div>
                )}

                {/* 1. 로고 (staggered animation) */}
                {step === 1 && (
                    <motion.div
                        key="logo-container"
                        style={{ textAlign: 'center', zIndex: 10 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <Typography variant="h1" sx={enhancedLogoText}>
                                {['T', 'U', 'K', '\u00A0', 'N', 'A', 'V', 'I'].map((char, index) => (
                                    <motion.span
                                        key={index}
                                        initial={{ opacity: 0, y: 50, rotateX: 90 }}
                                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                                        transition={{
                                            delay: index * 0.1,
                                            duration: 0.6,
                                            ease: [0.23, 1, 0.32, 1]
                                        }}
                                        style={{ display: 'inline-block' }}
                                    >
                                        {char}
                                    </motion.span>
                                ))}
                            </Typography>
                        </motion.div>

                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 1.0 }}
                        >
                            <Typography variant="subtitle1" sx={enhancedSubCopy}>
                                AI 기반 대학생 학습 플랫폼
                            </Typography>
                        </motion.div>
                    </motion.div>
                )}

                {/* 2. 메인 카피 (고급 타이포그래피 애니메이션) */}
                {step === 2 && (
                    <motion.div
                        key="slogan-container"
                        style={{ zIndex: 10 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                        >
                            <Typography variant="h2" sx={enhancedSlogan}>
                                <motion.span
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3, duration: 0.8 }}
                                    style={enhancedGradBlue}
                                >
                                    AI
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6, duration: 0.8 }}
                                >
                                    가 추천하는 맞춤 커리큘럼,
                                </motion.span>
                                <br />
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9, duration: 0.8 }}
                                >
                                    더&nbsp;
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.2, duration: 0.8 }}
                                    style={enhancedGradPurple}
                                >
                                    스마트한
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.5, duration: 0.8 }}
                                >
                                    &nbsp;대학생활!
                                </motion.span>
                            </Typography>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* step >= 3: 중앙에 로고/슬로건, 하단에 버튼 */}
            {step >= 3 && (
                <>
                    {/* 중앙에 로고와 슬로건 */}
                    <motion.div
                        key="final-logo-slogan"
                        style={{
                            position: 'absolute',
                            top: '30%',
                            left: 0,
                            right: 0,
                            textAlign: 'center',
                            zIndex: 15,
                            pointerEvents: 'none',
                        }}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                    >
                        <Typography variant="h2" sx={enhancedLogoText}>
                            TUK NAVI
                        </Typography>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.2 }}
                        >
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    fontSize: '1.6rem',
                                    color: '#222',
                                    textShadow: '0 4px 24px #2563eb22, 0 2px 8px #2563eb33, 0 1px 0 #fff',
                                    letterSpacing: '0.01em',
                                    mb: 2,
                                    lineHeight: 1.5,
                                }}
                            >
                                나만의 학습 여정, <span style={{ color: '#2563eb', fontWeight: 800 }}>TUK NAVI</span>와 함께
                            </Typography>
                        </motion.div>
                    </motion.div>

                    {/* 마스코트 아이콘 애니메이션 (하단 우측, blur/밝기/scale-up 효과) */}
                    <motion.div
                        style={{
                            position: 'fixed',
                            right: '4vw',
                            bottom: 40,
                            zIndex: 5,
                            pointerEvents: 'none',
                            width: 'min(30vw, 340px)',
                            maxWidth: 340,
                            filter: 'blur(2.5px) brightness(1.08)', // blur+밝기
                            opacity: 0.18,
                            transform: 'scale(1.04)',
                        }}
                        initial={{ opacity: 0, scale: 0.92, y: 60 }}
                        animate={{ opacity: 0.18, scale: 1.04, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
                    >
                        <img
                            src={setup5}
                            alt="마스코트"
                            style={{
                                width: '100%',
                                height: 'auto',
                                filter: 'drop-shadow(0 8px 32px #3b82f6cc)',
                                opacity: 1,
                                userSelect: 'none',
                                willChange: 'filter, opacity',
                            }}
                        />
                    </motion.div>

                    {/* 하단에 시작하기 버튼 (더 위로) */}
                    <motion.div
                        key="button-container"
                        style={{
                            zIndex: 20,
                            position: 'fixed',
                            left: 0,
                            right: 0,
                            bottom: 250,
                            display: 'flex',
                            justifyContent: 'center',
                            pointerEvents: 'auto',
                        }}
                        initial={{ opacity: 0, y: 100, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                            duration: 2,
                            ease: [0.23, 1, 0.32, 1],
                            delay: 0.3
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 1, delay: 0.4, type: 'spring', stiffness: 400, damping: 18 }}
                        >
                            <Button
                                sx={{
                                    fontWeight: 800,
                                    fontSize: '1.2rem',
                                    color: '#2563eb',
                                    fontFamily: '"Pretendard Rounded", "Cafe24Ssurround", "Arial Rounded MT Bold", "Apple SD Gothic Neo", sans-serif',
                                    background: '#cce6ff', // 20% lighter than #99ccff
                                    borderRadius: '24px',
                                    px: 6,
                                    py: 2,
                                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
                                    backdropFilter: 'blur(12px)',
                                    WebkitBackdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255,255,255,0.18)',
                                    textShadow: '0 4px 24px #2563eb22, 0 2px 8px #2563eb55, 0 1px 0 #fff',
                                    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                                    '&:hover': {
                                        background: '#cce6ff', // same lighter color on hover
                                        color: '#fff',
                                        boxShadow: '0 12px 48px 0 rgba(56,189,248,0.22)',
                                        transform: 'scale(1.04)',
                                        textShadow: '0 2px 16px #3b82f6cc, 0 1px 0 #fff',
                                        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                                    },
                                }}
                                onClick={() => nav('/login')}
                                onMouseEnter={() => controls.start({ rotate: [0, 5, -5, 0] })}
                            >
                                지금 시작하기
                                <motion.span
                                    whileHover={{ x: 8 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 18, duration: 0.4 }}
                                    style={{ display: 'inline-block', marginLeft: 8 }}
                                >
                                    →
                                </motion.span>
                            </Button>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </Box>
    );
}

// 스타일 정의 (완전히 개선된 버전)
const wrapperStyle = {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    background: `
    linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(224,247,250,0.85) 100%),
    radial-gradient(circle at 60% 40%, rgba(186,230,253,0.18) 0%, transparent 60%),
    radial-gradient(circle at 30% 80%, rgba(129,212,250,0.10) 0%, transparent 60%),
    radial-gradient(circle at 80% 20%, rgba(175,238,238,0.10) 0%, transparent 60%)
  `,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
};

const enhancedMascotStyle = {
    width: 'min(55vw, 320px)',
    height: 'auto',
    borderRadius: '24px',
    filter: 'drop-shadow(0 20px 40px rgba(56, 189, 248, 0.3))',
    background: 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
};

// 1. TUK NAVI 로고 텍스트 색상 연하게, 그림자 추가
const enhancedLogoText = {
    fontWeight: 900,
    fontSize: { xs: '3rem', sm: '4rem', md: '5.5rem' },
    letterSpacing: '0.1em',
    background: 'none', // 기존 gradient 제거
    color: '#3b82f6', // 연한 파랑
    textShadow: '0 2px 16px rgba(30, 58, 138, 0.12), 0 1px 0 #fff',
    filter: 'drop-shadow(0 4px 12px rgba(56, 189, 248, 0.15))',
    mb: 2,
    fontFamily: '"Pretendard Rounded", "Cafe24Ssurround", "Arial Rounded MT Bold", "Apple SD Gothic Neo", sans-serif',
};

const enhancedSubCopy = {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 500,
    letterSpacing: '0.08em',
    fontSize: { xs: '1.1rem', sm: '1.3rem' },
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
    mb: 4,
};

const enhancedSlogan = {
    textAlign: 'center',
    mt: 2,
    lineHeight: 1.4,
    fontWeight: 700,
    fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
    color: 'rgba(255, 255, 255, 0.95)',
    textShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
};

const enhancedGradBlue = {
    background: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    fontWeight: 900,
    filter: 'drop-shadow(0 2px 8px rgba(56, 189, 248, 0.4))',
    textShadow: '0 0 20px rgba(56, 189, 248, 0.6)',
};

const enhancedGradPurple = {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    fontWeight: 900,
    filter: 'drop-shadow(0 2px 8px rgba(139, 92, 246, 0.4))',
    textShadow: '0 0 20px rgba(139, 92, 246, 0.6)',
};

// 3. 시작하기 버튼 텍스트 색상, 버튼 배경에 흰색 투명도 추가
const enhancedCtaStyle = {
    px: 8,
    py: 3,
    borderRadius: '32px',
    fontWeight: 800,
    fontSize: { xs: '1.5rem', sm: '1.6rem' },
    fontFamily: '"Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    letterSpacing: '0.05em',
    textTransform: 'none',
    background: 'rgba(255,255,255,0.65)', // 반투명 흰색
    color: '#2563eb',
    boxShadow: `
    0 8px 32px rgba(56, 189, 248, 0.13),
    0 0 0 1px rgba(255, 255, 255, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.12)
  `,
    position: 'relative',
    overflow: 'hidden',
    minHeight: '56px',
    '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
        opacity: 0,
        transition: 'opacity 0.3s ease',
    },
    '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: `
      0 12px 48px rgba(56, 189, 248, 0.18),
      0 0 0 1px rgba(255, 255, 255, 0.18),
      inset 0 1px 0 rgba(255, 255, 255, 0.18)
    `,
        border: '2px solid rgba(255, 255, 255, 0.5)',
        '&::before': {
            opacity: 1,
        },
    },
    '&:active': {
        transform: 'translateY(1px)',
    },
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};
