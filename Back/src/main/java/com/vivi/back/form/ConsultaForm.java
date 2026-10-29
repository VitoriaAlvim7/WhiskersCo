package com.vivi.back.form;

import java.time.LocalDateTime;

public record ConsultaForm(
        LocalDateTime dataHora,
        String motivo,
        Long funcionarioId,
        Long pacienteId
) {
}
