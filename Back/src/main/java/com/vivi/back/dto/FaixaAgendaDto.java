package com.vivi.back.dto;

import com.vivi.back.model.AgendaFuncionario;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

public record FaixaAgendaDto(
        Long id,
        DayOfWeek diaSemana,
        LocalTime horaInicio,
        LocalTime horaFim
) {

    public FaixaAgendaDto(AgendaFuncionario faixa) {
        this(faixa.getId(), faixa.getDiaSemana(), faixa.getHoraInicio(), faixa.getHoraFim());
    }

    public static List<FaixaAgendaDto> converter(List<AgendaFuncionario> faixas) {
        return faixas.stream().map(FaixaAgendaDto::new).toList();
    }
}
