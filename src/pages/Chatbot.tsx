import React, { useState, useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import MessagesArea from "../components/common/MessagesArea";
import InputBar from "../components/common/InputBar";
import MessageBubble from "../components/common/Message";
import mascot from '../assets/chatbot.png';
import check from "../assets/check.png";
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// 사용자 정보 타입
interface ChatbotUserProfile {
    major: string;
    grade: string;
    credits: number;
    interests: string[];
    goals: string[];
    currentSubjects: string[];
}

// WebSocket 메시지 타입
interface WebSocketMessage {
    message?: string;
    recommended_lectures?: string[];
}

// 기본 메시지 타입
interface Message {
    sender: "user" | "bot";
    text: string;
}

// 세션 관리 API
const getChatHistory = async (): Promise<Message[]> => {
    try {
        const response = await axios.get("http://localhost:8000/chat/history", { withCredentials: true });
        return response.data.chatHistory || [];
    } catch (error) {
        console.error("채팅 기록 조회 실패:", error);
        return [];
    }
};

let socket: WebSocket | null = null;
let messageQueue: string[] = [];

interface ChatbotProps {
    isModal?: boolean;
}

const Chatbot: React.FC<ChatbotProps> = ({ isModal }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    
    const [messages, setMessages] = useState<Message[]>([
        { sender: "bot", text: "안녕하세요! 무엇을 도와드릴까요?" }
    ]);
    const [input, setInput] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isComposing = useRef<boolean>(false);
    const reconnecting = useRef<boolean>(false);

    // WebSocket 연동 함수
    const flushMessageQueue = (): void => {
        while (messageQueue.length > 0 && socket?.readyState === WebSocket.OPEN) {
            const msg = messageQueue.shift();
            if (msg && socket) {
                socket.send(msg);
                console.log("[소켓 전송] 메시지:", msg);
            }
        }
    };

    const connectWebSocket = (): void => {
        if (socket && socket.readyState !== WebSocket.CLOSED) return;

        reconnecting.current = true;
        socket = new WebSocket("ws://localhost:8000/ws");

        socket.onopen = (): void => {
            console.log("WebSocket 연결됨");
            reconnecting.current = false;
            flushMessageQueue();
        };

        socket.onmessage = (event: MessageEvent): void => {
            console.log("WebSocket 메시지 수신:", event.data);
            setLoading(false);
            
            try {
                let messageData = event.data;
                
                // 유니코드 디코딩
                if (typeof messageData === 'string' && messageData.includes('\\u')) {
                    try {
                        // JSON.parse로 파싱하여 유니코드 디코딩
                        const parsed = JSON.parse(messageData);
                        console.log("1차 파싱 완료:", parsed);
                        
                        // message 필드가 유니코드 이스케이프된 경우 추가 디코딩
                        if (parsed.message && typeof parsed.message === 'string' && parsed.message.includes('\\u')) {
                            try {
                                parsed.message = JSON.parse(`"${parsed.message}"`);
                                console.log("메시지 유니코드 디코딩 후:", parsed.message);
                            } catch (e) {
                                console.log("메시지 유니코드 디코딩 실패, 원본 사용");
                            }
                        }
                        
                        messageData = parsed;
                    } catch (e) {
                        console.log("JSON 파싱 실패:", e);
                        // JSON 파싱이 실패하면 원본 그대로 사용
                        messageData = JSON.parse(event.data);
                    }
                } else {
                    // 일반적인 JSON 파싱
                    messageData = JSON.parse(messageData);
                }

                const data: WebSocketMessage = messageData;
                console.log("최종 파싱된 데이터:", data);
                
                if (data.message) {
                    console.log("봇 메시지 추가:", data.message);
                    setMessages(prev => {
                        const newMessages = [...prev, { sender: "bot" as const, text: data.message as string }];
                        console.log("업데이트된 메시지들:", newMessages);
                        return newMessages;
                    });
                } else if (data.recommended_lectures) {
                    const lectures = data.recommended_lectures.join(", ");
                    console.log("추천 강의 메시지 추가:", lectures);
                    setMessages(prev => {
                        const newMessages = [...prev, { sender: "bot" as const, text: `추천 강의: ${lectures}` }];
                        console.log("업데이트된 메시지들:", newMessages);
                        return newMessages;
                    });
                } else {
                    console.log("알 수 없는 메시지 형식:", data);
                    const messageText = JSON.stringify(data);
                    setMessages(prev => [...prev, { sender: "bot" as const, text: messageText }]);
                }
            } catch (error) {
                console.error("메시지 파싱 오류:", error);
                console.error("원본 데이터:", event.data);
                
                // JSON 파싱이 실패하면 원본 텍스트 그대로 출력
                if (typeof event.data === 'string') {
                    setMessages(prev => [...prev, { sender: "bot" as const, text: event.data }]);
                }
            }
        };

        socket.onclose = (): void => {
            console.log("WebSocket 연결 끊김. 재연결 시도");
            setTimeout(connectWebSocket, 500);
        };

        socket.onerror = (error: Event): void => {
            console.error("WebSocket 에러:", error);
            socket?.close();
        };
    };

    const sendMessage = async (): Promise<void> => {
        if (!input.trim()) return;

        const userMessage = input;
        setMessages(prev => [...prev, { sender: "user", text: userMessage }]);
        setInput("");
        
        // 로딩 상태 추가 
        setLoading(true);

        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(userMessage);
            console.log("[소켓 전송] 메시지:", userMessage);
        } else {
            console.warn("소켓 연결 중이거나 끊김 상태. 큐에 저장함.");
            messageQueue.push(userMessage);
            if (!reconnecting.current) connectWebSocket();
        }
    };

    // 이벤트 핸들러
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === "Enter" && !isComposing.current) {
            e.preventDefault();
            sendMessage();
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

    const handleSend = (): void => {
        sendMessage();
    };

    // WebSocket 연결 초기화 및 정리
    useEffect(() => {
        connectWebSocket();

        return () => {
            if (socket) {
                socket.close();
                socket = null;
            }
        };
    }, []);

    // 메시지 변경 시 스크롤 하단으로 이동
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const renderMessage = (msg: Message, idx: number): React.ReactNode => {
        if (msg.sender === "bot") {
            // 조건 선택 메시지인지 확인
            const isConditionMessage = msg.text.includes("조건을 모두 선택해 주세요") || msg.text.includes("조건:");
            
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
                                        onClick={() => {
                                            if (selectedConditions.length === 0) {
                                                alert('최소 하나의 조건을 선택해주세요.');
                                                return;
                                            }
                                            
                                            // 선택된 조건들을 서버로 전송
                                            const conditionsText = selectedConditions.join(", ");
                                            
                                            // 사용자 메시지로 선택 결과 추가
                                            setMessages(prev => [...prev, { 
                                                sender: "user", 
                                                text: `선택한 조건: ${conditionsText}` 
                                            }]);
                                            
                                            // WebSocket으로 전송
                                            if (socket && socket.readyState === WebSocket.OPEN) {
                                                socket.send(conditionsText);
                                                console.log("[조건 선택 전송]:", conditionsText);
                                            } else {
                                                messageQueue.push(conditionsText);
                                                if (!reconnecting.current) connectWebSocket();
                                            }
                                            
                                            // 선택된 조건 초기화 
                                            setSelectedConditions([]);
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
                                    __html: msg.text.replace(/\n/g, "<br>") 
                                }} 
                            />
                        </MessageBubble>
                    </Box>
                );
            }
        } else {
            return (
                <MessageBubble from="user" key={idx}>
                    {msg.text}
                </MessageBubble>
            );
        }
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
                        {messages.map((msg, idx) => renderMessage(msg, idx))}
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
                            placeholder="메시지를 입력하세요"
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            onCompositionStart={handleCompositionStart}
                            onCompositionEnd={handleCompositionEnd}
                        />
                        <button
                            style={{
                                marginLeft: '12px',
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onClick={handleSend}
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