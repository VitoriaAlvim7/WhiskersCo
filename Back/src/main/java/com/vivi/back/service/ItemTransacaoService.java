package com.vivi.back.service;

import com.vivi.back.model.ItemTransacao;
import com.vivi.back.repository.ItemTransacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ItemTransacaoService {

    @Autowired
    private ItemTransacaoRepository itemTransacaoRepository;

    public Optional<ItemTransacao> buscarPorId(Long id) {
        return itemTransacaoRepository.findById(id);
    }

    public void deletar(Long id) {
        itemTransacaoRepository.deleteById(id);
    }
}
