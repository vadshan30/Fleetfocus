package com.example.demo.controller;

import com.example.demo.dto.AuthRequestDto;
import com.example.demo.dto.AuthResponseDto;
import com.example.demo.dto.RegisterRequestDto;
import com.example.demo.dto.RegisterResponseDto;
import com.example.demo.dto.UserInfoDto;
import com.example.demo.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user authentication and registration")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Operation(
            summary = "Authenticate user",
            description = "Authenticates credentials (username/password) and returns a signed 24-hour JWT token along with user role and profile information."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Authentication successful",
                    content = @Content(schema = @Schema(implementation = AuthResponseDto.class))),
            @ApiResponse(responseCode = "401", description = "Invalid credentials - Bad username or password"),
            @ApiResponse(responseCode = "400", description = "Bad request - Missing username or password"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @SecurityRequirements // Public endpoint, no Bearer token required
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody AuthRequestDto request) {
        AuthResponseDto response = authService.authenticate(request);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Register new system user",
            description = "Registers a new user account in the FleetFocus system with a specified role (FLEET_MANAGER, DISPATCHER, DRIVER, MAINTENANCE_TECH)."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "User registered successfully",
                    content = @Content(schema = @Schema(implementation = RegisterResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Validation error - Username or email already exists"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @SecurityRequirements // Public endpoint, no Bearer token required
    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDto> register(@RequestBody RegisterRequestDto request) {
        RegisterResponseDto response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "Get current authenticated user",
            description = "Retrieves profile and role details for the currently authenticated user session."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User profile retrieved successfully",
                    content = @Content(schema = @Schema(implementation = UserInfoDto.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Missing or invalid JWT bearer token")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/me")
    public ResponseEntity<UserInfoDto> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserInfoDto userInfo = authService.getUserInfo(auth.getName());
        return ResponseEntity.ok(userInfo);
    }
}