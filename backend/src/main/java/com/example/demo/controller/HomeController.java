package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "🚀 FleetFocus API is running!<br><br>" +
               "📖 Swagger UI: <a href='/swagger-ui/index.html'>/swagger-ui/index.html</a><br>" +
               "🔑 Login: POST /api/auth/login";
    }
}