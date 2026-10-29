package com.vivi.back.repository;

import com.vivi.back.model.Notificacao;
import com.vivi.back.model.enums.TipoNotificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {

    List<Notificacao> findAllByOrderByCriadaEmDesc();

    long countByLidaFalse();

    List<Notificacao> findByLidaFalse();

    boolean existsByTipoAndTituloAndLidaFalse(TipoNotificacao tipo, String titulo);

    List<Notificacao> findByTipoAndTituloAndLidaFalse(TipoNotificacao tipo, String titulo);
}
