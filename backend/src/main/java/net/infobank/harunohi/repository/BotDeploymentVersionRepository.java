// BotDeploymentVersion(배포본) 영속화 및 조회를 담당하는 Spring Data JPA 리포지토리.
package net.infobank.harunohi.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import net.infobank.harunohi.domain.BotDeploymentVersion;

public interface BotDeploymentVersionRepository extends JpaRepository<BotDeploymentVersion, Long> {

    List<BotDeploymentVersion> findByBotIdOrderByReleasedAtDesc(Long botId);

    Optional<BotDeploymentVersion> findByBotIdAndPublicId(Long botId, String publicId);

    Optional<BotDeploymentVersion> findFirstByBotIdOrderByVersionNumberDesc(Long botId);
}
