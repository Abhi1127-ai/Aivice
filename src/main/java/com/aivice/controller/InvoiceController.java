package com.aivice.controller;

import com.aivice.dto.InvoiceRequestDTO;
import com.aivice.dto.InvoiceResponseDTO;
import com.aivice.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoice")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<List<InvoiceResponseDTO>> getInvoices(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String clientId)
    {
        String userId = userDetails.getUsername();

        List<InvoiceResponseDTO> result = (clientId != null && !clientId.isBlank())
                ? invoiceService.getInvoicesByClient(userId , clientId)
                : invoiceService.getAllInvoices(userId , status);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponseDTO> getInvoice(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails){
        return ResponseEntity.ok(invoiceService.getInvoiceById(id, userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<InvoiceResponseDTO> createInvoice(
            @Valid @RequestBody InvoiceRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails
    ){
        InvoiceResponseDTO created = invoiceService.createInvoice(dto, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InvoiceResponseDTO> updateInvoice(
            @PathVariable String id,
            @Valid @RequestBody InvoiceRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails
    ){
        return ResponseEntity.ok(invoiceService.updateInvoice(id , dto , userDetails.getUsername()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<InvoiceService> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails
    ){
        String newStatus = body.get("status");
        if(newStatus == null || newStatus.isBlank()){
            return ResponseEntity.badRequest().body(null);
        }
        return ResponseEntity.ok(invoiceService.updateStatus(id , userDetails.getUsername(), newStatus));
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<InvoiceResponseDTO> duplicateInvoice(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails
    ){
        InvoiceResponseDTO copy = invoiceService.duplicateInvoice(id , userDetails.getUsername());
    return ResponseEntity.status(HttpStatus.CREATED).body(copy);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails
    ){
        invoiceService.deleteInvoice(id,userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
