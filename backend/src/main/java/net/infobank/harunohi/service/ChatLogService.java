// 공개 대화 로그 비즈니스 로직 — 세션 시작 + 메시지 배치 적재(최소 방어 상한 포함).
package net.infobank.harunohi.service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;

import net.infobank.harunohi.controller.dto.ChatLogDtos.MessageItem;
import net.infobank.harunohi.domain.Bot;
import net.infobank.harunohi.domain.BotDeploymentVersion;
import net.infobank.harunohi.domain.ChatSession;
import net.infobank.harunohi.domain.SessionMessage;
import net.infobank.harunohi.domain.User;
import net.infobank.harunohi.repository.ChatSessionRepository;
import net.infobank.harunohi.repository.SessionMessageRepository;

@Service
@Transactional
public class ChatLogService {

    // ---------- 최소 방어 상한 (무인증 쓰기 남용/폭주 방지) ----------
    private static final long MAX_MESSAGES_PER_SESSION = 500;
    private static final int MAX_CONTENT_BYTES = 32 * 1024;
    private static final String STATUS_ACTIVE = "active";

    private static final List<String> ALLOWED_SENDERS = List.of("bot", "user", "system");

    private final ChatSessionRepository sessionRepository;
    private final SessionMessageRepository messageRepository;
    private final BotVersionService botVersionService;
    private final BotService botService;
    private final PublicIdGenerator publicIdGenerator;

    public ChatLogService(ChatSessionRepository sessionRepository,
            SessionMessageRepository messageRepository,
            BotVersionService botVersionService,
            BotService botService,
            PublicIdGenerator publicIdGenerator) {
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
        this.botVersionService = botVersionService;
        this.botService = botService;
        this.publicIdGenerator = publicIdGenerator;
    }

    /** 세션 시작 — 발행된 배포본이 있는 봇에 대해서만 세션을 생성한다(없으면 404). */
    public ChatSession startSession(String botPublicId) {
        BotVersionService.PublishedDeployment published = botVersionService.getPublishedDeployment(botPublicId);
        BotDeploymentVersion deployment = published.deployment();
        Instant now = Instant.now();

        ChatSession session = new ChatSession();
        session.setPublicId(publicIdGenerator.generate());
        session.setBotId(deployment.getBotId());
        session.setVersionId(deployment.getId());
        session.setStatus(STATUS_ACTIVE);
        session.setStartedAt(now);
        session.setLastActivityAt(now);
        session.setCreatedAt(now);
        return sessionRepository.save(session);
    }

    /** 메시지 배치 적재 — 세션당 메시지 수/개별 본문 크기 상한을 넘으면 400. */
    public void appendMessages(String sessionPublicId, List<MessageItem> items) {
        ChatSession session = sessionRepository.findByPublicId(sessionPublicId)
                .orElseThrow(() -> new NotFoundException("Session not found: " + sessionPublicId));

        long existing = messageRepository.countBySessionId(session.getId());
        if (existing + items.size() > MAX_MESSAGES_PER_SESSION) {
            throw new BadRequestException("세션 메시지 상한(" + MAX_MESSAGES_PER_SESSION + ")을 초과했습니다.");
        }

        Instant now = Instant.now();
        for (MessageItem item : items) {
            String sender = item.sender();
            if (!ALLOWED_SENDERS.contains(sender)) {
                throw new BadRequestException("허용되지 않은 sender: " + sender);
            }
            String contentJson = serializeContent(item.content());

            SessionMessage message = new SessionMessage();
            message.setSessionId(session.getId());
            message.setSender(sender);
            message.setContentType(item.contentType());
            message.setContentJson(contentJson);
            message.setCreatedAt(now);
            messageRepository.save(message);
        }

        session.setLastActivityAt(now);
        sessionRepository.save(session);
    }

    // ---------- 조회 (인증 · 테넌트 격리) ----------

    /** 봇의 대화 세션 목록(최근 200) — 각 세션의 메시지 수 포함. */
    @Transactional(readOnly = true)
    public List<SessionWithCount> listSessions(String wsPublicId, User user, String botPublicId) {
        Bot bot = botService.get(wsPublicId, user, botPublicId);
        return sessionRepository.findTop200ByBotIdOrderByStartedAtDesc(bot.getId()).stream()
                .map(s -> new SessionWithCount(s, messageRepository.countBySessionId(s.getId())))
                .toList();
    }

    /** 한 세션의 메시지 전체(오름차순). 세션이 이 봇 소유가 아니면 404. */
    @Transactional(readOnly = true)
    public List<SessionMessage> listSessionMessages(String wsPublicId, User user, String botPublicId,
            String sessionPublicId) {
        Bot bot = botService.get(wsPublicId, user, botPublicId);
        ChatSession session = sessionRepository.findByPublicId(sessionPublicId)
                .orElseThrow(() -> new NotFoundException("Session not found: " + sessionPublicId));
        if (!session.getBotId().equals(bot.getId())) {
            // 다른 봇/워크스페이스의 세션 접근 차단 (존재 노출 방지 위해 404).
            throw new NotFoundException("Session not found: " + sessionPublicId);
        }
        return messageRepository.findBySessionIdOrderByIdAsc(session.getId());
    }

    /** 세션 목록 조회 결과 (세션 + 메시지 수). */
    public record SessionWithCount(ChatSession session, long messageCount) {
    }

    // ---------- 내부 헬퍼 ----------

    /** content(JsonNode) → 저장 문자열. 비어 있으면 빈 객체, 크기 상한 초과면 400. */
    private String serializeContent(JsonNode content) {
        String json = (content == null || content.isNull()) ? "{}" : content.toString();
        if (json.getBytes(StandardCharsets.UTF_8).length > MAX_CONTENT_BYTES) {
            throw new BadRequestException("메시지 본문 크기가 상한(" + MAX_CONTENT_BYTES + "B)을 초과했습니다.");
        }
        return json;
    }
}
