package com.pokemon.marketplace.controller;

import com.pokemon.marketplace.dto.ApiResponse;
import com.pokemon.marketplace.entity.TopUpTransaction;
import com.pokemon.marketplace.entity.User;
import com.pokemon.marketplace.repository.TopUpTransactionRepository;
import com.pokemon.marketplace.repository.UserRepository;
import com.pokemon.marketplace.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;
    private final TopUpTransactionRepository topUpTransactionRepository;

    @GetMapping("/create-payment")
    public ResponseEntity<ApiResponse<String>> createPayment(
            @RequestParam Long orderId,
            HttpServletRequest request) {
        log.info("REST request to generate VNPay payment URL for order ID: {}", orderId);
        String paymentUrl = paymentService.createPaymentUrl(orderId, request);
        return ResponseEntity.ok(ApiResponse.success(paymentUrl, "Payment URL generated successfully"));
    }

    @GetMapping("/vnpay-callback")
    public ResponseEntity<Void> vnpayCallback(
            @RequestParam Map<String, String> params) {
        log.info("REST request to process VNPay payment callback");
        boolean success = paymentService.processCallback(params);
        String orderId = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        
        String redirectUrl = String.format("pokemonapp://payment-callback?success=%b&orderId=%s&responseCode=%s", 
                success, orderId, responseCode);
                
        return ResponseEntity.status(org.springframework.http.HttpStatus.FOUND)
                .header(org.springframework.http.HttpHeaders.LOCATION, redirectUrl)
                .build();
    }

    @GetMapping("/vnpay-ipn")
    public ResponseEntity<Map<String, String>> vnpayIpn(
            @RequestParam Map<String, String> params) {
        log.info("Received VNPay IPN callback (Server-to-Server)");
        Map<String, String> response = new HashMap<>();
        
        try {
            boolean success = paymentService.processCallback(params);
            if (success) {
                response.put("RspCode", "00");
                response.put("Message", "Confirm Success");
            } else {
                response.put("RspCode", "99");
                response.put("Message", "Confirm Failure / Payment Failed");
            }
        } catch (Exception e) {
            log.error("Error processing VNPay IPN callback", e);
            response.put("RspCode", "99");
            response.put("Message", "Error processing IPN: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }

    private Long getAuthenticatedUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return user.getId();
    }

    @GetMapping("/create-topup")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<Map<String, String>>> createTopUp(
            @RequestParam BigDecimal amount,
            HttpServletRequest request) {
        Long userId = getAuthenticatedUserId();
        log.info("REST request to generate VNPay top-up URL for User ID: {}, Amount: {}", userId, amount);
        
        String paymentUrl = paymentService.createTopUpPaymentUrl(amount, userId, request);
        
        String txnRef = "";
        try {
            java.net.URI uri = new java.net.URI(paymentUrl);
            String query = uri.getQuery();
            String[] pairs = query.split("&");
            for (String pair : pairs) {
                int idx = pair.indexOf("=");
                String key = java.net.URLDecoder.decode(pair.substring(0, idx), "UTF-8");
                String value = java.net.URLDecoder.decode(pair.substring(idx + 1), "UTF-8");
                if ("vnp_TxnRef".equals(key)) {
                    txnRef = value;
                    break;
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse txnRef from payment URL", e);
        }

        Map<String, String> response = new HashMap<>();
        response.put("paymentUrl", paymentUrl);
        response.put("txnRef", txnRef);

        return ResponseEntity.ok(ApiResponse.success(response, "Top-up payment URL generated successfully"));
    }

    @GetMapping("/topup-status")
    public ResponseEntity<ApiResponse<Map<String, String>>> getTopUpStatus(@RequestParam String txnRef) {
        log.info("REST request to check top-up status for txnRef: {}", txnRef);
        Optional<TopUpTransaction> transactionOpt = topUpTransactionRepository.findById(txnRef);
        
        Map<String, String> result = new HashMap<>();
        if (transactionOpt.isPresent()) {
            result.put("status", transactionOpt.get().getStatus());
            result.put("amount", transactionOpt.get().getAmount().toString());
        } else {
            result.put("status", "NOT_FOUND");
        }
        
        return ResponseEntity.ok(ApiResponse.success(result, "Fetched top-up status successfully"));
    }
}
