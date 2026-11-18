package com.akyva;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * AKYVA - Connect Beyond Language
 * Global AI-Powered Messaging Platform
 */
@SpringBootApplication
@EnableJpaAuditing
public class AkyvaApplication {

    public static void main(String[] args) {
        SpringApplication.run(AkyvaApplication.class, args);
    }
}
