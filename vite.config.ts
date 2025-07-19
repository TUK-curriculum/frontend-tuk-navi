import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@repositories': path.resolve(__dirname, './src/repositories'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@config': path.resolve(__dirname, './src/config'),
      '@mocks': path.resolve(__dirname, './src/mocks'),
      '@assets': path.resolve(__dirname, './src/assets'),
    }
  },
  optimizeDeps: {
    include: [
      '@fullcalendar/react',
      '@fullcalendar/core',
      '@fullcalendar/daygrid',
      '@fullcalendar/timegrid',
      '@fullcalendar/interaction',
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'react-router-dom',
      'zustand',
      'axios',
      'date-fns',
      'react-hook-form',
      '@tanstack/react-query'
    ]
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // Manual chunks for better code splitting
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'editor-vendor': ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-color', '@tiptap/extension-highlight', '@tiptap/extension-link', '@tiptap/extension-placeholder', '@tiptap/extension-text-align', '@tiptap/extension-text-style', '@tiptap/extension-underline'],
          'calendar-vendor': ['@fullcalendar/core', '@fullcalendar/react', '@fullcalendar/daygrid', '@fullcalendar/timegrid', '@fullcalendar/interaction'],
          'chart-vendor': ['recharts', 'victory'],
          'utils': ['date-fns', 'dayjs', 'colord', 'zod'],

          // Feature chunks
          'auth': [
            './src/pages/Login.tsx',
            './src/pages/Register.tsx',
            './src/contexts/AuthContext.tsx',
          ],
          'dashboard': [
            './src/pages/Dashboard.tsx',
            './src/components/StatsDrawer.tsx',
          ],
          'course': [
            './src/pages/CourseDetail.tsx',
            './src/pages/Curriculum.tsx',
            './src/pages/CompletedCourses.tsx',
            './src/components/modals/CourseDetailModal.tsx',
            './src/components/modals/CourseEditModal.tsx',
          ],
          'schedule': [
            './src/pages/Schedule.tsx',
            './src/components/timetable/TimetableGrid.tsx',
            './src/components/timetable/CourseBlock.tsx',
          ],
          'chatbot': [
            './src/pages/Chatbot.tsx',
            './src/components/common/ChatContainer.tsx',
            './src/components/common/ChatbotModal.tsx',
          ],
        },
        // Optimize chunk size
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          } else if (/woff|woff2|ttf|otf|eot/i.test(ext)) {
            return `fonts/[name]-[hash][extname]`;
          } else {
            return `[ext]/[name]-[hash][extname]`;
          }
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging
    sourcemap: false,
    // Optimize CSS
    cssCodeSplit: true,
    // Asset handling
    assetsInlineLimit: 4096,
  },
  server: {
    hmr: true,
    port: 3001,
    open: true,
  },
  preview: {
    port: 3001,
  },
  // Performance optimizations
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
})
