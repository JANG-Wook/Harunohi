// BotVersion(작업 버전) 영속화 및 조회를 담당하는 Spring Data JPA 리포지토리.
package net.infobank.harunohi.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import net.infobank.harunohi.domain.BotVersion;

public interface BotVersionRepository extends JpaRepository<BotVersion, Long> {

    List<BotVersion> findByBotIdOrderByCreatedAtDesc(Long botId);

    Optional<BotVersion> findByBotIdAndPublicId(Long botId, String publicId);

    boolean existsByBotIdAndName(Long botId, String name);

    long countByBotId(Long botId);

    Optional<BotVersion> findFirstByBotIdOrderByCreatedAtDesc(Long botId);
}
