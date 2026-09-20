package com.example.demo.job;

import com.example.demo.service.AlertService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AlertRetentionJob {

    private static final Logger log = LoggerFactory.getLogger(AlertRetentionJob.class);

    @Autowired
    private AlertService alertService;

    @Scheduled(cron = "0 0 3 * * *")
    public void purgeOldResolvedAlerts() {
        log.info("Starting scheduled alert retention purge job (cutoff: 30 days)...");
        try {
            int deleted = alertService.purgeResolvedOlderThan(30);
            log.info("Alert retention purge job completed successfully. Deleted {} resolved alert(s).", deleted);
        } catch (Exception e) {
            log.error("Failed to execute alert retention purge job: {}", e.getMessage(), e);
        }
    }
}
