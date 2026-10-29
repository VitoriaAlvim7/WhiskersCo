package com.vivi.back.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "Receituario")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Receituario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDate dataEmissao;
    private String prescricao;

    @OneToOne
    @JoinColumn(name = "consulta_id")
    private Consulta consulta;
}
