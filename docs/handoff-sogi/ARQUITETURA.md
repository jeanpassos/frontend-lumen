# SOGI — Arquitetura Modular (Core + Módulos)
> Documento para implementação por desenvolvedor/IA (ex.: Claude Code). Complementa o `README.md` (especificação visual). Aqui está o **como construir**: microserviços, core, registry, gateway, permissões, multi-empresa e banco PostgreSQL.

## 0. Princípio
Cada módulo é **construído e implantado separadamente** (repositório/serviço próprio) e se **registra no Core**. O frontend é um shell (Core UI) que descobre módulos em runtime e monta menus, rotas, telas e widgets dinamicamente. Nada no Core conhece módulos em tempo de compilação.

```
                        ┌────────────────────────────────────────┐
  Browser / PWA ──────▶ │ API GATEWAY (bloqueio + roteamento)    │
                        └───────┬────────────────────────────────┘
                                │ valida JWT · empresa · módulo habilitado · permissão
        ┌───────────┬───────────┼───────────┬───────────┬───────────┐
        ▼           ▼           ▼           ▼           ▼           ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
   │  CORE   │ │projects │ │ tickets │ │  comms  │ │   ai    │ │  ...    │
   │ svc     │ │  svc    │ │  svc    │ │  svc    │ │  svc    │ │         │
   └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └─────────┘
        │           │           │           │           │
        └───────────┴────── RabbitMQ (eventos) ─────────┘
                    PostgreSQL (schema por módulo) · Redis · MinIO · Socket Server
```

## 1. Stack recomendada
| Camada | Tecnologia | Observação |
|---|---|---|
| Serviços | **Node.js 20 + NestJS** (ou Fastify) | 1 serviço por módulo; TypeScript |
| Gateway | **Kong** ou NestJS gateway próprio | plugins de auth + bloqueio por módulo |
| Banco | **PostgreSQL 16** | **1 database, 1 schema por módulo** (isolamento + joins impossíveis entre módulos por convenção; comunicação só por API/eventos) |
| Vetores (IA) | **pgvector** | embeddings da base de conhecimento |
| Cache/sessão | Redis | sessões, presença do chat, rate-limit |
| Mensageria | RabbitMQ | eventos entre módulos (fanout por tópico) |
| Arquivos | MinIO (S3) | documentos, anexos, avatares |
| Tempo real | Socket Server (Socket.IO) próprio | chat, notificações, dashboards realtime |
| Frontend | React 18 + TypeScript + Vite, **Module Federation** | cada módulo publica um `remoteEntry.js` |
| Infra | Docker Compose (dev) / Kubernetes (prod) | health/readiness probes nativos |
| Auth | JWT (access 15min + refresh) + SSO Google (OIDC) + TOTP 2FA | |

## 2. Module Registry (coração do Core)
Estado desejado (exemplo do protótipo):
```
Module Registry
├── projects        online / enabled    v2.4.1
├── tasks           online / enabled    v2.4.1
├── tickets         online / disabled   v1.9.0
├── hr              online / disabled   v1.0.3
├── finance         online / disabled   v1.1.0
├── purchase        online / disabled   v0.8.2
├── documents       online / enabled    v1.3.0
└── ai              online / enabled    v0.9.4-beta
```
- **online/offline** = saúde técnica (health check) — automático
- **enabled/disabled** = decisão administrativa **por empresa** (Configurações → Módulos)

### 2.1 Manifesto do módulo (`module.json`)
Todo módulo publica este contrato no startup (POST `/core/v1/registry/register`):
```jsonc
{
  "key": "tickets",                  // único, imutável
  "name": "Chamados / SLA",
  "version": "1.9.0",                // semver
  "coreApi": "^1.0",                 // faixa de compatibilidade com o Core
  "baseUrl": "http://svc-tickets:3000",
  "healthUrl": "/health",
  "dependsOn": ["notifications"],    // chaves de outros módulos
  "frontend": {
    "remoteEntry": "/mf/remoteEntry.js",     // Module Federation
    "menu": [{ "id": "chamados", "label": "Chamados", "icon": "tickets", "route": "/chamados", "order": 40, "badgeSource": "tickets.active_count" }],
    "settingsSections": [{ "id": "chamadoscfg", "label": "Chamados", "component": "TicketsSettings" }],
    "dashboardWidgets": ["fila_chamados", "chamados_criticos"],   // expostos ao editor de dashboards
    "feedChannels": [],                                            // opcional
    "permissions": ["tickets.read", "tickets.write", "tickets.claim", "tickets.transfer", "tickets.admin"]
  },
  "events": {
    "publishes": ["ticket.created", "ticket.sla_breached", "ticket.resolved"],
    "subscribes": ["user.deactivated", "company.module_toggled"]
  }
}
```
Regras:
1. Core valida `coreApi` (rejeita registro incompatível) e `dependsOn` (não permite *enable* se dependência *disabled*).
2. Registro é idempotente; re-registro com versão nova marca a anterior como `superseded` (histórico em `core.module_versions`).
3. TTL de heartbeat: módulo manda `PUT /registry/heartbeat` a cada 15s; sem 3 heartbeats → `offline` (gateway passa a responder 503 com payload padronizado e o frontend mostra o estado degradado).

### 2.2 Health check (padrão obrigatório por módulo)
```
GET /health        → { "status": "ok|degraded|down", "version": "1.9.0",
                       "uptimeSec": 123456, "checks": {
                         "db": { "status": "ok", "latencyMs": 3 },
                         "rabbit": { "status": "ok" },
                         "deps": { "notifications": "ok" } } }
GET /ready         → 200 quando pronto para tráfego (K8s readiness)
GET /metrics       → Prometheus (cpu interna, filas, p95)
```
A tela **Configurações → Saúde da Stack** do protótipo é exatamente a leitura agregada disso (CPU/RAM/latência/uptime + botão reiniciar = `POST /core/v1/registry/{key}/restart`, que aciona o orquestrador e **grava auditoria**).

## 3. API Gateway — bloqueio em camadas
Ordem de verificação de TODA request `/{module}/v1/...`:
1. **JWT válido** (assinatura, expiração) → senão 401
2. **Empresa ativa** (`X-Company-Id` ∈ empresas do usuário) → senão 403 `COMPANY_FORBIDDEN`
3. **Módulo `online`** no registry → senão 503 `MODULE_OFFLINE`
4. **Módulo `enabled` para a empresa** (`core.company_modules`) → senão 403 `MODULE_DISABLED` (frontend esconde o menu, mas o gateway é a garantia real)
5. **Permissão** do papel para a ação (`core.role_permissions`, nível 0/1/2 — leitura bloqueia métodos de escrita) → senão 403 `PERMISSION_DENIED`
6. Rate-limit por usuário+rota (Redis)

Cache: decisões 2–5 cacheadas em Redis com invalidação por evento `company.module_toggled` / `role.permissions_changed`.

## 4. Menus dinâmicos (frontend Core)
1. No login, Core UI chama `GET /core/v1/me/bootstrap` →
```jsonc
{
  "user": { "id", "name", "role", "status", "theme" },
  "company": { "id", "name" },
  "companies": [...],
  "modules": [   // só os enabled+online para esta empresa, já filtrados por permissão >= leitura
    { "key": "projects", "menu": [...], "remoteEntry": "https://cdn/.../remoteEntry.js", "version": "2.4.1" }
  ],
  "permissions": { "tickets": 2, "projects": 1, ... },   // 0|1|2
  "dashboardTemplate": { ... }                            // template do papel (Config → Dashboards)
}
```
2. Sidebar = concat dos `menu[]` ordenado por `order`. Badge counts via Socket (`badgeSource`).
3. Rotas: o shell faz lazy-load do `remoteEntry` do módulo na primeira navegação (Module Federation). Fallback se módulo cair: tela de estado degradado padrão.
4. Editor de Dashboards consome a união de `dashboardWidgets` dos módulos habilitados — por isso widgets "Fila de chamados" só aparecem se `tickets` estiver enabled.

## 5. Multi-empresa (ativação por empresa)
- Tenancy por **coluna `company_id`** em todas as tabelas de módulos (com RLS — Row Level Security do Postgres ativada por `SET app.company_id`).
- `core.company_modules` é a fonte de verdade do toggle (UI: Configurações → Módulos / Empresas).
- Evento `company.module_toggled {companyId, module, enabled}` → módulos podem reagir (ex.: tickets pausa SLAs).
- Criar empresa (UI já existe) = nova linha em `core.companies` + seed de papéis padrão + zero módulos habilitados.

## 6. Eventos entre módulos (RabbitMQ — exchange `sogi.events`, routing key = nome do evento)
Eventos mínimos do MVP (payloads versionados `{ v: 1, ... }`):
| Evento | Produz | Consome (exemplos) |
|---|---|---|
| `user.created / user.deactivated` | core | **todos** (desligamento RH: tickets abre chamado "cancelar e-mail", comms revoga sessões, gateway invalida tokens) |
| `task.completed` | tasks | gamification (+50 pts), projects (progresso), feed (conquistas) |
| `task.blocked_released` | tasks | notifications |
| `ticket.created / ticket.claimed / ticket.sla_breached / ticket.resolved` | tickets | notifications, gamification, reports |
| `flow.step_advanced` | projects (BPM) | tasks (criar tarefa), comms (WhatsApp/notificar) — as "automações ⚡" do protótipo |
| `document.uploaded` | documents | **ai** (indexação RAG) |
| `approval.signed` | portal/core | projects (desbloquear tarefas), notifications |
| `achievement.unlocked` | gamification | feed (post automático no canal Conquistas) |
| `audit.recorded` | todos | core (consolidação no log pesquisável) |

Regra de ouro: **módulo nunca lê o schema de outro**; integra por evento ou REST via gateway interno.

## 7. PostgreSQL — schemas e tabelas (DDL resumido)
Convenções: `id uuid pk default gen_random_uuid()` · `company_id uuid not null` (RLS) · `created_at/updated_at timestamptz` · soft delete `deleted_at` · FK dentro do próprio schema apenas.

### 7.1 `core`
```sql
companies(id, name, cnpj, active bool, settings jsonb)
users(id, company_id, name, email unique, password_hash, role_id, sector_id,
      status text check (status in ('online','busy','away','invisible','offline')),
      avatar_url, totp_secret, sso_provider, active bool, deactivated_at, deactivated_reason)
sectors(id, company_id, name)
roles(id, company_id, name)                      -- Administrador, Gestor, Colaborador, Suporte, Visitante
role_permissions(role_id, module_key, level smallint check (level in (0,1,2)),
                 primary key(role_id, module_key))
module_registry(key text pk, name, version, base_url, health_url, status text, -- online|offline
                manifest jsonb, last_heartbeat timestamptz)
module_versions(id, module_key, version, manifest jsonb, registered_at)
company_modules(company_id, module_key, enabled bool, enabled_by, enabled_at,
                primary key(company_id, module_key))
audit_log(id, company_id, user_id, module_key, action text, target text,
          detail jsonb, ip inet, created_at)     -- índice GIN em detail + trgm em action/target p/ busca
notifications(id, company_id, user_id, kind, title, body, link, channels text[], read_at)
notification_prefs(user_id, event_key, channel text, enabled bool)   -- matriz evento×canal
dashboard_templates(id, company_id, name, role_id, is_default bool,
                    widgets jsonb)               -- [{type, params:{projectId|queue|source|viz}, order}]
user_dashboards(id, user_id, name, widgets jsonb)                     -- builder de Relatórios
```

### 7.2 `projects` (módulo projects+tasks pode ser 1 serviço com 2 áreas ou 2 serviços)
```sql
projects(id, company_id, code, name, client_name, lead_user_id, due_date,
         health text check (health in ('ok','warn','risk')), progress smallint, archived bool)
project_members(project_id, user_id, role text)
kanban_columns(id, project_id, name, position, wip_limit int null)    -- colunas configuráveis
tasks(id, company_id, project_id null, column_id, title, description,
      assignee_id, priority text, due_at timestamptz, start_at, done_at,
      position, created_by)
task_participants(task_id, user_id)
task_checklist(id, task_id, text, done bool, position)
subtasks(id, parent_task_id, title, done bool)
task_dependencies(task_id, depends_on_task_id, primary key(task_id, depends_on_task_id))
task_comments(id, task_id, user_id, body text, mentions uuid[])
flows(id, project_id, name, version int, definition jsonb,            -- nós/arestas/automações BPM
      created_by)
flow_permissions(flow_id, role_id, level smallint)                    -- ver/editar/excluir
flow_runs(id, flow_id, current_node, history jsonb)
milestones(id, project_id, name, due_date, state)
time_entries(id, company_id, user_id, project_id, task_id, hours numeric, billable bool, day date)
```

### 7.3 `tickets`
```sql
queues(id, company_id, name, hours text, routing text, sla_policy_id, active bool)
queue_agents(queue_id, user_id)
queue_categories(queue_id, category text)
sla_policies(id, company_id, name, rules jsonb)   -- [{priority, first_response_min, resolve_min}]
tickets(id, company_id, number serial, queue_id, title, description, category, subcategory,
        channel text,                              -- portal|email|telefone|monitoramento|interno
        requester_name, requester_email, client_company,
        priority, status text,                     -- na_fila|atendimento|aguardando_cliente|resolvido|fechado
        assignee_id, claimed_at, sla_first_due timestamptz, sla_resolve_due timestamptz,
        sla_breached bool, csat smallint null, resolved_at)
ticket_messages(id, ticket_id, author_id null, author_external text null,
                kind text check (kind in ('reply','note','draft','event')),
                visible_to uuid null,              -- drafts: só o autor
                body text, attachments jsonb)
ticket_watchers(ticket_id, user_id)
```

### 7.4 `comms`
```sql
conversations(id, company_id, kind text,           -- dm|group|sector|project
              name null, project_id null, created_by)
conversation_members(conversation_id, user_id, pinned bool, muted_until)
messages(id, conversation_id, author_id, body text, mentions uuid[],
         kind text,                                -- text|audio|sticker|file|ai_summary
         attachments jsonb, reply_to uuid null)
message_receipts(message_id, user_id, delivered_at, read_at)
message_reactions(message_id, user_id, emoji)
email_accounts(id, company_id, user_id null, address unique, quota_mb, used_mb,
               status, signature_html, signature_image_url, server_id)
email_servers(id, company_id, hostname, kind, smtp_port, imap_port, status, last_sync)
email_filters(id, company_id, kind text,           -- spam|virus|phishing|rule
              config jsonb, ai_enabled bool)
emails(id, account_id, folder text, from_addr, to_addr text[], subject, body, snippet,
       unread bool, quarantined bool, received_at)
supervision_log(id, company_id, admin_id, conversation_id, action, created_at) -- auditoria de supervisão
```

### 7.5 `feed`
```sql
channels(id, company_id, key, name, owner_sector, audience text, active bool,
         auto bool, locked bool)
channel_publishers(channel_id, role_id)
post_templates(id, company_id, name, icon, default_channel_id, fields jsonb,
               read_receipt bool, schedulable bool)
posts(id, company_id, channel_id, author_id, template_id null, kind, title null, body,
      pinned bool, scheduled_at null, published_at, requires_read_receipt bool)
post_reactions(post_id, user_id, emoji)
post_comments(id, post_id, author_id, body)
post_read_receipts(post_id, user_id, read_at)
polls(id, post_id, question, options jsonb, anonymous bool, closes_at)
poll_votes(poll_id, user_id, option_index)         -- unique(poll_id, user_id)
profiles(user_id pk, bio, skills text[], cover_color, birthday date, hired_at date)
```

### 7.6 `documents`
```sql
folders(id, company_id, parent_id null, project_id null, name)
documents(id, company_id, folder_id, name, type text, size_bytes, storage_key,  -- MinIO
          owner_id, ai_indexed bool, version int)
document_versions(id, document_id, version, storage_key, created_by)
diagrams(id, company_id, folder_id, project_id, name, kind text,    -- network|flow
         definition jsonb, version int, created_by)
diagram_permissions(diagram_id, role_id, level smallint)
```

### 7.7 `ai`
```sql
kb_documents(id, company_id, source_document_id, project_code, name, status, chunk_count)
kb_chunks(id, kb_document_id, chunk_index, content text, embedding vector(1536))
   -- índice: CREATE INDEX ON kb_chunks USING hnsw (embedding vector_cosine_ops);
ai_conversations(id, company_id, user_id, scope_project text null)
ai_messages(id, conversation_id, role text, content text, sources jsonb)
ai_usage(id, company_id, month date, tokens_in bigint, tokens_out bigint, cost_cents int)
ai_settings(company_id pk, provider, model, monthly_limit_cents, features jsonb)
```

### 7.8 `gamification`
```sql
rules(id, company_id, key, label, points int, active bool)
point_events(id, company_id, user_id, rule_key, points, ref_type, ref_id, created_at)
achievements(id, company_id, key, name, description, icon, target int)
user_achievements(user_id, achievement_id, progress int, unlocked_at null)
-- ranking = view materializada sobre point_events (refresh por evento, janela mês/total)
```

## 8. Padrões de API
- REST versionado: `/{module}/v1/...` · JSON · paginação `?page=&per_page=` (default 25, máx 100) com `X-Total-Count` (a UI de contas de e-mail com 1.247 itens usa isto)
- Erros: `{ "error": { "code": "MODULE_DISABLED", "message": "...", "traceId": "..." } }`
- Headers: `Authorization: Bearer`, `X-Company-Id`, `X-Request-Id`
- Escritas administrativas devem chamar `POST /core/v1/audit` (ou publicar `audit.recorded`) — a tela Auditoria & Logs pesquisa este consolidado (busca full-text + filtros módulo/usuário/tipo + análise por IA)
- WebSocket: namespace por módulo (`/ws/comms`, `/ws/notifications`), auth pelo mesmo JWT

## 9. Frontend Core (shell)
- Shell: layout (sidebar/topbar/toasts/contexto/tema), auth, bootstrap, registry client, Module Federation host
- Contrato do remote: cada módulo exporta `mount(route)`, `widgets{}`, `settingsSections{}` — tipados num pacote `@sogi/sdk` compartilhado (tokens CSS, componentes base Card/Badge/Avatar/Toast, hooks de permissão `usePermission('tickets', 2)`)
- Tokens de design: importar de `app/tokens.css` do pacote de design (fonte de verdade visual)
- PWA: service worker no shell (cache estático + push via Notification Service)

## 10. Fases de implementação sugeridas
1. **Core**: auth (JWT+SSO+2FA), companies, users/roles/permissions, registry+gateway+health, audit, notifications, shell frontend com menu dinâmico
2. **projects + tasks** (inclui BPM e automações via eventos)
3. **tickets** (filas, SLA scheduler, portal do cliente)
4. **comms** (chat realtime + e-mail/cPanel)
5. **documents + ai** (RAG sobre documentos)
6. **feed + gamification + reports/dashboards**
7. **hr / finance / purchase** (registrados desde o dia 1 como `disabled` — validam o ciclo de vida do registry)

## 11. Critérios de aceite do core (testáveis)
- [ ] Módulo sobe, registra-se e aparece em Saúde da Stack em < 30s
- [ ] Derrubar o serviço `tickets` → menu Chamados some/da estado degradado, gateway responde 503 `MODULE_OFFLINE`, demais módulos intactos
- [ ] Desabilitar `tickets` para a empresa A não afeta empresa B; chamada direta à API retorna 403 `MODULE_DISABLED`
- [ ] Papel "Colaborador" com nível 1 em projects: GET ok, POST 403
- [ ] `user.deactivated` gera: bloqueio de login imediato + chamado automático de cancelamento de e-mail + entrada na auditoria
- [ ] Auditoria registra TODA ação administrativa com usuário+IP e é pesquisável
