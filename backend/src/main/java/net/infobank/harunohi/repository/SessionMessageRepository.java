// 세션 메시지(SessionMessage) 영속화 및 조회를 담당하는 Spring Data JPA 리포지토리.
package net.infobank.harunohi.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import net.infobank.harunohi.domain.SessionMessage;

public interface SessionMessageRepository extends JpaRepository<SessionMessage, Long> {

    long countBySessionId(Long sessionId);
}
