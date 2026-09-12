# Portal WEPGCOMP — Frontend

Frontend do portal do **WEPGCOMP** (Workshop de Pós-Graduação em Computação / PGCOMP-UFBA). Consome a API em [`portal-wepgcomp-api`](https://github.com/portalwepgcomp/portal-wepgcomp-api).

## Sobre

Aplicação web para inscrição, programação de apresentações, avaliações, favoritos, gerenciamento de edições/sessões e demais fluxos do evento.

## Stack

- **Next.js** 14 (App Router) + **React** 18 + **TypeScript**
- **Tailwind CSS**
- **TanStack Query**, Axios, React Hook Form + Zod
- **Jest** (unitário) e **Cypress** (e2e, opcional)
- Node **≥ 18** e npm **≥ 10** (`engines` no `package.json`; CI usa Node 20)

## Estrutura do projeto

```text
portal-wepgcomp-frontend/
├── __tests__/              # Testes unitários (Jest)
├── cypress/                # Testes e2e (Cypress)
├── public/                 # Assets estáticos
├── src/
│   ├── app/                # Rotas e layouts (App Router)
│   ├── components/         # Componentes reutilizáveis (UI, forms, layout)
│   ├── features/           # Domínios de listagem/telas (apresentacoes, edicoes, …)
│   ├── context/            # Contextos React
│   ├── hooks/              # Hooks compartilhados
│   ├── lib/                # Utilitários de infra (ex.: react-query)
│   ├── services/           # Chamadas à API
│   ├── models/ · types/    # Modelos e tipos
│   ├── enums/ · utils/     # Enums e helpers
│   └── styles/             # Estilos auxiliares
├── .env.example            # Variáveis de ambiente documentadas
├── Makefile                # Atalhos (setup, dev, ci, …)
├── next.config.mjs
├── jest.config.mjs
└── package.json
```

## Pré-requisitos

- Node.js ≥ 18 e npm ≥ 10
- API local rodando (padrão: `http://localhost:3001`) — ver README da API

## Instalação / Como rodar

```bash
# 1. Instalar dependências
npm install
# ou: make setup

# 2. Variáveis de ambiente
cp .env.example .env.local
# Ajuste NEXT_PUBLIC_API_URL se a API não estiver em localhost:3001

# 3. Desenvolvimento
npm run dev
# ou: make dev
```

Abre [http://localhost:3000](http://localhost:3000).

O `Makefile` também exporta `NEXT_PUBLIC_API_URL=http://localhost:3001` por padrão ao usar `make`.

## Variáveis de ambiente

Consulte [`.env.example`](.env.example). Em local, use `.env.local` (Next.js).

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base da API (ex.: `http://localhost:3001`) |

## Guia de botões

Use `src/components/UI/Button.tsx` para ações. As classes são compartilhadas com
links e SweetAlert por `src/lib/estilosBotao.ts`, com os estilos definidos em
`src/styles/tailwind.css`.

| Variante | Aparência | Uso |
| --- | --- | --- |
| `primary` (padrão) | Laranja da marca, texto escuro | Cadastrar, salvar, enviar, avaliar e confirmar ações comuns |
| `secondary` / `outline` | Fundo branco e contorno neutro | Voltar, cancelar, editar, baixar e abas |
| `danger` | Vermelho, texto branco | Excluir, resetar e confirmar ações destrutivas |
| `ghost` | Fundo transparente | Fechar, menus e controles auxiliares |

Todas as variantes têm foco visível por teclado e estado desabilitado sem efeito
de hover. Em abas e seletores, use `secondary` com `aria-pressed`; a seleção recebe
contorno e fundo suave da marca. Use texto ou `aria-label` para identificar ações
que mostram apenas ícones.

```tsx
<Button type="submit" disabled={salvando}>Salvar</Button>
<Button variante="secondary" onClick={voltar}>Voltar</Button>
<Button variante="danger" onClick={confirmarExclusao}>Excluir</Button>
<Button variante="secondary" aria-pressed={selecionada}>Banca</Button>
```

O tipo padrão é `button`; formulários devem declarar `type="submit"`. Mantenha
largura, espaçamento e responsividade em `className` ou `larguraTotal`. Cores,
contornos e estados visuais pertencem às variantes: evite sobrescrevê-los com
classes locais, estilos inline ou `confirmButtonColor`/`cancelButtonColor`.

Para links com aparência de botão, mantenha `<Link>`/`<a>` e aplique
`obterClassesBotao("secondary")`. Para os modais compartilhados, use
`varianteConfirmacao`; alertas comuns usam `primary` e cancelamentos usam `secondary`.
Informe a intenção destrutiva explicitamente, independentemente do ícone do alerta:

```tsx
await showAlert({
  title: "Excluir edição?",
  icon: "warning",
  showCancelButton: true,
  confirmButtonText: "Excluir",
  cancelButtonText: "Cancelar",
  varianteConfirmacao: "danger",
});
```

## Estrutura de pastas

## Scripts úteis

Via npm ou Make:

| Comando | Equivalente Make | Descrição |
|---|---|---|
| `npm install` | `make setup` | Instala dependências |
| `npm run dev` | `make dev` | Servidor de desenvolvimento |
| `npm run build` | `make build` | Build de produção |
| `npm run lint` | `make lint` | ESLint |
| `npm run typecheck` | `make typecheck` | `tsc --noEmit` |
| `npm test` | `make test` | Testes unitários (Jest) |
| `npm run test:watch` | — | Jest em modo watch |
| `npm run ci` | `make ci` | typecheck + lint + test + build |

## Contribuição

A branch **`main` está protegida**: não faça push direto nela.

1. Crie uma branch a partir de `main` com o padrão **`issue-#x`** (ex.: `issue-#19`). Para tarefas sem issue, use prefixo descritivo (`chore/…`, `docs/…`, `fix/…`).
2. Implemente, rode localmente o que for relevante (`npm run lint`, `npm test`, `npm run build` / `make ci`).
3. Abra um **Pull Request para `main`**.
4. Preencha o [template de PR](.github/PULL_REQUEST_TEMPLATE.md).
5. Aguarde **pelo menos 1 aprovação** de revisor.
6. O **CI** do GitHub Actions (typecheck, lint, test, build) deve ficar verde.
7. O **CodeRabbit** (`.coderabbit.yaml`) comenta automaticamente nos PRs para `main` — use como apoio, não substitui a review humana.

Não existe mais fluxo com branch `development` / `master` intermediária.

### Checklist rápido do PR

- [ ] Branch `issue-#x` (ou prefixo chore/docs/fix)
- [ ] PR aberto contra `main`
- [ ] ≥ 1 aprovador
- [ ] CI verde
- [ ] Sem secrets / `.env` no diff

## Convenções de nomes

- **Código em pt-BR** (variáveis, funções, componentes e pastas alinhados ao restante do projeto).
- Rotas em `src/app/` seguem paths em português (`apresentacoes`, `edicoes`, `sessoes`, …).
- Componentes em pastas PascalCase sob `src/components/` (ex.: `Header`, `Forms`).
- Domínios de feature em `src/features/<dominio>/` (kebab/minúsculo, como já usado).
- Antes de criar um componente, verifique se já existe; evite camadas e interfaces desnecessárias.
- Prefira nomes legíveis; não atualize dependências sem necessidade e sem validar build/testes.

## Links úteis

- Produção: https://portal-wepgcomp-client.vercel.app
- Desenvolvimento: https://portal-wepgcomp-client-development.vercel.app


### Reproduzir favoritos por edição (issue #5)

Com a API irmã em `../portal-wepgcomp-api`, dependências instaladas e `.env`
apontando para PostgreSQL local, execute na raiz do frontend:

```bash
node scripts/seed-favoritos.cjs
```

O script insere dados fictícios com IDs fixos, sem apagar registros existentes.
Pode ser executado novamente para restaurar os dois favoritos do cenário.
Aceita o caminho da API como primeiro argumento e recusa bancos remotos.

- Login local: `favoritos.issue5@example.test` / `FavoritosTeste5!`.
- Edições 2025 e 2026: uma apresentação favoritada em cada uma.
- Edição 2027: sem favoritos.

Inicie a API na porta 3001 e o frontend com `NEXT_PUBLIC_API_URL=http://localhost:3001`.
Entre com o usuário acima e abra `/favoritos`. Alterne o seletor entre 2025, 2026
e 2027: a lista e o contador devem mostrar apenas a edição escolhida. Remova o
favorito de 2025 e confirme que o de 2026 continua disponível. Execute o seed
novamente para repetir o teste.

A consulta envia `eventEditionId` e filtra também `submission.eventEditionId`
na resposta, mantendo compatibilidade com a API atual enquanto a
[issue da API #2](https://github.com/portalwepgcomp/portal-wepgcomp-api/issues/2)
não for implementada. Os testes de regressão podem ser executados com
`npm test -- --runInBand --coverage=false favoritos`.
