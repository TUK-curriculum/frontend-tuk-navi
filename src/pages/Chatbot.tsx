import React, { useState, useEffect } from "react";
import { Box, Typography, Chip, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useRef } from 'react';
import GlassCard from "../components/common/GlassCard";
import GradientButton from "../components/common/GradientButton";

import MessagesArea from "../components/common/MessagesArea";
import InputBar from "../components/common/InputBar";
import MessageBubble from "../components/common/Message";
import mascot from '../assets/chatbot.png';
import { useSchedule, useData } from '../contexts/SeparatedDataContext';
import { useAuth } from '../contexts/AuthContext';
import ChatbotCard from '../components/common/ChatbotCard';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { IconButton } from '@mui/material';
import { Course as ImportedCourse } from '../types/course';
import {
    curriculumTracks,
    generateMockAIResponse,
    generateMockSchedule,
    generateMockActionResponse,
    iconForTrack,
    periodSlots,
    type ChatMessage,
    type CurriculumSuggestion,
    type Semester,
    type AITextMessage,
    type AICurriculumListMessage,
    type AIScheduleMessage,
    type AICurriculumDetailMessage
} from '../mocks/chatbot.mock';

import InterestSelection from './InterestSelection';

// Course 타입은 types/course.ts에서 가져와 사용
type Course = ImportedCourse;

// 사용자 정보 타입 (로컬 타입)
interface ChatbotUserProfile {
    major: string;
    grade: string;
    credits: number;
    interests: string[];
    goals: string[];
    currentSubjects: string[];
}

// 외부 강의 타입 명확화
interface ExternalCourse { name: string; url: string; desc?: string; }

const mockUserProfile: ChatbotUserProfile = {
    major: '컴퓨터공학과',
    grade: '3학년',
    credits: 89,
    interests: ['AI', '웹개발', '데이터분석'],
    goals: ['AI 엔지니어', '빅데이터 전문가'],
    currentSubjects: ['알고리즘과 자료구조', '데이터베이스 시스템']
};

const pastelColors = ['#bae6fd', '#bbf7d0', '#fef9c3', '#fcd34d', '#fca5a5', '#ddd6fe', '#fdba74'];

interface ChatbotProps {
    isModal?: boolean;
}

// 외부 강의 클릭 기록 저장 함수는 컴포넌트 내부로 이동

const Chatbot: React.FC<ChatbotProps> = ({ isModal }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const presetInput = location.state?.presetInput;
    const [selectedCurriculum] = useState<CurriculumSuggestion | null>(() => {
        // location.state로 넘어온 경우에만 세팅
        return location.state?.selectedCurriculum || null;
    });
    const scheduleCreated = useRef(false);
    const [input, setInput] = useState("");
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);

    // 온보딩 모달 상태
    const [showOnboarding, setShowOnboarding] = useState(false);
    const { userData, updateOnboarding } = useData();

    useEffect(() => {
        const checkOnboardingStatus = async () => {
            console.log('🔍 [Chatbot] 온보딩 상태 확인 시작:', {
                userEmail: user?.email,
                userData: userData,
                onboarding: userData?.onboarding
            });

            if (!user?.email) {
                console.log('❌ [Chatbot] 사용자 이메일 없음');
                return;
            }

            try {
                const { apiService } = await import('../services/ApiService');
                const profile = await apiService.getProfile();
                console.log('✅ [Chatbot] 백엔드 프로필 조회 성공:', profile);

                if (!profile || !profile.onboardingCompleted) {
                    console.log('📝 [Chatbot] 온보딩 미완료 - 모달 표시');
                    setShowOnboarding(true);
                } else {
                    console.log('✅ [Chatbot] 온보딩 완료 - 모달 숨김');
                    setShowOnboarding(false);

                    // 백엔드에서 온보딩 완료로 응답했는데 로컬이 미완료인 경우 동기화
                    if (!userData?.onboarding?.isCompleted) {
                        console.log('🔄 [Chatbot] 로컬 데이터 동기화 필요');

                        // 백엔드 데이터로 로컬 온보딩 정보 업데이트
                        const backendOnboardingData = {
                            isCompleted: true,
                            name: profile.name || user?.name || '',
                            email: profile.email || user?.email || '',
                            studentId: profile.studentId || '',
                            department: profile.major || '',
                            year: profile.grade ? `${profile.grade}학년` : '',
                            career: (profile as any).career || '',
                            industry: (profile as any).industry || '',
                            completedCredits: (profile as any).completedCredits || 0,
                            remainingSemesters: (profile as any).remainingSemesters || 0,
                            maxCreditsPerTerm: (profile as any).maxCreditsPerTerm || 18,
                            interests: (profile as any).interests || []
                        };

                        console.log('💾 [Chatbot] 백엔드 데이터로 로컬 동기화:', backendOnboardingData);
                        updateOnboarding(backendOnboardingData);

                        // 동기화 후 즉시 온보딩 요약 출력
                        setTimeout(() => {
                            console.log('🚀 [Chatbot] 동기화 후 온보딩 요약 출력');
                            const summary = makeOnboardingSummary(backendOnboardingData);
                            console.log('📋 [Chatbot] 동기화 후 생성된 요약:', summary);

                            if (!onboardingSummaryAdded.current) {
                                setHistory((prev) => [{ from: 'ai', type: 'text', text: summary }, ...prev]);
                                onboardingSummaryAdded.current = true;
                                console.log('✅ [Chatbot] 동기화 후 온보딩 요약 메시지 추가됨');
                            }
                        }, 100); // 약간의 지연을 두어 상태 업데이트 완료 후 실행
                    }
                }
            } catch (error) {
                console.warn('⚠️ [Chatbot] 백엔드 조회 실패, 로컬 데이터 사용:', error);
                // 백엔드 실패 시 local fallback
                const onboarding = userData?.onboarding;
                const isCompleted = onboarding?.isCompleted;
                console.log('📝 [Chatbot] 로컬 온보딩 상태:', { onboarding, isCompleted });
                setShowOnboarding(!isCompleted);
            }
        };
        checkOnboardingStatus();
    }, [user?.email, userData?.onboarding]);

    const makeOnboardingSummary = (info: any) => {
        console.log('🔧 [Chatbot] makeOnboardingSummary 호출:', info);

        let summary = '';

        // 이름 정보
        if (info.name) {
            summary += `${info.name}님, 반가워요!\n`;
        } else {
            summary += '반가워요!\n';
        }

        // 학년, 학번, 전공 정보
        if (info.year || info.studentId || info.department) {
            summary += '현재 ';
            if (info.year) summary += info.year;
            if (info.studentId) summary += `(학번: ${info.studentId})`;
            if (info.department) summary += `, 전공은 ${info.department}`;
            summary += '입니다.\n';
        }

        // 희망 진로
        if (info.career) {
            summary += `\n희망 진로: ${info.career}`;
        }

        // 목표 기업
        if (info.industry) {
            summary += `\n목표 기업: ${info.industry}`;
        }

        // 학점 및 학기 정보
        if (info.completedCredits || info.remainingSemesters || info.maxCreditsPerTerm) {
            summary += `\n현재까지 ${info.completedCredits ?? '-'}학점 이수, 앞으로 ${info.remainingSemesters ?? '-'}학기 남음, 학기당 최대 ${info.maxCreditsPerTerm ?? '-'}학점 수강 가능.`;
        }

        // 관심 분야
        if (info.interests && info.interests.length > 0) {
            summary += `\n관심 분야: ${info.interests.join(', ')}`;
        }

        // 기본 정보가 있으면 요약 메시지 추가
        if (info.name || info.department || info.year || info.studentId || info.interests?.length > 0) {
            summary += '\n\n입력해주신 정보를 바탕으로 맞춤형 추천을 도와드릴게요!';
        } else {
            summary += '\n\n더 자세한 정보를 입력해주시면 더 정확한 추천을 도와드릴게요!';
        }

        console.log('📋 [Chatbot] 생성된 요약 텍스트:', summary);
        return summary;
    };

    const handleOnboardingComplete = (userInfo: any) => {
        console.log('🎉 [Chatbot] 온보딩 완료 처리:', userInfo);

        if (user?.email) {
            const onboardingData = { ...userInfo, isCompleted: true };
            console.log('💾 [Chatbot] 온보딩 데이터 저장:', onboardingData);
            updateOnboarding(onboardingData);

            const summary = makeOnboardingSummary(userInfo);
            console.log('📋 [Chatbot] 온보딩 완료 요약 생성:', summary);

            setHistory([
                { from: 'ai', type: 'text', text: summary }
            ]);
            onboardingSummaryAdded.current = true;
            console.log('✅ [Chatbot] 온보딩 완료 메시지 추가됨');
        } else {
            console.warn('⚠️ [Chatbot] 사용자 이메일 없음 - 온보딩 완료 처리 실패');
        }
        setShowOnboarding(false);
    };

    // 테스트용 함수 (브라우저 콘솔에서 호출 가능)
    useEffect(() => {
        // 전역 객체에 테스트 함수 추가
        (window as any).testOnboarding = () => {
            console.log('🧪 [TEST] 온보딩 테스트 시작');
            console.log('사용자:', user);
            console.log('사용자 데이터:', userData);
            console.log('온보딩 데이터:', userData?.onboarding);
            console.log('온보딩 완료 여부:', userData?.onboarding?.isCompleted);
            console.log('채팅 히스토리:', history);

            // 기본 정보가 있으면 요약 추가 테스트
            if (userData?.onboarding) {
                const info = userData.onboarding;
                const hasBasicInfo = info.name || info.department || info.year || info.studentId || info.interests?.length > 0;

                if (hasBasicInfo) {
                    const summary = makeOnboardingSummary(info);
                    console.log('생성된 요약:', summary);
                    setHistory((prev) => [{ from: 'ai', type: 'text', text: summary }, ...prev]);
                    console.log('✅ 수동으로 온보딩 요약 추가됨');
                } else {
                    console.log('❌ 기본 정보가 없어서 요약 생성 불가');
                }
            } else {
                console.log('❌ 온보딩 데이터가 없음');
            }
        };

        return () => {
            delete (window as any).testOnboarding;
        };
    }, [user, userData, history]);

    // 한 번만 온보딩 요약을 추가하기 위한 ref
    const onboardingSummaryAdded = useRef(false);

    useEffect(() => {
        console.log('🔍 [Chatbot] 온보딩 정보 확인:', {
            userEmail: user?.email,
            onboardingData: userData?.onboarding,
            isCompleted: userData?.onboarding?.isCompleted,
            historyLength: history.length
        });

        // 사용자가 있고, 온보딩 정보가 있으면 바로 출력 (완료 여부 무관)
        if (!user?.email || !userData?.onboarding) {
            console.log('❌ [Chatbot] 온보딩 조건 불만족:', {
                hasUser: !!user?.email,
                hasOnboarding: !!userData?.onboarding
            });
            return;
        }

        const info = userData.onboarding;
        console.log('📝 [Chatbot] 온보딩 정보:', info);

        // 기본 정보라도 있으면 요약 생성
        const hasBasicInfo = info.name || info.department || info.year || info.studentId || info.interests?.length > 0;

        if (!hasBasicInfo) {
            console.log('❌ [Chatbot] 기본 정보 없음 - 요약 생성 불가');
            return;
        }

        const summary = makeOnboardingSummary(info);
        console.log('📋 [Chatbot] 생성된 요약:', summary);

        // 이미 history 에 존재하거나, 이미 처리했으면 스킵
        const alreadyExists = history.some(
            (m) => m.from === 'ai' && m.type === 'text' && 'text' in m && m.text?.includes('반가워요!'),
        );

        console.log('🔍 [Chatbot] 중복 체크:', {
            alreadyExists,
            onboardingSummaryAdded: onboardingSummaryAdded.current
        });

        if (!alreadyExists && !onboardingSummaryAdded.current) {
            console.log('✅ [Chatbot] 온보딩 요약 메시지 추가');
            setHistory((prev) => [{ from: 'ai', type: 'text', text: summary }, ...prev]);
            onboardingSummaryAdded.current = true;
        } else {
            console.log('⏭️ [Chatbot] 온보딩 요약 스킵 (이미 존재하거나 처리됨)');
        }
    }, [user?.email, userData?.onboarding]); // isCompleted 의존성 제거

    // 사용자 정보를 AI 응답에 활용하기 위한 함수
    const getUserContext = () => {
        if (!userData?.onboarding) return null;

        const onboarding = userData.onboarding;
        return {
            name: onboarding.name || user?.name || '',
            major: onboarding.department || userData.profile?.major || '',
            grade: onboarding.year || userData.profile?.grade || '',
            credits: onboarding.completedCredits || userData.graduationInfo?.totalCredits || 0,
            career: onboarding.career || '',
            interests: onboarding.interests || [],
            remainingSemesters: onboarding.remainingSemesters || 0,
            maxCreditsPerTerm: onboarding.maxCreditsPerTerm || 18
        };
    };

    // 새로운 DataContext 훅 사용
    const { addCurriculum } = useData();
    // semester 값을 userData에서 가져오도록 변경
    const semester = userData?.settings?.defaultSemester || '2024-2학기';
    const { saveSchedule } = useSchedule(semester);


    useEffect(() => {
        if (presetInput) {
            setInput(presetInput);
            setTimeout(() => {
                // handleSend가 input을 참조하므로, 최신 input값을 보장하기 위해 setTimeout 사용
                document.getElementById('chatbot-auto-send')?.click();
            }, 200);
        }
    }, [presetInput]);

    // 무작위 5개 추출 함수
    // 더미데이터 전체 반환 (제한 없음)
    function getCurriculums() {
        return curriculumTracks;
    }

    // AI 응답 생성 함수 (사용자 정보 활용)
    const generateAIResponse = (userInput: string): ChatMessage[] => {
        const userContext = getUserContext();
        return generateMockAIResponse(userInput, userContext);
    };

    // 1. 실제 AI 서버 연동을 위한 mock 함수 (사용자 정보 활용)
    async function fetchAIResponse(message: string, user: any) {
        const userContext = getUserContext();

        // 실제 연동 시: return fetch('/ai-server/chat', ...)
        return new Promise<ChatMessage[]>(resolve => {
            setTimeout(() => {
                const responses = generateMockAIResponse(message, userContext);
                resolve(responses);
            }, 700);
        });
    }

    const handleSend = async () => {
        if (!input.trim()) return;
        setHistory(prev => [...prev, { from: 'user', text: input }]);
        setInput("");
        setLoading(true);

        // 데모용 mock AI 응답 (나중에 fetchAIResponse만 실제 API로 교체)
        const aiMessages = await fetchAIResponse(input, user);
        setHistory(prev => [...prev, ...aiMessages]);
        setLoading(false);
    };

    const handleActionButton = (action: string) => {
        setLoading(true);

        setTimeout(async () => {
            try {
                switch (action) {
                    case 'generate-curriculum':
                        // 커리큘럼 생성 mock 응답만 사용
                        setHistory(prev => [...prev, generateMockActionResponse(action)]);
                        break;
                    case 'generate-schedule':
                        // 시간표 생성 mock 응답만 사용
                        setHistory(prev => [...prev, generateMockActionResponse(action)]);
                        break;
                    case 'show-alternatives':
                        // 다른 트랙 옵션 보여주기
                        const alternativesResponse = generateMockActionResponse(action);
                        setHistory(prev => [...prev, alternativesResponse]);
                        break;
                    default:
                        const defaultResponse = generateMockActionResponse(action);
                        setHistory(prev => [...prev, defaultResponse]);
                        break;
                }
            } catch (error) {
                console.error('액션 처리 중 오류:', error);
                setHistory(prev => [...prev, {
                    from: 'ai',
                    type: 'text',
                    text: '처리 중 오류가 발생했습니다. 다시 시도해주세요.'
                }]);
            } finally {
                setLoading(false);
            }
        }, 800);
    };

    // 메시지 타입별 렌더링 (track-list, curriculum-detail, schedule, text 등)
    const renderMessage = (msg: unknown, idx: number): React.ReactNode => {
        const message = msg as ChatMessage;

        if (message.from === 'user') {
            return (
                <MessageBubble from="user" key={idx}>
                    {'text' in message && typeof message.text === 'string' ? message.text : ''}
                </MessageBubble>
            );
        } else if (message.from === 'ai' && message.type === 'text') {
            // 온보딩 요약 메시지(반가워요! ... 입력해주신 정보를 바탕으로 ...)에 항상 '내 정보 수정' 버튼 노출
            const msgText = (message as AITextMessage).text || '';
            const isOnboardingSummary = typeof msgText === 'string' && msgText.includes('반가워요!') && msgText.includes('입력해주신 정보를 바탕으로');
            return (
                <MessageBubble from="ai" key={idx}>
                    <Box>
                        <div style={{ whiteSpace: 'pre-line' }}>{msgText}</div>
                        {isOnboardingSummary && (
                            <Button
                                variant="outlined"
                                size="small"
                                sx={{ mt: 2, fontWeight: 600, borderRadius: 1, fontSize: '1rem', px: 2, py: 0.5, minWidth: 0, height: 36 }}
                                onClick={() => setShowOnboarding(true)}
                            >
                                내 정보 수정
                            </Button>
                        )}
                    </Box>
                </MessageBubble>
            );
        } else if (message.from === 'ai' && message.type === 'curriculum-list') {
            // 모든 트랙 카드 보여줌 (mock 데이터 전체 활용)
            const msg = message as AICurriculumListMessage; // AICurriculumListMessage 타입 제거
            return (
                <MessageBubble from="ai" key={idx}>
                    <Typography fontWeight={700} mb={1}>관심 있는 개발 분야를 선택해 주세요!</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                        {curriculumTracks.map((curri: CurriculumSuggestion, i: number) => (
                            <ChatbotCard
                                key={curri.title}
                                icon={iconForTrack(curri.title)}
                                title={curri.title}
                                description={curri.description}
                                onClick={() => handleTrackSelect(curri)}
                                sx={{ cursor: 'pointer' }}
                            >
                                <Box sx={{ mb: 1 }}>
                                    {curri.semesters.map((sem: Semester, idx: number) => (
                                        <Typography key={idx} variant="body2" sx={{ fontWeight: 600, color: '#22223b', mb: 0.5 }}>
                                            {sem.semester}: {sem.subjects.map(s => s.name).join(', ')}
                                        </Typography>
                                    ))}
                                </Box>
                            </ChatbotCard>
                        ))}
                    </Box>
                </MessageBubble>
            );
        } else if (message.from === 'ai' && message.type === 'schedule-suggestion') {
            const msg = message as AIScheduleMessage; // AIScheduleMessage 타입 제거
            return (
                <MessageBubble from="ai" key={idx}>
                    <Typography fontWeight={700} mb={1}>{msg.content.message}</Typography>
                    <Box sx={{ mt: 1, width: '100%' }}>
                        {msg.content.schedule.monday.map((subject: any, idx: number) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 0.7, gap: 1 }}>
                                <Typography variant="body2" sx={{ minWidth: 60, fontWeight: 700 }}>월</Typography>
                                <Typography variant="body2" sx={{ minWidth: 90 }}>{subject}</Typography>
                                <Typography variant="body2" color="text.secondary">({subject.split(' ')[1]}, {subject.split(' ')[2]})</Typography>
                            </Box>
                        ))}
                        {msg.content.schedule.tuesday.map((subject: any, idx: number) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 0.7, gap: 1 }}>
                                <Typography variant="body2" sx={{ minWidth: 60, fontWeight: 700 }}>화</Typography>
                                <Typography variant="body2" sx={{ minWidth: 90 }}>{subject}</Typography>
                                <Typography variant="body2" color="text.secondary">({subject.split(' ')[1]}, {subject.split(' ')[2]})</Typography>
                            </Box>
                        ))}
                        {msg.content.schedule.wednesday.map((subject: any, idx: number) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 0.7, gap: 1 }}>
                                <Typography variant="body2" sx={{ minWidth: 60, fontWeight: 700 }}>수</Typography>
                                <Typography variant="body2" sx={{ minWidth: 90 }}>{subject}</Typography>
                                <Typography variant="body2" color="text.secondary">({subject.split(' ')[1]}, {subject.split(' ')[2]})</Typography>
                            </Box>
                        ))}
                        {msg.content.schedule.thursday.map((subject: any, idx: number) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 0.7, gap: 1 }}>
                                <Typography variant="body2" sx={{ minWidth: 60, fontWeight: 700 }}>목</Typography>
                                <Typography variant="body2" sx={{ minWidth: 90 }}>{subject}</Typography>
                                <Typography variant="body2" color="text.secondary">({subject.split(' ')[1]}, {subject.split(' ')[2]})</Typography>
                            </Box>
                        ))}
                        {msg.content.schedule.friday.map((subject: any, idx: number) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 0.7, gap: 1 }}>
                                <Typography variant="body2" sx={{ minWidth: 60, fontWeight: 700 }}>금</Typography>
                                <Typography variant="body2" sx={{ minWidth: 90 }}>{subject}</Typography>
                                <Typography variant="body2" color="text.secondary">({subject.split(' ')[1]}, {subject.split(' ')[2]})</Typography>
                            </Box>
                        ))}
                    </Box>
                </MessageBubble>
            );
        } else if (message.from === 'ai' && message.type === 'action-buttons') {
            const msg = message as any; // AIActionMessage 타입 제거
            return (
                <MessageBubble from="ai" key={idx}>
                    <Typography fontWeight={700} mb={1}>{msg.content.title}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {msg.content.buttons.map((button: any, i: number) => (
                            <GradientButton
                                key={i}
                                color={button.color}
                                onClick={() => handleActionButton(button.action)}
                            >
                                {button.text}
                            </GradientButton>
                        ))}
                    </Box>
                </MessageBubble>
            );
        } else if (message.from === 'ai' && message.type === 'curriculum-detail') {
            const msg = message as AICurriculumDetailMessage; // AICurriculumDetailMessage 타입 제거
            // 트랙 상세/확인 카드 + 커리큘럼 생성 버튼
            return (
                <MessageBubble from="ai" key={idx}>
                    <ChatbotCard
                        icon={iconForTrack(msg.content.title)}
                        title={msg.content.title + ' 커리큘럼'}
                        description={msg.content.description}
                    >
                        <Box sx={{ mb: 2 }}>
                            {msg.content.semesters.map((sem: any, idx: number) => (
                                <Box key={idx} sx={{ mb: 1.5, pb: 1.5, borderBottom: idx < msg.content.semesters.length - 1 ? '1px solid #e3e8ef' : 'none' }}>
                                    <Typography variant="subtitle1" fontWeight={700} color="primary" sx={{ mb: 0.5 }}>
                                        {sem.semester}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {sem.subjects.map((subject: any, i: number) => (
                                            <Chip
                                                key={i}
                                                label={subject.name}
                                                size="small"
                                                sx={{
                                                    bgcolor: '#f4f8fd',
                                                    color: '#1e293b',
                                                    fontWeight: 600,
                                                    borderRadius: 1.5,
                                                    px: 1.5,
                                                    fontSize: '0.97rem',
                                                    boxShadow: 'none',
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                        {/* 커리큘럼 생성 버튼 */}
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ fontWeight: 700, borderRadius: 2, fontSize: '1.08rem', px: 3, py: 1.2, mt: 1.5, boxShadow: '0 2px 8px 0 rgba(14,165,233,0.10)' }}
                            onClick={() => navigate('/curriculum', { state: { newCurriculum: msg.content } })}
                        >
                            커리큘럼 생성
                        </Button>
                    </ChatbotCard>
                </MessageBubble>
            );
        } else if (message.from === 'ai' && message.type === 'schedule') {
            const scheduleMsg = message as any; // AIScheduleDetailMessage 타입 제거
            return (
                <MessageBubble from="ai" key={idx}>
                    <Typography fontWeight={700} mb={1}>{scheduleMsg.content.title}</Typography>
                    <Box sx={{ mt: 1, width: '100%' }}>
                        {scheduleMsg.content.rows.map((row: any, idx: number) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 0.7, gap: 1 }}>
                                <Typography variant="body2" sx={{ minWidth: 60, fontWeight: 700 }}>{row.day}</Typography>
                                <Typography variant="body2" sx={{ minWidth: 90 }}>{row.time}</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.subject}</Typography>
                                <Typography variant="body2" color="text.secondary">({row.room}, {row.professor})</Typography>
                            </Box>
                        ))}
                    </Box>
                </MessageBubble>
            );
        } else if (message.from === 'ai' && message.type === 'track-list') {
            // 트랙 목록도 mock 데이터 전체로 렌더링
            return (
                <MessageBubble from="ai" key={idx}>
                    <Typography fontWeight={700} mb={1}>추천 트랙 목록</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                        {curriculumTracks.map((track: CurriculumSuggestion, i: number) => (
                            <ChatbotCard
                                key={track.title}
                                icon={iconForTrack(track.title)}
                                title={track.title}
                                description={track.description}
                                onClick={() => handleTrackSelect(track)}
                                sx={{ cursor: 'pointer' }}
                            />
                        ))}
                    </Box>
                </MessageBubble>
            );
        }
        return null;
    };

    // 트랙 카드 클릭 시: 커리큘럼 상세 메시지 append 및 바로 블록(시간표) 생성
    function handleTrackSelect(curri: CurriculumSuggestion) {
        // 시간표 mock 데이터 생성
        const scheduleArr = generateMockSchedule(curri, semester);
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        const schedule: { [key: string]: string[] } = {
            monday: [], tuesday: [], wednesday: [], thursday: [], friday: []
        };
        scheduleArr.forEach(course => {
            if (days.includes(course.day)) {
                schedule[course.day].push(`${course.name} (${course.startTime}~${course.endTime}, ${course.room}, ${course.instructor})`);
            }
        });
        setHistory(prev => [
            ...prev,
            {
                from: 'ai',
                type: 'curriculum-detail',
                content: curri
            },
            {
                from: 'ai',
                type: 'schedule-suggestion',
                content: {
                    message: `${curri.title} 기반 시간표 예시입니다!`,
                    schedule: {
                        monday: schedule.monday,
                        tuesday: schedule.tuesday,
                        wednesday: schedule.wednesday,
                        thursday: schedule.thursday,
                        friday: schedule.friday
                    }
                }
            }
        ]);
    }

    // 커리큘럼 생성 버튼 클릭 시: 시간표 카드 append + /curriculum 이동
    async function handleCurriculumConfirm() {
        // setShowCurriculumConfirm(false); // This line is removed

        // if (!selectedTrack) { // This line is removed
        //     console.error('선택된 트랙이 없습니다.'); // This line is removed
        //     return; // This line is removed
        // } // This line is removed

        try {
            // handleCreateCurriculum 함수를 사용하여 커리큘럼 생성 // This line is removed
            // await handleCreateCurriculum(selectedTrack); // This line is removed
        } catch (error) {
            console.error('커리큘럼 생성 실패:', error);
            setHistory(prev => [...prev, {
                from: 'ai',
                type: 'text',
                text: '커리큘럼 생성 중 오류가 발생했습니다. 다시 시도해주세요.'
            } as any]); // AITextMessage 타입 제거
        }
    }

    // 3. 시간표 생성 (이번 학기만)
    function getSemesterTimetable(curri: CurriculumSuggestion, semester: string) {
        const subjects = curri.semesters.find(s => s.semester === semester)?.subjects || [];
        const professors = ['김보안', '이암호', '박네트', '최AI', '정데이터', '오임베', '유통계', '문클라우드'];
        const rooms = ['201호', '202호', '203호', '204호', '205호', '301호', '302호', '303호'];
        return subjects.map((subject, idx) => {
            const slot = periodSlots[idx % periodSlots.length];
            return {
                name: subject.name,
                time: slot.time,
                room: rooms[idx % rooms.length],
                professor: professors[idx % professors.length],
            };
        });
    }

    // 커리큘럼에서 넘어온 경우: 자동 메시지 + 시간표 생성
    useEffect(() => {
        console.log('selectedCurriculum 원본:', selectedCurriculum);

        if (selectedCurriculum && !scheduleCreated.current) {
            // selectedCurriculum 구조 보정 및 검증
            let selectedCurriculumObj = selectedCurriculum;

            // 1단계: curriculum 키로 감싸져 있는지 확인
            if (
                selectedCurriculumObj &&
                typeof selectedCurriculumObj === 'object' &&
                'curriculum' in selectedCurriculumObj
            ) {
                console.log('curriculum 키로 감싸진 객체 발견:', (selectedCurriculumObj as any).curriculum);

                // 내부 값이 JSON 문자열이면 파싱
                if (typeof (selectedCurriculumObj as any).curriculum === 'string') {
                    try {
                        selectedCurriculumObj = JSON.parse((selectedCurriculumObj as any).curriculum);
                        console.log('JSON 파싱 후:', selectedCurriculumObj);
                    } catch (e) {
                        console.error('JSON 파싱 실패:', e);
                        return;
                    }
                } else {
                    selectedCurriculumObj = (selectedCurriculumObj as any).curriculum;
                }
            }

            // 2단계: 문자열로 전달된 경우 파싱 시도
            if (typeof selectedCurriculumObj === 'string') {
                try {
                    selectedCurriculumObj = JSON.parse(selectedCurriculumObj);
                    console.log('문자열에서 파싱 후:', selectedCurriculumObj);
                } catch (e) {
                    console.error('문자열 JSON 파싱 실패:', e);
                    return;
                }
            }

            // 2단계: 구조 검증
            console.log('최종 selectedCurriculumObj:', selectedCurriculumObj);

            // 구조 검증 - 더 유연하게 처리
            if (!selectedCurriculumObj) {
                console.error('selectedCurriculumObj가 null/undefined입니다.');
                return;
            }

            // title이 없으면 name으로 대체 시도
            const title = (selectedCurriculumObj as any).title || (selectedCurriculumObj as any).name;
            if (!title) {
                console.error('title/name이 없습니다:', selectedCurriculumObj);
                return;
            }

            // semesters가 없으면 subjects로 대체 시도
            let semesters = (selectedCurriculumObj as any).semesters;
            if (!Array.isArray(semesters)) {
                if (Array.isArray((selectedCurriculumObj as any).subjects)) {
                    // subjects가 있으면 임시 semesters 생성
                    semesters = [{
                        semester: semester,
                        subjects: (selectedCurriculumObj as any).subjects.map((subj: string) => ({
                            name: subj,
                            type: '필수' as const
                        })),
                        credits: (selectedCurriculumObj as any).subjects.length * 3
                    }];
                    console.log('subjects로부터 임시 semesters 생성:', semesters);
                } else {
                    console.error('semesters와 subjects 모두 없습니다:', selectedCurriculumObj);
                    return;
                }
            }

            // 최종 객체 구성
            const finalCurriculumObj = {
                ...selectedCurriculumObj,
                title: title,
                semesters: semesters
            };

            console.log('최종 검증된 curriculum 객체:', finalCurriculumObj);

            setHistory(prev => [
                ...prev,
                { from: 'ai', type: 'text', text: '선택한 커리큘럼으로 시간표를 생성해드릴게요!' }
            ]);
            scheduleCreated.current = true;
            setTimeout(async () => {
                // await handleCreateSchedule(finalCurriculumObj as CurriculumSuggestion, { delayNavigate: true }); // This line is removed
            }, 600);
        }
    }, [selectedCurriculum]);

    // 외부 강의 클릭 기록 저장 함수 (onboarding에 임시 저장)
    const handleExternalCourseClick = (course: ExternalCourse) => {
        if (!user?.email) return;
        const prev = userData?.onboarding?.externalCourses || [];
        if (!prev.find((c: ExternalCourse) => c.url === course.url)) {
            updateOnboarding({
                ...userData?.onboarding,
                externalCourses: [...prev, course]
            });
        }
    };

    if (showOnboarding) {
        return (
            <InterestSelection
                open={showOnboarding}
                onClose={() => setShowOnboarding(false)}
                onComplete={handleOnboardingComplete}
            />
        );
    }

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
            {/* 디버깅 정보 (개발 환경에서만 표시) */}
            {process.env.NODE_ENV === 'development' && (
                <Box sx={{ p: 2, bgcolor: '#fee2e2', borderBottom: '1px solid #fecaca' }}>
                    <Typography variant="body2" color="error">
                        🔍 디버깅 정보:
                        사용자={user?.email ? '있음' : '없음'} |
                        온보딩정보={userData?.onboarding ? '있음' : '없음'} |
                        기본정보={userData?.onboarding?.name || userData?.onboarding?.department || userData?.onboarding?.interests?.length > 0 ? '있음' : '없음'} |
                        메시지수={history.length}
                    </Typography>
                </Box>
            )}

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: 1200,
                        height: '80vh',
                        minHeight: 500,
                        background: '#fff',
                        borderRadius: 4,
                        boxShadow: '0 8px 32px 0 rgba(80,110,240,0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        position: 'relative',
                        margin: '0 auto',
                    }}
                >
                    {/* 상단 바 - 서비스스러운 디자인 */}
                    <Box
                        sx={{
                            width: '100%',
                            background: 'linear-gradient(90deg, #f8fafc 60%, #e0e7ff 100%)',
                            borderTopLeftRadius: 32,
                            borderTopRightRadius: 32,
                            boxShadow: '0 2px 12px rgba(60,60,130,0.06)',
                            px: 4,
                            py: 2.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            position: 'sticky',
                            top: 0,
                            zIndex: 10,
                        }}
                    >
                        {/* 맥북 스타일 윈도우 버튼 */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mr: 2 }}>
                            <Box sx={{
                                width: 14, height: 14, borderRadius: '50%',
                                background: '#ff5f56', border: '1.5px solid #e0443e'
                            }} />
                            <Box sx={{
                                width: 14, height: 14, borderRadius: '50%',
                                background: '#ffbd2e', border: '1.5px solid #dea123'
                            }} />
                            <Box sx={{
                                width: 14, height: 14, borderRadius: '50%',
                                background: '#27c93f', border: '1.5px solid #13a10e'
                            }} />
                        </Box>
                        {/* 마스코트/서비스명/부제목 */}
                        <img
                            src={mascot}
                            alt="AI 마스코트"
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: '#e0f2fe',
                                boxShadow: '0 2px 8px rgba(14,165,233,0.10)',
                                objectFit: 'cover',
                                marginRight: 12,
                            }}
                        />
                        <Box>
                            <Typography variant="h6" fontWeight={900} sx={{ color: '#22223b', mb: 0.2 }}>
                                TUK NAVI
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                AI가 분석하여 개인화된 커리큘럼과 시간표를 추천해드립니다!
                            </Typography>
                        </Box>
                    </Box>
                    <MessagesArea messageList={history} loading={loading} renderMessage={renderMessage} sx={{ px: 4, py: 3 }} />
                    <InputBar value={input} onChange={setInput} onSend={handleSend} disabled={loading} sx={{ px: 4, pb: 2, pt: 1 }} sendButtonProps={{ id: 'chatbot-auto-send', style: { display: 'none' } }} />
                </Box>

                {showOnboarding && (
                    <InterestSelection
                        open={showOnboarding}
                        onClose={() => setShowOnboarding(false)}
                        onComplete={handleOnboardingComplete}
                    />
                )}
            </Box>
        </Box>
    );
};

export default Chatbot; 