# 파일럿 오픈 체크리스트

> 상세 계획: `docs/07-launch-plan.md` · 결정/근거: `context-notes.md`
> 원칙: 청크 단위 진행. 각 항목 완료 시 [x] + 검증 방법 메모.

## P0. 기반 세팅
- [x] 파일럿 계획 문서 3종 작성 (07-launch-plan / checklist / context-notes)
- [ ] 레포 레이아웃 확정 — `backend/` 신설 위치 합의
- [ ] 백엔드 리드 서브에이전트 스폰 방식 확정

## P1. 백엔드 기반 + 프론트 영속화
- [~] 프론트 데이터 접근 추상화 계층 — `lib/storage.js` 어댑터 도입, launcherConfig·channelConfig 전환 완료(동작 불변, 검증 OK). 남은 소비처: BotCanvasPage·DashboardPage·BotWorkspaceLayout(다음 청크)
- [ ] 백엔드: Spring Boot 프로젝트 골격 + MySQL 연결 + schema.sql 적용
- [ ] 백엔드: 인증(JWT) + workspace 테넌트 격리
- [ ] 백엔드: 봇/시나리오/설정(런처)/채널/버전 CRUD REST API
- [ ] 프론트: repository 계층을 API 클라이언트로 교체 + 로그인 화면
- [ ] 검증: 두 브라우저에서 동일 계정 봇 공유 확인

## P2. 발행 + 런타임 + 위젯
- [ ] 발행/롤백 플로우 (bot_deployment_versions + 발행 UI)
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
