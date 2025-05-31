package com.example.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Configuration class to ensure proper transaction management and event handling
 */
@Configuration
@EnableTransactionManagement
@EnableAspectJAutoProxy
public class StartupConfiguration {
    // Empty class - annotations provide the configuration
    // Spring Boot auto-configuration handles most of the setup
}