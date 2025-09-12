import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
    Snackbar,
    Alert,
    AlertTitle,
    Slide,
    SlideProps
} from '@mui/material';
import { CheckCircle, Error, Info, Warning } from '@mui/icons-material';

// 알림 타입 정의
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// 알림 데이터 인터페이스
export interface NotificationData {
    id: number;
    type: NotificationType;
    title?: string;
    message: string;
    duration?: number;
    action?: ReactNode;
}

// 알림 컨텍스트 인터페이스
interface NotificationContextType {
    notifications: NotificationData[];
    showNotification: (notification: Omit<NotificationData, 'id'>) => void;
    hideNotification: (id: number) => void;
    clearAllNotifications: () => void;
}

// 알림 컨텍스트 생성
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// 알림 프로바이더 컴포넌트
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);

    const showNotification = (notification: Omit<NotificationData, 'id'>) => {
        const id = Date.now().toString();
        const newNotification: NotificationData = {
            id,
            duration: 5000, // 기본 5초
            ...notification
        };

        setNotifications(prev => [...prev, newNotification]);

        // 자동 제거
        if (newNotification.duration !== 0) {
            setTimeout(() => {
                hideNotification(id);
            }, newNotification.duration);
        }
    };

    const hideNotification = (id: number) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    const clearAllNotifications = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            showNotification,
            hideNotification,
            clearAllNotifications
        }}>
            {children}
            <NotificationContainer />
        </NotificationContext.Provider>
    );
};

// 알림 컨테이너 컴포넌트
const NotificationContainer: React.FC = () => {
    const { notifications, hideNotification } = useContext(NotificationContext)!;

    const getAlertIcon = (type: NotificationType) => {
        switch (type) {
            case 'success':
                return <CheckCircle />;
            case 'error':
                return <Error />;
            case 'warning':
                return <Warning />;
            case 'info':
                return <Info />;
            default:
                return null;
        }
    };

    const getAlertColor = (type: NotificationType) => {
        switch (type) {
            case 'success':
                return '#4caf50';
            case 'error':
                return '#f44336';
            case 'warning':
                return '#ff9800';
            case 'info':
                return '#2196f3';
            default:
                return '#757575';
        }
    };

    return (
        <>
            {notifications.map((notification, index) => (
                <Snackbar
                    key={notification.id}
                    open={true}
                    autoHideDuration={notification.duration}
                    onClose={() => hideNotification(notification.id)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    TransitionComponent={(props: SlideProps) => (
                        <Slide {...props} direction="left" />
                    )}
                    sx={{
                        zIndex: 9999,
                        '& .MuiSnackbar-root': {
                            top: 20 + (index * 80)
                        }
                    }}
                >
                    <Alert
                        onClose={() => hideNotification(notification.id)}
                        severity={notification.type}
                        variant="filled"
                        icon={getAlertIcon(notification.type)}
                        sx={{
                            minWidth: 300,
                            maxWidth: 400,
                            backgroundColor: getAlertColor(notification.type),
                            color: 'white',
                            '& .MuiAlert-icon': {
                                color: 'white'
                            },
                            '& .MuiAlert-message': {
                                color: 'white'
                            },
                            '& .MuiAlert-action': {
                                color: 'white'
                            }
                        }}
                        action={notification.action}
                    >
                        {notification.title && (
                            <AlertTitle sx={{ color: 'white', fontWeight: 600 }}>
                                {notification.title}
                            </AlertTitle>
                        )}
                        {notification.message}
                    </Alert>
                </Snackbar>
            ))}
        </>
    );
};

// 커스텀 훅
export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

// 편의 함수들
export const showSuccessNotification = (message: string, title?: string) => {
    // 이 함수는 useNotification 훅을 사용하는 컴포넌트에서 호출해야 합니다
    return { type: 'success' as const, message, title };
};

export const showErrorNotification = (message: string, title?: string) => {
    return { type: 'error' as const, message, title };
};

export const showWarningNotification = (message: string, title?: string) => {
    return { type: 'warning' as const, message, title };
};

export const showInfoNotification = (message: string, title?: string) => {
    return { type: 'info' as const, message, title };
}; 