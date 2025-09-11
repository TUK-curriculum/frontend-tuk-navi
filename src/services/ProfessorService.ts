import apiClient from '../config/apiClient';
import { Professor, PreferredProfessor, ProfessorLecture } from '../types/professor';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

class ProfessorService {
  // 교수 목록 조회
  async getProfessors(search?: string): Promise<Professor[]> {
    try {
      const params = search ? { search } : {};
      const response = await apiClient.get<ApiResponse<Professor[]>>('/professors', { params });
      return response.data.data || [];
    } catch (error) {
      console.error('교수 목록 조회 실패:', error);
      throw new Error('교수 목록을 불러올 수 없습니다.');
    }
  }

  // 특정 교수의 담당 과목 조회
  async getProfessorLectures(professorId: number): Promise<ProfessorLecture[]> {
    try {
      const response = await apiClient.get<ApiResponse<ProfessorLecture[]>>(`/professors/${professorId}/lectures`);
      return response.data.data || [];
    } catch (error) {
      console.error('교수 담당 과목 조회 실패:', error);
      throw new Error('담당 과목을 불러올 수 없습니다.');
    }
  }

  // 사용자 선호교수 목록 조회
  async getPreferredProfessors(): Promise<PreferredProfessor[]> {
    try {
      const response = await apiClient.get<ApiResponse<PreferredProfessor[]>>('/professors/preferred');
      return response.data.data || [];
    } catch (error) {
      console.error('선호교수 목록 조회 실패:', error);
      throw new Error('선호교수 목록을 불러올 수 없습니다.');
    }
  }

  // 선호교수 추가
  async addPreferredProfessor(professorId: number): Promise<void> {
    try {
      await apiClient.post<ApiResponse<any>>('/professors/preferred', { professorId });
    } catch (error: any) {
      console.error('선호교수 추가 실패:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('선호교수 추가에 실패했습니다.');
    }
  }

  // 선호교수 삭제
  async removePreferredProfessor(preferredId: number): Promise<void> {
    try {
      await apiClient.delete<ApiResponse<any>>(`/professors/preferred/${preferredId}`);
    } catch (error) {
      console.error('선호교수 삭제 실패:', error);
      throw new Error('선호교수 삭제에 실패했습니다.');
    }
  }
}

export const professorService = new ProfessorService();