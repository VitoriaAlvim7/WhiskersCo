package com.vivi.back.dto;

import com.vivi.back.model.Paciente;
import com.vivi.back.model.enums.UnidadeIdade;

import java.util.List;

public record PacienteDto(
        Long id,
        String nome,
        String raca,
        Integer idade,
        UnidadeIdade unidadeIdade,
        Double peso,
        String alergias,
        String informacoes,
        Long tutorId,
        String tutorNome,
        String fotoUrl
) {

    public PacienteDto(Paciente paciente) {
        this(
                paciente.getId(),
                paciente.getNome(),
                paciente.getRaca(),
                paciente.getIdade(),
                paciente.getUnidadeIdade(),
                paciente.getPeso(),
                paciente.getAlergias(),
                paciente.getInformacoes(),
                paciente.getTutor() != null ? paciente.getTutor().getId() : null,
                paciente.getTutor() != null ? paciente.getTutor().getNome() : null,
                paciente.getFotoUrl()
        );
    }

    public static List<PacienteDto> converter(List<Paciente> pacientes) {
        return pacientes.stream().map(PacienteDto::new).toList();
    }
}
