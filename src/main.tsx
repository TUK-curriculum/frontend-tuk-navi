import { StrictMode, Suspense, Component, ErrorInfo, ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material'
import { environment } from './config/environment'

// Performance monitoring setup
if (environment.production) {
  // Web Vitals monitoring - dynamically import to avoid bundle size in dev
  import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
    const vitalsHandler = (metric: any) => {
      // Send to analytics service (Google Analytics, etc.)
      console.info('Performance Metric:', metric);

      // You can integrate with your analytics service here
      // Example: gtag('event', metric.name, { value: metric.value });
    };

    onCLS(vitalsHandler);
    onFID(vitalsHandler);
    onFCP(vitalsHandler);
    onLCP(vitalsHandler);
    onTTFB(vitalsHandler);
  }).catch(error => {
    console.warn('Web Vitals monitoring failed to load:', error);
  });

  // Global error reporting
  window.addEventListener('error', (event) => {
    console.error('Global error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
    // Send to error reporting service
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // Send to error reporting service
  });
}

// 최상위 로딩 컴포넌트
const AppLoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      transition: 'all 0.3s ease-in-out'
    }}
  >
    <CircularProgress
      size={60}
      sx={{
        color: '#0ea5e9',
        '& .MuiCircularProgress-circle': {
          strokeLinecap: 'round',
        }
      }}
    />
    <Typography
      variant="body1"
      sx={{
        mt: 2,
        color: '#64748b',
        fontWeight: 500,
        textAlign: 'center'
      }}
    >
      TUK NAVI를 시작하고 있습니다...
    </Typography>
  </Box>
)

// 에러 바운더리 상태 타입
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Send error to monitoring service in production
    if (environment.production) {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      // Send to error reporting service
      console.error('Production error report:', errorData);

      // You can integrate with error reporting services here
      // Example: Sentry.captureException(error, { extra: errorData });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            p: 3
          }}
        >
          <Alert
            severity="error"
            sx={{ mb: 2, maxWidth: 600 }}
            action={
              <Button color="inherit" size="small" onClick={() => window.location.reload()}>
                새로고침
              </Button>
            }
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              애플리케이션 오류가 발생했습니다
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {this.state.error?.message || '알 수 없는 오류가 발생했습니다.'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
            </Typography>
            {!environment.production && this.state.error?.stack && (
              <details style={{ marginTop: '1rem' }}>
                <summary style={{ cursor: 'pointer' }}>오류 세부정보</summary>
                <pre style={{ fontSize: '0.75rem', overflow: 'auto', maxHeight: '200px' }}>
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </Alert>
          <Button variant="contained" onClick={this.handleReset} sx={{ mt: 2 }}>
            다시 시도
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

// 앱 시작
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<AppLoadingFallback />}>
          <App />
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
