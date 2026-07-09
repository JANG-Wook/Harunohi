# Context Notes — 파일럿 오픈

> 작업 중 내린 결정과 근거를 계속 추가. 다음 세션이 재유도 없이 이어받도록.

## 2026-07-07 — 방향 확정
- **목표**: 고객사 파일럿(제한 실사용), 백엔드 포함, Naver Cloud 호스팅.
- **결정 A (대화 런타임)**: JS 런타임 공유. `simulatorRuntime.js`(검증된 503줄 순수 상태머신)를 위젯이 재사용. 서버 엔진 재작성 안 함 → 파일럿 최속. 근거: 재작성 시 로직 중복·표류 위험 + 개발량 급증.
- **결정 B (위젯)**: Vanilla JS + iframe → 공개 챗룸 `/c/<channelId>` 로드. 근거: CSS 격리·보안. 채널 상세의 URL/HTML 플레이스홀더가 이미 이 형태.
- **결정 C (의도추론/RAG)**: 파일럿 **제외**. 사용자 명시("RAG는 정말 나중에"). 파일럿 봇은 메뉴/버튼/기능시나리오 중심 가정.
- **백엔드 주체**: 전담 팀 없음 → 백엔드 리드 **서브에이전트**가 담당. 위치는 리포 내 `backend/`(Spring Boot) 신설 예정.
- **토큰 제약**: 사용 가능 토큰이 적을 수 있음 → **청크 단위**로 쪼개 진행. 각 청크 전 계획 보고·승인.

## 확인된 사실 (코드 검증)
- `db/schema.sql` 이미 전체 테이블 설계 완료 → DB는 매핑 작업이지 설계 아님.
- 프론트 데이터 접근 집중처: `lib/launcherConfig.js`, `lib/channelConfig.js`, `lib/stepTypes.js` + 소비처 `pages/BotCanvasPage.jsx`, `pages/DashboardPage.jsx`, `layout/BotWorkspaceLayout.jsx`. `lib/useTheme.js` 는 UI 전용(전환 대상 아님). → API 전환 표면이 작고 잘 모여 있음.
- localStorage 키 규약: 봇 `harunohi.bot.<encodeURIComponent(name)>`, 런처 `harunohi.launcher.<id>`, 채널 `harunohi.channel.<id>`, 테마 `harunohi.theme`.

## 열린 결정 (다음에 정할 것)
- `backend/` 를 이 리포에 둘지 vs 별도 리포 — 우선 이 리포 `backend/` 로 가정.
- 인증 범위(단일 관리자 계정 vs 다중 사용자) — 파일럿 최소치로 시작.
- Naver Cloud 세부 서비스 선택은 P3 에서.

## 2026-07-07 — 청크: storage 어댑터
- `lib/storage.js` 신설 — localStorage 접근 단일화(readRaw/writeRaw/remove/keys, SSR 안전).
- `launcherConfig.js`·`channelConfig.js` 를 어댑터 경유로 전환. **동작·키 규약 불변**, 미리보기 회귀 검증 완료(런처 목록·채널 빈상태 정상, 콘솔 에러 0).
- **소비처 3곳 통일 완료(청크 2/2)**: `DashboardPage`(loadBotList/생성/삭제/이름변경), `BotCanvasPage`(loadFromStorage/writeToStorage), `BotWorkspaceLayout`(이름변경) 전부 어댑터 경유. 검증: 봇 목록·캔버스 로드 정상, 에러 0. 남은 `window.localStorage` 는 `lib/useTheme.js`(UI 전용, 전환 대상 아님)뿐.
- 향후 API 전환: 지금은 동기. API는 비동기라 소비처 함수 시그니처가 async 로 바뀌는 별도 큰 청크가 뒤따름.

## 2026-07-07 — 청크: 백엔드 골격 (서브에이전트)
- `backend/` 신설(Gradle Groovy + Java 21 + Spring Boot 3.5.3). 패키지 base `net.infobank.harunohi`.
- deps: web, data-jpa, actuator, validation, flyway-core, flyway-mysql, mysql-connector-j. (security/auth 스타터 아직 없음)
- `application.yml`: datasource env 기반, **비밀번호 기본값 없음(env 전용, 커밋 금지)**, URL/username 만 로컬 기본값. JPA `ddl-auto=validate`(Flyway 소유). actuator `health` 만 노출, show-details=never.
- Flyway `V1__init.sql` = `db/schema.sql` **verbatim 복사**(이후 단일 소스). 헬스: `/actuator/health` + 커스텀 `GET /api/ping`.
- Gradle wrapper 커밋(8.14). 검증: `./gradlew compileJava` 통과(exit 0, 독립 재확인). bootRun 은 MySQL 필요라 미실행.
- **미결(후속 청크)**: 인증(JWT+security), 도메인/엔티티/리포지토리/CRUD 컨트롤러, 대화 런타임·위젯 API. domain/repository/service/config 는 package-info 플레이스홀더만.

## 2026-07-07 — 청크: Workspace/Bot 식별·메타 CRUD (서브에이전트)
- 엔티티 Workspace/Bot(@Table 매핑, id IDENTITY, DATETIME(6)→Instant), 리포/서비스/DTO(엔티티 비노출)/`@RestControllerAdvice`(404/400).
- public_id = ULID(26자). 의존성 `com.github.f4b6a3:ulid-creator:5.2.3` 추가. placeholder package-info 4개 제거.
- 엔드포인트: `POST/GET /api/workspaces`, `GET /api/workspaces/{ws}`, `POST/GET /api/workspaces/{ws}/bots`, `GET/PATCH/DELETE .../bots/{bot}`. 봇은 workspace 스코프(교차 조회 시 404).
- 검증: `./gradlew compileJava` 통과(독립 재실행 exit 0). 실DB 기동은 MySQL 필요라 미실행.
- **미결/주의**: 봇 정의(그래프) 영속화·발행(`bot_deployment_versions.snapshot_json`)·인증 미착수. `published_version_id`·`widget_settings_json` 미매핑(null). `status`/`intent_mode` 는 자유문자열(enum 검증 없음) — 필요시 후속. **런처/채널은 schema.sql 에 테이블 없음** → 백엔드 영속화하려면 스키마 추가 필요(프론트는 현재 localStorage).

## 2026-07-08 — 청크: 인증(JWT) + 테넌트 격리 (서브에이전트)
- Spring Security(stateless, csrf off) + JWT(HS256, jjwt 0.12.6). `JWT_SECRET` env 전용·기본값 없음, 32바이트 미만이면 startup 예외(fail-fast). access-exp-min 기본 120.
- 엔티티 User/WorkspaceMember + 리포. AuthService(BCrypt). CurrentUserProvider(SecurityContext→User).
- 엔드포인트: `POST /api/auth/register`(중복 409, 워크스페이스 생성 안 함), `POST /api/auth/login`(실패 401 일반 메시지=이메일 존재여부 비노출, OWASP), `GET /api/me`. permitAll: auth/**·ping·actuator/health, 그 외 authenticated.
- 테넌트 격리: `POST /api/workspaces`=생성+owner 멤버십(트랜잭션), `GET /api/workspaces`=내 멤버십만, `/api/workspaces/{ws}/**`=멤버십 검증(없음 404 / 멤버아님 403). BotService/Controller·WorkspaceService 수정됨.
- password_hash 는 DTO 비노출, 평문 로깅 없음. 검증: compileJava 통과(exit 0 재확인). 실DB 미기동.
- **미결**: refresh 토큰(access-only), role별 권한 세분화(멤버십 유무만 확인, role='owner' 저장하나 액션별 강제 안 함), 봇 정의 영속화/발행, 대화 런타임/위젯.

## 2026-07-09 — 청크: 실 MySQL 기동 검증 + 스모크 테스트 (서브에이전트)
- 로컬 MySQL 9.6(Homebrew) 사용. DB `harunohi`, 계정 harunohi/harunohi_dev_pw(로컬 전용). Flyway V1 정상 적용(스키마 문제 없음).
- JPA validate 불일치 수정(스키마 불변, 엔티티 정렬): public_id 3곳 `columnDefinition="char(26)"`, Bot.description `TEXT`. 그 외 일치.
- **완전 기동 성공**(Started, 2.7s) + 스모크 10단계 전부 통과: ping/health 200, register 201, login 200(JWT), me 200, 워크스페이스 생성/목록 201/200, 봇 생성/목록 201/200, 무인증 401(테넌트 가드).
- **주의**: jjwt 가 키 길이(52바이트)로 **HS384 자동 선택**(HS256 아님) — 유효하지만 HS256 고정 원하면 JwtService 에서 알고리즘 명시 필요(소규모 후속).
- 서버는 검증 후 정상 종료(8080 free). MySQL 9.6 은 Flyway 공식 지원 범위 밖(경고만, 동작 OK) — 운영은 MySQL 8.x 권장(tech-stack 문서와 일치).

## 2026-07-09 — 청크: 봇 정의 영속화 + 발행/롤백 + 공개 배포 API (서브에이전트)
- **설계 결정**: 작업 버전도 JSON 스냅샷(`bot_versions.definition_json LONGTEXT`). 정규화 scenarios/nodes/edges 는 파일럿 미사용(정식 오픈 때 재검토). 프론트 versions[] 모델과 1:1.
- Flyway **V2**: bot_versions(UNIQUE(bot_id,name)) + bots.current_version_id(FK, SET NULL). `db/schema.sql` 은 V1 그대로(V2 는 backend 마이그레이션에만 존재 — 주의).
- REST: versions CRUD(중복 409, 마지막 삭제 409, current 자동 이동), PUT current, POST publish(→bot_deployment_versions 복사, published_version_id, status=active), POST rollback, GET deployments(메타만).
- **공개 무인증** `GET /api/public/bots/{botPublicId}/deployment` → snapshot+botName (위젯용). SecurityConfig `/api/public/**` permitAll.
- definitionJson: Jackson 유효성만 검사 + 2MB 상한(400). 실DB 스모크 전 단계 통과(발행→공개조회→롤백→public 이 v1 snapshot 반환, 무인증 workspaces 401).
- **미결**: 발행 UI(프론트), 위젯 런타임/대화 API, 세션 기록, 공개 스냅샷 내 시크릿 제거(서버 프록시 청크에서).

## 2026-07-09 — 청크: 프론트 API 클라이언트 + 로그인 (서브청크 ①, 직접 구현)
- `lib/api.js`: fetch 래퍼 — `VITE_API_BASE_URL`(기본 http://localhost:8080), Bearer 자동 첨부, ApiError(status/message), 401 시 보관 인증 자동 삭제, 네트워크 실패 status 0.
- `lib/auth.js`: `harunohi.auth`(localStorage, storage.js 경유)에 {accessToken,user}. login/register/logout/getCurrentUser. api.js 와 순환 import 회피(동적 import).
- `/login` 페이지(LoginPage): 로그인/회원가입 토글, DS Textfield/Button, 에러는 비밀번호 필드 description. ConsoleLayout 헤더: 로그인 시 이름+로그아웃, 미로그인 시 로그인 버튼. **라우트 강제 가드는 의도적으로 미적용**(데이터가 아직 localStorage 라 백엔드 없이도 사용 가능해야 함) → 서브청크 ②에서 가드.
- 백엔드 CORS 추가: SecurityConfig `.cors()` + CorsConfigurationSource(`security.cors.allowed-origins`, env `CORS_ALLOWED_ORIGINS`, 기본 localhost:5173/5177/5178). ⚠️ application.yml 에 security: 키 중복 실수 있었음 — 병합으로 수정(중복 top-level 키 주의).
- E2E 검증(실 백엔드+미리보기): 회원가입→자동 로그인→/app/bots(토큰 180자 저장), 헤더 이름 표시, 로그아웃→/login, 잘못된 비번→401 일반 메시지 노출, 재로그인 성공. CORS preflight 200. 콘솔 에러 0. 테스트 계정 pilot-tester@example.com(로컬 DB).

## 2026-07-09 — 청크: ②-a botApi + 가드 + 대시보드 전환 (직접 구현)
- `lib/botApi.js`: ensureWorkspace(내 워크스페이스 없으면 "기본 워크스페이스" 자동 생성, **in-flight 프로미스 공유로 StrictMode 이중 이펙트 중복 생성 방지** — 실제로 중복 2개 생겼던 버그 발견 후 수정, 로컬 DB 수동 정리), 봇 CRUD + 버전/발행/롤백/배포이력 매핑(definitionJson stringify 포함).
- `components/RequireAuth.jsx` + App.jsx: 콘솔/봇작업/런처에디터 전체 로그인 가드. ConsoleLayout 로그아웃 시 resetWorkspaceCache.
- DashboardPage: 서버 전환 — listBots→카드(버전명/응답수는 ②-b 후 보강, null 이면 숨김), createBot→**publicId 라우팅**(`/app/bots/<publicId>/canvas`), patchBot 이름변경(모달 버튼 라벨 '변경'), deleteBot, 로딩/에러 상태. 이름 중복은 서버 미강제 → 목록 기준 소프트 검사.
- E2E(실 백엔드): 가드 리다이렉트 → 로그인 → 빈 목록 → 생성(서버 영속, ULID 라우트) → 카드 표시 → 이름변경 → 삭제 → 토스트. 콘솔 에러 0.
- **과도기 주의**: 캔버스(BotCanvasPage)는 아직 localStorage 를 읽음 → API 로 만든 봇의 캔버스는 빈 초기 상태로 열림. ②-b 에서 해소.

## 다음 청크 후보
1. 서브청크 ②-b: 캔버스/버전 전환(BotCanvasPage/BotWorkspaceLayout, definition_json 왕복) — 과도기 해소, 최우선.
2. 서브청크 ③: 발행 UI(버전 발행/롤백 버튼 연동).
3. 공개 챗룸 라우트 + 위젯 스니펫(공개 배포 API 사용).
2. 런처/채널 스키마 추가(Flyway V2) + CRUD (현 schema 에 없음).
3. 프론트: storage.js 뒤 API 클라이언트 + 로그인 화면 + 동기→비동기 전환(큰 청크).
2. 인증(JWT) + workspace 테넌트 격리.
3. 프론트: `storage.js` 뒤에 API 클라이언트 구현 추가 + 동기→비동기 소비처 전환(큰 청크).
