package com.vivi.back.controller;

import com.vivi.back.dto.TutorDto;
import com.vivi.back.form.TutorForm;
import com.vivi.back.model.Tutor;
import com.vivi.back.service.TutorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tutores")
public class TutorController {

    @Autowired
    private TutorService tutorService;

    @PostMapping
    public ResponseEntity<TutorDto> criar(@RequestBody TutorForm form) {
        Tutor novoTutor = tutorService.salvar(form);
        return new ResponseEntity<>(new TutorDto(novoTutor), HttpStatus.CREATED);
    }

    @GetMapping
    public List<TutorDto> listar() {
        List<Tutor> tutores = tutorService.listarTutores();
        return TutorDto.converter(tutores);
    }

    @GetMapping("/inativos")
    public List<TutorDto> listarInativos() {
        List<Tutor> tutores = tutorService.listarInativos();
        return TutorDto.converter(tutores);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TutorDto> buscarPorId(@PathVariable Long id) {
        return tutorService.buscarPorId(id)
                .map(tutor -> ResponseEntity.ok().body(new TutorDto(tutor)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<TutorDto> atualizar(@PathVariable Long id, @RequestBody TutorForm form) {
        Tutor tutorAtualizado = tutorService.atualizar(id, form);
        return ResponseEntity.ok(new TutorDto(tutorAtualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        tutorService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/reativar")
    public ResponseEntity<Void> reativar(@PathVariable Long id) {
        tutorService.reativar(id);
        return ResponseEntity.noContent().build();
    }
}
