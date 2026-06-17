package com.aivice.controller;

import com.aivice.dto.PaymentDTO;
import com.aivice.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/manual")
    public ResponseEntity<PaymentDTO.PaymentResponse> recordManualPayment(
            @Valid @RequestBody PaymentDTO.ManualPaymentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.recordManualPayment(request, userDetails.getUsername()));
    }

    @PostMapping("/razorpay/create-order")
    public ResponseEntity<PaymentDTO.RazorpayOrderResponse> createRazorpayOrder(
            @Valid @RequestBody PaymentDTO.RazorpayOrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                paymentService.createRazorpayOrder(request, userDetails.getUsername()));
    }

    @PostMapping("/razorpay/verify")
    public ResponseEntity<PaymentDTO.PaymentResponse> verifyRazorpayPayment(
            @Valid @RequestBody PaymentDTO.RazorpayVerifyRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                paymentService.verifyRazorpayPayment(request, userDetails.getUsername()));
    }

    @PostMapping("/stripe/create-intent")
    public ResponseEntity<PaymentDTO.StripePaymentResponse> createStripeIntent(
            @Valid @RequestBody PaymentDTO.StripePaymentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                paymentService.createStripePaymentIntent(request, userDetails.getUsername()));
    }

    @PostMapping("/stripe/webhook")
    public ResponseEntity<Void> stripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        paymentService.handleStripeWebhook(payload, sigHeader, null);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/history")
    public ResponseEntity<List<PaymentDTO.PaymentResponse>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                paymentService.getPaymentHistory(userDetails.getUsername()));
    }

    @GetMapping("/invoice/{invoiceId}/summary")
    public ResponseEntity<PaymentDTO.PaymentSummary> getInvoiceSummary(
            @PathVariable String invoiceId,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                paymentService.getInvoicePaymentSummary(invoiceId, userDetails.getUsername()));
    }
}
