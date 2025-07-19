export interface IRepository<T> {
    findAll(): Promise<T[]>;
    findById(id: string): Promise<T | null>;
    create(data: Partial<T>): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T>;
    delete(id: string): Promise<boolean>;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface QueryOptions extends PaginationParams {
    filter?: Record<string, any>;
}

export abstract class BaseRepository<T> implements IRepository<T> {
    protected abstract endpoint: string;

    abstract findAll(options?: QueryOptions): Promise<T[]>;
    abstract findById(id: string): Promise<T | null>;
    abstract create(data: Partial<T>): Promise<T>;
    abstract update(id: string, data: Partial<T>): Promise<T>;
    abstract delete(id: string): Promise<boolean>;

    protected buildQueryString(params: QueryOptions = {}): string {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.sort) queryParams.append('sort', params.sort);
        if (params.order) queryParams.append('order', params.order);

        if (params.filter) {
            Object.entries(params.filter).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const queryString = queryParams.toString();
        return queryString ? `?${queryString}` : '';
    }
} 