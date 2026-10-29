package com.vivi.back.service;

import com.vivi.back.exception.RecursoNaoEncontradoException;
import com.vivi.back.dto.PacienteDto;
import com.vivi.back.form.AnimalAdocaoForm;
import com.vivi.back.model.AnimalAdocao;
import com.vivi.back.model.Paciente;
import com.vivi.back.model.Tutor;
import com.vivi.back.model.enums.StatusAdocao;
import com.vivi.back.repository.AnimalAdocaoRepository;
import com.vivi.back.repository.PacienteRepository;
import com.vivi.back.repository.TutorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AnimalAdocaoService {

    private static final Sort POR_NOME = Sort.by(Sort.Direction.ASC, "nome");

    @Autowired
    private AnimalAdocaoRepository animalAdocaoRepository;

    @Autowired
    private TutorRepository tutorRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    public AnimalAdocao salvar(AnimalAdocaoForm form) {
        AnimalAdocao animal = new AnimalAdocao(
                null,
                form.nome(),
                form.raca(),
                form.idade(),
                form.unidadeIdade(),
                form.peso(),
                form.alergias(),
                form.informacoes(),
                form.statusAdocao(),
                true,
                form.fotoUrl()
        );
        return animalAdocaoRepository.save(animal);
    }

    public AnimalAdocao salvar(AnimalAdocao animal) {
        return animalAdocaoRepository.save(animal);
    }

    public List<AnimalAdocao> listarAnimaisAtivos(){
        return animalAdocaoRepository.findAll(POR_NOME).stream()
                .filter(a -> a.getAtivo() != null && a.getAtivo())
                .toList();
    }

    public List<AnimalAdocao> listarTodos(){
        return animalAdocaoRepository.findAll(POR_NOME);
    }

    public List<AnimalAdocao> listarInativos(){
        return animalAdocaoRepository.findAll(POR_NOME).stream()
                .filter(a -> a.getAtivo() != null && !a.getAtivo())
                .toList();
    }

    public Optional<AnimalAdocao> buscarPorId(Long id) {
        Optional<AnimalAdocao> animal = animalAdocaoRepository.findById(id);
        if (animal.isPresent() && (animal.get().getAtivo() == null || !animal.get().getAtivo())) {
            return Optional.empty();
        }
        return animal;
    }

    public AnimalAdocao atualizar(Long id, AnimalAdocaoForm form) {
        return animalAdocaoRepository.findById(id)
                .map(animal -> {
                    animal.setNome(form.nome());
                    animal.setRaca(form.raca());
                    animal.setIdade(form.idade());
                    animal.setUnidadeIdade(form.unidadeIdade());
                    animal.setPeso(form.peso());
                    animal.setAlergias(form.alergias());
                    animal.setInformacoes(form.informacoes());
                    animal.setStatusAdocao(form.statusAdocao());
                    animal.setFotoUrl(form.fotoUrl());
                    return animalAdocaoRepository.save(animal);
                })
                .orElseThrow(() -> new RecursoNaoEncontradoException("Animal não encontrado"));
    }

    public void deletar(Long id) {
        Optional<AnimalAdocao> animal = animalAdocaoRepository.findById(id);
        if (animal.isPresent()) {
            animal.get().setAtivo(false);
            animalAdocaoRepository.save(animal.get());
        }
    }

    public void reativar(Long id) {
        Optional<AnimalAdocao> animal = animalAdocaoRepository.findById(id);
        if (animal.isPresent()) {
            animal.get().setAtivo(true);
            animalAdocaoRepository.save(animal.get());
        }
    }

    private String motivoNaoAdotavel(StatusAdocao status) {
        if (StatusAdocao.ADOTADO.equals(status)) {
            return "Este animal já foi adotado.";
        }
        if (StatusAdocao.EM_TRATAMENTO.equals(status)) {
            return "Animal em tratamento não pode ser adotado.";
        }
        return "Este animal não está disponível para adoção.";
    }

    public PacienteDto adotar(Long animalId, Long tutorId) {
        AnimalAdocao animal = animalAdocaoRepository.findById(animalId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Animal não encontrado"));

        if (!StatusAdocao.DISPONIVEL.equals(animal.getStatusAdocao())) {
            throw new IllegalStateException(motivoNaoAdotavel(animal.getStatusAdocao()));
        }

        Tutor tutor = tutorRepository.findById(tutorId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tutor não encontrado"));

        Paciente paciente = new Paciente(
                null,
                animal.getNome(),
                animal.getRaca(),
                animal.getIdade(),
                animal.getUnidadeIdade(),
                animal.getPeso(),
                animal.getAlergias(),
                animal.getInformacoes(),
                true,
                tutor,
                animal.getFotoUrl()
        );

        Paciente novoPaciente = pacienteRepository.save(paciente);

        animal.setStatusAdocao(StatusAdocao.ADOTADO);
        animalAdocaoRepository.save(animal);

        return new PacienteDto(novoPaciente);
    }
}
