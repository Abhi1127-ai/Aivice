package com.aivice.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;


@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "invoices")
public class Invoice {

    @Id
    private String id;

    private String userId;
    private String clientId;

    private String invoiceNumber;
    private String status;

    private List<LineItem> lineItems;

    private BigDecimal subtotal;
    private BigDecimal discountPercent;
    private BigDecimal discountAmount;
    private BigDecimal taxPercent;
    private BigDecimal totalAmount;
    private BigDecimal  taxAmount;

    private String currency;
    private String notes;
    private String terms;

    private LocalDate issueDate;
    private LocalDate dueDate;

    private boolean recurring;
    private String recurringCycle;

    private LocalDateTime sentAt;
    private LocalDateTime viewedAt;
    private LocalDateTime paidAt;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;



//    Embedding Line Item

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LineItem {
        private String description;
        private int quantity;
        private BigDecimal unitPrice;
        private BigDecimal amount;
    }
}

