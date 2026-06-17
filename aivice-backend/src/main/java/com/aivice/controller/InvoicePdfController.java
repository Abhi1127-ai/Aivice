package com.aivice.controller;

import com.aivice.exception.ResourceNotFoundException;
import com.aivice.model.Client;
import com.aivice.model.Invoice;
import com.aivice.repository.ClientRepository;
import com.aivice.repository.InvoiceRepository;
import com.aivice.service.InvoicePdfService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/invoice-pdf")
@RequiredArgsConstructor
public class InvoicePdfController {

    private final InvoicePdfService invoicePdfService;
    private final InvoiceRepository invoiceRepository;
    private final ClientRepository clientRepository;

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails
    ){
        String userId = userDetails.getUsername();

        Invoice invoice = invoiceRepository.findByIdAndUserId(id,userId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));

        Client client = clientRepository.findById(invoice.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));

        byte[] pdfBytes = invoicePdfService.generateInvoicePdf(invoice , client);

        String filename = invoice.getInvoiceNumber().replace("/", "-") + ".pdf";

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(pdfBytes.length))
                .body(pdfBytes);
    }
}
