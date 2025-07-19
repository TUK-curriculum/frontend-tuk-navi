import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Mascot from '../components/common/Mascot';
import { useSetup } from '../contexts/SetupContext';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/SeparatedDataContext';
import setup1 from '../assets/setup1.png';
import setup2 from '../assets/setup2.png';
import setup3 from '../assets/setup3.png';
import setup4 from '../assets/setup4.png';

const REQUIRED_TOTAL = 130;
const catalog: any[] = [];

const IntroAfterRegister: React.FC = () => {
    const navigate = useNavigate();
    const { data, reset } = useSetup();
    const { user } = useAuth();
    const { updateProfile, updateOnboarding } = useData();
    const [currentStep, setCurrentStep] = useState(0);
    const [showContent, setShowContent] = useState(false);

    // 계산
    const earned = data.takenCourses.reduce((s, c) => s + Number(c.credits), 0);
    const remain = Math.max(0, REQUIRED_TOTAL - earned);
    let gradeNum = Number(data.grade);
    if (![1, 2, 3, 4].includes(gradeNum)) gradeNum = 1;
    const mandRemaining = catalog
        .filter(c => c.type === '전필' && c.year <= gradeNum && !data.takenCourses.some(t => t.id === c.id));

    const steps = [
        { title: '학년 정보', content: `현재 ${gradeNum ? String(gradeNum) : '-'}학년!`, icon: '🎓' },
        { title: '이수 학점', content: `총 ${earned}학점 이수`, icon: '📊' },
        { title: '남은 학점', content: `졸업까지 ${remain}학점 남음`, icon: '⏳' },
        { title: '전필 남은 과목', content: `미이수 전필: ${mandRemaining.map(c => c.name).join(', ') || '없음'}`, icon: '📕' },
        { title: '관심 분야', content: data.interests.length > 0 ? data.interests : ['없음'], icon: '🎯' },
        { title: '준비 완료!', content: '이제 본격적으로 시작해보세요!', icon: '🚀' }
    ];

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowContent(true);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!showContent) return;
        const interval = setInterval(() => {
            setCurrentStep(prev => {
                if (prev < steps.length - 1) {
                    return prev + 1;
                } else {
                    clearInterval(interval);
                    setTimeout(() => {
                        reset();
                        // 계정별 온보딩/프로필 정보 저장
                        if (user?.email) {
                            updateProfile({ grade: Number(gradeNum), interests: data.interests });
                            updateOnboarding({ isCompleted: true, completedSteps: steps.map(s => s.title), interests: data.interests });
                        }
                        navigate('/dashboard');
                    }, 3000);
                    return prev;
                }
            });
        }, 2000);
        return () => clearInterval(interval);
    }, [showContent, steps.length, navigate, reset, user, updateProfile, updateOnboarding, data.interests, gradeNum, steps]);

    if (!showContent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }} className="text-center">
                    <Mascot size="large" />
                    <div className="text-2xl font-bold text-gray-800 mt-4">TUK NAVI</div>
                </motion.div>
            </div>
        );
    }

    // 이미지 배열 준비
    const setupImages = [setup1, setup2, setup3, setup4];

    return (
        <Box maxWidth={600} mx="auto" py={8} px={2}>
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-2xl shadow-xl p-8 text-center"
            >
                <div className="flex flex-col items-center">
                    <img src={setupImages[currentStep % setupImages.length]} alt="setup" className="w-32 h-32 mb-4" />
                    <Typography variant="h5" fontWeight={800} mb={2}>{steps[currentStep].title}</Typography>
                    <Typography variant="body1" color="text.secondary" mb={2}>
                        {Array.isArray(steps[currentStep].content)
                            ? steps[currentStep].content.join(', ')
                            : steps[currentStep].content}
                    </Typography>
                    <div style={{ fontSize: 48 }}>{steps[currentStep].icon}</div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.06, boxShadow: '0 0 0 6px #60a5fa44' }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                        width: '100%',
                        marginTop: 32,
                        padding: '18px 0',
                        fontWeight: 800,
                        fontSize: 22,
                        borderRadius: 16,
                        background: 'linear-gradient(90deg,#2563eb 0%,#0ea5e9 100%)',
                        color: '#fff',
                        border: 'none',
                        boxShadow: '0 4px 24px #2563eb33',
                        cursor: 'pointer',
                        letterSpacing: 1,
                        animation: 'shine 2.5s infinite linear',
                    }}
                    onClick={() => {
                        reset();
                        if (user?.email) {
                            updateProfile({ grade: Number(gradeNum), interests: data.interests });
                            updateOnboarding({ isCompleted: true, completedSteps: steps.map(s => s.title), interests: data.interests });
                        }
                        navigate('/dashboard');
                    }}
                >
                    대시보드로 이동
                </motion.button>
            </motion.div>
        </Box>
    );
};

export default IntroAfterRegister; 