// 워크스페이스 REST 요청/응답 DTO 모음 (엔티티 직접 노출 방지).
package net.infobank.harunohi.controller.dto;

import java.time.Instant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import net.infobank.harunohi.domain.Workspace;

public final class WorkspaceDtos {

    private WorkspaceDtos() {
    }

    public record CreateRequest(
            @NotBlank @Size(max = 100) String name) {
    }

    public record Response(
            String publicId,
            String name,
            String plan,
            String status,
            Instant createdAt,
            Instant updatedAt) {

        public static Response from(Workspace w) {
            return new Response(
                    w.getPublicId(),
                    w.getName(),
                    w.getPlan(),
                    w.getStatus(),
                    w.getCreatedAt(),
                    w.getUpdatedAt());
        }
    }
}
