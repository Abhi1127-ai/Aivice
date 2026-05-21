package com.aivice.service;

import com.aivice.dto.InvoiceRequestDTO;
import com.aivice.dto.InvoiceResponseDTO;
import com.aivice.exception.DuplicateResourceException;
import com.aivice.exception.ResourceNotFoundException;
import com.aivice.model.Client;
import com.aivice.model.Invoice;
import com.aivice.model.InvoiceStatus;
import com.aivice.repository.ClientRepository;
import com.aivice.repository.InvoiceRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ClientRepository clientRepository;

    public List<InvoiceResponseDTO> getAllInvoices(String userId, String status) {
        List<Invoice> invoices = (status != null && !status.isBlank())
                ? invoiceRepository.findByUserIdAndStatus(userId, status.toUpperCase())
                : invoiceRepository.findByUserId(userId);

        return invoices.stream().map(inv -> toResponse(inv, resolveClientName(inv.getClientId())))
                .collect(Collectors.toList());
    }

    public InvoiceResponseDTO getInvoiceById(String id, String userId) {
        Invoice invoice = findOwned(id, userId);
        return toResponse(invoice, resolveClientName(invoice.getClientId()));
    }

    public List<InvoiceResponseDTO> getInvoicesByClient(String userId, String clientId) {
        return invoiceRepository.findByUserIdAndClientId(userId, clientId)
                .stream()
                .map(inv -> toResponse(inv, resolveClientName(inv.getClientId())))
                .collect(Collectors.toList());
    }
    public InvoiceResponseDTO createInvoice(InvoiceRequestDTO dto, String userId) {
        clientRepository.findByIdAndUserId(dto.getClientId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found: " + dto.getClientId()));

        String invoiceNumber = (dto.getInvoiceNumber() != null && !dto.getInvoiceNumber().isBlank())
                ? dto.getInvoiceNumber()
                : generateInvoiceNumber(userId);

        if (invoiceRepository.existsByUserIdAndInvoiceNumber(userId, invoiceNumber)) {
            throw new DuplicateResourceException("Invoice number already exists: " + invoiceNumber);
        }

        List<Invoice.LineItem> lineItems = buildLineItems(dto.getLineItems());
        BigDecimal subtotal = calculateSubtotal(lineItems);
        BigDecimal discountAmount = subtotal.multiply(dto.getDiscountPercent())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal afterDiscount = subtotal.subtract(discountAmount);
        BigDecimal taxAmount = afterDiscount.multiply(dto.getTaxPercent())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = afterDiscount.add(taxAmount);

        Invoice invoice = Invoice.builder()
                .userId(userId)
                .clientId(dto.getClientId())
                .invoiceNumber(invoiceNumber)
                .status(InvoiceStatus.DRAFT.name())
                .lineItems(lineItems)
                .subtotal(subtotal)
                .discountPercent(dto.getDiscountPercent())
                .discountAmount(discountAmount)
                .taxPercent(dto.getTaxPercent())
                .taxAmount(taxAmount)
                .totalAmount(totalAmount)
                .currency(dto.getCurrency())
                .notes(dto.getNotes())
                .terms(dto.getTerms())
                .issueDate(dto.getIssueDate())
                .dueDate(dto.getDueDate())
                .recurring(dto.isRecurring())
                .recurringCycle(dto.getRecurringCycle())
                .build();

        return toResponse(invoiceRepository.save(invoice), resolveClientName(dto.getClientId()));
    }

    public InvoiceResponseDTO updateInvoice(String id, InvoiceRequestDTO dto, String userId) {
        Invoice invoice = findOwned(id, userId);

        if (!invoice.getStatus().equals(InvoiceStatus.DRAFT.name())) {
            throw new IllegalStateException("Only DRAFT invoices can be edited. Current status: " + invoice.getStatus());
        }

        List<Invoice.LineItem> lineItems = buildLineItems(dto.getLineItems());
        BigDecimal subtotal = calculateSubtotal(lineItems);
        BigDecimal discountAmount = subtotal.multiply(dto.getDiscountPercent())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal afterDiscount = subtotal.subtract(discountAmount);
        BigDecimal taxAmount = afterDiscount.multiply(dto.getTaxPercent())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = afterDiscount.add(taxAmount);

        invoice.setClientId(dto.getClientId());
        invoice.setLineItems(lineItems);
        invoice.setSubtotal(subtotal);
        invoice.setDiscountPercent(dto.getDiscountPercent());
        invoice.setDiscountAmount(discountAmount);
        invoice.setTaxPercent(dto.getTaxPercent());
        invoice.setTaxAmount(taxAmount);
        invoice.setTotalAmount(totalAmount);
        invoice.setCurrency(dto.getCurrency());
        invoice.setNotes(dto.getNotes());
        invoice.setTerms(dto.getTerms());
        invoice.setIssuedDate(dto.getIssueDate());
        invoice.setDueDate(dto.getDueDate());
        invoice.setRecurring(dto.isRecurring());
        invoice.setRecurringCycle(dto.getRecurringCycle());

        return toResponse(invoiceRepository.save(invoice), resolveClientName(invoice.getClientId()));
    }

    public InvoiceResponseDTO updateStatus(String id, String userId, String newStatus) {
        Invoice invoice = findOwned(id, userId);
        InvoiceStatus status = InvoiceStatus.valueOf(newStatus.toUpperCase());

        invoice.setStatus(status.name());

        // Set timestamps on key transitions
        switch (status) {
            case SENT -> invoice.setSentAt(LocalDateTime.now());
            case VIEWED -> invoice.setViewedAt(LocalDateTime.now());
            case PAID -> invoice.setPaidAt(LocalDateTime.now());
            default -> { /* no timestamp needed */ }
        }

        return toResponse(invoiceRepository.save(invoice), resolveClientName(invoice.getClientId()));
    }
    public InvoiceResponseDTO duplicateInvoice(String id, String userId) {
        Invoice original = findOwned(id, userId);

        Invoice copy = Invoice.builder()
                .userId(userId)
                .clientId(original.getClientId())
                .invoiceNumber(generateInvoiceNumber(userId))
                .status(InvoiceStatus.DRAFT.name())
                .lineItems(original.getLineItems())
                .subtotal(original.getSubtotal())
                .discountPercent(original.getDiscountPercent())
                .discountAmount(original.getDiscountAmount())
                .taxPercent(original.getTaxPercent())
                .taxAmount(original.getTaxAmount())
                .totalAmount(original.getTotalAmount())
                .currency(original.getCurrency())
                .notes(original.getNotes())
                .terms(original.getTerms())
                .issueDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(30))
                .recurring(original.isRecurring())
                .recurringCycle(original.getRecurringCycle())
                .build();

        return toResponse(invoiceRepository.save(copy), resolveClientName(copy.getClientId()));
    }

    public void deleteInvoice(String id, String userId) {
        Invoice invoice = findOwned(id, userId);
        if (invoice.getStatus().equals(InvoiceStatus.PAID.name())) {
            throw new IllegalStateException("Paid invoices cannot be deleted");
        }
        invoiceRepository.delete(invoice);
    }

//    OVERDUE CHECK (called by scheduler)

    public List<Invoice> markOverdueInvoices(String userId) {
        List<Invoice> overdue = invoiceRepository.findOverdueInvoices(userId, LocalDate.now());
        overdue.forEach(inv -> inv.setStatus(InvoiceStatus.OVERDUE.name()));
        return invoiceRepository.saveAll(overdue);
    }

    private Invoice findOwned(String id, String userId) {
        return invoiceRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
    }

    private String generateInvoiceNumber(String userId) {
        int year = Year.now().getValue();
        String pattern = "INV-" + year + "-";
        long count = invoiceRepository.countByUserIdAndInvoiceNumberRegex(userId, pattern);
        return String.format("INV-%d-%03d", year, count + 1);
    }

    private List<Invoice.LineItem> buildLineItems(List<InvoiceRequestDTO.LineItemDTO> dtos) {
        return dtos.stream().map(dto -> {
            BigDecimal amount = dto.getUnitPrice()
                    .multiply(BigDecimal.valueOf(dto.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);
            return Invoice.LineItem.builder()
                    .description(dto.getDescription())
                    .quantity(dto.getQuantity())
                    .unitPrice(dto.getUnitPrice())
                    .amount(amount)
                    .build();
        }).collect(Collectors.toList());
    }

    private BigDecimal calculateSubtotal(List<Invoice.LineItem> items) {
        return items.stream()
                .map(Invoice.LineItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String resolveClientName(String clientId) {
        return clientRepository.findById(clientId)
                .map(Client::getCompanyName)
                .orElse("Unknown Client");
    }

//   Mapper

    private InvoiceResponseDTO toResponse(Invoice inv, String clientName) {
        List<InvoiceResponseDTO.LineItemDTO> lineItems = inv.getLineItems().stream()
                .map(li -> InvoiceResponseDTO.LineItemDTO.builder()
                        .description(li.getDescription())
                        .quantity(li.getQuantity())
                        .unitPrice(li.getUnitPrice())
                        .amount(li.getAmount())
                        .build())
                .collect(Collectors.toList());

        return InvoiceResponseDTO.builder()
                .id(inv.getId())
                .clientId(inv.getClientId())
                .clientName(clientName)
                .invoiceNumber(inv.getInvoiceNumber())
                .status(inv.getStatus())
                .lineItems(lineItems)
                .subtotal(inv.getSubtotal())
                .discountPercent(inv.getDiscountPercent())
                .discountAmount(inv.getDiscountAmount())
                .taxPercent(inv.getTaxPercent())
                .taxAmount(inv.getTaxAmount())
                .totalAmount(inv.getTotalAmount())
                .currency(inv.getCurrency())
                .notes(inv.getNotes())
                .terms(inv.getTerms())
                .issuedDate(inv.getIssuedDate())
                .dueDate(inv.getDueDate())
                .recurring(inv.isRecurring())
                .recurringCycle(inv.getRecurringCycle())
                .sentAt(inv.getSentAt())
                .viewedAt(inv.getViewedAt())
                .paidAt(inv.getPaidAt())
                .createdAt(inv.getCreatedAt())
                .updatedAt(inv.getUpdatedAt())
                .build();

    }
}

