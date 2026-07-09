// 봇 정의 작업 버전 CRUD + 현재 버전 지정 + 발행/롤백/배포 이력 비즈니스 로직.
package net.infobank.harunohi.service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import net.infobank.harunohi.domain.Bot;
import net.infobank.harunohi.domain.BotDeploymentVersion;
import net.infobank.harunohi.domain.BotVersion;
import net.infobank.harunohi.domain.User;
import net.infobank.harunohi.repository.BotDeploymentVersionRepository;
import net.infobank.harunohi.repository.BotRepository;
import net.infobank.harunohi.repository.BotVersionRepository;

@Service
@Transactional
public class BotVersionService {

    private static final int MAX_DEFINITION_BYTES = 2 * 1024 * 1024;
    private static final String STATUS_ACTIVE = "active";

    private final BotVersionRepository botVersionRepository;
    private final BotDeploymentVersionRepository deploymentRepository;
    private final BotRepository botRepository;
    private final BotService botService;
    private final PublicIdGenerator publicIdGenerator;
    private final ObjectMapper objectMapper;

    public BotVersionService(BotVersionRepository botVersionRepository,
            BotDeploymentVersionRepository deploymentRepository,
            BotRepository botRepository,
            BotService botService,
            PublicIdGenerator publicIdGenerator,
            ObjectMapper objectMapper) {
        this.botVersionRepository = botVersionRepository;
        this.deploymentRepository = deploymentRepository;
        this.botRepository = botRepository;
        this.botService = botService;
        this.publicIdGenerator = publicIdGenerator;
        this.objectMapper = objectMapper;
    }

    // ---------- 작업 버전 ----------

    public BotVersion createVersion(String wsPublicId, User user, String botPublicId,
            String name, String description, String definitionJson) {
        Bot bot = botService.get(wsPublicId, user, botPublicId);
        validateDefinitionJson(definitionJson);
        if (botVersionRepository.existsByBotIdAndName(bot.getId(), name)) {
            throw new ConflictException("이미 같은 이름의 버전이 있습니다: " + name);
        }
        Instant now = Instant.now();
        BotVersion version = new BotVersion();
        version.setPublicId(publicIdGenerator.generate());
        version.setBotId(bot.getId());
        version.setName(name);
        version.setDescription(description);
        version.setDefinitionJson(definitionJson);
        version.setCreatedAt(now);
        BotVersion saved = botVersionRepository.save(version);

        // 생성한 버전을 곧바로 현재 버전으로 지정한다.
        bot.setCurrentVersionId(saved.getId());
        bot.setUpdatedAt(now);
        botRepository.save(bot);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<BotVersion> listVersions(String wsPublicId, User user, String botPublicId) {
        Bot bot = botService.get(wsPublicId, user, botPublicId);
        return botVersionRepository.findByBotIdOrderByCreatedAtDesc(bot.getId());
    }

    @Transactional(readOnly = true)
    public BotVersion getVersion(String wsPublicId, User user, String botPublicId, String verPublicId) {
        Bot bot = botService.get(wsPublicId, user, botPublicId);
        return findVersion(bot, verPublicId);
    }

    public void deleteVersion(String wsPublicId, User user, String botPublicId, String verPublicId) {
        Bot bot = botService.get(wsPublicId, user, botPublicId);
        BotVersion version = findVersion(bot, verPublicId);
        if (botVersionRepository.countByBotId(bot.getId()) <= 1) {
            throw new ConflictException("마지막 버전은 삭제할 수 없습니다.");
        }
        botVersionRepository.delete(version);
        botVersionRepository.flush();
        // 현재 버전을 삭제한 경우 남은 것 중 최신 버전으로 이동한다.
        if (version.getId().equals(bot.getCurrentVersionId())) {
            BotVersion latest = botVersionRepository.findFirstByBotIdOrderByCreatedAtDesc(bot.getId())
                    .orElse(null);
            bot.setCurrentVersionId(latest != null ? latest.getId() : null);
            bot.setUpdatedAt(Instant.now());
            botRepository.save(bot);
        }
    }

    public BotVersion setCurrentVersion(String wsPublicId, User user, String botPublicId, String verPublicId) {
        Bot bot = botService.get(wsPublicId, user, botPublicId);
        BotVersion version = findVersion(bot, verPublicId);
        bot.setCurrentVersionId(version.getId());
        bot.setUpdatedAt(Instant.now());
        botRepository.save(bot);
        return version;
    }

    @Transactional(readOnly = true)
    public Long currentVersionId(String wsPublicId, User user, String botPublicId) {
        return botService.get(wsPublicId, user, botPublicId).getCurrentVersionId();
    }

    // ---------- 발행 / 롤백 / 배포 이력 ----------

    public BotDeploymentVersion publish(String wsPublicId, User user, String botPublicId,
            String versionPublicId, String note) {
        Bot bot = botService.get(wsPublicId, user, botPublicId);
        BotVersion version = findVersion(bot, versionPublicId);

        int nextNumber = deploymentRepository.findFirstByBotIdOrderByVersionNumberDesc(bot.getId())
                .map(d -> d.getVersionNumber() + 1)
                .orElse(1);
        Instant now = Instant.now();

        BotDeploymentVersion deployment = new BotDeploymentVersion();
        deployment.setPublicId(publicIdGenerator.generate());
        deployment.setBotId(bot.getId());
        deployment.setVersionNumber(nextNumber);
        deployment.setSnapshotJson(version.getDefinitionJson());
        deployment.setReleasedBy(user.getId());
        deployment.setReleasedAt(now);
        deployment.setNote(note);
        BotDeploymentVersion saved = deploymentRepository.save(deployment);

        bot.setPublishedVersionId(saved.getId());
        bot.setStatus(STATUS_ACTIVE);
        bot.setUpdatedAt(now);
        botRepository.save(bot);
        return saved;
    }

    public BotDeploymentVersion rollback(String wsPublicId, User user, String botPublicId,
            String deploymentPublicId) {
        Bot bot = botService.get(wsPublicId, user, botPublicId);
        BotDeploymentVersion deployment = deploymentRepository
                .findByBotIdAndPublicId(bot.getId(), deploymentPublicId)
                .orElseThrow(() -> new NotFoundException("Deployment not found: " + deploymentPublicId));
        bot.setPublishedVersionId(deployment.getId());
        bot.setUpdatedAt(Instant.now());
        botRepository.save(bot);
        return deployment;
    }

    @Transactional(readOnly = true)
    public List<BotDeploymentVersion> listDeployments(String wsPublicId, User user, String botPublicId) {
        Bot bot = botService.get(wsPublicId, user, botPublicId);
        return deploymentRepository.findByBotIdOrderByReleasedAtDesc(bot.getId());
    }

    // ---------- 공개(무인증) 배포 조회 ----------

    @Transactional(readOnly = true)
    public PublishedDeployment getPublishedDeployment(String botPublicId) {
        Bot bot = botRepository.findByPublicId(botPublicId)
                .orElseThrow(() -> new NotFoundException("Bot not found: " + botPublicId));
        Long publishedId = bot.getPublishedVersionId();
        if (publishedId == null) {
            throw new NotFoundException("No published deployment for bot: " + botPublicId);
        }
        BotDeploymentVersion deployment = deploymentRepository.findById(publishedId)
                .orElseThrow(() -> new NotFoundException("No published deployment for bot: " + botPublicId));
        return new PublishedDeployment(bot, deployment);
    }

    /** 공개 배포 조회 결과 (봇 + 발행된 배포본). */
    public record PublishedDeployment(Bot bot, BotDeploymentVersion deployment) {
    }

    // ---------- 내부 헬퍼 ----------

    private BotVersion findVersion(Bot bot, String verPublicId) {
        return botVersionRepository.findByBotIdAndPublicId(bot.getId(), verPublicId)
                .orElseThrow(() -> new NotFoundException("Version not found: " + verPublicId));
    }

    private void validateDefinitionJson(String definitionJson) {
        if (definitionJson == null || definitionJson.isBlank()) {
            throw new BadRequestException("definitionJson 은 비어 있을 수 없습니다.");
        }
        if (definitionJson.getBytes(StandardCharsets.UTF_8).length > MAX_DEFINITION_BYTES) {
            throw new BadRequestException("definitionJson 크기가 2MB 를 초과했습니다.");
        }
        try {
            objectMapper.readTree(definitionJson);
        } catch (JsonProcessingException ex) {
            throw new BadRequestException("definitionJson 이 유효한 JSON 이 아닙니다.");
        }
    }
}
