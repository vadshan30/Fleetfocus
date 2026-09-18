package com.example.demo.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("FleetFocus API")
                        .version("1.0.0")
                        .description("Enterprise Fleet Management System RESTful API. " +
                                "Provides comprehensive endpoints for real-time vehicle telematics, " +
                                "driver management, trip scheduling & dispatch, maintenance lifecycle logging, " +
                                "and role-based security control.")
                        .contact(new Contact()
                                .name("SRI VADSHAN J")
                                .email("vadsahan30@gmail.com")
                                .url("https://github.com/vadshan30/Fleetfocus"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development Server")
                ))
                .tags(List.of(
                        new Tag().name("Authentication").description("Endpoints for user login and registration"),
                        new Tag().name("Vehicle Management").description("Endpoints for managing fleet vehicles and status"),
                        new Tag().name("Driver Management").description("Endpoints for driver profiles and availability"),
                        new Tag().name("Trip Management").description("Endpoints for starting, scheduling, ending, and cancelling trips"),
                        new Tag().name("Maintenance").description("Endpoints for service logging and maintenance records"),
                        new Tag().name("Monitoring").description("Endpoints for real-time fleet telemetry and tracking"),
                        new Tag().name("User Management").description("Endpoints for technician listings and system users")
                ))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(
                                securitySchemeName,
                                new SecurityScheme()
                                        .name("Authorization")
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter your JWT bearer token in the format: Bearer <JWT-token>")
                        ));
    }
}