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
    getProgress() {
        return apiClient.get<GraduationPassStatus>(apiEndpoints.graduation.progress);
    }
    getRequirements() {
        return apiClient.get<RequiredMissing>(apiEndpoints.graduation.requirements);
    }
    audit() {
        return apiClient.get<GraduationOverview>(apiEndpoints.graduation.audit);
    }
}

export const graduationRepository = new GraduationRepository(); 