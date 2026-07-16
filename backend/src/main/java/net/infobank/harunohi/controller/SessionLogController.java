// 대화 로그 조회 REST 엔드포인트 (인증 · 테넌트 격리) — 세션 목록 + 세션별 메시지.
package net.infobank.harunohi.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import net.infobank.harunohi.controller.dto.SessionLogDtos;
import net.infobank.harunohi.domain.SessionMessage;
import net.infobank.harunohi.domain.User;
import net.infobank.harunohi.security.CurrentUserProvider;
import net.infobank.harunohi.service.ChatLogService;

@RestController
@RequestMapping("/api/workspaces/{wsPublicId}/bots/{botPublicId}")
public class SessionLogController {

    private final ChatLogService chatLogService;
    private final CurrentUserProvider currentUserProvider;
    private final ObjectMapper objectMapper;

    public SessionLogController(ChatLogService chatLogService,
            CurrentUserProvider currentUserProvider,
            ObjectMapper objectMapper) {
        this.chatLogService = chatLogService;
        this.currentUserProvider = currentUserProvider;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/sessions")
    public List<SessionLogDtos.SessionSummaryResponse> listSessions(@PathVariable String wsPublicId,
            @PathVariable String botPublicId) {
        User user = currentUserProvider.requireCurrentUser();
        return chatLogService.listSessions(wsPublicId, user, botPublicId).stream()
                .map(SessionLogDtos.SessionSummaryResponse::from)
                .toList();
    }

    @GetMapping("/sessions/{sessionPublicId}/messages")
    public List<SessionLogDtos.MessageResponse> listMessages(@PathVariable String wsPublicId,
            @PathVariable String botPublicId, @PathVariable String sessionPublicId) {
        User user = currentUserProvider.requireCurrentUser();
        return chatLogService.listSessionMessages(wsPublicId, user, botPublicId, sessionPublicId).stream()
                .map(this::toMessageResponse)
                .toList();
    }

    private SessionLogDtos.MessageResponse toMessageResponse(SessionMessage m) {
        return new SessionLogDtos.MessageResponse(
                m.getSender(),
                m.getContentType(),
                parseContent(m.getContentJson()),
                m.getCreatedAt());
    }

    /** 저장된 content_json 문자열을 JSON 노드로 파싱. 손상 시 null 로 두고 조회는 계속. */
    private JsonNode parseContent(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readTree(json);
        } catch (Exception ex) {
            return null;
        }
    }
}
