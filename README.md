## Contribuções:
- Todo merge request deve seguir a padronização em pt-BR para variáveis e métodos dentro do código.
- Todo código que for mexido e estiver em inglês deve ser alterado para pt-BR visando tornar maior parte - padroniada em pt-BR
- Certifique-se antes de criar um componente se ele já não existe, caso esteja em um local errado, podem - colocar na pasta correta. ex Components/Pages
- Evite criar interfaces e métodos desnecessários
- Evitar muitas camadas para realizar uma ação
- Certifique-se de que não houve atualiações em bibliotecas que possam quebrar o código
- Certifique-se de que seu código e variáveis estão os mais legíveis possível.
- Abra um Merge Request para a branch **development** e solicite aprovação das outras pessoas do grupo.
- Peça ao grupo que teste as funcionalidades implementadas e comunique o que há de alteração.
- Após ter o aprove, abra um Merge Request para a **master** e solicite aprovação
- Comunique aos mantenedores para que seja feito o deploy.


## Instalação

Instalação dos pacotes:

```bash
npm install
```

Para rodar o servidor de desenvolvimento:

```bash
npm run dev
```

Vai abrir [http://localhost:3000](http://localhost:3000) no seu browser para acessar a aplicação.

## Qualidade
Utilizamos Jest para execução dos testes unitários, para rodar basta executar os comandos:

```bash
npm run test
// or
npm run tes:watch
```

O ESLint é utilizado para que possamos manter um padrão de desenvolvimento na escrita do código fonte, para obter um relatório basta executar:

```bash
npm run lint
```

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

|- _-_tests__ - Onde se encontram os testes unitários do projeto
|- src - Pasta central do projeto, onde o código fonte principal é desenvolvido
|-----|- app - Configurações globais de exibição e roteamento das páginas
|-----|- components - Componentes genéricos e específicos utilizados pelas páginas
|-----|- pages - Páginas do projeto

## Configurações

**packacge.json** - Dependências do projeto
**jest.config.ts** - Teste unitário
**tsconfig.json** - Compilação do JSON
**next.config.mjs.ts** - Next
**sonar-project.properties** - Sonar

## Variáveis de ambiente

Devem ser inseridas igualmente nas variáveis de produção (**.env.production**), desenvolvimento (**.env.developmentß**) e local(**.env.local**).

## Ambientes

- Produção: https://portal-wepgcomp-client.vercel.app
- Desenvolvimento: https://portal-wepgcomp-client-development.vercel.app
