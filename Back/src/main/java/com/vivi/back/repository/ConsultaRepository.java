package com.vivi.back.repository;

import com.vivi.back.model.Consulta;
import com.vivi.back.model.enums.StatusConsulta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ConsultaRepository extends JpaRepository<Consulta, Long> {

    List<Consulta> findByDataHoraBetween(LocalDateTime inicio, LocalDateTime fim);

    Page<Consulta> findByDataHoraBetween(LocalDateTime inicio, LocalDateTime fim, Pageable pageable);

    List<Consulta> findByPacienteIdOrderByDataHoraDesc(Long pacienteId);

    List<Consulta> findByStatusAndDataHoraBetween(StatusConsulta status, LocalDateTime inicio, LocalDateTime fim);

    List<Consulta> findByFuncionarioIdAndDataHora(Long funcionarioId, LocalDateTime dataHora);
}
