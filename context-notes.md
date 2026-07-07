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

## 다음 청크 후보
1. 백엔드 도메인/엔티티 + 기본 CRUD(workspace/bot/scenario/설정/채널) REST — schema.sql 기준 매핑.
2. 인증(JWT) + workspace 테넌트 격리.
3. 프론트: `storage.js` 뒤에 API 클라이언트 구현 추가 + 동기→비동기 소비처 전환(큰 청크).
