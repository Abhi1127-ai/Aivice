package com.aivice.repository;

import com.aivice.model.Invoice;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends MongoRepository<Invoice, String> {

    List<Invoice> findByUserId(String userId);

    Optional<Invoice> findByIdAndUserId(String id, String userId);

    List<Invoice> findByUserIdAndStatus(String userId, String status);

    List<Invoice> findByUserIdAndClientId(String userId, String clientId);

    @Query("{ 'userId': ?0, 'status': { $in: ['SENT', 'VIEWED'] }, 'dueDate': { $lt: ?1 } }")
    List<Invoice> findOverdueInvoices(String userId, LocalDate today);

    @Query(value = "{ 'userId': ?0, 'invoiceNumber': { $regex: ?1 } }", count = true)
    long countByUserIdAndInvoiceNumberRegex(String userId, String yearPattern);

    boolean existsByUserIdAndInvoiceNumber(String userId, String invoiceNumber);

    @Query("{ 'userId': ?0, 'status': 'PAID' }")
    List<Invoice> findPaidInvoicesByUserId(String userId);
}
