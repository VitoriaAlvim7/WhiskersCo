package com.vivi.back.service;

import com.vivi.back.exception.RecursoNaoEncontradoException;
import com.vivi.back.form.ReceituarioForm;
import com.vivi.back.model.Consulta;
import com.vivi.back.model.Receituario;
import com.vivi.back.model.enums.StatusConsulta;
import com.vivi.back.repository.ConsultaRepository;
import com.vivi.back.repository.ReceituarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ReceituarioService {

    private static final Sort POR_EMISSAO = Sort.by(Sort.Direction.DESC, "dataEmissao");

    @Autowired
    private ReceituarioRepository receituarioRepository;

    @Autowired
    private ConsultaRepository consultaRepository;

    public Receituario salvar(ReceituarioForm form) {
        Consulta consulta = consultaRepository.findById(form.consultaId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Consulta não encontrada"));

        exigirConsultaFinalizada(consulta);

        if (receituarioRepository.existsByConsultaId(form.consultaId())) {
            throw new IllegalStateException("Esta consulta já tem um receituário.");
        }

        Receituario receituario = new Receituario(
                null,
                form.dataEmissao(),
                form.prescricao(),
                consulta
        );

        return receituarioRepository.save(receituario);
    }

    private void exigirConsultaFinalizada(Consulta consulta) {
        if (consulta.getStatus() != StatusConsulta.FINALIZADA) {
            throw new IllegalStateException("A receita só pode ser gerada para uma consulta finalizada.");
        }
    }

    public List<Receituario> listarReceituarios() {
        return receituarioRepository.findAll(POR_EMISSAO);
    }

    public Optional<Receituario> buscarPorId(Long id) {
        return receituarioRepository.findById(id);
    }

    public Receituario atualizar(Long id, ReceituarioForm form) {
        return receituarioRepository.findById(id)
                .map(receituario -> {
                    Consulta consulta = consultaRepository.findById(form.consultaId())
                            .orElseThrow(() -> new RecursoNaoEncontradoException("Consulta não encontrada"));

                    boolean trocouDeConsulta = receituario.getConsulta() == null
                            || !receituario.getConsulta().getId().equals(form.consultaId());
                    if (trocouDeConsulta) {
                        exigirConsultaFinalizada(consulta);
                    }
                    if (trocouDeConsulta && receituarioRepository.existsByConsultaId(form.consultaId())) {
                        throw new IllegalStateException("Esta consulta já tem um receituário.");
                    }

                    receituario.setDataEmissao(form.dataEmissao());
                    receituario.setPrescricao(form.prescricao());
                    receituario.setConsulta(consulta);
                    return receituarioRepository.save(receituario);
                })
                .orElseThrow(() -> new RecursoNaoEncontradoException("Receituario não encontrado"));
    }

    @Transactional
    public void deletar(Long id) {
        receituarioRepository.findById(id).ifPresent(receituario -> {
            Consulta consulta = receituario.getConsulta();
            if (consulta != null) {
                consulta.setReceituario(null);
                consultaRepository.save(consulta);
            } else {
                receituarioRepository.delete(receituario);
            }
        });
    }
}
