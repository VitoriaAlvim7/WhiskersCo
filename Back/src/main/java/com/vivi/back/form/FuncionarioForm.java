package com.vivi.back.form;

import com.vivi.back.model.enums.FuncaoFuncionario;
import com.vivi.back.model.enums.StatusFuncionario;

import java.util.List;

public record FuncionarioForm(
        String nome,
        String email,
        String senha,
        FuncaoFuncionario funcao,
        String agenda,
        StatusFuncionario statusFuncionario,
        String fotoUrl,
        List<FaixaAgendaForm> agendaFaixas
) {
}
