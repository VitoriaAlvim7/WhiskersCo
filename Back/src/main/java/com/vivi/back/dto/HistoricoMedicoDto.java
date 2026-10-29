package com.vivi.back.dto;

import com.vivi.back.model.Consulta;

import java.time.LocalDate;
import java.util.List;

public record HistoricoMedicoDto(
        Long id,
        LocalDate data,
        String motivo,
        String veterinario,
        String descricao,
        Long pacienteId
) {

    public HistoricoMedicoDto(Consulta consulta) {
        this(
                consulta.getId(),
                consulta.getDataHora().toLocalDate(),
                consulta.getMotivo(),
                consulta.getFuncionario().getNome(),
                consulta.getReceituario() != null ? consulta.getReceituario().getPrescricao() : "",
                consulta.getPaciente().getId()
        );
    }

    public static List<HistoricoMedicoDto> converter(List<Consulta> consultas) {
        return consultas.stream().map(HistoricoMedicoDto::new).toList();
    }
}
