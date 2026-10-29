package com.vivi.back.service;

import com.vivi.back.exception.RecursoNaoEncontradoException;
import com.vivi.back.form.PacienteForm;
import com.vivi.back.model.Paciente;
import com.vivi.back.model.Tutor;
import com.vivi.back.repository.PacienteRepository;
import com.vivi.back.repository.TutorRepository;
import com.vivi.back.model.enums.TipoNotificacao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PacienteService {

    private static final Sort POR_NOME = Sort.by(Sort.Direction.ASC, "nome");

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private TutorRepository tutorRepository;

    @Autowired
    private NotificacaoService notificacaoService;

    public Paciente salvar(PacienteForm form) {
        Tutor tutor = tutorRepository.findById(form.tutorId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tutor não encontrado"));

        Paciente paciente = new Paciente(
                null,
                form.nome(),
                form.raca(),
                form.idade(),
                form.unidadeIdade(),
                form.peso(),
                form.alergias(),
                form.informacoes(),
                true,
                tutor,
                form.fotoUrl()
        );
        Paciente salvo = pacienteRepository.save(paciente);
        notificacaoService.registrar(
                TipoNotificacao.PACIENTE_CADASTRADO,
                "Paciente cadastrado: " + salvo.getNome());
        return salvo;
    }

    public List<Paciente> listarPacientes(){
        return pacienteRepository.findAll(POR_NOME).stream()
                .filter(p -> p.getAtivo() != null && p.getAtivo())
                .toList();
    }

    public List<Paciente> listarTodos(){
        return pacienteRepository.findAll(POR_NOME);
    }

    public List<Paciente> listarInativos(){
        return pacienteRepository.findAll(POR_NOME).stream()
                .filter(p -> p.getAtivo() != null && !p.getAtivo())
                .toList();
    }

    public Optional<Paciente> buscarPacientePorId(Long id){
        Optional<Paciente> paciente = pacienteRepository.findById(id);
        if (paciente.isPresent() && (paciente.get().getAtivo() == null || !paciente.get().getAtivo())) {
            return Optional.empty();
        }
        return paciente;
    }

    public Optional<Paciente> buscarPacientePorIdIncluindoInativo(Long id) {
        return pacienteRepository.findById(id);
    }

    public Paciente atualizar(Long id, PacienteForm form) {
        return pacienteRepository.findById(id)
                .map(paciente -> {
                    Tutor tutor = tutorRepository.findById(form.tutorId())
                            .orElseThrow(() -> new RecursoNaoEncontradoException("Tutor não encontrado"));

                    paciente.setNome(form.nome());
                    paciente.setRaca(form.raca());
                    paciente.setIdade(form.idade());
                    paciente.setUnidadeIdade(form.unidadeIdade());
                    paciente.setPeso(form.peso());
                    paciente.setAlergias(form.alergias());
                    paciente.setInformacoes(form.informacoes());
                    paciente.setTutor(tutor);
                    paciente.setFotoUrl(form.fotoUrl());
                    return pacienteRepository.save(paciente);
                })
                .orElseThrow(() -> new RecursoNaoEncontradoException("Paciente não encontrado"));
    }

    public void deletar(Long id) {
        Optional<Paciente> paciente = pacienteRepository.findById(id);
        if (paciente.isPresent()) {
            paciente.get().setAtivo(false);
            pacienteRepository.save(paciente.get());
        }
    }

    public void reativar(Long id) {
        Optional<Paciente> paciente = pacienteRepository.findById(id);
        if (paciente.isPresent()) {
            paciente.get().setAtivo(true);
            pacienteRepository.save(paciente.get());
        }
    }
}
