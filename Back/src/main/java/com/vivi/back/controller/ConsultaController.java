package com.vivi.back.controller;

import com.vivi.back.dto.ConsultaDto;
import com.vivi.back.dto.PaginaDto;
import com.vivi.back.dto.RelatorioAgendaDto;
import com.vivi.back.form.ConsultaForm;
import com.vivi.back.form.StatusConsultaForm;
import com.vivi.back.model.Consulta;
import com.vivi.back.service.ConsultaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/consultas")
public class ConsultaController {

    @Autowired
    private ConsultaService consultaService;

    @PostMapping
    public ResponseEntity<ConsultaDto> criar(@RequestBody ConsultaForm form) {
        Consulta novaConsulta = consultaService.salvar(form);
        return new ResponseEntity<>(new ConsultaDto(novaConsulta), HttpStatus.CREATED);
    }

    @GetMapping
    public List<ConsultaDto> listar() {
        List<Consulta> consultas = consultaService.listarConsultas();
        return ConsultaDto.converter(consultas);
    }

    @GetMapping("/periodo")
    public PaginaDto<ConsultaDto> porPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "10") int tamanho) {

        var page = consultaService.paginarPorPeriodo(inicio, fim, pagina, tamanho);
        return PaginaDto.de(page, ConsultaDto.converter(page.getContent()));
    }

    @GetMapping("/relatorio")
    public RelatorioAgendaDto relatorio(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return consultaService.relatorio(inicio, fim);
    }

    @GetMapping("/hoje")
    public List<ConsultaDto> listarHoje() {
        List<Consulta> consultas = consultaService.listarHoje();
        return ConsultaDto.converter(consultas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConsultaDto> buscarPorId(@PathVariable Long id) {
        return consultaService.buscarPorId(id)
                .map(consulta -> ResponseEntity.ok().body(new ConsultaDto(consulta)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConsultaDto> atualizar(@PathVariable Long id, @RequestBody ConsultaForm form) {
        Consulta consultaAtualizada = consultaService.atualizar(id, form);
        return ResponseEntity.ok(new ConsultaDto(consultaAtualizada));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ConsultaDto> atualizarStatus(@PathVariable Long id, @RequestBody StatusConsultaForm form) {
        Consulta consultaAtualizada = consultaService.atualizarStatus(id, form.status());
        return ResponseEntity.ok(new ConsultaDto(consultaAtualizada));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        consultaService.deletar(id);
        return ResponseEntity.noContent().build();
    }

}
