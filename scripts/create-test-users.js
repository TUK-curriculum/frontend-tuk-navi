// scripts/create-test-users.js
// 테스트용 계정들을 생성하는 스크립트

const testUsers = [
    {
        email: 'maria@example.com',
        name: '마리아',
        password: 'password123',
        profile: {
            name: '마리아',
            email: 'maria@example.com',
            studentId: '2024000001',
            major: '컴퓨터공학부',
            grade: 2,
            semester: 3,
            phone: '010-1234-5678',
            nickname: '마리아',
            interests: ['웹개발', '알고리즘', '데이터베이스'],
            avatar: ''
        },
        graduationInfo: {
            totalCredits: 45,
            majorRequired: 25,
            majorElective: 10,
            generalRequired: 15,
            generalElective: 5,
            totalRequired: 130,
            progress: 34.6,
            remainingCredits: 85
        },
        curriculum: {
            type: '백엔드 트랙',
            subjects: [
                { id: 'CS101', name: '프로그래밍 기초', code: 'CS101', credits: 3, type: '전공필수', semester: 1, isCompleted: true, completedAt: '2024-01-15T00:00:00.000Z' },
                { id: 'CS102', name: '자료구조', code: 'CS102', credits: 3, type: '전공필수', semester: 2, isCompleted: true, completedAt: '2024-01-15T00:00:00.000Z' }
            ],
            completedSubjects: ['CS101', 'CS102'],
            currentSemester: 3,
            appliedDate: '2024-01-15T00:00:00.000Z',
            track: '백엔드'
        },
        schedule: {
            currentSemester: '2024-1',
            timetable: [
                {
                    id: 'tt1',
                    subjectId: 'CS201',
                    subjectName: '웹프로그래밍',
                    day: 'monday',
                    startPeriod: 1,
                    endPeriod: 2,
                    startTime: '09:00',
                    endTime: '10:30',
                    room: 'A101',
                    instructor: '김교수',
                    color: '#2196F3'
                }
            ],
            customEvents: []
        },
        notes: [
            {
                id: 'note1',
                title: '오늘 수업 복습하기',
                content: '웹프로그래밍 수업 내용 정리\n- HTML/CSS 기초\n- JavaScript 문법',
                category: '학습',
                tags: ['웹개발', '복습'],
                createdAt: '2024-01-15T10:00:00.000Z',
                updatedAt: '2024-01-15T10:00:00.000Z',
                isPinned: true
            }
        ],
        messages: [
            {
                id: 'msg1',
                content: '안녕하세요! 졸업 요건에 대해 궁금한 점이 있습니다.',
                timestamp: '2024-01-15T10:00:00.000Z',
                sender: 'user',
                type: 'text'
            }
        ],
        onboarding: {
            isCompleted: true,
            currentStep: 3,
            completedSteps: ['profile', 'interests', 'curriculum'],
            setupDate: '2024-01-15T00:00:00.000Z',
            interests: ['웹개발', '알고리즘', '데이터베이스']
        },
        settings: {
            theme: 'light',
            notifications: true,
            autoSave: true,
            language: 'ko',
            timezone: 'Asia/Seoul',
            accessibility: {
                highContrast: false,
                reduceMotion: false,
                fontSize: 'medium'
            }
        },
        completedCourses: [
            { id: 'CS101', name: '프로그래밍 기초', code: 'CS101', credits: 3, type: '전공필수', semester: 1, isCompleted: true, completedAt: '2024-01-15T00:00:00.000Z' },
            { id: 'CS102', name: '자료구조', code: 'CS102', credits: 3, type: '전공필수', semester: 2, isCompleted: true, completedAt: '2024-01-15T00:00:00.000Z' }
        ],
        timetableCourses: [
            { id: 'CS201', name: '웹프로그래밍', code: 'CS201', credits: 3, type: '전공필수', semester: 3, isCompleted: false }
        ],
        graduationRequirements: [],
        courses: []
    },
    {
        email: 'jinhan@naver.com',
        name: '진한',
        password: 'password123',
        profile: {
            nickname: '진한',
            studentId: '2024000002',
            major: '소프트웨어공학과',
            grade: '3학년',
            interests: ['프론트엔드', 'React', 'TypeScript']
        },
        graduationInfo: {
            totalCredits: 78,
            majorRequired: 45,
            majorElective: 15,
            generalRequired: 25,
            generalElective: 8,
            totalRequired: 130
        },
        curriculum: {
            type: '프론트엔드 트랙',
            subjects: [
                { id: 'CS201', name: '웹프로그래밍', credit: 3, type: '전공필수' },
                { id: 'CS202', name: '알고리즘', credit: 3, type: '전공필수' },
                { id: 'CS203', name: '데이터베이스', credit: 3, type: '전공필수' }
            ],
            appliedDate: '2024-01-10T00:00:00.000Z'
        },
        schedule: {
            '2024-1': [
                { id: 'CS201', name: '웹프로그래밍', credit: 3, type: '전공필수' },
                { id: 'CS202', name: '알고리즘', credit: 3, type: '전공필수' },
                { id: 'CS203', name: '데이터베이스', credit: 3, type: '전공필수' }
            ]
        },
        memos: {
            'memo1': {
                id: 'memo1',
                content: 'React 프로젝트 아이디어 정리',
                createdAt: '2024-01-10T14:00:00.000Z',
                updatedAt: '2024-01-10T14:00:00.000Z'
            },
            'memo2': {
                id: 'memo2',
                content: '포트폴리오 업데이트 계획',
                createdAt: '2024-01-12T16:00:00.000Z',
                updatedAt: '2024-01-12T16:00:00.000Z'
            }
        },
        messages: [
            {
                id: 'msg1',
                content: '포트폴리오 프로젝트 추천해주세요!',
                timestamp: '2024-01-10T14:00:00.000Z',
                sender: 'user'
            },
            {
                id: 'msg2',
                content: 'React와 TypeScript를 활용한 웹 애플리케이션을 추천드립니다.',
                timestamp: '2024-01-10T14:05:00.000Z',
                sender: 'assistant'
            }
        ],
        settings: {
            theme: 'dark',
            notifications: true,
            autoSave: true
        }
    },
    {
        email: 'minseo@gmail.com',
        name: '민서',
        password: 'password123',
        profile: {
            nickname: '민서',
            studentId: '2024000003',
            major: '인공지능학과',
            grade: '1학년',
            interests: ['머신러닝', '딥러닝', 'Python']
        },
        graduationInfo: {
            totalCredits: 18,
            majorRequired: 9,
            majorElective: 3,
            generalRequired: 12,
            generalElective: 3,
            totalRequired: 130
        },
        curriculum: {
            type: 'AI 트랙',
            subjects: [
                { id: 'AI101', name: '인공지능 기초', credit: 3, type: '전공필수' }
            ],
            appliedDate: '2024-01-20T00:00:00.000Z'
        },
        schedule: {
            '2024-1': [
                { id: 'AI101', name: '인공지능 기초', credit: 3, type: '전공필수' },
                { id: 'MATH101', name: '미적분학', credit: 3, type: '교양필수' },
                { id: 'ENG101', name: '영어', credit: 3, type: '교양필수' }
            ]
        },
        memos: {
            'memo1': {
                id: 'memo1',
                content: 'Python 기초 문법 복습',
                createdAt: '2024-01-20T09:00:00.000Z',
                updatedAt: '2024-01-20T09:00:00.000Z'
            }
        },
        messages: [
            {
                id: 'msg1',
                content: '머신러닝 입문을 위한 추천 강의가 있나요?',
                timestamp: '2024-01-20T09:00:00.000Z',
                sender: 'user'
            }
        ],
        settings: {
            theme: 'light',
            notifications: false,
            autoSave: true
        }
    }
];

// 사용자 데이터를 로컬스토리지에 저장하는 함수
function createTestUsers() {
    console.log('테스트 사용자 데이터 생성 시작...');

    // 기존 사용자 데이터 초기화
    testUsers.forEach(user => {
        const userKey = `user_${user.email}`;
        const userData = {
            profile: {
                name: user.name,
                email: user.email,
                ...user.profile
            },
            onboarding: {
                setupCompleted: true,
                setupDate: new Date().toISOString(),
                interests: user.profile.interests
            },
            courses: [],
            completedCourses: [],
            timetableCourses: [],
            graduationRequirements: [],
            graduationInfo: user.graduationInfo,
            curriculum: user.curriculum,
            schedule: user.schedule,
            memos: user.memos,
            messages: user.messages,
            settings: user.settings
        };

        localStorage.setItem(userKey, JSON.stringify(userData));
        console.log(`✅ 사용자 ${user.email} 데이터 생성 완료`);
    });

    // 사용자 목록 저장
    const userList = testUsers.map(user => ({
        email: user.email,
        name: user.name,
        password: user.password
    }));

    localStorage.setItem('users', JSON.stringify(userList));
    console.log('✅ 사용자 목록 저장 완료');

    // 현재 사용자를 첫 번째 사용자로 설정
    localStorage.setItem('currentUser', testUsers[0].email);
    console.log(`✅ 현재 사용자를 ${testUsers[0].email}로 설정`);

    console.log('🎉 테스트 사용자 데이터 생성 완료!');
    console.log('\n📋 생성된 테스트 계정:');
    testUsers.forEach(user => {
        console.log(`  - ${user.email} (${user.name})`);
    });
    console.log('\n💡 브라우저에서 로그인하여 각 계정의 데이터를 확인해보세요!');
}

// 스크립트 실행
if (typeof window !== 'undefined') {
    // 브라우저 환경에서 실행
    createTestUsers();
} else {
    // Node.js 환경에서 실행
    console.log('이 스크립트는 브라우저 환경에서 실행해야 합니다.');
    console.log('개발자 도구 콘솔에서 다음 명령어를 실행하세요:');
    console.log('loadScript("scripts/create-test-users.js")');
} 