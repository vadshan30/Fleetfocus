package com.example.demo.controller;

import com.example.demo.entity.SystemUser;
import com.example.demo.entity.UserRole;
import com.example.demo.repository.SystemUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private SystemUserRepository systemUserRepository;

    @GetMapping("/technicians")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'MAINTENANCE_TECH')")
    public ResponseEntity<List<SystemUser>> getTechnicians() {
        return ResponseEntity.ok(systemUserRepository.findByRole(UserRole.MAINTENANCE_TECH));
    }
}