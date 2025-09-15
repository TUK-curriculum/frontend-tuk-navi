import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// WebSocket 메시지 타입
interface WebSocketMessage {
    type?: string;
    sessionId?: number;
    message?: string;
    recommended_lectures?: string[];
}

// 기본 메시지 타입
interface Message {
    sender: "user" | "assistant";
    content: string;
    timestamp?: string;
}

interface WebSocketContextType {
    socket: WebSocket | null;
    isConnected: boolean;
    connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
    sessionId: number | null;
    messages: Message[];
    sendMessage: (message: string) => Promise<void>;
    addMessage: (message: Message) => void;
    clearMessages: () => void;
    reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (context === undefined) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};

interface WebSocketProviderProps {
    children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
    const [sessionId, setSessionId] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 5;
    const messageQueueRef = useRef<string[]>([]);

    // 웹소켓 연결 함수
    const connectWebSocket = React.useCallback(() => {
        // 이미 연결된 소켓이 있고 열려있으면 종료
        if (socket && socket.readyState !== WebSocket.CLOSED) {
            socket.close();
        }

        if (!isAuthenticated || !user) {
            console.log('[WebSocket] 인증되지 않은 사용자 - 연결 스킵');
            return;
        }

        setConnectionState('connecting');
        
        const token = localStorage.getItem("accessToken");
        const url = token 
            ? `ws://localhost:8000/ws?token=${token}`
            : `ws://localhost:8000/ws`;

        console.log('[WebSocket] 연결 시도:', url);
        
        const newSocket = new WebSocket(url);

        newSocket.onopen = () => {
            console.log('[WebSocket] 연결 성공');
            setIsConnected(true);
            setConnectionState('connected');
            reconnectAttemptsRef.current = 0;
            
            // 대기 중인 메시지 전송
            while (messageQueueRef.current.length > 0 && newSocket.readyState === WebSocket.OPEN) {
                const queuedMessage = messageQueueRef.current.shift();
                if (queuedMessage) {
                    newSocket.send(queuedMessage);
                    console.log('[WebSocket] 큐에서 메시지 전송:', queuedMessage);
                }
            }
        };

        newSocket.onmessage = (event: MessageEvent) => {
            try {
                const data: WebSocketMessage = JSON.parse(event.data);
                console.log('[WebSocket] 메시지 수신:', data);

                if (data.type === "session" && data.sessionId) {
                    console.log('[WebSocket] 세션 ID 수신:', data.sessionId);
                    setSessionId(data.sessionId);
                    return;
                }

                // 메시지 처리 및 상태 업데이트
                if (data.message) {
                    const newMessage: Message = {
                        sender: "assistant",
                        content: data.message,
                        timestamp: new Date().toISOString()
                    };
                    setMessages(prev => [...prev, newMessage]);
                } else if (data.recommended_lectures) {
                    const lectures = data.recommended_lectures.join(", ");
                    const newMessage: Message = {
                        sender: "assistant",
                        content: `추천 강의: ${lectures}`,
                        timestamp: new Date().toISOString()
                    };
                    setMessages(prev => [...prev, newMessage]);
                }
            } catch (error) {
                console.error('[WebSocket] 메시지 파싱 오류:', error);
            }
        };

        newSocket.onclose = (event) => {
            console.log('[WebSocket] 연결 끊김:', event.code, event.reason);
            setIsConnected(false);
            setConnectionState('disconnected');
            
            // 인증된 사용자이고 최대 재연결 시도 횟수를 초과하지 않았다면 재연결 시도
            if (isAuthenticated && reconnectAttemptsRef.current < maxReconnectAttempts) {
                const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000); // 지수 백오프
                console.log(`[WebSocket] ${delay}ms 후 재연결 시도 (${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
                
                reconnectTimeoutRef.current = setTimeout(() => {
                    reconnectAttemptsRef.current++;
                    connectWebSocket();
                }, delay);
            }
        };

        newSocket.onerror = (error) => {
            console.error('[WebSocket] 연결 오류:', error);
            setConnectionState('error');
        };

        setSocket(newSocket);
    }, [isAuthenticated, user, socket]);

    // 메시지 전송 함수
    const sendMessage = React.useCallback(async (message: string): Promise<void> => {
        if (!message.trim()) return;

        // 사용자 메시지를 즉시 상태에 추가
        const userMessage: Message = {
            sender: "user",
            content: message,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);

        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(message);
            console.log('[WebSocket] 메시지 전송:', message);
        } else {
            console.warn('[WebSocket] 연결되지 않음 - 메시지 큐에 저장');
            messageQueueRef.current.push(message);
            
            // 연결되지 않았다면 재연결 시도
            if (!isConnected && isAuthenticated) {
                connectWebSocket();
            }
        }
    }, [socket, isConnected, isAuthenticated, connectWebSocket]);

    // 메시지 추가 함수 (외부에서 직접 추가할 때)
    const addMessage = React.useCallback((message: Message) => {
        setMessages(prev => [...prev, message]);
    }, []);

    // 메시지 초기화 함수
    const clearMessages = React.useCallback(() => {
        setMessages([]);
    }, []);

    // 수동 재연결 함수
    const reconnect = React.useCallback(() => {
        reconnectAttemptsRef.current = 0;
        connectWebSocket();
    }, [connectWebSocket]);

    // 인증 상태 변경 시 웹소켓 연결/해제
    useEffect(() => {
        if (isAuthenticated && user) {
            console.log('[WebSocket] 사용자 인증됨 - 웹소켓 연결');
            connectWebSocket();
        } else {
            console.log('[WebSocket] 사용자 인증 해제됨 - 웹소켓 연결 해제');
            if (socket) {
                socket.close();
                setSocket(null);
            }
            setIsConnected(false);
            setConnectionState('disconnected');
            setSessionId(null);
            setMessages([]);
            
            // 재연결 타이머 정리
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
        }

        // 컴포넌트 언마운트 시 정리
        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [isAuthenticated, user]);

    // 페이지 가시성 변경 시 연결 관리
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                console.log('[WebSocket] 페이지 숨김 - 연결 유지');
                // 페이지가 숨겨져도 연결을 유지 (백그라운드 알림 등을 위해)
            } else {
                console.log('[WebSocket] 페이지 표시');
                // 페이지가 다시 표시되었을 때 연결 상태 확인
                if (isAuthenticated && !isConnected) {
                    connectWebSocket();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isAuthenticated, isConnected, connectWebSocket]);

    const value: WebSocketContextType = {
        socket,
        isConnected,
        connectionState,
        sessionId,
        messages,
        sendMessage,
        addMessage,
        clearMessages,
        reconnect
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};