package com.vivi.back.model;

import com.vivi.back.model.enums.UnidadeIdade;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "paciente")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Paciente {

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
    private Boolean ativo = true;

    @ManyToOne
    @JoinColumn(name = "tutor_id")
    private Tutor tutor;

    private String fotoUrl;
}
