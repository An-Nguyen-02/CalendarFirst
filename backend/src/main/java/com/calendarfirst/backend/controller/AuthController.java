package com.calendarfirst.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.calendarfirst.backend.dto.LoginRequest;

@RestController
@RequestMapping("/")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // Authentication logic
        return ResponseEntity.ok().body("Login endpoint not yet implemented");
    }

    @PostMapping("/auth")
    public ResponseEntity<?> auth(@RequestBody LoginRequest loginRequest) {
        // Authentication logic
        return ResponseEntity.ok().body("Auth endpoint not yet implemented");
    }

    // DTO for login request
    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() {
            return email;
        }
        public void setEmail(String email) {
            this.email = email;
        }
        public String getPassword() {
            return password;
        }
        public void setPassword(String password) {
            this.password = password;
        }
    }
}