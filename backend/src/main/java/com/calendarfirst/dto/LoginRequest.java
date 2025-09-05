package com.calendarfirst.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class LoginRequest {
    @JsonProperty("username")
    private String username;
    
    @JsonProperty("password")
    private String password;
    
    // Default constructor (required for Jackson)
    public LoginRequest() {}
    
    public LoginRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    @Override
    public String toString() {
        return "LoginRequest{username='" + username + "'}"; // Don't log password!
    }
}