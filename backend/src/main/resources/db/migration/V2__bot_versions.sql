-- 봇 정의 작업 버전(bot_versions) 테이블 및 bots.current_version_id 추가 (파일럿: JSON 스냅샷 방식)

CREATE TABLE bot_versions (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    public_id       CHAR(26)     NOT NULL,
    bot_id          BIGINT       NOT NULL,
    name            VARCHAR(100) NOT NULL,
    description     TEXT         NULL,
    definition_json LONGTEXT     NOT NULL,
    created_at      DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_bot_versions_public_id (public_id),
    UNIQUE KEY uk_bot_versions_bot_name (bot_id, name),
    KEY idx_bot_versions_bot_created (bot_id, created_at),
    CONSTRAINT fk_bot_versions_bot FOREIGN KEY (bot_id) REFERENCES bots(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 순환 FK 방지를 위해 V1 의 published_version_id 방식과 동일하게 ALTER 로 추가
ALTER TABLE bots
    ADD COLUMN current_version_id BIGINT NULL,
    ADD CONSTRAINT fk_bots_current_version
        FOREIGN KEY (current_version_id) REFERENCES bot_versions(id) ON DELETE SET NULL;
