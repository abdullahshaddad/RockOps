package com.example.backend.config;


import io.minio.MinioClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinioConfig {

    @Bean
    public MinioClient minioClient() {
        MinioClient minioClient =MinioClient.builder()
                .endpoint("http://localhost:9000") // Change if MinIO is hosted elsewhere
                .credentials("minioadmin", "minioadmin") // Change credentials if needed
                .build();
        return minioClient;
    }
}

