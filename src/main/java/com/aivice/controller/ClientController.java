package com.aivice.controller;

import com.aivice.dto.ClientRequestDTO;
import com.aivice.dto.ClientResponseDTO;
import com.aivice.service.ClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;

    @GetMapping
    public ResponseEntity<List<ClientResponseDTO>> getClient(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String search
    ) {
        String userId = userDetails.getUsername();

        List<ClientResponseDTO> clients = (search != null && !search.isBlank())
                ? clientService.searchClients(userId,search)
                : clientService.getAllClients(userId);

        return ResponseEntity.ok(clients);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClientResponseDTO> getClient(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {

        String userId = userDetails.getUsername();
        return ResponseEntity.ok(clientService.getClientById(id,userId));
    }

    @PostMapping
    public ResponseEntity<ClientResponseDTO> createClient(
            @Valid @RequestBody ClientRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails){

        String userId = userDetails.getUsername();
        ClientResponseDTO created = clientService.createClient(dto , userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClientResponseDTO> updateClient(
            @PathVariable String id,
            @Valid @RequestBody ClientRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        String userId = userDetails.getUsername();
        return ResponseEntity.ok(clientService.updateClient(id, dto, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails){

        String userId = userDetails.getUsername();
        clientService.deleteClient(id,userId);
        return ResponseEntity.noContent().build();
    }
}
