import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { useSeparatedData } from './SeparatedDataContext';

export interface Course {
    id: number;
    name: string;
    type: '전필' | '전선' | '교양';
    credits: number;
    year: 1 | 2 | 3 | 4;
}

export interface WizardData {
    grade?: 1 | 2 | 3 | 4;
    takenCourses: string[];
    interests: string[];
}

interface SetupCtx {
    data: WizardData;
    update: (partial: Partial<WizardData>) => void;
    reset: () => void;
}

const SetupContext = createContext<SetupCtx | null>(null);

export const SetupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { profile, updateProfile, onboarding, updateOnboarding } = useSeparatedData();

    // 분리된 데이터에서 초기 데이터 가져오기
    const initialData: WizardData = {
        takenCourses: [],  // completedCourses를 통해 관리
        interests: profile?.interests || []
    };
    const [data, setData] = useState<WizardData>(initialData);

    const update = (partial: Partial<WizardData>) => {
        setData(prev => {
            const next = { ...prev, ...partial };

            // SeparatedDataContext를 통해 업데이트
            if (partial.interests && profile) {
                const updatedProfile = { ...profile, interests: partial.interests };
                updateProfile(updatedProfile);
            }

            if (partial.interests && onboarding) {
                const updatedOnboarding = { ...onboarding, interests: partial.interests };
                updateOnboarding(updatedOnboarding);
            }

            return next;
        });
    };

    const reset = () => {
        setData({ takenCourses: [], interests: [] });

        // SeparatedDataContext를 통해 초기화
        if (profile) {
            const updatedProfile = { ...profile, interests: [] };
            updateProfile(updatedProfile);
        }

        if (onboarding) {
            const updatedOnboarding = { ...onboarding, interests: [] };
            updateOnboarding(updatedOnboarding);
        }
    };

    return (
        <SetupContext.Provider value={{ data, update, reset }}>
            {children}
        </SetupContext.Provider>
    );
};

export const useSetup = () => {
    const ctx = useContext(SetupContext);
    if (!ctx) throw new Error('useSetup must be used within SetupProvider');
    return ctx;
};
