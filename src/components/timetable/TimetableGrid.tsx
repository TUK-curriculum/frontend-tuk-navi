import React from 'react';
import { dayKeys, periods } from '../../data/periodMap';
import { Course } from '../../types/course';
import CourseBlock from './CourseBlock';

interface TimetableGridProps {
    courses: Course[];
    onCourseClick: (course: Course) => void;
    highlightCourseId?: string | null;
}

const TimetableGrid: React.FC<TimetableGridProps> = ({ courses, onCourseClick, highlightCourseId }) => {
    return (
        <div className="flex-grow relative bg-white rounded-2xl shadow-xl overflow-hidden p-1">
            <div className="overflow-auto h-full" style={{ scrollbarWidth: 'none' }}>
                <div className="relative grid grid-cols-[60px_repeat(5,1fr)] grid-rows-[40px_repeat(14,56px)]">
                    {/* Day Headers */}
                    {dayKeys.map((day, index) => (
                        <div
                            key={day}
                            className="sticky top-0 z-20 text-center flex items-center justify-center bg-white"
                            style={{ gridColumn: index + 2, gridRow: 1 }}
                        >
                            <span className="font-bold text-gray-600">{day}</span>
                        </div>
                    ))}

                    {/* Time Labels */}
                    {periods.map((period, index) => (
                        <div
                            key={period.label}
                            className="sticky left-0 z-10 flex items-center justify-center text-xs bg-white"
                            style={{ gridRow: index + 2, gridColumn: 1 }}
                        >
                            {index % 2 === 0 ? (
                                <span className="font-semibold text-gray-800">{period.label}</span>
                            ) : (
                                <span className="text-gray-400">{period.label}</span>
                            )}
                        </div>
                    ))}

                    {/* Grid Background */}
                    <div
                        className="absolute top-[40px] left-[60px] right-0 bottom-0 grid grid-cols-5 grid-rows-[repeat(14,56px)] pointer-events-none"
                        style={{
                            gridTemplateRows: 'repeat(14, 56px)',
                        }}
                    >
                        {Array.from({ length: 5 * 14 }).map((_, i) => (
                            <div key={i} className="border-r border-b border-gray-100/80" />
                        ))}
                    </div>

                    {/* Course Blocks */}
                    <div className="col-start-2 col-span-5 row-start-2 row-span-full grid grid-cols-5 grid-rows-[repeat(14,56px)]">
                        {courses.map(course => (
                            <CourseBlock key={course.id} course={course} onClick={onCourseClick} highlight={highlightCourseId === course.id} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(TimetableGrid);
