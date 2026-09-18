package com.example.demo.service;

import com.example.demo.entity.Driver;
import com.example.demo.entity.DriverStatus;
import com.example.demo.entity.SystemUser;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.DriverRepository;
import com.example.demo.repository.SystemUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DriverService {

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private SystemUserRepository systemUserRepository;

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    public List<Driver> getAvailableDrivers() {
        return driverRepository.findByStatus(DriverStatus.AVAILABLE);
    }

    public Driver getDriverById(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + id));
    }

    public Driver createDriver(Driver driver) {
        if (driver.getUser() == null || driver.getUser().getId() == null) {
            throw new RuntimeException("User ID is required to create a driver");
        }
        
        SystemUser user = systemUserRepository.findById(driver.getUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + driver.getUser().getId()));
        
        driver.setUser(user);
        
        if (driver.getStatus() == null) {
            driver.setStatus(DriverStatus.AVAILABLE);
        }
        
        return driverRepository.save(driver);
    }

    public Driver updateDriver(Long id, Driver driverDetails) {
        Driver existingDriver = getDriverById(id);
        if (driverDetails.getLicenseNumber() != null) {
            existingDriver.setLicenseNumber(driverDetails.getLicenseNumber());
        }
        if (driverDetails.getStatus() != null) {
            existingDriver.setStatus(driverDetails.getStatus());
        }
        return driverRepository.save(existingDriver);
    }

    public void deleteDriver(Long id) {
        Driver driver = getDriverById(id);
        driverRepository.delete(driver);
    }
}