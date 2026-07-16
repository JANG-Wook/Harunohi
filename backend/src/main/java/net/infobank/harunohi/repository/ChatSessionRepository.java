// 대화 세션(ChatSession) 영속화 및 조회를 담당하는 Spring Data JPA 리포지토리.
package net.infobank.harunohi.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import net.infobank.harunohi.domain.ChatSession;

public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {

    Optional<ChatSession> findByPublicId(String publicId);
}
