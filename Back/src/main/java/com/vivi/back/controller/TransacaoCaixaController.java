package com.vivi.back.controller;

import com.vivi.back.dto.PaginaDto;
import com.vivi.back.dto.RelatorioCaixaDto;
import com.vivi.back.dto.TransacaoCaixaDto;
import com.vivi.back.form.TransacaoCaixaForm;
import com.vivi.back.model.ItemTransacao;
import com.vivi.back.model.TransacaoCaixa;
import com.vivi.back.model.enums.TipoTransacao;
import com.vivi.back.service.TransacaoCaixaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transacoes-caixa")
public class TransacaoCaixaController {

    @Autowired
    private TransacaoCaixaService transacaoCaixaService;

    @PostMapping
    public ResponseEntity<TransacaoCaixaDto> criar(@RequestBody TransacaoCaixaForm form) {
        TransacaoCaixa novaTransacao = transacaoCaixaService.salvar(form);
        List<ItemTransacao> itens = transacaoCaixaService.buscarItensPorTransacao(novaTransacao.getId());
        return new ResponseEntity<>(new TransacaoCaixaDto(novaTransacao, itens), HttpStatus.CREATED);
    }

    @GetMapping
    public List<TransacaoCaixaDto> listar() {
        List<TransacaoCaixa> transacoes = transacaoCaixaService.listarTransacoes();
        return transacoes.stream()
                .map(t -> new TransacaoCaixaDto(t, transacaoCaixaService.buscarItensPorTransacao(t.getId())))
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransacaoCaixaDto> buscarPorId(@PathVariable Long id) {
        return transacaoCaixaService.buscarPorId(id)
                .map(transacao -> {
                    List<ItemTransacao> itens = transacaoCaixaService.buscarItensPorTransacao(id);
                    return ResponseEntity.ok().body(new TransacaoCaixaDto(transacao, itens));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransacaoCaixaDto> atualizar(@PathVariable Long id, @RequestBody TransacaoCaixaForm form) {
        TransacaoCaixa transacaoAtualizada = transacaoCaixaService.atualizar(id, form);
        List<ItemTransacao> itens = transacaoCaixaService.buscarItensPorTransacao(id);
        return ResponseEntity.ok(new TransacaoCaixaDto(transacaoAtualizada, itens));
    }

    @GetMapping("/periodo")
    public PaginaDto<TransacaoCaixaDto> porPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "10") int tamanho) {

        var page = transacaoCaixaService.paginarPorPeriodo(inicio, fim, pagina, tamanho);

        List<Long> ids = page.getContent().stream().map(TransacaoCaixa::getId).toList();
        Map<Long, List<ItemTransacao>> itensPorTransacao = transacaoCaixaService.buscarItensDeTransacoes(ids);

        List<TransacaoCaixaDto> conteudo = page.getContent().stream()
                .map(t -> new TransacaoCaixaDto(t, itensPorTransacao.getOrDefault(t.getId(), List.of())))
                .toList();

        return PaginaDto.de(page, conteudo);
    }

    @GetMapping("/relatorio")
    public RelatorioCaixaDto relatorio(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return transacaoCaixaService.relatorio(inicio, fim);
    }

    @GetMapping("/tipo/{tipo}")
    public List<TransacaoCaixaDto> buscarPorTipo(@PathVariable TipoTransacao tipo) {
        List<TransacaoCaixa> transacoes = transacaoCaixaService.buscarPorTipo(tipo);
        return transacoes.stream()
                .map(t -> new TransacaoCaixaDto(t, transacaoCaixaService.buscarItensPorTransacao(t.getId())))
                .toList();
    }

    @GetMapping("/data/{data}")
    public List<TransacaoCaixaDto> buscarPorData(@PathVariable LocalDate data) {
        List<TransacaoCaixa> transacoes = transacaoCaixaService.buscarPorData(data);
        return transacoes.stream()
                .map(t -> new TransacaoCaixaDto(t, transacaoCaixaService.buscarItensPorTransacao(t.getId())))
                .toList();
    }

    @GetMapping("/funcionario/{funcionarioId}")
    public List<TransacaoCaixaDto> buscarPorFuncionario(@PathVariable Long funcionarioId) {
        List<TransacaoCaixa> transacoes = transacaoCaixaService.buscarPorFuncionario(funcionarioId);
        return transacoes.stream()
                .map(t -> new TransacaoCaixaDto(t, transacaoCaixaService.buscarItensPorTransacao(t.getId())))
                .toList();
    }

    @GetMapping("/total/tipo/{tipo}")
    public ResponseEntity<Double> totalPorTipo(@PathVariable TipoTransacao tipo) {
        Double total = transacaoCaixaService.totalPorTipo(tipo);
        return ResponseEntity.ok(total);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        transacaoCaixaService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
