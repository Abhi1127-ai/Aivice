package com.aivice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class AiviceBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiviceBackendApplication.class, args);
    }
}
