package com.aivice.dto;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
