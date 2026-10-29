package com.vivi.back.model;

import com.vivi.back.model.enums.FuncaoFuncionario;
import com.vivi.back.model.enums.StatusFuncionario;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Funcionario")
@Data
@NoArgsConstructor
public class Funcionario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;
    private String email;
    private String senha;

    @Enumerated(EnumType.STRING)
    private FuncaoFuncionario funcao;

    private String agenda;

    @Enumerated(EnumType.STRING)
    private StatusFuncionario statusFuncionario;

    private Boolean ativo = true;

    private String fotoUrl;

}
