package com.example.demo.dto;

public class MaintenanceIssueDto {
    private String category;
    private String description;
    private String severity;

    public MaintenanceIssueDto() {
    }

    public MaintenanceIssueDto(String category, String description, String severity) {
        this.category = category;
        this.description = description;
        this.severity = severity;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }
}
