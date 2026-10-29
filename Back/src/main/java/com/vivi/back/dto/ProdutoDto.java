package com.vivi.back.dto;

import com.vivi.back.model.Produto;
import com.vivi.back.model.enums.NaturezaItem;
import com.vivi.back.model.enums.TipoProduto;
import com.vivi.back.model.enums.TipoServico;

import java.util.List;

public record ProdutoDto(
        Long id,
        String nome,
        String descricao,
        Double preco,
        Integer quantidade,
        TipoProduto tipoProduto,
        NaturezaItem naturezaItem,
        TipoServico tipoServico,
        String fotoUrl
) {

    public ProdutoDto(Produto produto) {
        this(
                produto.getId(),
                produto.getNome(),
                produto.getDescricao(),
                produto.getPreco(),
                produto.getQuantidade(),
                produto.getTipoProduto(),
                produto.getNaturezaItem(),
                produto.getTipoServico(),
                produto.getFotoUrl()
        );
    }

    public static List<ProdutoDto> converter(List<Produto> produtos) {
        return produtos.stream()
                .map(ProdutoDto::new)
                .toList();
    }
}
