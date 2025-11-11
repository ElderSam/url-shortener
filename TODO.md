# TODO — URL Shortener API (NestJS)

## Etapa 1 — Preparação do Ambiente
**Objetivo:** garantir que tudo funcione localmente antes de iniciar a lógica principal.

- [x] Criar repositório no GitHub (`url-shortener`)
- [x] Inicializar projeto NestJS (`nest new url-shortener`)
- [x] Configurar ESLint + Prettier
- [x] Criar `docker-compose.yml` com:
  - [x] Serviço do app (Node + NestJS)
  - [x] Serviço do banco (PostgreSQL)
- [x] Criar `.env` com variáveis:
  - [x] `DATABASE_URL`
  - [x] `JWT_SECRET`
  - [x] `BASE_URL`
- [x] Configurar Prisma
- [x] Testar conexão com o banco e `docker-compose up`

---

## Etapa 2 — Autenticação e Usuários
**Objetivo:** implementar login e cadastro JWT (base dos endpoints protegidos).

- [x] Criar módulos `auth` e `users`
- [x] Criar entidade `User`:
  - [x] `id`
  - [x] `email`
  - [x] `password`
  - [x] `createdAt`
  - [x] `updatedAt`
- [x] Implementar endpoints:
  - [x] `POST /auth/register` → cria usuário com senha hash (bcrypt)
  - [x] `POST /auth/login` → retorna JWT válido
- [x] Criar `AuthGuard` que valida o token JWT
- [x] Testes unitários:
  - [x] Criação de usuário
  - [x] Login válido e inválido
- [x] Documentar endpoints no Swagger

---

## Etapa 3 — Encurtamento de URLs
**Objetivo:** desenvolver a funcionalidade principal do sistema.

- [x] Criar módulo `shorten` (ou `urls`)
 - [x] Criar entidade `ShortUrl`:
  - [x] `id`
  - [x] `originalUrl`
  - [x] `slug`
  - [x] `alias` (opcional e único)
  - [x] `ownerId` (FK para `User`)
  - [x] `accessCount`
  - [x] `createdAt`, `updatedAt`, `deletedAt`

 - [x] Criar serviço de geração de `slug` aleatório (6 caracteres base62)

 - [ ] Implementar endpoints:
  - [x] `POST /shorten` → cria encurtamento (autenticado ou anônimo)
  - [ ] `GET /:short` → redireciona e incrementa `accessCount`
  - [ ] `GET /my-urls` → lista URLs do usuário autenticado
  - [ ] `PUT /my-urls/:id` → atualiza URL original
  - [ ] `DELETE /my-urls/:id` → soft delete (`deletedAt`)

 - [x] Encurtamento - Adicionar validações:
  - [x] URL válida (http/https)
  - [x] Alias único e dentro da regex correta
  - [x] Slug não colidir
- [ ] Testes unitários:
  - [x] Criação de URL
  - [ ] Redirecionamento
  - [ ] Contagem de acessos
  - [ ] Soft delete

---

## Etapa 4 — Testes e Qualidade
**Objetivo:** garantir cobertura mínima e consistência de código.

- [x] Configurar Jest com coverage
- [ ] Criar mocks e testes unitários para:
  - [x] `AuthService`
  - [x] `ShortenService`
  - [ ] `RedirectController`

- [x] Rodar ESLint e Prettier (automatizar via script)
- [x] Adicionar script `npm run test:watch`

---

## Etapa 5 — Documentação e Entrega
**Objetivo:** preparar a entrega final de forma profissional.

- [x] Gerar documentação Swagger (`/docs`)
- [ ] Criar **README.md** com:
  - [x] Passos para executar com Docker
  - [ ] Descrição dos endpoints
  - [x] Instruções para rodar testes
  - [ ] Explicação sobre escalabilidade (horizontal/vertical)

- [ ] Criar **diagrama de arquitetura** (Figma, Excalidraw, Miro, etc.)
- [x] Fazer commits semânticos (`feat:`, `fix:`, `chore:`)
- [ ] Subir para repositório público no GitHub

---

## Etapa 6 — Diferenciais (Opcional)
**Objetivo:** agregar valor à entrega.

- [ ] Adicionar logs estruturados (ex: Pino)
- [ ] Adicionar métricas/observabilidade (ex: Prometheus, Sentry)
- [ ] Configurar CI/CD simples com GitHub Actions:
  - [ ] Rodar lint e testes automaticamente
- [ ] Adicionar YAMLs para Kubernetes (deploy)
- [ ] Criar `CHANGELOG.md` e usar git tags
