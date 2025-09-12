import { chatRepository } from "../repositories/ChatRepository";
import { ChatMessage } from "../types/chat-message";
import axios from "axios";

class ChatService {
  private static instance: ChatService;
  private constructor() {}

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  // userId 기반
  history(userId: number, limit = 100): Promise<ChatMessage[]> {
    return chatRepository.history(userId, limit);
  }

  // sessionId 기반
  async historyBySession(sessionId: number, limit = 100): Promise<ChatMessage[]> {
    try {
      const response = await axios.get("http://localhost:8000/chat/history/session", {
        params: { sessionId, limit },
        // withCredentials: true,
      });

      return response.data.chatHistory || [];
    } catch (error) {
      console.error("세션 기반 채팅 기록 조회 실패:", error);
      return [];
    }
  }

  send(content: string, metadata: Record<string, any> = {}): Promise<ChatMessage> {
    return chatRepository.sendMessage(content, metadata);
  }
}

export const chatService = ChatService.getInstance();