export const spacing = {
    // Base spacing unit (4px)
    base: 4,

    // Spacing scale (4px increments)
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    7: '28px',
    8: '32px',
    9: '36px',
    10: '40px',
    12: '48px',
    14: '56px',
    16: '64px',
    20: '80px',
    24: '96px',
    28: '112px',
    32: '128px',
    36: '144px',
    40: '160px',
    44: '176px',
    48: '192px',
    52: '208px',
    56: '224px',
    60: '240px',
    64: '256px',
    72: '288px',
    80: '320px',
    96: '384px',

    // Common spacing values
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '96px',
    '5xl': '128px',

    // Component-specific spacing
    component: {
        padding: {
            xs: '8px',
            sm: '12px',
            md: '16px',
            lg: '24px',
            xl: '32px',
        },
        margin: {
            xs: '8px',
            sm: '12px',
            md: '16px',
            lg: '24px',
            xl: '32px',
        },
        gap: {
            xs: '4px',
            sm: '8px',
            md: '12px',
            lg: '16px',
            xl: '24px',
        },
    },

    // Layout spacing
    layout: {
        container: {
            padding: '24px',
            maxWidth: '1200px',
        },
        section: {
            padding: '64px 0',
        },
        card: {
            padding: '24px',
            gap: '16px',
        },
        form: {
            gap: '16px',
            fieldGap: '8px',
        },
    },

    // Border radius
    borderRadius: {
        none: '0px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        full: '9999px',
    },

    // Shadows
    shadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },

    // Z-index scale
    zIndex: {
        hide: -1,
        auto: 'auto',
        base: 0,
        docked: 10,
        dropdown: 1000,
        sticky: 1100,
        banner: 1200,
        overlay: 1300,
        modal: 1400,
        popover: 1500,
        skipLink: 1600,
        toast: 1700,
        tooltip: 1800,
    },
} as const;

export type SpacingKey = keyof typeof spacing;
export type ComponentSpacingKey = keyof typeof spacing.component;
export type LayoutSpacingKey = keyof typeof spacing.layout; 