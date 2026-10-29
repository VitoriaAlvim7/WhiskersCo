package com.vivi.back.controller;

import com.vivi.back.dto.ProdutoDto;
import com.vivi.back.form.ProdutoForm;
import com.vivi.back.model.Produto;
import com.vivi.back.model.enums.NaturezaItem;
import com.vivi.back.service.ProdutoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    @Autowired
    private ProdutoService produtoService;

    @PostMapping
    public ResponseEntity<ProdutoDto> criar (@RequestBody ProdutoForm form){
        Produto novoProduto = produtoService.salvar(form);
        return new ResponseEntity<>(new ProdutoDto(novoProduto), HttpStatus.CREATED);
    }

    @GetMapping
    public List<ProdutoDto> listar(@RequestParam(required = false) NaturezaItem natureza){
        List<Produto> produtos = produtoService.listarProdutos(natureza);
        return ProdutoDto.converter(produtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProdutoDto> buscarPorId(@PathVariable Long id){
        return produtoService.buscarPorId(id)
                .map(produto -> ResponseEntity.ok().body(new ProdutoDto(produto)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProdutoDto> atualizar(@PathVariable Long id, @RequestBody ProdutoForm form){
        Produto produtoAtualizado = produtoService.atualizar(id, form);
        return ResponseEntity.ok(new ProdutoDto(produtoAtualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar (@PathVariable Long id) {
        produtoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
