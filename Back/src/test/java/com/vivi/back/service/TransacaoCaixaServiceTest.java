package com.vivi.back.service;

import com.vivi.back.form.ItemTransacaoForm;
import com.vivi.back.form.TransacaoCaixaForm;
import com.vivi.back.model.Funcionario;
import com.vivi.back.model.ItemTransacao;
import com.vivi.back.model.Produto;
import com.vivi.back.model.TransacaoCaixa;
import com.vivi.back.model.enums.NaturezaItem;
import com.vivi.back.model.enums.TipoTransacao;
import com.vivi.back.repository.ConsultaRepository;
import com.vivi.back.repository.FuncionarioRepository;
import com.vivi.back.repository.ItemTransacaoRepository;
import com.vivi.back.repository.ProdutoRepository;
import com.vivi.back.repository.TransacaoCaixaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class TransacaoCaixaServiceTest {

    @Mock private TransacaoCaixaRepository transacaoCaixaRepository;
    @Mock private ItemTransacaoRepository itemTransacaoRepository;
    @Mock private FuncionarioRepository funcionarioRepository;
    @Mock private ConsultaRepository consultaRepository;
    @Mock private ProdutoRepository produtoRepository;
    @Mock private NotificacaoService notificacaoService;

    private ProdutoService produtoService;
    private TransacaoCaixaService service;

    private Funcionario funcionario;

    @BeforeEach
    void montarServicos() {
        produtoService = new ProdutoService();
        ReflectionTestUtils.setField(produtoService, "produtoRepository", produtoRepository);
        ReflectionTestUtils.setField(produtoService, "itemTransacaoRepository", itemTransacaoRepository);
        ReflectionTestUtils.setField(produtoService, "notificacaoService", notificacaoService);

        service = new TransacaoCaixaService();
        ReflectionTestUtils.setField(service, "transacaoCaixaRepository", transacaoCaixaRepository);
        ReflectionTestUtils.setField(service, "itemTransacaoRepository", itemTransacaoRepository);
        ReflectionTestUtils.setField(service, "funcionarioRepository", funcionarioRepository);
        ReflectionTestUtils.setField(service, "consultaRepository", consultaRepository);
        ReflectionTestUtils.setField(service, "produtoRepository", produtoRepository);
        ReflectionTestUtils.setField(service, "produtoService", produtoService);

        funcionario = new Funcionario();
        funcionario.setId(1L);
        funcionario.setNome("Recepção");

        when(funcionarioRepository.findById(1L)).thenReturn(Optional.of(funcionario));
        when(transacaoCaixaRepository.save(any(TransacaoCaixa.class)))
                .thenAnswer(chamada -> chamada.getArgument(0));
        when(produtoRepository.save(any(Produto.class)))
                .thenAnswer(chamada -> chamada.getArgument(0));
    }

    private Produto produto(long id, String nome, Integer quantidade, NaturezaItem natureza) {
        Produto produto = new Produto();
        produto.setId(id);
        produto.setNome(nome);
        produto.setPreco(50.0);
        produto.setQuantidade(quantidade);
        produto.setNaturezaItem(natureza);
        when(produtoRepository.findById(id)).thenReturn(Optional.of(produto));
        return produto;
    }

    private TransacaoCaixaForm venda(TipoTransacao tipo, ItemTransacaoForm... itens) {
        return new TransacaoCaixaForm(
                LocalDateTime.now(), "PIX", tipo, 1L, null, 0.0, List.of(itens));
    }

    @Test
    @DisplayName("venda de produto desconta a quantidade vendida do estoque")
    void vendaBaixaEstoque() {
        Produto racao = produto(10L, "Ração 10kg", 8, NaturezaItem.PRODUTO);

        service.salvar(venda(TipoTransacao.ENTRADA, new ItemTransacaoForm(10L, 3)));

        assertThat(racao.getQuantidade()).isEqualTo(5);
        verify(produtoRepository).save(racao);
    }

    @Test
    @DisplayName("venda soma o valor dos itens no total da transação")
    void vendaSomaValorDosItens() {
        produto(10L, "Ração 10kg", 8, NaturezaItem.PRODUTO);

        TransacaoCaixa salva = service.salvar(
                venda(TipoTransacao.ENTRADA, new ItemTransacaoForm(10L, 3)));

        assertThat(salva.getValorTotal()).isEqualTo(150.0);
    }

    @Test
    @DisplayName("E1: venda acima do saldo é recusada e nada é gravado")
    void vendaSemSaldoNaoGravaNada() {
        Produto racao = produto(10L, "Ração 10kg", 2, NaturezaItem.PRODUTO);

        assertThatThrownBy(() ->
                service.salvar(venda(TipoTransacao.ENTRADA, new ItemTransacaoForm(10L, 3))))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Estoque insuficiente");

        assertThat(racao.getQuantidade()).isEqualTo(2);
        verify(transacaoCaixaRepository, never()).save(any());
        verify(itemTransacaoRepository, never()).save(any());
    }

    @Test
    @DisplayName("carrinho é validado inteiro: item sem saldo impede a venda toda")
    void umItemSemSaldoBloqueiaOCarrinhoInteiro() {
        Produto shampoo = produto(10L, "Shampoo", 10, NaturezaItem.PRODUTO);
        produto(11L, "Coleira", 1, NaturezaItem.PRODUTO);

        assertThatThrownBy(() -> service.salvar(venda(
                TipoTransacao.ENTRADA,
                new ItemTransacaoForm(10L, 2),
                new ItemTransacaoForm(11L, 5))))
                .isInstanceOf(IllegalStateException.class);

        assertThat(shampoo.getQuantidade()).isEqualTo(10);
        verify(transacaoCaixaRepository, never()).save(any());
    }

    @Test
    @DisplayName("serviço não tem estoque e passa sem baixa")
    void servicoNaoBaixaEstoque() {
        Produto consulta = produto(20L, "Consulta clínica", null, NaturezaItem.SERVICO);

        service.salvar(venda(TipoTransacao.ENTRADA, new ItemTransacaoForm(20L, 1)));

        assertThat(consulta.getQuantidade()).isNull();
        verify(produtoRepository, never()).save(any());
    }

    @Test
    @DisplayName("saída (despesa) não mexe no estoque")
    void saidaNaoBaixaEstoque() {
        Produto racao = produto(10L, "Ração 10kg", 8, NaturezaItem.PRODUTO);

        service.salvar(venda(TipoTransacao.SAIDA, new ItemTransacaoForm(10L, 3)));

        assertThat(racao.getQuantidade()).isEqualTo(8);
    }

    @Test
    @DisplayName("excluir uma venda devolve os itens ao estoque")
    void exclusaoDevolveEstoque() {
        Produto racao = produto(10L, "Ração 10kg", 5, NaturezaItem.PRODUTO);

        TransacaoCaixa transacao = new TransacaoCaixa();
        transacao.setId(99L);
        transacao.setTipo(TipoTransacao.ENTRADA);

        ItemTransacao item = new ItemTransacao();
        item.setProduto(racao);
        item.setQuantidade(3);
        item.setTransacao(transacao);

        when(transacaoCaixaRepository.findById(99L)).thenReturn(Optional.of(transacao));
        when(itemTransacaoRepository.findByTransacaoIdOrderByIdAsc(99L)).thenReturn(List.of(item));

        service.deletar(99L);

        assertThat(racao.getQuantidade()).isEqualTo(8);
        verify(transacaoCaixaRepository).deleteById(99L);
    }
}
