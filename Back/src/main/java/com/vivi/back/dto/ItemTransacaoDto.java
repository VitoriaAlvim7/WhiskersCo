package com.vivi.back.dto;

import com.vivi.back.model.ItemTransacao;

import java.util.List;

public record ItemTransacaoDto(
        Long id,
        Integer quantidade,
        Long produtoId,
        String produtoNome,
        Double preco
) {

    public ItemTransacaoDto(ItemTransacao item) {
        this(
                item.getId(),
                item.getQuantidade(),
                item.getProduto().getId(),
                item.getProduto().getNome(),
                item.getProduto().getPreco()
        );
    }

    public static List<ItemTransacaoDto> converter(List<ItemTransacao> itens) {
        return itens.stream()
                .map(ItemTransacaoDto::new)
                .toList();
    }
}
