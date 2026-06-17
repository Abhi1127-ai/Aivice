package com.aivice.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentDTO {

    @Data
    public static class ManualPaymentRequest{

        @NotBlank(message = "invoice id is required")
        private String invoiceId;

        @NotNull @DecimalMin(value = "0.01",message = "amount must be greater than 0")
        private BigDecimal amount;

        private String currency = "INR";

        @NotBlank(message = "payment method is required")
        private String paymentMethod;

        private String notes;
        private LocalDateTime paymentDate;
    }

    // Razor Pay Order request

    @Data
    public static class RazorpayOrderRequest{
        @NotBlank(message = "invoice ID is required")
        private String invoiceId;
    }

    // Razor pay Order Response

    @Data
    @Builder
    public static class RazorpayOrderResponse{

        private String orderId;
        private String currency;
        private long amountInPaise;
        private String invoiceNumber;
        private String keyId;
    }

    // razorpay Payemnt verification

    @Data
    public static class RazorpayVerifyRequest{
        @NotBlank
        private String razorpayOrderId;
        @NotBlank
        private String razorpayPaymentId;
        @NotBlank
        private String razorpaySignature;
        @NotBlank
        private String invoiceId;
    }

    @Data
    public static class StripePaymentRequest{
        @NotBlank(message = "Invoice Id is required")
        private String invoiceId;
    }

//    Stripe Payment Intent Response

    @Data
    @Builder
    public static class StripePaymentResponse{
        private String clientSecret;
        private String paymentIntentId;
        private long amountInCents;
        private String currency;
    }

//    Payment Resonse (for history)

    @Data
    @Builder
    public static class PaymentResponse {
        private String id;
        private String invoiceId;
        private String invoiceNumber;
        private BigDecimal amount;
        private String currency;
        private String paymentMethod;
        private String paymentGateway;
        private String status;
        private String notes;
        private LocalDateTime paymentDate;
        private LocalDateTime createdAt;
    }

//    invoice payment summary

    @Data
    @Builder
    public static class PaymentSummary{
        private String invoiceId;
        private String invoiceNumber;
        private BigDecimal invoiceTotal;
        private BigDecimal totalPaid;
        private BigDecimal balenceDue;
        private boolean fullyPaid;
        private java.util.List<PaymentResponse> payments;
    }
}

