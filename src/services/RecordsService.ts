import apiClient from '../config/apiClient';

class RecordsService {
    private readonly baseUrl = '/records';

    // 학기별 수강내역 조회
    async getRecordsBySemester(semester: string) {
        const url = `${this.baseUrl}/semester/${encodeURIComponent(semester)}`;
        console.log('[RecordsService] GET:', url);

        const response = await apiClient.get<{ data: any }>(url);
        return response.data.data;
    }

    // 성적 수정
    async updateRecord(recordId: number, data: any) {
        const url = `${this.baseUrl}/${recordId}`;
        console.log('[RecordsService] PUT:', url, data);

        const response = await apiClient.put(url, data);
        return response.data;
    }
}

export default new RecordsService();