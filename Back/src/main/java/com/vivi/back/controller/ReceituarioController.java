package com.vivi.back.controller;

import com.vivi.back.dto.ReceituarioDto;
import com.vivi.back.form.ReceituarioForm;
import com.vivi.back.model.Receituario;
import com.vivi.back.service.ReceituarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/receituarios")
public class ReceituarioController {

    @Autowired
    private ReceituarioService receituarioService;

    @PostMapping
    public ResponseEntity<ReceituarioDto> criar(@RequestBody ReceituarioForm form) {
        Receituario novoReceituario = receituarioService.salvar(form);
        return new ResponseEntity<>(new ReceituarioDto(novoReceituario), HttpStatus.CREATED);
    }

    @GetMapping
    public List<ReceituarioDto> listar() {
        List<Receituario> receituarios = receituarioService.listarReceituarios();
        return ReceituarioDto.converter(receituarios);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReceituarioDto> buscarPorId(@PathVariable Long id) {
        return receituarioService.buscarPorId(id)
                .map(receituario -> ResponseEntity.ok().body(new ReceituarioDto(receituario)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReceituarioDto> atualizar(@PathVariable Long id, @RequestBody ReceituarioForm form) {
        Receituario receituarioAtualizado = receituarioService.atualizar(id, form);
        return ResponseEntity.ok(new ReceituarioDto(receituarioAtualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        receituarioService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
