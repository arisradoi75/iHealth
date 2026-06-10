package com.ex.core.repositories;

import com.ex.core.entities.Medic;
import com.ex.web.auth.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MedicRepository extends JpaRepository<Medic, Long> {
    Optional<Medic> findByUser(User user);
}
