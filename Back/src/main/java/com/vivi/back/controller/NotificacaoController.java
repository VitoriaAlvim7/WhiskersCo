package com.vivi.back.controller;

import com.vivi.back.dto.NotificacaoDto;
import com.vivi.back.service.NotificacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notificacoes")
public class NotificacaoController {

    @Autowired
    private NotificacaoService notificacaoService;

    @GetMapping
    public List<NotificacaoDto> listar() {
        return NotificacaoDto.converter(notificacaoService.listar());
    }

    @GetMapping("/nao-lidas")
    public Map<String, Long> contarNaoLidas() {
        return Map.of("total", notificacaoService.contarNaoLidas());
    }

    @PutMapping("/lidas")
    public ResponseEntity<Void> marcarTodasComoLidas() {
        notificacaoService.marcarTodasComoLidas();
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        notificacaoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
