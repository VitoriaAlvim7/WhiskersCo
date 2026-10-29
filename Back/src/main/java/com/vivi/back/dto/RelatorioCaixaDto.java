package com.vivi.back.dto;

import java.time.LocalDate;
import java.util.List;

public record RelatorioCaixaDto(
        LocalDate inicio,
        LocalDate fim,
        double totalEntradas,
        double totalSaidas,
        double saldo,
        long quantidadeEntradas,
        long quantidadeSaidas,
        List<ItemResumoDto> itens
) {
}
