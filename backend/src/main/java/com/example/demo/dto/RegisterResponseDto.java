package com.example.demo.dto;

public class RegisterResponseDto {
    private String message;
    private String username;
    private String role;
    private Long id;

    public RegisterResponseDto() {}

    public RegisterResponseDto(String message, String username, String role) {
        this.message = message;
        this.username = username;
        this.role = role;
    }

    public RegisterResponseDto(String message, String username, String role, Long id) {
        this.message = message;
        this.username = username;
        this.role = role;
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}