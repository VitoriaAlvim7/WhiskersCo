package com.vivi.back.dto;

import com.vivi.back.model.Receituario;

import java.time.LocalDate;

public record ReceituarioResumidoDto(
        Long id,
        LocalDate dataEmissao,
        String prescricao
) {
    public ReceituarioResumidoDto(Receituario receituario) {
        this(
                receituario.getId(),
                receituario.getDataEmissao(),
                receituario.getPrescricao()
        );
    }
}
