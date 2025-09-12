export interface Notification {
    id: number;
    userId: number;
    title: string;
    message: string;
    notifType?: string;
    isRead: boolean;
    actionUrl?: string;
    timestamp: string;
} 