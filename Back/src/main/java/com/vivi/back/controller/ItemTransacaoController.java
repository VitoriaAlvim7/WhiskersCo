package com.vivi.back.controller;

import com.vivi.back.dto.ItemTransacaoDto;
import com.vivi.back.model.ItemTransacao;
import com.vivi.back.service.ItemTransacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/itens-transacao")
public class ItemTransacaoController {

    @Autowired
    private ItemTransacaoService itemTransacaoService;

    @GetMapping("/{id}")
    public ResponseEntity<ItemTransacaoDto> buscarPorId(@PathVariable Long id) {
        return itemTransacaoService.buscarPorId(id)
                .map(item -> ResponseEntity.ok().body(new ItemTransacaoDto(item)))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        itemTransacaoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
