package com.pokemon.marketplace.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String username, String otpCode) {
        log.info("Attempting to send OTP email to {} for user {}", toEmail, username);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Mã OTP xác thực đăng ký tài khoản Pokémon Card Marketplace");
            message.setText("Xin chào " + username + ",\n\n" +
                    "Mã OTP để xác thực tài khoản của bạn là: " + otpCode + "\n" +
                    "Mã này có hiệu lực trong vòng 5 phút.\n\n" +
                    "Nếu bạn không yêu cầu đăng ký tài khoản này, vui lòng bỏ qua email này.\n\n" +
                    "Trân trọng,\n" +
                    "Pokémon Card Marketplace Team");
            mailSender.send(message);
            log.info("OTP email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send email to {}. Error: {}", toEmail, e.getMessage());
        }

        // Print the OTP to console/log clearly as a fallback
        System.out.println("\n============================================================");
        System.out.println("   [FALLBACK OTP CODE LOG]");
        System.out.println("   User: " + username);
        System.out.println("   Email: " + toEmail);
        System.out.println("   MÃ OTP CỦA BẠN LÀ: " + otpCode);
        System.out.println("============================================================\n");
    }
}
