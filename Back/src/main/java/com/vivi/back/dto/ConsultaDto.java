package com.vivi.back.dto;

import com.vivi.back.model.Consulta;

import java.time.LocalDateTime;
import java.util.List;

public record ConsultaDto(
        Long id,
        LocalDateTime dataHora,
        String motivo,
        String status,
        Long funcionarioId,
        String funcionario,
        Long pacienteId,
        String paciente,
        ReceituarioResumidoDto receituario
) {

    public ConsultaDto(Consulta consulta) {
        this(
                consulta.getId(),
                consulta.getDataHora(),
                consulta.getMotivo(),
                consulta.getStatus().toString(),
                consulta.getFuncionario().getId(),
                consulta.getFuncionario().getNome(),
                consulta.getPaciente().getId(),
                consulta.getPaciente().getNome(),
                consulta.getReceituario() != null ? new ReceituarioResumidoDto(consulta.getReceituario()) : null
        );
    }

    public static List<ConsultaDto> converter(List<Consulta> consultas) {
        return consultas.stream().map(ConsultaDto::new).toList();
    }
}
