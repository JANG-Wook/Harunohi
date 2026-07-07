// 봇 식별/메타 CRUD 비즈니스 로직 (워크스페이스 스코프, public_id/타임스탬프 관리, 404 처리).
package net.infobank.harunohi.service;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import net.infobank.harunohi.domain.Bot;
import net.infobank.harunohi.domain.Workspace;
import net.infobank.harunohi.repository.BotRepository;

@Service
@Transactional
public class BotService {

    private static final String DEFAULT_STATUS = "draft";
    private static final String DEFAULT_INTENT_MODE = "embedding";

    private final BotRepository botRepository;
    private final WorkspaceService workspaceService;
    private final PublicIdGenerator publicIdGenerator;

    public BotService(BotRepository botRepository, WorkspaceService workspaceService,
            PublicIdGenerator publicIdGenerator) {
        this.botRepository = botRepository;
        this.workspaceService = workspaceService;
        this.publicIdGenerator = publicIdGenerator;
    }

    public Bot create(String wsPublicId, String name, String description) {
        Workspace workspace = workspaceService.getByPublicId(wsPublicId);
        Instant now = Instant.now();
        Bot bot = new Bot();
        bot.setPublicId(publicIdGenerator.generate());
        bot.setWorkspaceId(workspace.getId());
        bot.setName(name);
        bot.setDescription(description);
        bot.setStatus(DEFAULT_STATUS);
        bot.setIntentMode(DEFAULT_INTENT_MODE);
        bot.setCreatedAt(now);
        bot.setUpdatedAt(now);
        return botRepository.save(bot);
    }

    @Transactional(readOnly = true)
    public List<Bot> list(String wsPublicId) {
        Workspace workspace = workspaceService.getByPublicId(wsPublicId);
        return botRepository.findByWorkspaceIdOrderByUpdatedAtDesc(workspace.getId());
    }

    @Transactional(readOnly = true)
    public Bot get(String wsPublicId, String botPublicId) {
        Workspace workspace = workspaceService.getByPublicId(wsPublicId);
        return findScoped(workspace, botPublicId);
    }

    public Bot update(String wsPublicId, String botPublicId, String name, String description,
            String status, String intentMode) {
        Workspace workspace = workspaceService.getByPublicId(wsPublicId);
        Bot bot = findScoped(workspace, botPublicId);
        if (name != null) {
            bot.setName(name);
        }
        if (description != null) {
            bot.setDescription(description);
        }
        if (status != null) {
            bot.setStatus(status);
        }
        if (intentMode != null) {
            bot.setIntentMode(intentMode);
        }
        bot.setUpdatedAt(Instant.now());
        return botRepository.save(bot);
    }

    public void delete(String wsPublicId, String botPublicId) {
        Workspace workspace = workspaceService.getByPublicId(wsPublicId);
        Bot bot = findScoped(workspace, botPublicId);
        botRepository.delete(bot);
    }

    private Bot findScoped(Workspace workspace, String botPublicId) {
        return botRepository.findByWorkspaceIdAndPublicId(workspace.getId(), botPublicId)
                .orElseThrow(() -> new NotFoundException("Bot not found: " + botPublicId));
    }
}
