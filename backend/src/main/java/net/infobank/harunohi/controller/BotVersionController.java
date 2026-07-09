// 봇 정의 버전/현재 버전 지정/발행/롤백/배포 이력 REST 엔드포인트 (테넌트 격리 적용).
package net.infobank.harunohi.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import net.infobank.harunohi.controller.dto.BotVersionDtos;
import net.infobank.harunohi.domain.Bot;
import net.infobank.harunohi.domain.BotDeploymentVersion;
import net.infobank.harunohi.domain.BotVersion;
import net.infobank.harunohi.domain.User;
import net.infobank.harunohi.security.CurrentUserProvider;
import net.infobank.harunohi.service.BotService;
import net.infobank.harunohi.service.BotVersionService;

@RestController
@RequestMapping("/api/workspaces/{wsPublicId}/bots/{botPublicId}")
public class BotVersionController {

    private final BotVersionService botVersionService;
    private final BotService botService;
    private final CurrentUserProvider currentUserProvider;

    public BotVersionController(BotVersionService botVersionService, BotService botService,
            CurrentUserProvider currentUserProvider) {
        this.botVersionService = botVersionService;
        this.botService = botService;
        this.currentUserProvider = currentUserProvider;
    }

    // ---------- 작업 버전 ----------

    @PostMapping("/versions")
    @ResponseStatus(HttpStatus.CREATED)
    public BotVersionDtos.VersionDetailResponse createVersion(@PathVariable String wsPublicId,
            @PathVariable String botPublicId,
            @Valid @RequestBody BotVersionDtos.CreateVersionRequest request) {
        User user = currentUserProvider.requireCurrentUser();
        BotVersion version = botVersionService.createVersion(wsPublicId, user, botPublicId,
                request.name(), request.description(), request.definitionJson());
        // 생성 직후에는 항상 현재 버전으로 지정된다.
        return BotVersionDtos.VersionDetailResponse.from(version, version.getId());
    }

    @GetMapping("/versions")
    public List<BotVersionDtos.VersionSummaryResponse> listVersions(@PathVariable String wsPublicId,
            @PathVariable String botPublicId) {
        User user = currentUserProvider.requireCurrentUser();
        Bot bot = botService.get(wsPublicId, user, botPublicId);
        return botVersionService.listVersions(wsPublicId, user, botPublicId).stream()
                .map(v -> BotVersionDtos.VersionSummaryResponse.from(v, bot.getCurrentVersionId()))
                .toList();
    }

    @GetMapping("/versions/{verPublicId}")
    public BotVersionDtos.VersionDetailResponse getVersion(@PathVariable String wsPublicId,
            @PathVariable String botPublicId, @PathVariable String verPublicId) {
        User user = currentUserProvider.requireCurrentUser();
        Bot bot = botService.get(wsPublicId, user, botPublicId);
        BotVersion version = botVersionService.getVersion(wsPublicId, user, botPublicId, verPublicId);
        return BotVersionDtos.VersionDetailResponse.from(version, bot.getCurrentVersionId());
    }

    @DeleteMapping("/versions/{verPublicId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteVersion(@PathVariable String wsPublicId, @PathVariable String botPublicId,
            @PathVariable String verPublicId) {
        User user = currentUserProvider.requireCurrentUser();
        botVersionService.deleteVersion(wsPublicId, user, botPublicId, verPublicId);
    }

    @PutMapping("/versions/{verPublicId}/current")
    public BotVersionDtos.VersionSummaryResponse setCurrentVersion(@PathVariable String wsPublicId,
            @PathVariable String botPublicId, @PathVariable String verPublicId) {
        User user = currentUserProvider.requireCurrentUser();
        BotVersion version = botVersionService.setCurrentVersion(wsPublicId, user, botPublicId, verPublicId);
        return BotVersionDtos.VersionSummaryResponse.from(version, version.getId());
    }

    // ---------- 발행 / 롤백 / 배포 이력 ----------

    @PostMapping("/publish")
    @ResponseStatus(HttpStatus.CREATED)
    public BotVersionDtos.DeploymentSummaryResponse publish(@PathVariable String wsPublicId,
            @PathVariable String botPublicId,
            @Valid @RequestBody BotVersionDtos.PublishRequest request) {
        User user = currentUserProvider.requireCurrentUser();
        BotDeploymentVersion deployment = botVersionService.publish(wsPublicId, user, botPublicId,
                request.versionPublicId(), request.note());
        // 발행 직후에는 항상 이 배포본이 published 상태다.
        return BotVersionDtos.DeploymentSummaryResponse.from(deployment, deployment.getId());
    }

    @PostMapping("/rollback")
    public BotVersionDtos.DeploymentSummaryResponse rollback(@PathVariable String wsPublicId,
            @PathVariable String botPublicId,
            @Valid @RequestBody BotVersionDtos.RollbackRequest request) {
        User user = currentUserProvider.requireCurrentUser();
        BotDeploymentVersion deployment = botVersionService.rollback(wsPublicId, user, botPublicId,
                request.deploymentPublicId());
        return BotVersionDtos.DeploymentSummaryResponse.from(deployment, deployment.getId());
    }

    @GetMapping("/deployments")
    public List<BotVersionDtos.DeploymentSummaryResponse> listDeployments(@PathVariable String wsPublicId,
            @PathVariable String botPublicId) {
        User user = currentUserProvider.requireCurrentUser();
        Bot bot = botService.get(wsPublicId, user, botPublicId);
        return botVersionService.listDeployments(wsPublicId, user, botPublicId).stream()
                .map(d -> BotVersionDtos.DeploymentSummaryResponse.from(d, bot.getPublishedVersionId()))
                .toList();
    }
}
