// Workspace 엔티티 영속화 및 조회를 담당하는 Spring Data JPA 리포지토리.
package net.infobank.harunohi.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import net.infobank.harunohi.domain.Workspace;

public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {

    Optional<Workspace> findByPublicId(String publicId);

    List<Workspace> findAllByOrderByCreatedAtDesc();
}
