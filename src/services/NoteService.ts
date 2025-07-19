import { Note } from '../types/note';
import { noteRepository, NoteCreateDTO, NoteUpdateDTO } from '../repositories/NoteRepository';
import { ApiError, ErrorCode } from '../errors/ApiError';

export class NoteService {
    private static instance: NoteService;
    private constructor() { }
    static getInstance(): NoteService {
        if (!NoteService.instance) NoteService.instance = new NoteService();
        return NoteService.instance;
    }

    async getAll(): Promise<Note[]> {
        try {
            return await noteRepository.findAll();
        } catch (e) {
            console.error(e);
            throw new ApiError(ErrorCode.SERVER_ERROR, '메모를 불러오는데 실패했습니다');
        }
    }

    create(data: NoteCreateDTO): Promise<Note> {
        return noteRepository.create(data);
    }

    update(id: string, data: NoteUpdateDTO): Promise<Note> {
        return noteRepository.update(id, data);
    }

    delete(id: string): Promise<boolean> {
        return noteRepository.delete(id);
    }
}

export const noteService = NoteService.getInstance();
import { noteRepository, NoteCreateDTO, NoteUpdateDTO } from '../repositories/NoteRepository';
import { ApiError, ErrorCode } from '../errors/ApiError';

export class NoteService {
    private static instance: NoteService;
    private constructor() { }
    static getInstance(): NoteService {
        if (!NoteService.instance) NoteService.instance = new NoteService();
        return NoteService.instance;
    }

    async getAll(): Promise<Note[]> {
        try {
            return await noteRepository.findAll();
        } catch (e) {
            console.error(e);
            throw new ApiError(ErrorCode.SERVER_ERROR, '메모를 불러오는데 실패했습니다');
        }
    }

    create(data: NoteCreateDTO): Promise<Note> {
        return noteRepository.create(data);
    }

    update(id: string, data: NoteUpdateDTO): Promise<Note> {
        return noteRepository.update(id, data);
    }

    delete(id: string): Promise<boolean> {
        return noteRepository.delete(id);
    }
}

export const noteService = NoteService.getInstance(); 