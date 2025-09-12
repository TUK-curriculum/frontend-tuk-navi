export interface ChatMessage {
    id: number
    userId: number;
    sender: 'user' | 'assistant';
    content: string;
    msgType?: string;
    metadata?: Record<string, any>;
    timestamp: string;
} 