package com.vivi.back.dto;

import org.springframework.data.domain.Page;

import java.util.List;

public record PaginaDto<T>(
        List<T> conteudo,
        int pagina,
        int tamanho,
        long totalItens,
        int totalPaginas
) {

    public static <T> PaginaDto<T> de(Page<?> pagina, List<T> conteudo) {
        return new PaginaDto<>(
                conteudo,
                pagina.getNumber() + 1,
                pagina.getSize(),
                pagina.getTotalElements(),
                Math.max(1, pagina.getTotalPages())
        );
    }
}
