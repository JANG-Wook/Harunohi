// SecurityContext 의 user public_id 로 현재 인증 사용자 엔티티를 조회하는 헬퍼.
package net.infobank.harunohi.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import net.infobank.harunohi.domain.User;
import net.infobank.harunohi.repository.UserRepository;
import net.infobank.harunohi.service.UnauthorizedException;

@Component
public class CurrentUserProvider {

    private final UserRepository userRepository;

    public CurrentUserProvider(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User requireCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getPrincipal() == null) {
            throw new UnauthorizedException("인증이 필요합니다.");
        }
        String userPublicId = authentication.getName();
        return userRepository.findByPublicId(userPublicId)
                .orElseThrow(() -> new UnauthorizedException("인증이 필요합니다."));
    }
}
