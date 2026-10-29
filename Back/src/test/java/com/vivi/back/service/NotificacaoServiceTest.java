package com.vivi.back.service;

import com.vivi.back.model.Notificacao;
import com.vivi.back.model.enums.TipoNotificacao;
import com.vivi.back.repository.NotificacaoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class NotificacaoServiceTest {

    @Mock private NotificacaoRepository notificacaoRepository;

    private NotificacaoService service;

    @BeforeEach
    void montarServico() {
        service = new NotificacaoService();
        ReflectionTestUtils.setField(service, "notificacaoRepository", notificacaoRepository);
    }

    private List<Notificacao> naoLidas(int quantidade) {
        List<Notificacao> lista = new ArrayList<>();
        for (int i = 0; i < quantidade; i++) {
            lista.add(new Notificacao(
                    (long) i, TipoNotificacao.ESTOQUE_BAIXO, "Aviso " + i,
                    LocalDateTime.now().minusMinutes(i), false));
        }
        return lista;
    }

    @Test
    @DisplayName("não repete notificação não lida com o mesmo tipo e título")
    void naoDuplicaNaoLida() {
        when(notificacaoRepository.existsByTipoAndTituloAndLidaFalse(
                TipoNotificacao.ESTOQUE_BAIXO, "Estoque baixo: Ração (2 restantes)"))
                .thenReturn(true);

        service.registrar(TipoNotificacao.ESTOQUE_BAIXO, "Estoque baixo: Ração (2 restantes)");

        verify(notificacaoRepository, never()).save(any());
    }

    @Test
    @DisplayName("a 11ª notificação derruba a mais antiga")
    void aplicaTetoDeDez() {
        when(notificacaoRepository.existsByTipoAndTituloAndLidaFalse(any(), any())).thenReturn(false);
        when(notificacaoRepository.findAllByOrderByCriadaEmDesc()).thenReturn(naoLidas(11));

        service.registrar(TipoNotificacao.CONSULTA_AGENDADA, "Consulta agendada: Mel");

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<Notificacao>> removidas = ArgumentCaptor.forClass(List.class);
        verify(notificacaoRepository).deleteAll(removidas.capture());
        assertThat(removidas.getValue()).hasSize(1);
        assertThat(NotificacaoService.TETO).isEqualTo(10);
    }

    @Test
    @DisplayName("com 10 ou menos, nada é removido")
    void naoRemoveAbaixoDoTeto() {
        when(notificacaoRepository.existsByTipoAndTituloAndLidaFalse(any(), any())).thenReturn(false);
        when(notificacaoRepository.findAllByOrderByCriadaEmDesc()).thenReturn(naoLidas(10));

        service.registrar(TipoNotificacao.CONSULTA_AGENDADA, "Consulta agendada: Mel");

        verify(notificacaoRepository, never()).deleteAll(any());
    }

    @Test
    @DisplayName("E1: remove o lembrete pendente de uma consulta cancelada")
    void removeLembretePendente() {
        List<Notificacao> pendente = naoLidas(1);
        when(notificacaoRepository.findByTipoAndTituloAndLidaFalse(
                TipoNotificacao.CONSULTA_PROXIMA, "Consulta às 14:30: Thor"))
                .thenReturn(pendente);

        service.removerNaoLida(TipoNotificacao.CONSULTA_PROXIMA, "Consulta às 14:30: Thor");

        verify(notificacaoRepository).deleteAll(pendente);
    }

    @Test
    @DisplayName("não há o que remover quando o lembrete já foi lido")
    void naoRemoveQuandoNaoHaPendente() {
        when(notificacaoRepository.findByTipoAndTituloAndLidaFalse(any(), any()))
                .thenReturn(List.of());

        service.removerNaoLida(TipoNotificacao.CONSULTA_PROXIMA, "Consulta às 14:30: Thor");

        verify(notificacaoRepository, never()).deleteAll(any());
    }
}
