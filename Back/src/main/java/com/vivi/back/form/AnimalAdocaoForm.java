package com.vivi.back.form;

import com.vivi.back.model.enums.StatusAdocao;
import com.vivi.back.model.enums.UnidadeIdade;

public record AnimalAdocaoForm(
    String nome,
    String raca,
    Integer idade,
    UnidadeIdade unidadeIdade,
    Double peso,
    String alergias,
    String informacoes,
    StatusAdocao statusAdocao,
    String fotoUrl
) {}
