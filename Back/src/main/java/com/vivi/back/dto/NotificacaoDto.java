package com.vivi.back.dto;

import com.vivi.back.model.Notificacao;
import com.vivi.back.model.enums.TipoNotificacao;

import java.time.LocalDateTime;
import java.util.List;

public record NotificacaoDto(
        Long id,
        TipoNotificacao tipo,
        String titulo,
        LocalDateTime criadaEm,
        Boolean lida
) {

    public NotificacaoDto(Notificacao notificacao) {
        this(
                notificacao.getId(),
                notificacao.getTipo(),
                notificacao.getTitulo(),
                notificacao.getCriadaEm(),
                notificacao.getLida()
        );
    }

    public static List<NotificacaoDto> converter(List<Notificacao> notificacoes) {
        return notificacoes.stream().map(NotificacaoDto::new).toList();
    }
}
