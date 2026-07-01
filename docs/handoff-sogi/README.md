# Handoff: SOGI — Sistema Operacional de Gestão Interna (ITS Tecnologia)

> **Leia também o `ARQUITETURA.md`** — arquitetura modular (core + microserviços, module registry, gateway, permissões, multi-empresa) e modelo de dados PostgreSQL completo — **e o `core-openapi.yaml`**, contrato OpenAPI do Core (único ponto de acoplamento entre as stacks independentes de cada módulo).

## Visão geral
O SOGI é a plataforma 360° de gestão interna da ITS: projetos, tarefas, chamados (service desk), calendário, comunicação unificada (chat + e-mail), feed corporativo social, documentos, relatórios/BI, IA com base de conhecimento, gamificação, configurações administrativas multi-empresa, Portal do Cliente e app mobile (PWA).

Este pacote contém o protótipo navegável completo, validado com o cliente, e esta especificação para implementação.

## Sobre os arquivos de design
Os arquivos deste pacote são **referências de design criadas em HTML/React (Babel standalone)** — protótipos que mostram aparência e comportamento pretendidos, **não código de produção para copiar diretamente**. A tarefa é **recriar estas telas no ambiente do código real** (ex.: React + Vite/Next, Vue, etc.) usando os padrões e bibliotecas do projeto. Se ainda não existe ambiente, recomenda-se **React + TypeScript** com um design system próprio baseado nos tokens abaixo; o protótipo já é React, então o mapeamento é direto.

Observações de arquitetura sugeridas pelo protótipo (não obrigatórias):
- Backend modular (módulos ativáveis por empresa — ver Configurações → Módulos)
- Tempo real via WebSocket (chat, notificações, dashboards "tempo real")
- RAG/IA: documentos dos projetos são indexados e citados como fonte nas respostas
- Auditoria transversal: toda ação administrativa registra usuário + IP + timestamp

## Fidelidade
**Alta fidelidade (hifi).** Cores, tipografia, espaçamentos, estados de hover e microinterações são finais e devem ser recriados fielmente com os tokens abaixo. Os dados são fictícios (empresa "ITS Tecnologia", projetos ERP-MIG/PORTAL/NOC-24/LGPD).

## Design tokens (fonte: `app/tokens.css`)

### Cores — marca ITS
| Token | Valor | Uso |
|---|---|---|
| `--nav-bg` | `#183c5a` | Sidebar, headers navy, gradientes de marca |
| `--nav-bg-2` | `#1d4a6e` | Gradiente secundário |
| `--accent` | `#E85928` | Laranja ITS — ações primárias, item ativo |
| `--accent-strong` | `#c64516` | Hover/realce do accent |
| `--accent-soft` | `#fff3ee` | Fundos suaves do accent |
| `--bg` | `#f0f2f5` | Fundo da aplicação |
| `--surface` / `--surface-2` | `#ffffff` / `#f8fafc` | Cards / fundos secundários |
| `--border` / `--border-strong` | `#e2e8f0` / `#cbd5e1` | Bordas |
| `--text` / `--text-2` / `--text-3` | `#1e293b` / `#475569` / `#64748b` | Texto: primário/secundário/terciário |
| `--ok` | `#16a34a` (soft `#f0fdf4`) | Sucesso, SLA ok, online |
| `--warn` | `#d97706` (soft `#fffbeb`) | Atenção, notas internas |
| `--danger` | `#dc2626` (soft `#fef2f2`) | Atraso, SLA estourado, crítico |
| `--violet` | `#0284c7` (soft `#f0f9ff`) | Informativo, e-mail, eventos |

Tema escuro: alternado por botão na topbar; o protótipo redefine as variáveis acima (ver `data-theme="dark"` em `tokens.css`).

### Tipografia
- UI: `'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', sans-serif`
- Mono (códigos, timestamps, métricas): `'JetBrains Mono', 'Cascadia Code', Consolas, monospace`
- Escala: títulos de página 21px/700 · títulos de card 13.5px/600 · corpo 13px · secundário 11–12px · micro/mono 9–10.5px · KPI 27px/700
- Mínimo de toque mobile: 44px

### Métricas
- Radius: cards 10px (`--radius`), pequenos 7px, pills 999px
- Sombras: card `0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px var(--border)`; popover `0 8px 32px rgba(0,0,0,0.13), …`
- Densidade: `--pad` 16px (regular) / 11px (compact — tweak)
- Topbar 56px · Sidebar 232px (recolhida: 64px, só ícones)
- Animações: entradas `fade-up .25s ease` e `pop .15–.2s`; drawers `translateX 0.22s`; tema com transição de cores .3s

## Telas / Módulos

### 1. Login (`app/login.jsx`)
Split-screen: painel navy (logo ITS claro, tagline, 3 métricas) + card de formulário. **Roteamento por perfil**: e-mail `@its.com.br` → SOGI; outro domínio → Portal do Cliente (hint ao vivo sob o campo com bolinha verde/âmbar). Fluxo: senha → 2FA (6 dígitos, reenviar) → app. SSO Google entra direto. Painel da marca some < 860px.

### 2. Shell (`app/components.jsx`, `app/main.jsx`)
- **Sidebar navy** recolhível (botão "Recolher menu", anima width .25s; recolhida mostra badges como pontos vermelhos). Logo ITS claro no topo + "SOGI · Gestão Interna / Sistema Operacional de Gestão Interna". Rodapé: status dos serviços.
- **Topbar**: busca global (⌘K), seletor de empresa (dropdown multi-empresa + criar), botão Assistente IA (painel lateral direito 320px), botão mobile/PWA, toggle tema claro/escuro, sino (dropdown de notificações), e-mail, menu do usuário (status: Disponível/Ocupado/Ausente/**Invisível**; perfil; sair).
- **Toasts** bottom-center (`window.SOGI_TOAST`), **menu de contexto** global por botão direito (`window.SOGI_CTX`) usado em listas (conversas, chamados, contas de e-mail…).

### 3. Dashboard por nível (`app/dashboard.jsx`)
Seletor segmentado: **Minha visão (Colaborador)** — tarefas do dia (atrasada em fundo vermelho), menções, card navy de gamificação, eventos; **Gerencial** — KPIs (projetos/tarefas/chamados/SLA), minhas tarefas, projetos com saúde+progresso, aprovações com Aprovar/Recusar inline, insights de IA, chamados críticos, atividade; **Executivo** — MRR, margem, NPS, horas faturáveis, carteira de clientes com banner de risco de concentração, análise da IA. Em produção, a visão default vem do papel (matriz de Permissões); o admin governa templates em Configurações → Dashboards.

### 4. Projetos (`app/projetos.jsx`, `app/projeto-views.jsx`, `app/fluxograma.jsx`)
Lista em cards (código, saúde, equipe, progresso) → workspace com abas:
- **Dashboard**: burndown SVG, donut por status, marcos, saúde + probabilidade de entrega (IA)
- **Kanban**: drag & drop entre colunas com WIP limit, **colunas configuráveis** (admin), cards com tags/checklist/atrasada
- **Lista**: tabela; linha inteira em vermelho suave quando atrasada
- **Gantt**: barras com progresso interno, linha "hoje", clique abre painel de **mensuração** (duração, desvio, impacto) e botão para a tarefa completa
- **Fluxograma BPM**: SVG com terminais/processos/losango de decisão, loop de rejeição tracejado vermelho, chips de automação âmbar (⚡ criar tarefa, WhatsApp, notificar), zoom, salvar na pasta do projeto com **permissões** (ver/editar/excluir), histórico do processo
- **Workload**: barras empilhadas por projeto (cores de `projColors`), linha de 100%, botão IA "redistribuir" para sobrecarga

**Detalhe de tarefa** (`app/tarefas.jsx` — TaskDrawer): abre **expandido** (modal 2 colunas) com opção Reduzir para drawer lateral; campos editáveis (responsável, prazo com data+hora, prioridade), **subtarefas** e **dependências** (bloqueia/bloqueada por), checklist com progresso, comentários com @menções, análise da IA.

### 5. Tarefas (`app/tarefas.jsx`)
Workspace full-width com abas **Lista** (grupos Hoje/Amanhã/Próximos/Concluídas, concluir dá +50 pts), **Kanban** (drag & drop + colunas configuráveis) e **Semana** (SEG–SEX, drag para replanejar). Botão "Priorizar com IA".

### 6. Chamados (`app/chamados.jsx`)
Service desk profissional com abas **Dashboard / Fila de atendimento / Relatórios / Base de conhecimento** + botões rápidos (filtros, abrir chamado):
- Fila: 3 painéis (filas, lista, detalhe-thread). Respostas ao cliente vs **notas internas** (âmbar tracejado) vs **rascunhos privados** 🔒. Duplo clique → modal tela cheia com composer completo + "IA: pesquisar na base do projeto" (preenche resposta citando procedimento).
- Ações: **Pegar chamado** (claim — avatar atualiza, evento violeta na thread, badge "você pegou"), Transferir de fila, Escalar, Resolver (CSAT), anexos, setor/categoria/canal, SLA por prioridade.
- Relatórios: MTTR, reabertos, CSAT, resolvidos por agente, volume por fila, export CSV/PDF.
- Configurações → Chamados: filas (duplo clique configura: agentes, categorias, horário, roteamento, política de SLA), SLAs por prioridade, categorias.

### 7. Calendário (`app/calendario.jsx`)
Mês (junho/2026) com eventos coloridos por tipo, filtros, clique abre detalhe (sincronizar Google, lembrar equipe via WhatsApp/SMS/e-mail) ou a tarefa; "Novo evento" cria de verdade; visão por ano.

### 8. Comunicação (`app/comunicacao.jsx`)
Caixa unificada multi-mídia (filtros: Chat, E-mail, Chamados, Tarefas — cada item com ícone da mídia):
- **Chat estilo WhatsApp**: bolhas, ✓✓ de leitura, @menções destacadas, links, reações por hover, stickers/emojis, gravação de áudio, anexos; resumo da conversa por IA
- **Nova conversa** (botão +): DM ou grupo com nome
- **E-mail**: item único abre o e-mail; filtro E-mail abre **webmail estilo Outlook antigo** (ícones de pastas à esquerda: entrada/enviados/rascunhos/excluídos; leitura em cima, composição embaixo)
- **Canais Chamados/Tarefas**: responder dali envia para a thread real
- **Supervisão (admin)**: leitura de conversas individuais com banner de auditoria e exportação de transcrição — acesso registrado no log

### 9. Feed corporativo (`app/feed.jsx`) — "Facebook da empresa"
3 colunas: mini-perfil + canais (Geral/Marketing/RH/TI/Conquistas) + grade de colaboradores · composer (anexo, agendar) + posts (badges por tipo, 📌 fixado, reações 👍🎉❤️, comentários) · destaques da semana, enquete com votação, aniversários. **Perfil do colaborador**: capa gradiente, bio, habilidades, gamificação (pontos/ranking/medalhas), contato, publicações; botões Mensagem (→ chat) e E-mail. Governança em Configurações → Feed (canais por setor, quem publica, templates de publicação com construtor de campos, agendadas, políticas: aprovação prévia, confirmação de leitura).

### 10. Documentos (`app/documentos.jsx`)
Pastas gerais + **pastas por projeto** (indexadas na base de conhecimento da IA). Menu "Criar": documento, planilha, **fluxograma de processo** e **mapa de rede/topologia** — editor de diagramas com paleta (servidor, firewall, switch, nuvem, banco, usuários), blocos arrastáveis, **ligações entre blocos** (modo conectar), tela expandível, exportar/salvar na pasta.

### 11. Relatórios (`app/relatorios.jsx`)
Abas **Visão 360°** (tempo real — badge pulsante, KPIs com jitter), **Operação**, **Executivo** (MRR, margem, NPS, carteira), **Visão da IA** (forecast, recomendações) + **Builder**: arrastar widgets, **filtro por projeto (um ou todos)**, salvar com nome → aparece em "Meus dashboards" como aba.

### 12. IA (`app/ia.jsx`)
Chat full com **base de conhecimento**: respostas citam documentos (chips de fonte clicáveis), escopo por projeto, painel de documentos indexados (chunks), re-indexar, sugestões prontas, indicador "consultando a base…".

### 13. Gamificação (`app/gamificacao.jsx`)
Abas: Visão geral (placar navy com progresso de nível, próximas conquistas, destaques com 👏), Conquistas (cards com progresso), Ranking (pódio 🥇🥈🥉 + individual/setorial/corporativo), Histórico de pontos (+/−), Regras & Config (pontuação e preferências).

### 14. Configurações (`app/configuracoes.jsx`, `app/config-dashboards.jsx`, `app/config-feed.jsx`)
16 seções: Geral · **Empresas** (multi-empresa, criar) · **Usuários & RH** (criar usuário, editar, reset de senha, bloquear; **desligamento**: bloqueia acesso automaticamente + abre chamado para TI cancelar o e-mail) · **Permissões** (matriz papel×módulo, clique alterna sem/leitura/total) · **Dashboards** (templates por papel + **editor WYSIWYG em tela cheia**: drag fluido ao vivo, galeria de 17 widgets, widgets parametrizáveis por projeto/fila repetíveis, builder de widget com fonte+visualização e preview, card de texto livre) · **Feed** (canais, templates com construtor de campos, agendadas, políticas) · Módulos (liga/desliga/reinicia, dependências) · **Chamados** (filas, SLA, categorias) · **E-mail** (contas cPanel com **paginação para 1.200+** e busca, editar conta, assinatura com **imagem**, **servidores de e-mail** CRUD com bloqueio, **regras/anti-spam/antivírus/phishing com IA** e quarentena) · **Integrações** (cards conectar/configurar + **construtor de integração com fluxo se/então**) · Notificações (matriz evento×canal) · IA (provedor, limites, recursos) · Segurança (2FA, SSO, IP, sessões, política de senhas) · Saúde da Stack (CPU/RAM/latência/uptime por serviço + botão de análise de saúde) · **Auditoria & Logs** (log do sistema inteiro com busca, filtros e análise por IA) · Aparência.

### 15. Portal do Cliente (`app/portal.jsx`)
Acesso pelo mesmo login (perfil cliente). Header navy próprio. Abas: Meus chamados (com respostas públicas da ITS, responder com anexo), Abrir chamado (categoria, urgência, descrição, anexo — entra na fila real com SLA), Meu projeto (progresso + linha do tempo), Aprovações (**assinatura digital** do termo — desbloqueia tarefas internas).

### 16. Mobile / PWA (`app/mobile.jsx`, `manifest.json`)
Manifest instalável (standalone, tema `#183c5a`, ícone ITS). Demonstração em frame de iPhone: dashboard mobile (KPIs 2×2 + projetos), push notification, aprovação rápida, tarefas com **swipe** (concluir/adiar), comando de voz 🎙️, telas de Tarefas/Chat/Notificações/Aprovações/Chamados/Projetos/Agenda, **bottom-nav personalizável** (até 4 atalhos por usuário). Produção: requer service worker para offline/push reais.

## Interações e comportamento (padrões globais)
- Hover em linhas de lista: fundo `--surface-2`; em cards: elevação + translateY(-2px)
- Botão direito: menu de contexto custom em listas relevantes
- Drag & drop: kanban, semana, gantt (visual), editor de dashboards (reordenação ao vivo), diagramas
- Atrasos sempre em `--danger` (linha/card com fundo vermelho suave + borda esquerda)
- Modais: overlay `rgba(24,60,90,0.4)`, card radius 14, animação pop; drawers deslizam da direita
- Toda ação dá feedback via toast; ações administrativas citam "registrado na auditoria"
- Estados vazios em mono tracejado ("solte aqui", "pasta vazia…")

## Estado (mapa para implementação)
- Sessão: usuário, papel, empresa ativa, status de presença, tema
- Projetos: tasks (col, prioridade, prazo, checklist, dependências), colunas kanban por projeto, fluxos BPM versionados com ACL
- Chamados: tickets (fila, SLA, claim/assignee, thread com tipos reply/note/draft/event), filas configuráveis
- Comunicação: conversas (dm/grupo/setor), mensagens com leitura/reações, e-mails por pasta
- Feed: canais, posts (tipo, fixado, reações, comentários), enquetes, perfis
- Dashboards: templates por papel (instâncias de widget com params {projectId, queue, source, viz}), dashboards salvos por usuário
- Tudo que é admin grava em log de auditoria pesquisável

## Assets
- `assets/its-logo.png` — logo ITS colorido (fundos claros)
- `assets/its-logo-light.png` — logo ITS branco (fundos navy)
- Ícones: SVG inline de traço 1.6–1.7px, 24×24 (dicionário `ICONS` em `app/components.jsx`) — recomendável mapear para Lucide/Heroicons
- Fontes: Segoe UI (sistema) + JetBrains Mono (Google Fonts)

## Arquivos do pacote
`SOGI.html` (entrada) · `manifest.json` · `app/tokens.css` · dados mock: `app/data.js`, `data-extra.js`, `data-extra2.js`, `data-extra3.js` · módulos: `components.jsx`, `main.jsx`, `login.jsx`, `dashboard.jsx`, `projetos.jsx`, `projeto-views.jsx`, `fluxograma.jsx`, `tarefas.jsx`, `chamados.jsx`, `calendario.jsx`, `comunicacao.jsx`, `feed.jsx`, `documentos.jsx`, `relatorios.jsx`, `ia.jsx`, `gamificacao.jsx`, `configuracoes.jsx`, `config-dashboards.jsx`, `config-feed.jsx`, `portal.jsx`, `mobile.jsx`, `ios-frame.jsx` (frame de demonstração), `tweaks-panel.jsx` (ferramenta do protótipo — não implementar) · `assets/`

Para navegar o protótipo: abra `SOGI.html` num servidor local (ex.: `npx serve`). Login: qualquer senha + qualquer código 2FA de 6 dígitos; e-mail de cliente (ex.: `paulo@valeaco.ind.br`) abre o Portal.
