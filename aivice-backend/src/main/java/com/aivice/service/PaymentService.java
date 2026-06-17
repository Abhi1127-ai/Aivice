package com.aivice.service;

import com.aivice.dto.PaymentDTO;
import com.aivice.exception.ResourceNotFoundException;
import com.aivice.model.Invoice;
import com.aivice.model.InvoiceStatus;
import com.aivice.model.Payment;
import com.aivice.repository.InvoiceRepository;
import com.aivice.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Formatter;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    public PaymentDTO.PaymentResponse recordManualPayment(
            PaymentDTO.ManualPaymentRequest request, String userId) {

        Invoice invoice = findOwnedInvoice(request.getInvoiceId(), userId);

        BigDecimal totalPaid = getTotalPaid(request.getInvoiceId());
        BigDecimal newTotal = totalPaid.add(request.getAmount());

        if (newTotal.compareTo(invoice.getTotalAmount()) > 0) {
            throw new IllegalArgumentException(
                    "Payment amount exceeds remaining balance. Balance due: "
                            + invoice.getTotalAmount().subtract(totalPaid));
        }

        Payment payment = Payment.builder()
                .invoiceId(request.getInvoiceId())
                .userId(userId)
                .clientId(invoice.getClientId())
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .paymentMethod(request.getPaymentMethod())
                .paymentGateway("MANUAL")
                .status("COMPLETED")
                .notes(request.getNotes())
                .paymentDate(request.getPaymentDate() != null
                        ? request.getPaymentDate() : LocalDateTime.now())
                .build();

        Payment saved = paymentRepository.save(payment);

        updateInvoicePaymentStatus(invoice, newTotal);

        return toResponse(saved, invoice.getInvoiceNumber());
    }

    public PaymentDTO.RazorpayOrderResponse createRazorpayOrder(
            PaymentDTO.RazorpayOrderRequest request, String userId) {

        Invoice invoice = findOwnedInvoice(request.getInvoiceId(), userId);
        BigDecimal balanceDue = invoice.getTotalAmount().subtract(getTotalPaid(request.getInvoiceId()));

        if (balanceDue.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Invoice is already fully paid");
        }

        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", balanceDue.multiply(BigDecimal.valueOf(100)).intValue()); // paise
            orderRequest.put("currency", invoice.getCurrency() != null ? invoice.getCurrency() : "INR");
            orderRequest.put("receipt", invoice.getInvoiceNumber());

            Order order = razorpay.orders.create(orderRequest);

            return PaymentDTO.RazorpayOrderResponse.builder()
                    .orderId(order.get("id"))
                    .currency(order.get("currency"))
                    .amountInPaise(((Number) order.get("amount")).longValue())
                    .invoiceNumber(invoice.getInvoiceNumber())
                    .keyId(razorpayKeyId)
                    .build();

        } catch (Exception e) {
            log.error("Razorpay order creation failed: {}", e.getMessage());
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage());
        }
    }

    public PaymentDTO.PaymentResponse verifyRazorpayPayment(
            PaymentDTO.RazorpayVerifyRequest request, String userId) {

        Invoice invoice = findOwnedInvoice(request.getInvoiceId(), userId);

        if (!verifyRazorpaySignature(request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(), request.getRazorpaySignature())) {
            throw new SecurityException("Razorpay payment signature verification failed");
        }

        BigDecimal balanceDue = invoice.getTotalAmount().subtract(getTotalPaid(request.getInvoiceId()));

        Payment payment = Payment.builder()
                .invoiceId(request.getInvoiceId())
                .userId(userId)
                .clientId(invoice.getClientId())
                .amount(balanceDue)
                .currency(invoice.getCurrency())
                .paymentMethod("RAZORPAY")
                .paymentGateway("RAZORPAY")
                .gatewayPaymentId(request.getRazorpayPaymentId())
                .gatewayOrderId(request.getRazorpayOrderId())
                .gatewaySignature(request.getRazorpaySignature())
                .status("COMPLETED")
                .paymentDate(LocalDateTime.now())
                .build();

        Payment saved = paymentRepository.save(payment);

        BigDecimal newTotal = getTotalPaid(request.getInvoiceId());
        updateInvoicePaymentStatus(invoice, newTotal);

        return toResponse(saved, invoice.getInvoiceNumber());
    }

    public PaymentDTO.StripePaymentResponse createStripePaymentIntent(
            PaymentDTO.StripePaymentRequest request, String userId) {

        Invoice invoice = findOwnedInvoice(request.getInvoiceId(), userId);
        BigDecimal balanceDue = invoice.getTotalAmount().subtract(getTotalPaid(request.getInvoiceId()));

        if (balanceDue.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Invoice is already fully paid");
        }

        try {
            Stripe.apiKey = stripeSecretKey;

            String currency = invoice.getCurrency() != null
                    ? invoice.getCurrency().toLowerCase() : "inr";

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(balanceDue.multiply(BigDecimal.valueOf(100)).longValue()) // cents/paise
                    .setCurrency(currency)
                    .setDescription("Payment for invoice " + invoice.getInvoiceNumber())
                    .putMetadata("invoiceId", invoice.getId())
                    .putMetadata("invoiceNumber", invoice.getInvoiceNumber())
                    .putMetadata("userId", userId)
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);

            return PaymentDTO.StripePaymentResponse.builder()
                    .clientSecret(intent.getClientSecret())
                    .paymentIntentId(intent.getId())
                    .amountInCents(intent.getAmount())
                    .currency(intent.getCurrency())
                    .build();

        } catch (Exception e) {
            log.error("Stripe PaymentIntent creation failed: {}", e.getMessage());
            throw new RuntimeException("Failed to create Stripe payment: " + e.getMessage());
        }
    }

    public void handleStripeWebhook(String payload, String sigHeader,
                                    @Value("${stripe.webhook.secret}") String webhookSecret) {
        try {
            com.stripe.model.Event event =
                    com.stripe.net.Webhook.constructEvent(payload, sigHeader, webhookSecret);

            if ("payment_intent.succeeded".equals(event.getType())) {
                com.stripe.model.StripeObject stripeObject = event.getDataObjectDeserializer()
                        .getObject().orElseThrow();
                PaymentIntent intent = (PaymentIntent) stripeObject;

                String invoiceId = intent.getMetadata().get("invoiceId");
                String userId = intent.getMetadata().get("userId");

                if (invoiceId != null) {
                    Invoice invoice = invoiceRepository.findById(invoiceId).orElse(null);
                    if (invoice != null) {
                        Payment payment = Payment.builder()
                                .invoiceId(invoiceId)
                                .userId(userId)
                                .clientId(invoice.getClientId())
                                .amount(BigDecimal.valueOf(intent.getAmount())
                                        .divide(BigDecimal.valueOf(100)))
                                .currency(intent.getCurrency().toUpperCase())
                                .paymentMethod("STRIPE")
                                .paymentGateway("STRIPE")
                                .gatewayPaymentId(intent.getId())
                                .status("COMPLETED")
                                .paymentDate(LocalDateTime.now())
                                .build();

                        paymentRepository.save(payment);

                        BigDecimal totalPaid = getTotalPaid(invoiceId);
                        updateInvoicePaymentStatus(invoice, totalPaid);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Stripe webhook processing failed: {}", e.getMessage());
            throw new RuntimeException("Webhook processing failed");
        }
    }

    public List<PaymentDTO.PaymentResponse> getPaymentHistory(String userId) {
        return paymentRepository.findByUserId(userId).stream()
                .map(p -> {
                    String invoiceNumber = invoiceRepository.findById(p.getInvoiceId())
                            .map(Invoice::getInvoiceNumber).orElse("N/A");
                    return toResponse(p, invoiceNumber);
                })
                .collect(Collectors.toList());
    }

    public PaymentDTO.PaymentSummary getInvoicePaymentSummary(String invoiceId, String userId) {
        Invoice invoice = findOwnedInvoice(invoiceId, userId);

        List<Payment> payments = paymentRepository.findByInvoiceId(invoiceId);
        BigDecimal totalPaid = payments.stream()
                .filter(p -> "COMPLETED".equals(p.getStatus()))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal balanceDue = invoice.getTotalAmount().subtract(totalPaid);

        List<PaymentDTO.PaymentResponse> paymentResponses = payments.stream()
                .map(p -> toResponse(p, invoice.getInvoiceNumber()))
                .collect(Collectors.toList());

        return PaymentDTO.PaymentSummary.builder()
                .invoiceId(invoiceId)
                .invoiceNumber(invoice.getInvoiceNumber())
                .invoiceTotal(invoice.getTotalAmount())
                .totalPaid(totalPaid)
                .balenceDue(balanceDue.max(BigDecimal.ZERO))
                .fullyPaid(balanceDue.compareTo(BigDecimal.ZERO) <= 0)
                .payments(paymentResponses)
                .build();
    }

    private Invoice findOwnedInvoice(String invoiceId, String userId) {
        return invoiceRepository.findByIdAndUserId(invoiceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + invoiceId));
    }

    private BigDecimal getTotalPaid(String invoiceId) {
        return paymentRepository.findCompletedByInvoiceId(invoiceId).stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private void updateInvoicePaymentStatus(Invoice invoice, BigDecimal totalPaid) {
        if (totalPaid.compareTo(invoice.getTotalAmount()) >= 0) {
            invoice.setStatus(InvoiceStatus.PAID.name());
            invoice.setPaidAt(LocalDateTime.now());
            invoiceRepository.save(invoice);
            log.info("Invoice {} marked as PAID", invoice.getInvoiceNumber());
        }
    }

    private boolean verifyRazorpaySignature(String orderId, String paymentId, String signature) {
        try {
            String data = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(
                    razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            Formatter formatter = new Formatter();
            for (byte b : hash) formatter.format("%02x", b);
            String expectedSignature = formatter.toString();

            return expectedSignature.equals(signature);
        } catch (Exception e) {
            log.error("Signature verification error: {}", e.getMessage());
            return false;
        }
    }

    private PaymentDTO.PaymentResponse toResponse(Payment p, String invoiceNumber) {
        return PaymentDTO.PaymentResponse.builder()
                .id(p.getId())
                .invoiceId(p.getInvoiceId())
                .invoiceNumber(invoiceNumber)
                .amount(p.getAmount())
                .currency(p.getCurrency())
                .paymentMethod(p.getPaymentMethod())
                .paymentGateway(p.getPaymentGateway())
                .status(p.getStatus())
                .notes(p.getNotes())
                .paymentDate(p.getPaymentDate())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
