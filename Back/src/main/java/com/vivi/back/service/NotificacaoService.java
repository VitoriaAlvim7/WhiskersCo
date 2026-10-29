package com.vivi.back.service;

import com.vivi.back.exception.RecursoNaoEncontradoException;
import com.vivi.back.model.Notificacao;
import com.vivi.back.model.enums.TipoNotificacao;
import com.vivi.back.repository.NotificacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificacaoService {

    public static final int TETO = 10;

    @Autowired
    private NotificacaoRepository notificacaoRepository;

    public void registrar(TipoNotificacao tipo, String titulo) {
        if (notificacaoRepository.existsByTipoAndTituloAndLidaFalse(tipo, titulo)) {
            return;
        }

        Notificacao notificacao = new Notificacao(null, tipo, titulo, LocalDateTime.now(), false);
        notificacaoRepository.save(notificacao);
        aplicarTeto();
    }

    private void aplicarTeto() {
        List<Notificacao> todas = notificacaoRepository.findAllByOrderByCriadaEmDesc();
        if (todas.size() <= TETO) return;
        notificacaoRepository.deleteAll(todas.subList(TETO, todas.size()));
    }

    public void removerNaoLida(TipoNotificacao tipo, String titulo) {
        List<Notificacao> pendentes = notificacaoRepository.findByTipoAndTituloAndLidaFalse(tipo, titulo);
        if (!pendentes.isEmpty()) {
            notificacaoRepository.deleteAll(pendentes);
        }
    }

    public List<Notificacao> listar() {
        return notificacaoRepository.findAllByOrderByCriadaEmDesc();
    }

    public long contarNaoLidas() {
        return notificacaoRepository.countByLidaFalse();
    }

    public void marcarTodasComoLidas() {
        List<Notificacao> naoLidas = notificacaoRepository.findByLidaFalse();
        naoLidas.forEach(n -> n.setLida(true));
        notificacaoRepository.saveAll(naoLidas);
    }

    public void excluir(Long id) {
        if (!notificacaoRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Notificação não encontrada");
        }
        notificacaoRepository.deleteById(id);
    }
}
