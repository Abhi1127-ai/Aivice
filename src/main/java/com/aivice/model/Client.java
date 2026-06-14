package com.aivice.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "clients")
public class Client {

    @Id
    private String id;

    private String userId;

    private String companyName;
    private String contactName;
    private String email;
    private String phone;

    private String gstNumber;
    private String billingAddress;
    private String city;
    private String country;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    private String paymentTerms;
    private String currency;
    private String notes;
}