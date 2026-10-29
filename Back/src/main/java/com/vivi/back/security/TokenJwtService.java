package com.vivi.back.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.vivi.back.model.Funcionario;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
public class TokenJwtService {

    public static final String COOKIE_NOME = "wc_jwt";

    @Value("${api.security.token.secret}")
    private String secret;

    @Value("${api.security.token.expiration.hours}")
    private long expirationHours;

    @Value("${api.security.cookie.secure}")
    private boolean cookieSecure;

    @Value("${api.security.cookie.samesite}")
    private String cookieSameSite;

    public String gerarToken(Funcionario funcionario) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer("Whiskers Co")
                    .withSubject(funcionario.getEmail())
                    .withClaim("id", funcionario.getId())
                    .withClaim("nome", funcionario.getNome())
                    .withClaim("funcao", funcionario.getFuncao().toString())
                    .withExpiresAt(dataExpiracao())
                    .sign(algorithm);
        } catch (JWTCreationException exception) {
            throw new RuntimeException("Erro ao gerar token JWT", exception);
        }
    }

    public String validarToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.require(algorithm)
                    .withIssuer("Whiskers Co")
                    .build()
                    .verify(token)
                    .getSubject();
        } catch (JWTVerificationException exception) {
            return null;
        }
    }

    public ResponseCookie criarCookie(String token) {
        return ResponseCookie.from(COOKIE_NOME, token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(Duration.ofHours(expirationHours))
                .build();
    }

    public ResponseCookie criarCookieExpirado() {
        return ResponseCookie.from(COOKIE_NOME, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(0)
                .build();
    }

    private Instant dataExpiracao() {
        return LocalDateTime.now().plusHours(expirationHours).atZone(ZoneId.systemDefault()).toInstant();
    }
}
