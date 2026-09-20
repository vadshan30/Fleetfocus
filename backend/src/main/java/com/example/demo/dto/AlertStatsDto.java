package com.example.demo.dto;

import java.time.LocalDateTime;

public class AlertStatsDto {

    private long total;
    private long critical;
    private long warning;
    private long info;
    private long unacknowledged;
    private long resolved;
    private LocalDateTime oldestUnacked;
    private long last24h;

    public AlertStatsDto() {
    }

    public AlertStatsDto(long total, long critical, long warning, long info,
                         long unacknowledged, long resolved,
                         LocalDateTime oldestUnacked, long last24h) {
        this.total = total;
        this.critical = critical;
        this.warning = warning;
        this.info = info;
        this.unacknowledged = unacknowledged;
        this.resolved = resolved;
        this.oldestUnacked = oldestUnacked;
        this.last24h = last24h;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public long getCritical() {
        return critical;
    }

    public void setCritical(long critical) {
        this.critical = critical;
    }

    public long getWarning() {
        return warning;
    }

    public void setWarning(long warning) {
        this.warning = warning;
    }

    public long getInfo() {
        return info;
    }

    public void setInfo(long info) {
        this.info = info;
    }

    public long getUnacknowledged() {
        return unacknowledged;
    }

    public void setUnacknowledged(long unacknowledged) {
        this.unacknowledged = unacknowledged;
    }

    public long getResolved() {
        return resolved;
    }

    public void setResolved(long resolved) {
        this.resolved = resolved;
    }

    public LocalDateTime getOldestUnacked() {
        return oldestUnacked;
    }

    public void setOldestUnacked(LocalDateTime oldestUnacked) {
        this.oldestUnacked = oldestUnacked;
    }

    public long getLast24h() {
        return last24h;
    }

    public void setLast24h(long last24h) {
        this.last24h = last24h;
    }
}
