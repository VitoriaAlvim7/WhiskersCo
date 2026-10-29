package com.vivi.back.repository;

import com.vivi.back.dto.ItemResumoDto;
import com.vivi.back.model.TransacaoCaixa;
import com.vivi.back.model.enums.TipoTransacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransacaoCaixaRepository extends JpaRepository<TransacaoCaixa, Long> {

    boolean existsByConsultaId(Long consultaId);

    Page<TransacaoCaixa> findByDataHoraBetween(LocalDateTime inicio, LocalDateTime fim, Pageable pageable);

    List<TransacaoCaixa> findByDataHoraBetween(LocalDateTime inicio, LocalDateTime fim);

    @Query("""
        SELECT COALESCE(SUM(t.valorTotal), 0)
        FROM TransacaoCaixa t
        WHERE t.tipo = :tipo AND t.dataHora BETWEEN :inicio AND :fim
    """)
    double somarPorTipoNoPeriodo(@Param("tipo") TipoTransacao tipo,
                                 @Param("inicio") LocalDateTime inicio,
                                 @Param("fim") LocalDateTime fim);

    long countByTipoAndDataHoraBetween(TipoTransacao tipo, LocalDateTime inicio, LocalDateTime fim);

    @Query("""
        SELECT new com.vivi.back.dto.ItemResumoDto(
            p.nome, t.tipo, SUM(i.quantidade), SUM(i.quantidade * p.preco))
        FROM ItemTransacao i
        JOIN i.produto p
        JOIN i.transacao t
        WHERE t.dataHora BETWEEN :inicio AND :fim
        GROUP BY p.nome, t.tipo
        ORDER BY SUM(i.quantidade * p.preco) DESC
    """)
    List<ItemResumoDto> resumirItensNoPeriodo(@Param("inicio") LocalDateTime inicio,
                                              @Param("fim") LocalDateTime fim);
}
