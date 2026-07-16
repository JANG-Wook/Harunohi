// 공개 대화 로그(세션 시작/메시지 적재) REST 요청·응답 DTO 모음.
package net.infobank.harunohi.controller.dto;

import java.util.List;

import com.fasterxml.jackson.databind.JsonNode;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public final class ChatLogDtos {

    private ChatLogDtos() {
    }

    /** 세션 시작 응답 — 이후 메시지 적재에 쓰는 세션 식별자 반환. */
    public record StartSessionResponse(String sessionPublicId) {
    }

    /** 메시지 배치 적재 요청 — 프론트가 아직 안 보낸 history 이벤트만 잘라서 보낸다. */
    public record AppendMessagesRequest(
            @NotEmpty @Size(max = 50) @Valid List<MessageItem> messages) {
    }

    /** 단일 메시지 — sender(bot/user/system), contentType(런타임 이벤트 kind), content(이벤트 원본 JSON). */
    public record MessageItem(
            @NotBlank @Size(max = 20) String sender,
            @NotBlank @Size(max = 20) String contentType,
            JsonNode content) {
    }
}
