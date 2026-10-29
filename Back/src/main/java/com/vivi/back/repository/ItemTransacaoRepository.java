package com.vivi.back.repository;

import com.vivi.back.model.ItemTransacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ItemTransacaoRepository extends JpaRepository<ItemTransacao, Long> {

    boolean existsByProdutoId(Long produtoId);

    List<ItemTransacao> findByTransacaoIdOrderByIdAsc(Long transacaoId);

    List<ItemTransacao> findByTransacaoIdInOrderByIdAsc(Collection<Long> transacaoIds);
}
