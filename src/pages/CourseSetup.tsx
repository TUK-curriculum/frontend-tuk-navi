import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    getCoursesByYear,
    getCoursesByCategory,
    allCourses,
    Course,
    computerEngineeringRequirements
} from '../data/graduationRequirements';
import { Mascot } from '../components/common/Mascot';
import setup1 from '../assets/setup1.png';
import setup2 from '../assets/setup2.png';
import setup3 from '../assets/setup3.png';
import setup4 from '../assets/setup4.png';

interface CourseSetupProps {
    userGrade?: number;
    onComplete?: (courses: Course[], totalCredits: number) => void;
}

const CourseSetup: React.FC<CourseSetupProps> = ({
    userGrade = 3,
    onComplete
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    // URL state에서 사용자 데이터 가져오기
    const { userGrade: urlUserGrade, userCredits: urlUserCredits } = location.state || {};
    const finalUserGrade = urlUserGrade || userGrade;
    const finalUserCredits = urlUserCredits || 0;
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
    const [additionalCourses, setAdditionalCourses] = useState<Course[]>([]);
    const [totalCredits, setTotalCredits] = useState(0);
    const [showAddCourse, setShowAddCourse] = useState(false);
    const [newCourse, setNewCourse] = useState({
        name: '',
        credits: 3,
        category: '전공선택',
        type: 'elective' as 'required' | 'elective'
    });

    // 사용자 학년에 따른 기본 과목들 자동 추가
    useEffect(() => {
        const defaultCourses = getCoursesByYear(finalUserGrade);
        setSelectedCourses(defaultCourses);
        setTotalCredits(defaultCourses.reduce((sum, course) => sum + course.credits, 0));
    }, [finalUserGrade]);

    const steps = [
        {
            title: '기본 과목 설정',
            description: `${finalUserGrade}학년까지의 기본 과목들이 자동으로 추가되었습니다.`
        },
        {
            title: '추가 과목 입력',
            description: '이수한 추가 과목들을 입력해주세요.'
        },
        {
            title: '확인 및 완료',
            description: '입력한 정보를 확인하고 완료합니다.'
        }
    ];

    const categories = ['전공필수', '전공선택', '교양필수', '교양선택', '계열기초'];

    const handleCourseToggle = (course: Course) => {
        setSelectedCourses(prev => {
            const isSelected = prev.some(c => c.id === course.id);
            if (isSelected) {
                return prev.filter(c => c.id !== course.id);
            } else {
                return [...prev, course];
            }
        });
    };

    const handleAddCourse = () => {
        if (newCourse.name.trim()) {
            const course: Course = {
                id: `CUSTOM_${Date.now()}`,
                name: newCourse.name,
                credits: newCourse.credits,
                category: newCourse.category,
                type: newCourse.type,
                year: userGrade,
                description: '사용자 추가 과목'
            };
            setAdditionalCourses(prev => [...prev, course]);
            setSelectedCourses(prev => [...prev, course]);
            setNewCourse({
                name: '',
                credits: 3,
                category: '전공선택',
                type: 'elective'
            });
            setShowAddCourse(false);
        }
    };

    const handleComplete = () => {
        const allSelectedCourses = [...selectedCourses, ...additionalCourses];
        const total = allSelectedCourses.reduce((sum, course) => sum + course.credits, 0);

        if (onComplete) {
            onComplete(allSelectedCourses, total);
        }

        // 다음 페이지로 이동 (관심항목 선택 페이지)
        navigate('/interest-selection', {
            state: {
                courses: allSelectedCourses,
                totalCredits: total,
                userGrade: finalUserGrade,
                userCredits: finalUserCredits,
                userName: location.state?.userName,
                userEmail: location.state?.userEmail,
                userDepartment: location.state?.userDepartment,
                userStudentId: location.state?.userStudentId
            }
        });
    };

    const getCoursesByCategoryForYear = (category: string) => {
        return allCourses.filter(course =>
            course.category === category && course.year <= finalUserGrade
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
            <div className="w-full max-w-3xl mx-auto">
                {/* 헤더 */}
                <div className="flex flex-col items-center mb-8">
                    {/* ProgressBar */}
                    <div className="w-full flex items-center justify-center gap-4 mb-2">
                        {steps.map((step, idx) => (
                            <div
                                key={step.title}
                                className={`h-2 rounded-full transition-all duration-300 ${idx <= currentStep ? 'bg-blue-500 w-16' : 'bg-gray-200 w-8'}`}
                            />
                        ))}
                    </div>
                    {/* 마스코트 + 안내 메시지 */}
                    <div className="flex items-center gap-4">
                        <img src={[setup1, setup2, setup3, setup4][Math.min(currentStep, 3)]} alt="마스코트" className="w-16 h-16 rounded-full shadow" />
                        <div>
                            <h2 className="text-xl font-bold text-blue-700">{steps[currentStep].title}</h2>
                            <p className="text-base text-gray-500">{steps[currentStep].description}</p>
                        </div>
                    </div>
                </div>

                {/* 현재 단계 콘텐츠 */}
                <AnimatePresence mode="wait">
                    {currentStep === 0 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="bg-white rounded-3xl p-8 shadow-xl border border-blue-100">
                                <h2 className="text-2xl font-bold mb-6 text-blue-700">기본 과목 목록</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {selectedCourses.map(course => (
                                        <motion.div
                                            key={course.id}
                                            whileHover={{ scale: 1.03 }}
                                            className="relative bg-white border-2 border-blue-200 rounded-2xl p-5 flex flex-col gap-1 shadow-sm transition-all duration-200"
                                        >
                                            <div className="font-semibold text-blue-800 text-lg">{course.name}</div>
                                            <div className="text-sm text-blue-600">{course.category} • {course.credits}학점</div>
                                            <span className="absolute top-3 right-3 text-blue-400 text-xl">📘</span>
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="mt-6 text-right">
                                    <span className="text-xl font-bold text-blue-600">총 {totalCredits}학점</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 1 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {/* 카테고리별 과목 선택 */}
                            {categories.map(category => {
                                const categoryCourses = getCoursesByCategoryForYear(category);
                                return (
                                    <div key={category} className="bg-white rounded-3xl p-8 shadow-xl border border-blue-100 mb-4">
                                        <h3 className="text-xl font-bold mb-4 text-blue-700">{category}</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {categoryCourses.map(course => {
                                                const isSelected = selectedCourses.some(c => c.id === course.id);
                                                return (
                                                    <motion.div
                                                        key={course.id}
                                                        whileHover={{ scale: 1.04 }}
                                                        onClick={() => handleCourseToggle(course)}
                                                        className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 font-medium select-none
                                                            ${isSelected ? 'bg-blue-100 border-blue-500 shadow-lg scale-105' : 'bg-white border-gray-200 hover:bg-blue-50'}
                                                        `}
                                                    >
                                                        {isSelected && (
                                                            <span className="absolute top-3 right-3 text-blue-500 text-xl">✔️</span>
                                                        )}
                                                        <div className="font-bold text-lg">{course.name}</div>
                                                        <div className="text-sm text-gray-500">{course.credits}학점</div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* 추가 과목 입력 */}
                            <div className="bg-white rounded-3xl p-8 shadow-xl border border-green-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-green-700">추가 과목 입력</h3>
                                    <button
                                        onClick={() => setShowAddCourse(!showAddCourse)}
                                        className="px-5 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold shadow"
                                    >
                                        {showAddCourse ? '취소' : '과목 추가'}
                                    </button>
                                </div>

                                {showAddCourse && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-4 p-4 bg-gray-50 rounded-xl"
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="과목명"
                                                value={newCourse.name}
                                                onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                                                className="p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-green-200"
                                            />
                                            <select
                                                value={newCourse.category}
                                                onChange={(e) => setNewCourse(prev => ({ ...prev, category: e.target.value }))}
                                                className="p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-green-200"
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                placeholder="학점"
                                                value={newCourse.credits}
                                                onChange={(e) => setNewCourse(prev => ({ ...prev, credits: parseInt(e.target.value) || 0 }))}
                                                className="p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-green-200"
                                                min="1"
                                                max="6"
                                            />
                                            <select
                                                value={newCourse.type}
                                                onChange={(e) => setNewCourse(prev => ({ ...prev, type: e.target.value as 'required' | 'elective' }))}
                                                className="p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-green-200"
                                            >
                                                <option value="required">필수</option>
                                                <option value="elective">선택</option>
                                            </select>
                                        </div>
                                        <button
                                            onClick={handleAddCourse}
                                            className="w-full px-5 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold shadow"
                                        >
                                            추가
                                        </button>
                                    </motion.div>
                                )}

                                {/* 추가된 과목들 표시 */}
                                {additionalCourses.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold mb-2 text-green-700">추가된 과목들:</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {additionalCourses.map(course => (
                                                <motion.div
                                                    key={course.id}
                                                    whileHover={{ scale: 1.03 }}
                                                    className="relative bg-green-50 border-2 border-green-300 rounded-2xl p-5 shadow-sm transition-all duration-200"
                                                >
                                                    <div className="font-semibold text-green-800">{course.name}</div>
                                                    <div className="text-sm text-green-600">{course.category} • {course.credits}학점</div>
                                                    <span className="absolute top-3 right-3 text-green-400 text-xl">📝</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 2 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="bg-white rounded-3xl p-8 shadow-xl border border-purple-100">
                                <h2 className="text-2xl font-bold mb-6 text-purple-700">최종 확인</h2>

                                {/* 카테고리별 요약 */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                    {categories.map(category => {
                                        const categoryCourses = selectedCourses.filter(c => c.category === category);
                                        const categoryCredits = categoryCourses.reduce((sum, c) => sum + c.credits, 0);

                                        return (
                                            <motion.div
                                                key={category}
                                                whileHover={{ scale: 1.03 }}
                                                className="relative bg-purple-50 border-2 border-purple-200 rounded-2xl p-5 shadow-sm transition-all duration-200"
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-semibold text-purple-700">{category}</span>
                                                    <span className="text-purple-600 font-bold">{categoryCredits}학점</span>
                                                </div>
                                                <div className="text-sm text-gray-600">{categoryCourses.length}개 과목</div>
                                                <span className="absolute top-3 right-3 text-purple-300 text-xl">📊</span>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                <div className="border-t pt-4 mt-6">
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="flex justify-between items-center text-2xl font-extrabold bg-purple-100 border-2 border-purple-300 rounded-2xl p-6 shadow-md"
                                    >
                                        <span>총 이수 학점</span>
                                        <span className="text-purple-700">
                                            {selectedCourses.reduce((sum, c) => sum + c.credits, 0)}학점
                                        </span>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 네비게이션 버튼 */}
                <div className="flex justify-between mt-10 gap-4">
                    <button
                        onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                        disabled={currentStep === 0}
                        className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-md
                            ${currentStep === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-white text-blue-700 border-2 border-blue-300 hover:bg-blue-50 hover:text-blue-900'}
                        `}
                    >
                        이전
                    </button>

                    <button
                        onClick={() => {
                            if (currentStep < steps.length - 1) {
                                setCurrentStep(prev => prev + 1);
                            } else {
                                handleComplete();
                            }
                        }}
                        className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-md
                            bg-blue-600 text-white hover:bg-blue-700 active:scale-95`}
                    >
                        {currentStep === steps.length - 1 ? '완료' : '다음'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseSetup; 