package com.aivice.service;

import com.aivice.dto.AuthResponse;
import com.aivice.dto.LoginRequest;
import com.aivice.dto.RegisterRequest;
import com.aivice.exception.DuplicateResourceException;
import com.aivice.model.User;
import com.aivice.repository.UserRepository;
import com.aivice.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request ) {
        if(userRepository.existsByEmail(request.getEmail())){
            throw new DuplicateResourceException("Email already exists: "+ request.getEmail());
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token , user.getEmail(), user.getName());
    }

    public AuthResponse login(LoginRequest request){
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if(!passwordEncoder.matches(request.getPassword(), user.getPassword())){
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token , user.getEmail(), user.getName());
    }

}
