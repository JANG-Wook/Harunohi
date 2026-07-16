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

## 검증 완료 (2026-07-16)
- [x] ~~대화 로그 저장(sessions/session_messages)~~ — 파일럿 성공기준 ⑤ 충족. 무인증 공개 대화방에서 세션 시작(POST `/api/public/bots/{id}/sessions` 201) + history 증분 적재(POST `/api/public/sessions/{sid}/messages` 204). 실 MySQL E2E: 방문당 1세션(chatLogApi 프로미스 캐시로 StrictMode 중복 제거), 트랜스크립트 3건(bot 웰컴→user-click "자주 묻는 질문"→bot 답변 "영업시간은 평일 9시~18시입니다.") 한 세션에 정확 적재, 한글 utf8mb4 정상. 최소 방어 상한 검증: sender 화이트리스트/빈 배열/배치 50/본문 32KB → 400, 없는 세션 → 404. 콘솔 에러 0. **JPA validate 통과**(신규 ChatSession/SessionMessage 엔티티 ↔ 기존 V1 테이블, `json` 컬럼 포함).

## 검증 완료 (2026-07-15)
- [x] ~~완성 봇으로 공개 대화 버튼 상호작용 데모~~ — 웰컴→'자주 묻는 질문' 버튼 클릭→답변 응답 진행. 무인증 `/c/<botPublicId>` 에서 스타일(프라이머리 #0066FF)·아바타·말풍선·상호작용 전부 정상, 콘솔 에러 0. 파일럿 방문자 경험 관통 확인.

## 발견된 갭 (2026-07-13 감사)
- [x] ~~위젯용 배포 스냅샷에 대화방 UI(런처) 미포함~~ — 1a 완료: 저장 시 `resolveChatUi` 결과를 정의에 포함(런처 없으면 defaultLauncherConfig 폴백). 공개 스냅샷 자급자족. 검증: 버전2·3 launcherUi true, 공개 배포 조회에도 반영.
- [ ] **대시보드 카드 메타 회귀** — 서버 전환 후 `toCard` 가 응답 개수·최신/배포 버전명을 null 로 둠(카드에서 사라짐). 버전 목록 API로 보강 필요.
- [ ] **배포 버전 추적 부정확** — 현재 `status==='active' ? currentVersionId : null` 근사. v1 발행 후 v2 저장(current=v2)하면 v2 가 배포본으로 잘못 표시. 정확히는 bots.published_version_id 를 DTO로 노출해 추적.
- [ ] **토큰 만료 중간 UX** — 401 시 api.js 가 인증을 지우지만 다음 내비게이션 전까지 화면 유지. 전역 만료 처리(즉시 /login) 필요.
- [ ] **회원가입 공개** — register 무제한 공개. 파일럿은 초대제/도메인 제한 검토.
- [ ] **비밀번호 재설정 / 이메일 인증 없음** — 파일럿 소수 사용자엔 후순위지만 기록.
- [ ] **2-브라우저 봇 공유 검증** — 서버 영속 후 동일 계정 크로스-브라우저 확인 미수행(checklist P1 잔여).
- [x] ~~채널 모달 봇 드롭다운 서버 연동~~(1c) — botApi.listBots 로 교체, 채널에 botId(publicId)+botName 저장, URL/HTML=`origin/c/<botPublicId>` iframe 스니펫. 완료·검증.
- [ ] **플로팅 런처 버튼 JS 위젯** — 현재 임베드는 iframe 직접 삽입. 고객사 사이트 우하단 플로팅 버튼→클릭 시 iframe 팝업 여는 Vanilla JS 스니펫(런처 버튼 디자인 활용)은 후속.
- [ ] **채널 서버 영속화(V3) + 채널 id 기반 라우팅** — 현재 채널은 클라이언트 전용, URL 은 botPublicId 직결. 채널을 서버화하면 `/c/<channelId>` 로 채널 단위(상담 여부 등) 제어 가능.

## 프론트/런타임
- [x] ~~②-b 쓰기 경로 UI E2E 검증~~ — 완성 봇으로 UI 저장→재로드 왕복 확인 완료(서버 버전 생성·재로드). 발행은 버튼 미연결이라 ③으로.
- [x] ~~발행 UI(③)~~ — 발행 버튼+확인 Alert 완료, E2E 검증. (아래 롤백만 남음)
- [ ] **발행 롤백 UI** — 배포 이력(deployments) 목록 + 이전 배포본으로 롤백 버튼(백엔드 rollback API 완료).
- [ ] **공개 챗룸 라우트 + 위젯 스니펫**(Vanilla JS iframe) — 공개 배포 API 사용.
- [x] ~~위젯 대화 런타임 + 세션 기록(`session_messages`)~~ — 공개 대화방이 서버에 대화 적재(2026-07-16 검증 완료 참고). 남은 후속은 아래 세 항목.
- [ ] **대화 로그 조회 UI** — 적재는 되나 대시보드/봇 상세에서 세션·메시지를 볼 화면이 없음. 조회용 인증 API(`GET /api/workspaces/{ws}/bots/{bot}/sessions` 등) + 뷰 필요.
- [ ] **세션 종료 처리** — 현재 status 항상 'active', ended_at NULL. 탭 종료(visibilitychange/pagehide) 또는 유휴 만료로 종료 표시 미구현.
- [ ] **로그 전송 rate-limit** — 무인증 쓰기 엔드포인트. 세션당 500건/본문 32KB/배치 50 상한만 존재. IP/세션 빈도 제한은 P4 하드닝(위 보안 섹션과 함께).
- [ ] 로컬 기존 봇(localStorage) → 서버 **마이그레이션 도구** — 현재 없음(수동 재작성).

## 파일럿 제외(정식 오픈)
- [ ] 의도추론(FastAPI) / RAG(Qdrant) / 지식베이스 UI.
- [ ] 서버측 대화 엔진 전환 — 현재 JS 런타임 공유.

## 인프라/운영
- [ ] **Naver Cloud** 인프라 + CI/CD + HTTPS + 도메인 + CDN.
- [ ] 운영 DB **MySQL 8.x** — 로컬은 9.6(Flyway 미검증 경고).
- [ ] 백업 + 모니터링/로그 + 테넌트 격리 검증 + 파일럿 온보딩 가이드.
