# Tasks rota encurtamento URL
1. Modelar a entidade ShortUrl no Prisma
- Adicione o modelo no schema.prisma com todos os campos necessários.
- Rode a migração para atualizar o banco.

2. Gerar o serviço de geração de slug
- Implemente uma função para criar slugs aleatórios base62 e garantir que sejam únicos no banco.

3. Implementar o serviço ShortenService
- Adicione métodos para criar, buscar, atualizar e deletar URLs encurtadas usando Prisma.

4. Atualizar o DTO e validações
- Garanta que o DTO aceite alias opcional e valide conforme as regras do desafio.

5. Implementar o endpoint POST /shorten
- Use o serviço para persistir a URL, associar ao usuário (se autenticado) e retornar o resultado.

6. Testar o fluxo completo
- Teste com curl e unit tests para garantir que tudo está funcionando.
Essa ordem garante