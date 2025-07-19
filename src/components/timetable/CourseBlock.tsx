/** @jsxImportSource @emotion/react */
// src/components/CourseBlock.tsx
import React from 'react';
import { css } from '@emotion/react';
import type { Course } from '../../types/course';
import { dayKeys } from '../../data/periodMap';
import { FaGraduationCap, FaBook, FaLeaf } from 'react-icons/fa';

interface CourseBlockProps {
    course: Course;
    onClick: (course: Course) => void;
    highlight?: boolean;
}

// 과목 유형별 매핑
const typeMap = {
    required: { label: '필수', Icon: FaGraduationCap, color: 'red' },
    elective: { label: '선택', Icon: FaBook, color: 'blue' },
    liberal: { label: '교양', Icon: FaLeaf, color: 'green' },
} as const;

// 색상 변형
const colorVariants = {
    blue: {
        bg: '#DBEAFE88', border: '#BFDBFE', text: '#1E3A8A', iconBg: '#BFDBFE88',
    },
    red: {
        bg: '#FEE2E288', border: '#FECACA', text: '#991B1B', iconBg: '#FECACA88',
    },
    green: {
        bg: '#DCFCE788', border: '#BBF7D088', text: '#065F46', iconBg: '#BBF7D088',
    },
} as const;

const CourseBlock: React.FC<CourseBlockProps> = ({ course, onClick, highlight }) => {
    const { type, name, room, startTime, endTime, day, startPeriod, endPeriod, instructor } = course;

    // 유효성 검증: start < end, day 유효 인덱스
    const col = dayKeys.indexOf(day);
    const rowStart = Math.max(1, startPeriod);
    const rowEnd = Math.max(rowStart + 1, endPeriod + 1);

    const style: React.CSSProperties = {
        gridColumnStart: col + 1,
        gridRowStart: rowStart, // +1 제거
        gridRowEnd: rowEnd,     // +1 제거
    };

    // 타입 매핑, 색상
    const courseType = typeMap[type] ?? typeMap.elective;
    const colors = colorVariants[courseType.color];

    // 블록 높이에 따라 폰트 크기/줄 수 동적 조정
    // (간단하게: 2교시 이상이면 모두, 1교시면 name+instructor만, room은 숨김)
    const periodCount = endPeriod - startPeriod + 1;

    return (
        <div
            css={css`
        position: relative;
        padding: 6px;
        border-radius: 12px;
        backdrop-filter: blur(4px);
        display: flex;
        flex-direction: column;
        cursor: pointer;
        transition: transform .2s, box-shadow .2s, border .2s, background .2s;
        background-color: ${colors.bg};
        border: 1px solid ${colors.border};
        width: 96%;
        height: 96%;
        margin: auto;
        ${highlight ? `
          border: 2.5px solid #1da1f2;
          box-shadow: 0 0 0 4px #bae6fd, 0 8px 32px 0 rgba(80,110,240,0.13);
          background: linear-gradient(120deg, #e0f7fa 0%, #f0faff 100%);
        ` : ''}
        &:hover {
          transform: scale(1.04);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
      `}
            style={style}
            role="button"
            aria-label={`${name} ${startTime}~${endTime}`}
            onClick={() => onClick(course)}
        >
            <div
                css={css`
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: ${colors.text};
        `}
            >
                <div
                    css={css`
            padding: 4px;
            border-radius: 50%;
            background-color: ${colors.iconBg};
            display: flex;
            align-items: center;
            justify-content: center;
          `}
                >
                    <courseType.Icon />
                </div>
                <span>{courseType.label}</span>
                <span
                    css={css`
            opacity: 0.7;
            font-weight: 500;
          `}
                >
                    {`${startTime}~${endTime}`}
                </span>
            </div>

            <div
                css={css`
          margin-top: 4px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        `}
            >
                <p
                    css={css`
            font-weight: 800;
            font-size: ${periodCount === 1 ? '0.95rem' : '1rem'};
            color: #1F2937;
            margin: 0;
            line-height: 1.2;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          `}
                >
                    {name}
                </p>
                {periodCount > 1 && room && (
                    <p
                        css={css`
                      font-size: 0.75rem;
                      color: #6B7280;
                      margin: 2px 0 0;
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                    `}
                    >
                        {room}
                    </p>
                )}
                {instructor && (
                    <p
                        css={css`
                      font-size: 0.75rem;
                      color: #374151;
                      margin: 2px 0 0;
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                    `}
                    >
                        {instructor}
                    </p>
                )}
            </div>
        </div>
    );
};

export default React.memo(CourseBlock);
