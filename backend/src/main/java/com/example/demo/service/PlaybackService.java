package com.example.demo.service;

import com.example.demo.dto.TelemetrySnapshotDto;
import com.example.demo.entity.TelemetryData;
import com.example.demo.entity.Vehicle;
import com.example.demo.repository.TelemetryDataRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class PlaybackService {

    private final TelemetryDataRepository telemetryDataRepository;

    public PlaybackService(TelemetryDataRepository telemetryDataRepository) {
        this.telemetryDataRepository = telemetryDataRepository;
    }

    public Map<String, LocalDateTime> getTimeRange() {
        Optional<LocalDateTime> minTime = telemetryDataRepository.findMinRecordedAt();
        Optional<LocalDateTime> maxTime = telemetryDataRepository.findMaxRecordedAt();

        if (minTime.isEmpty() || maxTime.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<String, LocalDateTime> range = new LinkedHashMap<>();
        range.put("minTime", minTime.get());
        range.put("maxTime", maxTime.get());
        return range;
    }

    public List<TelemetrySnapshotDto> getFrameAt(LocalDateTime time) {
        List<TelemetryData> latestData = telemetryDataRepository.findLatestPerVehicleBefore(time);
        return latestData.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<TelemetrySnapshotDto> getTimeline(LocalDateTime start, LocalDateTime end, Integer intervalSeconds) {
        long durationSeconds = Duration.between(start, end).getSeconds();
        double durationHours = durationSeconds / 3600.0;

        if (durationHours > 24 && intervalSeconds < 300) {
            throw new IllegalArgumentException("Interval must be at least 300 seconds for time ranges exceeding 24 hours");
        } else if (durationHours > 12 && intervalSeconds < 120) {
            throw new IllegalArgumentException("Interval must be at least 120 seconds for time ranges exceeding 12 hours");
        } else if (durationHours > 6 && intervalSeconds < 60) {
            throw new IllegalArgumentException("Interval must be at least 60 seconds for time ranges exceeding 6 hours");
        }

        List<TelemetryData> dataList = telemetryDataRepository.findRangeWithVehicle(start, end);
        Map<String, TelemetryData> sampledMap = new LinkedHashMap<>();

        for (TelemetryData t : dataList) {
            if (t.getRecordedAt() == null || t.getVehicle() == null) {
                continue;
            }
            long secondsSinceStart = ChronoUnit.SECONDS.between(start, t.getRecordedAt());
            if (secondsSinceStart < 0) {
                secondsSinceStart = 0;
            }
            long bucket = secondsSinceStart / intervalSeconds;
            String key = t.getVehicle().getId() + "_" + bucket;
            sampledMap.put(key, t);
        }

        return sampledMap.values().stream()
                .map(this::mapToDto)
                .sorted(Comparator.comparing(TelemetrySnapshotDto::getRecordedAt))
                .collect(Collectors.toList());
    }

    private TelemetrySnapshotDto mapToDto(TelemetryData t) {
        Vehicle v = t.getVehicle();
        return new TelemetrySnapshotDto(
                v != null ? v.getId() : null,
                v != null ? v.getLicensePlate() : null,
                v != null ? v.getModel() : null,
                v != null && v.getStatus() != null ? v.getStatus().name() : "AVAILABLE",
                t.getLatitude(),
                t.getLongitude(),
                t.getSpeed(),
                t.getFuelLevel(),
                t.getEngineTemp(),
                t.getRecordedAt()
        );
    }
}
