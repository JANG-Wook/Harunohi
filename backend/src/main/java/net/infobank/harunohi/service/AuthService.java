// 회원가입/로그인 인증 로직 (BCrypt 해싱, 중복 이메일 409, 로그인 실패 메시지 일반화).
package net.infobank.harunohi.service;

import java.time.Instant;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import net.infobank.harunohi.domain.User;
import net.infobank.harunohi.repository.UserRepository;

@Service
@Transactional
public class AuthService {

    private static final String DEFAULT_STATUS = "active";
    // 이메일 존재 여부를 노출하지 않기 위한 일반화된 실패 메시지 (OWASP).
    private static final String LOGIN_FAILED_MESSAGE = "이메일 또는 비밀번호가 올바르지 않습니다.";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PublicIdGenerator publicIdGenerator;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
            PublicIdGenerator publicIdGenerator) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.publicIdGenerator = publicIdGenerator;
    }

    public User register(String email, String rawPassword, String name) {
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("이미 사용 중인 이메일입니다.");
        }
        Instant now = Instant.now();
        User user = new User();
        user.setPublicId(publicIdGenerator.generate());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setName(name);
        user.setStatus(DEFAULT_STATUS);
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        return userRepository.save(user);
    }

    public User login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException(LOGIN_FAILED_MESSAGE));
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new UnauthorizedException(LOGIN_FAILED_MESSAGE);
        }
        user.setLastLoginAt(Instant.now());
        return user;
    }
}
