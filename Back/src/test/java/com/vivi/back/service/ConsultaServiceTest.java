package com.vivi.back.service;

import com.vivi.back.form.ConsultaForm;
import com.vivi.back.model.AgendaFuncionario;
import com.vivi.back.model.Consulta;
import com.vivi.back.model.Funcionario;
import com.vivi.back.model.Paciente;
import com.vivi.back.model.enums.StatusConsulta;
import com.vivi.back.model.enums.TipoNotificacao;
import com.vivi.back.repository.AgendaFuncionarioRepository;
import com.vivi.back.repository.ConsultaRepository;
import com.vivi.back.repository.FuncionarioRepository;
import com.vivi.back.repository.PacienteRepository;
import com.vivi.back.repository.TransacaoCaixaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ConsultaServiceTest {

    private static final LocalDate PROXIMA_SEGUNDA =
            LocalDate.now().with(TemporalAdjusters.next(DayOfWeek.MONDAY));

    private static final LocalDateTime SEGUNDA_10H = PROXIMA_SEGUNDA.atTime(10, 0);
    private static final LocalDateTime SEGUNDA_20H = PROXIMA_SEGUNDA.atTime(20, 0);

    @Mock private ConsultaRepository consultaRepository;
    @Mock private FuncionarioRepository funcionarioRepository;
    @Mock private PacienteRepository pacienteRepository;
    @Mock private TransacaoCaixaRepository transacaoCaixaRepository;
    @Mock private NotificacaoService notificacaoService;
    @Mock private AgendaFuncionarioRepository agendaFuncionarioRepository;

    private ConsultaService service;
    private Funcionario veterinario;

    @BeforeEach
    void montarServico() {
        service = new ConsultaService();
        ReflectionTestUtils.setField(service, "consultaRepository", consultaRepository);
        ReflectionTestUtils.setField(service, "funcionarioRepository", funcionarioRepository);
        ReflectionTestUtils.setField(service, "pacienteRepository", pacienteRepository);
        ReflectionTestUtils.setField(service, "transacaoCaixaRepository", transacaoCaixaRepository);
        ReflectionTestUtils.setField(service, "notificacaoService", notificacaoService);
        ReflectionTestUtils.setField(service, "agendaFuncionarioRepository", agendaFuncionarioRepository);

        veterinario = new Funcionario();
        veterinario.setId(1L);
        veterinario.setNome("Dra. Paula");

        Paciente paciente = new Paciente();
        paciente.setId(2L);
        paciente.setNome("Mel");

        when(funcionarioRepository.findById(1L)).thenReturn(Optional.of(veterinario));
        when(pacienteRepository.findById(2L)).thenReturn(Optional.of(paciente));
        when(consultaRepository.save(any(Consulta.class)))
                .thenAnswer(chamada -> chamada.getArgument(0));
    }

    private void agendaSegundaDas8As18() {
        AgendaFuncionario faixa = new AgendaFuncionario();
        faixa.setFuncionario(veterinario);
        faixa.setDiaSemana(DayOfWeek.MONDAY);
        faixa.setHoraInicio(LocalTime.of(8, 0));
        faixa.setHoraFim(LocalTime.of(18, 0));

        when(agendaFuncionarioRepository.findByFuncionarioIdOrderByDiaSemanaAscHoraInicioAsc(1L))
                .thenReturn(List.of(faixa));
    }

    private ConsultaForm formEm(LocalDateTime quando) {
        return new ConsultaForm(quando, "Vacinação", 1L, 2L);
    }

    @Test
    @DisplayName("agenda dentro da faixa do profissional é aceita")
    void aceitaDentroDaFaixa() {
        agendaSegundaDas8As18();
        when(consultaRepository.findByFuncionarioIdAndDataHora(1L, SEGUNDA_10H)).thenReturn(List.of());

        Consulta salva = service.salvar(formEm(SEGUNDA_10H));

        assertThat(salva.getStatus()).isEqualTo(StatusConsulta.AGENDADA);
        verify(notificacaoService).registrar(any(), any());
    }

    @Test
    @DisplayName("agenda fora do horário de atendimento é recusada")
    void recusaForaDaFaixa() {
        agendaSegundaDas8As18();

        assertThatThrownBy(() -> service.salvar(formEm(SEGUNDA_20H)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("não atende");

        verify(consultaRepository, never()).save(any());
    }

    @Test
    @DisplayName("horário já ocupado pelo mesmo profissional é recusado")
    void recusaHorarioOcupado() {
        agendaSegundaDas8As18();

        Consulta existente = new Consulta();
        existente.setId(99L);
        existente.setStatus(StatusConsulta.AGENDADA);
        when(consultaRepository.findByFuncionarioIdAndDataHora(1L, SEGUNDA_10H))
                .thenReturn(List.of(existente));

        assertThatThrownBy(() -> service.salvar(formEm(SEGUNDA_10H)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("já tem consulta marcada");
    }

    @Test
    @DisplayName("consulta cancelada libera o horário")
    void canceladaNaoOcupaHorario() {
        agendaSegundaDas8As18();

        Consulta cancelada = new Consulta();
        cancelada.setId(99L);
        cancelada.setStatus(StatusConsulta.CANCELADA);
        when(consultaRepository.findByFuncionarioIdAndDataHora(1L, SEGUNDA_10H))
                .thenReturn(List.of(cancelada));

        assertThatCode(() -> service.salvar(formEm(SEGUNDA_10H))).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("sem faixas cadastradas não há o que validar")
    void semAgendaCadastradaNaoBloqueia() {
        when(agendaFuncionarioRepository.findByFuncionarioIdOrderByDiaSemanaAscHoraInicioAsc(1L))
                .thenReturn(List.of());
        when(consultaRepository.findByFuncionarioIdAndDataHora(1L, SEGUNDA_20H)).thenReturn(List.of());

        assertThatCode(() -> service.salvar(formEm(SEGUNDA_20H))).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("E1: cancelar a consulta retira o lembrete pendente")
    void cancelarRemoveLembrete() {
        Paciente paciente = new Paciente();
        paciente.setNome("Thor");

        Consulta consulta = new Consulta();
        consulta.setId(5L);
        consulta.setDataHora(LocalDateTime.of(2026, 9, 21, 14, 30));
        consulta.setStatus(StatusConsulta.AGENDADA);
        consulta.setPaciente(paciente);

        when(consultaRepository.findById(5L)).thenReturn(Optional.of(consulta));

        service.atualizarStatus(5L, StatusConsulta.CANCELADA);

        verify(notificacaoService).removerNaoLida(
                TipoNotificacao.CONSULTA_PROXIMA, "Consulta às 14:30: Thor");
    }

    @Test
    @DisplayName("E1: remarcar a consulta retira o lembrete do horário antigo")
    void remarcarRemoveLembreteAntigo() {
        agendaSegundaDas8As18();
        when(consultaRepository.findByFuncionarioIdAndDataHora(1L, SEGUNDA_10H)).thenReturn(List.of());

        Paciente paciente = new Paciente();
        paciente.setNome("Mel");

        Consulta consulta = new Consulta();
        consulta.setId(5L);
        consulta.setDataHora(PROXIMA_SEGUNDA.atTime(9, 0));
        consulta.setStatus(StatusConsulta.AGENDADA);
        consulta.setPaciente(paciente);
        when(consultaRepository.findById(5L)).thenReturn(Optional.of(consulta));

        service.atualizar(5L, formEm(SEGUNDA_10H));

        verify(notificacaoService).removerNaoLida(
                TipoNotificacao.CONSULTA_PROXIMA, "Consulta às 09:00: Mel");
    }

    @Test
    @DisplayName("editar só o motivo mantém o lembrete")
    void editarMotivoMantemLembrete() {
        agendaSegundaDas8As18();
        when(consultaRepository.findByFuncionarioIdAndDataHora(1L, SEGUNDA_10H)).thenReturn(List.of());

        Paciente paciente = new Paciente();
        paciente.setId(2L);
        paciente.setNome("Mel");

        Consulta consulta = new Consulta();
        consulta.setId(5L);
        consulta.setDataHora(SEGUNDA_10H);
        consulta.setStatus(StatusConsulta.AGENDADA);
        consulta.setPaciente(paciente);
        when(consultaRepository.findById(5L)).thenReturn(Optional.of(consulta));

        service.atualizar(5L, formEm(SEGUNDA_10H));

        verify(notificacaoService, never()).removerNaoLida(any(), any());
    }

    @Test
    @DisplayName("mudar para finalizada não mexe nas notificações")
    void finalizadaNaoRemoveNada() {
        Consulta consulta = new Consulta();
        consulta.setId(5L);
        consulta.setDataHora(LocalDateTime.of(2026, 9, 21, 14, 30));
        consulta.setStatus(StatusConsulta.AGENDADA);

        when(consultaRepository.findById(5L)).thenReturn(Optional.of(consulta));

        service.atualizarStatus(5L, StatusConsulta.FINALIZADA);

        verify(notificacaoService, never()).removerNaoLida(any(), any());
    }
}
