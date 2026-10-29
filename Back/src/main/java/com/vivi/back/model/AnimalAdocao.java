package com.vivi.back.model;

import com.vivi.back.model.enums.StatusAdocao;
import com.vivi.back.model.enums.UnidadeIdade;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "animal_adocao")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnimalAdocao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;
    private String raca;
    private Integer idade;
    @Enumerated(EnumType.STRING)
    private UnidadeIdade unidadeIdade = UnidadeIdade.ANOS;
    private Double peso;
    private String alergias;
    private String informacoes;

    @Enumerated(EnumType.STRING)
    private StatusAdocao statusAdocao;

    private Boolean ativo = true;

    private String fotoUrl;
}
