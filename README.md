
# Whiskers & Co.

Sistema web para o gerenciamento de clínicas veterinárias de pequeno porte:
pacientes, tutores, agenda com a escala de cada veterinário, receituários em
PDF, estoque, caixa, animais para adoção, notificações e relatórios.

Trabalho de Conclusão de Curso de Análise e Desenvolvimento de Sistemas —
Fundação Educacional do Município de Assis (FEMA/IMESA), 2026.

- **Autora:** Maria Vitória Alvim Nardotto
- **Orientador:** Prof. Luiz Carlos Begosso

## Estrutura do repositório

| Pasta | O que é | Tecnologias |
|---|---|---|
| [`Back/`](Back) | API REST, regras de negócio e banco de dados | Java 21, Spring Boot 4, Spring Security + JWT, PostgreSQL, Flyway, Docker |
| [`Front/`](Front) | Interface web (SPA) | Angular 17, TypeScript, SCSS |

Cada pasta tem o seu README com os detalhes.

## Rodando o sistema

Pré-requisitos: **Java 21**, **Docker Desktop** e **Node.js 20+**.

**1. Back** (primeiro terminal):

```bash
cd Back
cp .env.example .env        # depois troque POSTGRES_PASSWORD e JWT_SECRET
docker compose up -d        # sobe o PostgreSQL
./mvnw spring-boot:run      # no Windows: .\mvnw.cmd spring-boot:run
```

A API fica em `http://localhost:8080`.

**2. Front** (segundo terminal):

```bash
cd Front
npm install
npm start
```

Acesse `http://localhost:4200` e crie uma conta em "crie uma!".

## Testes

```bash
cd Back
./mvnw test
```
