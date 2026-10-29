package com.vivi.back.form;

import com.vivi.back.model.enums.TipoTransacao;
import java.time.LocalDateTime;
import java.util.List;

public record TransacaoCaixaForm(
        LocalDateTime dataHora,
        String metodoPagamento,
        TipoTransacao tipo,
        Long funcionarioId,
        Long consultaId,
        Double valor,
        List<ItemTransacaoForm> itens
) {
}
