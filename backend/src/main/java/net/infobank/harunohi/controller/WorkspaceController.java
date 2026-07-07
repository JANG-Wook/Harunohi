// 워크스페이스 식별/메타 CRUD REST 엔드포인트 (인증 없음, 후속 청크에서 추가).
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
import net.infobank.harunohi.service.WorkspaceService;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WorkspaceDtos.Response create(@Valid @RequestBody WorkspaceDtos.CreateRequest request) {
        return WorkspaceDtos.Response.from(workspaceService.create(request.name()));
    }

    @GetMapping
    public List<WorkspaceDtos.Response> list() {
        return workspaceService.list().stream()
                .map(WorkspaceDtos.Response::from)
                .toList();
    }

    @GetMapping("/{wsPublicId}")
    public WorkspaceDtos.Response get(@PathVariable String wsPublicId) {
        return WorkspaceDtos.Response.from(workspaceService.getByPublicId(wsPublicId));
    }
}
