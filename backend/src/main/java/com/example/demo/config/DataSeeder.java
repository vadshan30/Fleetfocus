package com.example.demo.config;

import com.example.demo.dto.RegisterRequestDto;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import com.example.demo.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private AuthService authService;

    @Autowired
    private SystemUserRepository systemUserRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private MaintenanceLogRepository maintenanceLogRepository;

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedVehicles();
        seedDrivers();
        seedTrips();
        seedMaintenanceLogs();
    }

    private void seedUsers() {
        if (systemUserRepository.count() == 0) {
            RegisterRequestDto admin = new RegisterRequestDto();
            admin.setUsername("admin");
            admin.setPassword("admin123");
            admin.setEmail("admin@fleetfocus.com");
            admin.setRole("FLEET_MANAGER");
            authService.register(admin);

            RegisterRequestDto dispatcher = new RegisterRequestDto();
            dispatcher.setUsername("dispatcher");
            dispatcher.setPassword("disp123");
            dispatcher.setEmail("dispatcher@fleetfocus.com");
            dispatcher.setRole("DISPATCHER");
            authService.register(dispatcher);

            RegisterRequestDto driver = new RegisterRequestDto();
            driver.setUsername("driver1");
            driver.setPassword("driver123");
            driver.setEmail("driver1@fleetfocus.com");
            driver.setRole("DRIVER");
            authService.register(driver);

            RegisterRequestDto tech = new RegisterRequestDto();
            tech.setUsername("tech1");
            tech.setPassword("tech123");
            tech.setEmail("tech1@fleetfocus.com");
            tech.setRole("MAINTENANCE_TECH");
            authService.register(tech);

            System.out.println("✅ Users seeded successfully!");
        }
    }

    private void seedVehicles() {
        if (vehicleRepository.count() == 0) {
            Vehicle v1 = new Vehicle("1HGCM82633A123456", "ABC-1234", "Volvo FH16", VehicleStatus.AVAILABLE);
            v1.setCurrentMileage(22000.0);
            vehicleRepository.save(v1);

            Vehicle v2 = new Vehicle("2HGCM82633A654321", "XYZ-5678", "Scania R500", VehicleStatus.AVAILABLE);
            v2.setCurrentMileage(0.0);
            vehicleRepository.save(v2);

            Vehicle v3 = new Vehicle("3HGCM82633A789012", "DEF-9012", "Mercedes Actros", VehicleStatus.AVAILABLE);
            v3.setCurrentMileage(0.0);
            vehicleRepository.save(v3);

            System.out.println("✅ 3 Vehicles seeded successfully!");
        }
    }

    private void seedDrivers() {
        if (driverRepository.count() == 0) {
            SystemUser driverUser = systemUserRepository.findByUsername("driver1").orElse(null);
            if (driverUser != null) {
                Driver driver = new Driver();
                driver.setUser(driverUser);
                driver.setLicenseNumber("DL-123456");
                driver.setStatus(DriverStatus.AVAILABLE);
                driverRepository.save(driver);
                System.out.println("✅ Driver seeded successfully!");
            }
        }
    }

    private void seedTrips() {
        if (tripRepository.count() == 0) {
            Vehicle vehicle = vehicleRepository.findByLicensePlate("ABC-1234").orElse(null);
            Driver driver = driverRepository.findAll().stream().findFirst().orElse(null);

            if (vehicle != null && driver != null) {
                Trip trip = new Trip();
                trip.setVehicle(vehicle);
                trip.setDriver(driver);
                trip.setStartTime(LocalDateTime.now().minusDays(1));
                trip.setStatus(TripStatus.COMPLETED);
                trip.setDistanceCovered(22.0);
                tripRepository.save(trip);
                System.out.println("✅ Trip seeded successfully!");
            }
        }
    }

    private void seedMaintenanceLogs() {
        if (maintenanceLogRepository.count() == 0) {
            Vehicle vehicle = vehicleRepository.findByLicensePlate("ABC-1234").orElse(null);
            SystemUser techUser = systemUserRepository.findByUsername("tech1").orElse(null);

            if (vehicle != null && techUser != null) {
                MaintenanceLog log = new MaintenanceLog();
                log.setVehicle(vehicle);
                log.setTechnician(techUser);
                log.setServiceDate(LocalDate.now().minusDays(2));
                log.setDescription("Regular maintenance - oil change and inspection");
                log.setCost(150.00);
                maintenanceLogRepository.save(log);
                System.out.println("✅ Maintenance log seeded successfully!");
            }
        }
    }
}