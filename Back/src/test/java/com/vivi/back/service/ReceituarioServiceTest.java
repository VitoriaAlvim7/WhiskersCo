package com.vivi.back.service;

import com.vivi.back.exception.RecursoNaoEncontradoException;
import com.vivi.back.form.ReceituarioForm;
import com.vivi.back.model.Consulta;
import com.vivi.back.model.Receituario;
import com.vivi.back.model.enums.StatusConsulta;
import com.vivi.back.repository.ConsultaRepository;
import com.vivi.back.repository.ReceituarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ReceituarioServiceTest {

    @Mock private ReceituarioRepository receituarioRepository;
    @Mock private ConsultaRepository consultaRepository;

    private ReceituarioService service;

    @BeforeEach
    void montarServico() {
        service = new ReceituarioService();
        ReflectionTestUtils.setField(service, "receituarioRepository", receituarioRepository);
        ReflectionTestUtils.setField(service, "consultaRepository", consultaRepository);
    }

    private ReceituarioForm form() {
        return new ReceituarioForm(LocalDate.of(2026, 9, 21), "Dipirona 500mg, 1x ao dia", 7L);
    }

    @Test
    @DisplayName("gera a receita de uma consulta que ainda não tem")
    void geraReceita() {
        Consulta consulta = new Consulta();
        consulta.setId(7L);
        consulta.setStatus(StatusConsulta.FINALIZADA);
        when(consultaRepository.findById(7L)).thenReturn(Optional.of(consulta));
        when(receituarioRepository.existsByConsultaId(7L)).thenReturn(false);
        when(receituarioRepository.save(any(Receituario.class)))
                .thenAnswer(chamada -> chamada.getArgument(0));

        Receituario gerado = service.salvar(form());

        assertThat(gerado.getConsulta()).isEqualTo(consulta);
        assertThat(gerado.getPrescricao()).contains("Dipirona");
    }

    @Test
    @DisplayName("consulta que já tem receita não gera uma segunda")
    void naoDuplicaReceita() {
        Consulta consulta = new Consulta();
        consulta.setId(7L);
        consulta.setStatus(StatusConsulta.FINALIZADA);
        when(consultaRepository.findById(7L)).thenReturn(Optional.of(consulta));
        when(receituarioRepository.existsByConsultaId(7L)).thenReturn(true);

        assertThatThrownBy(() -> service.salvar(form()))
                .isInstanceOf(IllegalStateException.class);

        verify(receituarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("consulta inexistente não gera receita")
    void consultaInexistente() {
        when(consultaRepository.findById(7L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.salvar(form()))
                .isInstanceOf(RecursoNaoEncontradoException.class);
    }

    @Test
    @DisplayName("A5: consulta que não foi finalizada não gera receita")
    void consultaNaoFinalizadaNaoGeraReceita() {
        Consulta consulta = new Consulta();
        consulta.setId(7L);
        consulta.setStatus(StatusConsulta.AGENDADA);
        when(consultaRepository.findById(7L)).thenReturn(Optional.of(consulta));
        when(receituarioRepository.existsByConsultaId(7L)).thenReturn(false);

        assertThatThrownBy(() -> service.salvar(form()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("finalizada");

        verify(receituarioRepository, never()).save(any());
    }
}
