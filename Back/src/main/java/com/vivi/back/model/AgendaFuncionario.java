package com.vivi.back.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Entity
@Table(name = "agenda_funcionario")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgendaFuncionario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "funcionario_id")
    private Funcionario funcionario;

    @Enumerated(EnumType.STRING)
    private DayOfWeek diaSemana;

    private LocalTime horaInicio;
    private LocalTime horaFim;

    public boolean contem(LocalTime hora) {
        return !hora.isBefore(horaInicio) && !hora.isAfter(horaFim);
    }
}
