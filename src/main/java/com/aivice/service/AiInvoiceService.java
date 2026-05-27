package com.aivice.service;

import com.aivice.dto.AiDTO;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;

@Service
public class AiInvoiceService {

    public AiDTO.DescriptionResponse generateDescription(AiDTO.@Valid DescriptionRequest request) {
    }

    public AiDTO.DescriptionResponse generateReminder(AiDTO.@Valid ReminderRequest request) {
    }

    public AiDTO.DescriptionResponse detectMissingInfo(AiDTO.@Valid MissingInfoRequest request) {
    }
}
