// 대화 로그 조회(세션 목록/메시지) REST 응답 DTO 모음.
package net.infobank.harunohi.controller.dto;

import java.time.Instant;

import com.fasterxml.jackson.databind.JsonNode;

import net.infobank.harunohi.domain.ChatSession;
import net.infobank.harunohi.service.ChatLogService;

public final class SessionLogDtos {

    private SessionLogDtos() {
    }

    /** 세션 목록 한 줄 — 트랜스크립트는 별도 조회. */
    public record SessionSummaryResponse(
            String publicId,
            String status,
            long messageCount,
            Instant startedAt,
            Instant lastActivityAt) {

        public static SessionSummaryResponse from(ChatLogService.SessionWithCount item) {
            ChatSession s = item.session();
            return new SessionSummaryResponse(
                    s.getPublicId(),
                    s.getStatus(),
                    item.messageCount(),
                    s.getStartedAt(),
                    s.getLastActivityAt());
        }
    }

    /** 세션 메시지 한 건 — content 는 파싱된 JSON 을 인라인으로 내려준다. */
    public record MessageResponse(
            String sender,
            String contentType,
            JsonNode content,
            Instant createdAt) {
    }
}
