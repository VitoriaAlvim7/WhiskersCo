package com.vivi.back.arquivo;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class ArmazenamentoFotoService {

    private static final Map<String, String> TIPOS_ACEITOS = Map.of(
            "image/jpeg", "jpg",
            "image/pjpeg", "jpg",
            "image/png", "png",
            "image/webp", "webp"
    );

    private final Path diretorio;
    private final long tamanhoMaximoBytes;

    public ArmazenamentoFotoService(
            @Value("${app.upload.diretorio:uploads}") String diretorio,
            @Value("${app.upload.tamanho-maximo-bytes:2097152}") long tamanhoMaximoBytes) {
        this.diretorio = Paths.get(diretorio).toAbsolutePath().normalize();
        this.tamanhoMaximoBytes = tamanhoMaximoBytes;
        try {
            Files.createDirectories(this.diretorio);
        } catch (IOException e) {
            throw new UncheckedIOException("Nao foi possivel criar o diretorio de upload: " + this.diretorio, e);
        }
    }

    public String guardar(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new IllegalArgumentException("Nenhum arquivo foi enviado.");
        }
        if (arquivo.getSize() > tamanhoMaximoBytes) {
            throw new IllegalArgumentException(
                    "A imagem tem " + megabytes(arquivo.getSize()) + " MB e o limite e "
                            + megabytes(tamanhoMaximoBytes) + " MB.");
        }

        String contentType = arquivo.getContentType() == null
                ? ""
                : arquivo.getContentType().toLowerCase(Locale.ROOT);
        String extensao = TIPOS_ACEITOS.get(contentType);
        if (extensao == null) {
            throw new IllegalArgumentException("Formato nao aceito. Envie uma imagem JPG, PNG ou WEBP.");
        }

        String nome = UUID.randomUUID().toString().replace("-", "") + "." + extensao;
        Path destino = diretorio.resolve(nome).normalize();
        if (!destino.startsWith(diretorio)) {
            throw new IllegalArgumentException("Caminho de destino invalido.");
        }

        try (var entrada = arquivo.getInputStream()) {
            Files.copy(entrada, destino, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new UncheckedIOException("Falha ao gravar a imagem.", e);
        }

        return "/uploads/" + nome;
    }

    public Path getDiretorio() {
        return diretorio;
    }

    private static String megabytes(long bytes) {
        return String.format(Locale.forLanguageTag("pt-BR"), "%.1f", bytes / 1024.0 / 1024.0);
    }
}
