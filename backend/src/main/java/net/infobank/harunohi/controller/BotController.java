// 봇 식별/메타 CRUD REST 엔드포인트 (워크스페이스 스코프, 정의 그래프/발행/인증은 후속 청크).
package net.infobank.harunohi.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import net.infobank.harunohi.controller.dto.BotDtos;
import net.infobank.harunohi.domain.Bot;
import net.infobank.harunohi.service.BotService;

@RestController
@RequestMapping("/api/workspaces/{wsPublicId}/bots")
public class BotController {

    private final BotService botService;

    public BotController(BotService botService) {
        this.botService = botService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BotDtos.Response create(@PathVariable String wsPublicId,
            @Valid @RequestBody BotDtos.CreateRequest request) {
        Bot bot = botService.create(wsPublicId, request.name(), request.description());
        return BotDtos.Response.from(bot, wsPublicId);
    }

    @GetMapping
    public List<BotDtos.Response> list(@PathVariable String wsPublicId) {
        return botService.list(wsPublicId).stream()
                .map(bot -> BotDtos.Response.from(bot, wsPublicId))
                .toList();
    }

    @GetMapping("/{botPublicId}")
    public BotDtos.Response get(@PathVariable String wsPublicId, @PathVariable String botPublicId) {
        return BotDtos.Response.from(botService.get(wsPublicId, botPublicId), wsPublicId);
    }

    @PatchMapping("/{botPublicId}")
    public BotDtos.Response update(@PathVariable String wsPublicId, @PathVariable String botPublicId,
            @Valid @RequestBody BotDtos.UpdateRequest request) {
        Bot bot = botService.update(wsPublicId, botPublicId,
                request.name(), request.description(), request.status(), request.intentMode());
        return BotDtos.Response.from(bot, wsPublicId);
    }

    @DeleteMapping("/{botPublicId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String wsPublicId, @PathVariable String botPublicId) {
        botService.delete(wsPublicId, botPublicId);
    }
}
