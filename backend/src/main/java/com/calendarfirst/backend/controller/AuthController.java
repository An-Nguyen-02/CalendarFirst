package com.calendarfirst.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.calendarfirst.backend.dto.LoginRequest;

@RestController
@RequestMapping("/api")
public class AuthController {

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        System.out.println("Test endpoint hit!");
        return ResponseEntity.ok().body("Backend is working!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            System.out.println("Login endpoint hit with request: " + loginRequest);
            System.out.println("Username: " + loginRequest.getUsername());
            
            // Add some basic response
            return ResponseEntity.ok()
                .header("Content-Type", "application/json")
                .body("{\"message\": \"Login endpoint working\", \"username\": \"" + loginRequest.getUsername() + "\"}");
                
        } catch (Exception e) {
            System.err.println("Error in login endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body("{\"error\": \"Internal server error: " + e.getMessage() + "\"}");
        }
    }

    @PostMapping("/auth")
    public ResponseEntity<?> auth(@RequestBody LoginRequest loginRequest) {
        try {
            System.out.println("Auth endpoint hit with request: " + loginRequest);
            return ResponseEntity.ok()
                .header("Content-Type", "application/json")
                .body("{\"message\": \"Auth endpoint working\"}");
        } catch (Exception e) {
            System.err.println("Error in auth endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body("{\"error\": \"Internal server error: " + e.getMessage() + "\"}");
        }
    }
}