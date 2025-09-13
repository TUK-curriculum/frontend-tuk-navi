import apiClient from '../config/apiClient';
import { apiEndpoints } from '../config/environment';

export interface GraduationPassStatus {
    total: { passed: boolean; actual: number; threshold: number };
    liberal: { passed: boolean; actual: number; threshold: number };
    major: { passed: boolean; actual: number; threshold: number };
    practical: { passed: boolean; actual: number; threshold: number };
}

export interface RequiredMissing {
    missing: Array<{ courseCode: string; name: string; category: string }>;
    countMissing: number;
    totalRequired: number;
}

export interface GraduationOverview {
    pass: GraduationPassStatus;
    missingCourses: RequiredMissing;
    disqualifications: string[];
}

class GraduationRepository {
    async getProgress(): Promise<GraduationPassStatus> {
        const response = await apiClient.get<GraduationPassStatus>(apiEndpoints.graduation.progress);
        return response.data;
    }

    async getRequirements(): Promise<RequiredMissing> {
        const response = await apiClient.get<RequiredMissing>(apiEndpoints.graduation.requirements);
        return response.data;
    }

    async audit(): Promise<GraduationOverview> {
        const response = await apiClient.get<GraduationOverview>(apiEndpoints.graduation.audit);
        return response.data;
    }
}

export const graduationRepository = new GraduationRepository(); 