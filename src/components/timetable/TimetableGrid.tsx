import React, { useMemo } from 'react';
import { periods } from '../../data/periodMap';
import { Course, DayKey } from '../../types/course';
import CourseBlock from './CourseBlock';

interface TimetableGridProps {
    courses: Course[];
    onCourseClick: (course: Course) => void;
    highlightCourseId?: number | null;
}

const TimetableGrid: React.FC<TimetableGridProps> = ({ courses, onCourseClick, highlightCourseId }) => {
    const dayNames = {
        monday: '월',
        tuesday: '화',
        wednesday: '수',
        thursday: '목',
        friday: '금',
        saturday: '토',
        sunday: '일'
    };

    const usedDays = useMemo(() => {
        const daysInCourses = new Set(courses.map(course => course.day).filter(Boolean));
        
        const baseDays: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        const hasSaturday = daysInCourses.has('saturday');
        const hasSunday = daysInCourses.has('sunday');

        if (hasSunday) {
            baseDays.push('saturday', 'sunday');
        }
        else if (hasSaturday) {
            baseDays.push('saturday');
        }

        return baseDays;
    }, [courses]);

    const dayCount = usedDays.length;

    return (
        <div className="flex-grow relative bg-white rounded-2xl shadow-xl overflow-hidden p-1">
            <div className="overflow-auto h-full" 
                style={{
                    scrollbarWidth: 'none',
                }}
            >
                <div 
                    className="relative grid grid-rows-[40px_repeat(14,70px)]"
                    style={{ 
                        gridTemplateColumns: `60px repeat(${dayCount}, 1fr)`,
                        minWidth: '1200px'
                    }}
                >
                    {/* Day Headers */}
                    {usedDays.map((day, index) => (
                        <div
                            key={day}
                            className="sticky top-0 z-20 text-center flex items-center justify-center bg-white"
                            style={{ gridColumn: index + 2, gridRow: 1 }}
                        >
                            <span className="font-bold text-gray-600">{dayNames[day]}</span>
                        </div>
                    ))}

                    {/* Time Labels */}
                    {periods.map((period, index) => (
                        <div
                            key={period.label}
                            className="sticky left-0 z-10 flex items-center justify-center text-xs bg-white"
                            style={{ gridRow: index + 2, gridColumn: 1 }}
                        >
                            <div className="text-center">
                                <div className="font-medium text-gray-700">{period.label}</div>
                                <div className="text-xs text-gray-500">{period.start}</div>
                            </div>
                        </div>
                    ))}

                    {/* Grid Lines */}
                    {Array.from({ length: 15 }, (_, rowIndex) =>
                        usedDays.map((_, colIndex) => (
                            <div
                                key={`grid-${rowIndex}-${colIndex}`}
                                className="border-r border-b border-gray-100"
                                style={{
                                    gridRow: rowIndex + 1,
                                    gridColumn: colIndex + 2
                                }}
                            />
                        ))
                    )}

                    {/* Course Blocks */}
                    {courses.map((course, index) => {
                        if (!course.day || course.startPeriod === undefined || course.endPeriod === undefined) {
                            console.log('[DEBUG] 요일/교시 정보가 없는 과목 건너뛰기:', course);
                            return null;
                        }

                        const dayIndex = usedDays.indexOf(course.day);
                        if (dayIndex === -1) {
                            console.log('[DEBUG] 강의의 요일이 요일 목록에 없음:', course.day, usedDays);
                            return null;
                        }

                        const periodSpan = course.endPeriod - course.startPeriod + 1;
                        const gridColumn = dayIndex + 2;
                        const gridRowStart = course.startPeriod + 1;
                        const gridRowEnd = course.endPeriod + 2;

                        console.log('[DEBUG] 과목 블록:', {
                            courseName: course.name,
                            day: course.day,
                            dayIndex,
                            gridColumn,
                            gridRowStart,
                            gridRowEnd,
                            periodSpan
                        });

                        return (
                            <div
                                key={`${course.id}-${index}`}
                                style={{
                                    gridColumn: gridColumn,
                                    gridRow: `${gridRowStart} / ${gridRowEnd}`,
                                    zIndex: 30
                                }}
                                className="p-1"
                            >
                                <CourseBlock
                                    course={course}
                                    onClick={() => onCourseClick(course)}
                                    highlight={highlightCourseId === course.id}
                                    dayIndex={dayIndex}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default React.memo(TimetableGrid);