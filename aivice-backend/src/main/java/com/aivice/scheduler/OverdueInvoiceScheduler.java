package com.aivice.scheduler;

import com.aivice.model.Invoice;
import com.aivice.model.InvoiceStatus;
import com.aivice.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class OverdueInvoiceScheduler {

    private final InvoiceRepository invoiceRepository;

    @Scheduled(cron = "0 0 0 * * *")
    public void markOverdueInvoices() {
        List<Invoice> overdueInvoices = invoiceRepository
                .findAll()
                .stream()
                .filter(inv ->
                        (inv.getStatus().equals(InvoiceStatus.SENT.name()) ||
                                inv.getStatus().equals(InvoiceStatus.VIEWED.name())) &&
                                inv.getDueDate() != null &&
                                inv.getDueDate().isBefore(LocalDate.now()))
                .toList();

        if (!overdueInvoices.isEmpty()) {
            overdueInvoices.forEach(inv -> inv.setStatus(InvoiceStatus.OVERDUE.name()));
            invoiceRepository.saveAll(overdueInvoices);
            log.info("Marked {} invoices as OVERDUE", overdueInvoices.size());
        }
    }
}
