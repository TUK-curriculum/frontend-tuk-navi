import { chatRepository } from '../repositories/ChatRepository';
import { ChatMessage } from '../types/chat-message';

class ChatService {
    private static instance: ChatService;
    private constructor() { }
    static getInstance(): ChatService {
        if (!ChatService.instance) ChatService.instance = new ChatService();
        return ChatService.instance;
    }

    history(limit = 100): Promise<ChatMessage[]> {
        return chatRepository.history(limit);
    }

    send(content: string, metadata: Record<string, any> = {}): Promise<ChatMessage> {
        return chatRepository.sendMessage(content, metadata);
    }
}

export const chatService = ChatService.getInstance();
import { ChatMessage } from '../types/chat-message';

class ChatService {
    private static instance: ChatService;
    private constructor() { }
    static getInstance(): ChatService {
        if (!ChatService.instance) ChatService.instance = new ChatService();
        return ChatService.instance;
    }

    history(limit = 100): Promise<ChatMessage[]> {
        return chatRepository.history(limit);
    }

    send(content: string, metadata: Record<string, any> = {}): Promise<ChatMessage> {
        return chatRepository.sendMessage(content, metadata);
    }
}

export const chatService = ChatService.getInstance(); 