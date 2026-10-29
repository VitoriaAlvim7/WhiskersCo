package com.vivi.back.service;

import com.vivi.back.exception.RecursoNaoEncontradoException;
import com.vivi.back.form.ProdutoForm;
import com.vivi.back.model.Produto;
import com.vivi.back.model.enums.NaturezaItem;
import com.vivi.back.model.enums.TipoNotificacao;
import com.vivi.back.repository.ItemTransacaoRepository;
import com.vivi.back.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProdutoService {

    private static final Sort POR_NOME = Sort.by(Sort.Direction.ASC, "nome");

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private ItemTransacaoRepository itemTransacaoRepository;

    @Autowired
    private NotificacaoService notificacaoService;

    @Value("${app.estoque.minimo:5}")
    private int estoqueMinimo;

    public Produto salvar(ProdutoForm form) {
        NaturezaItem natureza = naturezaOu(form.naturezaItem());
        Produto produto = new Produto(
                null,
                form.nome(),
                form.descricao(),
                form.preco(),
                natureza == NaturezaItem.SERVICO ? null : form.quantidadeEfetiva(),
                form.tipoProduto(),
                natureza,
                natureza == NaturezaItem.SERVICO ? form.tipoServico() : null,
                form.fotoUrl()
        );
        Produto salvo = produtoRepository.save(produto);
        avisarSeEstoqueBaixo(salvo);
        return salvo;
    }

    public boolean movimentaEstoque(Produto produto) {
        return produto.getNaturezaItem() != NaturezaItem.SERVICO
                && produto.getQuantidade() != null;
    }

    public void validarEstoqueSuficiente(Produto produto, int quantidade) {
        if (!movimentaEstoque(produto)) return;

        if (produto.getQuantidade() < quantidade) {
            throw new IllegalStateException(
                    "Estoque insuficiente de " + produto.getNome()
                            + ": pedido " + quantidade
                            + ", disponível " + produto.getQuantidade() + ".");
        }
    }

    public void baixarEstoque(Produto produto, int quantidade) {
        if (!movimentaEstoque(produto)) return;

        validarEstoqueSuficiente(produto, quantidade);
        produto.setQuantidade(produto.getQuantidade() - quantidade);
        Produto salvo = produtoRepository.save(produto);
        avisarSeEstoqueBaixo(salvo);
    }

    public void devolverEstoque(Produto produto, int quantidade) {
        if (!movimentaEstoque(produto)) return;

        produto.setQuantidade(produto.getQuantidade() + quantidade);
        produtoRepository.save(produto);
    }

    private void avisarSeEstoqueBaixo(Produto produto) {
        if (produto.getNaturezaItem() == NaturezaItem.SERVICO) return;
        Integer quantidade = produto.getQuantidade();
        if (quantidade == null || quantidade > estoqueMinimo) return;

        notificacaoService.registrar(
                TipoNotificacao.ESTOQUE_BAIXO,
                "Estoque baixo: " + produto.getNome() + " (" + quantidade + " restantes)");
    }

    private NaturezaItem naturezaOu(NaturezaItem natureza) {
        return natureza != null ? natureza : NaturezaItem.PRODUTO;
    }

    public List<Produto> listarProdutos() {
        return listarProdutos(null);
    }

    public List<Produto> listarProdutos(NaturezaItem natureza) {
        return produtoRepository.findAll(POR_NOME).stream()
                .filter(p -> natureza == null || p.getNaturezaItem() == natureza)
                .toList();
    }

    public Optional<Produto> buscarPorId(Long id) {
        return produtoRepository.findById(id);
    }

    public Produto atualizar(Long id, ProdutoForm form) {
        return produtoRepository.findById(id)
                .map(produto -> {
                    NaturezaItem natureza = naturezaOu(form.naturezaItem());
                    produto.setNome(form.nome());
                    produto.setDescricao(form.descricao());
                    produto.setPreco(form.preco());
                    produto.setQuantidade(natureza == NaturezaItem.SERVICO ? null : form.quantidadeEfetiva());
                    produto.setTipoProduto(form.tipoProduto());
                    produto.setNaturezaItem(natureza);
                    produto.setTipoServico(natureza == NaturezaItem.SERVICO ? form.tipoServico() : null);
                    produto.setFotoUrl(form.fotoUrl());
                    Produto atualizado = produtoRepository.save(produto);
                    avisarSeEstoqueBaixo(atualizado);
                    return atualizado;
                })
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto não encontrado"));
    }

    public void deletar(Long id) {
        if (!produtoRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Produto não encontrado");
        }
        if (itemTransacaoRepository.existsByProdutoId(id)) {
            throw new IllegalStateException(
                    "Este produto já foi usado em transações do caixa e não pode ser excluído.");
        }
        produtoRepository.deleteById(id);
    }
}
