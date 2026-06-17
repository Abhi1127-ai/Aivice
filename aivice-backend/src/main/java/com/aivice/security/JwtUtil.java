package com.aivice.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.time.Instant;
import java.util.Base64;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    private NimbusJwtEncoder encoder() {
        byte[] keyBytes = Base64.getEncoder().encode(secret.getBytes());
        SecretKeySpec key = new SecretKeySpec(keyBytes, "HmacSHA256");
        com.nimbusds.jose.jwk.OctetSequenceKey jwk =
                new com.nimbusds.jose.jwk.OctetSequenceKey.Builder(key).build();
        return new NimbusJwtEncoder(
                new com.nimbusds.jose.jwk.source.ImmutableJWKSet<>(
                        new com.nimbusds.jose.jwk.JWKSet(jwk)));
    }

    private NimbusJwtDecoder decoder() {
        byte[] keyBytes = Base64.getEncoder().encode(secret.getBytes());
        SecretKeySpec key = new SecretKeySpec(keyBytes, "HmacSHA256");
        return NimbusJwtDecoder.withSecretKey(key).build();
    }

    public String generateToken(String email) {
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(email)
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusMillis(expiration))
                .build();

        JwtEncoderParameters params = JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(),
                claims
        );

        return encoder().encode(params).getTokenValue();
    }

    public String extractEmail(String token) {
        return decoder().decode(token).getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            extractEmail(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}