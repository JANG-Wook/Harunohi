// 워크스페이스 CRUD REST 엔드포인트 (인증 필요, 현재 유저 기준 테넌트 격리).
package net.infobank.harunohi.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import net.infobank.harunohi.controller.dto.WorkspaceDtos;
import net.infobank.harunohi.domain.User;
import net.infobank.harunohi.security.CurrentUserProvider;
import net.infobank.harunohi.service.WorkspaceService;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    private final WorkspaceService workspaceService;
    private final CurrentUserProvider currentUserProvider;

    public WorkspaceController(WorkspaceService workspaceService, CurrentUserProvider currentUserProvider) {
        this.workspaceService = workspaceService;
        this.currentUserProvider = currentUserProvider;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WorkspaceDtos.Response create(@Valid @RequestBody WorkspaceDtos.CreateRequest request) {
        User user = currentUserProvider.requireCurrentUser();
        return WorkspaceDtos.Response.from(workspaceService.create(request.name(), user));
    }

    @GetMapping
    public List<WorkspaceDtos.Response> list() {
        User user = currentUserProvider.requireCurrentUser();
        return workspaceService.listForUser(user).stream()
                .map(WorkspaceDtos.Response::from)
                .toList();
    }

    @GetMapping("/{wsPublicId}")
    public WorkspaceDtos.Response get(@PathVariable String wsPublicId) {
        User user = currentUserProvider.requireCurrentUser();
        return WorkspaceDtos.Response.from(workspaceService.getMemberWorkspace(wsPublicId, user));
    }
}
