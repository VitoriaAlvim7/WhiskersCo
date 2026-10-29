package com.vivi.back.service;

import com.vivi.back.exception.RecursoNaoEncontradoException;
import com.vivi.back.form.TutorForm;
import com.vivi.back.model.Tutor;
import com.vivi.back.repository.TutorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TutorService {

    private static final Sort POR_NOME = Sort.by(Sort.Direction.ASC, "nome");

    @Autowired
    private TutorRepository tutorRepository;

    public Tutor salvar(TutorForm form) {
        Tutor tutor = new Tutor(
                null,
                form.nome(),
                form.cpf(),
                form.telefone(),
                form.endereco(),
                true
        );
        return tutorRepository.save(tutor);
    }

    public List<Tutor> listarTutores(){
        return tutorRepository.findAll(POR_NOME).stream()
                .filter(t -> t.getAtivo() != null && t.getAtivo())
                .toList();
    }

    public List<Tutor> listarInativos(){
        return tutorRepository.findAll(POR_NOME).stream()
                .filter(t -> t.getAtivo() != null && !t.getAtivo())
                .toList();
    }

    public Optional<Tutor> buscarPorId(Long id) {
        Optional<Tutor> tutor = tutorRepository.findById(id);
        if (tutor.isPresent() && (tutor.get().getAtivo() == null || !tutor.get().getAtivo())) {
            return Optional.empty();
        }
        return tutor;
    }

    public Tutor atualizar(Long id, TutorForm form) {
        return tutorRepository.findById(id)
                .map(tutor -> {
                    tutor.setNome(form.nome());
                    tutor.setCpf(form.cpf());
                    tutor.setTelefone(form.telefone());
                    tutor.setEndereco(form.endereco());
                    return tutorRepository.save(tutor);
                })
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tutor não encontrado"));
    }

    public void deletar(Long id) {
        Optional<Tutor> tutor = tutorRepository.findById(id);
        if (tutor.isPresent()) {
            tutor.get().setAtivo(false);
            tutorRepository.save(tutor.get());
        }
    }

    public void reativar(Long id) {
        Optional<Tutor> tutor = tutorRepository.findById(id);
        if (tutor.isPresent()) {
            tutor.get().setAtivo(true);
            tutorRepository.save(tutor.get());
        }
    }
}
