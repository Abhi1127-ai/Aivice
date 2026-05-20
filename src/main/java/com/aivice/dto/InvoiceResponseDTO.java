package com.aivice.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class InvoiceResponseDTO {
    private String id;
    private String clientId;
    private String clientName;
    private String invoiceNumber;
    private String status;

    private List<LineItemDTO> lineItems;

    private BigDecimal subtotal;
    private BigDecimal discountPercent;
    private BigDecimal discountAmount;
    private BigDecimal taxPercent;
    private BigDecimal taxAmount;
    private String totalAmount;

    private String currency;
    private String notes;
    private String terms;

    private LocalDate issuedDate;
    private LocalDate dueDate;

    private boolean recurring;
    private String recurringCycle;

    private LocalDateTime sentAt;
    private LocalDateTime viewedAt;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    public static class LineItemDTO {
        private String description;
        private int quantity;
        private BigDecimal unitPrice;
        private BigDecimal amount;
    }
}
