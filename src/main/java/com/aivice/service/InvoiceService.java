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
import java.time.LocalDate;
import java.time.LocalDateTime;
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

    public InvoiceResponseDTO getInvoiceById(String id, String userId) {
        Invoice invoice = findOwned(id,userId);
        return toResponse(invoice , resolveClientName(invoice.getClientId()));
    }

    public InvoiceResponseDTO createInvoice(@Valid InvoiceRequestDTO dto, String userId) {
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

    public InvoiceResponseDTO updateInvoice(String id, @Valid InvoiceRequestDTO dto, String userId) {
        Invoice invoice = findOwner(id,userId);

        if(!invoice.getStatus().equals((InvoiceStatus.DRAFT.name())){
            throw new IllegalStateException("Cannot update invoice with status: "+invoice.getStatus());
        }

        List<Invoice.LineItem> lineItems = buildLineItems(dto.getLineItems());
        BigDecimal subtotal = calculateSubtotal(lineItems);
        BigDecimal discountAmount = subtotal.multiply(dto.getDiscountPercent())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal afterDiscount = subtotal.subtract(discountAmount);
        BigDecimal taxAmount = afterDiscount.multiply(dto.getTaxPercent())
                .divide(BigDecimal.valueOf(100),2,RoundingMode.HALF_UP);
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

        return toResponse(invoiceRepository.save(invoice) , resolveClientname(invoice.getClientId());
    }

    public InvoiceService updateStatus(String id, String userId, String newStatus) {
        Invoice invoice = findOwned(id,userId);
        InvoiceStatus status = InvoiceStatus.valueOf(newStatus.toUpperCase());

        invoice.setStatus(status.name());

        switch(status){
            case SENT -> invoice.setSentAt(LocalDateTime.now());
            case VIEWED -> invoice.setViewedAt(LocalDateTime.now());
            case PAID -> invoice.setPaidAt(LocalDateTime.now());

            default -> { /* no timestamp needed */}
        }
        return toResponse(invoiceRepository.save(invoice) , resolveClientName(invoice.getClientId()));
    }

    public InvoiceResponseDTO duplicateInvoice(String id, String userId) {
        Invoice original = findOwned(id,userId);

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
                .currency(original.getCurrency())
                .notes(original.getNotes())
                .terms(original.getTerms())
                .issueDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(30))
                .recurring(original.isRecurring())
                .recurringCycle(original.getRecurringCycle())
                .build();

        return toResponse(invoiceRepository.save(copy),resolveClientName(copy.getClientId()));
    }

    public void deleteInvoice(String id, String userId) {
        Invoice invoice = findOwned(id,userId);
        if(invoice.getStatus().equals(InvoiceStatus.PAID.name())){
            throw new IllegalStateException("Cannot delete invoice with status: "+invoice.getStatus());
        }
        invoiceRepository.delete(invoice);
    }

//    OverDue check scheduler ko call karne keliye

    public List<Invoice> marOverdueInvoices(String userId){
        List<Invoice> overdue = invoiceRepository.findOverdueInvoices(userId , LocalDate.now());
        overdue.forEach(inv -> inv.setStatus(InvoiceStatus.OVERDUE.name()));

        return invoiceRepository.saveAll(overdue);
    }

    private Invoice findOwned(String id, String userId) {
        return invoiceRepository.findByIdAndUserId(id,userId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: "+id));
    }


}
