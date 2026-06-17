package com.aivice.repository;

import com.aivice.model.Client;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends MongoRepository<Client, String> {

    List<Client> findByUserId(String userId);
    Optional<Client> findByIdAndUserId(String id, String userId);

    @Query("{ 'userId': ?0, $or: [ { 'companyName': { $regex: ?1, $options: 'i' } }, { 'email': { $regex: ?1, $options: 'i' } } ] }")
    List<Client> searchByUserIdAndKeyword(String userId, String keyword);

    boolean existsByUserIdAndEmail(String userId, String email);

    boolean existsByUserIdAndEmailAndIdNot(String userId, String email,String id);

}
