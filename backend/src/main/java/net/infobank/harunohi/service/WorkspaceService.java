// 워크스페이스 식별/메타 CRUD 비즈니스 로직 (public_id/타임스탬프 세팅, 404 처리).
package net.infobank.harunohi.service;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import net.infobank.harunohi.domain.Workspace;
import net.infobank.harunohi.repository.WorkspaceRepository;

@Service
@Transactional
public class WorkspaceService {

    private static final String DEFAULT_PLAN = "free";
    private static final String DEFAULT_STATUS = "active";

    private final WorkspaceRepository workspaceRepository;
    private final PublicIdGenerator publicIdGenerator;

    public WorkspaceService(WorkspaceRepository workspaceRepository, PublicIdGenerator publicIdGenerator) {
        this.workspaceRepository = workspaceRepository;
        this.publicIdGenerator = publicIdGenerator;
    }

    public Workspace create(String name) {
        Instant now = Instant.now();
        Workspace workspace = new Workspace();
        workspace.setPublicId(publicIdGenerator.generate());
        workspace.setName(name);
        workspace.setPlan(DEFAULT_PLAN);
        workspace.setStatus(DEFAULT_STATUS);
        workspace.setCreatedAt(now);
        workspace.setUpdatedAt(now);
        return workspaceRepository.save(workspace);
    }

    @Transactional(readOnly = true)
    public List<Workspace> list() {
        return workspaceRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Workspace getByPublicId(String publicId) {
        return workspaceRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Workspace not found: " + publicId));
    }
}
