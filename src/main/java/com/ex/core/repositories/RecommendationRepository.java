package com.ex.core.repositories;

import com.ex.core.entities.Patient;
import com.ex.core.entities.Recommendation;
import org.hibernate.boot.models.annotations.internal.DiscriminatorOptionsAnnotation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    List<Recommendation> findByPatient(Patient patient);
}
