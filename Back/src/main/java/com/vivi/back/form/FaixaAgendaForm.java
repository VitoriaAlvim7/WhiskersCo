package com.vivi.back.form;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record FaixaAgendaForm(
        DayOfWeek diaSemana,
        LocalTime horaInicio,
        LocalTime horaFim
) {
}
