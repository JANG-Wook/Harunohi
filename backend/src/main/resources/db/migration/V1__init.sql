-- Harunohi 챗봇 빌더 SaaS 의 MySQL 스키마 (MVP)
-- 참조: docs/03-data-model.md
-- 대상: MySQL 8.x, utf8mb4

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. 워크스페이스 / 사용자 / 멤버
-- ============================================================

CREATE TABLE workspaces (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    public_id       CHAR(26)        NOT NULL,
    name            VARCHAR(100)    NOT NULL,
    plan            VARCHAR(20)     NOT NULL DEFAULT 'free',
    status          VARCHAR(20)     NOT NULL DEFAULT 'active',
    created_at      DATETIME(6)     NOT NULL,
    updated_at      DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_workspaces_public_id (public_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    public_id       CHAR(26)        NOT NULL,
    email           VARCHAR(255)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    name            VARCHAR(100)    NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'active',
    last_login_at   DATETIME(6)     NULL,
    created_at      DATETIME(6)     NOT NULL,
    updated_at      DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_public_id (public_id),
    UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE workspace_members (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    workspace_id    BIGINT          NOT NULL,
    user_id         BIGINT          NOT NULL,
    role            VARCHAR(20)     NOT NULL,
    created_at      DATETIME(6)     NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_workspace_members_ws_user (workspace_id, user_id),
    KEY idx_workspace_members_user (user_id),
    CONSTRAINT fk_workspace_members_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    CONSTRAINT fk_workspace_members_user      FOREIGN KEY (user_id)      REFERENCES users(id)      ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. 봇
-- ============================================================

CREATE TABLE bots (
    id                     BIGINT       NOT NULL AUTO_INCREMENT,
    public_id              CHAR(26)     NOT NULL,
    workspace_id           BIGINT       NOT NULL,
    name                   VARCHAR(100) NOT NULL,
    description            TEXT         NULL,
    status                 VARCHAR(20)  NOT NULL DEFAULT 'draft',
    intent_mode            VARCHAR(20)  NOT NULL DEFAULT 'embedding',
    published_version_id   BIGINT       NULL,
    widget_settings_json   JSON         NULL,
    created_at             DATETIME(6)  NOT NULL,
    updated_at             DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_bots_public_id (public_id),
    KEY idx_bots_workspace_updated_at (workspace_id, updated_at),
    CONSTRAINT fk_bots_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. 시나리오 / 노드 / 엣지 / 변수
-- ============================================================

CREATE TABLE scenarios (
    id                     BIGINT       NOT NULL AUTO_INCREMENT,
    public_id              CHAR(26)     NOT NULL,
    bot_id                 BIGINT       NOT NULL,
    name                   VARCHAR(100) NOT NULL,
    type                   VARCHAR(20)  NOT NULL,
    trigger_examples_json  JSON         NULL,
    description            TEXT         NULL,
    sort_order             INT          NOT NULL DEFAULT 0,
    created_at             DATETIME(6)  NOT NULL,
    updated_at             DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_scenarios_public_id (public_id),
    KEY idx_scenarios_bot_sort (bot_id, sort_order),
    CONSTRAINT fk_scenarios_bot FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE nodes (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    public_id       CHAR(26)     NOT NULL,
    scenario_id     BIGINT       NOT NULL,
    type            VARCHAR(40)  NOT NULL,
    name            VARCHAR(100) NULL,
    position_x      INT          NOT NULL DEFAULT 0,
    position_y      INT          NOT NULL DEFAULT 0,
    config_json     JSON         NOT NULL,
    is_start        BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      DATETIME(6)  NOT NULL,
    updated_at      DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_nodes_public_id (public_id),
    KEY idx_nodes_scenario (scenario_id),
    CONSTRAINT fk_nodes_scenario FOREIGN KEY (scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE edges (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    scenario_id     BIGINT       NOT NULL,
    from_node_id    BIGINT       NOT NULL,
    to_node_id      BIGINT       NOT NULL,
    condition_json  JSON         NULL,
    sort_order      INT          NOT NULL DEFAULT 0,
    created_at      DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_edges_scenario (scenario_id),
    KEY idx_edges_from (from_node_id),
    KEY idx_edges_to (to_node_id),
    CONSTRAINT fk_edges_scenario FOREIGN KEY (scenario_id)  REFERENCES scenarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_edges_from     FOREIGN KEY (from_node_id) REFERENCES nodes(id)     ON DELETE CASCADE,
    CONSTRAINT fk_edges_to       FOREIGN KEY (to_node_id)   REFERENCES nodes(id)     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE variables (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    bot_id          BIGINT       NOT NULL,
    name            VARCHAR(50)  NOT NULL,
    data_type       VARCHAR(20)  NOT NULL,
    scope           VARCHAR(20)  NOT NULL DEFAULT 'session',
    default_value   TEXT         NULL,
    created_at      DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_variables_bot_name (bot_id, name),
    CONSTRAINT fk_variables_bot FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. 지식베이스 / 문서 / 청크 (RAG)
-- ============================================================

CREATE TABLE knowledge_bases (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    public_id       CHAR(26)     NOT NULL,
    bot_id          BIGINT       NOT NULL,
    name            VARCHAR(100) NOT NULL,
    description     TEXT         NULL,
    embedding_model VARCHAR(100) NOT NULL,
    chunk_size      INT          NOT NULL DEFAULT 500,
    chunk_overlap   INT          NOT NULL DEFAULT 50,
    created_at      DATETIME(6)  NOT NULL,
    updated_at      DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_knowledge_bases_public_id (public_id),
    KEY idx_knowledge_bases_bot (bot_id),
    CONSTRAINT fk_knowledge_bases_bot FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE documents (
    id                 BIGINT       NOT NULL AUTO_INCREMENT,
    public_id          CHAR(26)     NOT NULL,
    knowledge_base_id  BIGINT       NOT NULL,
    filename           VARCHAR(255) NOT NULL,
    storage_url        VARCHAR(500) NOT NULL,
    mime_type          VARCHAR(100) NOT NULL,
    file_size_bytes    BIGINT       NOT NULL,
    status             VARCHAR(20)  NOT NULL DEFAULT 'pending',
    error_message      TEXT         NULL,
    created_at         DATETIME(6)  NOT NULL,
    updated_at         DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_documents_public_id (public_id),
    KEY idx_documents_kb_created (knowledge_base_id, created_at),
    CONSTRAINT fk_documents_kb FOREIGN KEY (knowledge_base_id) REFERENCES knowledge_bases(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE document_chunks (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    public_id       CHAR(26)     NOT NULL,
    document_id     BIGINT       NOT NULL,
    chunk_index     INT          NOT NULL,
    content         TEXT         NOT NULL,
    char_start      INT          NULL,
    char_end        INT          NULL,
    token_count     INT          NULL,
    created_at      DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_document_chunks_public_id (public_id),
    KEY idx_document_chunks_doc_idx (document_id, chunk_index),
    CONSTRAINT fk_document_chunks_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. 배포 버전
-- ============================================================

CREATE TABLE bot_deployment_versions (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    public_id       CHAR(26)     NOT NULL,
    bot_id          BIGINT       NOT NULL,
    version_number  INT          NOT NULL,
    snapshot_json   LONGTEXT     NOT NULL,
    released_by     BIGINT       NOT NULL,
    released_at     DATETIME(6)  NOT NULL,
    note            TEXT         NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_bot_deployment_versions_public_id (public_id),
    UNIQUE KEY uk_bot_deployment_versions_bot_version (bot_id, version_number),
    KEY idx_bot_deployment_versions_released_by (released_by),
    CONSTRAINT fk_bot_deployment_versions_bot  FOREIGN KEY (bot_id)      REFERENCES bots(id)  ON DELETE CASCADE,
    CONSTRAINT fk_bot_deployment_versions_user FOREIGN KEY (released_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- bots.published_version_id 의 FK 를 늦게 추가 (순환 참조 방지)
ALTER TABLE bots
    ADD CONSTRAINT fk_bots_published_version
    FOREIGN KEY (published_version_id) REFERENCES bot_deployment_versions(id);

-- ============================================================
-- 6. 세션 / 메시지 (보관기간: 1년 - cleanup cron 으로 관리)
-- ============================================================

CREATE TABLE sessions (
    id                  BIGINT       NOT NULL AUTO_INCREMENT,
    public_id           CHAR(26)     NOT NULL,
    bot_id              BIGINT       NOT NULL,
    version_id          BIGINT       NOT NULL,
    visitor_id          VARCHAR(64)  NULL,
    current_node_id     BIGINT       NULL,
    variables_json      JSON         NULL,
    status              VARCHAR(20)  NOT NULL DEFAULT 'active',
    started_at          DATETIME(6)  NOT NULL,
    last_activity_at    DATETIME(6)  NOT NULL,
    ended_at            DATETIME(6)  NULL,
    created_at          DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_sessions_public_id (public_id),
    KEY idx_sessions_bot_started (bot_id, started_at),
    KEY idx_sessions_created_at (created_at),
    KEY idx_sessions_visitor (visitor_id),
    CONSTRAINT fk_sessions_bot     FOREIGN KEY (bot_id)          REFERENCES bots(id),
    CONSTRAINT fk_sessions_version FOREIGN KEY (version_id)      REFERENCES bot_deployment_versions(id),
    CONSTRAINT fk_sessions_node    FOREIGN KEY (current_node_id) REFERENCES nodes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE session_messages (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    session_id      BIGINT       NOT NULL,
    sender          VARCHAR(20)  NOT NULL,
    node_id         BIGINT       NULL,
    content_type    VARCHAR(20)  NOT NULL,
    content_json    JSON         NOT NULL,
    created_at      DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_session_messages_session_created (session_id, created_at),
    KEY idx_session_messages_created_at (created_at),
    CONSTRAINT fk_session_messages_session FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_session_messages_node    FOREIGN KEY (node_id)    REFERENCES nodes(id)    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. 감사 로그 (영구 보관)
-- ============================================================

CREATE TABLE audit_logs (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    workspace_id    BIGINT       NULL,
    user_id         BIGINT       NULL,
    action          VARCHAR(50)  NOT NULL,
    target_type     VARCHAR(40)  NULL,
    target_id       BIGINT       NULL,
    metadata_json   JSON         NULL,
    created_at      DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_audit_logs_workspace_created (workspace_id, created_at),
    KEY idx_audit_logs_user_created (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Cleanup 정책 (운영 측 cron 으로 실행 - 1년 보관)
-- ============================================================
-- DELETE FROM session_messages WHERE created_at < NOW() - INTERVAL 1 YEAR;
-- DELETE FROM sessions         WHERE created_at < NOW() - INTERVAL 1 YEAR;
