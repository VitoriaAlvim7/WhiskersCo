package com.vivi.back.arquivo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/arquivos")
public class ArquivoController {

    @Autowired
    private ArmazenamentoFotoService armazenamentoFotoService;

    @PostMapping("/fotos")
    public ResponseEntity<Map<String, String>> enviarFoto(@RequestParam("arquivo") MultipartFile arquivo) {
        String url = armazenamentoFotoService.guardar(arquivo);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("url", url));
    }
}
