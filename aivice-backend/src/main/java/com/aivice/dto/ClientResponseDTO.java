package com.aivice.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;


import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ClientResponseDTO {

    private String id;
    private String companyName;
    private String contactName;
    private String email;
    private String phone;
    private String gstNumber;
    private String billingAddress;
    private String city;
    private String country;
    private String paymentTerms;
    private String currency;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
