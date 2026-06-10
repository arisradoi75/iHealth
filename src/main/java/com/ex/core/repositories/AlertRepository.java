package com.ex.core.repositories;

import com.ex.core.entities.AlertRule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertRepository extends JpaRepository<AlertRule, Long> {
}
