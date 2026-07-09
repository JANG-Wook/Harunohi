// 위젯이 읽는 공개(무인증) 배포 조회 REST 엔드포인트 (발행된 스냅샷 반환).
package net.infobank.harunohi.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.infobank.harunohi.controller.dto.BotVersionDtos;
import net.infobank.harunohi.service.BotVersionService;

@RestController
@RequestMapping("/api/public/bots")
public class PublicBotController {

    private final BotVersionService botVersionService;

    public PublicBotController(BotVersionService botVersionService) {
        this.botVersionService = botVersionService;
    }

    @GetMapping("/{botPublicId}/deployment")
    public BotVersionDtos.PublicDeploymentResponse getDeployment(@PathVariable String botPublicId) {
        BotVersionService.PublishedDeployment result = botVersionService.getPublishedDeployment(botPublicId);
        return BotVersionDtos.PublicDeploymentResponse.from(result.bot(), result.deployment());
    }
}
