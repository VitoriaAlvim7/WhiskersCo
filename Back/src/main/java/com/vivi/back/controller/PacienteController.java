package com.vivi.back.controller;

import com.vivi.back.dto.HistoricoMedicoDto;
import com.vivi.back.dto.PacienteDto;
import com.vivi.back.form.PacienteForm;
import com.vivi.back.model.Consulta;
import com.vivi.back.model.Paciente;
import com.vivi.back.repository.ConsultaRepository;
import com.vivi.back.service.PacienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pacientes")
public class PacienteController {

    @Autowired
    private PacienteService pacienteService;

    @Autowired
    private ConsultaRepository consultaRepository;

    @PostMapping
    public ResponseEntity<PacienteDto> criar(@RequestBody PacienteForm form) {
        Paciente novoPaciente = pacienteService.salvar(form);
        return new ResponseEntity<>(new PacienteDto(novoPaciente), HttpStatus.CREATED);
    }

    @GetMapping
    public List<PacienteDto> listar() {
        List<Paciente> pacientes = pacienteService.listarPacientes();
        return PacienteDto.converter(pacientes);
    }

    @GetMapping("/inativos")
    public List<PacienteDto> listarInativos() {
        List<Paciente> pacientes = pacienteService.listarInativos();
        return PacienteDto.converter(pacientes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PacienteDto> buscarPorId(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "false") boolean incluirInativo) {
        return (incluirInativo
                ? pacienteService.buscarPacientePorIdIncluindoInativo(id)
                : pacienteService.buscarPacientePorId(id))
                .map(paciente -> ResponseEntity.ok().body(new PacienteDto(paciente)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<PacienteDto> atualizar(@PathVariable Long id, @RequestBody PacienteForm form) {
        Paciente pacienteAtualizado = pacienteService.atualizar(id, form);
        return ResponseEntity.ok(new PacienteDto(pacienteAtualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        pacienteService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/reativar")
    public ResponseEntity<Void> reativar(@PathVariable Long id) {
        pacienteService.reativar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/historico")
    public List<HistoricoMedicoDto> historico(@PathVariable Long id) {
        List<Consulta> consultas = consultaRepository.findByPacienteIdOrderByDataHoraDesc(id);
        return HistoricoMedicoDto.converter(consultas);
    }
}
