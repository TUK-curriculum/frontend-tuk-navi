export const environment = {
    production: import.meta.env.PROD,
    development: import.meta.env.DEV,
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000', // backend server
    appName: 'TUK Navi',
    version: '1.0.0',
} as const;

export type Environment = typeof environment;

// API endpoints configuration
export const apiEndpoints = {
    auth: {
        login: '/auth/login',
        register: '/auth/signup',
        logout: '/auth/logout',
        refresh: '/auth/refresh',
        profile: '/auth/profile',
    },
    users: {
        list: '/users',
        detail: (id: number) => `/users/${id}`,
        update: (id: number) => `/users/${id}`,
        delete: (id: number) => `/users/${id}`,
        settings: (id: number) => `/users/${id}/settings`,
    },
    courses: {
        list: '/courses',
        detail: (id: number) => `/courses/${id}`,
        search: '/courses/search',
        enroll: '/courses/enroll',
        drop: '/courses/drop',
        completed: '/courses/completed',
    },
    graduation: {
        requirements: '/graduation/requirements',
        progress: '/graduation/progress',
        audit: '/graduation/audit',
    },
    timetable: {
        current: '/timetable/current',
        save: '/timetable/save',
        history: '/timetable/history',
    },
    chatbot: {
        conversation: '/chatbot/conversation',
        history: '/chatbot/history',
        feedback: '/chatbot/feedback',
    },
    notes: {
        list: '/notes',
        detail: (id: number) => `/notes/${id}`,
    },
    notifications: {
        list: '/notifications',
        read: (id: number) => `/notifications/${id}/read`,
        readBulk: '/notifications/read'
    },
    chat: {
        messages: '/chat/messages',
        history: '/chat/history'
    },
} as const;

export type ApiEndpoints = typeof apiEndpoints; 