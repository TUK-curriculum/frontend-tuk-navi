import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { colors } from './colors';

// 커스텀 테마 타입 정의
export interface TUKTheme extends Theme {
    custom: {
        colors: typeof colors;
        gradients: {
            primary: string;
            secondary: string;
            glass: string;
        };
        glass: {
            background: string;
            border: string;
            shadow: string;
        };
        breakpoints: {
            values: Record<string, number>;
        };
    };
}

const fontStack = [
    'Inter',
    'Pretendard',
    'Noto Sans KR',
    'system-ui',
    'Avenir',
    'Helvetica',
    'Arial',
    'sans-serif',
].join(', ');

export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: colors.primary[400], // codeit 스타일 블루
            light: colors.primary[300],
            dark: colors.primary[600],
            contrastText: colors.white,
        },
        secondary: {
            main: colors.secondary[400], // codeit 스타일 오렌지
            light: colors.secondary[300],
            dark: colors.secondary[500],
            contrastText: colors.white,
        },
        success: {
            main: colors.success[400], // codeit 스타일 그린
            light: colors.success[300],
            dark: colors.success[500],
        },
        warning: {
            main: colors.warning[500], // codeit 스타일 옐로우
            light: colors.warning[400],
            dark: colors.warning[600],
        },
        error: {
            main: colors.error[500], // codeit 스타일 레드
            light: colors.error[400],
            dark: colors.error[600],
        },
        background: {
            default: colors.gray[50],
            paper: colors.white,
        },
        text: {
            primary: colors.gray[800],
            secondary: colors.gray[500],
        },
    },
    typography: {
        fontFamily: fontStack,
        h1: {
            fontWeight: 700,
            fontSize: '2.25rem',
            letterSpacing: '-0.02em',
        },
        h2: {
            fontWeight: 700,
            fontSize: '1.5rem',
            letterSpacing: '-0.02em',
        },
        h3: {
            fontWeight: 600,
            fontSize: '1.25rem',
            letterSpacing: '-0.01em',
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.1rem',
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.6,
        },
        body2: {
            fontSize: '0.95rem',
            lineHeight: 1.5,
        },
        caption: {
            fontSize: '0.9rem',
            color: colors.gray[500],
        },
    },
    shape: {
        borderRadius: 16,
    },
    shadows: [
        'none',
        '0px 2px 4px rgba(0, 0, 0, 0.05)',
        '0px 4px 8px rgba(0, 0, 0, 0.1)',
        '0px 8px 16px rgba(0, 0, 0, 0.1)',
        '0px 16px 32px rgba(0, 0, 0, 0.1)',
        '0px 32px 64px rgba(0, 0, 0, 0.1)',
        '0px 2px 4px rgba(0, 0, 0, 0.05)',
        '0px 4px 8px rgba(0, 0, 0, 0.1)',
        '0px 8px 16px rgba(0, 0, 0, 0.1)',
        '0px 16px 32px rgba(0, 0, 0, 0.1)',
        '0px 32px 64px rgba(0, 0, 0, 0.1)',
        '0px 2px 4px rgba(0, 0, 0, 0.05)',
        '0px 4px 8px rgba(0, 0, 0, 0.1)',
        '0px 8px 16px rgba(0, 0, 0, 0.1)',
        '0px 16px 32px rgba(0, 0, 0, 0.1)',
        '0px 32px 64px rgba(0, 0, 0, 0.1)',
        '0px 2px 4px rgba(0, 0, 0, 0.05)',
        '0px 4px 8px rgba(0, 0, 0, 0.1)',
        '0px 8px 16px rgba(0, 0, 0, 0.1)',
        '0px 16px 32px rgba(0, 0, 0, 0.1)',
        '0px 32px 64px rgba(0, 0, 0, 0.1)',
        '0px 2px 4px rgba(0, 0, 0, 0.05)',
        '0px 4px 8px rgba(0, 0, 0, 0.1)',
        '0px 8px 16px rgba(0, 0, 0, 0.1)',
        '0px 16px 32px rgba(0, 0, 0, 0.1)',
        '0px 32px 64px rgba(0, 0, 0, 0.1)',
    ],
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1440,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 12,
                    padding: '12px 28px',
                    fontSize: '1rem',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 32,
                    boxShadow: '0 4px 24px rgba(30,41,59,0.08)',
                    background: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.18)',
                },
            },
        },
    },
}) as TUKTheme;

// 커스텀 속성 추가
lightTheme.custom = {
    colors,
    gradients: {
        primary: 'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%)',
        secondary: 'linear-gradient(90deg, #f2740d 0%, #fb923c 100%)',
        glass: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(224,242,254,0.6) 100%)',
    },
    glass: {
        background: 'rgba(255,255,255,0.7)',
        border: '1px solid rgba(255,255,255,0.18)',
        shadow: '0 4px 24px rgba(30,41,59,0.08)',
    },
    breakpoints: {
        values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1440 },
    },
}; 