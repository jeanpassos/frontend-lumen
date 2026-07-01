# Contrato visual e funcional de um modulo frontend

Define o que qualquer modulo frontend do Portal deve cumprir para ser considerado
completo e consistente. Serve como checklist de revisao e como criterio de aceite.

## 1. Contrato funcional

### 1.1 Estados obrigatorios da tela

Toda tela de modulo trata explicitamente os quatro estados:

| Estado | Quando | Como o template resolve |
|--------|--------|--------------------------|
| Carregando | requisicao em andamento | `isLoading` do React Query + `loading.tsx` da rota |
| Vazio | requisicao ok, lista sem itens | `{{ModuleName}}EmptyState` (compoe `ui/EmptyState`) |
| Erro | requisicao falhou | bloco de erro na pagina + `error.tsx` da rota |
| Forbidden | usuario sem permissao de leitura | gate `useHasPermission` no topo, antes de qualquer hook |

### 1.2 Fluxo de dados

- Leitura e escrita passam por `lib/{{moduleSlug}}.ts` (funcoes tipadas sobre o `api` Axios).
- Componentes e paginas consomem os hooks de `hooks/use{{ModuleName}}.ts` (React Query).
- Proibido `fetch`/`axios` direto fora de `lib/`.
- Mutacoes invalidam as queryKeys afetadas e dao feedback via `sonner` (toast).
- Extracao de mensagem de erro: `err?.response?.data?.error?.message ?? "mensagem padrao"`.

### 1.3 RBAC

- Quatro codigos por modulo: `{{MODULE_KEY}}.read`, `.create`, `.update`, `.delete`.
- Formato dotado e minusculo: `<modulo>.<recurso>.<acao>`.
- Gate de UX no frontend via `useHasPermission`; o backend revalida em todo endpoint.
- A pagina de listagem exige `read`; acoes de escrita devem checar o codigo correspondente
  antes de habilitar botoes e antes de submeter.

### 1.4 Telas previstas

| Tela | Arquivo | Permissao minima |
|------|---------|------------------|
| Listagem | `app/(dashboard)/dashboard/{{moduleSlug}}/page.tsx` | `{{MODULE_KEY}}.read` |
| Detalhe | `app/(dashboard)/dashboard/{{moduleSlug}}/[id]/page.tsx` | `{{MODULE_KEY}}.read` |
| Formulario (criar/editar) | `components/{{moduleSlug}}/{{ModuleName}}Form.tsx` | `.create` / `.update` |

## 2. Contrato visual

### 2.1 Vocabulario de cor

Modulos internos usam a paleta UI Operacional ITS CS (nunca a paleta de marca LUMEN):

| Token | Hex | Uso |
|-------|-----|-----|
| `its.sidebar` | `#183c5a` | acoes primarias, foco, navegacao |
| `its.accent` | `#E85928` | links de acao, destaques, CTAs |
| `its.bg` | `#f0f2f5` | fundo das telas internas |
| surface | `#FFFFFF` | cards, tabelas, formularios |

Tipografia operacional: Inter. A paleta de marca (`brand.*`, ouro `#E5A93C`) e exclusiva
das telas de autenticacao e nao entra nos modulos.

### 2.2 Padroes de layout

- Cabecalho via `ui/PageHeader` (titulo + descricao + acoes opcionais).
- Cards e tabelas: `bg-white rounded-lg border border-gray-200`.
- Labels de filtro/campo: `text-xs font-bold text-gray-400 uppercase tracking-wide`.
- Status sempre via `Badge` (variantes success/warning/danger/muted/...), nunca cor solta.
- Estado vazio centralizado via `ui/EmptyState`.
- Espacamento vertical da pagina: `space-y-4`.

### 2.3 Componentes do modulo

| Componente | Responsabilidade |
|------------|------------------|
| `{{ModuleName}}Header` | titulo e acoes da tela (reusa `ui/PageHeader`) |
| `{{ModuleName}}Filters` | barra de filtros controlada pela pagina |
| `{{ModuleName}}Table` | listagem tabular com link para o detalhe |
| `{{ModuleName}}Form` | criacao/edicao com react-hook-form + zod |
| `{{ModuleName}}Detail` | visao de um registro |
| `{{ModuleName}}EmptyState` | estado vazio (reusa `ui/EmptyState`) |
| `{{ModuleName}}StatusBadge` | mapeia status de dominio para variante do `ui/Badge` |

## 3. Criterios de aceite

Um modulo so esta pronto quando:

- [ ] os quatro estados (carregando/vazio/erro/forbidden) aparecem e foram testados;
- [ ] nenhuma chamada de rede ocorre fora de `lib/{{moduleSlug}}.ts`;
- [ ] os quatro codigos de RBAC existem no backend e o gate funciona no frontend;
- [ ] a tela usa a paleta UI Operacional, sem cor solta nem paleta de marca;
- [ ] status e exibido via `Badge`, vazio via `EmptyState`, cabecalho via `PageHeader`;
- [ ] nenhum pacote novo foi adicionado ao `package.json`;
- [ ] `npm run lint` e `npm run test` passam;
- [ ] a entrada da sidebar foi registrada e filtrada por permissao.
