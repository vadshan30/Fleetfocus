package com.example.demo.service;

import com.example.demo.dto.AuthRequestDto;
import com.example.demo.dto.AuthResponseDto;
import com.example.demo.dto.RegisterRequestDto;
import com.example.demo.dto.RegisterResponseDto;
import com.example.demo.dto.UserInfoDto;
import com.example.demo.entity.SystemUser;
import com.example.demo.entity.UserRole;
import com.example.demo.repository.SystemUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private SystemUserRepository systemUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    public AuthResponseDto authenticate(AuthRequestDto request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        SystemUser systemUser = systemUserRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(userDetails);

        return new AuthResponseDto(token, systemUser.getUsername(), systemUser.getRole().name());
    }

    public RegisterResponseDto register(RegisterRequestDto request) {
        if (systemUserRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username '" + request.getUsername() + "' already exists");
        }

        if (systemUserRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email '" + request.getEmail() + "' already exists");
        }

        UserRole role;
        try {
            role = UserRole.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role. Allowed roles: FLEET_MANAGER, DISPATCHER, DRIVER, MAINTENANCE_TECH");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        SystemUser user = new SystemUser(request.getUsername(), encodedPassword, request.getEmail(), role);
        SystemUser savedUser = systemUserRepository.save(user);

        return new RegisterResponseDto(
                "User registered successfully!",
                savedUser.getUsername(),
                savedUser.getRole().name(),
                savedUser.getId()
        );
    }

    public UserInfoDto getUserInfo(String username) {
        SystemUser user = systemUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        return new UserInfoDto(user.getId(), user.getUsername(), user.getRole().name(), user.getEmail());
    }
}