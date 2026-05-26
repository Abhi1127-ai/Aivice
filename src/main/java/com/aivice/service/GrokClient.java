package com.aivice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class GrokClient {

    @Value("${grok.api.key}")
    private String apiKey;

    @Value("${grok.api.model:grok-3-mini}")
    private String model;

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    private static final String GROK_BASE_URL = "https://api.x.ai/v1";

    /**
     * Sends a prompt to Grok and returns the text response.
     * xAI uses OpenAI-compatible /v1/chat/completions format.
     */
    public String generate(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content",
                                "You are a professional AI assistant for Aivice, an invoicing SaaS platform. Be concise and accurate."),
                        Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.7,
                "max_tokens", 1024
        );

        try {
            String response = webClientBuilder.build()
                    .post()
                    .uri(GROK_BASE_URL + "/chat/completions")
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(response);
            return root
                    .path("choices").get(0)
                    .path("message")
                    .path("content")
                    .asText()
                    .trim();

        } catch (Exception e) {
            log.error("Grok API call failed: {}", e.getMessage());
            throw new RuntimeException("AI service unavailable. Please try again later.");
        }
    }
}
