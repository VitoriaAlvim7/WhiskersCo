
INSERT INTO tutor (id, ativo, cpf, endereco, nome, telefone) VALUES
    (1, TRUE, '123.456.778-91', 'Rua ', 'Vitoria', '(11) 22222-2222'),
    (2, TRUE, '123.456.789-10', 'Rua', 'Felipe', '(18) 9999-9999');

INSERT INTO produto (id, descricao, nome, preco, quantidade, tipo_produto) VALUES
    (1, NULL, 'Ração ', 19.99, 20, 'ALIMENTO'),
    (2, NULL, 'Vacina', 100.0, 20, 'MEDICAMENTO');

INSERT INTO funcionario (id, agenda, ativo, email, funcao, nome, senha, status_funcionario) VALUES
    (1, NULL, TRUE, 'vi@gmail.com', 'RECEPCIONISTA', 'vi', '$2a$10$7r.DZhlFp3SvJIPVv9amcOVFBvVIAGUANo9WbM/UDU0GtGaERG1I.', 'ATIVO'),
    (2, NULL, TRUE, 'vitoria@gmail.com', 'RECEPCIONISTA', 'vitoria', '$2a$10$x.x4QcCaTTkIv7p3.yPWc.uwHj2HyaP4x8MDpupgq2.zj4d3TZqp.', 'ATIVO'),
    (3, 'Seg a Sex das 6h as 18h', TRUE, 'fe@gmail.com', 'AUXILIAR', 'Fe', '$2a$10$1oqDmvXEz6.aUB/6ECt83unavClDyZIFvQ3zZJlBi97kMyTexiwx2', 'ATIVO'),
    (34, NULL, TRUE, 'felipebuzzofranco@gmail.com', 'RECEPCIONISTA', 'Felipe', '$2a$10$GQ25WlFWkzhuARGZOKChWeiUUJmT1GAd5f/FB.vx/lqIE2LNoI3Gm', 'ATIVO');

INSERT INTO animal_adocao (id, alergias, ativo, idade, informacoes, nome, peso, raca, status_adocao, unidade_idade) VALUES
    (1, 'Nenhuma alergia conhecida', TRUE, 4, NULL, 'Luna', 3.0, 'SRD', 'ADOTADO', 'ANOS'),
    (2, 'Nenhuma', TRUE, 5, NULL, 'Maya', 3.0, 'SRD', 'ADOTADO', 'ANOS');

INSERT INTO paciente (id, alergias, ativo, idade, informacoes, nome, peso, raca, unidade_idade, tutor_id) VALUES
    (1, 'Nenhuma alergia conhecida', TRUE, 2, NULL, 'Komori', 3.0, 'Gato - SRD', 'ANOS', 1),
    (2, 'Nenhuma alergia encontrada', TRUE, 1, 'Nenhuma', 'Trovao', 2.0, 'Gato - SRD', 'ANOS', 2),
    (3, 'Nenhuma', TRUE, 5, NULL, 'Maya', 3.0, 'SRD', 'ANOS', 2),
    (4, 'Nenhuma alergia conhecida', TRUE, 4, NULL, 'Luna', 3.0, 'SRD', 'ANOS', 2);

INSERT INTO consulta (id, data_hora, motivo, status, funcionario_id, paciente_id) VALUES
    (1, TIMESTAMP '2026-08-10 19:30:00', 'Vacinação', 'EM_ANDAMENTO', 1, 1),
    (2, TIMESTAMP '2026-08-17 14:00:00', 'Check-up', 'REALIZADA', 1, 2);

INSERT INTO receituario (id, data_emissao, prescricao, consulta_id) VALUES
    (1, DATE '2026-08-10', 'Medicamento', 1),
    (2, DATE '2026-08-17', 'Vacinacao ', 2);

INSERT INTO transacao_caixa (id, data_hora, metodo_pagamento, tipo, valor_total, consulta_id, funcionario_id) VALUES
    (1, TIMESTAMP '2026-08-10 22:22:00', 'CARTAO_DEBITO', 'ENTRADA', 219.99, 1, 1),
    (2, TIMESTAMP '2026-08-10 22:22:00', 'CARTAO_DEBITO', 'SAIDA', 50.0, NULL, 1),
    (3, TIMESTAMP '2026-08-17 16:27:00', 'DINHEIRO', 'ENTRADA', 200.0, 2, 1),
    (4, TIMESTAMP '2026-08-17 16:27:00', 'PIX', 'SAIDA', 50.0, 2, 3);

INSERT INTO item_transacao (id, quantidade, produto_id, transacao_id) VALUES
    (1, 1, 1, 1),
    (2, 1, 2, 3);

ALTER TABLE tutor            ALTER COLUMN id RESTART WITH 34;
ALTER TABLE produto           ALTER COLUMN id RESTART WITH 34;
ALTER TABLE funcionario       ALTER COLUMN id RESTART WITH 66;
ALTER TABLE animal_adocao     ALTER COLUMN id RESTART WITH 34;
ALTER TABLE paciente          ALTER COLUMN id RESTART WITH 34;
ALTER TABLE consulta          ALTER COLUMN id RESTART WITH 34;
ALTER TABLE receituario       ALTER COLUMN id RESTART WITH 34;
ALTER TABLE transacao_caixa   ALTER COLUMN id RESTART WITH 35;
ALTER TABLE item_transacao    ALTER COLUMN id RESTART WITH 34;
