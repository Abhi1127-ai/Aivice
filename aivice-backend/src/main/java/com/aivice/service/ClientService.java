package com.aivice.service;

import com.aivice.dto.ClientRequestDTO;
import com.aivice.dto.ClientResponseDTO;
import com.aivice.exception.DuplicateResourceException;
import com.aivice.exception.ResourceNotFoundException;
import com.aivice.model.Client;
import com.aivice.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
//   GET ALL clients
     public List<ClientResponseDTO> getAllClients(String userId) {
         return clientRepository.findByUserId(userId)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
     }

    // single client

    public ClientResponseDTO getClientById(String id, String userId) {
        Client client = clientRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));
        return toResponse(client);
    }

    public List<ClientResponseDTO> searchClients(String userId, String Keyword) {
        return clientRepository.searchByUserIdAndKeyword(userId , Keyword)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ClientResponseDTO createClient(ClientRequestDTO dto, String userId) {
        if (clientRepository.existsByUserIdAndEmail(userId, dto.getEmail())) {
            throw new DuplicateResourceException("Client already exists with email: ");
        }

        Client client = Client.builder()
                .userId(userId)
                .companyName(dto.getCompanyName())
                .contactName(dto.getContactName())
                .email(dto.getEmail())
                .gstNumber(dto.getGstNumber())
                .billingAddress(dto.getBillingAddress())
                .city(dto.getCity())
                .country(dto.getCountry())
                .paymentTerms(dto.getPaymentTerms())
                .currency(dto.getCurrency())
                .notes(dto.getNotes())
                .build();
        return toResponse(clientRepository.save(client));
    }

    public ClientResponseDTO updateClient(String id, ClientRequestDTO dto, String userId) {
        Client client = clientRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id : "+ id));

        if (clientRepository.existsByUserIdAndEmailAndIdNot(userId, dto.getEmail(), id)) {
            throw new DuplicateResourceException("Another client already uses this email");
        }
        client.setCompanyName(dto.getCompanyName());
        client.setContactName(dto.getContactName());
        client.setEmail(dto.getEmail());
        client.setPhone(dto.getPhone());
        client.setGstNumber(dto.getGstNumber());
        client.setBillingAddress(dto.getBillingAddress());
        client.setCity(dto.getCity());
        client.setCountry(dto.getCountry());
        client.setPaymentTerms(dto.getPaymentTerms());
        client.setCurrency(dto.getCurrency());
        client.setNotes(dto.getNotes());

        return toResponse(clientRepository.save(client));
    }

    public void deleteClient(String id, String userId) {
    Client client = clientRepository.findByIdAndUserId(id,userId)
            .orElseThrow(() -> new ResourceNotFoundException("Client not found  with id: "+id));
    clientRepository.delete(client);
    }

    private ClientResponseDTO toResponse(Client client) {
    return ClientResponseDTO.builder()
            .id(client.getId())
            .companyName(client.getCompanyName())
            .contactName(client.getContactName())
            .email(client.getEmail())
            .phone(client.getPhone())
            .gstNumber(client.getGstNumber())
            .billingAddress(client.getBillingAddress())
            .city(client.getCity())
            .country(client.getCountry())
            .paymentTerms(client.getPaymentTerms())
            .currency(client.getCurrency())
            .notes(client.getNotes())
            .createdAt(client.getCreatedAt())
            .updatedAt(client.getUpdatedAt())
            .build();
    }


}
