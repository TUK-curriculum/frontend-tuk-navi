# 🔧 서비스 레이어 아키텍처

> TUK-NAVI 프론트엔드의 깔끔한 아키텍처 설계

## 📁 구조

```
src/
├── components/    # UI 컴포넌트
├── pages/        # 페이지 컴포넌트  
├── contexts/     # 상태 관리 (Context API)
├── types/        # TypeScript 타입
├── utils/        # 유틸리티 함수
├── services/     # 비즈니스 로직 (향후 백엔드 연동용)
└── mocks/        # Mock 데이터
```

## 🎯 핵심 특징

### 1. 컴포넌트 기반
- 재사용 가능한 UI 컴포넌트
- 페이지별 독립적인 구조

### 2. Context API 상태 관리
- 전역 상태 관리 (AuthContext, DataContext)
- props drilling 방지

### 3. TypeScript 타입 안전성
- 엄격한 타입 정의
- 런타임 에러 최소화

### 4. 확장 가능한 설계
- 백엔드 연동 준비 완료
- Mock 데이터로 프론트엔드 우선 개발

## 🛠️ 구현 예시

### Context 사용
```typescript
// 인증 상태 관리
const { user, login, logout } = useAuth();

// 데이터 관리  
const { profile, updateProfile } = useData();
```

### 컴포넌트 구조
```typescript
// 재사용 가능한 UI 컴포넌트
<StyledButton variant="primary">버튼</StyledButton>
<GlassCard>카드 내용</GlassCard>
```

## 📈 장점

1. **개발 속도**: 컴포넌트 재사용으로 빠른 개발
2. **유지보수**: 명확한 구조로 쉬운 관리
3. **확장성**: 백엔드 연동 시 최소한의 수정
4. **타입 안전성**: TypeScript로 안정적인 코드 