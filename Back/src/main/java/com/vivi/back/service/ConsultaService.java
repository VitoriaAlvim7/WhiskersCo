package com.vivi.back.service;

import com.vivi.back.dto.ConsultaDto;
import com.vivi.back.dto.RelatorioAgendaDto;
import com.vivi.back.exception.RecursoNaoEncontradoException;
import com.vivi.back.form.ConsultaForm;
import com.vivi.back.model.Consulta;
import com.vivi.back.model.Funcionario;
import com.vivi.back.model.Paciente;
import com.vivi.back.model.enums.StatusConsulta;
import com.vivi.back.model.enums.TipoNotificacao;
import com.vivi.back.repository.ConsultaRepository;
import com.vivi.back.repository.FuncionarioRepository;
import com.vivi.back.repository.PacienteRepository;
import com.vivi.back.model.AgendaFuncionario;
import com.vivi.back.repository.AgendaFuncionarioRepository;
import com.vivi.back.repository.TransacaoCaixaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.time.LocalTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.List;
import java.util.Optional;

@Service
public class ConsultaService {

    private static final Sort POR_DATA_HORA = Sort.by(Sort.Direction.ASC, "dataHora");

    @Autowired
    private ConsultaRepository consultaRepository;

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private TransacaoCaixaRepository transacaoCaixaRepository;

    @Autowired
    private NotificacaoService notificacaoService;

    @Autowired
    private AgendaFuncionarioRepository agendaFuncionarioRepository;

    private static final String[] DIAS_PT = {
        "segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"
    };

    public Consulta salvar(ConsultaForm form) {
        Funcionario funcionario = funcionarioRepository.findById(form.funcionarioId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Funcionário não encontrado"));

        Paciente paciente = pacienteRepository.findById(form.pacienteId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Paciente não encontrado"));

        validarDisponibilidade(funcionario, form.dataHora(), null);

        boolean jaAconteceu = form.dataHora().isBefore(LocalDateTime.now());
        StatusConsulta status = jaAconteceu ? StatusConsulta.FINALIZADA : StatusConsulta.AGENDADA;

        Consulta consulta = new Consulta(
                null,
                form.dataHora(),
                form.motivo(),
                status,
                funcionario,
                paciente,
                null
        );

        Consulta salva = consultaRepository.save(consulta);
        notificacaoService.registrar(
                TipoNotificacao.CONSULTA_AGENDADA,
                (jaAconteceu ? "Consulta registrada: " : "Consulta agendada: ")
                        + paciente.getNome() + " — " + salva.getMotivo());
        return salva;
    }

    public List<Consulta> listarConsultas() {
        return consultaRepository.findAll(POR_DATA_HORA);
    }

    public Optional<Consulta> buscarPorId(Long id) {
        return consultaRepository.findById(id);
    }

    public Consulta atualizar(Long id, ConsultaForm form) {
        return consultaRepository.findById(id)
                .map(consulta -> {
                    Funcionario funcionario = funcionarioRepository.findById(form.funcionarioId())
                            .orElseThrow(() -> new RecursoNaoEncontradoException("Funcionário não encontrado"));

                    Paciente paciente = pacienteRepository.findById(form.pacienteId())
                            .orElseThrow(() -> new RecursoNaoEncontradoException("Paciente não encontrado"));

                    validarDisponibilidade(funcionario, form.dataHora(), consulta.getId());

                    String lembreteAntigo = consulta.getDataHora() != null
                            ? LembreteConsultaService.titulo(consulta)
                            : null;

                    consulta.setDataHora(form.dataHora());
                    consulta.setMotivo(form.motivo());
                    consulta.setFuncionario(funcionario);
                    consulta.setPaciente(paciente);
                    Consulta salva = consultaRepository.save(consulta);

                    if (lembreteAntigo != null && !lembreteAntigo.equals(LembreteConsultaService.titulo(salva))) {
                        notificacaoService.removerNaoLida(TipoNotificacao.CONSULTA_PROXIMA, lembreteAntigo);
                    }
                    return salva;
                })
                .orElseThrow(() -> new RecursoNaoEncontradoException("Consulta não encontrada"));
    }

    private void validarDisponibilidade(Funcionario funcionario, LocalDateTime dataHora, Long idAtual) {
        if (dataHora == null) return;
        validarDentroDaAgenda(funcionario, dataHora);
        validarSemConflito(funcionario, dataHora, idAtual);
    }

    private void validarDentroDaAgenda(Funcionario funcionario, LocalDateTime dataHora) {
        List<AgendaFuncionario> faixas =
                agendaFuncionarioRepository.findByFuncionarioIdOrderByDiaSemanaAscHoraInicioAsc(funcionario.getId());
        if (faixas.isEmpty()) return;

        DayOfWeek dia = dataHora.getDayOfWeek();
        LocalTime hora = dataHora.toLocalTime();

        boolean atende = faixas.stream()
                .anyMatch(f -> f.getDiaSemana() == dia && f.contem(hora));
        if (atende) return;

        throw new IllegalStateException(
                funcionario.getNome() + " não atende " + descreverDia(dia)
                        + " às " + hora.format(DateTimeFormatter.ofPattern("HH:mm"))
                        + ". Agenda: " + descreverAgenda(faixas) + ".");
    }

    private void validarSemConflito(Funcionario funcionario, LocalDateTime dataHora, Long idAtual) {
        boolean ocupado = consultaRepository
                .findByFuncionarioIdAndDataHora(funcionario.getId(), dataHora).stream()
                .filter(c -> !c.getId().equals(idAtual))
                .anyMatch(c -> c.getStatus() != StatusConsulta.CANCELADA);

        if (ocupado) {
            throw new IllegalStateException(
                    funcionario.getNome() + " já tem consulta marcada em "
                            + dataHora.format(DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm")) + ".");
        }
    }

    private String descreverDia(DayOfWeek dia) {
        return DIAS_PT[dia.getValue() - 1];
    }

    private String descreverAgenda(List<AgendaFuncionario> faixas) {
        DateTimeFormatter hm = DateTimeFormatter.ofPattern("HH:mm");
        return faixas.stream()
                .sorted(Comparator.comparing(AgendaFuncionario::getDiaSemana)
                        .thenComparing(AgendaFuncionario::getHoraInicio))
                .map(f -> descreverDia(f.getDiaSemana()) + " "
                        + f.getHoraInicio().format(hm) + "-" + f.getHoraFim().format(hm))
                .collect(Collectors.joining(", "));
    }

    public void deletar(Long id) {
        Consulta consulta = consultaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Consulta não encontrada"));

        if (transacaoCaixaRepository.existsByConsultaId(id)) {
            throw new IllegalStateException(
                    "Esta consulta tem lançamento no caixa e não pode ser excluída.");
        }

        consultaRepository.delete(consulta);
    }

    public Page<Consulta> paginarPorPeriodo(LocalDate inicio, LocalDate fim, int pagina, int tamanho) {
        Pageable pageable = PageRequest.of(Math.max(0, pagina), Math.max(1, tamanho), POR_DATA_HORA);
        return consultaRepository.findByDataHoraBetween(
                inicio.atStartOfDay(), fim.atTime(LocalTime.MAX), pageable);
    }

    public RelatorioAgendaDto relatorio(LocalDate inicio, LocalDate fim) {
        List<Consulta> consultas = consultaRepository.findByDataHoraBetween(
                inicio.atStartOfDay(), fim.atTime(LocalTime.MAX));
        consultas = consultas.stream()
                .sorted((a, b) -> a.getDataHora().compareTo(b.getDataHora()))
                .toList();

        Map<String, Long> porStatus = consultas.stream().collect(Collectors.groupingBy(
                c -> c.getStatus() != null ? c.getStatus().name() : "SEM_STATUS",
                LinkedHashMap::new, Collectors.counting()));

        Map<String, Long> porVeterinario = consultas.stream().collect(Collectors.groupingBy(
                c -> c.getFuncionario() != null ? c.getFuncionario().getNome() : "Sem profissional",
                LinkedHashMap::new, Collectors.counting()));

        return new RelatorioAgendaDto(
                inicio, fim, consultas.size(), porStatus, porVeterinario,
                ConsultaDto.converter(consultas));
    }

    public List<Consulta> listarHoje() {
        LocalDate hoje = LocalDate.now();
        LocalDateTime inicio = hoje.atStartOfDay();
        LocalDateTime fim = hoje.atTime(23, 59, 59);
        return consultaRepository.findByDataHoraBetween(inicio, fim);
    }

    public Consulta atualizarStatus(Long id, StatusConsulta status) {
        return consultaRepository.findById(id)
                .map(consulta -> {
                    consulta.setStatus(status);
                    Consulta salva = consultaRepository.save(consulta);

                    if (status == StatusConsulta.CANCELADA) {
                        notificacaoService.removerNaoLida(
                                TipoNotificacao.CONSULTA_PROXIMA,
                                LembreteConsultaService.titulo(salva));
                    }

                    return salva;
                })
                .orElseThrow(() -> new RecursoNaoEncontradoException("Consulta não encontrada"));
    }
}
