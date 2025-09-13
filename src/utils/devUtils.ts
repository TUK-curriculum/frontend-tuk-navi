import { compareDataStructures, isMigrationRequired } from './migrationUtils';
import { getCurrentUserId, exportUserData, deleteUserData, initializeUserData } from './separatedDataManager';
import { periodMap } from '../data/periodMap';

// 데이터 초기화
const resetData = async () => {
    console.warn('모든 데이터를 초기화합니다...');
    const userId = getCurrentUserId();
    if (!userId) {
        console.log('로그인된 사용자가 없습니다.');
        return;
    }

    const confirm = window.confirm(`정말로 ${userId}의 모든 데이터를 초기화하시겠습니까?`);
    if (!confirm) {
        console.log('데이터 초기화가 취소되었습니다.');
        return;
    }

    deleteUserData(userId);
    initializeUserData(userId);
    console.log('데이터 초기화 완료! 페이지를 새로고침하세요.');
};

// 개발자 도구에서 사용할 수 있는 전역 함수들
declare global {
    interface Window {
        TUK_NAVI_DEV: {
            resetData: () => Promise<void>;
            checkStatus: () => void;
            addSampleCompletedCourse: () => Promise<void>;
            addSampleTimetableCourse: () => Promise<void>;
            showAllData: () => void;
            testAccountSwitch: () => void;
            checkUserDataStatus: () => void;
            simulateLogin: (email: string) => void;
            simulateLogout: () => void;
            testTimetableRendering: () => void;
            compareDataStructures: (userId: number) => void;
            exportUserData: (userId: number) => string;
        };
    }
}

// 샘플 이수과목 추가
const addSampleCompletedCourse = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
        console.log('로그인된 사용자가 없습니다.');
        return;
    }

    console.log('샘플 이수과목 추가는 새로운 구조에서는 직접 데이터를 추가해야 합니다.');
    console.log('사용 예시: 페이지에서 직접 과목을 추가하거나, 개발자 도구에서 데이터를 직접 조작하세요.');
};

// 샘플 시간표 과목 추가
const addSampleTimetableCourse = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
        console.log('로그인된 사용자가 없습니다.');
        return;
    }

    console.log('샘플 시간표 과목 추가는 새로운 구조에서는 직접 데이터를 추가해야 합니다.');
    console.log('사용 예시: 시간표 페이지에서 직접 과목을 추가하세요.');
};

// 모든 데이터 표시
const showAllData = () => {
    const userId = getCurrentUserId();
    if (!userId) {
        console.log('로그인된 사용자가 없습니다.');
        return;
    }

    console.log('현재 사용자의 모든 데이터:');
    const allData = exportUserData(userId);
    console.log(JSON.parse(allData));
};

// 계정 전환 테스트
const testAccountSwitch = () => {
    console.warn('testAccountSwitch: 향후 useData 기반으로 변경될 예정입니다.');
    console.log('계정 전환 테스트 시작...');

    // 테스트 계정들
    const testAccounts = [
        { email: 'user1@test.com', name: '테스트 사용자 1' },
        { email: 'user2@test.com', name: '테스트 사용자 2' },
        { email: 'user3@test.com', name: '테스트 사용자 3' }
    ];

    // 각 계정별로 샘플 데이터 생성
    testAccounts.forEach(async (account) => {
        // 사용자별 이수과목 데이터
        const userCompletedCourses = [
            { id: `${account.email}_course1`, name: `${account.name}의 이수과목 1`, credits: 3, type: '전공필수', isCompleted: true },
            { id: `${account.email}_course2`, name: `${account.name}의 이수과목 2`, credits: 3, type: '전공선택', isCompleted: true }
        ];
        // useData를 통해 저장하도록 변경 예정
        console.warn('localStorage 직접 접근은 더 이상 사용되지 않습니다. useData를 사용하세요.');

        // 사용자별 시간표 데이터
        const userTimetableCourses = [
            { id: `${account.email}_timetable1`, name: `${account.name}의 시간표 과목 1`, type: 'elective', credits: 3, professor: '김교수', day: 'monday', time: '09:00-11:00', room: 'A101' },
            { id: `${account.email}_timetable2`, name: `${account.name}의 시간표 과목 2`, type: 'required', credits: 3, professor: '이교수', day: 'tuesday', time: '13:00-15:00', room: 'B202' }
        ];
        // useData를 통해 저장하도록 변경 예정
        console.warn('localStorage 직접 접근은 더 이상 사용되지 않습니다. useData를 사용하세요.');
    });

    console.log('테스트 계정 데이터 생성 완료');
    console.log('테스트 계정들:', testAccounts.map(acc => acc.email));
    console.log('사용법: useAuth를 통해 계정 전환 후 페이지 새로고침');
};

// 사용자별 데이터 상태 확인
const checkUserDataStatus = () => {
    console.log('[checkUserDataStatus] 현재 사용자 데이터 상태 확인');
    const userId = getCurrentUserId();
    if (!userId) {
        console.log('로그인된 사용자가 없습니다.');
        return;
    }

    // 마이그레이션 필요 여부 확인
    if (isMigrationRequired()) {
        console.log('마이그레이션이 필요한 기존 데이터가 있습니다.');
    } else {
        console.log('모든 데이터가 새로운 분리 구조로 저장되어 있습니다.');
    }

    // 현재 사용자의 데이터 구조 비교
    console.log(`사용자 ${userId}의 데이터 구조 비교:`);
    compareDataStructures(userId);
};

// 로그인 시뮬레이션
const simulateLogin = (email: string) => {
    console.warn('simulateLogin: 향후 useAuth 기반으로 변경될 예정입니다.');
    console.log(`로그인 시뮬레이션: ${email}`);
    // useAuth를 통해 로그인하도록 변경 예정
    console.warn('localStorage 직접 접근은 더 이상 사용되지 않습니다. useAuth를 사용하세요.');
    console.log('로그인 완료. 페이지를 새로고침하세요.');
};

// 로그아웃 시뮬레이션
const simulateLogout = () => {
    console.warn('simulateLogout: 향후 useAuth 기반으로 변경될 예정입니다.');
    console.log('로그아웃 시뮬레이션');
    // useAuth를 통해 로그아웃하도록 변경 예정
    console.warn('localStorage 직접 접근은 더 이상 사용되지 않습니다. useAuth를 사용하세요.');
    console.log('로그아웃 완료. 페이지를 새로고침하세요.');
};

// 시간표 렌더링 테스트
const testTimetableRendering = () => {
    console.log('시간표 렌더링 테스트 시작...');

    // 테스트 데이터 생성
    const testCourses = [
        { id: 'test1', name: '테스트 과목 1', startPeriod: '1교시', endPeriod: '2교시', day: 'monday', credits: 3, room: 'A101', type: 'required' },
        { id: 'test2', name: '테스트 과목 2', startPeriod: '3교시', endPeriod: '5교시', day: 'tuesday', credits: 3, room: 'B202', type: 'elective' },
        { id: 'test3', name: '테스트 과목 3', startPeriod: 7, endPeriod: 8, day: 'wednesday', credits: 3, room: 'C303', type: 'liberal' },
        { id: 'test4', name: '테스트 과목 4', startPeriod: '9교시', endPeriod: '12교시', day: 'thursday', credits: 3, room: 'D404', type: 'required' }
    ];

    // 교시 파싱 테스트
    testCourses.forEach(course => {
        const startIdx = parseInt(course.startPeriod.toString().replace(/\D/g, '')) - 1;
        const endIdx = parseInt(course.endPeriod.toString().replace(/\D/g, '')) - 1;
        const rowSpan = endIdx - startIdx + 1;

        console.table({
            name: course.name,
            startPeriod: course.startPeriod,
            endPeriod: course.endPeriod,
            startIdx,
            endIdx,
            rowSpan,
            isValid: startIdx >= 0 && endIdx >= startIdx
        });
    });

    console.log('시간표 렌더링 테스트 완료');
};

function mergePeriods(startP: number, endP: number) {
    return {
        start: periodMap[startP].start,
        end: periodMap[endP].end,
    };
}

// Dummy setupDevTools export for compatibility
export function setupDevTools() {
    // 개발 환경에서만 개발자 도구 활성화
    if (import.meta.env.NODE_ENV === 'development') {
        window.TUK_NAVI_DEV = {
            resetData,
            checkStatus: checkUserDataStatus,
            addSampleCompletedCourse,
            addSampleTimetableCourse,
            showAllData,
            testAccountSwitch,
            checkUserDataStatus,
            simulateLogin,
            simulateLogout,
            testTimetableRendering,
            compareDataStructures: (userId: number) => {
                compareDataStructures(userId);
            },
            exportUserData: (userId: number) => {
                return exportUserData(userId);
            }
        };

        console.log('TUK-NAVI 개발자 도구가 활성화되었습니다.');
        console.log('사용 가능한 명령어: window.TUK_NAVI_DEV');
        console.log('데이터 구조 비교: window.TUK_NAVI_DEV.compareDataStructures("user@email.com")');
        console.log('데이터 내보내기: window.TUK_NAVI_DEV.exportUserData("user@email.com")');
    }
} 