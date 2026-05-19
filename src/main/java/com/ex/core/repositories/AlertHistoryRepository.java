package com.ex.core.repositories;

import com.ex.core.entities.AlertHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlertHistoryRepository extends JpaRepository<AlertHistory, Long> {
}
