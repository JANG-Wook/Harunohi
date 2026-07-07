<!-- 고객사 파일럿 오픈 계획 — 범위·아키텍처 결정·단계·역할분담 -->

# 07. 고객사 파일럿 오픈 계획

## 1. 목표
- **범위**: 고객사 파일럿(제한 실사용). 소수 고객사가 로그인 → 봇 제작 → 발행 → 방문자가 고객사 사이트의 임베드 위젯으로 실제 대화.
- **호스팅**: Naver Cloud (검토 중).
- **성공 기준**: ① 빌더 로그인 ② 봇/설정이 서버에 영속(기기 무관) ③ 발행 시 위젯 반영 ④ 방문자가 시나리오·입력폼·API 응답까지 실제 대화 ⑤ 대화 로그 저장.

## 2. 확정된 아키텍처 결정
- **A. 대화 런타임 위치 = JS 런타임 공유.** 위젯이 `frontend/src/lib/simulatorRuntime.js`(503줄, UI 무관 순수 상태머신)를 그대로 재사용. 서버는 봇정의 제공 + API 프록시 + 세션 로그만 담당. (문서 목표인 서버측 엔진 전환은 정식 오픈 시.)
- **B. 임베드 위젯 = Vanilla JS + iframe.** 채널 스니펫이 우리 호스팅 공개 챗룸 `/c/<channelId>` 를 iframe 으로 로드. 채널 상세의 URL/HTML 플레이스홀더를 실제 라우트로 연결.
- **C. 의도추론(FastAPI)·RAG(Qdrant) = 파일럿 제외.** 파일럿 봇은 메뉴/버튼/기능시나리오 중심. 정식 오픈 때 재개.

## 3. 참고 자산 (이미 존재)
- `db/schema.sql` — 전체 데이터 모델 설계됨(workspaces/users/bots/scenarios/nodes/edges/variables/knowledge_bases/documents/bot_deployment_versions/sessions/session_messages/audit_logs). → DB 작업은 "설계"가 아니라 localStorage JSON ↔ 이 테이블 매핑.
- `frontend/src/lib/simulatorRuntime.js` — 대화 엔진(JS). 위젯·시뮬레이터 공용 자산.
- 프론트 데이터 접근부: `lib/launcherConfig.js`, `lib/channelConfig.js`, `lib/stepTypes.js` + 소비처 `pages/BotCanvasPage.jsx`, `pages/DashboardPage.jsx`, `layout/BotWorkspaceLayout.jsx`. (`lib/useTheme.js` 는 UI 전용, 유지)

## 4. 단계 (의존성 순)
- **P1 백엔드 기반 + 영속화**: Spring Boot API 골격 + MySQL(schema.sql) + 인증(JWT) + workspace 격리 + 봇/설정/채널/버전 CRUD REST. 프론트: 데이터 접근부를 API 클라이언트로 교체.
- **P2 발행 + 런타임 + 위젯**: 발행/롤백 플로우, 공개 챗룸 라우트 `/c/<channelId>`, Vanilla JS iframe 위젯 스니펫, API 시크릿 서버 프록시.
- **P3 인프라(Naver Cloud)**: 서버/컨테이너 + Cloud DB for MySQL + Object Storage + 도메인·HTTPS + CI/CD(`.github/workflows/ci.yml` 확장).
- **P4 파일럿 하드닝**: 보안(HTTPS·JWT·시크릿매니저·CORS/CSP), 대화 로그 PII 마스킹·보존정책, 테넌트 격리 검증, 백업, 모니터링, 온보딩 가이드.

## 5. 역할 분담
- **메인(프론트 리포)**: 프론트 API 연동 전환, 발행 UI, 공개 챗룸 라우트, 위젯 프론트, 스펙/문서, 빌드·환경변수화.
- **백엔드 리드(서브에이전트)**: `backend/`(Spring Boot) + MySQL + 인증 + REST API. 청크 단위로 스폰(토큰 절약).
- 위치: 백엔드는 동일 리포의 `backend/` 디렉터리에 신설(현재 `frontend/`, `db/`, `docs/` 와 나란히).

## 6. 보안/컴플라이언스 (인포뱅크 정책)
- 종단 사용자 대화에 PII 유입 가능 → 로그 마스킹·보존정책, 전구간 HTTPS, 시크릿은 코드/localStorage 금지·시크릿매니저, OWASP 기준 인증·인가·입력검증. 파일럿 전 체크리스트화.

## 7. 진행 원칙
- 토큰 절약 위해 **청크 단위**로 작업(한 번에 한 단계). 각 청크 전 계획 보고 → 승인 → 실행 → 검증.
- 진행 상태는 `checklist.md`, 결정·근거는 `context-notes.md` 에 계속 기록.
