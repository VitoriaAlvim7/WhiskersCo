package com.vivi.back.repository;

import com.vivi.back.model.Receituario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReceituarioRepository extends JpaRepository<Receituario, Long> {
    boolean existsByConsultaId(Long consultaId);
}
