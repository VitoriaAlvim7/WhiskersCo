package com.vivi.back.dto;

public record LoginResponse(
        Long id,
        String nome,
        String email,
        String funcao
) {
}
