package com.vivi.back.demo;

import org.flywaydb.core.Flyway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.flyway.autoconfigure.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;

/**
 * Perfil "demo": monta uma base de demonstração a cada subida da API, sem
 * encostar nos dados reais. Tudo acontece no schema "demo"; o schema "public",
 * onde ficam os dados da clínica, nunca é limpo.
 */
@Configuration
@Profile("demo")
public class DemoConfig {

    private static final Logger log = LoggerFactory.getLogger(DemoConfig.class);
    private static final String SCHEMA_DEMO = "demo";

    @Bean
    public FlywayMigrationStrategy recriarBaseDemo(
            @Value("${app.demo.seed}") String arquivoSeed,
            @Value("${app.demo.email}") String email,
            @Value("${app.demo.senha}") String senha) {
        return flyway -> {
            garantirQueSoMexeNoSchemaDemo(flyway);

            flyway.clean();
            flyway.migrate();
            carregarSeed(flyway, Path.of(arquivoSeed));
            criarLoginDemo(flyway, email, senha);

            log.info("Base de demonstração pronta no schema '{}'. Login: {}", SCHEMA_DEMO, email);
        };
    }

    // O clean apaga tudo dos schemas configurados; se a configuração do perfil
    // apontar para outro schema por engano, a API se recusa a subir.
    private void garantirQueSoMexeNoSchemaDemo(Flyway flyway) {
        List<String> schemas = List.of(flyway.getConfiguration().getSchemas());
        if (!schemas.equals(List.of(SCHEMA_DEMO))) {
            throw new IllegalStateException(
                    "Perfil demo configurado para os schemas " + schemas + "; só o schema 'demo' pode ser recriado.");
        }
    }

    private void carregarSeed(Flyway flyway, Path arquivo) {
        if (!Files.exists(arquivo)) {
            throw new IllegalStateException("Seed de demonstração não encontrado: " + arquivo.toAbsolutePath()
                    + ". Rode a API de dentro da pasta Back.");
        }
        try (Connection conexao = flyway.getConfiguration().getDataSource().getConnection();
             Statement sql = conexao.createStatement()) {
            sql.execute("SET search_path TO " + SCHEMA_DEMO);
            sql.execute(Files.readString(arquivo, StandardCharsets.UTF_8));
        } catch (IOException e) {
            throw new UncheckedIOException("Falha ao ler o seed " + arquivo, e);
        } catch (SQLException e) {
            throw new IllegalStateException("Falha ao carregar o seed " + arquivo, e);
        }
    }

    private void criarLoginDemo(Flyway flyway, String email, String senha) {
        String hash = new BCryptPasswordEncoder().encode(senha);
        try (Connection conexao = flyway.getConfiguration().getDataSource().getConnection();
             PreparedStatement insert = conexao.prepareStatement(
                     "INSERT INTO " + SCHEMA_DEMO + ".funcionario "
                             + "(nome, email, senha, funcao, status_funcionario, ativo) "
                             + "VALUES ('Demonstração', ?, ?, 'GERENTE', 'ATIVO', TRUE)")) {
            insert.setString(1, email);
            insert.setString(2, hash);
            insert.executeUpdate();
        } catch (SQLException e) {
            throw new IllegalStateException("Falha ao criar o login de demonstração", e);
        }
    }
}
