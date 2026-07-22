package com.pokemon.marketplace.service;

import com.pokemon.marketplace.dto.WithdrawRequestDTO;
import com.pokemon.marketplace.dto.StoreBankInfo;
import com.pokemon.marketplace.dto.WithdrawCreateRequest;
import com.pokemon.marketplace.entity.User;
import com.pokemon.marketplace.entity.WithdrawRequest;
import com.pokemon.marketplace.exception.ResourceNotFoundException;
import com.pokemon.marketplace.mapper.WithdrawRequestMapper;
import com.pokemon.marketplace.repository.UserRepository;
import com.pokemon.marketplace.repository.WithdrawRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WithdrawService {

    private final WithdrawRequestRepository withdrawRequestRepository;
    private final UserRepository userRepository;
    private final WithdrawRequestMapper withdrawRequestMapper;

    @Value("${store.bank.name:}")
    private String storeBankName;

    @Value("${store.bank.account:}")
    private String storeBankAccount;

    @Value("${store.bank.holder:}")
    private String storeBankHolder;

    @Transactional
    public WithdrawRequestDTO createRequest(Long userId, WithdrawCreateRequest request) {
        log.info("Creating withdraw request for User ID: {} amount: {}", userId, request.getAmount());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Số tiền rút phải lớn hơn 0");
        }

        double balance = user.getBalance() != null ? user.getBalance() : 0.0;
        if (request.getAmount().compareTo(BigDecimal.valueOf(balance)) > 0) {
            throw new IllegalArgumentException("Số dư không đủ. Số dư hiện tại: $" + String.format("%.2f", balance));
        }

        if (request.getBankName() == null || request.getBankName().trim().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng nhập tên ngân hàng");
        }
        if (request.getBankAccountNumber() == null || request.getBankAccountNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng nhập số tài khoản");
        }
        if (request.getAccountHolder() == null || request.getAccountHolder().trim().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng nhập tên chủ tài khoản");
        }

        WithdrawRequest withdrawRequest = WithdrawRequest.builder()
                .userId(userId)
                .username(user.getUsername())
                .amount(request.getAmount())
                .bankName(request.getBankName().trim())
                .bankAccountNumber(request.getBankAccountNumber().trim())
                .accountHolder(request.getAccountHolder().trim())
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        WithdrawRequest saved = withdrawRequestRepository.save(withdrawRequest);
        log.info("Withdraw request created with ID: {}", saved.getId());
        return withdrawRequestMapper.toDTO(saved);
    }

    public List<WithdrawRequestDTO> getUserRequests(Long userId) {
        log.info("Fetching withdraw requests for User ID: {}", userId);
        return withdrawRequestRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(withdrawRequestMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<WithdrawRequestDTO> getAllRequests() {
        log.info("Fetching all withdraw requests");
        return withdrawRequestRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(withdrawRequestMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public WithdrawRequestDTO approveRequest(Long requestId) {
        log.info("Approving withdraw request ID: {}", requestId);
        WithdrawRequest wr = withdrawRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Withdraw request not found: " + requestId));

        if (!"PENDING".equals(wr.getStatus())) {
            throw new IllegalArgumentException("Chỉ có thể duyệt yêu cầu ở trạng thái PENDING");
        }

        wr.setStatus("APPROVED");
        wr.setUpdatedAt(LocalDateTime.now());
        WithdrawRequest saved = withdrawRequestRepository.save(wr);
        log.info("Withdraw request ID: {} approved", requestId);
        return withdrawRequestMapper.toDTO(saved);
    }

    @Transactional
    public WithdrawRequestDTO completeRequest(Long requestId) {
        log.info("Completing withdraw request ID: {}", requestId);
        WithdrawRequest wr = withdrawRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Withdraw request not found: " + requestId));

        if (!"APPROVED".equals(wr.getStatus())) {
            throw new IllegalArgumentException("Chỉ có thể hoàn tất yêu cầu ở trạng thái APPROVED");
        }

        User user = userRepository.findById(wr.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + wr.getUserId()));

        double currentBalance = user.getBalance() != null ? user.getBalance() : 0.0;
        double withdrawAmount = wr.getAmount().doubleValue();

        if (currentBalance < withdrawAmount) {
            throw new IllegalArgumentException("Số dư không đủ để hoàn tất yêu cầu rút tiền");
        }

        user.setBalance(currentBalance - withdrawAmount);
        userRepository.save(user);

        wr.setStatus("COMPLETED");
        wr.setUpdatedAt(LocalDateTime.now());
        WithdrawRequest saved = withdrawRequestRepository.save(wr);

        log.info("Withdraw request ID: {} completed. User ID: {} balance: {} -> {}",
                requestId, user.getId(), currentBalance, user.getBalance());
        return withdrawRequestMapper.toDTO(saved);
    }

    @Transactional
    public WithdrawRequestDTO rejectRequest(Long requestId, String reason) {
        log.info("Rejecting withdraw request ID: {} reason: {}", requestId, reason);
        WithdrawRequest wr = withdrawRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Withdraw request not found: " + requestId));

        if (!"PENDING".equals(wr.getStatus())) {
            throw new IllegalArgumentException("Chỉ có thể từ chối yêu cầu ở trạng thái PENDING");
        }

        wr.setStatus("REJECTED");
        wr.setAdminNote(reason);
        wr.setUpdatedAt(LocalDateTime.now());
        WithdrawRequest saved = withdrawRequestRepository.save(wr);
        log.info("Withdraw request ID: {} rejected", requestId);
        return withdrawRequestMapper.toDTO(saved);
    }

    public StoreBankInfo getStoreBankInfo() {
        return StoreBankInfo.builder()
                .bankName(storeBankName)
                .bankAccountNumber(storeBankAccount)
                .accountHolder(storeBankHolder)
                .build();
    }
}
