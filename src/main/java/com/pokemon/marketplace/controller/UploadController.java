package com.pokemon.marketplace.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@Slf4j
public class UploadController {

    @Value("${app.upload.dir:/app/uploads}")
    private String uploadDir;

    @Value("${app.upload.base-url:http://13.236.183.16:8080}")
    private String baseUrl;

    @PostMapping("/image")
    public ResponseEntity<java.util.Map<String, Object>> uploadImage(
            @RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("success", false, "message", "empty file"));
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(java.util.Map.of("success", false, "message", "not an image"));
        }
        try {
            Path dir = Paths.get(uploadDir);
            Files.createDirectories(dir);
            String ext = "png";
            if (contentType.contains("jpeg") || contentType.contains("jpg")) ext = "jpg";
            else if (contentType.contains("gif")) ext = "gif";
            else if (contentType.contains("webp")) ext = "webp";
            String filename = UUID.randomUUID() + "." + ext;
            Path target = dir.resolve(filename);
            Files.copy(file.getInputStream(), target);

            String url = baseUrl + "/uploads/" + filename;
            log.info("Saved upload {} -> {}", file.getOriginalFilename(), url);
            return ResponseEntity.ok(java.util.Map.of(
                    "success", true,
                    "url", url,
                    "message", "uploaded"));
        } catch (IOException e) {
            log.error("Upload failed: {}", e.getMessage());
            return ResponseEntity.status(500).body(java.util.Map.of("success", false, "message", e.getMessage()));
        }
    }
}
