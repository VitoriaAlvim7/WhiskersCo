package com.vivi.back.form;

import com.vivi.back.model.enums.NaturezaItem;
import com.vivi.back.model.enums.TipoProduto;
import com.vivi.back.model.enums.TipoServico;

public record ProdutoForm(
        String nome,
        String descricao,
        Double preco,
        Integer quantidade,
        TipoProduto tipoProduto,
        NaturezaItem naturezaItem,
        TipoServico tipoServico,
        String fotoUrl
) {
    public Integer quantidadeEfetiva() {
        return naturezaItem == NaturezaItem.SERVICO ? null : quantidade;
    }
}
