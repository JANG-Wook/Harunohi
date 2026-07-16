// 대화 세션(ChatSession) 영속화 및 조회를 담당하는 Spring Data JPA 리포지토리.
package net.infobank.harunohi.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import net.infobank.harunohi.domain.ChatSession;

public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {

    Optional<ChatSession> findByPublicId(String publicId);

    // 파일럿: 봇당 최근 200세션까지 조회(상한). 페이지네이션은 후속.
    List<ChatSession> findTop200ByBotIdOrderByStartedAtDesc(Long botId);
}
