package com.vivi.back.dto;

import com.vivi.back.model.Consulta;
import com.vivi.back.model.ItemTransacao;
import com.vivi.back.model.TransacaoCaixa;
import com.vivi.back.model.enums.TipoTransacao;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

public record TransacaoCaixaDto(
        Long id,
        LocalDateTime dataHora,
        Double valorTotal,
        String metodoPagamento,
        TipoTransacao tipo,
        Long funcionarioId,
        String funcionarioNome,
        Long consultaId,
        String consultaDescricao,
        List<ItemTransacaoDto> itens
) {

    private static final DateTimeFormatter DATA_HORA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public TransacaoCaixaDto(TransacaoCaixa transacao, List<ItemTransacao> itens) {
        this(
                transacao.getId(),
                transacao.getDataHora(),
                transacao.getValorTotal(),
                transacao.getMetodoPagamento(),
                transacao.getTipo(),
                transacao.getFuncionario() != null ? transacao.getFuncionario().getId() : null,
                transacao.getFuncionario() != null ? transacao.getFuncionario().getNome() : null,
                transacao.getConsulta() != null ? transacao.getConsulta().getId() : null,
                descrever(transacao.getConsulta()),
                ItemTransacaoDto.converter(itens)
        );
    }

    // "Thor · Curativo · 20/10/2026 13:30", para a tela não precisar buscar a consulta.
    private static String descrever(Consulta consulta) {
        if (consulta == null) return null;
        String paciente = consulta.getPaciente() != null ? consulta.getPaciente().getNome() : "Paciente";
        String quando = consulta.getDataHora() != null ? " · " + consulta.getDataHora().format(DATA_HORA) : "";
        return paciente + " · " + consulta.getMotivo() + quando;
    }

    public static List<TransacaoCaixaDto> converter(List<TransacaoCaixa> transacoes, List<List<ItemTransacao>> itensList) {
        return transacoes.stream()
                .map(t -> {
                    List<ItemTransacao> itens = itensList.stream()
                            .filter(il -> il.get(0).getTransacao().getId().equals(t.getId()))
                            .findFirst()
                            .orElse(List.of());
                    return new TransacaoCaixaDto(t, itens);
                })
                .toList();
    }
}
