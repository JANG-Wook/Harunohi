# 파일럿 오픈 체크리스트

> 상세 계획: `docs/07-launch-plan.md` · 결정/근거: `context-notes.md`
> 원칙: 청크 단위 진행. 각 항목 완료 시 [x] + 검증 방법 메모.

## P0. 기반 세팅
- [x] 파일럿 계획 문서 3종 작성 (07-launch-plan / checklist / context-notes)
- [ ] 레포 레이아웃 확정 — `backend/` 신설 위치 합의
- [ ] 백엔드 리드 서브에이전트 스폰 방식 확정

## P1. 백엔드 기반 + 프론트 영속화
- [x] 프론트 데이터 접근 추상화 계층 — `lib/storage.js` 어댑터 도입. launcherConfig·channelConfig + 소비처 3곳(BotCanvasPage·DashboardPage·BotWorkspaceLayout) 전환 완료. 동작 불변, 미리보기 검증 OK(런처/채널/봇목록/캔버스). 남은 `window.localStorage` 는 `useTheme.js`(UI 전용)뿐
- [x] 백엔드: Spring Boot 프로젝트 골격 + MySQL 연결 + schema.sql 적용 — `backend/` (Gradle+Java21+SB3.5.3), env 기반 datasource(비번 커밋X), Flyway V1=schema.sql, JPA validate, `/actuator/health`+`/api/ping`. `./gradlew compileJava` 통과(exit 0). bootRun 은 MySQL 필요(미실행)
- [x] 백엔드: 인증(JWT) + workspace 테넌트 격리 — Spring Security+JWT(HS256, JWT_SECRET env 전용), BCrypt, User/WorkspaceMember, register/login/me, 워크스페이스 생성 시 owner 멤버십, /api/workspaces/** 멤버십 검증(403 vs 404), 로그인 실패 일반화(OWASP). compileJava 통과. 남음: refresh 토큰, role별 권한 세분화
- [~] 백엔드: CRUD REST — Workspace/Bot **식별·메타** CRUD 완료(엔티티·리포·서비스·DTO·전역예외, ULID public_id, compileJava 통과). 남음: 봇 정의(그래프) 영속화·발행, 설정(런처)/채널(스키마 미존재 → 추가 필요), status/intent_mode enum 검증
- [~] 프론트: API 연동 — ① 로그인 완료. **②-a 완료**(대시보드 서버 전환). **②-b 완료**: 캔버스 서버 로드(async 게이트)+저장/발행/삭제/버전전환 API remap, 봇 이름 서버 로드/변경, appliedLauncherId 클라이언트 보관, 버전 edit 비활성. **읽기 경로 E2E 검증됨**(캔버스가 서버 버전 로드). ⚠️ **쓰기(저장/발행) UI E2E 미검증** — 앱의 기존 '미완성 스텝' 검증이 저장 버튼을 막아 완성 봇 필요. 백엔드 createVersion/publish 는 201 검증. → deferred.md. 남음: ③ 발행 UI
- [ ] 검증: 두 브라우저에서 동일 계정 봇 공유 확인

## P2. 발행 + 런타임 + 위젯
- [~] 발행/롤백 플로우 — **백엔드 완료**(Flyway V2 bot_versions, 버전 CRUD·발행·롤백·배포이력, 공개 무인증 `GET /api/public/bots/{bot}/deployment`, 실DB 스모크 통과). 남음: 발행 UI(프론트)
- [ ] 공개 챗룸 라우트 `/c/<channelId>` (배포 버전 로드 → ChatRoom + simulatorRuntime)
- [ ] Vanilla JS iframe 위젯 스니펫 (채널 상세 URL/HTML 실동작)
- [ ] API 호출 시크릿 서버 프록시
- [ ] 검증: 외부 정적 HTML에 스니펫 삽입 → 위젯에서 실제 대화

## P3. 인프라 (Naver Cloud)
- [ ] 서버/컨테이너 + Cloud DB for MySQL + Object Storage
- [ ] 도메인 + HTTPS(Certificate) + CDN
- [ ] CI/CD (ci.yml 확장 → 빌드·배포)

## P4. 파일럿 하드닝
- [ ] 보안: HTTPS 강제 / JWT / 시크릿매니저 / CORS·CSP
- [ ] 대화 로그 PII 마스킹 + 보존정책
- [ ] 테넌트 데이터 격리 검증
- [ ] 백업 + 기본 모니터링/로그
- [ ] 파일럿 고객사 온보딩 가이드

## 보류 (정식 오픈)
- [ ] 의도추론(FastAPI) / RAG(Qdrant) / 지식베이스 UI
- [ ] 서버측 대화 엔진 전환
