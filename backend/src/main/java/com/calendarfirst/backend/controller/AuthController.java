package com.calendarfirst.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.calendarfirst.backend.dto.SignupRequest;
import com.calendarfirst.backend.model.User;
import com.calendarfirst.backend.service.RegistrationService;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final RegistrationService registrationService;

    public AuthController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest signupRequest) {
        try {
            // Create a new user entity
            User user = new User();
            user.setUsername(signupRequest.getUsername());
            user.setEmail(signupRequest.getEmail());
            user.setPassword(signupRequest.getPassword());

            // Register the user
            registrationService.registerUser(user);

            return ResponseEntity.ok()
                .header("Content-Type", "application/json")
                .body("{\"message\": \"User registered successfully. Please check your email for verification.\"}");

        } catch (Exception e) {
            System.err.println("Error in signup endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body("{\"error\": \"Internal server error: " + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestParam("token") String token) {
        try {
            registrationService.verifyUser(token);

            return ResponseEntity.ok()
                .header("Content-Type", "application/json")
                .body("{\"message\": \"User verified successfully.\"}");

        } catch (IllegalArgumentException e) {
            // Invalid or expired token
            return ResponseEntity.badRequest()
                .header("Content-Type", "application/json")
                .body("{\"error\": \"" + e.getMessage() + "\"}");

        } catch (Exception e) {
            // Any unexpected server error
            System.err.println("Error in verify endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body("{\"error\": \"Internal server error: " + e.getMessage() + "\"}");
        }
    }
}
