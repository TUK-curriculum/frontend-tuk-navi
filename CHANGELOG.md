# Changelog

All notable changes to this project will be documented in this file.

## [1.0.1] - 2025-07-16
### 수정사항
- Git merge 충돌 상황 해결 및 저장소 상태 정상화

---

## [1.0.0] - 2025-07-14
### Added
- Unified `SeparatedDataContext` replacing legacy duplicated contexts.
- Strict TypeScript interfaces across the entire codebase (`noImplicitAny` passes).
- Repository–Service architecture with Axios HTTP client and interceptors.
- Mock API layer & realistic test data (Faker.js) under `src/mocks`.
- Complete documentation set: `SERVICE_LAYER_ARCHITECTURE.md`, `SEPARATED_DATA_ARCHITECTURE.md`, `PROJECT_OPTIMIZATION_SUMMARY.md`, `SECURITY_GUIDE.md`.
- Performance utilities (`performanceMonitor`, lazy-loaded components, code-splitting).
- Storybook-ready reusable UI components (`src/components/common/*`).

### Changed
- Replaced direct localStorage helpers with typed `SeparatedDataManager`.
- Optimised rendering logic in heavy components (`MemoApp`, dashboard widgets).
- Updated build scripts, Tailwind config, ESLint config for stricter linting.

### Fixed
- Eliminated memory leaks (cleanup for observers, timers, TipTap editor).
- Resolved cyclic dependencies & broken imports after context refactor.
- Fixed broken dark-mode styles & inconsistent theming.

### Removed
- Deprecated utilities: `localUser`, `storage`, `useLocalUser`, etc.
- Unused images and duplicate style sheets.

---
*Generated automatically as part of the v1.0.0 optimisation refactor.* 