import { ChatMessage } from '../types/chat-message';
import apiClient from '../config/apiClient';
import { apiEndpoints, environment } from '../config/environment';

export class ChatRepository {
    async history(limit = 100): Promise<ChatMessage[]> {
        if (environment.mockMode) {
            const { getMockChatHistory } = await import('../mocks/users.mock');
            return getMockChatHistory(limit);
        }
        const query = `?limit=${limit}`;
        return apiClient.get<ChatMessage[]>(`${apiEndpoints.chat.history}${query}`);
    }

    async sendMessage(content: string, metadata: Record<string, any> = {}): Promise<ChatMessage> {
        if (environment.mockMode) {
            const { createMockChatMessage } = await import('../mocks/users.mock');
            return createMockChatMessage(content);
        }
        return apiClient.post<ChatMessage>(apiEndpoints.chat.messages, { content, metadata });
    }
}

export const chatRepository = new ChatRepository(); 