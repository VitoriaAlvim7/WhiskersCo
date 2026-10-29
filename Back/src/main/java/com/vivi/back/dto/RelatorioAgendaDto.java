package com.vivi.back.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record RelatorioAgendaDto(
        LocalDate inicio,
        LocalDate fim,
        long total,
        Map<String, Long> porStatus,
        Map<String, Long> porVeterinario,
        List<ConsultaDto> consultas
) {
}
