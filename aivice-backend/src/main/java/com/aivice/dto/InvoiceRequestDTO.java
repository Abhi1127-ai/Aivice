package com.aivice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class InvoiceRequestDTO {

    @NotNull(message = "Client id is required")
    private String clientId;
    private String invoiceNumber;

    @NotNull(message = "Issue date is required")
    private LocalDate issueDate;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    @NotEmpty(message = "Line items are required")
    @Valid
    private List<LineItemDTO> lineItems;

    @DecimalMin(value = "0.0") @DecimalMax(value = "100.0")
    private BigDecimal discountPercent = BigDecimal.ZERO;

    @DecimalMin(value = "0.0") @DecimalMax(value = "100.0")
    private BigDecimal taxPercent = BigDecimal.ZERO;

    private String currency = "INR";
    private String notes;
    private String terms;

    private boolean recurring = false;
    private String recurringCycle;

    @Data
    public static class LineItemDTO {
        @NotBlank(message = "Description is required")
        private String description;

        @Min(value = 1,message = "Quantity must be atleast 1")
        private int quantity;

        @NotNull @DecimalMin(value = "0.01",message = "Unit price must be atleast 0.01")
        private BigDecimal unitPrice;
    }
}
