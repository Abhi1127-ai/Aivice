package com.aivice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiDTO {

    @Data
    public static class DescriptionRequest{

        @NotBlank(message = "Raw input is required")
        private String rawInput;

        private String tone;
        private String industry;
    }

    @Data
    public static class DescriptionResponse{
        private String original;
        private String improved;
    }

    @Data
    public static class ReminderRequest{

        @NotBlank(message = "Client name is required")
        private String clientName;

        @NotBlank(message = "Invoice number is required")
        private String invoiceNumber;

        private String amount;
        private String dueDate;
        private String senderName;
    }

    @Data
    public static class ReminderResponse{
        private String subject;
        private String emailBody;
    }

    @Data
    public static class MissingInfoRequest{

        private String clientName;
        private String invoiceNumber;
        private String dueDate;
        private String lineItems;
        private String notes;
    }

    @Data
    public static class MissingInfoResponse{
        private boolean hasMissingInfo;
        private java.util.List<String> suggestions;
    }
}
