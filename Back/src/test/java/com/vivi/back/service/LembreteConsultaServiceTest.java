package com.vivi.back.service;

import com.vivi.back.model.Consulta;
import com.vivi.back.model.Paciente;
import com.vivi.back.model.enums.StatusConsulta;
import com.vivi.back.model.enums.TipoNotificacao;
import com.vivi.back.repository.ConsultaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LembreteConsultaServiceTest {

    @Mock private ConsultaRepository consultaRepository;
    @Mock private NotificacaoService notificacaoService;

    private LembreteConsultaService service;

    @BeforeEach
    void montarServico() {
        service = new LembreteConsultaService();
        ReflectionTestUtils.setField(service, "consultaRepository", consultaRepository);
        ReflectionTestUtils.setField(service, "notificacaoService", notificacaoService);
    }

    private Consulta consultaAs(LocalDateTime quando, String nomePaciente) {
        Paciente paciente = new Paciente();
        paciente.setNome(nomePaciente);

        Consulta consulta = new Consulta();
        consulta.setId(1L);
        consulta.setDataHora(quando);
        consulta.setStatus(StatusConsulta.AGENDADA);
        consulta.setPaciente(paciente);
        return consulta;
    }

    @Test
    @DisplayName("consulta dentro da janela vira notificação de lembrete")
    void consultaProximaGeraNotificacao() {
        LocalDateTime daquiA10Min = LocalDateTime.now().plusMinutes(10);
        when(consultaRepository.findByStatusAndDataHoraBetween(
                eq(StatusConsulta.AGENDADA), any(), any()))
                .thenReturn(List.of(consultaAs(daquiA10Min, "Mel")));

        service.avisarConsultasProximas();

        ArgumentCaptor<String> titulo = ArgumentCaptor.forClass(String.class);
        verify(notificacaoService).registrar(eq(TipoNotificacao.CONSULTA_PROXIMA), titulo.capture());
        assertThat(titulo.getValue()).contains("Mel");
    }

    @Test
    @DisplayName("agenda vazia na janela não gera notificação")
    void semConsultaNaJanelaNaoNotifica() {
        when(consultaRepository.findByStatusAndDataHoraBetween(
                eq(StatusConsulta.AGENDADA), any(), any()))
                .thenReturn(List.of());

        service.avisarConsultasProximas();

        verify(notificacaoService, never()).registrar(any(), any());
    }

    @Test
    @DisplayName("a janela consultada é de 15 minutos a partir de agora")
    void janelaTemAntecedenciaDeQuinzeMinutos() {
        when(consultaRepository.findByStatusAndDataHoraBetween(
                eq(StatusConsulta.AGENDADA), any(), any()))
                .thenReturn(List.of());

        service.avisarConsultasProximas();

        ArgumentCaptor<LocalDateTime> inicio = ArgumentCaptor.forClass(LocalDateTime.class);
        ArgumentCaptor<LocalDateTime> fim = ArgumentCaptor.forClass(LocalDateTime.class);
        verify(consultaRepository).findByStatusAndDataHoraBetween(
                eq(StatusConsulta.AGENDADA), inicio.capture(), fim.capture());

        assertThat(java.time.Duration.between(inicio.getValue(), fim.getValue()).toMinutes())
                .isEqualTo(15);
    }

    @Test
    @DisplayName("o título do lembrete traz hora e paciente e é reproduzível")
    void tituloEhEstavel() {
        Consulta consulta = consultaAs(LocalDateTime.of(2026, 9, 20, 14, 30), "Thor");

        assertThat(LembreteConsultaService.titulo(consulta))
                .isEqualTo("Consulta às 14:30: Thor")
                .isEqualTo(LembreteConsultaService.titulo(consulta));
    }
}
