package com.aivice.service;

import com.aivice.dto.AiDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiInvoiceService {

    private final GrokClient grokClient;

//    helsp in generating description

    public AiDTO.DescriptionResponse generateDescription(AiDTO.DescriptionRequest request) {
        String tone = request.getTone() != null ? request.getTone() : "professional";
        String industry = request.getIndustry() != null ? request.getIndustry() : "technology";

        String prompt = """
                You are a professional invoice copywriter for a %s business.

                Rewrite the following service description to be more detailed, %s, and suitable for a client-facing invoice.
                Make it clear, concise (2-3 sentences max), and highlight the value delivered.

                Original description: "%s"

                Return ONLY the improved description. No explanations, no extra text, no quotes.
                """.formatted(industry, tone, request.getRawInput());

        String improved = grokClient.generate(prompt).trim();

        AiDTO.DescriptionResponse response = new AiDTO.DescriptionResponse();
        response.setOriginal(request.getRawInput());
        response.setImproved(improved);
        return response;
    }

//    payment se related messgae generate karega

    public AiDTO.ReminderResponse generateReminder(AiDTO.ReminderRequest request) {
        String prompt = """
                You are writing a polite but firm payment reminder email on behalf of a freelancer/business.

                Details:
                - Client Name: %s
                - Invoice Number: %s
                - Amount Due: %s
                - Due Date: %s
                - Sender Name: %s

                Write a professional payment reminder email.

                Respond in this EXACT format:
                SUBJECT: <email subject here>
                BODY:
                <full email body here>

                Keep the tone polite but firm. Do not add any extra commentary.
                """.formatted(
                request.getClientName(),
                request.getInvoiceNumber(),
                request.getAmount() != null ? request.getAmount() : "as per invoice",
                request.getDueDate() != null ? request.getDueDate() : "as mentioned in the invoice",
                request.getSenderName() != null ? request.getSenderName() : "The Aivice Team"
        );

        String raw = grokClient.generate(prompt).trim();

        String subject = "";
        String body = "";

        if (raw.contains("SUBJECT:") && raw.contains("BODY:")) {
            String[] parts = raw.split("BODY:", 2);
            subject = parts[0].replace("SUBJECT:", "").trim();
            body = parts[1].trim();
        } else {
            subject = "Payment Reminder - " + request.getInvoiceNumber();
            body = raw;
        }

        AiDTO.ReminderResponse response = new AiDTO.ReminderResponse();
        response.setSubject(subject);
        response.setEmailBody(body);
        return response;
    }

//    missing information detect karne me help karega

    public AiDTO.MissingInfoResponse detectMissingInfo(AiDTO.MissingInfoRequest request) {
        String prompt = """
                You are an invoice quality checker. Review the following invoice details and identify any missing or incomplete information that a professional invoice should have.

                Invoice Details:
                - Client Name: %s
                - Invoice Number: %s
                - Due Date: %s
                - Line Items: %s
                - Notes/Terms: %s

                Check for: missing due date, vague line item descriptions, missing client name, no payment terms, zero or missing amounts, missing invoice number.

                Respond in this EXACT format:
                HAS_ISSUES: true or false
                SUGGESTIONS:
                - <suggestion 1>
                - <suggestion 2>
                (list only actual issues found, max 5. If no issues, write SUGGESTIONS: none)
                """.formatted(
                nullSafe(request.getClientName()),
                nullSafe(request.getInvoiceNumber()),
                nullSafe(request.getDueDate()),
                nullSafe(request.getLineItems()),
                nullSafe(request.getNotes())
        );

        String raw = grokClient.generate(prompt).trim();

        boolean hasIssues = raw.contains("HAS_ISSUES: true");
        List<String> suggestions = new ArrayList<>();

        if (hasIssues && raw.contains("SUGGESTIONS:")) {
            String suggestionsBlock = raw.split("SUGGESTIONS:", 2)[1].trim();
            if (!suggestionsBlock.equalsIgnoreCase("none")) {
                Arrays.stream(suggestionsBlock.split("\n"))
                        .map(s -> s.replaceFirst("^-\\s*", "").trim())
                        .filter(s -> !s.isBlank())
                        .forEach(suggestions::add);
            }
        }

        AiDTO.MissingInfoResponse response = new AiDTO.MissingInfoResponse();
        response.setHasMissingInfo(hasIssues);
        response.setSuggestions(suggestions);
        return response;
    }

//    helper

    private String nullSafe(String value) {
        return value != null && !value.isBlank() ? value : "Not provided";
    }
}
