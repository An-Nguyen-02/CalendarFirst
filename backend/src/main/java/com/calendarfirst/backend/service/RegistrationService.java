package com.calendarfirst.backend.service;

import com.calendarfirst.backend.model.User;
import com.calendarfirst.backend.repository.UserRepository;
import com.calendarfirst.backend.auth.VerificationToken;
import com.calendarfirst.backend.repository.VerificationTokenRepository;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.UUID;
import java.time.Instant;

@Service
public class RegistrationService {

    private final UserRepository userRepository;
    private final VerificationTokenRepository tokenRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    public RegistrationService(UserRepository userRepository,
                               VerificationTokenRepository tokenRepository,
                               JavaMailSender mailSender,
                               PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.mailSender = mailSender;
        this.passwordEncoder = passwordEncoder;
    }

    public void registerUser(User user) {
        // Hash the password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);

        // Generate a verification token
        VerificationToken token = new VerificationToken();
        token.setUser(user);
        token.setTokenHash(UUID.randomUUID().toString());
        token.setExpiresAt(Instant.now().plusSeconds(3600));
        tokenRepository.save(token);

        // Send verification email
        sendVerificationEmail(user.getEmail(), token.getTokenHash());
    }

    private void sendVerificationEmail(String email, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Verify your email");
        message.setText("Click here to verify: https://your-app.com/verify?token=" + token);
        mailSender.send(message);
    }
}
