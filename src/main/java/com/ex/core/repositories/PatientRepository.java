package com.ex.core.repositories;

import com.ex.core.entities.Patient;
import com.ex.web.auth.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.ResponseEntity;

import javax.swing.text.html.Option;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByUser(User user);
    Optional<Patient> findById(Long id);
    Optional<Patient> findByUserEmail(String email);

    boolean existsPatientByCnp(String cnp);
}
