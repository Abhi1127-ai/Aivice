package com.aivice.repository;

import com.aivice.model.Invoice;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface InvoiceRepository {

    Collection<Invoice> findByUserIdAndClientId(String userId, String clientId);

    List<Invoice> findByUserIdAndStatus(String userId, String upperCase);

    List<Invoice> findByUserId(String userId);

    long countByUserIdAndInvoiceNumberRegex(String userId, String pattern);

    List<Invoice> findOverdueInvoices(String userId, LocalDate now);

    boolean existsByUserIdAndInvoiceNumber(String userId, String invoiceNumber);

    java.util.Optional<Invoice> findByIdAndUserId(String id, String userId);

    List<Invoice> saveAll(List<Invoice> invoices);

    void delete(Invoice invoice);

    Invoice save(Invoice invoice);
}
