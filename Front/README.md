# Whiskers & Co. — Front

Angular 17, TypeScript e SCSS. Consome a API REST do [Back](../Back).

## Rodando

Pré-requisito: **Node.js 20+**. Com a API no ar em `http://localhost:8080`:

```bash
cd Front
npm install    # só na primeira vez ou quando o package.json mudar
npm start      # sobe em http://localhost:4200
```

A URL da API fica em `src/environments/environment.ts` (desenvolvimento) e
`src/environments/environment.prod.ts` (produção).

## Estrutura

```
src/app/
├── core/                 # o que a aplicação inteira usa
│   ├── guards/           # AuthGuard (rotas protegidas) e interceptor HTTP
│   ├── http/             # contexto para silenciar o toast de erro numa requisição
│   ├── models/           # interfaces dos dados trocados com a API
│   └── services/         # chamadas à API, autenticação, notificações, tema, toasts
├── shared/               # peças reaproveitadas pelas telas
│   ├── components/       # menu lateral, paginação, modais de confirmação, upload de foto...
│   ├── directives/       # acessibilidade dos modais
│   └── utils/            # máscaras, datas, paginação, mensagens de erro, PDF dos relatórios
└── features/             # uma pasta por tela, carregada sob demanda (lazy loading)
```

## Telas

| Rota | Tela |
|---|---|
| `/login`, `/login/cadastro` | Login e criação de conta |
| `/dashboard` | Painel inicial: consultas do dia, valores, notificações |
| `/pacientes`, `/pacientes/:id` | Pacientes e perfil com histórico |
| `/tutores` | Tutores |
| `/agenda` | Calendário, consultas, receita e relatório do mês |
| `/funcionarios` | Funcionários e escala de atendimento |
| `/estoque` | Produtos e serviços |
| `/adocao` | Animais para adoção |
| `/receituarios` | Receitas emitidas (PDF e impressão) |
| `/caixa` | Lançamentos, filtro por dia/semana/mês e relatório |
| `/perfil`, `/configuracoes`, `/ajuda` | Conta do usuário, tema e ajuda |

## Autenticação

O login devolve um token JWT num cookie **HttpOnly**, que o navegador envia
sozinho a cada requisição; o JavaScript da página não tem acesso a ele. O
interceptor (`core/guards/auth.guard.ts`) manda o cabeçalho CSRF nas
requisições que alteram dados e, se a API responder 401, encerra a sessão e
volta para o login.
