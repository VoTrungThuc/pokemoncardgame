package com.pokemon.marketplace.controller;

import com.pokemon.marketplace.dto.ApiResponse;
import com.pokemon.marketplace.dto.WithdrawRequestDTO;
import com.pokemon.marketplace.dto.StoreBankInfo;
import com.pokemon.marketplace.dto.WithdrawCreateRequest;
import com.pokemon.marketplace.entity.User;
import com.pokemon.marketplace.repository.UserRepository;
import com.pokemon.marketplace.service.WithdrawService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/withdraw")
@RequiredArgsConstructor
public class WithdrawController {

    private final WithdrawService withdrawService;
    private final UserRepository userRepository;

    private Long getAuthenticatedUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return user.getId();
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<WithdrawRequestDTO>> createRequest(@RequestBody WithdrawCreateRequest request) {
        Long userId = getAuthenticatedUserId();
        log.info("REST request to create withdraw by User ID: {}", userId);
        WithdrawRequestDTO dto = withdrawService.createRequest(userId, request);
        return ResponseEntity.ok(ApiResponse.success(dto, "Yêu cầu rút tiền đã được tạo"));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<List<WithdrawRequestDTO>>> getMyRequests() {
        Long userId = getAuthenticatedUserId();
        log.info("REST request to get withdraw requests for User ID: {}", userId);
        List<WithdrawRequestDTO> list = withdrawService.getUserRequests(userId);
        return ResponseEntity.ok(ApiResponse.success(list, "Fetched withdraw requests"));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<WithdrawRequestDTO>>> getAllRequests() {
        log.info("REST request to get all withdraw requests");
        List<WithdrawRequestDTO> list = withdrawService.getAllRequests();
        return ResponseEntity.ok(ApiResponse.success(list, "Fetched all withdraw requests"));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<WithdrawRequestDTO>> approve(@PathVariable Long id) {
        log.info("REST request to approve withdraw request ID: {}", id);
        WithdrawRequestDTO dto = withdrawService.approveRequest(id);
        return ResponseEntity.ok(ApiResponse.success(dto, "Yêu cầu rút tiền đã được duyệt"));
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<WithdrawRequestDTO>> complete(@PathVariable Long id) {
        log.info("REST request to complete withdraw request ID: {}", id);
        WithdrawRequestDTO dto = withdrawService.completeRequest(id);
        return ResponseEntity.ok(ApiResponse.success(dto, "Yêu cầu rút tiền đã hoàn tất"));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<WithdrawRequestDTO>> reject(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "Từ chối bởi admin");
        log.info("REST request to reject withdraw request ID: {} reason: {}", id, reason);
        WithdrawRequestDTO dto = withdrawService.rejectRequest(id, reason);
        return ResponseEntity.ok(ApiResponse.success(dto, "Yêu cầu rút tiền đã bị từ chối"));
    }

    @GetMapping("/store-bank")
    public ResponseEntity<ApiResponse<StoreBankInfo>> getStoreBankInfo() {
        log.info("REST request to get store bank info");
        StoreBankInfo info = withdrawService.getStoreBankInfo();
        return ResponseEntity.ok(ApiResponse.success(info, "Fetched store bank info"));
    }
}
