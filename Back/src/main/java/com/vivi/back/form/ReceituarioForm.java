package com.vivi.back.form;

import java.time.LocalDate;

public record ReceituarioForm(
        LocalDate dataEmissao,
        String prescricao,
        Long consultaId
) {
}
