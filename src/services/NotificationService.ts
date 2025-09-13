import { notificationRepository } from '../repositories/NotificationRepository';
import { Notification } from '../types/notification';

export class NotificationService {
    private static instance: NotificationService;
    private constructor() { }
    static getInstance(): NotificationService {
        if (!NotificationService.instance) NotificationService.instance = new NotificationService();
        return NotificationService.instance;
    }

    getAll(): Promise<Notification[]> {
        return notificationRepository.findAll();
    }

    markRead(ids: string[]): Promise<void> {
        return notificationRepository.markRead(ids);
    }

    markReadSingle(id: number): Promise<void> {
        return notificationRepository.markReadSingle(id);
    }
}

export const notificationService = NotificationService.getInstance(); 