import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";
import MessageBubble from "../components/common/Message";
import mascot from '../assets/chatbot.png';
import check from "../assets/check.png";
import { useWebSocket } from '../contexts/WebSocketContext';
import { chatService } from "../services/ChatService";

// 기본 메시지 타입
interface Message {
    sender: "user" | "assistant";
    content: string;
    timestamp?: string;
}

interface ChatbotProps {
    isModal?: boolean;
}

const Chatbot: React.FC<ChatbotProps> = ({ isModal }) => {
    // WebSocket Context 사용
    const { 
        isConnected, 
        connectionState, 
        sessionId, 
        messages: globalMessages, 
        sendMessage, 
        addMessage,
        clearMessages 
    } = useWebSocket();
    
    const [input, setInput] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
    const [localMessages, setLocalMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isComposing = useRef<boolean>(false);

    // 글로벌 메시지와 로컬 메시지 동기화
    useEffect(() => {
        setLocalMessages(globalMessages);
    }, [globalMessages]);

    // 세션 ID가 변경되면 채팅 기록 로드
    useEffect(() => {
        const loadHistory = async () => {
            if (!sessionId) {
                console.log("[DEBUG] sessionId 없음 → API 호출 스킵");
                return;
            }

            try {
                const history = await chatService.historyBySession(sessionId);
                const historyMessages = history.map(h => ({
                    sender: h.sender,
                    content: h.content,
                    timestamp: h.timestamp
                }));
                
                if (historyMessages.length === 0) {
                    // 초기 메시지만 로컬에 추가
                    const welcomeMessage: Message = {
                        sender: "assistant",
                        content: "안녕하세요! TUK NAVI입니다.\n\n개인화된 커리큘럼 추천을 도와드릴게요.\n커리큘럼 생성을 원하시면 언제든 말씀해주세요!"
                    };
                    addMessage(welcomeMessage);
                } else {
                    // 기존 메시지들을 글로벌 상태에 설정
                    clearMessages();
                    historyMessages.forEach(msg => addMessage(msg));
                }
            } catch (err) {
                console.error("채팅 기록 조회 실패:", err);
            }
        };

        loadHistory();
    }, [sessionId, addMessage, clearMessages]);

    // 메시지 전송 핸들러
    const handleSendMessage = async (): Promise<void> => {
        if (!input.trim()) return;

        const userMessage = input;
        setInput("");
        setLoading(true);

        try {
            await sendMessage(userMessage);
        } catch (error) {
            console.error("메시지 전송 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    // 이벤트 핸들러
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === "Enter" && !isComposing.current) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleCompositionStart = (): void => {
        isComposing.current = true;
    };

    const handleCompositionEnd = (): void => {
        isComposing.current = false;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setInput(e.target.value);
    };

    // 메시지 변경 시 스크롤 하단으로 이동
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [localMessages]);

    const renderMessage = (msg: Message, idx: number): React.ReactNode => {
        if (msg.sender === "assistant") {
            // 조건 선택 메시지인지 확인
            const isConditionMessage = msg.content.includes("조건을 모두 선택해 주세요") || msg.content.includes("조건:");
            
            if (isConditionMessage) {
                // 조건 추출
                const conditions = ["졸업", "재수강", "선호 교수", "팀플 제외"];
                
                return (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                        <img
                            src={mascot}
                            alt="tino"
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                objectFit: 'cover',
                                marginTop: 4,
                            }}
                        />
                        <MessageBubble from="ai">
                            <div style={{ marginBottom: '16px' }}>
                                <div>더욱 맞춤화된 커리큘럼을 생성하기 위해, 아래에서 원하는 조건을 모두 선택해 주세요.</div>
                                <br />
                                <div>관심 분야 외의 과목은 아래 조건으로 설계됩니다.</div>
                            </div>
                            
                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                                    {conditions.map((condition) => (
                                        <button
                                            key={condition}
                                            onClick={() => {
                                                setSelectedConditions(prev => 
                                                    prev.includes(condition) 
                                                        ? prev.filter(c => c !== condition)
                                                        : [...prev, condition]
                                                );
                                            }}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '20px',
                                                border: selectedConditions.includes(condition) 
                                                    ? '2px solid #1976d2' 
                                                    : '2px solid #e0e0e0',
                                                backgroundColor: selectedConditions.includes(condition) 
                                                    ? '#e3f2fd' 
                                                    : '#ffffff',
                                                color: selectedConditions.includes(condition) 
                                                    ? '#1976d2' 
                                                    : '#666666',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: selectedConditions.includes(condition) ? '600' : '400',
                                                transition: 'all 0.2s ease',
                                            }}
                                        >
                                            {condition}
                                        </button>
                                    ))}
                                    <img 
                                        src={check} 
                                        alt="조건 확인" 
                                        onClick={async () => {
                                            if (selectedConditions.length === 0) {
                                                alert('최소 하나의 조건을 선택해주세요.');
                                                return;
                                            }
                                            
                                            // 선택된 조건들을 서버로 전송
                                            const conditionsText = selectedConditions.join(", ");
                                            
                                            try {
                                                await sendMessage(conditionsText);
                                                setSelectedConditions([]);
                                            } catch (error) {
                                                console.error("조건 전송 실패:", error);
                                            }
                                        }}
                                        style={{ 
                                            width: '32px', 
                                            height: '32px',
                                            cursor: 'pointer'
                                        }} 
                                    />
                                </Box>
                            </Box>
                        </MessageBubble>
                    </Box>
                );
            } else {
                // 일반 봇 메시지
                return (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                        <img
                            src={mascot}
                            alt="tino"
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                objectFit: 'cover',
                                marginTop: 4,
                            }}
                        />
                        <MessageBubble from="ai">
                            <div 
                                dangerouslySetInnerHTML={{ 
                                    __html: msg.content.replace(/\n/g, "<br>") 
                                }} 
                            />
                        </MessageBubble>
                    </Box>
                );
            }
        } else {
            return (
                <MessageBubble from="user" key={idx}>
                    {msg.content}
                </MessageBubble>
            );
        }
    };

    // 연결 상태 표시
    const renderConnectionStatus = () => {
        if (connectionState === 'connecting') {
            return (
                <Alert severity="info" sx={{ mb: 2 }}>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    연결 중...
                </Alert>
            );
        }
        
        if (connectionState === 'error' || !isConnected) {
            return (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    연결이 끊어졌습니다. 자동으로 재연결을 시도합니다.
                </Alert>
            );
        }

        return null;
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: 1200,
                        height: '80vh',
                        minHeight: 750,
                        background: '#fff',
                        borderRadius: 4,
                        boxShadow: '0 8px 32px 0 rgba(80,110,240,0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        position: 'relative',
                        margin: '55px auto 0 auto',
                    }}
                >
                    {/* 상단 바 */}
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mr: 2 }}>
                            <Box sx={{
                                width: 14, height: 14, borderRadius: '50%',
                                background: isConnected ? '#27c93f' : '#ff5f56', 
                                border: '1.5px solid #e0443e'
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
                                TUK NAVI {isConnected ? '' : '(연결 끊김)'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                AI가 분석하여 개인화된 커리큘럼과 시간표를 추천해드립니다!
                            </Typography>
                        </Box>
                    </Box>

                    {/* 연결 상태 표시 */}
                    <Box sx={{ px: 2, pt: 1 }}>
                        {renderConnectionStatus()}
                    </Box>

                    {/* 메시지 영역 */}
                    <Box
                        sx={{
                            flex: 1,
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '16px',
                            gap: '10px',
                            '&::-webkit-scrollbar': {
                                width: '6px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(0,0,0,0.2)',
                                borderRadius: '4px',
                            },
                        }}
                    >
                        {localMessages.map((msg, idx) => renderMessage(msg, idx))}
                        {loading && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                <CircularProgress size={24} />
                            </Box>
                        )}
                        <div ref={messagesEndRef} />
                    </Box>

                    {/* 입력 영역 */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 16px',
                            borderTop: '1px solid #ddd',
                            background: 'white',
                        }}
                    >
                        <input
                            style={{
                                flex: 1,
                                padding: '10px 14px',
                                fontSize: '14px',
                                border: '1px solid #ccc',
                                borderRadius: '20px',
                                outline: 'none',
                                background: '#f5f5f5',
                            }}
                            placeholder={isConnected ? "메시지를 입력하세요" : "연결 중..."}
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            onCompositionStart={handleCompositionStart}
                            onCompositionEnd={handleCompositionEnd}
                            disabled={!isConnected || loading}
                        />
                        <button
                            style={{
                                marginLeft: '12px',
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: isConnected && !loading ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: isConnected && !loading ? 1 : 0.5,
                            }}
                            onClick={handleSendMessage}
                            disabled={!isConnected || loading}
                        >
                            <Typography sx={{ color: '#0066cc', fontWeight: 600 }}>전송</Typography>
                        </button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Chatbot;