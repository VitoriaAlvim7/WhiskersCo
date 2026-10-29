package com.vivi.back.service;

import com.vivi.back.model.Consulta;
import com.vivi.back.model.enums.StatusConsulta;
import com.vivi.back.model.enums.TipoNotificacao;
import com.vivi.back.repository.ConsultaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class LembreteConsultaService {

    public static final Duration ANTECEDENCIA = Duration.ofMinutes(15);

    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("HH:mm");

    @Autowired
    private ConsultaRepository consultaRepository;

    @Autowired
    private NotificacaoService notificacaoService;

    @Scheduled(fixedRate = 60_000)
    public void avisarConsultasProximas() {
        LocalDateTime agora = LocalDateTime.now();
        List<Consulta> proximas = consultaRepository.findByStatusAndDataHoraBetween(
                StatusConsulta.AGENDADA, agora, agora.plus(ANTECEDENCIA));

        for (Consulta consulta : proximas) {
            notificacaoService.registrar(TipoNotificacao.CONSULTA_PROXIMA, titulo(consulta));
        }
    }

    public static String titulo(Consulta consulta) {
        String paciente = consulta.getPaciente() != null ? consulta.getPaciente().getNome() : "Paciente";
        return "Consulta às " + consulta.getDataHora().format(HORA) + ": " + paciente;
    }
}
