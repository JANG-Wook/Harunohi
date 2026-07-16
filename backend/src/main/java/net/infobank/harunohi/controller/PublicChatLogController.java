// 공개 대화방 위젯이 호출하는 무인증 대화 로그 REST 엔드포인트 (세션 시작 + 메시지 적재).
package net.infobank.harunohi.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import net.infobank.harunohi.controller.dto.ChatLogDtos;
import net.infobank.harunohi.domain.ChatSession;
import net.infobank.harunohi.service.ChatLogService;

@RestController
@RequestMapping("/api/public")
public class PublicChatLogController {

    private final ChatLogService chatLogService;

    public PublicChatLogController(ChatLogService chatLogService) {
        this.chatLogService = chatLogService;
    }

    /** 세션 시작 — 발행된 봇에 대해 세션을 만들고 세션 식별자를 반환한다. */
    @PostMapping("/bots/{botPublicId}/sessions")
    @ResponseStatus(HttpStatus.CREATED)
    public ChatLogDtos.StartSessionResponse startSession(@PathVariable String botPublicId) {
        ChatSession session = chatLogService.startSession(botPublicId);
        return new ChatLogDtos.StartSessionResponse(session.getPublicId());
    }

    /** 메시지 배치 적재 — 아직 안 보낸 대화 이벤트만 받아 저장한다. */
    @PostMapping("/sessions/{sessionPublicId}/messages")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void appendMessages(@PathVariable String sessionPublicId,
            @Valid @RequestBody ChatLogDtos.AppendMessagesRequest request) {
        chatLogService.appendMessages(sessionPublicId, request.messages());
    }
}
