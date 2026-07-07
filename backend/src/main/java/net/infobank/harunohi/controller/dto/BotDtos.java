// 봇 REST 요청/응답 DTO 모음 (엔티티 직접 노출 방지, PATCH 는 부분 수정용 nullable 필드).
package net.infobank.harunohi.controller.dto;

import java.time.Instant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import net.infobank.harunohi.domain.Bot;

public final class BotDtos {

    private BotDtos() {
    }

    public record CreateRequest(
            @NotBlank @Size(max = 100) String name,
            @Size(max = 65535) String description) {
    }

    public record UpdateRequest(
            @Size(max = 100) String name,
            String description,
            @Size(max = 20) String status,
            @Size(max = 20) String intentMode) {
    }

    public record Response(
            String publicId,
            String workspacePublicId,
            String name,
            String description,
            String status,
            String intentMode,
            Instant createdAt,
            Instant updatedAt) {

        public static Response from(Bot bot, String workspacePublicId) {
            return new Response(
                    bot.getPublicId(),
                    workspacePublicId,
                    bot.getName(),
                    bot.getDescription(),
                    bot.getStatus(),
                    bot.getIntentMode(),
                    bot.getCreatedAt(),
                    bot.getUpdatedAt());
        }
    }
}
