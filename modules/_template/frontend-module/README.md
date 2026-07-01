# Template de modulo frontend (LUMEN Portal)

Modelo reutilizavel para criar um novo modulo frontend no Portal de forma padronizada.
Stack alvo: Next.js 14 (App Router) + TypeScript + Tailwind, exatamente como o `frontend/` do Portal.

Este template nao registra rota nem cria modulo real. E so um ponto de partida copiavel.
Sem gerador, sem Copier: a aplicacao por enquanto e manual (passo a passo abaixo).

## Por que fica em `.tools/templates/`

Os arquivos contem placeholders `{{...}}`, que nao sao TypeScript valido. Se vivessem dentro
de `frontend/`, quebrariam `tsc`, `eslint` e `vitest`. Por isso o template fica na raiz do repo,
fora da arvore de build. Voce copia os arquivos para `frontend/` ao aplicar.

## Placeholders

| Placeholder | Significado | Exemplo |
|-------------|-------------|---------|
| `{{moduleSlug}}` | slug minusculo: pasta de rota, arquivo lib, pasta de componentes | `contratos` |
| `{{ModuleName}}` | nome em PascalCase: componentes, hooks, tipos | `Contratos` |
| `{{MODULE_KEY}}` | prefixo dotado da permissao `<modulo>.<recurso>` | `contratos.contrato` |
| `{{moduleDescription}}` | descricao curta para o cabecalho da tela | `Gestao de contratos e aditivos` |

> Atencao ao RBAC: a convencao do Portal e dotada e minuscula, no formato
> `<modulo>.<recurso>.<acao>`. O template gera `{{MODULE_KEY}}.read`, `.create`, `.update`,
> `.delete`. Nao use o formato `MODULO_READ` em maiusculas: ele nao existe no backend.

## Estrutura do template

```
.tools/templates/frontend-module/
├── README.md
├── MODULE_SPEC.md
├── app/(dashboard)/dashboard/{{moduleSlug}}/
│   ├── page.tsx          listagem + gate de permissao + estados
│   ├── loading.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   └── [id]/page.tsx     detalhe
├── components/{{moduleSlug}}/
│   ├── {{ModuleName}}Header.tsx       reusa ui/PageHeader
│   ├── {{ModuleName}}Filters.tsx
│   ├── {{ModuleName}}Table.tsx
│   ├── {{ModuleName}}Form.tsx         react-hook-form + zod
│   ├── {{ModuleName}}Detail.tsx
│   ├── {{ModuleName}}EmptyState.tsx   reusa ui/EmptyState
│   └── {{ModuleName}}StatusBadge.tsx  reusa ui/Badge
├── lib/{{moduleSlug}}.ts              API + tipos inline + PERMS
├── hooks/use{{ModuleName}}.ts         React Query (list/detail/create/update/delete)
└── tests/{{moduleSlug}}/{{moduleSlug}}.test.tsx
```

A estrutura interna espelha a do `frontend/`. Ao aplicar, cada pasta cai no lugar
correspondente dentro de `frontend/`.

## Diferencas em relacao ao layout real do Portal (importante)

Estas decisoes seguem o codigo que ja existe em producao, nao um Next.js generico:

1. Rotas vivem em `app/(dashboard)/dashboard/<mod>/`. O `(dashboard)` e um route group
   (nao vira segmento de URL); o `dashboard` e o segmento real. URL final: `/dashboard/<mod>`.
2. Camada de API e um arquivo plano por dominio: `lib/<mod>.ts`. Nao existe `lib/api/`.
3. Tipos ficam inline no `lib/<mod>.ts`. A pasta `types/` guarda so os tipos do OpenAPI (`api.ts`),
   nao tipos por modulo.
4. Nao ha `forbidden.tsx` no Next 14. O estado "forbidden" e um gate `useHasPermission`
   no topo da pagina, com split Page/Content para nao chamar hooks de forma condicional.
5. `EmptyState`, `Badge`, `Button` e `PageHeader` ja existem em `components/ui/`. Os wrappers
   do template compoem esses primitivos, nao reimplementam.
6. Dados via React Query (`@tanstack/react-query`), sempre atraves de `lib/<mod>.ts`.
   Nunca `fetch` ou `axios` direto em `page.tsx` ou em componente.

## Como aplicar manualmente

1. Escolha os valores dos placeholders. Exemplo para o modulo de contratos:
   - `{{moduleSlug}}` = `contratos`
   - `{{ModuleName}}` = `Contratos`
   - `{{MODULE_KEY}}` = `contratos.contrato`
   - `{{moduleDescription}}` = `Gestao de contratos e aditivos`
2. Copie o conteudo do template para o `frontend/`, renomeando pastas e arquivos:
   - `app/(dashboard)/dashboard/{{moduleSlug}}/` -> `frontend/app/(dashboard)/dashboard/contratos/`
   - `components/{{moduleSlug}}/` -> `frontend/components/contratos/`
   - `lib/{{moduleSlug}}.ts` -> `frontend/lib/contratos.ts`
   - `hooks/use{{ModuleName}}.ts` -> `frontend/hooks/useContratos.ts`
   - `tests/{{moduleSlug}}/...` -> `frontend/tests/contratos/contratos.test.tsx`
3. Substitua todos os placeholders dentro dos arquivos. No PowerShell, a partir de `frontend/`:
   ```powershell
   Get-ChildItem -Recurse -Include *.ts,*.tsx -Path .\app\(dashboard)\dashboard\contratos,.\components\contratos,.\lib\contratos.ts,.\hooks\useContratos.ts,.\tests\contratos |
     ForEach-Object {
       (Get-Content $_ -Raw) `
         -replace '\{\{moduleSlug\}\}','contratos' `
         -replace '\{\{ModuleName\}\}','Contratos' `
         -replace '\{\{MODULE_KEY\}\}','contratos.contrato' `
         -replace '\{\{moduleDescription\}\}','Gestao de contratos e aditivos' |
       Set-Content $_ -NoNewline
     }
   ```
4. Ajuste as entidades: troque os campos de exemplo (`nome`, `status`) pelos campos reais
   do modulo no `lib/<mod>.ts`, no `Form`, na `Table`, no `Detail` e no schema zod.
5. Garanta o RBAC no backend: os codigos `contratos.contrato.read/create/update/delete`
   precisam existir na classe `Perm` e nos grupos de acesso. O gate do frontend e so UX;
   o backend revalida em todo endpoint.
6. Registre a entrada na sidebar (fora do escopo do template) e valide:
   ```
   npm run lint
   npx vitest run
   ```

## Regras do template (herdadas do Portal)

- Nao usar `fetch`/`axios` direto em pagina ou componente: tudo passa por `lib/<mod>.ts`.
- Todo modulo preve os quatro estados: carregando, vazio, erro e forbidden.
- Todo modulo preve RBAC com os quatro codigos (`read`/`create`/`update`/`delete`).
- Nao introduzir pacote novo: o template usa so o que ja esta no `package.json`.
- Codigo em ingles; comentarios e docs em portugues.
- Reusar os primitivos de `components/ui/` em vez de recriar.
