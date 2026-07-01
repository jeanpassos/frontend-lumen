# Handoff: LUMEN Core — Plataforma modular (Core + módulos)

## Overview
**LUMEN Core** é o *shell* de uma plataforma corporativa modular do **Grupo ITS CS**. O Core entrega o que é transversal a todos os módulos — identidade/login, layout (sidebar + topbar), **menu dirigido por estado**, **RBAC granular**, **multiempresa**, kit de UI e as telas de administração da plataforma. Cada **módulo é um container Docker** que se "encaixa" no Core; o Core controla ordem/visibilidade/permissão de cada entrada de menu e o ponto de montagem de cada módulo (página interna, módulo embarcado via Docker, ou link externo).

Este bundle documenta **todo o frontend** para que, em seguida, seja feita a ligação com o backend.

## About the Design Files
Os arquivos deste bundle são **referências de design feitas em HTML** — um protótipo de alta fidelidade que demonstra aparência e comportamento pretendidos, **não** código de produção para copiar diretamente. A tarefa é **recriar estes designs no ambiente do codebase alvo** (React/Vue/etc.) usando os padrões e bibliotecas já estabelecidos lá — ou, se ainda não existir ambiente, escolher o framework mais adequado e implementar os designs nele.

O protótipo foi construído como um único **Design Component** (`LUMEN Core.dc.html`): markup com **estilos inline** + uma classe de lógica `Component` (estilo React class component) cujo `renderVals()` monta os *view-models* por rota. `support.js` é apenas o runtime que renderiza o DC no navegador — **não** faz parte da entrega de produção; serve só para abrir o protótipo.

## Fidelity
**Alta fidelidade (hifi).** Cores, tipografia, espaçamentos, estados e interações são finais. Recrie pixel-perfect usando as bibliotecas/design-system do codebase. Onde houver design system próprio, mapeie os tokens abaixo para os equivalentes.

---

## Arquitetura (conceitos que o frontend assume)
- **Core = plataforma; Módulo = "Módulo · Docker"; serviços externos (NEXUS/HERMES, IA) = "Serviço externo".** O cabeçalho mostra um **selo** distinguindo os três.
- **RBAC**: toda permissão tem o formato `modulo.recurso.acao` (ex.: `contratos.contract.read`). O **backend revalida em todo endpoint**; o frontend só esconde/desabilita. **MFA** nas ações críticas.
- **Perfis**: Admin (A), Gestor (G), Operador (O), Leitor (L). Rotas têm *gate* por perfil; existe estado **Forbidden** (sem permissão).
- **Multiempresa**: seletor de empresa no topbar (tenant atual — Grupo ITS CS). Dados são particionados por `company_id`.
- **Menu dirigido por estado** (`state.nav`, semente em `navSeed()`): cada módulo "registra" suas entradas; o Core controla ordem/visibilidade/RBAC. A página **Navegação & menu** administra isso ao vivo.

---

## Design Tokens

### Cores
| Token | Hex | Uso |
|---|---|---|
| Navy (primary) | `#183c5a` | Sidebar, botões primários, pino Matriz, selos |
| Orange (accent) | `#E85928` | Logo, badge de notificação, CTAs |
| Blue | `#2f6fed` | Links, acento secundário, pino Filial, linha do mapa |
| App bg | `#f0f2f5` | Fundo da aplicação |
| Card bg | `#ffffff` | Cartões/superfícies |
| Header bg | `rgba(255,255,255,.86)` + `backdrop-filter: blur(12px)` | Topbar |
| Border | `#e3e7ec` / `#eef0f3` | Bordas de cartões/divisórias |
| Text strong | `#1f2937` | Títulos |
| Text | `#374151` | Corpo |
| Text muted | `#6b7280`, `#9ca3af`, `#9aa6b4` | Secundário |
| Success | `#1f9d57` (bg `#e6f6ed`) | Ativo/OK/saudável |
| Danger | `#c0413f` / `#e0524f` (bg `#fde9e9`) | Erro/bloqueado |
| Warning | `#b06a00` (bg `#fdf2e0`) | Manutenção/degradado |
| Sidebar text | `#cbd9e6` (sobre navy) | Itens do menu |

### Tipografia
- **Sans**: `Inter`, system-ui (UI geral).
- **Mono**: `'JetBrains Mono'` — usada para valores técnicos: códigos `modulo.recurso.acao`, CNPJ, latências, `corr-id`, hashes/commits.
- Escala: títulos de página **23px/700** (letter-spacing −.4px); número de KPI **29px/800** (−.8px); corpo **13–14px**; rótulos/muted **11.5–12.5px**; UPPERCASE com letter-spacing .5px para *labels* de KPI.

### Raio / sombra / espaçamento
- Raio: cartões **14px**, botões/inputs **8–9px**, pílulas **20px**, avatares **9–16px**.
- Sombra de cartão suave; menus flutuantes `0 3px 10px rgba(20,40,70,.12)`.
- Densidade **compacta** (especialmente em tabelas). `gap` 10–16px em grids/flex.

---

## PADRÃO DE LISTA (vale para TODA página com lista/tabela)
Regra do sistema — replicar em todas:
1. **Busca** que filtra por texto, com contador ao vivo "N registros" e **estado vazio**.
2. **Alternância Lista / Cards** (toggle no cabeçalho; **lista é o padrão**).
3. **Ordenação por coluna**: cabeçalhos clicáveis com seta; alterna A–Z / Z–A (e maior→menor em números); indicador da coluna/direção ativa.
4. **Itens por página**: seletor 10 / 25 / 50 / 100 (padrão **10**).
5. **Paginação**: anterior/próxima + números + texto "X–Y de Z".
6. **Ações por linha (⋯)**: menu com ações reais (mutam estado + **toast**). Nas **2 últimas linhas o menu abre para CIMA** (`bottom`) para não cortar; o container não pode clipar (`overflow:visible`).
7. **Todos os botões funcionam** — nada decorativo; cada ação muta estado e dá feedback.

Páginas que seguem o padrão: Usuários, Níveis de acesso, Cadastros, Integrações, Saúde dos serviços, Contratos, Licitações, Service Desk, Inventário, Documents, listas internas do Work Management.

---

## Screens / Views

> Layout base: **Sidebar** (`width 248px`, recolhível para trilho de ícones ~72px, `bg #183c5a`) · **Topbar** (`height 60px`, blur, seletor de empresa + busca global + notificações + menu do usuário) · **Main** com rolagem. Animação de entrada de conteúdo: `transform: translateY(9px) → none` (~.3s).

1. **Login** — split: painel navy à esquerda (marca LUMEN, headline, chips de features) + formulário à direita (e-mail, senha, "manter conectado", **Entrar**).
2. **Dashboard** — `Core · plataforma`. 4 **KPI cards** (número 29/800, ícone colorido, delta), **gráfico** de área/linha, **Saúde dos módulos** (pontos *live* + latência em mono), **atividade recente**.
3. **Financeiro** — `Módulo · Docker`. KPIs + tabela tipo DRE.
4. **Contratos** (módulo de referência) — lista (padrão) + **drill-in de detalhe** (grid de fatos, timeline); demonstra estados **Carregando / Vazio / Erro (corr-id, 503) / Forbidden** (`permissão exigida: contratos.contract.read`).
5. **Documents** — lista. 6. **Licitações** — editais + status de *match*. 7. **Service Desk** — tickets + **badges de SLA**.
8. **Work Management** — **fora do projeto**: visão de gestão (todos os projetos) com abas **Projetos, Kanban (drag-and-drop), Checklists, Time tracking, Workload (cronograma Gantt por projeto), Automação**. **Dentro do projeto** (clicar entra): workspace isolado com **Visão geral** (marcos), **Tarefas** (Kanban do projeto), **Fluxograma** (editor arrastável + salvar), **Documentos** do projeto. Visão por nível de acesso.
9. **Inventário** — ativos. 10. **Training / EAD**. 11. **NEXUS · HERMES** — `Serviço externo · IA` (fluxos/IA). 12. **@lumen/ui** — galeria de componentes do kit.
13. **Navegação & menu** (Plataforma) — **admin do sidebar**: ocultar/mostrar (olho), reordenar (drag + ↑/↓), renomear, *gate* por perfil (chips A/G/O/L), **"pré-visualizar como"** perfil, **Restaurar padrão**. Clicar num item abre uma **página inteira de configuração** (não gaveta): abas **Geral** (nome → preview de rota `modules/...`, **seletor de ícone com 89 ícones + busca**, apontamento: página interna / módulo Docker embarcado / link externo + URL + abrir em), **Acesso & permissões** (matriz `modulo.recurso.acao` por perfil + features internas), **Container · Docker** (buscar manifesto, commit, testar saúde), **Cliques & uso** (analítico), **Avançado**.
14. **Cadastros** (dados-mestres) — lista de cadastros; cada um abre **página própria** com formulário rico **type-specific**. **Empresa**: logo, **endereço completo**, contato, fiscal/plano + aba **Mapa** (mapa político do Brasil — **27 estados coloridos** estilo IBGE + pinos **Matriz/Filial**, **linha de conexão sempre ativa/animada**, **nome da unidade aparece no hover do ícone**) + aba **Visão 360°** (painel executivo/CEO: tempo real `setInterval 4s`, filtros por período/depto, KPIs, gráficos, *feed* ao vivo, IA/NEXUS). **Filial** vinculada à empresa-mãe (select). **Fornecedor**, **Unidades**, etc. Segue o padrão de lista.
15. **Usuários** — **ficha 360° em página inteira**. Abas: **Cadastro** (foto/avatar, endereço completo, contatos), **Acesso & e-mail**, **Atuação** (linha do tempo central alternada com data/hora), **Gestão** (feedback, premiações), **RH** (penalidades, afastamentos, atestados), **Perfil & competências** (cursos + **upload de certificado**), **Férias & folgas**, **Análise** (barras coloridas), **Visão 360°** (estilo Power BI + IA), **Pasta** (repositório de arquivos do colaborador). KPIs com ícones coloridos. Cada aba tem **"+ Adicionar" com validação**.
16. **Níveis de acesso** — lista/cards + **config em página inteira** por perfil: **Geral**, **Permissões** (matriz `modulo.recurso.acao` com badges de **MFA**), **Membros**, **Log**. Ações: criar/editar/duplicar/bloquear/excluir.
17. **Integrações** — lista/cards + **config em página inteira** por integração: **Identificação**, **Conexão**, **Autenticação M2M**, **Eventos**, **Logs**, **Avançado**. Tipos reais: **WhatsApp = Baileys** (container Docker; runtime + **QR de pareamento**), **E-mail = SMTP/WHM**, + **integração personalizada** (aberta). **Testar conexão**.
18. **Saúde dos serviços** — lista de containers Docker (busca, status, ações com toast, menu que abre para cima nas últimas linhas).
19. **Configurações** — seções (Geral, etc.).

---

## Interactions & Behavior
- **Navegação por estado** com *gate* RBAC; rota sem permissão → **Forbidden**.
- **Drill-in por clique na linha** (projeto, cadastro, usuário, perfil, integração) → **página inteira** com botão "voltar"; a lista fica oculta (sem gaveta lateral).
- **⋯ por linha** → menu com ações reais + **toast**; nas 2 últimas linhas abre para cima.
- **Kanban**: arrastar cards entre colunas (atualiza contagem/WIP).
- **Sidebar**: recolher/expandir (vira trilho de ícones).
- **Mapa** (Cadastro de Empresa): ícone ancorado no ponto geográfico; **linha Matriz↔Filial sempre visível e animada** (`@keyframes mapFlow`); **nome da unidade só aparece no hover** do ícone; pinos com pulso (`pinPulse`, `pinDrop`).
- **Dashboard executivo (Visão 360°)**: atualização em **tempo real** via `setInterval(4s)` (tick incrementa estado → re-render); filtros por período/departamento.
- **Upload**: avatar do usuário, certificados (Perfil & competências), arquivos (Pasta).
- **Formulários com validação** ("+ Adicionar") em cada aba da ficha de usuário.
- **Transições**: entrada de conteúdo `ntRise` (~.3s); fade de rótulos do mapa `.18s`; linhas `.2s`.

## State Management
Classe única `Component` (estilo React class). `state` guarda, entre outros: `route`, `company`, `nav` (semente `navSeed()`), `collapsed` (sidebar), objetos de trabalho/formulário por página (`*Work`/`*Form`), `openProject`/`openCad`/`openCadRow`/`openUser`/`openRole`, abas ativas (`workTab`, `projTab`, `cfg*`), `mapHover` (hover do pino), `execTick` (relógio do dashboard), `toast`, gavetas/`confirm`, e, por lista, estado de **busca/ordenação/paginação/itens-por-página**. Handlers mutam via `setState`; `renderVals()` monta os *view-models* (incluindo `cadRowView`, `userProfileView`, `aclBuild`, `intConfigView`, `execBuild`, `navEditorView`). Para produção, mapear cada `*Work`/`*Form` e cada lista para o gerenciador de estado do codebase, e cada ação ⋯ para a chamada de API correspondente (revalidada no backend).

## Design Tokens / Assets
- **Ícones**: SVG inline (paths estilo *lucide*) na função `ic(name,size,stroke)`. Em produção, troque pela biblioteca de ícones do codebase (lucide/Heroicons/etc.).
- **Mapa do Brasil**: SVG inline — malha dos 27 estados (fonte: **IBGE / giuliano-macedo/geodata-br-states**, domínio público) projetada para o `viewBox 0 0 1000 1047` e embutida como `<path>` por estado; pinos são `<div>` HTML sobre o SVG. Sem dependência de rede.
- **Fontes**: Inter + JetBrains Mono (via `<link>` no `<helmet>`).
- Nenhuma imagem externa obrigatória; logos/fotos são *placeholders* (avatar/`image-slot`).

## Files
- `LUMEN Core.dc.html` — o protótipo completo (todas as telas, lógica e estilos).
- `support.js` — runtime do Design Component (apenas para abrir o protótipo no navegador; não é produção).
- `LUMEN-ARQUITETURA-CORE-MODULAR-v0.2.md` — documento de arquitetura de referência (Core modular, domínio).
- `CLAUDE.md` — convenções persistentes do projeto (padrão de lista, arquitetura, estilo).

> Para abrir o protótipo: sirva a pasta por HTTP (ex.: `npx serve`) e abra `LUMEN Core.dc.html` — `support.js` precisa carregar ao lado.
