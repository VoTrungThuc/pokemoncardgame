package com.pokemon.marketplace.infrastructure.fcm;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Sends push notifications through Firebase Cloud Messaging (v1 API).
 * Safe to use even if FCM is misconfigured: failures are logged, never thrown.
 */
@Slf4j
@Service
public class FcmService {

    private final FcmHttpClient client;

    public FcmService() {
        FcmHttpClient c = null;
        try {
            c = new FcmHttpClient();
        } catch (IllegalStateException e) {
            log.warn("FCMService disabled: {}", e.getMessage());
        }
        this.client = c;
    }

    public void sendToToken(String token, String title, String body) {
        if (client == null) {
            log.warn("FCM not configured, skip push to token");
            return;
        }
        client.send(token, title, body);
    }

    public void sendToTokens(List<String> tokens, String title, String body) {
        if (client == null || tokens == null) {
            return;
        }
        for (String t : tokens) {
            sendToToken(t, title, body);
        }
    }
}
