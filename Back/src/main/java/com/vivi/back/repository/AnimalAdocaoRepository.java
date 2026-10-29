package com.vivi.back.repository;

import com.vivi.back.model.AnimalAdocao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnimalAdocaoRepository extends JpaRepository<AnimalAdocao, Long> {
}
