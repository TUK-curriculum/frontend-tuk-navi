export const breakpoints = {
    // Mobile first approach
    xs: '0px',      // Extra small devices (phones, 0px and up)
    sm: '600px',    // Small devices (landscape phones, 600px and up)
    md: '900px',    // Medium devices (tablets, 900px and up)
    lg: '1200px',   // Large devices (desktops, 1200px and up)
    xl: '1536px',   // Extra large devices (large desktops, 1536px and up)

    // Custom breakpoints for specific use cases
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1440px',

    // Container max widths
    container: {
        sm: '600px',
        md: '900px',
        lg: '1200px',
        xl: '1536px',
    },

    // Media query helpers
    up: (breakpoint: keyof typeof breakpoints) =>
        `@media (min-width: ${breakpoints[breakpoint]})`,
    down: (breakpoint: keyof typeof breakpoints) =>
        `@media (max-width: ${breakpoints[breakpoint]})`,
    between: (start: keyof typeof breakpoints, end: keyof typeof breakpoints) =>
        `@media (min-width: ${breakpoints[start]}) and (max-width: ${breakpoints[end]})`,
} as const;

export type BreakpointKey = keyof typeof breakpoints; 