package com.vivi.back.controller;

import com.vivi.back.dto.FuncionarioDto;
import com.vivi.back.form.AlterarSenhaForm;
import com.vivi.back.form.FuncionarioForm;
import com.vivi.back.model.AgendaFuncionario;
import com.vivi.back.model.Funcionario;
import com.vivi.back.model.enums.FuncaoFuncionario;
import com.vivi.back.model.enums.StatusFuncionario;
import com.vivi.back.service.FuncionarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/funcionarios")
public class FuncionarioController {

    @Autowired
    private FuncionarioService funcionarioService;

    @PostMapping
    public ResponseEntity<FuncionarioDto> criar(@RequestBody FuncionarioForm form) {
        Funcionario novoFuncionario = funcionarioService.salvar(form);
        return new ResponseEntity<>(new FuncionarioDto(novoFuncionario, funcionarioService.agendaDe(novoFuncionario.getId())), HttpStatus.CREATED);
    }

    @GetMapping
    public List<FuncionarioDto> listar(
            @RequestParam(required = false) FuncaoFuncionario funcao,
            @RequestParam(required = false) StatusFuncionario status) {
        List<Funcionario> funcionarios = funcionarioService.listarFuncionarios(funcao, status);
        Map<Long, List<AgendaFuncionario>> agendas = funcionarioService.agendasPorFuncionario();
        return funcionarios.stream()
                .map(f -> new FuncionarioDto(f, agendas.getOrDefault(f.getId(), List.of())))
                .toList();
    }

    @GetMapping("/inativos")
    public List<FuncionarioDto> listarInativos() {
        List<Funcionario> funcionarios = funcionarioService.listarInativos();
        return FuncionarioDto.converter(funcionarios);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FuncionarioDto> buscarPorId(@PathVariable Long id) {
        Optional<Funcionario> funcionario = funcionarioService.buscarPorId(id);
        return funcionario.map(f -> ResponseEntity.ok(new FuncionarioDto(f, funcionarioService.agendaDe(f.getId()))))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<FuncionarioDto> atualizar(@PathVariable Long id, @RequestBody FuncionarioForm form) {
        Funcionario funcionarioAtualizado = funcionarioService.atualizar(id, form);
        return ResponseEntity.ok(new FuncionarioDto(funcionarioAtualizado, funcionarioService.agendaDe(id)));
    }

    @PatchMapping("/{id}/senha")
    public ResponseEntity<?> alterarSenha(@PathVariable Long id, @RequestBody AlterarSenhaForm form) {
        boolean ok = funcionarioService.alterarSenha(id, form.senhaAtual(), form.novaSenha());
        if (!ok) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("erro", "Senha atual incorreta"));
        }
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        funcionarioService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/reativar")
    public ResponseEntity<Void> reativar(@PathVariable Long id) {
        funcionarioService.reativar(id);
        return ResponseEntity.noContent().build();
    }
}
