package com.vivi.back.dto;

import com.vivi.back.model.Tutor;

import java.util.List;
import java.util.stream.Collectors;

public record TutorDto(
        Long id,
        String nome,
        String cpf,
        String telefone,
        String endereco
) {

    public TutorDto(Tutor tutor) {
        this(
                tutor.getId(),
                tutor.getNome(),
                tutor.getCpf(),
                tutor.getTelefone(),
                tutor.getEndereco());
    }

    public static List<TutorDto> converter(List<Tutor> tutores) {
        return tutores.stream().map(TutorDto::new).collect(Collectors.toList());
    }
}
