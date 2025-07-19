export const typography = {
    // Font Families
    fontFamily: {
        primary: '"Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
        mono: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", "Menlo", "Consolas", "DejaVu Sans Mono", monospace',
    },

    // Font Sizes
    fontSize: {
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        base: '1rem',     // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        '2xl': '1.5rem',  // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem', // 36px
        '5xl': '3rem',    // 48px
        '6xl': '3.75rem', // 60px
    },

    // Font Weights
    fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
    },

    // Line Heights
    lineHeight: {
        none: 1,
        tight: 1.25,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2,
    },

    // Letter Spacing
    letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
    },

    // Typography Variants
    variants: {
        // Display Styles
        display1: {
            fontSize: '3.75rem', // 60px
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
        },
        display2: {
            fontSize: '3rem', // 48px
            fontWeight: 700,
            lineHeight: 1.25,
            letterSpacing: '-0.01em',
        },
        display3: {
            fontSize: '2.25rem', // 36px
            fontWeight: 600,
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
        },

        // Heading Styles
        h1: {
            fontSize: '2.25rem', // 36px
            fontWeight: 700,
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
        },
        h2: {
            fontSize: '1.875rem', // 30px
            fontWeight: 600,
            lineHeight: 1.35,
            letterSpacing: '-0.01em',
        },
        h3: {
            fontSize: '1.5rem', // 24px
            fontWeight: 600,
            lineHeight: 1.4,
            letterSpacing: '-0.005em',
        },
        h4: {
            fontSize: '1.25rem', // 20px
            fontWeight: 600,
            lineHeight: 1.4,
            letterSpacing: '0em',
        },
        h5: {
            fontSize: '1.125rem', // 18px
            fontWeight: 600,
            lineHeight: 1.45,
            letterSpacing: '0em',
        },
        h6: {
            fontSize: '1rem', // 16px
            fontWeight: 600,
            lineHeight: 1.5,
            letterSpacing: '0em',
        },

        // Body Styles
        body1: {
            fontSize: '1rem', // 16px
            fontWeight: 400,
            lineHeight: 1.6,
            letterSpacing: '0em',
        },
        body2: {
            fontSize: '0.875rem', // 14px
            fontWeight: 400,
            lineHeight: 1.6,
            letterSpacing: '0em',
        },

        // Button Styles
        button: {
            fontSize: '0.875rem', // 14px
            fontWeight: 600,
            lineHeight: 1.4,
            letterSpacing: '0.01em',
            textTransform: 'none' as const,
        },

        // Caption Styles
        caption: {
            fontSize: '0.75rem', // 12px
            fontWeight: 400,
            lineHeight: 1.5,
            letterSpacing: '0.01em',
        },

        // Overline Styles
        overline: {
            fontSize: '0.75rem', // 12px
            fontWeight: 600,
            lineHeight: 1.5,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
        },
    },
} as const;

export type TypographyVariant = keyof typeof typography.variants;
export type FontWeight = keyof typeof typography.fontWeight;
export type FontSize = keyof typeof typography.fontSize; 