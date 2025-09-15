1
import React, { useState, useEffect, useRef } from "react";
2
import { Box, Typography, Alert, CircularProgress } from "@mui/material";
3
import MessageBubble from "../components/common/Message";
4
import mascot from '../assets/chatbot.png';
5
import check from "../assets/check.png";
6
import { useWebSocket } from '../contexts/WebSocketContext';
7
import { chatService } from "../services/ChatService";
8​
9
// 기본 메시지 타입
10
interface Message {
11
 sender: "user" | "assistant";
12
 content: string;
13
 timestamp?: string;
14
}
15​
16
interface ChatbotProps {
17
 isModal?: boolean;
18
}
19​
20
const Chatbot: React.FC<ChatbotProps> = ({ isModal }) => {
21
 const navigate = useNavigate();
22
 const location = useLocation();
23
 const { user } = useAuth();
24​
25
 const [messages, setMessages] = useState<Message[]>([
26
 { sender: "bot", text: "안녕하세요! 무엇을 도와드릴까요?" }
27
 ]);
28
 const [input, setInput] = useState<string>("");
29
 const [loading, setLoading] = useState(false);
30
 const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
31
 const [localMessages, setLocalMessages] = useState<Message[]>([]);
32
 const messagesEndRef = useRef<HTMLDivElement>(null);
33
 const isComposing = useRef<boolean>(false);
34​
35
 // 글로벌 메시지와 로컬 메시지 동기화
36
 useEffect(() => {
37
 setLocalMessages(globalMessages);
38
 }, [globalMessages]);
39​
40
 // 세션 ID가 변경되면 채팅 기록 로드
41
 useEffect(() => {
42
 const loadHistory = async () => {
43
 if (!sessionId) {
44
 console.log("[DEBUG] sessionId 없음 → API 호출 스킵");
45
 return;
46
 }
47
 try {
48
 console.log(`[DEBUG] 채팅 기록 로드 시도: sessionId=${sessionId}`);
49
 const history = await chatService.getChatHistory(sessionId);
50
 console.log("[DEBUG] 채팅 기록 로드 성공:", history);
51
 if (history && history.length > 0) {
52
 addMessage(history[history.length - 1]);
53
 }
54
 } catch (error) {
55
 console.error("채팅 기록 로드 실패:", error);
56
 }
57
 };
58
 loadHistory();
59
 }, [sessionId, addMessage]);
60​