package com.vivi.back.form;

import com.vivi.back.model.enums.UnidadeIdade;

public record PacienteForm(
        String nome,
        String raca,
        Integer idade,
        UnidadeIdade unidadeIdade,
        Double peso,
        String alergias,
        String informacoes,
        Long tutorId,
        String fotoUrl
) {
}
