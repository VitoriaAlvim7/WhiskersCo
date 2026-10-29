package com.vivi.back.service;

import com.vivi.back.exception.RecursoNaoEncontradoException;
import com.vivi.back.form.FaixaAgendaForm;
import com.vivi.back.form.FuncionarioForm;
import com.vivi.back.model.Funcionario;
import com.vivi.back.model.enums.FuncaoFuncionario;
import com.vivi.back.model.enums.StatusFuncionario;
import com.vivi.back.repository.FuncionarioRepository;
import com.vivi.back.model.AgendaFuncionario;
import com.vivi.back.repository.AgendaFuncionarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FuncionarioService {

    private static final Sort POR_NOME = Sort.by(Sort.Direction.ASC, "nome");

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    @Autowired
    private AgendaFuncionarioRepository agendaFuncionarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public Funcionario salvar(FuncionarioForm form) {
        Funcionario funcionario = new Funcionario();
        funcionario.setNome(form.nome());
        funcionario.setEmail(form.email());
        funcionario.setSenha(passwordEncoder.encode(form.senha()));
        funcionario.setFuncao(form.funcao());
        funcionario.setAgenda(form.agenda());
        funcionario.setStatusFuncionario(form.statusFuncionario());
        funcionario.setFotoUrl(form.fotoUrl());
        funcionario.setAtivo(true);
        Funcionario salvo = funcionarioRepository.save(funcionario);
        substituirAgenda(salvo, form.agendaFaixas());
        return salvo;
    }

    public void substituirAgenda(Funcionario funcionario, List<FaixaAgendaForm> faixas) {
        agendaFuncionarioRepository.deleteByFuncionarioId(funcionario.getId());
        if (faixas == null || faixas.isEmpty()) return;

        List<AgendaFuncionario> novas = faixas.stream()
                .filter(f -> f.diaSemana() != null && f.horaInicio() != null && f.horaFim() != null)
                .map(f -> {
                    if (f.horaFim().isBefore(f.horaInicio())) {
                        throw new IllegalArgumentException(
                                "A hora final da agenda nao pode ser antes da inicial.");
                    }
                    return new AgendaFuncionario(null, funcionario, f.diaSemana(), f.horaInicio(), f.horaFim());
                })
                .toList();
        agendaFuncionarioRepository.saveAll(novas);
    }

    public Map<Long, List<AgendaFuncionario>> agendasPorFuncionario() {
        return agendaFuncionarioRepository.findAll().stream()
                .sorted(Comparator.comparing(AgendaFuncionario::getDiaSemana)
                        .thenComparing(AgendaFuncionario::getHoraInicio))
                .collect(Collectors.groupingBy(a -> a.getFuncionario().getId()));
    }

    public List<AgendaFuncionario> agendaDe(Long funcionarioId) {
        return agendaFuncionarioRepository.findByFuncionarioIdOrderByDiaSemanaAscHoraInicioAsc(funcionarioId);
    }

    public List<Funcionario> listarFuncionarios() {
        return listarFuncionarios(null, null);
    }

    public List<Funcionario> listarFuncionarios(FuncaoFuncionario funcao, StatusFuncionario status) {
        return funcionarioRepository.findAll(POR_NOME).stream()
                .filter(f -> f.getAtivo() != null && f.getAtivo())
                .filter(f -> funcao == null || f.getFuncao() == funcao)
                .filter(f -> status == null || f.getStatusFuncionario() == status)
                .toList();
    }

    public List<Funcionario> listarTodos() {
        return funcionarioRepository.findAll(POR_NOME);
    }

    public List<Funcionario> listarInativos() {
        return funcionarioRepository.findAll(POR_NOME).stream()
                .filter(f -> f.getAtivo() != null && !f.getAtivo())
                .toList();
    }

    public Optional<Funcionario> buscarPorId(Long id) {
        Optional<Funcionario> funcionario = funcionarioRepository.findById(id);
        if (funcionario.isPresent() && (funcionario.get().getAtivo() == null || !funcionario.get().getAtivo())) {
            return Optional.empty();
        }
        return funcionario;
    }

    @Transactional
    public Funcionario atualizar(Long id, FuncionarioForm form) {
        return funcionarioRepository.findById(id)
                .map(funcionario -> {
                    funcionario.setNome(form.nome());
                    funcionario.setEmail(form.email());
                    funcionario.setFuncao(form.funcao());
                    funcionario.setAgenda(form.agenda());
                    funcionario.setStatusFuncionario(form.statusFuncionario());
                    funcionario.setFotoUrl(form.fotoUrl());
                    Funcionario atualizado = funcionarioRepository.save(funcionario);
                    substituirAgenda(atualizado, form.agendaFaixas());
                    return atualizado;
                })
                .orElseThrow(() -> new RecursoNaoEncontradoException("Funcionário não encontrado"));
    }

    public boolean alterarSenha(Long id, String senhaAtual, String novaSenha) {
        Funcionario funcionario = funcionarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Funcionário não encontrado"));

        if (!passwordEncoder.matches(senhaAtual, funcionario.getSenha())) {
            return false;
        }

        funcionario.setSenha(passwordEncoder.encode(novaSenha));
        funcionarioRepository.save(funcionario);
        return true;
    }

    public void deletar(Long id) {
        Optional<Funcionario> funcionario = funcionarioRepository.findById(id);
        if (funcionario.isPresent()) {
            funcionario.get().setAtivo(false);
            funcionarioRepository.save(funcionario.get());
        }
    }

    public void reativar(Long id) {
        Optional<Funcionario> funcionario = funcionarioRepository.findById(id);
        if (funcionario.isPresent()) {
            funcionario.get().setAtivo(true);
            funcionarioRepository.save(funcionario.get());
        }
    }
}
