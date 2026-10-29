package com.vivi.back.controller;

import com.vivi.back.dto.AnimalAdocaoDto;
import com.vivi.back.dto.PacienteDto;
import com.vivi.back.form.AdotarForm;
import com.vivi.back.form.AnimalAdocaoForm;
import com.vivi.back.model.AnimalAdocao;
import com.vivi.back.service.AnimalAdocaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/animais-adocao")
public class AnimalAdocaoController {

    @Autowired
    private AnimalAdocaoService animalAdocaoService;

    @PostMapping
    public ResponseEntity<AnimalAdocaoDto> criar(@RequestBody AnimalAdocaoForm form) {
        AnimalAdocao novoAnimal = animalAdocaoService.salvar(form);
        return new ResponseEntity<>(new AnimalAdocaoDto(novoAnimal), HttpStatus.CREATED);
    }

    @GetMapping
    public List<AnimalAdocaoDto> listar() {
        List<AnimalAdocao> animais = animalAdocaoService.listarAnimaisAtivos();
        return AnimalAdocaoDto.converter(animais);
    }

    @GetMapping("/inativos")
    public List<AnimalAdocaoDto> listarInativos() {
        List<AnimalAdocao> animais = animalAdocaoService.listarInativos();
        return AnimalAdocaoDto.converter(animais);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnimalAdocaoDto> buscarPorId(@PathVariable Long id) {
        return animalAdocaoService.buscarPorId(id)
            .map(animal -> ResponseEntity.ok().body(new AnimalAdocaoDto(animal)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnimalAdocaoDto> atualizar(@PathVariable Long id, @RequestBody AnimalAdocaoForm form) {
        AnimalAdocao animalAtualizado = animalAdocaoService.atualizar(id, form);
        return ResponseEntity.ok(new AnimalAdocaoDto(animalAtualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        animalAdocaoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/reativar")
    public ResponseEntity<Void> reativar(@PathVariable Long id) {
        animalAdocaoService.reativar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/adotar")
    public ResponseEntity<?> adotar(@PathVariable Long id, @RequestBody AdotarForm form) {
        try {
            PacienteDto pacienteDto = animalAdocaoService.adotar(id, form.tutorId());
            return new ResponseEntity<>(pacienteDto, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("erro", e.getMessage()));
        }
    }
}
