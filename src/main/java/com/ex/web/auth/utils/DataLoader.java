package com.ex.web.auth.utils;

import com.ex.web.auth.entities.TypeUser;
import com.ex.web.auth.entities.User;
import com.ex.web.auth.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Verifică dacă există deja un utilizator ADMIN
        if (userRepository.findByType(TypeUser.ADMIN).isEmpty()) {
            System.out.println("Creating ADMIN account...");
            
            var admin = User.builder()
                    .name("admin")
                    .username("admin")
                    .email("admin@gmail.com")
                    .password(passwordEncoder.encode("admin1234"))
                    .type(TypeUser.ADMIN)
                    .build();
            
            userRepository.save(admin);
            System.out.println("ADMIN account created successfully!");
        } else {
            System.out.println("ADMIN account already exists.");
        }
    }
}
