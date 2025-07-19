import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Course {
    code: string
    name: string
    credit: number
    year: number
    semester: number
    type: string
    description: string
}

interface GraduationState {
    // 현재 단계
    step: number
    setStep: (step: number) => void

    // STEP 1: 학적 정보
    student: {
        id: string
        name: string
        dept: string
        curriculumYear: number
    }
    setStudent: (student: any) => void

    // STEP 2: 학점 정보
    credits: {
        total: number
        major: number
        liberal: number
        basic: number
    }
    setCredits: (credits: any) => void

    // STEP 3: 이수 과목
    completedCourses: Course[]
    addCourse: (course: Course) => void
    removeCourse: (code: string) => void

    // STEP 4: 기타 요건
    extra: {
        capstone: boolean
        english: boolean
        internship: boolean
    }
    setExtra: (extra: any) => void

    // 진단 결과
    diagnosis: {
        completionRate: number
        lackItems: string[]
        totalRequired: number
        majorRequired: number
        liberalRequired: number
        totalCompleted: number
        majorCompleted: number
        liberalCompleted: number
    }
    runDiagnosis: () => void

    // 초기화
    reset: () => void
}

export const useGraduationStore = create<GraduationState>()(
    persist(
        (set, get) => ({
            // 현재 단계
            step: 0,
            setStep: (step) => set({ step }),

            // STEP 1: 학적 정보
            student: {
                id: '',
                name: '',
                dept: '컴퓨터공학부',
                curriculumYear: new Date().getFullYear()
            },
            setStudent: (student) => set({ student }),

            // STEP 2: 학점 정보
            credits: {
                total: 0,
                major: 0,
                liberal: 0,
                basic: 0
            },
            setCredits: (credits) => set({ credits }),

            // STEP 3: 이수 과목
            completedCourses: [],
            addCourse: (course) => {
                const { completedCourses } = get()
                const exists = completedCourses.find(c => c.code === course.code)
                if (!exists) {
                    set({ completedCourses: [...completedCourses, course] })
                }
            },
            removeCourse: (code) => {
                const { completedCourses } = get()
                set({ completedCourses: completedCourses.filter(c => c.code !== code) })
            },

            // STEP 4: 기타 요건
            extra: {
                capstone: false,
                english: false,
                internship: false
            },
            setExtra: (extra) => set({ extra }),

            // 진단 결과
            diagnosis: {
                completionRate: 0,
                lackItems: [],
                totalRequired: 130,
                majorRequired: 69,
                liberalRequired: 37,
                totalCompleted: 0,
                majorCompleted: 0,
                liberalCompleted: 0
            },

            runDiagnosis: () => {
                const { credits, extra, completedCourses } = get()

                // 과목별 학점 계산
                const totalCompleted = completedCourses.reduce((sum, course) => sum + course.credit, 0)
                const majorCompleted = completedCourses
                    .filter(course => course.type === '전공필수' || course.type === '전공선택')
                    .reduce((sum, course) => sum + course.credit, 0)
                const liberalCompleted = completedCourses
                    .filter(course => course.type === '교양필수' || course.type === '교양선택' || course.type === '계열기초')
                    .reduce((sum, course) => sum + course.credit, 0)

                // 부족 항목 체크
                const lacks: string[] = []

                if (credits.total < 130) {
                    lacks.push(`총학점 부족 (${credits.total}/130)`)
                }
                if (credits.major < 69) {
                    lacks.push(`전공학점 부족 (${credits.major}/69)`)
                }
                if (credits.liberal < 37) {
                    lacks.push(`교양학점 부족 (${credits.liberal}/37)`)
                }
                if (!extra.capstone) {
                    lacks.push('졸업작품(캡스톤디자인) 미이수')
                }
                if (!extra.english) {
                    lacks.push('공인어학성적 미충족')
                }
                if (!extra.internship) {
                    lacks.push('현장실습/실무경험 미이수')
                }

                // 전공필수 과목 체크
                const requiredCourses = [
                    'ACS12021', // 프로그래밍
                    'ACS23001', // 자료구조
                    'ACS32001', // 알고리즘
                    'ACS22001', // 컴퓨터구조
                    'ACS31001', // 운영체제
                    'ACS32002', // 소프트웨어공학
                    'ACS32003', // 데이터베이스
                    'ACS33001', // 컴퓨터네트워크
                    'ACS40051', // 종합설계 1
                    'ACS40053'  // 종합설계 2
                ]

                const completedRequired = completedCourses
                    .filter(course => requiredCourses.includes(course.code))
                    .map(course => course.code)

                const missingRequired = requiredCourses.filter(code => !completedRequired.includes(code))

                if (missingRequired.length > 0) {
                    lacks.push(`전공필수 과목 미이수: ${missingRequired.length}개`)
                }

                // 완료율 계산
                const totalProgress = Math.min((credits.total / 130) * 100, 100)
                const majorProgress = Math.min((credits.major / 69) * 100, 100)
                const liberalProgress = Math.min((credits.liberal / 37) * 100, 100)

                const completionRate = Math.round((totalProgress + majorProgress + liberalProgress) / 3)

                set({
                    diagnosis: {
                        completionRate,
                        lackItems: lacks,
                        totalRequired: 130,
                        majorRequired: 69,
                        liberalRequired: 37,
                        totalCompleted: credits.total,
                        majorCompleted: credits.major,
                        liberalCompleted: credits.liberal
                    },
                    step: 4
                })
            },

            // 초기화
            reset: () => set({
                step: 0,
                student: {
                    id: '',
                    name: '',
                    dept: '컴퓨터공학부',
                    curriculumYear: new Date().getFullYear()
                },
                credits: {
                    total: 0,
                    major: 0,
                    liberal: 0,
                    basic: 0
                },
                completedCourses: [],
                extra: {
                    capstone: false,
                    english: false,
                    internship: false
                },
                diagnosis: {
                    completionRate: 0,
                    lackItems: [],
                    totalRequired: 130,
                    majorRequired: 69,
                    liberalRequired: 37,
                    totalCompleted: 0,
                    majorCompleted: 0,
                    liberalCompleted: 0
                }
            })
        }),
        {
            name: 'tuk-graduation-store',
            // useData를 통해 per-user 데이터로 관리되므로 persist 제거
            partialize: () => ({}) // 빈 객체를 반환하여 저장하지 않음
        }
    )
) 