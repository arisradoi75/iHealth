package com.ex.web.auth.repositories;

import com.ex.web.auth.entities.TypeUser;
import com.ex.web.auth.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String username);
    Optional<User> findByType(TypeUser type);

}

