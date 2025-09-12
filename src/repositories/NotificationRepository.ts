import { BaseRepository } from './BaseRepository';
import { Notification } from '../types/notification';
import apiClient from '../config/apiClient';
import { apiEndpoints, environment } from '../config/environment';

export class NotificationRepository extends BaseRepository<Notification> {
    protected endpoint = apiEndpoints.notifications.list;

    async findAll(): Promise<Notification[]> {
        if (environment.mockMode) {
            const { getMockNotifications } = await import('../mocks/users.mock');
            return getMockNotifications();
        }
        return apiClient.get<Notification[]>(this.endpoint);
    }

    // Not implementing other CRUD; only read status
    async findById(id: number): Promise<Notification | null> { return null; }
    async create(): Promise<Notification> { throw new Error('Not implemented'); }
    async update(id: number, data: Partial<Notification>): Promise<Notification> { throw new Error('Not implemented'); }
    async delete(id: number): Promise<boolean> { throw new Error('Not implemented'); }

    async markRead(ids: string[]): Promise<void> {
        if (!ids.length) return;
        await apiClient.put(apiEndpoints.notifications.readBulk, { ids });
    }

    async markReadSingle(id: number): Promise<void> {
        await apiClient.put(apiEndpoints.notifications.read(id));
    }
}

export const notificationRepository = new NotificationRepository(); 