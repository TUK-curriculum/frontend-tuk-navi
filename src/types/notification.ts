export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    notifType?: string;
    isRead: boolean;
    actionUrl?: string;
    timestamp: string;
} 