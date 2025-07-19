import { graduationRepository, GraduationPassStatus, RequiredMissing, GraduationOverview } from '../repositories/GraduationRepository';

class GraduationService {
    private static instance: GraduationService;
    private constructor() { }
    static getInstance(): GraduationService {
        if (!GraduationService.instance) GraduationService.instance = new GraduationService();
        return GraduationService.instance;
    }

    getProgress(): Promise<GraduationPassStatus> {
        return graduationRepository.getProgress();
    }

    getRequirements(): Promise<RequiredMissing> {
        return graduationRepository.getRequirements();
    }

    audit(): Promise<GraduationOverview> {
        return graduationRepository.audit();
    }
}

export const graduationService = GraduationService.getInstance();


