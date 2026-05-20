<!-- Harunohi 데이터 모델 — 엔티티별 상세 컬럼·관계·보관 정책 -->

# 03. 데이터 모델

## 1. 전체 관계도

```
   [workspaces] ─┬─ [workspace_members] ── [users]
                 │
                 └─ [bots] ─────────────────────────────────┐
                       │                                    │
       ┌───────────────┼────────────────┬──────────┐        │
       │               │                │          │        │
   [scenarios]    [knowledge_bases]   [bot_deployment_versions]  [sessions]
       │               │                                    │
       ├─ [nodes]      ├─ [documents]                       └─ [session_messages]
       │   └─ [edges]  │      └─ [document_chunks]
       │
       └─ [variables]
```

## 2. 보관 정책

| 데이터 | 보관 기간 | 처리 |
|--------|----------|------|
| 봇 정의·시나리오·노드·문서 | 영구 | 사용자가 삭제할 때까지 |
| 배포 버전 스냅샷 | 영구 | 롤백을 위해 |
| **대화 세션** | **1년** | 1년 경과 시 자동 삭제 (스케줄링) |
| **세션 메시지** | **1년** | 세션과 동시에 삭제 |
| 감사 로그 (가입, 배포 등) | 영구 | 보안·감사 목적 |

> 💡 1년치 메시지 로그가 부담스러우면 30일로 조정 가능. 초기에는 1년으로 시작하되 운영 데이터 보고 결정한다.
> 구현은 단순하게 `created_at` 인덱스 + 일 1회 cleanup cron으로. 데이터가 커지면 월 단위 파티셔닝으로 전환.

## 3. 엔티티 상세

### 3.1 workspaces (워크스페이스)

고객사 단위. 한 회사 = 한 워크스페이스.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK, AUTO | 내부 PK |
| public_id | CHAR(26) | UNIQUE, NOT NULL | 외부 노출용 ULID |
| name | VARCHAR(100) | NOT NULL | 워크스페이스 이름 |
| plan | VARCHAR(20) | NOT NULL, DEFAULT 'free' | 요금제 (free / pro / enterprise) |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'active' | active / suspended |
| created_at | DATETIME(6) | NOT NULL | 생성 시각 |
| updated_at | DATETIME(6) | NOT NULL | 수정 시각 |

### 3.2 users (사용자)

빌더를 쓰는 사람 (운영자/기획자). 종단 사용자와는 별도.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK, AUTO | |
| public_id | CHAR(26) | UNIQUE, NOT NULL | |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 로그인 ID |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt 해시 |
| name | VARCHAR(100) | NOT NULL | |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'active' | active / disabled |
| last_login_at | DATETIME(6) | NULL | |
| created_at | DATETIME(6) | NOT NULL | |
| updated_at | DATETIME(6) | NOT NULL | |

### 3.3 workspace_members (멤버 관계)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK, AUTO | |
| workspace_id | BIGINT | FK → workspaces.id, NOT NULL | |
| user_id | BIGINT | FK → users.id, NOT NULL | |
| role | VARCHAR(20) | NOT NULL | owner / admin / editor / viewer |
| created_at | DATETIME(6) | NOT NULL | |
| UNIQUE (workspace_id, user_id) | | | |

### 3.4 bots (봇)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK, AUTO | |
| public_id | CHAR(26) | UNIQUE, NOT NULL | 임베드 스니펫에 사용될 ID |
| workspace_id | BIGINT | FK → workspaces.id, NOT NULL | |
| name | VARCHAR(100) | NOT NULL | |
| description | TEXT | NULL | |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'draft' | draft / published / archived |
| intent_mode | VARCHAR(20) | NOT NULL, DEFAULT 'embedding' | embedding / llm |
| published_version_id | BIGINT | FK → bot_deployment_versions.id, NULL | 현재 발행된 버전 |
| widget_settings_json | JSON | NULL | 위젯 색상, 시작 메시지, 위치 등 |
| created_at | DATETIME(6) | NOT NULL | |
| updated_at | DATETIME(6) | NOT NULL | |

### 3.5 scenarios (시나리오)

봇 안의 흐름 묶음. 두 타입(FAQ / 기능)으로 구분.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK, AUTO | |
| public_id | CHAR(26) | UNIQUE, NOT NULL | |
| bot_id | BIGINT | FK → bots.id, NOT NULL | |
| name | VARCHAR(100) | NOT NULL | |
| type | VARCHAR(20) | NOT NULL | faq / function |
| trigger_examples_json | JSON | NULL | 의도 매칭용 발화 예시 배열 |
| description | TEXT | NULL | |
| sort_order | INT | NOT NULL, DEFAULT 0 | |
| created_at | DATETIME(6) | NOT NULL | |
| updated_at | DATETIME(6) | NOT NULL | |

### 3.6 nodes (노드)

캔버스의 블록 하나. 노드 타입별로 `config_json` 구조가 다름.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK, AUTO | |
| public_id | CHAR(26) | UNIQUE, NOT NULL | |
| scenario_id | BIGINT | FK → scenarios.id, NOT NULL | |
| type | VARCHAR(40) | NOT NULL | message / input / select / datetime / rag_response / api_call / branch / end |
| name | VARCHAR(100) | NULL | 사용자가 붙인 라벨 |
| position_x | INT | NOT NULL, DEFAULT 0 | 캔버스 X 좌표 |
| position_y | INT | NOT NULL, DEFAULT 0 | 캔버스 Y 좌표 |
| config_json | JSON | NOT NULL | 노드 타입별 설정 (메시지 텍스트, 입력 변수명 등) |
| is_start | BOOLEAN | NOT NULL, DEFAULT FALSE | 시나리오 시작 노드 표시 |
| created_at | DATETIME(6) | NOT NULL | |
| updated_at | DATETIME(6) | NOT NULL | |

**노드 타입별 `config_json` 예시.**

```json
// type=message
{ "text": "안녕하세요", "components": [{"type":"card", ...}] }

// type=input
{ "variable": "고객명", "prompt": "성함을 알려주세요", "inputType": "text" }

// type=rag_response
{ "knowledgeBaseId": "kb_xxx", "topK": 5, "temperature": 0.3 }

// type=api_call (Phase 2)
{ "method": "POST", "url": "...", "headers": {...}, "bodyTemplate": "...", "responseMapping": {...} }
```

### 3.7 edges (엣지)

노드 간 연결.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK, AUTO | |
| scenario_id | BIGINT | FK → scenarios.id, NOT NULL | |
| from_node_id | BIGINT | FK → nodes.id, NOT NULL | |
| to_node_id | BIGINT | FK → nodes.id, NOT NULL | |
| condition_json | JSON | NULL | 분기 조건 (없으면 무조건 이동) |
| sort_order | INT | NOT NULL, DEFAULT 0 | |
| created_at | DATETIME(6) | NOT NULL | |

### 3.8 variables (변수)

시나리오에서 수집/사용하는 값.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK, AUTO | |
| bot_id | BIGINT | FK → bots.id, NOT NULL | |
| name | VARCHAR(50) | NOT NULL | 변수명 |
| data_type | VARCHAR(20) | NOT NULL | text / number / date / boolean / json |
| scope | VARCHAR(20) | NOT NULL, DEFAULT 'session' | session / user / global |
| default_value | TEXT | NULL | |
| created_at | DATETIME(6) | NOT NULL | |
| UNIQUE (bot_id, name) | | | |

### 3.9 knowledge_bases (지식베이스)

RAG용 문서 묶음. "AS 매뉴얼 KB" 같은 단위.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK, AUTO | |
| public_id | CHAR(26) | UNIQUE, NOT NULL | |
| bot_id | BIGINT | FK → bots.id, NOT NULL | |
| name | VARCHAR(100) | NOT NULL | |
| description | TEXT | NULL | |
| embedding_model | VARCHAR(100) | NOT NULL | 사용한 임베딩 모델 ID |
| chunk_size | INT | NOT NULL, DEFAULT 500 | 청킹 크기 (문자) |
| chunk_overlap | INT | NOT NULL, DEFAULT 50 | 청크 오버랩 |
| created_at | DATETIME(6) | NOT NULL | |
| updated_at | DATETIME(6) | NOT NULL | |

### 3.10 documents (문서)

업로드한 파일.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK, AUTO | |
| public_id | CHAR(26) | UNIQUE, NOT NULL | |
| knowledge_base_id | BIGINT | FK → knowledge_bases.id, NOT NULL | |
| filename | VARCHAR(255) | NOT NULL | 원본 파일명 |
| storage_url | VARCHAR(500) | NOT NULL | 저장 위치 (S3 URL 등) |
| mime_type | VARCHAR(100) | NOT NULL | |
| file_size_bytes | BIGINT | NOT NULL | |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | pending / processing / ready / failed |
| error_message | TEXT | NULL | 실패 시 사유 |
| created_at | DATETIME(6) | NOT NULL | |
| updated_at | DATETIME(6) | NOT NULL | |

### 3.11 document_chunks (문서 청크)

문서를 잘게 쪼갠 조각. 실제 벡터는 **Qdrant에 저장**하고, MySQL에는 메타데이터만.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK, AUTO | |
| public_id | CHAR(26) | UNIQUE, NOT NULL | Qdrant point ID 와 동일 |
| document_id | BIGINT | FK → documents.id, NOT NULL | |
| chunk_index | INT | NOT NULL | 문서 내 순서 |
| content | TEXT | NOT NULL | 청크 텍스트 |
| char_start | INT | NULL | 원본 위치 시작 |
| char_end | INT | NULL | 원본 위치 끝 |
| token_count | INT | NULL | |
| created_at | DATETIME(6) | NOT NULL | |
| INDEX (document_id, chunk_index) | | | |

### 3.12 bot_deployment_versions (배포 버전)

발행 스냅샷 — 롤백 단위.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK, AUTO | |
| public_id | CHAR(26) | UNIQUE, NOT NULL | |
| bot_id | BIGINT | FK → bots.id, NOT NULL | |
| version_number | INT | NOT NULL | 1, 2, 3, ... |
| snapshot_json | LONGTEXT | NOT NULL | 봇 전체 상태 스냅샷 |
| released_by | BIGINT | FK → users.id, NOT NULL | 발행자 |
| released_at | DATETIME(6) | NOT NULL | |
| note | TEXT | NULL | 발행 메모 |
| UNIQUE (bot_id, version_number) | | | |

### 3.13 sessions (대화 세션)

종단 사용자 한 명의 대화 한 건.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK, AUTO | |
| public_id | CHAR(26) | UNIQUE, NOT NULL | 위젯이 사용하는 세션 ID |
| bot_id | BIGINT | FK → bots.id, NOT NULL | |
| version_id | BIGINT | FK → bot_deployment_versions.id, NOT NULL | 어느 버전과 대화 중인지 |
| visitor_id | VARCHAR(64) | NULL | 종단 사용자 식별 (쿠키 등) |
| current_node_id | BIGINT | FK → nodes.id, NULL | 현재 위치 |
| variables_json | JSON | NULL | 수집한 변수들 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'active' | active / closed / expired |
| started_at | DATETIME(6) | NOT NULL | |
| last_activity_at | DATETIME(6) | NOT NULL | |
| ended_at | DATETIME(6) | NULL | |
| created_at | DATETIME(6) | NOT NULL | 보관 정책 기준 (1년) |
| INDEX (created_at) | | | cleanup 용 |

### 3.14 session_messages (세션 메시지)

세션 안에서 오간 메시지.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK, AUTO | |
| session_id | BIGINT | FK → sessions.id, NOT NULL | |
| sender | VARCHAR(20) | NOT NULL | user / bot |
| node_id | BIGINT | FK → nodes.id, NULL | 어느 노드가 보낸 메시지인지 |
| content_type | VARCHAR(20) | NOT NULL | text / card / carousel / input / rag |
| content_json | JSON | NOT NULL | 메시지 본문 |
| created_at | DATETIME(6) | NOT NULL | 보관 정책 기준 (1년) |
| INDEX (session_id, created_at) | | | |
| INDEX (created_at) | | | cleanup 용 |

### 3.15 audit_logs (감사 로그)

가입, 배포, 권한 변경 등 운영 이벤트. 영구 보관.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGINT | PK, AUTO | |
| workspace_id | BIGINT | NULL | |
| user_id | BIGINT | NULL | |
| action | VARCHAR(50) | NOT NULL | bot.created / bot.published / member.invited 등 |
| target_type | VARCHAR(40) | NULL | bot / workspace / member 등 |
| target_id | BIGINT | NULL | |
| metadata_json | JSON | NULL | 추가 컨텍스트 |
| created_at | DATETIME(6) | NOT NULL | |
| INDEX (workspace_id, created_at) | | | |

## 4. 식별자 정책

- **내부 PK**: `BIGINT AUTO_INCREMENT` — DB 내부 조인용
- **외부 노출 ID**: `public_id CHAR(26)` — ULID 사용. API/URL/임베드 스니펫에 노출
- 이유 — auto-increment ID는 추측 가능해서 보안상 노출하면 안 됨. UUID v4보다 ULID가 정렬 가능하고 짧다.

## 5. 멀티테넌시

- 모든 조회는 **workspace_id** 로 격리
- Backend 미들웨어에서 세션 → workspace_id 추출 → 모든 쿼리에 자동 필터
- 엔터프라이즈 배포 모드에서는 DB 자체를 분리할 수도 있음 (Phase 2 결정)

## 6. JSON 컬럼 사용 방침

- 노드 설정처럼 **타입별로 구조가 다른 데이터** → JSON 사용 OK
- 그 외 정형 데이터 → 일반 컬럼으로 분리
- JSON은 검색·인덱싱에 약하므로 자주 조회되는 필드는 별도 컬럼으로 빼낸다

## 7. Vector DB (Qdrant) 컬렉션 설계

MySQL 외부.

```
컬렉션: kb_chunks
  - point_id: document_chunks.public_id
  - vector: float[1024]   ← multilingual-e5-large 차원
  - payload:
      - knowledge_base_id
      - document_id
      - chunk_index
      - content (검색 결과에서 텍스트 같이 가져오기 위해)

컬렉션: intent_examples
  - point_id: scenario.public_id + example_index
  - vector: float[1024]
  - payload:
      - bot_id
      - scenario_id
      - example_text
```

검색 시 `bot_id` 또는 `knowledge_base_id` 로 필터링한 뒤 코사인 유사도 상위 N개를 가져온다.
