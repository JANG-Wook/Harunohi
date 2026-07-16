// 대화 세션의 개별 메시지(방문자 발화/봇 응답/시스템)를 담는 JPA 엔티티 (session_messages 테이블 매핑).
package net.infobank.harunohi.domain;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "session_messages")
public class SessionMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id", nullable = false, updatable = false)
    private Long sessionId;

    @Column(name = "sender", nullable = false, length = 20)
    private String sender;

    // node_id 는 파일럿(JSON 스냅샷) 방식이라 사용하지 않음 (NULL 유지).

    @Column(name = "content_type", nullable = false, length = 20)
    private String contentType;

    @Column(name = "content_json", nullable = false, columnDefinition = "json")
    private String contentJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public SessionMessage() {
    }

    public Long getId() {
        return id;
    }

    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public String getContentJson() {
        return contentJson;
    }

    public void setContentJson(String contentJson) {
        this.contentJson = contentJson;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
