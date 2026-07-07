// Bot 엔티티 영속화 및 조회를 담당하는 Spring Data JPA 리포지토리.
package net.infobank.harunohi.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import net.infobank.harunohi.domain.Bot;

public interface BotRepository extends JpaRepository<Bot, Long> {

    Optional<Bot> findByPublicId(String publicId);

    List<Bot> findByWorkspaceIdOrderByUpdatedAtDesc(Long workspaceId);

    Optional<Bot> findByWorkspaceIdAndPublicId(Long workspaceId, String publicId);
}
