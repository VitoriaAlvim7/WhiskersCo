package com.vivi.back.model;

import com.vivi.back.model.enums.NaturezaItem;
import com.vivi.back.model.enums.TipoProduto;
import com.vivi.back.model.enums.TipoServico;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Produto")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;
    private String descricao;
    private Double preco;
    private Integer quantidade;
    @Enumerated(EnumType.STRING)
    private TipoProduto tipoProduto;

    @Enumerated(EnumType.STRING)
    private NaturezaItem naturezaItem;

    @Enumerated(EnumType.STRING)
    private TipoServico tipoServico;

    private String fotoUrl;
}
