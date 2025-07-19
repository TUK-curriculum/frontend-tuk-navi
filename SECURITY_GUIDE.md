# 🔒 페이지 보안 가이드

> 새로운 페이지 추가 시 보안 설정 방법

## 📋 보호된 페이지 추가

### 1. 페이지 생성
```tsx
// src/pages/NewPage.tsx
import { useAuth } from '../contexts/AuthContext';

const NewPage = () => {
  const { user } = useAuth();
  
  return (
    <div>
      <h1>새 페이지</h1>
      <p>안녕하세요, {user?.name}님!</p>
    </div>
  );
};

export default NewPage;
```

### 2. 라우트 추가
```tsx
// App.tsx에 추가
<Route path="/new-page" element={
  <ProtectedRoute>
    <NewPage />
  </ProtectedRoute>
} />
```

### 3. 보안 경로 등록
다음 파일들에 경로 추가:

**src/components/AuthGuard.tsx**
```tsx
const protectedPaths = [
  '/dashboard',
  '/curriculum', 
  '/schedule',
  '/new-page'  // ← 추가
];
```

**src/utils/authUtils.ts**
```tsx
const protectedPaths = [
  '/dashboard',
  '/curriculum',
  '/schedule', 
  '/new-page'  // ← 추가
];
```

## 🔓 공개 페이지 추가

공개 페이지는 `ProtectedRoute` 없이 바로 추가:

```tsx
// App.tsx
<Route path="/public-page" element={<PublicPage />} />
```

## ✅ 체크리스트

### 보호된 페이지:
- [ ] `ProtectedRoute`로 감싸기
- [ ] `AuthGuard.tsx`에 경로 추가  
- [ ] `authUtils.ts`에 경로 추가
- [ ] `useAuth()` 훅 사용

### 공개 페이지:
- [ ] `ProtectedRoute` 사용 안함
- [ ] 보안 경로에 추가 안함

## 🚀 자동화

새 페이지 자동 생성:
```bash
npm run create-page MyPage protected  # 보호된 페이지
npm run create-page PublicPage public # 공개 페이지
``` 