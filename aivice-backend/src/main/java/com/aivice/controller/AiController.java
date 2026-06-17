package com.aivice.controller;

import com.aivice.dto.AiDTO;
import com.aivice.service.AiInvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiInvoiceService aiInvoiceService;

    @PostMapping("/description")
    public ResponseEntity<AiDTO.DescriptionResponse> getDescription(
            @Valid @RequestBody AiDTO.DescriptionRequest request
    ){
        return ResponseEntity.ok(aiInvoiceService.generateDescription(request));
    }

    @PostMapping("/reminder")
    public ResponseEntity<AiDTO.ReminderResponse> generateReminder(
            @Valid @RequestBody AiDTO.ReminderRequest request
    ){
        return ResponseEntity.ok(aiInvoiceService.generateReminder(request));
    }

    @PostMapping("/missing-info")
    public ResponseEntity<AiDTO.MissingInfoResponse> detectMissingInfo(
            @Valid @RequestBody AiDTO.MissingInfoRequest request
    ){
        return ResponseEntity.ok(aiInvoiceService.detectMissingInfo(request));
    }
}
