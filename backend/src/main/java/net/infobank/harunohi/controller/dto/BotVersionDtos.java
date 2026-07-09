// 봇 버전/발행/배포/공개 조회 REST 요청·응답 DTO 모음 (엔티티 직접 노출 방지).
package net.infobank.harunohi.controller.dto;

import java.time.Instant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import net.infobank.harunohi.domain.Bot;
import net.infobank.harunohi.domain.BotDeploymentVersion;
import net.infobank.harunohi.domain.BotVersion;

public final class BotVersionDtos {

    private BotVersionDtos() {
    }

    public record CreateVersionRequest(
            @NotBlank @Size(max = 100) String name,
            String description,
            @NotBlank String definitionJson) {
    }

    public record PublishRequest(
            @NotBlank String versionPublicId,
            String note) {
    }

    public record RollbackRequest(
            @NotBlank String deploymentPublicId) {
    }

    /** 버전 목록용 (definitionJson 제외 메타). */
    public record VersionSummaryResponse(
            String publicId,
            String name,
            String description,
            boolean current,
            Instant createdAt) {

        public static VersionSummaryResponse from(BotVersion v, Long currentVersionId) {
            return new VersionSummaryResponse(
                    v.getPublicId(),
                    v.getName(),
                    v.getDescription(),
                    v.getId().equals(currentVersionId),
                    v.getCreatedAt());
        }
    }

    /** 버전 단건용 (definitionJson 포함). */
    public record VersionDetailResponse(
            String publicId,
            String name,
            String description,
            boolean current,
            String definitionJson,
            Instant createdAt) {

        public static VersionDetailResponse from(BotVersion v, Long currentVersionId) {
            return new VersionDetailResponse(
                    v.getPublicId(),
                    v.getName(),
                    v.getDescription(),
                    v.getId().equals(currentVersionId),
                    v.getDefinitionJson(),
                    v.getCreatedAt());
        }
    }

    /** 배포 이력용 (snapshot 제외 메타). */
    public record DeploymentSummaryResponse(
            String publicId,
            int versionNumber,
            String note,
            Instant releasedAt,
            boolean published) {

        public static DeploymentSummaryResponse from(BotDeploymentVersion d, Long publishedVersionId) {
            return new DeploymentSummaryResponse(
                    d.getPublicId(),
                    d.getVersionNumber(),
                    d.getNote(),
                    d.getReleasedAt(),
                    d.getId().equals(publishedVersionId));
        }
    }

    /** 공개(무인증) 배포 조회 응답. */
    public record PublicDeploymentResponse(
            String botPublicId,
            String botName,
            int versionNumber,
            String snapshotJson,
            Instant releasedAt) {

        public static PublicDeploymentResponse from(Bot bot, BotDeploymentVersion d) {
            return new PublicDeploymentResponse(
                    bot.getPublicId(),
                    bot.getName(),
                    d.getVersionNumber(),
                    d.getSnapshotJson(),
                    d.getReleasedAt());
        }
    }
}
