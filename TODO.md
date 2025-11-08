# TODO — URL Shortener API (NestJS)

## Etapa 1 — Preparação do Ambiente
**Objetivo:** garantir que tudo funcione localmente antes de iniciar a lógica principal.

- [x] Criar repositório no GitHub (`url-shortener`)
- [x] Inicializar projeto NestJS (`nest new url-shortener`)
- [ ] Configurar ESLint + Prettier
- [ ] Criar `docker-compose.yml` com:
  - [ ] Serviço do app (Node + NestJS)
  - [ ] Serviço do banco (PostgreSQL)
- [ ] Criar `.env` com variáveis:
  - [ ] `DATABASE_URL`
  - [ ] `JWT_SECRET`
  - [ ] `BASE_URL`
- [ ] Configurar TypeORM ou Prisma
- [ ] Testar conexão com o banco e `docker-compose up`

---

## Etapa 2 — Autenticação e Usuários
**Objetivo:** implementar login e cadastro JWT (base dos endpoints protegidos).

- [ ] Criar módulos `auth` e `users`
- [ ] Criar entidade `User`:
  - [ ] `id`
  - [ ] `email`
  - [ ] `password`
  - [ ] `createdAt`
  - [ ] `updatedAt`
- [ ] Implementar endpoints:
  - [ ] `POST /auth/signup` → cria usuário com senha hash (bcrypt)
  - [ ] `POST /auth/login` → retorna JWT válido
- [ ] Criar `AuthGuard` que valida o token JWT
- [ ] Testes unitários:
  - [ ] Criação de usuário
  - [ ] Login válido e inválido
- [ ] Documentar endpoints no Swagger

---

## Etapa 3 — Encurtamento de URLs
**Objetivo:** desenvolver a funcionalidade principal do sistema.

- [ ] Criar módulo `shorten` (ou `urls`)
- [ ] Criar entidade `ShortUrl`:
  - [ ] `id`
  - [ ] `originalUrl`
  - [ ] `slug`
  - [ ] `alias` (opcional e único)
  - [ ] `ownerId` (FK para `User`)
  - [ ] `accessCount`
  - [ ] `createdAt`, `updatedAt`, `deletedAt`
- [ ] Criar serviço de geração de `slug` aleatório (6 caracteres base62)
- [ ] Implementar endpoints:
  - [ ] `POST /shorten` → cria encurtamento (autenticado ou anônimo)
  - [ ] `GET /:short` → redireciona e incrementa `accessCount`
  - [ ] `GET /my-urls` → lista URLs do usuário autenticado
  - [ ] `PUT /my-urls/:id` → atualiza URL original
  - [ ] `DELETE /my-urls/:id` → soft delete (`deletedAt`)
- [ ] Adicionar validações:
  - [ ] URL válida (http/https)
  - [ ] Alias único e dentro da regex correta
  - [ ] Slug não colidir
- [ ] Testes unitários:
  - [ ] Criação de URL
  - [ ] Redirecionamento
  - [ ] Contagem de acessos
  - [ ] Soft delete

---

## Etapa 4 — Testes e Qualidade
**Objetivo:** garantir cobertura mínima e consistência de código.

- [ ] Configurar Jest com coverage
- [ ] Criar mocks e testes unitários para:
  - [ ] `AuthService`
  - [ ] `ShortenService`
  - [ ] `RedirectController`
- [ ] Rodar ESLint e Prettier (automatizar via script)
- [ ] Adicionar script `npm run test:watch`

---

## Etapa 5 — Documentação e Entrega
**Objetivo:** preparar a entrega final de forma profissional.

- [ ] Gerar documentação Swagger (`/docs`)
- [ ] Criar **README.md** com:
  - [ ] Passos para executar com Docker
  - [ ] Descrição dos endpoints
  - [ ] Instruções para rodar testes
  - [ ] Explicação sobre escalabilidade (horizontal/vertical)
- [ ] Criar **diagrama de arquitetura** (Figma, Excalidraw, Miro, etc.)
- [ ] Fazer commits semânticos (`feat:`, `fix:`, `chore:`)
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
