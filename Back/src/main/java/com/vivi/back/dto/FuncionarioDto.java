package com.vivi.back.dto;

import com.vivi.back.model.AgendaFuncionario;
import com.vivi.back.model.Funcionario;
import com.vivi.back.model.enums.FuncaoFuncionario;
import com.vivi.back.model.enums.StatusFuncionario;

import java.util.List;

public record FuncionarioDto(
        Long id,
        String nome,
        String email,
        FuncaoFuncionario funcao,
        String agenda,
        StatusFuncionario statusFuncionario,
        String fotoUrl,
        List<FaixaAgendaDto> agendaFaixas
) {
    public FuncionarioDto(Funcionario funcionario) {
        this(funcionario, List.of());
    }

    public FuncionarioDto(Funcionario funcionario, List<AgendaFuncionario> faixas) {
        this(
                funcionario.getId(),
                funcionario.getNome(),
                funcionario.getEmail(),
                funcionario.getFuncao(),
                funcionario.getAgenda(),
                funcionario.getStatusFuncionario(),
                funcionario.getFotoUrl(),
                FaixaAgendaDto.converter(faixas)
        );
    }

    public static List<FuncionarioDto> converter(List<Funcionario> funcionarios) {
        return funcionarios.stream().map(FuncionarioDto::new).toList();
    }
}
