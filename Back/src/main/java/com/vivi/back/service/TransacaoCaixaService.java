package com.vivi.back.service;

import com.vivi.back.exception.RecursoNaoEncontradoException;
import com.vivi.back.form.TransacaoCaixaForm;
import com.vivi.back.model.Consulta;
import com.vivi.back.model.Funcionario;
import com.vivi.back.model.ItemTransacao;
import com.vivi.back.model.Produto;
import com.vivi.back.model.TransacaoCaixa;
import com.vivi.back.dto.ItemResumoDto;
import com.vivi.back.dto.RelatorioCaixaDto;
import com.vivi.back.model.enums.TipoTransacao;
import com.vivi.back.repository.ConsultaRepository;
import com.vivi.back.repository.FuncionarioRepository;
import com.vivi.back.repository.ItemTransacaoRepository;
import com.vivi.back.repository.ProdutoRepository;
import com.vivi.back.repository.TransacaoCaixaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Optional;
import java.time.LocalDate;
import java.time.LocalTime;

@Service
public class TransacaoCaixaService {

    private static final Sort POR_DATA_HORA_DESC = Sort.by(Sort.Direction.DESC, "dataHora");

    @Autowired
    private TransacaoCaixaRepository transacaoCaixaRepository;

    @Autowired
    private ItemTransacaoRepository itemTransacaoRepository;

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    @Autowired
    private ConsultaRepository consultaRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private ProdutoService produtoService;

    @Transactional
    public TransacaoCaixa salvar(TransacaoCaixaForm form) {
        Funcionario funcionario = funcionarioRepository.findById(form.funcionarioId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Funcionário não encontrado"));

        Consulta consulta = null;
        if (form.consultaId() != null) {
            consulta = consultaRepository.findById(form.consultaId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Consulta não encontrada"));
        }

        List<ItemResolvido> itens = resolverItens(form.itens());

        boolean baixaEstoque = form.tipo() == TipoTransacao.ENTRADA;
        if (baixaEstoque) {
            itens.forEach(i -> produtoService.validarEstoqueSuficiente(i.produto(), i.quantidade()));
        }

        double valorTotal = form.valor() != null ? form.valor() : 0.0;
        for (ItemResolvido item : itens) {
            valorTotal += item.produto().getPreco() * item.quantidade();
        }

        TransacaoCaixa transacao = new TransacaoCaixa(
                null,
                form.dataHora(),
                valorTotal,
                form.metodoPagamento(),
                form.tipo(),
                funcionario,
                consulta
        );

        TransacaoCaixa transacaoSalva = transacaoCaixaRepository.save(transacao);

        for (ItemResolvido item : itens) {
            itemTransacaoRepository.save(new ItemTransacao(
                    null,
                    item.quantidade(),
                    transacaoSalva,
                    item.produto()
            ));
            if (baixaEstoque) {
                produtoService.baixarEstoque(item.produto(), item.quantidade());
            }
        }

        return transacaoSalva;
    }

    private record ItemResolvido(Produto produto, int quantidade) {}

    private List<ItemResolvido> resolverItens(List<com.vivi.back.form.ItemTransacaoForm> itensForm) {
        if (itensForm == null) return List.of();

        return itensForm.stream()
                .map(itemForm -> {
                    Produto produto = produtoRepository.findById(itemForm.produtoId())
                            .orElseThrow(() -> new RecursoNaoEncontradoException("Produto não encontrado"));
                    int quantidade = itemForm.quantidade() != null ? itemForm.quantidade() : 0;
                    if (quantidade <= 0) {
                        throw new IllegalArgumentException(
                                "Quantidade inválida para " + produto.getNome() + ".");
                    }
                    return new ItemResolvido(produto, quantidade);
                })
                .toList();
    }

    public List<TransacaoCaixa> listarTransacoes() {
        return transacaoCaixaRepository.findAll(POR_DATA_HORA_DESC);
    }

    public Optional<TransacaoCaixa> buscarPorId(Long id) {
        return transacaoCaixaRepository.findById(id);
    }

    public TransacaoCaixa atualizar(Long id, TransacaoCaixaForm form) {
        return transacaoCaixaRepository.findById(id)
                .map(transacao -> {
                    Funcionario funcionario = funcionarioRepository.findById(form.funcionarioId())
                            .orElseThrow(() -> new RecursoNaoEncontradoException("Funcionário não encontrado"));

                    Consulta consulta = null;
                    if (form.consultaId() != null) {
                        consulta = consultaRepository.findById(form.consultaId())
                                .orElseThrow(() -> new RecursoNaoEncontradoException("Consulta não encontrada"));
                    }

                    transacao.setDataHora(form.dataHora());
                    transacao.setMetodoPagamento(form.metodoPagamento());
                    transacao.setTipo(form.tipo());
                    transacao.setFuncionario(funcionario);
                    transacao.setConsulta(consulta);
                    return transacaoCaixaRepository.save(transacao);
                })
                .orElseThrow(() -> new RecursoNaoEncontradoException("Transação não encontrada"));
    }

    public List<ItemTransacao> buscarItensPorTransacao(Long transacaoId) {
        return itemTransacaoRepository.findByTransacaoIdOrderByIdAsc(transacaoId);
    }

    public Map<Long, List<ItemTransacao>> buscarItensDeTransacoes(List<Long> transacaoIds) {
        if (transacaoIds.isEmpty()) return Map.of();
        return itemTransacaoRepository.findByTransacaoIdInOrderByIdAsc(transacaoIds).stream()
                .collect(Collectors.groupingBy(item -> item.getTransacao().getId()));
    }

    public Page<TransacaoCaixa> paginarPorPeriodo(LocalDate inicio, LocalDate fim, int pagina, int tamanho) {
        Pageable pageable = PageRequest.of(Math.max(0, pagina), Math.max(1, tamanho), POR_DATA_HORA_DESC);
        return transacaoCaixaRepository.findByDataHoraBetween(inicio.atStartOfDay(), fim.atTime(LocalTime.MAX), pageable);
    }

    public RelatorioCaixaDto relatorio(LocalDate inicio, LocalDate fim) {
        var de = inicio.atStartOfDay();
        var ate = fim.atTime(LocalTime.MAX);

        double entradas = transacaoCaixaRepository.somarPorTipoNoPeriodo(TipoTransacao.ENTRADA, de, ate);
        double saidas = transacaoCaixaRepository.somarPorTipoNoPeriodo(TipoTransacao.SAIDA, de, ate);
        List<ItemResumoDto> itens = transacaoCaixaRepository.resumirItensNoPeriodo(de, ate);

        return new RelatorioCaixaDto(
                inicio,
                fim,
                entradas,
                saidas,
                entradas - saidas,
                transacaoCaixaRepository.countByTipoAndDataHoraBetween(TipoTransacao.ENTRADA, de, ate),
                transacaoCaixaRepository.countByTipoAndDataHoraBetween(TipoTransacao.SAIDA, de, ate),
                itens
        );
    }

    public List<TransacaoCaixa> buscarPorTipo(TipoTransacao tipo) {
        return transacaoCaixaRepository.findAll(POR_DATA_HORA_DESC).stream()
                .filter(t -> t.getTipo() == tipo)
                .toList();
    }

    public List<TransacaoCaixa> buscarPorData(LocalDate data) {
        return transacaoCaixaRepository.findAll(POR_DATA_HORA_DESC).stream()
                .filter(t -> t.getDataHora().toLocalDate().equals(data))
                .toList();
    }

    public List<TransacaoCaixa> buscarPorFuncionario(Long funcionarioId) {
        return transacaoCaixaRepository.findAll(POR_DATA_HORA_DESC).stream()
                .filter(t -> t.getFuncionario().getId().equals(funcionarioId))
                .toList();
    }

    public Double totalPorTipo(TipoTransacao tipo) {
        return transacaoCaixaRepository.findAll(POR_DATA_HORA_DESC).stream()
                .filter(t -> t.getTipo() == tipo)
                .mapToDouble(TransacaoCaixa::getValorTotal)
                .sum();
    }

    @Transactional
    public void deletar(Long id) {
        Optional<TransacaoCaixa> encontrada = transacaoCaixaRepository.findById(id);
        if (encontrada.isEmpty()) return;

        TransacaoCaixa transacao = encontrada.get();
        List<ItemTransacao> itens = buscarItensPorTransacao(id);

        if (transacao.getTipo() == TipoTransacao.ENTRADA) {
            itens.forEach(item ->
                    produtoService.devolverEstoque(item.getProduto(), item.getQuantidade()));
        }

        itemTransacaoRepository.deleteAll(itens);
        transacaoCaixaRepository.deleteById(id);
    }
}
