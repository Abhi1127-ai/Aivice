package com.aivice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "payments")
public class Payment {

    @Id
    private String id;

    private String invoiceId;
    private String userId;
    private String clientId;

    private BigDecimal amount;
    private String currency;

    private String paymentMethod;
    private String paymentGateway;

    private String gatewayPaymentId;
    private String gatewayOrderId;
    private String gatewaySignature;

    private String status;
    private String notes;

    private LocalDateTime paymentDate;

    @CreatedDate
    private LocalDateTime createdAt;
}
