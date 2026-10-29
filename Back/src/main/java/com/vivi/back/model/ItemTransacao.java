package com.vivi.back.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Item_transacao")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemTransacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Integer quantidade;

    @ManyToOne
    @JoinColumn(name = "transacao_id")
    private TransacaoCaixa transacao;

    @ManyToOne
    @JoinColumn(name = "produto_id")
    private Produto produto;
}
