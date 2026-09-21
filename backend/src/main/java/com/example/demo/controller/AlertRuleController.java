package com.example.demo.controller;

import com.example.demo.entity.AlertRule;
import com.example.demo.service.AlertRuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alert-rules")
@PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DISPATCHER')")
public class AlertRuleController {

    @Autowired
    private AlertRuleService alertRuleService;

    @GetMapping
    public ResponseEntity<List<AlertRule>> getAllRules() {
        return ResponseEntity.ok(alertRuleService.getAllRules());
    }

    @GetMapping("/active")
    public ResponseEntity<List<AlertRule>> getActiveRules() {
        return ResponseEntity.ok(alertRuleService.getActiveRules());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlertRule> getRule(@PathVariable Long id) {
        AlertRule rule = alertRuleService.getRuleById(id);
        if (rule == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(rule);
    }

    @PostMapping
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<AlertRule> createRule(@RequestBody AlertRule rule) {
        AlertRule created = alertRuleService.createRule(rule);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<AlertRule> updateRule(@PathVariable Long id, @RequestBody AlertRule rule) {
        AlertRule updated = alertRuleService.updateRule(id, rule);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<Void> deleteRule(@PathVariable Long id) {
        alertRuleService.deactivateRule(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/effective/{vehicleId}")
    public ResponseEntity<List<AlertRule>> getEffectiveRules(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(alertRuleService.getEffectiveRulesFor(vehicleId));
    }
}