import { BaseRepository, QueryOptions } from './BaseRepository';
import { Note } from '../types/note';
import apiClient from '../config/apiClient';
import { apiEndpoints, environment } from '../config/environment';

export interface NoteCreateDTO extends Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'> { }
export interface NoteUpdateDTO extends Partial<NoteCreateDTO> { }

export class NoteRepository extends BaseRepository<Note> {
    protected endpoint = apiEndpoints.notes.list;

    async findAll(options?: QueryOptions): Promise<Note[]> {
        if (environment.mockMode) {
            const { getMockNotes } = await import('../mocks/users.mock');
            return getMockNotes(options);
        }
        const query = this.buildQueryString(options);
        return apiClient.get<Note[]>(`${this.endpoint}${query}`);
    }

    async findById(id: string): Promise<Note | null> {
        if (environment.mockMode) {
            const { getMockNoteById } = await import('../mocks/users.mock');
            return getMockNoteById(id);
        }
        try {
            return await apiClient.get<Note>(apiEndpoints.notes.detail(id));
        } catch {
            return null;
        }
    }

    async create(data: NoteCreateDTO): Promise<Note> {
        if (environment.mockMode) {
            const { createMockNote } = await import('../mocks/users.mock');
            return createMockNote(data);
        }
        return apiClient.post<Note>(this.endpoint, data);
    }

    async update(id: string, data: NoteUpdateDTO): Promise<Note> {
        if (environment.mockMode) {
            const { updateMockNote } = await import('../mocks/users.mock');
            return updateMockNote(id, data);
        }
        return apiClient.patch<Note>(apiEndpoints.notes.detail(id), data);
    }

    async delete(id: string): Promise<boolean> {
        if (environment.mockMode) {
            const { deleteMockNote } = await import('../mocks/users.mock');
            return deleteMockNote(id);
        }
        await apiClient.delete(apiEndpoints.notes.detail(id));
        return true;
    }
}

export const noteRepository = new NoteRepository(); 