package com.aivice.repository;

import com.aivice.model.Invoice;

import java.util.Collection;
import java.util.List;

public interface InvoiceRepository {
    Collection<Object> findByUserIdAndClientId(String userId, String clientId);

    List<Invoice> findByUserIdAndStatus(String userId, String upperCase);

    List<Invoice> findByUserId(String userId);
}
