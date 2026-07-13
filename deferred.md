# 나중에 할 것 (Deferred) — 파일럿 오픈 관련

> 진행하며 의도적으로 미룬 항목의 단일 목록. 새로 생기면 계속 추가. 처리하면 체크.
> 상세 맥락: `context-notes.md`, 계획: `docs/07-launch-plan.md`, 진행: `checklist.md`

## 보안/인증
- [ ] JWT 알고리즘 **HS256 고정** — 현재 키 길이(52바이트)로 jjwt가 HS384 자동 선택. JwtService에서 명시.
- [ ] 로그인 **rate-limit / brute-force 방어** (파일럿 하드닝).
- [ ] **refresh 토큰** — 현재 access-only.
- [ ] **role별 권한 세분화** — 현재 워크스페이스 멤버십 유무만 확인. role='owner' 저장하나 액션별 강제 없음.
- [ ] 공개 배포 스냅샷(`/api/public/.../deployment`) 내 **시크릿 제거** — API 키 등은 서버 프록시 청크에서 처리.
- [ ] 대화 로그 **PII 마스킹 + 보존정책**.

## 백엔드 데이터/API
- [ ] **버전 이름/설명 수정** 엔드포인트(PATCH version) — ②-b에서 제외. 되살리면 VersionManagerModal 수정 재활성화.
- [ ] 정규화 **scenarios/nodes/edges 테이블** 사용 — 현재 JSON 스냅샷(`bot_versions.definition_json`). 정식 오픈 때 재검토.
- [ ] **런처/채널 서버 영속화**(Flyway V3) — 현 schema에 테이블 없음. 프론트는 localStorage.
- [ ] **appliedLauncherId 서버화** — 현재 클라이언트(`harunohi.botui.<botPublicId>`). 런처 서버화와 함께.
- [ ] `status`/`intent_mode` **enum 검증** — 현재 자유 문자열.

## 프론트/런타임
- [x] ~~②-b 쓰기 경로 UI E2E 검증~~ — 완성 봇으로 UI 저장→재로드 왕복 확인 완료(서버 버전 생성·재로드). 발행은 버튼 미연결이라 ③으로.
- [ ] **발행 UI**(③) — 발행/롤백 버튼을 레이아웃에 연결(백엔드·핸들러는 완료, `handlePublish` 가 아직 어떤 버튼에도 바인딩 안 됨).
- [ ] **공개 챗룸 라우트 + 위젯 스니펫**(Vanilla JS iframe) — 공개 배포 API 사용.
- [ ] **위젯 대화 런타임** — JS 런타임(simulatorRuntime) 공유. 세션 기록(`session_messages`).
- [ ] 로컬 기존 봇(localStorage) → 서버 **마이그레이션 도구** — 현재 없음(수동 재작성).

## 파일럿 제외(정식 오픈)
- [ ] 의도추론(FastAPI) / RAG(Qdrant) / 지식베이스 UI.
- [ ] 서버측 대화 엔진 전환 — 현재 JS 런타임 공유.

## 인프라/운영
- [ ] **Naver Cloud** 인프라 + CI/CD + HTTPS + 도메인 + CDN.
- [ ] 운영 DB **MySQL 8.x** — 로컬은 9.6(Flyway 미검증 경고).
- [ ] 백업 + 모니터링/로그 + 테넌트 격리 검증 + 파일럿 온보딩 가이드.
