package com.aivice.repository;

import com.aivice.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends MongoRepository <Payment,String> {

    List<Payment> findByInvoiceId(String invoiceId);
    List<Payment> findByUserId(String userId);
    List<Payment> findByUserIdAndClientId(String userId , String clientId);
    List<Payment> findByUserIdAndStatus(String userId , String status);
    Optional<Payment> findByGatewayPaymentId(String gatewayPaymentId);

    @Query(value = "{ 'invoiceId': ?0, 'status': 'COMPLETED' }", fields = "{ 'amount': 1 }")
    List<Payment> findCompletedByInvoiceId(String invoiceId);
}
