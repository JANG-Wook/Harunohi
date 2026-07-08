// JWT(HS256) 액세스 토큰 발급/검증 서비스 (subject = user public_id).
package net.infobank.harunohi.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Service
public class JwtService {

    // HS256 최소 키 길이는 256비트(32바이트)다. 이보다 짧으면 기동을 중단한다.
    private static final int MIN_SECRET_BYTES = 32;

    private final String secret;
    private final long accessExpMinutes;

    private SecretKey signingKey;

    public JwtService(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.access-exp-min:120}") long accessExpMinutes) {
        this.secret = secret;
        this.accessExpMinutes = accessExpMinutes;
    }

    @PostConstruct
    void init() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < MIN_SECRET_BYTES) {
            throw new IllegalStateException(
                    "JWT_SECRET must be at least " + MIN_SECRET_BYTES
                            + " bytes for HS256 (current: " + keyBytes.length + " bytes).");
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String issueAccessToken(String userPublicId) {
        Instant now = Instant.now();
        Instant expiry = now.plus(accessExpMinutes, ChronoUnit.MINUTES);
        return Jwts.builder()
                .subject(userPublicId)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(signingKey)
                .compact();
    }

    /**
     * 토큰을 검증하고 subject(user public_id)를 반환한다. 서명 불일치·만료 등은 JwtException 을 던진다.
     */
    public String parseSubject(String token) throws JwtException {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }
}
