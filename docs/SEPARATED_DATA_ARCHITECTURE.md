# 📊 데이터 아키텍처 (2025-07-16 최신)

## 🎯 개요
TUK-NAVI는 프론트엔드와 백엔드 모두에서 "도메인별 분리"와 "유저별 독립 데이터 관리"를 지향합니다. 실제 구현 및 경험을 바탕으로, 데이터 구조와 동기화, 마이그레이션, 장단점, 실전 이슈까지 모두 반영합니다.

---

## 🔄 데이터 구조 및 동기화

### 프론트엔드 구조 (frontend-tuk-navi)
- **분리 원칙**: 각 도메인(프로필, 졸업정보, 커리큘럼, 시간표, 메모 등)을 별도 스토리지/상태로 관리
- **파일/모듈**:
  - `types/separated-user.ts`: 도메인별 타입 정의
  - `utils/separatedDataManager.ts`: 도메인별 localStorage 관리, CRUD, 마이그레이션
  - `contexts/SeparatedDataContext.tsx`: 도메인별 상태/액션 제공, useData 훅
- **실제 구조 예시**
  ```json
  // localStorage 예시
  user_email_profile: { ... }
  user_email_graduation: { ... }
  user_email_curriculum: { ... }
  user_email_schedule: { ... }
  user_email_notes: [ ... ]
  ```
- **동기화**: 프론트엔드에서 도메인별로 필요한 데이터만 로드/저장, 변경시 해당 도메인만 갱신

### 백엔드 구조 (backend-tuk-navi)
- **분리 원칙**: 각 도메인별로 독립된 모델/테이블/컬렉션 관리 (user, profile, graduation, curriculum, note 등)
- **파일/모듈**:
  - `models/` 폴더: 도메인별 Mongoose/Sequelize 모델
  - `controllers/`: 도메인별 API 엔드포인트
  - `service/`: 도메인별 비즈니스 로직
  - `api/openapi.yaml`: 전체 API 스펙 및 도메인별 contract
- **실제 구조 예시**
  ```js
  // MongoDB/SQL 예시
  users: [ { _id, email, ... } ]
  profiles: [ { userId, ... } ]
  graduations: [ { userId, ... } ]
  curriculums: [ { userId, ... } ]
  notes: [ { userId, ... } ]
  ```
- **동기화**: API 레이어에서 도메인별 CRUD 제공, 프론트와 contract-first 방식으로 연동

---

## 🛠️ 마이그레이션 및 실전 이슈
- **자동 마이그레이션**: 기존 통합 데이터 → 도메인별 분리 구조로 자동 변환 (프론트 utils/migrationUtils.ts)
- **실전 이슈**:
  - 프론트/백엔드 데이터 구조 불일치 시 동기화 오류, 파싱 에러 빈번
  - 도메인별로 타입/스키마/필드가 달라질 때마다 contract 재점검 필요
  - 마이그레이션/동기화 실패 시 데이터 유실 위험

---

## 💡 장점
1. **효율성**: 필요한 도메인만 로드/저장, 성능 최적화
2. **확장성**: 새 도메인/기능 추가 용이, 유지보수성 향상
3. **안정성**: 도메인별 독립 관리로 장애 전파 최소화
4. **계약 기반**: OpenAPI 등 contract-first로 프론트-백엔드 동기화

## ⚠️ 한계 및 주의점
- 프론트/백엔드 데이터 구조가 어긋나면 동기화/마이그레이션 이슈 발생
- 도메인별 contract/타입/스키마 변경 시 반드시 양쪽 모두 반영 필요
- 실제 운영에서는 데이터 유실/불일치 방지 로직 필수

---

## 📚 참고/실전 코드
- 프론트: `src/types/separated-user.ts`, `src/utils/separatedDataManager.ts`, `src/contexts/SeparatedDataContext.tsx`
- 백엔드: `models/`, `controllers/`, `service/`, `api/openapi.yaml`
- 마이그레이션: `src/utils/migrationUtils.ts`

---

> 본 문서는 2025-07-16 기준, 실제 프로젝트 구조와 경험을 바탕으로 최신화되었습니다. 