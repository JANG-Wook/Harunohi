// 인증 REST 엔드포인트 (회원가입/로그인, 현재 유저 조회). 워크스페이스는 생성하지 않음.
package net.infobank.harunohi.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import net.infobank.harunohi.controller.dto.AuthDtos;
import net.infobank.harunohi.domain.User;
import net.infobank.harunohi.security.CurrentUserProvider;
import net.infobank.harunohi.security.JwtService;
import net.infobank.harunohi.service.AuthService;

@RestController
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final CurrentUserProvider currentUserProvider;

    public AuthController(AuthService authService, JwtService jwtService,
            CurrentUserProvider currentUserProvider) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.currentUserProvider = currentUserProvider;
    }

    @PostMapping("/api/auth/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthDtos.LoginResponse register(@Valid @RequestBody AuthDtos.RegisterRequest request) {
        User user = authService.register(request.email(), request.password(), request.name());
        String token = jwtService.issueAccessToken(user.getPublicId());
        return AuthDtos.LoginResponse.of(token, user);
    }

    @PostMapping("/api/auth/login")
    public AuthDtos.LoginResponse login(@Valid @RequestBody AuthDtos.LoginRequest request) {
        User user = authService.login(request.email(), request.password());
        String token = jwtService.issueAccessToken(user.getPublicId());
        return AuthDtos.LoginResponse.of(token, user);
    }

    @GetMapping("/api/me")
    public AuthDtos.UserResponse me() {
        return AuthDtos.UserResponse.from(currentUserProvider.requireCurrentUser());
    }
}
