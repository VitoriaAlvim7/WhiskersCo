package com.vivi.back.dto;

import com.vivi.back.model.enums.TipoTransacao;

public record ItemResumoDto(
        String produtoNome,
        TipoTransacao tipo,
        Long quantidade,
        Double valorTotal
) {
}
