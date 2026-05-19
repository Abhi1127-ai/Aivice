package com.aivice.service;

import com.aivice.dto.InvoiceRequestDTO;
import com.aivice.dto.InvoiceResponseDTO;
import com.aivice.repository.InvoiceRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;

    public List<InvoiceResponseDTO> getInvoicesByClient(String userId, String clientId) {
        return null;
    }

    public List<InvoiceResponseDTO> getAllInvoices(String userId, String status) {
        return null;
    }

    public InvoiceResponseDTO getInvoiceById(String id, String username) {
        return null;
    }

    public InvoiceResponseDTO createInvoice(@Valid InvoiceRequestDTO dto, String username) {
        return null;
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
