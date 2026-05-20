package com.aivice.service;

import com.aivice.dto.InvoiceRequestDTO;
import com.aivice.dto.InvoiceResponseDTO;
import com.aivice.exception.DuplicateResourceException;
import com.aivice.exception.ResourceNotFoundException;
import com.aivice.model.Invoice;
import com.aivice.repository.ClientRepository;
import com.aivice.repository.InvoiceRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ClientRepository clientRepository;

    public List<InvoiceResponseDTO> getInvoicesByClient(String userId, String clientId) {
        return invoiceRepository.findByUserIdAndClientId(userId,clientId)
                .stream()
                .map(inv -> toResponse(inv , resolveClientName(inv.getClientId())))
                .collect(Collectors.toList());
    }

    public List<InvoiceResponseDTO> getAllInvoices(String userId, String status) {
        List<Invoice> invoices = (status != null && !status.isBlank())
                ? invoiceRepository.findByUserIdAndStatus(userId, status.toUpperCase())
                : invoiceRepository.findByUserId(userId);

        return invoices.stream().map(inv -> toResponse(inv, resolveClientName(inv.getClientId())))
                .collect(Collectors.toList());
    }

    public InvoiceResponseDTO getInvoiceById(String id, String username) {
        Invoice invoice = findOwned(id,userId);
        return toResponse(invoice , resolveClientName(invoice.getClientId()));
    }

    public InvoiceResponseDTO createInvoice(@Valid InvoiceRequestDTO dto, String username) {
        clientRepository.findByIdAndUserId(dto.getClientId(),userId)
                .orElseThrow(() -> new ResourceNotFoundException("Client Not Found:" + dto.getClientId()));

        String invoiceNumber = (dto.getInvoiceNumber() != null && !dto.getInvoiceNumber().isBlank())
                ? dto.getInvoiceNumber()
                : generateInvoiceNumber(userId);

        if(invoiceRepository.existsByUserIdAndInvoiceNumber(userId,invoiceNumber)){
            throw new DuplicateResourceException("Invoice Number already exists: "+ invoiceNumber);
        }

        List<Invoice.LineItem> lineItems = buildLineItems(dto.getLineItems());
        BigDecimal subtotal = calculateSubtotal(lineItems);
        BigDecimal discountAmount = subtotal.multiply(dto.getDiscountPercent())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal afterDiscount = subtotal.subtract(discountAmount);
        BigDecimal taxAmount = afterDiscount.multiply(dto.getTaxPercent())
                .divide(BigDecimal.valueOf(100),2,RoundingMode.HALF_UP);
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

        return toResponse(invoiceRepository.save(invoice),resolveClientName(dto.getClientId());
    }

    public InvoiceResponseDTO updateInvoice(String id, @Valid InvoiceRequestDTO dto, String username) {
        return null;
    }

    public InvoiceService updateStatus(String id, String username, String newStatus) {
        return null;
    }

    public InvoiceResponseDTO duplicateInvoice(String id, String username) {
        return null;
    }

    public void deleteInvoice(String id, String username) {
    }
}
