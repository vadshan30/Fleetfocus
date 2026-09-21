package com.example.demo.controller;

import com.example.demo.dto.TelemetrySnapshotDto;
import com.example.demo.service.PlaybackService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/playback")
public class PlaybackController {

    private final PlaybackService playbackService;

    public PlaybackController(PlaybackService playbackService) {
        this.playbackService = playbackService;
    }

    @GetMapping("/range")
    public ResponseEntity<?> getTimeRange() {
        Map<String, LocalDateTime> range = playbackService.getTimeRange();
        if (range == null || range.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(range);
    }

    @GetMapping("/frame")
    public ResponseEntity<?> getFrameAt(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime time) {
        if (time == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Parameter 'time' is required"));
        }
        List<TelemetrySnapshotDto> frame = playbackService.getFrameAt(time);
        return ResponseEntity.ok(frame);
    }

    @GetMapping("/timeline")
    public ResponseEntity<?> getTimeline(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime start,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime end,
            @RequestParam(defaultValue = "60")
            Integer interval) {

        if (start == null || end == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Both 'start' and 'end' parameters are required"));
        }

        if (!start.isBefore(end)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Start time must be strictly before end time"));
        }

        if (interval == null || interval < 5 || interval > 3600) {
            return ResponseEntity.badRequest().body(Map.of("error", "Interval must be between 5 and 3600 seconds"));
        }

        Duration duration = Duration.between(start, end);
        if (duration.toDays() > 7) {
            return ResponseEntity.badRequest().body(Map.of("error", "Time range cannot exceed 7 days"));
        }

        try {
            List<TelemetrySnapshotDto> timeline = playbackService.getTimeline(start, end, interval);
            return ResponseEntity.ok(timeline);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
