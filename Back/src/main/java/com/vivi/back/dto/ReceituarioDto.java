package com.vivi.back.dto;

import com.vivi.back.model.Receituario;

import java.time.LocalDate;
import java.util.List;

public record ReceituarioDto(
        Long id,
        LocalDate dataEmissao,
        String prescricao,
        Long consultaId,
        String consulta
) {

    public ReceituarioDto(Receituario receituario) {
        this(
                receituario.getId(),
                receituario.getDataEmissao(),
                receituario.getPrescricao(),
                receituario.getConsulta().getId(),
                receituario.getConsulta().getMotivo()
        );
    }

    public static List<ReceituarioDto> converter(List<Receituario> receituarios) {
        return receituarios.stream().map(ReceituarioDto::new).toList();
    }
}
