package com.vivi.back.dto;

import com.vivi.back.model.AnimalAdocao;
import com.vivi.back.model.enums.UnidadeIdade;
import java.util.List;

public record AnimalAdocaoDto(
    Long id,
    String nome,
    String raca,
    Integer idade,
    UnidadeIdade unidadeIdade,
    Double peso,
    String alergias,
    String informacoes,
    String statusAdocao,
    String fotoUrl
) {
    public AnimalAdocaoDto(AnimalAdocao animal) {
        this(
            animal.getId(),
            animal.getNome(),
            animal.getRaca(),
            animal.getIdade(),
            animal.getUnidadeIdade(),
            animal.getPeso(),
            animal.getAlergias(),
            animal.getInformacoes(),
            animal.getStatusAdocao().toString(),
            animal.getFotoUrl()
        );
    }

    public static List<AnimalAdocaoDto> converter(List<AnimalAdocao> animais) {
        return animais.stream()
            .map(AnimalAdocaoDto::new)
            .toList();
    }
}
