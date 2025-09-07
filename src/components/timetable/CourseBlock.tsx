/** @jsxImportSource @emotion/react */
// src/components/CourseBlock.tsx
import React from 'react';
import { css } from '@emotion/react';
import type { Course, CourseType } from '../../types/course';
import { dayKeys } from '../../data/periodMap';
import { FaGraduationCap, FaBook, FaLeaf } from 'react-icons/fa';

interface CourseBlockProps {
  course: Course;
  onClick: (course: Course) => void;
  highlight?: boolean;
  dayIndex: number; 
}

// 과목 유형별 매핑
const typeMap: Record<CourseType, { label: string; Icon: any }> = {
  GR: { label: '교필', Icon: FaGraduationCap },
  GE: { label: '교선', Icon: FaLeaf },
  MR: { label: '전필', Icon: FaGraduationCap },
  ME: { label: '전선', Icon: FaBook },
  RE: { label: '현장연구', Icon: FaBook },
  FE: { label: '자선', Icon: FaLeaf },
};

const lightenColor = (color: string, opacity: number = 0.15): string => {
  // hex 색상을 RGB로 변환
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const darkenColor = (color: string, factor: number = 0.2): string => {
  const hex = color.replace('#', '');
  const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - factor));
  const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - factor));
  const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - factor));
  
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
};

const CourseBlock: React.FC<CourseBlockProps> = ({ course, onClick, highlight }) => {
  console.log('[DEBUG] CourseBlock course:', course);
  const { type, name, room, startTime, endTime, day, startPeriod, endPeriod, instructor, color } = course;

  const col = dayKeys.indexOf(day);
  const rowStart = startPeriod;
  const rowEnd = endPeriod + 1;

  const style: React.CSSProperties = {
    gridColumnStart: col + 1,
    gridRowStart: rowStart,
    gridRowEnd: rowEnd,
  };

  const courseType = typeMap[type] ?? typeMap.GE;
  
  const courseColor = color || '#FF6B6B';
  const bgColor = lightenColor(courseColor, 0.15);
  const borderColor = lightenColor(courseColor, 0.4);
  const textColor = darkenColor(courseColor, 0.3);
  const iconBgColor = lightenColor(courseColor, 0.3);

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
        background-color: ${bgColor};
        border: 1px solid ${borderColor};
        width: 96%;
        height: 96%;
        margin: auto;
        ${highlight ? `
          border: 2.5px solid #1da1f2;
          box-shadow: 0 0 0 4px #bae6fd, 0 8px 32px 0 rgba(80,110,240,0.13);
          background: linear-gradient(120deg, ${bgColor} 0%, ${lightenColor(courseColor, 0.1)} 100%);
        ` : ''}
        &:hover {
          transform: scale(1.04);
          box-shadow: 0 4px 12px ${lightenColor(courseColor, 0.3)};
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
          color: ${textColor};
          flex-shrink: 0;
        `}
      >
        <div
          css={css`
            padding: 4px;
            border-radius: 50%;
            background-color: ${iconBgColor};
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          `}
        >
          <courseType.Icon />
        </div>
        <span>{courseType.label}</span>
        <span
          css={css`
            opacity: 0.7;
            font-weight: 500;
            white-space: nowrap;
          `}
        >
          {`${startTime.slice(0, 5)}~${endTime.slice(0, 5)}`}
        </span>
      </div>

      <div
        css={css`
          margin-top: 4px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          min-height: 0;
        `}
      >
        <p
          css={css`
            font-weight: 800;
            font-size: 13.5px;
            color: ${textColor};
            line-height: 1.2;
            margin: 0 0 4px 0;
            overflow: hidden;
            word-break: keep-all;
            hyphens: auto;
            display: -webkit-box;
            -webkit-line-clamp: ${periodCount === 1 ? 1 : periodCount === 2 ? 2 : 3};
            -webkit-box-orient: vertical;
          `}
          title={name}
        >
          {name}
        </p>
        
        {periodCount > 1 && instructor && (
          <p
            css={css`
              font-size: 12px;
              color: ${textColor};
              opacity: 0.7;
              margin: 0;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            `}
            title={instructor}
          >
            {instructor}
          </p>
        )}

        {periodCount > 1 && room && (
          <p
            css={css`
              font-size: 12px;
              color: ${textColor};
              opacity: 0.8;
              margin: 0 0 2px 0;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            `}
            title={room}
          >
            {room}
          </p>
        )}

      </div>
    </div>
  );
};

export default CourseBlock;