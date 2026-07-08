// 인증(회원가입/로그인) REST 요청/응답 DTO 모음 (password_hash 노출 금지).
package net.infobank.harunohi.controller.dto;

import java.time.Instant;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import net.infobank.harunohi.domain.User;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record RegisterRequest(
            @NotBlank @Email @Size(max = 255) String email,
            @NotBlank @Size(min = 8, max = 100) String password,
            @NotBlank @Size(max = 100) String name) {
    }

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password) {
    }

    public record UserResponse(
            String publicId,
            String email,
            String name,
            String status,
            Instant createdAt) {

        public static UserResponse from(User user) {
            return new UserResponse(
                    user.getPublicId(),
                    user.getEmail(),
                    user.getName(),
                    user.getStatus(),
                    user.getCreatedAt());
        }
    }

    public record LoginResponse(
            String accessToken,
            String tokenType,
            UserResponse user) {

        public static LoginResponse of(String accessToken, User user) {
            return new LoginResponse(accessToken, "Bearer", UserResponse.from(user));
        }
    }
}
