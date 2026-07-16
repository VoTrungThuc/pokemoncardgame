package com.pokemon.marketplace.controller;

import com.pokemon.marketplace.config.security.JwtUtil;
import com.pokemon.marketplace.dto.*;
import com.pokemon.marketplace.entity.RefreshToken;
import com.pokemon.marketplace.entity.User;
import com.pokemon.marketplace.entity.enums.UserRole;
import com.pokemon.marketplace.repository.UserRepository;
import com.pokemon.marketplace.service.RefreshTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.pokemon.marketplace.entity.OtpVerification;
import com.pokemon.marketplace.repository.OtpVerificationRepository;
import com.pokemon.marketplace.service.MailService;
import java.time.LocalDateTime;
import java.util.Random;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final OtpVerificationRepository otpVerificationRepository;
    private final MailService mailService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDTO>> register(@Valid @RequestBody RegisterRequest request) {
        log.info("REST request to register user: {}", request.getUsername());
        String email = request.getEmail().trim().toLowerCase();
        String username = request.getUsername().trim();

        if (userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Username is already taken");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email is already registered");
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(1000000));

        // Clean up previous registration attempts for this email/username to avoid duplicate keys
        otpVerificationRepository.findByEmail(email).ifPresent(otpVerificationRepository::delete);
        otpVerificationRepository.findByUsername(username).ifPresent(otpVerificationRepository::delete);

        // Save unverified user details and OTP
        OtpVerification verification = OtpVerification.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .shippingAddress(request.getShippingAddress())
                .otpCode(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .purpose("REGISTER")
                .build();

        otpVerificationRepository.save(verification);

        // Send OTP
        mailService.sendOtpEmail(email, username, otp);

        UserDTO responseDTO = UserDTO.builder()
                .username(username)
                .email(email)
                .build();

        return new ResponseEntity<>(ApiResponse.success(responseDTO, "Mã OTP đã được gửi đến email của bạn. Vui lòng xác thực."), HttpStatus.OK);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<UserDTO>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        log.info("REST request to verify OTP for email: {}", email);
        OtpVerification verification = otpVerificationRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin đăng ký cho email này"));

        if (!verification.getOtpCode().equals(request.getOtp())) {
            throw new IllegalArgumentException("Mã OTP không chính xác");
        }

        if (verification.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Mã OTP đã hết hạn");
        }

        if (userRepository.findByUsername(verification.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Tên đăng nhập đã tồn tại");
        }
        if (userRepository.findByEmail(verification.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email đã được đăng ký");
        }

        User user = User.builder()
                .username(verification.getUsername())
                .email(verification.getEmail())
                .password(verification.getPassword()) // Already encoded
                .phone(verification.getPhone())
                .shippingAddress(verification.getShippingAddress())
                .role(UserRole.USER)
                .build();

        User savedUser = userRepository.save(user);

        otpVerificationRepository.delete(verification);

        UserDTO responseDTO = UserDTO.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .phone(savedUser.getPhone())
                .shippingAddress(savedUser.getShippingAddress())
                .role(savedUser.getRole())
                .build();

        return new ResponseEntity<>(ApiResponse.success(responseDTO, "Xác thực OTP thành công. Tài khoản đã được tạo!"), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        log.info("REST request to login user: {}", request.getUsername());
        String loginInput = request.getUsername().trim();
        String lookupEmail = loginInput.toLowerCase();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginInput, request.getPassword())
        );

        User user = userRepository.findByUsername(loginInput)
                .or(() -> userRepository.findByEmail(lookupEmail))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + loginInput));

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        AuthResponse response = AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken.getToken())
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .balance(user.getBalance() != null ? user.getBalance() : 0.0)
                .build();

        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenRefreshResponse>> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        log.info("REST request to refresh access token using refresh token");
        String requestRefreshToken = request.getRefreshToken();
        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
                    TokenRefreshResponse response = TokenRefreshResponse.builder()
                            .accessToken(token)
                            .refreshToken(requestRefreshToken)
                            .build();
                    return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed successfully"));
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logoutUser(@Valid @RequestBody TokenRefreshRequest request) {
        log.info("REST request to logout user");
        String requestRefreshToken = request.getRefreshToken();
        refreshTokenService.findByToken(requestRefreshToken)
                .map(RefreshToken::getUser)
                .ifPresent(user -> refreshTokenService.deleteByUserId(user.getId()));
        return ResponseEntity.ok(ApiResponse.success("Log out successful", "Logged out successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        log.info("REST request for password reset OTP for email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản với email này"));

        String otp = String.format("%06d", new Random().nextInt(1000000));

        otpVerificationRepository.findByEmailAndPurpose(email, "RESET").ifPresent(otpVerificationRepository::delete);

        OtpVerification verification = OtpVerification.builder()
                .username(user.getUsername())
                .email(email)
                .otpCode(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .purpose("RESET")
                .build();

        otpVerificationRepository.save(verification);

        mailService.sendPasswordResetEmail(email, user.getUsername(), otp);

        return ResponseEntity.ok(ApiResponse.success(
                "OTP sent", "Mã OTP đặt lại mật khẩu đã được gửi đến email của bạn."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        log.info("REST request to reset password for email: {}", email);

        OtpVerification verification = otpVerificationRepository.findByEmailAndPurpose(email, "RESET")
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy yêu cầu đặt lại mật khẩu cho email này"));

        if (!verification.getOtpCode().equals(request.getOtp())) {
            throw new IllegalArgumentException("Mã OTP không chính xác");
        }

        if (verification.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Mã OTP đã hết hạn");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản với email này"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        otpVerificationRepository.delete(verification);

        return ResponseEntity.ok(ApiResponse.success(
                "Password reset", "Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới."));
    }
}
