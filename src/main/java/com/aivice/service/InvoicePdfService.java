package com.aivice.service;

import com.aivice.model.Client;
import com.aivice.model.Invoice;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoicePdfService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");

    //  Colors
    private static final Color BRAND_COLOR    = new Color(79, 70, 229);   // Indigo
    private static final Color DARK_TEXT      = new Color(17, 24, 39);
    private static final Color MUTED_TEXT     = new Color(107, 114, 128);
    private static final Color TABLE_HEADER   = new Color(238, 242, 255);
    private static final Color TABLE_ALT_ROW  = new Color(249, 250, 251);
    private static final Color BORDER_COLOR   = new Color(229, 231, 235);
    private static final Color PAID_GREEN     = new Color(22, 163, 74);
    private static final Color OVERDUE_RED    = new Color(220, 38, 38);

    //  Fonts

    private final Font fontTitle      = new Font(Font.HELVETICA, 26, Font.BOLD, DARK_TEXT);
    private final Font fontBrand      = new Font(Font.HELVETICA, 18, Font.BOLD, BRAND_COLOR);
    private final Font fontHeading    = new Font(Font.HELVETICA, 11, Font.BOLD, DARK_TEXT);
    private final Font fontNormal     = new Font(Font.HELVETICA, 10, Font.NORMAL, DARK_TEXT);
    private final Font fontMuted      = new Font(Font.HELVETICA, 9,  Font.NORMAL, MUTED_TEXT);
    private final Font fontTableHead  = new Font(Font.HELVETICA, 10, Font.BOLD, DARK_TEXT);
    private final Font fontTableCell  = new Font(Font.HELVETICA, 10, Font.NORMAL, DARK_TEXT);
    private final Font fontTotal      = new Font(Font.HELVETICA, 11, Font.BOLD, BRAND_COLOR);
    private final Font fontStatusPaid = new Font(Font.HELVETICA, 10, Font.BOLD, PAID_GREEN);
    private final Font fontStatusOver = new Font(Font.HELVETICA, 10, Font.BOLD, OVERDUE_RED);
    private final Font fontWatermark  = new Font(Font.HELVETICA, 60, Font.BOLD, new Color(230, 230, 230));

    /**
     * Generates a PDF invoice and returns it as a byte array.
     */
    public byte[] generateInvoicePdf(Invoice invoice, Client client) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 40, 40, 40, 60);
            PdfWriter writer = PdfWriter.getInstance(document, baos);

            writer.setPageEvent(new FooterEvent(invoice.getInvoiceNumber()));

            document.open();
            if (!invoice.getStatus().equals("PAID")) {
                addWatermark(writer, invoice.getStatus());
            }

            addHeader(document, invoice);

            document.add(new Paragraph(" "));
            addBillingSection(document, client);

            document.add(new Paragraph(" "));
            addInvoiceMeta(document, invoice);

            document.add(new Paragraph(" "));
            addLineItemsTable(document, invoice);

            document.add(new Paragraph(" "));
            addTotals(document, invoice);
            if (invoice.getNotes() != null && !invoice.getNotes().isBlank()) {
                document.add(new Paragraph(" "));
                addNotesAndTerms(document, invoice);
            }

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("PDF generation failed for invoice {}: {}", invoice.getInvoiceNumber(), e.getMessage());
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage());
        }
    }

    //  HEADER

    private void addHeader(Document doc, Invoice invoice) throws DocumentException {
        PdfPTable header = new PdfPTable(2);
        header.setWidthPercentage(100);
        header.setWidths(new float[]{1f, 1f});

        PdfPCell brandCell = new PdfPCell(new Phrase("Aivice", fontBrand));
        brandCell.setBorder(Rectangle.NO_BORDER);
        brandCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        header.addCell(brandCell);

        Paragraph invoiceTitle = new Paragraph("INVOICE", fontTitle);
        invoiceTitle.setAlignment(Element.ALIGN_RIGHT);
        PdfPCell titleCell = new PdfPCell(invoiceTitle);
        titleCell.setBorder(Rectangle.NO_BORDER);
        titleCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        header.addCell(titleCell);

        doc.add(header);

        PdfPTable divider = new PdfPTable(1);
        divider.setWidthPercentage(100);
        divider.setSpacingBefore(8f);
        PdfPCell line = new PdfPCell(new Phrase(" "));
        line.setBackgroundColor(BRAND_COLOR);
        line.setFixedHeight(3f);
        line.setBorder(Rectangle.NO_BORDER);
        divider.addCell(line);
        doc.add(divider);
    }

    //  BILLING SECTION

    private void addBillingSection(Document doc, Client client) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1f, 1f});

        PdfPCell fromCell = new PdfPCell();
        fromCell.setBorder(Rectangle.NO_BORDER);
        fromCell.addElement(new Phrase("FROM", fontMuted));
        fromCell.addElement(new Phrase("Your Business Name", fontHeading));
        fromCell.addElement(new Phrase("your@email.com", fontNormal));
        fromCell.addElement(new Phrase("India", fontNormal));
        table.addCell(fromCell);

        PdfPCell toCell = new PdfPCell();
        toCell.setBorder(Rectangle.NO_BORDER);
        toCell.addElement(new Phrase("BILL TO", fontMuted));
        toCell.addElement(new Phrase(safe(client.getCompanyName()), fontHeading));
        if (client.getContactName() != null)
            toCell.addElement(new Phrase(client.getContactName(), fontNormal));
        toCell.addElement(new Phrase(safe(client.getEmail()), fontNormal));
        if (client.getBillingAddress() != null)
            toCell.addElement(new Phrase(client.getBillingAddress(), fontNormal));
        if (client.getGstNumber() != null)
            toCell.addElement(new Phrase("GST: " + client.getGstNumber(), fontMuted));
        table.addCell(toCell);

        doc.add(table);
    }

    //  INVOICE META

    private void addInvoiceMeta(Document doc, Invoice invoice) throws DocumentException {
        PdfPTable meta = new PdfPTable(4);
        meta.setWidthPercentage(100);
        meta.setWidths(new float[]{1f, 1f, 1f, 1f});
        meta.setSpacingBefore(4f);

        addMetaCell(meta, "Invoice No.", invoice.getInvoiceNumber());
        addMetaCell(meta, "Issue Date",
                invoice.getIssueDate() != null ? invoice.getIssueDate().format(DATE_FMT) : "-");
        addMetaCell(meta, "Due Date",
                invoice.getDueDate() != null ? invoice.getDueDate().format(DATE_FMT) : "-");

        PdfPCell statusLabel = metaLabelCell("Status");
        meta.addCell(statusLabel);

        Font statusFont = getStatusFont(invoice.getStatus());
        PdfPCell statusValue = new PdfPCell(new Phrase(invoice.getStatus(), statusFont));
        statusValue.setBorder(Rectangle.BOX);
        statusValue.setBorderColor(BORDER_COLOR);
        statusValue.setPadding(6f);
        statusValue.setBackgroundColor(TABLE_ALT_ROW);
        meta.addCell(statusValue);

        doc.add(meta);
    }

    //  LINE ITEMS TABLE

    private void addLineItemsTable(Document doc, Invoice invoice) throws DocumentException {
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{5f, 1.5f, 2f, 2f});
        table.setSpacingBefore(6f);

        String[] headers = {"Description", "Qty", "Unit Price", "Amount"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, fontTableHead));
            cell.setBackgroundColor(TABLE_HEADER);
            cell.setPadding(8f);
            cell.setBorderColor(BORDER_COLOR);
            cell.setHorizontalAlignment(h.equals("Description") ? Element.ALIGN_LEFT : Element.ALIGN_RIGHT);
            table.addCell(cell);
        }

        boolean alt = false;
        for (Invoice.LineItem item : invoice.getLineItems()) {
            Color rowBg = alt ? TABLE_ALT_ROW : Color.WHITE;

            addItemCell(table, item.getDescription(), Element.ALIGN_LEFT, rowBg);
            addItemCell(table, String.valueOf(item.getQuantity()), Element.ALIGN_RIGHT, rowBg);
            addItemCell(table, formatAmount(invoice.getCurrency(), item.getUnitPrice()), Element.ALIGN_RIGHT, rowBg);
            addItemCell(table, formatAmount(invoice.getCurrency(), item.getAmount()), Element.ALIGN_RIGHT, rowBg);

            alt = !alt;
        }

        doc.add(table);
    }

    //  TOTALS

    private void addTotals(Document doc, Invoice invoice) throws DocumentException {
        PdfPTable totals = new PdfPTable(2);
        totals.setWidthPercentage(45);
        totals.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totals.setWidths(new float[]{2f, 2f});

        addTotalRow(totals, "Subtotal",
                formatAmount(invoice.getCurrency(), invoice.getSubtotal()), false);

        if (invoice.getDiscountPercent() != null &&
                invoice.getDiscountPercent().compareTo(java.math.BigDecimal.ZERO) > 0) {
            addTotalRow(totals,
                    "Discount (" + invoice.getDiscountPercent() + "%)",
                    "- " + formatAmount(invoice.getCurrency(), invoice.getDiscountAmount()), false);
        }

        if (invoice.getTaxPercent() != null &&
                invoice.getTaxPercent().compareTo(java.math.BigDecimal.ZERO) > 0) {
            addTotalRow(totals,
                    "GST/Tax (" + invoice.getTaxPercent() + "%)",
                    formatAmount(invoice.getCurrency(), invoice.getTaxAmount()), false);
        }

        PdfPCell divL = new PdfPCell(new Phrase(" "));
        divL.setBackgroundColor(BRAND_COLOR);
        divL.setFixedHeight(2f);
        divL.setBorder(Rectangle.NO_BORDER);
        PdfPCell divR = new PdfPCell(new Phrase(" "));
        divR.setBackgroundColor(BRAND_COLOR);
        divR.setFixedHeight(2f);
        divR.setBorder(Rectangle.NO_BORDER);
        totals.addCell(divL);
        totals.addCell(divR);

        addTotalRow(totals, "TOTAL DUE",
                formatAmount(invoice.getCurrency(), invoice.getTotalAmount()), true);

        doc.add(totals);
    }

    //  NOTES & TERMS

    private void addNotesAndTerms(Document doc, Invoice invoice) throws DocumentException {
        if (invoice.getNotes() != null && !invoice.getNotes().isBlank()) {
            doc.add(new Phrase("Notes", fontHeading));
            doc.add(new Phrase("\n" + invoice.getNotes(), fontNormal));
            doc.add(new Paragraph(" "));
        }
        if (invoice.getTerms() != null && !invoice.getTerms().isBlank()) {
            doc.add(new Phrase("Terms & Conditions", fontHeading));
            doc.add(new Phrase("\n" + invoice.getTerms(), fontMuted));
        }
    }

    // WATERMARK

    private void addWatermark(PdfWriter writer, String status) {
        PdfContentByte canvas = writer.getDirectContentUnder();
        canvas.beginText();
        canvas.setFontAndSize(fontWatermark.getCalculatedBaseFont(false), 60);
        canvas.setColorFill(new Color(230, 230, 230));
        canvas.showTextAligned(Element.ALIGN_CENTER,
                status.equals("OVERDUE") ? "OVERDUE" : "UNPAID",
                297, 421, 45);
        canvas.endText();
    }

    // HELPERS

    private void addMetaCell(PdfPTable table, String label, String value) {
        table.addCell(metaLabelCell(label));
        PdfPCell valueCell = new PdfPCell(new Phrase(value, fontNormal));
        valueCell.setBorder(Rectangle.BOX);
        valueCell.setBorderColor(BORDER_COLOR);
        valueCell.setPadding(6f);
        valueCell.setBackgroundColor(TABLE_ALT_ROW);
        table.addCell(valueCell);
    }

    private PdfPCell metaLabelCell(String label) {
        PdfPCell cell = new PdfPCell(new Phrase(label, fontMuted));
        cell.setBorder(Rectangle.BOX);
        cell.setBorderColor(BORDER_COLOR);
        cell.setPadding(6f);
        return cell;
    }

    private void addItemCell(PdfPTable table, String text, int align, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text, fontTableCell));
        cell.setPadding(7f);
        cell.setHorizontalAlignment(align);
        cell.setBorderColor(BORDER_COLOR);
        cell.setBackgroundColor(bg);
        table.addCell(cell);
    }

    private void addTotalRow(PdfPTable table, String label, String value, boolean isTotal) {
        Font labelFont = isTotal ? fontTotal : fontNormal;
        Font valueFont = isTotal ? fontTotal : fontNormal;

        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPaddingTop(4f);
        labelCell.setPaddingBottom(4f);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        valueCell.setPaddingTop(4f);
        valueCell.setPaddingBottom(4f);
        table.addCell(valueCell);
    }

    private String formatAmount(String currency, java.math.BigDecimal amount) {
        if (amount == null) return "-";
        String symbol = "INR".equals(currency) ? "₹" : "$";
        return symbol + String.format("%,.2f", amount);
    }

    private Font getStatusFont(String status) {
        return switch (status) {
            case "PAID"     -> fontStatusPaid;
            case "OVERDUE"  -> fontStatusOver;
            default         -> fontNormal;
        };
    }

    private String safe(String val) {
        return val != null ? val : "";
    }

    //  PAGE FOOTER EVENT

    static class FooterEvent extends PdfPageEventHelper {
        private final String invoiceNumber;

        FooterEvent(String invoiceNumber) {
            this.invoiceNumber = invoiceNumber;
        }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte cb = writer.getDirectContent();
            Font footerFont = new Font(Font.HELVETICA, 8, Font.NORMAL, new Color(156, 163, 175));

            ColumnText.showTextAligned(cb, Element.ALIGN_LEFT,
                    new Phrase("Invoice: " + invoiceNumber, footerFont),
                    document.leftMargin(), 25, 0);

            ColumnText.showTextAligned(cb, Element.ALIGN_CENTER,
                    new Phrase("Generated by Aivice", footerFont),
                    (document.left() + document.right()) / 2, 25, 0);

            ColumnText.showTextAligned(cb, Element.ALIGN_RIGHT,
                    new Phrase("Page " + writer.getPageNumber(), footerFont),
                    document.rightMargin() + document.right() - document.left(), 25, 0);
        }
    }
}
