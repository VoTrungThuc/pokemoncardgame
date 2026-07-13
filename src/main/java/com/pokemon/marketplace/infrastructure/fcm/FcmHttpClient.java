package com.pokemon.marketplace.infrastructure.fcm;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.ServiceAccountCredentials;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * Thin client for Firebase Cloud Messaging v1 API.
 * The service-account JSON is provided via the FCM_SERVICE_ACCOUNT_B64 env var
 * (base64 encoded) so the secret is never committed to the repo.
 */
@Slf4j
public class FcmHttpClient {

    private static final String FCM_SEND_URL =
            "https://fcm.googleapis.com/v1/projects/%s/messages:send";
    private static final String PROJECT_ID_ENV = "FCM_PROJECT_ID";
    private static final String SERVICE_ACCOUNT_ENV = "FCM_SERVICE_ACCOUNT_B64";

    private final String projectId;
    private final GoogleCredentials credentials;
    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public FcmHttpClient() {
        this.projectId = System.getenv(PROJECT_ID_ENV);
        String b64 = System.getenv(SERVICE_ACCOUNT_ENV);
        if (projectId == null || projectId.isBlank() || b64 == null || b64.isBlank()) {
            throw new IllegalStateException(
                    "FCM is not configured (missing " + PROJECT_ID_ENV + " / " + SERVICE_ACCOUNT_ENV + ")");
        }
        try {
            byte[] json = Base64.getDecoder().decode(b64);
            ServiceAccountCredentials sa = ServiceAccountCredentials.fromStream(
                    new java.io.ByteArrayInputStream(json));
            this.credentials = sa.createScoped("https://www.googleapis.com/auth/firebase.messaging");
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse FCM service account", e);
        }
        this.webClient = WebClient.builder().build();
    }

    public void send(String token, String title, String body) {
        if (token == null || token.isBlank()) {
            return;
        }
        try {
            String accessToken = credentials.getAccessToken().getTokenValue();

            Map<String, Object> notification = new HashMap<>();
            notification.put("title", title);
            notification.put("body", body);

            Map<String, Object> data = new HashMap<>();
            data.put("click_action", "FLUTTER_NOTIFICATION_CLICK");
            data.put("type", "chat");

            Map<String, Object> message = new HashMap<>();
            message.put("token", token);
            message.put("notification", notification);
            message.put("data", data);

            Map<String, Object> payload = new HashMap<>();
            payload.put("message", message);

            String json = objectMapper.writeValueAsString(payload);
            String url = String.format(FCM_SEND_URL, projectId);

            webClient.post()
                    .uri(url)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .body(BodyInserters.fromValue(json))
                    .retrieve()
                    .bodyToMono(String.class)
                    .onErrorResume(WebClientResponseException.class, ex -> {
                        log.error("FCM send failed ({}): {}", ex.getStatusCode(), ex.getResponseBodyAsString());
                        return Mono.empty();
                    })
                    .block();
        } catch (Exception e) {
            log.error("Failed to send FCM message: {}", e.getMessage());
        }
    }
}
