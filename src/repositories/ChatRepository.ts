import axios from "axios";
import { ChatMessage } from "../types/chat-message";

class ChatRepository {
  async history(userId: number, limit = 100): Promise<ChatMessage[]> {
    const res = await axios.get("http://localhost:8000/chat/history", {
      params: { userId, limit },
      withCredentials: true,
    });
    return res.data.chatHistory || [];
  }

  async historyBySession(sessionId: number, limit = 100): Promise<ChatMessage[]> {
    const res = await axios.get("http://localhost:8000/chat/history/session", {
      params: { sessionId, limit },
      withCredentials: true,
    });
    return res.data.chatHistory || [];
  }

  async sendMessage(content: string, metadata: Record<string, any> = {}): Promise<ChatMessage> {
    const res = await axios.post(
      "http://localhost:8000/chat/send",
      { content, metadata },
      { withCredentials: true }
    );
    return res.data;
  }
}

export const chatRepository = new ChatRepository();