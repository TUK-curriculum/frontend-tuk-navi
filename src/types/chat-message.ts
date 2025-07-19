export interface ChatMessage {
    id: string;
    userId: string;
    sender: 'user' | 'assistant';
    content: string;
    msgType?: string;
    metadata?: Record<string, any>;
    timestamp: string;
} 