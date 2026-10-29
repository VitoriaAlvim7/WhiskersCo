# Whiskers & Co. — Back

Spring Boot 4.0.5, Java 21, PostgreSQL, Flyway.

## Rodando pela primeira vez (neste PC ou em outro)

Pré-requisitos: **Java 21**, **Docker Desktop**.

```bash
cd Back
cp .env.example .env
```

Abra o `.env` e troque `POSTGRES_PASSWORD` e `JWT_SECRET` por valores aleatórios. O `.env` não é
versionado.

```bash
docker compose up -d      # sobe o Postgres
./mvnw spring-boot:run    # aplica as migrações do Flyway e sobe a API em :8080
```


## Dados de teste (modo demonstração)

Para subir a API com as telas cheias (pacientes, consultas, estoque, caixa):

```bash
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=demo"
```

Login: `demo@whiskers.local` / `demo1234`.

## Console do banco

Para inspecionar o Postgres:

```bash
docker compose exec db psql -U whiskers -d whiskers
```
