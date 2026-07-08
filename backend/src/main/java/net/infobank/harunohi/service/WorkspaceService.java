// 워크스페이스 CRUD + 테넌트 격리(멤버십) 비즈니스 로직 (생성 시 owner 멤버 추가, 멤버 검증).
package net.infobank.harunohi.service;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import net.infobank.harunohi.domain.User;
import net.infobank.harunohi.domain.Workspace;
import net.infobank.harunohi.domain.WorkspaceMember;
import net.infobank.harunohi.repository.WorkspaceMemberRepository;
import net.infobank.harunohi.repository.WorkspaceRepository;

@Service
@Transactional
public class WorkspaceService {

    private static final String DEFAULT_PLAN = "free";
    private static final String DEFAULT_STATUS = "active";
    private static final String ROLE_OWNER = "owner";

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final PublicIdGenerator publicIdGenerator;

    public WorkspaceService(WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            PublicIdGenerator publicIdGenerator) {
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.publicIdGenerator = publicIdGenerator;
    }

    public Workspace create(String name, User owner) {
        Instant now = Instant.now();
        Workspace workspace = new Workspace();
        workspace.setPublicId(publicIdGenerator.generate());
        workspace.setName(name);
        workspace.setPlan(DEFAULT_PLAN);
        workspace.setStatus(DEFAULT_STATUS);
        workspace.setCreatedAt(now);
        workspace.setUpdatedAt(now);
        Workspace saved = workspaceRepository.save(workspace);

        WorkspaceMember member = new WorkspaceMember();
        member.setWorkspaceId(saved.getId());
        member.setUserId(owner.getId());
        member.setRole(ROLE_OWNER);
        member.setCreatedAt(now);
        workspaceMemberRepository.save(member);

        return saved;
    }

    @Transactional(readOnly = true)
    public List<Workspace> listForUser(User user) {
        List<Long> workspaceIds = workspaceMemberRepository.findByUserId(user.getId()).stream()
                .map(WorkspaceMember::getWorkspaceId)
                .toList();
        if (workspaceIds.isEmpty()) {
            return List.of();
        }
        return workspaceRepository.findByIdInOrderByCreatedAtDesc(workspaceIds);
    }

    /**
     * public_id 로 워크스페이스를 찾되(없으면 404), 현재 유저가 멤버가 아니면 403 을 던진다.
     */
    @Transactional(readOnly = true)
    public Workspace getMemberWorkspace(String publicId, User user) {
        Workspace workspace = workspaceRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Workspace not found: " + publicId));
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspace.getId(), user.getId())) {
            throw new ForbiddenException("워크스페이스에 대한 접근 권한이 없습니다.");
        }
        return workspace;
    }
}
