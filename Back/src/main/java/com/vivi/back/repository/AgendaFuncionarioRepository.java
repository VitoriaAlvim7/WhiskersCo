package com.vivi.back.repository;

import com.vivi.back.model.AgendaFuncionario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AgendaFuncionarioRepository extends JpaRepository<AgendaFuncionario, Long> {

    List<AgendaFuncionario> findByFuncionarioIdOrderByDiaSemanaAscHoraInicioAsc(Long funcionarioId);

    void deleteByFuncionarioId(Long funcionarioId);
}
