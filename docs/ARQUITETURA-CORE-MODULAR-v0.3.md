# LUMEN Integrado - Arquitetura do Core e Plataforma Modular

**Versao:** 0.3
**Data:** 2026-06-16
**Status:** Baseline aprovado com ressalvas — Core Platform + modulos independentes
**Origem:** Revisao critica do v0.2 com 10 ajustes obrigatorios incorporados
**Escopo:** Core Platform, modulos independentes, governanca tecnica, banco de dados, seguranca, rastreabilidade, observabilidade, deploy gradual e integracao com NEXUS/HERMES.

---

## Changelog v0.3

Ajustes incorporados em relacao ao v0.2:

1. Separacao explicita Core API / Core Frontend / `@lumen/ui` (secoes 3.3, 8).
2. Core nao interpreta templates de notificacao de dominio: roteamento cego (secao 7.4).
3. Expand-contract obrigatorio para migrations destrutivas (secao 6.7).
4. Padrao EntityRef para dados de referencia compartilhados (secao 6.8).
5. Manifesto de modulo inclui campo de degradacao NEXUS (secao 11).
6. Fase 0 reestruturada em blocos 0A / 0B / 0C com criterio de aceite atingivel (secao 4.1).
7. Contract testing adicionado ao pipeline CI (secao 21.3).
8. ADR-016, ADR-017 e ADR-018 adicionados a lista (secao 28).
9. Estrategia de degradacao do NEXUS definida na secao 24.2.
10. Criterios de aceite da arquitetura expandidos (secao 31).

---

## 1. Objetivo deste documento

Este documento define a arquitetura-base do **LUMEN Integrado**, com foco no **Core Platform** e na forma como os modulos independentes serao desenvolvidos, implantados e integrados.

A decisao principal e explicita e:

> O LUMEN nao deve voltar ao modelo de monolito acoplado. A arquitetura-alvo e Core Platform + modulos independentes, com contratos fortes, governanca obrigatoria e evolucao gradual.

O objetivo principal e evitar que o projeto vire:

- um monolito grande e acoplado;
- um conjunto de microservicos improvisados;
- um sistema sem padrao de deploy;
- uma plataforma com regra de negocio concentrada no Core;
- um ambiente onde cada modulo cria seu proprio padrao de autenticacao, permissao, auditoria, UI, evento e banco.

Este documento deve ser usado como referencia obrigatoria antes de:

- iniciar implementacao do Core;
- criar novo modulo;
- criar banco de dados de modulo;
- definir permissoes;
- criar novas telas;
- integrar modulos;
- alterar infraestrutura;
- criar padroes de deploy;
- criar ADRs;
- orientar equipes internas ou externas.

---

## 2. Decisao arquitetural consolidada

O LUMEN Integrado sera uma plataforma modular composta por:

1. **LUMEN Core Platform**: base comum da plataforma, responsavel por identidade, autorizacao, multiempresa, registry de modulos, menu, layout, auditoria, observabilidade, configuracoes globais e governanca.
2. **Modulos de negocio independentes**: dominios autonomos, com API propria, Docker proprio, repositorio proprio, migrations proprias e isolamento de banco.
3. **NEXUS**: servico externo de IA, RAG, memoria, embeddings, classificacao, Evidence Pack e governanca cognitiva.
4. **HERMES**: servico externo de workflows auditaveis, aprovacoes multi-etapa, timers, retry, compensacao e DLQ.

A decisao conceitual principal e:

> O LUMEN sera uma plataforma modular integrada por Core, com modulos independentes em Docker, Git separado e banco de dados separado por modulo dentro de uma mesma instancia PostgreSQL inicialmente.

Essa decisao nao autoriza microservicos caoticos. Antes de escalar modulos, a plataforma precisa de uma **Fase 0 obrigatoria de governanca e scaffold**.

---

## 3. Principios arquiteturais

### 3.1 Modularidade real

Cada modulo deve ser independente em:

- codigo-fonte;
- repositorio Git;
- Docker;
- API;
- banco de dados;
- migrations;
- permissoes;
- eventos;
- configuracoes;
- deploy;
- testes;
- documentacao tecnica;
- observabilidade.

O modulo nao deve depender de tabela interna, migration, service, model, enum ou regra de negocio de outro modulo.

### 3.2 Core como plataforma, nao como modulo de negocio

O Core fornece capacidades comuns da plataforma.

O Core deve fornecer:

- identidade;
- autenticacao;
- autorizacao;
- multiempresa;
- matriz de permissoes;
- registro de modulos;
- menu dinamico;
- layout padrao;
- roteamento de notificacoes;
- auditoria;
- rastreabilidade;
- logs estruturados;
- correlation_id/request_id;
- configuracoes globais;
- contratos de integracao;
- governanca tecnica;
- base para alta disponibilidade.

O Core nao deve conter:

- regra financeira;
- regra de licitacao;
- regra de contrato;
- regra de chamado;
- regra de RH;
- regra de inventario;
- regra de workflow especifica;
- calculo de margem;
- calculo de folha;
- logica de SLA especifica;
- logica de IA transacional;
- templates de notificacao com logica de dominio;
- acesso direto a banco interno de modulo;
- componentes visuais de dominio (esses pertencem ao `@lumen/ui`).

### 3.3 Separacao Core API / Core Frontend / @lumen/ui

Esses tres artefatos sao independentes e nao devem ser confundidos:

**Core API (`lumen-core` backend)**
- Servico que roda como container.
- Responsavel por: autenticacao, autorizacao, RBAC, multiempresa, registry de modulos, auditoria, roteamento de notificacoes, configuracoes globais, service accounts.
- Expoe endpoints HTTP consumidos por modulos e pelo Core Frontend.

**Core Frontend (`lumen-core` frontend)**
- Shell da plataforma: login, layout, sidebar, topbar, menu dinamico, routing entre modulos.
- Nao contem componentes de dominio.
- Nao contem logica de negocio.
- Consume `@lumen/ui` como dependencia de pacote.

**`@lumen/ui` (pacote de componentes)**
- Biblioteca de componentes visuais reutilizaveis.
- Publicada como pacote NPM interno (ou monorepo).
- Consumida por Core Frontend e por todos os modulos.
- Nao tem dependencia do Core API em runtime.
- Inclui: Button, Input, Select, Table, DataGrid, Modal, Drawer, Kanban, KpiCard, ChartCard, Timeline, StatusBadge, PermissionGuard, PageHeader, FilterBar, AuditLogViewer, FileUploader e outros componentes genéricos.

Regra obrigatoria:

> Modulos dependem do pacote `@lumen/ui`, nao do Core Frontend. O Core Frontend e o shell. O `@lumen/ui` e o kit de componentes. Sao artefatos diferentes com ciclos de vida diferentes.

### 3.4 Contratos fortes entre modulos

A comunicacao entre Core e modulos deve ocorrer por:

- API HTTP interna versionada;
- eventos;
- webhooks internos;
- filas;
- contratos OpenAPI;
- schemas de payload versionados.

E proibido:

- `JOIN` direto entre bancos de modulos;
- leitura direta de tabela de outro modulo;
- import de codigo interno de outro modulo;
- dependencia em model ORM de outro modulo;
- endpoint nao documentado;
- contrato verbal sem schema.

### 3.5 Separacao de responsabilidades

Cada modulo e dono do seu dominio.

Exemplos:

- Financeiro e dono de DRE, plano de contas, fechamento e resultado.
- Contratos e dono de contratos, aditivos e vigencias.
- Licitacoes e dona de editais, certidoes, oportunidades e matching.
- Service Desk e dono de chamados, filas, SLA, macros e base de conhecimento.
- Comunicacao e dona de canais, envio, recebimento e conversas, se aprovada como modulo separado.
- RH e dono de colaboradores, ponto, folha e atestados.
- Inventario e dono de bens, depreciacao e movimentacao.
- Documents e dono de arquivos, versoes, metadados e permissoes documentais.
- NEXUS e dono de IA, RAG, memoria e Evidence Pack.
- HERMES e dono de execucoes de workflow.

### 3.6 Evolucao gradual

A arquitetura deve permitir comecar simples e crescer com seguranca.

A primeira fase pode usar:

- uma instancia PostgreSQL;
- banco separado por modulo;
- Docker Compose;
- Nginx ou Traefik;
- Redis;
- MinIO;
- workers;
- RabbitMQ ou Redis Streams;
- um ambiente HML obrigatorio;
- deploy controlado por checklist.

No futuro, deve permitir:

- Kubernetes ou Swarm, se houver justificativa operacional;
- PostgreSQL dedicado por modulo critico;
- read replicas;
- cluster Redis;
- MinIO distribuido;
- multiplas replicas de APIs;
- filas dedicadas;
- observabilidade avancada;
- segregacao fisica por criticidade.

---

## 4. Fase 0 obrigatoria - Minimum Viable Platform Governance

Antes de criar modulos de negocio, a plataforma precisa entregar uma Fase 0 de governanca minima.

Esta fase e obrigatoria para evitar trocar um monolito acoplado por microservicos desorganizados.

A Fase 0 esta dividida em tres blocos sequenciais. O bloco seguinte so comeca quando o anterior estiver completo e validado.

### 4.1 Bloco 0A — Core funcional minimo

Sem esses itens, nenhum modulo pode existir:

1. Repositorio `lumen-infra` com Compose base, redes, volumes, secrets e convencoes.
2. Repositorio `lumen-core` com Core API (auth, sessoes, RBAC, multiempresa, registry de modulos).
3. Core Frontend com shell: login, layout, sidebar, topbar, menu dinamico.
4. Template/generator oficial de modulo.
5. Manifesto de modulo padrao com schema validavel.
6. ADRs fundamentais aprovados: ADR-001 a ADR-006.

### 4.2 Bloco 0B — Governanca de deploy

Sem esses itens, o primeiro modulo nao pode ir a producao:

7. Padrao de health/readiness/version.
8. Padrao OpenAPI por modulo.
9. Padrao de logs estruturados e correlation_id.
10. Padrao de RBAC modular.
11. CI minimo: lint, typecheck, test, build Docker, scan de secrets, validacao OpenAPI.
12. Ambiente HML operacional com Core rodando.
13. Checklist de deploy e rollback.
14. Backup e restore testados para `lumen_core`.
15. ADR-007 a ADR-010 aprovados.

### 4.3 Bloco 0C — Validacao com modulo piloto

Prova que o scaffold funciona e que a plataforma esta pronta:

16. Modulo piloto gerado exclusivamente pelo scaffold, sem customizacao manual.
17. Modulo piloto sobe, registra no Core, expoe health/readiness/version e aparece no menu.
18. Permissao declarada no manifesto sendo aplicada no frontend.
19. Correlation_id passando de Core ate o modulo.
20. Migration isolada do modulo piloto rodando sem interferir no banco Core.
21. Rollback de migration testado em HML.
22. Um segundo desenvolvedor usou o scaffold sem consultar o autor original.

### 4.4 Regra de bloqueio

Nenhum modulo de negocio deve nascer artesanalmente.

O primeiro modulo real so pode ser iniciado quando o Bloco 0C estiver completo e o scaffold reproduzivel contiver:

- Dockerfile;
- docker-compose.service.yml;
- `.env.example`;
- estrutura backend;
- estrutura frontend quando aplicavel;
- migrations;
- OpenAPI;
- health/readiness/version;
- module-manifest;
- RBAC manifest;
- audit helper;
- logger estruturado;
- correlation_id;
- testes minimos;
- CI minimo;
- README;
- CONTRACT.md.

---

## 5. Decisao de implantacao por modulo

Cada modulo sera implantado como container separado.

Exemplo:

```txt
lumen-core-frontend
lumen-core-api
lumen-postgres
lumen-redis
lumen-minio
lumen-event-bus
lumen-observability

lumen-financeiro-api
lumen-contratos-api
lumen-licitacoes-api
lumen-servicedesk-api
lumen-comunicacao-api
lumen-rh-api
lumen-inventario-api
lumen-documents-api
```

Cada modulo deve ter seu proprio repositorio Git.

Exemplo:

```txt
lumen-infra
lumen-core
lumen-module-financeiro
lumen-module-contratos
lumen-module-licitacoes
lumen-module-servicedesk
lumen-module-comunicacao
lumen-module-rh
lumen-module-inventario
lumen-module-documents
```

### 5.1 Politica de crescimento

A independencia por modulo nao significa criar todos os modulos ao mesmo tempo.

Ordem correta:

1. Core funcional.
2. Scaffold oficial validado.
3. Modulo piloto transversal.
4. Validacao operacional em HML.
5. Primeiro deploy controlado.
6. So entao iniciar novos modulos.

---

## 6. Estrategia de banco de dados

### 6.1 Decisao principal

A estrategia inicial sera:

> Uma instancia PostgreSQL compartilhada, com um banco de dados separado para cada modulo.

Exemplo:

```txt
PostgreSQL Server
  ├── lumen_core
  ├── lumen_documents
  ├── lumen_financeiro
  ├── lumen_contratos
  ├── lumen_licitacoes
  ├── lumen_servicedesk
  ├── lumen_comunicacao
  ├── lumen_rh
  ├── lumen_inventario
  └── lumen_bi
```

### 6.2 Motivos da decisao

Essa estrategia permite:

- isolamento logico entre modulos;
- backup separado por banco;
- controle de acesso por usuario;
- reducao de acoplamento;
- facilidade para mover um modulo para outro servidor no futuro;
- melhor governanca;
- menor risco de uma equipe interferir no banco da outra;
- separacao clara de migrations;
- evolucao independente dos modulos.

### 6.3 Usuario PostgreSQL por modulo

Cada modulo deve ter usuario proprio.

Exemplo:

```txt
db_user_core          -> acesso apenas ao banco lumen_core
db_user_financeiro    -> acesso apenas ao banco lumen_financeiro
db_user_contratos     -> acesso apenas ao banco lumen_contratos
db_user_licitacoes    -> acesso apenas ao banco lumen_licitacoes
db_user_servicedesk   -> acesso apenas ao banco lumen_servicedesk
```

Regra obrigatoria:

> Um modulo nao pode acessar diretamente o banco de outro modulo.

### 6.4 Proibicao de JOIN entre modulos

E proibido:

```sql
SELECT *
FROM lumen_financeiro.entries f
JOIN lumen_contratos.contracts c ON c.id = f.contract_id;
```

O correto e:

- Contratos publica evento;
- Financeiro consome evento;
- Dashboard/BI monta read model;
- ou Core consulta API publica versionada do modulo quando precisar de dado operacional atual.

### 6.5 Dados compartilhados e referencias

Dados compartilhados devem ser tratados de forma explicita.

Permitido:

- `tenant_id` e `company_id` vindos do Core;
- referencia externa por `EntityRef` (ver secao 6.8);
- read model no BI;
- eventos de dominio.

Proibido:

- FK entre bancos de modulos;
- trigger cross-db;
- view materializada lendo banco de outro modulo sem ADR;
- dependencia de schema interno de outro modulo.

### 6.6 Migracao futura de banco

Como cada modulo possui banco proprio, no futuro sera possivel mover um banco para outro servidor.

Exemplo:

```txt
Servidor PostgreSQL 1:
  lumen_core
  lumen_servicedesk
  lumen_comunicacao

Servidor PostgreSQL 2:
  lumen_financeiro

Servidor PostgreSQL 3:
  lumen_bi
```

Essa separacao deve ser possivel sem reescrever o dominio.

### 6.7 Expand-contract para migrations destrutivas

Toda migration que remove coluna, altera tipo ou renomeia campo e considerada destrutiva.

Migrations destrutivas exigem o padrao expand-contract obrigatorio:

**Passo 1 — Expand (versao N):**
Adicionar nova coluna ou estrutura sem remover a antiga. O codigo lida com ambas.

**Passo 2 — Deploy da versao N em HML e producao:**
Validar que tudo funciona com as duas estruturas coexistindo.

**Passo 3 — Contract (versao N+1):**
Remover a estrutura antiga somente apos confirmar que nenhum codigo usa a versao anterior.

Proibido:

- remover coluna em um unico PR junto com a mudanca de codigo;
- alterar tipo de coluna com dado existente sem migration intermediaria;
- fazer rollback de migration destrutiva sem plano de recuperacao previo.

O CONTRATO-DE-MODULO.md deve incluir o expand-contract como padrao obrigatorio para toda migration que altere estrutura existente.

### 6.8 EntityRef e dados de referencia compartilhados

Modulos frequentemente precisam referenciar entidades de outros modulos ou do Core (empresa, usuario, unidade).

Padrao obrigatorio: **EntityRef**

```json
{
  "entity_ref": {
    "module": "core",
    "entity_type": "company",
    "entity_id": "uuid",
    "snapshot": {
      "name": "Empresa XYZ",
      "cached_at": "2026-06-16T10:00:00Z"
    }
  }
}
```

Regras do EntityRef:

- O modulo armazena apenas o `entity_id` e o `module` de origem.
- O snapshot e opcional e usado apenas para exibicao sem nova consulta.
- O snapshot tem validade. Dados criticos devem ser consultados via API do Core no momento do uso.
- Nunca criar FK fisica entre bancos.
- O snapshot nao e fonte de verdade para regras de negocio.

Como resolver referencias:

| Necessidade | Solucao |
|---|---|
| Dado atual em tempo real | Consulta API do Core ou do modulo dono |
| Dado para exibicao em listagem | Snapshot local atualizado por evento |
| Dado historico imutavel | Campo desnormalizado registrado no momento do evento |
| Cruzamento para BI | Read model alimentado por eventos no banco do BI |

---

## 7. Core Platform

### 7.1 Responsabilidade do Core

O Core e a base da plataforma.

Ele deve fornecer:

- autenticacao;
- sessoes;
- tokens;
- refresh token;
- MFA;
- RBAC;
- matriz modulo x nivel;
- multiempresa;
- auditoria;
- logs;
- permissoes;
- registro de modulos;
- menu dinamico;
- roteamento de notificacoes (sem interpretar conteudo de dominio);
- configuracoes globais;
- design system (via pacote `@lumen/ui`);
- gateway de modulos;
- controle de licenciamento;
- rastreabilidade;
- administracao geral.

### 7.2 O que o Core nao deve fazer

O Core nao deve:

- calcular DRE;
- criar contrato;
- calcular folha;
- classificar edital;
- controlar SLA de chamado;
- armazenar regra de workflow de aprovacao;
- armazenar logica especifica de modulos;
- acessar diretamente tabelas internas de modulos;
- permitir excecoes manuais sem auditoria;
- concentrar tudo em uma unica API gigante;
- montar ou renderizar templates de notificacao com logica de dominio.

### 7.3 Administracao real no Core

O Core deve possuir area administrativa completa.

Funcionalidades minimas:

- empresas/tenants;
- unidades;
- usuarios;
- grupos;
- perfis;
- cargos;
- permissoes;
- modulos instalados;
- planos/licencas;
- logs de acesso;
- auditoria;
- sessoes ativas;
- tokens de API;
- service accounts;
- integracoes;
- webhooks;
- configuracoes visuais;
- parametros globais;
- parametros por empresa.

Observacao sobre notificacoes: templates de notificacao ficam no repositorio do modulo dono do dominio. O Core apenas roteia o canal de entrega. Ver secao 7.4.

### 7.4 Padrao de notificacoes no Core

O Core e responsavel pelo **canal** de entrega, nao pelo **conteudo** da notificacao.

Modelo correto:

```
Modulo publica evento com payload completo e pre-renderizado:
{
  "notification": {
    "channel": ["in_app", "email"],
    "recipient_user_ids": ["uuid"],
    "tenant_id": "uuid",
    "subject": "Contrato #123 vencerá em 7 dias",
    "body_html": "<p>O contrato <strong>XYZ</strong> vence em 23/06/2026.</p>",
    "body_text": "O contrato XYZ vence em 23/06/2026.",
    "metadata": {
      "module": "contratos",
      "entity_type": "contract",
      "entity_id": "uuid"
    }
  }
}
```

O Core recebe esse payload e entrega pelo canal solicitado.

Proibido:

- Core interpreta `entity_type` ou `entity_id` para montar o conteudo;
- Core conhece templates especificos de cada modulo;
- modulo chama diretamente servico de e-mail sem passar pelo Core;
- Core armazena regra de quando notificar (isso e responsabilidade do modulo ou do HERMES).

---

## 8. Frontend padrao

### 8.1 Stack sugerida

Frontend:

```txt
React
TypeScript
Vite ou Next.js
TanStack Query
Zod
React Hook Form
Tailwind ou CSS modular
Shadcn/UI ou design system proprio
Recharts/ECharts
```

A decisao Vite x Next.js deve ser tomada por ADR-008, considerando:

- simplicidade operacional;
- SSR real necessario ou nao;
- padrao de deploy;
- maturidade da equipe;
- reaproveitamento do Portal atual;
- necessidade de microfrontends no futuro.

### 8.2 Core Frontend — shell da plataforma

O Core Frontend e responsavel exclusivamente pelo shell:

- pagina de login e autenticacao;
- layout principal (sidebar, topbar, breadcrumbs);
- menu dinamico baseado no registry de modulos;
- routing entre modulos;
- guards de autenticacao e permissao globais;
- carregamento de preferencias de usuario;
- inicializacao do contexto de tenant/company.

O Core Frontend nao contem:

- componentes de negocio especificos de modulo;
- telas de administracao de dominio;
- logica de negocio.

### 8.3 @lumen/ui — pacote de componentes

O pacote `@lumen/ui` e a biblioteca compartilhada de componentes visuais.

Publicado como pacote NPM interno.

Componentes incluidos:

```txt
Button
Input
Select
Table
DataGrid
Modal
Drawer
Kanban
KpiCard
ChartCard
Timeline
StatusBadge
PermissionGuard
PageHeader
FilterBar
AuditLogViewer
FileUploader
EmptyState
ErrorBoundary
LoadingSpinner
ConfirmDialog
```

Regras do `@lumen/ui`:

- Nao tem dependencia do Core API em runtime.
- Nao contem logica de negocio.
- E versionado separadamente do Core.
- Modulos importam do pacote, nao do repositorio do Core.
- Breaking changes no `@lumen/ui` exigem compatibilidade retroativa ou ADR de migracao.

Regra obrigatoria:

> Modulos nao devem criar componentes visuais duplicados se ja houver componente equivalente no `@lumen/ui`. Componentes criados dentro de um modulo que se tornem genericos devem ser migrados para `@lumen/ui` via PR documentado.

### 8.4 Padrao de integracao frontend dos modulos

A opcao mais segura para a Fase 0 e Fase 1:

- Core Frontend entrega shell, login, menu e layout;
- cada modulo entrega rotas e telas conforme contrato definido no manifesto;
- o menu e as permissoes vem do module manifest;
- a UI segue `@lumen/ui`;
- o build e deploy seguem padrao definido pelo scaffold.

Microfrontend remoto (Module Federation ou equivalente) so deve ser adotado com ADR-016 aprovado, pois aumenta complexidade de versionamento, cache, seguranca, dependencias e rollback. Nao e padrao da Fase 0.

---

## 9. Backend do Core

### 9.1 Stack sugerida

Opcao recomendada:

```txt
FastAPI
Python
SQLAlchemy
Alembic
Pydantic
PostgreSQL
Redis
Celery/RQ
MinIO
OpenTelemetry
```

Alternativa aceitavel:

```txt
NestJS
TypeScript
Prisma ou TypeORM
PostgreSQL
Redis
BullMQ
MinIO
OpenTelemetry
```

### 9.2 Criterio de escolha

FastAPI e interessante se o projeto pretende ter forte integracao com IA, automacoes e servicos Python.

NestJS e interessante se a equipe quer manter TypeScript ponta a ponta.

A decisao final deve ser feita em ADR-002 antes da implementacao.

### 9.3 Regras obrigatorias do backend

- Service layer explicito.
- Routers finos.
- Validacao por schema.
- Logs estruturados.
- correlation_id obrigatorio.
- tenant_id/company_id obrigatorio.
- Auditoria em mutacoes relevantes.
- OpenAPI versionado.
- Testes minimos por modulo.
- Sem regra de negocio de modulo dentro do Core.

---

## 10. Registro de modulos

O Core deve possuir um registry de modulos.

Cada modulo deve registrar:

```json
{
  "name": "financeiro",
  "display_name": "Financeiro / Controller",
  "version": "1.0.0",
  "status": "active",
  "base_url": "http://lumen-financeiro-api:8000",
  "health_url": "/health",
  "ready_url": "/ready",
  "version_url": "/version",
  "manifest_url": "/module-manifest",
  "permissions": [],
  "menus": [],
  "events_published": [],
  "events_consumed": [],
  "settings_schema": {},
  "frontend_routes": []
}
```

### 10.1 Status de modulo

Estados possiveis:

```txt
active
inactive
maintenance
deprecated
error
installing
updating
```

### 10.2 Health check

Todo modulo deve expor:

```txt
GET /health
GET /ready
GET /version
GET /module-manifest
```

O Core deve monitorar a saude dos modulos.

### 10.3 Registry explicito, nao magia

O registry pode aceitar registro dinamico, mas a instalacao de modulo em ambiente produtivo deve ser controlada.

Obrigatorio:

- allowlist de modulos autorizados;
- assinatura ou checksum do manifesto no futuro;
- auditoria de ativacao/desativacao;
- status visivel no admin;
- bloqueio de modulo desconhecido em producao.

---

## 11. Manifesto de modulo

Todo modulo deve entregar um manifesto.

Exemplo atualizado (v0.3 inclui campo `nexus_degradation`):

```json
{
  "module": "contratos",
  "version": "1.0.0",
  "owner": "TI/Negocio",
  "base_path": "/contratos",
  "menus": [
    {
      "label": "Contratos",
      "path": "/contratos",
      "permission": "contratos.view"
    }
  ],
  "permissions": [
    "contratos.view",
    "contratos.create",
    "contratos.update",
    "contratos.delete",
    "contratos.approve",
    "contratos.export"
  ],
  "events": {
    "publishes": [
      "contract.created",
      "contract.updated",
      "contract.expired"
    ],
    "subscribes": [
      "edital.matched",
      "workflow.completed"
    ]
  },
  "api": {
    "openapi_url": "/openapi.json",
    "version": "v1"
  },
  "data": {
    "database": "lumen_contratos",
    "migration_tool": "alembic|prisma|sql"
  },
  "nexus_integration": {
    "uses_nexus": true,
    "features": ["classification", "summary"],
    "degradation_policy": "enqueue",
    "degradation_note": "Classificacao automatica de contratos e enfileirada. Contrato criado sem classificacao ate NEXUS voltar."
  },
  "hermes_integration": {
    "uses_hermes": true,
    "workflows": ["contract_approval"],
    "degradation_policy": "block",
    "degradation_note": "Aprovacao de contrato bloqueia sem HERMES disponivel."
  }
}
```

Campos de `nexus_integration.degradation_policy`:

| Valor | Comportamento |
|---|---|
| `block` | Operacao e recusada se NEXUS estiver indisponivel |
| `enqueue` | Operacao e aceita e processada quando NEXUS voltar |
| `degrade` | Operacao prossegue sem IA, com flag explicito ao usuario |
| `none` | Modulo nao usa NEXUS |

Regra:

> Nenhum modulo entra na plataforma sem manifesto, OpenAPI, permissoes declaradas, health/readiness/version, nexus_degradation_policy quando aplicavel e CONTRACT.md.

---

## 12. Permissoes e RBAC modular

### 12.1 Modelo

O modelo de permissao deve suportar:

- usuario;
- grupo;
- perfil;
- tenant;
- modulo;
- recurso;
- acao;
- escopo;
- nivel hierarquico;
- excecoes auditadas.

### 12.2 Padrao de permissao

Formato recomendado:

```txt
modulo.recurso.acao
```

Exemplos:

```txt
financeiro.dre.view
financeiro.dre.export
financeiro.closing.approve

contratos.contract.view
contratos.contract.create
contratos.contract.approve

servicedesk.ticket.view
servicedesk.ticket.assign
servicedesk.ticket.close
```

### 12.3 Matriz de permissoes

O Core deve ter uma tela de matriz:

```txt
Perfil x Modulo x Recurso x Acao
```

### 12.4 Permissoes personalizadas

O sistema deve permitir:

- criar novos perfis;
- editar permissoes;
- copiar perfil;
- herdar permissoes;
- bloquear permissoes criticas;
- aplicar por empresa;
- aplicar por unidade;
- aplicar por modulo;
- auditar toda alteracao.

### 12.5 Permissoes criticas

Algumas permissoes devem exigir confirmacao ou MFA:

```txt
core.user.delete
core.permission.grant_admin
financeiro.closing.reopen
financeiro.payment.approve
contratos.contract.delete
rh.payroll.view
rh.medical_certificate.view
```

### 12.6 Regra de autorizacao

- O Core administra permissoes humanas.
- Modulos validam permissoes recebidas no token/contexto e podem consultar o Core quando necessario.
- Chamadas M2M usam service account e scopes.
- Nenhum modulo cria autenticacao propria.
- Nenhum modulo aceita acao sensivel sem contexto de usuario ou service account auditavel.

---

## 13. Multi-tenancy

### 13.1 Modelo

O sistema sera multiempresa.

Definicao recomendada:

- `tenant_id`: isolamento SaaS principal;
- `company_id`: empresa dentro do tenant, quando aplicavel;
- `unit_id`: unidade, filial ou departamento, quando aplicavel.

### 13.2 Regras obrigatorias

Toda consulta deve respeitar tenant/company.

Todo token deve carregar tenant/company.

Todo evento deve carregar tenant/company.

Todo log deve carregar tenant/company.

Toda permissao deve ser avaliada dentro do tenant/company.

### 13.3 Proibicao

E proibido acessar dados sem filtro de tenant/company.

### 13.4 Defesa em camadas

A aplicacao deve aplicar filtros por tenant/company.

No futuro, RLS pode ser adicionada nos bancos de modulos criticos, mas nao substitui validacao na aplicacao.

---

## 14. Auditoria e rastreabilidade

### 14.1 Regra geral

Toda acao relevante deve gerar auditoria.

Exemplos:

- login;
- logout;
- falha de login;
- criacao de usuario;
- alteracao de permissao;
- alteracao de contrato;
- fechamento financeiro;
- upload de documento;
- download de documento sensivel;
- visualizacao de dados de RH;
- aprovacao;
- exclusao;
- exportacao;
- alteracao de configuracao.

### 14.2 Estrutura minima de auditoria

```json
{
  "audit_id": "uuid",
  "tenant_id": "uuid",
  "company_id": "uuid",
  "user_id": "uuid",
  "service_account_id": "string|null",
  "module": "financeiro",
  "action": "financeiro.closing.approve",
  "entity_type": "financial_closing",
  "entity_id": "uuid",
  "ip": "string",
  "user_agent": "string",
  "before": {},
  "after": {},
  "metadata": {},
  "correlation_id": "string",
  "created_at": "datetime"
}
```

### 14.3 Auditoria imutavel

Logs de auditoria nao devem ser editaveis pelo usuario.

Exclusao logica ou retencao deve seguir politica definida em ADR-015.

### 14.4 Regra de seguranca da auditoria

E proibido gravar payload bruto sem allowlist/redaction.

A auditoria deve remover ou mascarar:

- senhas;
- tokens;
- secrets;
- chaves API;
- dados medicos sensiveis;
- PII excessiva;
- prompts sensiveis;
- conteudo integral de documentos restritos.

---

## 15. Eventos internos

### 15.1 Objetivo

Eventos servem para:

- desacoplar modulos;
- criar read models;
- alimentar BI;
- rastrear historico;
- integrar workflows;
- acionar notificacoes;
- evitar acesso direto entre bancos.

### 15.2 Estrutura padrao de evento

```json
{
  "event_id": "uuid",
  "event_type": "contract.created",
  "event_version": 1,
  "tenant_id": "uuid",
  "company_id": "uuid",
  "source_module": "contratos",
  "actor_user_id": "uuid",
  "actor_service_account_id": null,
  "entity_type": "contract",
  "entity_id": "uuid",
  "occurred_at": "datetime",
  "correlation_id": "uuid",
  "causation_id": "uuid",
  "payload": {}
}
```

### 15.3 Eventos exemplos

```txt
document.uploaded
document.indexed
edital.found
edital.matched
edital.classified
contract.created
contract.approval_requested
workflow.completed
ticket.created
ticket.escalated_to_task
message.received
asset.depreciated
financial.closed
```

### 15.4 Event bus

Opcoes iniciais:

- RabbitMQ;
- Redis Streams;
- NATS.

Recomendacao inicial:

> RabbitMQ ou Redis Streams na primeira fase. Kafka somente com justificativa operacional real.

### 15.5 Outbox pattern

Para eventos de dominio relevantes, os modulos devem usar outbox pattern ou mecanismo equivalente para evitar perda de evento apos commit de banco.

---

## 16. Integracao entre Core e modulos

### 16.1 Comunicacao sincrona

Usar API HTTP interna quando o Core precisa consultar dados atuais ou acionar operacao administrativa.

Exemplo:

```txt
Core -> GET /modules/financeiro/summary
Core -> GET /modules/contratos/health
Core -> GET /modules/documents/module-manifest
```

Regras:

- endpoint precisa estar documentado em OpenAPI;
- chamada precisa carregar correlation_id;
- chamada precisa usar token M2M ou contexto de usuario;
- timeout obrigatorio;
- retry controlado;
- circuit breaker recomendado para modulos criticos.

### 16.2 Comunicacao assincrona

Usar eventos quando um modulo precisa informar algo para outros.

Exemplo:

```txt
Licitacoes publica edital.matched
Contratos consome edital.matched
Contratos publica contract.created
Financeiro consome contract.created
Dashboard/BI consome eventos para read models
```

### 16.3 Proibicao de acoplamento

Proibido:

- importar codigo interno de outro modulo;
- consultar banco de outro modulo;
- depender de model interno de outro modulo;
- chamar endpoint nao documentado;
- duplicar regra de negocio.

### 16.4 Dashboard e BI

Dashboards corporativos nao devem virar uma camada de acoplamento oculto.

Permitido:

- read models alimentados por eventos;
- endpoints publicos versionados por modulo;
- snapshots agregados;
- BI com contratos claros.

Proibido:

- dashboard lendo banco interno de todos os modulos;
- regra de negocio duplicada no dashboard;
- dependencia silenciosa de schema interno.

### 16.5 Contract testing entre Core e modulos

Todo modulo que expoe endpoints consumidos pelo Core ou por outros modulos deve ter testes de contrato.

Objetivo: detectar automaticamente no CI quando uma mudanca no provider quebra um consumer, antes de chegar ao HML.

Abordagem recomendada:

- Consumer-driven contract testing (ex: Pact, ou testes de contrato proprios baseados em OpenAPI).
- O OpenAPI do modulo e a especificacao de contrato. Qualquer mudanca breaking em endpoint publico deve gerar warning ou block no CI.
- O Core deve ter testes que validam os contratos esperados de cada modulo registrado.

Criterio minimo:

- Todo endpoint listado no `openapi.json` do modulo deve ter pelo menos um teste de contrato.
- Mudanca de schema de request/response em endpoint existente exige versao de API (`v1` -> `v2`), nunca mudanca silenciosa.

---

## 17. Seguranca

### 17.1 Autenticacao

O Core deve suportar:

- login por usuario/senha;
- refresh token;
- expiracao de sessao;
- revogacao de sessao;
- MFA;
- politica de senha;
- bloqueio por tentativa;
- recuperacao de senha;
- auditoria de login.

### 17.2 Tokens

Tokens devem conter:

```txt
user_id
tenant_id
company_id
session_id
permissions
roles
exp
iat
jti
```

Refresh tokens devem ter rotacao por `jti`.

### 17.3 Segredos

Segredos devem ficar fora do codigo.

Usar:

- `.env` apenas em desenvolvimento;
- Docker secrets;
- variaveis protegidas no CI/CD;
- Vault no futuro.

Nunca versionar:

- senha;
- token;
- chave privada;
- credencial de banco;
- API key;
- `.env` real.

### 17.4 Comunicacao M2M

Chamadas entre Core, modulos, NEXUS e HERMES devem usar:

- service account;
- scopes;
- token rotacionavel;
- auditoria;
- allowlist de origem quando aplicavel;
- TLS em producao publica.

---

## 18. Infraestrutura Docker

### 18.1 Estrutura inicial

Repositorio `lumen-infra`:

```txt
lumen-infra/
  docker-compose.yml
  docker-compose.hml.yml
  docker-compose.prod.yml
  nginx/
  traefik/
  postgres/
  redis/
  rabbitmq/
  minio/
  observability/
  scripts/
  env/
```

### 18.2 Redes

Separar redes por funcao:

```txt
lumen-public
lumen-internal
lumen-data
lumen-observability
```

### 18.3 Volumes

Volumes persistentes:

```txt
postgres_data
redis_data
rabbitmq_data
minio_data
logs_data
```

### 18.4 Regra de producao

Em producao:

- nao executar container com credencial default;
- nao expor banco publicamente;
- nao expor Redis/RabbitMQ publicamente;
- nao fazer migration destrutiva sem GO explicito e plano expand-contract;
- nao fazer deploy sem rollback conhecido;
- nao fazer deploy direto sem passar por HML.

---

## 19. Alta disponibilidade

Alta disponibilidade e objetivo evolutivo, nao requisito da primeira entrega.

### 19.1 Primeira fase

- backup diario;
- restore testado;
- volumes persistentes;
- health checks;
- restart policy;
- logs centralizados;
- monitoramento basico;
- HML separado.

### 19.2 Fase posterior

- PostgreSQL replica;
- PgBouncer;
- Redis HA;
- MinIO distribuido;
- replicas de APIs;
- balanceador;
- fila resiliente;
- observabilidade avancada.

### 19.3 Regra

Nao antecipar HA sofisticada antes de resolver:

- deploy padronizado;
- backup/restore;
- logs;
- health checks;
- testes;
- rollback;
- ownership de modulos.

---

## 20. Observabilidade

Cada servico deve produzir:

- logs estruturados JSON;
- metrics endpoint;
- health endpoint;
- readiness endpoint;
- version endpoint;
- correlation_id em toda request;
- request_id quando aplicavel;
- user_id/company_id quando aplicavel;
- service_account_id em chamadas M2M;
- tempo de resposta;
- status code;
- erros padronizados.

### 20.1 Metricas minimas

```txt
http_requests_total
http_request_duration_seconds
http_errors_total
module_health_status
audit_events_total
event_publish_total
event_consume_total
event_consume_error_total
job_duration_seconds
job_errors_total
```

### 20.2 Stack recomendada para Fase 0

Para a Fase 0, a stack minima de observabilidade e:

```txt
Prometheus    -> coleta de metricas
Loki          -> agregacao de logs estruturados
Grafana       -> dashboards e alertas
```

Para a Fase 1/2, adicionar:

```txt
Tempo ou Jaeger  -> tracing distribuido
Alertmanager     -> alertas com rotas para canal de notificacao
```

### 20.3 Tracing

OpenTelemetry deve ser o padrao-alvo para rastrear:

- Core -> modulo;
- modulo -> Core;
- modulo -> event bus;
- Portal/Core -> NEXUS;
- Portal/Core -> HERMES;
- workers.

Na Fase 0, tracing basico e suficiente (correlation_id + logs). Tracing completo com spans distribuidos entra na Fase 1/2.

---

## 21. CI/CD e Git

### 21.1 Repositorios

Cada repositorio deve ter:

- README;
- CONTRACT.md;
- Dockerfile;
- compose de desenvolvimento;
- testes;
- lint;
- typecheck;
- pipeline CI;
- changelog;
- versionamento.

### 21.2 Branches

Modelo recomendado:

```txt
main/master      -> branch protegida
feature/*        -> desenvolvimento
fix/*            -> correcoes
release/*        -> preparacao de release
```

### 21.3 Pipeline minimo

Todo PR deve executar:

- lint;
- typecheck;
- testes unitarios;
- **testes de contrato** (validacao do OpenAPI contra contratos declarados);
- build Docker;
- scan de secrets;
- validacao de migration (sem migration destrutiva sem flag expand-contract);
- geracao e validacao do OpenAPI;
- validacao do manifesto contra schema JSON.

### 21.4 Deploy

Deploy deve seguir:

1. merge aprovado;
2. build versionado;
3. deploy HML;
4. smoke HML (definido como: todos os health checks verdes + fluxo principal funcionando manualmente);
5. GO explicito;
6. deploy producao;
7. migration controlada (expand-contract quando destrutiva);
8. smoke producao;
9. registro em changelog/STATE.

---

## 22. Padrao minimo de modulo

Todo modulo deve conter:

```txt
lumen-module-<nome>/
  README.md
  CONTRACT.md
  Dockerfile
  docker-compose.service.yml
  .env.example
  openapi.json ou openapi.yaml
  src/
    main
    config
    api
    service
    repository
    models
    schemas
    permissions
    events
    audit
    observability
  migrations/
  tests/
    unit/
    contract/
  docs/
```

Todo modulo deve expor:

```txt
GET /health
GET /ready
GET /version
GET /module-manifest
GET /openapi.json
```

Todo modulo deve declarar:

- permissoes;
- menus;
- rotas;
- eventos publicados;
- eventos consumidos;
- configuracoes;
- dependencias;
- banco usado;
- ownership;
- criticidade;
- dados sensiveis;
- politica de backup;
- nexus_degradation_policy quando aplicavel;
- hermes_degradation_policy quando aplicavel.

---

## 23. Dashboard e BI

Dashboard e BI devem ser tratados como camada de leitura e analise, nao como dono de regras.

### 23.1 Padroes permitidos

- Read models alimentados por eventos.
- Endpoints publicos versionados por modulo.
- Snapshots agregados.
- Data mart/BI separado quando necessario.

### 23.2 Regras

- Dashboard nao acessa banco interno de modulo sem contrato aprovado.
- Dashboard nao calcula regra de negocio que pertence ao modulo.
- Todo indicador deve mostrar origem do dado.
- Todo indicador critico deve ter data de atualizacao.
- Divergencia entre fonte e read model deve ser monitorada.

---

## 24. Documents, NEXUS e IA

### 24.1 Documents

Documents deve ser um modulo transversal, mas nao deve virar storage informal da plataforma.

Ele deve fornecer:

- upload;
- download;
- versionamento;
- metadados;
- permissoes documentais;
- auditoria;
- preview;
- politica de retencao;
- integracao futura com NEXUS.

### 24.2 NEXUS

NEXUS e servico externo de IA.

NEXUS deve fornecer:

- RAG;
- embeddings;
- memoria;
- completions;
- classificacao;
- Evidence Pack;
- usage log;
- controle de modelo;
- governanca de contexto.

NEXUS nao deve:

- decidir regra transacional;
- calcular regra financeira;
- aprovar contrato;
- controlar SLA;
- virar fonte de verdade do Portal/Core;
- substituir permissao do Core.

**Estrategia de degradacao do NEXUS:**

Todo modulo que usa NEXUS deve declarar seu `nexus_degradation_policy` no manifesto (secao 11).

Regras globais de degradacao:

- NEXUS indisponivel nao pode bloquear operacoes de negocio criticas, salvo quando `degradation_policy` for `block` por decisao explicita do modulo.
- O Core deve monitorar a saude do NEXUS e expor o status no admin.
- Quando NEXUS estiver indisponivel, o status de cada modulo que usa NEXUS deve indicar `degraded` no health check.
- Filas de processamento NEXUS devem ter DLQ propria.

### 24.3 Regra de IA

Toda chamada LLM corporativa deve passar pelo NEXUS.

Resposta corporativa relevante deve carregar Evidence Pack ou indicar explicitamente modo exploratorio.

---

## 25. HERMES e workflow

HERMES e servico externo de workflow.

**Importante:** o engine do HERMES deve ser identificado e contratado em ADR-018 antes da Fase 1. O HERMES pode ser Temporal, Prefect, Camunda, n8n ou servico customizado. Essa decisao afeta o padrao de integracao de cada modulo.

Deve ser usado para:

- aprovacao multi-etapa;
- timers;
- retry;
- compensacao;
- DLQ;
- processos auditaveis;
- workflows long-running.

Nao deve ser usado para:

- CRUD comum;
- simples troca de status;
- regra de negocio de modulo;
- barramento generico de eventos;
- substituir service layer de modulo.

Regra de decisao:

> Se precisa de aprovacao humana rastreavel, retry, timeout, compensacao ou varias etapas, use HERMES. Se e apenas status simples dentro de um CRUD, fica no modulo.

**Estrategia de degradacao do HERMES:**

Modulos devem declarar `hermes_degradation_policy` no manifesto. Quando HERMES estiver indisponivel, o modulo deve saber se bloqueia, enfileira ou degrada.

---

## 26. Regras anti-bagunca

1. Core nao contem regra de negocio de modulo.
2. Modulo nao acessa banco de outro modulo.
3. Modulo nao importa codigo interno de outro modulo.
4. Todo modulo possui manifesto com schema valido.
5. Todo modulo possui OpenAPI.
6. Todo modulo possui health/readiness/version.
7. Todo modulo possui permissoes declaradas.
8. Toda mutacao relevante gera auditoria.
9. Toda request carrega correlation_id.
10. Todo evento possui event_version.
11. Toda tabela de negocio possui tenant/company quando aplicavel.
12. Toda integracao M2M usa service account e scope.
13. Toda migration segue politica do modulo.
14. Nenhum modulo novo nasce sem scaffold oficial.
15. Nenhum deploy em producao sem HML e GO explicito.
16. NEXUS nao decide regra transacional.
17. HERMES nao vira CRUD engine.
18. Dashboard nao vira acoplamento escondido.
19. Kafka, Kubernetes e HA avancada exigem justificativa, nao entram por moda.
20. Comunicacao externa complexa (WhatsApp broadcast, e-mail marketing, chat realtime amplo) exige ADR proprio.
21. Core nao interpreta templates de notificacao de dominio: modulo publica payload pre-renderizado.
22. Toda migration destrutiva usa expand-contract: nunca remover coluna em um unico step.
23. Modulo que usa NEXUS deve declarar degradation_policy: nunca depender de NEXUS sem comportamento definido para falha.
24. Microfrontend remoto so com ADR-016 aprovado: nao entra por conveniencia.
25. EntityRef e o padrao para referencias cross-modulo: nunca FK fisica entre bancos.

---

## 27. Roadmap recomendado

### Fase 0 - Governanca e scaffold obrigatorios

**Bloco 0A — Core funcional minimo:**

- Criar `lumen-infra` com Compose base, redes, volumes, secrets.
- Criar PostgreSQL, Redis.
- Criar Core API: auth, sessoes, RBAC, multiempresa, registry de modulos.
- Criar Core Frontend: shell, login, menu dinamico, layout base.
- Criar pacote `@lumen/ui` com componentes base.
- Criar template/generator de modulo.
- Criar CONTRACT.md padrao.
- Criar module-manifest padrao com schema JSON.
- Aprovar ADR-001 a ADR-006.

**Bloco 0B — Governanca de deploy:**

- Criar padrao de health/readiness/version.
- Criar padrao de OpenAPI por modulo.
- Criar padrao de logs estruturados e correlation_id.
- Criar padrao de RBAC modular.
- Criar CI minimo com contract testing e scan.
- Criar ambiente HML operacional.
- Criar checklist de deploy e rollback.
- Testar backup e restore do `lumen_core`.
- Aprovar ADR-007 a ADR-010.

**Bloco 0C — Validacao com modulo piloto:**

- Gerar modulo piloto exclusivamente pelo scaffold.
- Validar registro, health, permissao e menu no Core.
- Validar correlation_id Core -> modulo.
- Validar migration isolada e rollback em HML.
- Validar que segundo desenvolvedor usa scaffold sem suporte.

### Fase 1 - Modulo piloto transversal

Escolher um modulo piloto.

Sugestao principal:

```txt
Documents
```

Motivo:

- e transversal;
- testa upload;
- testa permissao;
- testa MinIO;
- testa auditoria;
- testa eventos;
- testa integracao futura com NEXUS;
- forca padrao de ownership e seguranca.

Alternativa:

```txt
Service Desk
```

Motivo:

- fluxo operacional claro;
- permissoes;
- filas;
- SLA;
- comentarios;
- base de conhecimento;
- integracao futura com Documents e NEXUS.

### Fase 2 - Plataforma interna madura

- Design system maduro.
- Menus dinamicos.
- Auditoria consolidada.
- Logs estruturados.
- Notificacoes.
- Permissoes avancadas.
- Event bus.
- Health monitor.
- Observabilidade minima (Prometheus + Loki + Grafana).
- Criar ADR-016, ADR-017, ADR-018 se ainda nao aprovados.

### Fase 3 - Modulos estrategicos

- Financeiro.
- Contratos.
- Licitacoes.
- Service Desk.
- RH.
- Inventario.

Comunicacao deve ser avaliada por ADR separado, pois pode envolver WhatsApp, e-mail, chat realtime, compliance, retencao e integracoes externas.

### Fase 4 - NEXUS/RAG

- Documents -> NEXUS por contrato versionado.
- IndexingAllowed gate.
- Permissao em tempo de consulta.
- Evidence Pack.
- Context Cache versionado quando seguro.
- degradation_policy obrigatoria para todos os modulos com NEXUS.

### Fase 5 - HERMES workflows maduros

- Aprovacoes multi-etapa.
- Timers.
- Retry.
- DLQ.
- Compensacao.
- Trilha auditada.
- ADR-018 implementado.

### Fase 6 - Alta disponibilidade

- replicacao PostgreSQL;
- PgBouncer;
- Redis HA;
- MinIO distribuido;
- multiplas replicas;
- CI/CD completo;
- observabilidade avancada (Tempo/Jaeger + Alertmanager).

---

## 28. ADRs necessarios

Antes de implementacao produtiva, criar ADRs para:

```txt
ADR-001 - Decisao Core Platform + modulos independentes (incluindo coexistencia com Portal atual)
ADR-002 - Stack oficial do Core
ADR-003 - Estrategia de banco por modulo
ADR-004 - Modelo de autenticacao e sessao
ADR-005 - Matriz de permissoes modular
ADR-006 - Contrato de modulo e module manifest
ADR-007 - Estrategia de eventos e outbox
ADR-008 - Estrategia de frontend, design system e @lumen/ui
ADR-009 - Estrategia Docker e deploy
ADR-010 - Observabilidade e auditoria
ADR-011 - Integracao com NEXUS e politica de degradacao
ADR-012 - Integracao com HERMES
ADR-013 - Estrategia de backup, restore e HA
ADR-014 - Politica de CI/CD e branch protection
ADR-015 - Politica de dados sensiveis, LGPD e retencao
ADR-016 - Estrategia de microfrontend (shell vs. MFE remoto)
ADR-017 - Migracao e coexistencia com Portal atual
ADR-018 - Identificacao e contrato do engine HERMES
```

**Prioridade por fase:**

| ADR | Obrigatorio antes de |
|---|---|
| ADR-001 a ADR-006 | Bloco 0A |
| ADR-007 a ADR-010 | Bloco 0B |
| ADR-016, ADR-017 | Fase 1 |
| ADR-011, ADR-012 | Fase 1 (se modulo piloto usa NEXUS ou HERMES) |
| ADR-018 | Fase 2 (antes de qualquer workflow de aprovacao) |
| ADR-013 a ADR-015 | Fase 2 |

---

## 29. Decisao consolidada atual

A decisao atual consolidada e:

> O LUMEN Integrado tera um Core Platform robusto, responsavel por identidade, autenticacao, autorizacao, multiempresa, administracao, layout, auditoria, registry de modulos, observabilidade, contratos e governanca. Cada modulo de negocio sera desenvolvido como unidade independente, com Git separado, Docker separado, API propria, migrations proprias e banco PostgreSQL proprio, inicialmente dentro da mesma instancia PostgreSQL. A comunicacao entre modulos sera feita por APIs versionadas, eventos, filas ou webhooks internos, nunca por acesso direto ao banco de outro modulo. O sistema sera preparado para evoluir com rastreabilidade, seguranca, escalabilidade e manutencao por multiplas equipes, sem retornar ao monolito acoplado e sem cair em microservicos improvisados.

---

## 30. Proxima etapa recomendada

A proxima etapa e criar quatro artefatos antes de qualquer modulo novo:

```txt
ADR-001-core-platform-modulos-independentes.md
ADR-017-migracao-portal-atual.md
CORE-PLATFORM-DETALHAMENTO.md
CONTRATO-DE-MODULO.md
```

### 30.1 ADR-001 deve definir

- decisao Core Platform + modulos independentes;
- justificativa contra monolito acoplado;
- justificativa contra microservicos improvisados;
- escopo da Fase 0 com blocos 0A/0B/0C;
- criterios para autorizar primeiro modulo;
- riscos aceitos;
- riscos mitigados;
- nao objetivos.

### 30.2 ADR-017 deve definir

- situacao atual do Portal (funcionalidades, usuarios, dados);
- estrategia de coexistencia (Portal continua rodando em paralelo com LUMEN Integrado?);
- plano de migracao de dados por modulo;
- criterio de cutover por funcionalidade;
- plano de rollback se LUMEN Integrado tiver problema em producao;
- politica de deprecacao do Portal.

### 30.3 CORE-PLATFORM-DETALHAMENTO.md deve detalhar

- tabelas do banco `lumen_core`;
- endpoints do Core;
- matriz de permissoes;
- telas administrativas;
- estrutura do Core Frontend (shell);
- estrutura e API do pacote `@lumen/ui`;
- registry de modulos;
- autenticacao;
- auditoria;
- eventos;
- padrao de notificacoes (roteamento cego);
- contratos obrigatorios dos modulos;
- logs e observabilidade;
- modelo de service accounts.

### 30.4 CONTRATO-DE-MODULO.md deve detalhar

- estrutura minima de repositorio;
- Dockerfile padrao;
- compose padrao;
- manifest padrao com schema JSON;
- OpenAPI padrao;
- permissoes;
- eventos;
- auditoria;
- testes (unitarios + contract testing);
- deploy;
- rollback;
- expand-contract para migrations destrutivas;
- padrao EntityRef para referencias cross-modulo;
- nexus_degradation_policy;
- hermes_degradation_policy;
- checklist de aceite.

---

## 31. Criterios de aceite da arquitetura

A arquitetura so deve ser considerada pronta para iniciar modulos reais quando:

**Bloco 0A completo:**
- Fase 0 Bloco 0A implementada;
- scaffold de modulo gerando repositorio utilizavel;
- Core autenticando e autorizando;
- registry de modulos funcional;
- ADR-001 a ADR-006 aprovados.

**Bloco 0B completo:**
- CI minimo passando em modulo gerado pelo scaffold;
- HML operacional;
- backup e restore testados para `lumen_core`;
- deploy e rollback documentados;
- ADR-007 a ADR-010 aprovados.

**Bloco 0C completo:**
- modulo piloto gerado exclusivamente pelo scaffold;
- modulo piloto registrado, expondo health e aparecendo no menu;
- migration isolada do modulo piloto funcionando;
- rollback de migration testado em HML;
- correlation_id atravessando Core -> modulo;
- contract testing passando no CI;
- segundo desenvolvedor validou o scaffold independentemente;
- smoke test definido executado com sucesso.

**Criterios adicionais (v0.3):**
- manifesto validado contra schema JSON antes de qualquer registro;
- padrao EntityRef documentado no CONTRATO-DE-MODULO.md e testado no modulo piloto;
- expand-contract documentado no CONTRATO-DE-MODULO.md e testado com migration de exemplo;
- notificacoes do modulo piloto passando pelo Core sem o Core interpretar conteudo de dominio;
- degradation_policy declarada no manifesto do modulo piloto quando aplicavel.

---

## 32. Resumo executivo

Este documento define a formula correta para o LUMEN Integrado:

```txt
Core Platform forte (sem regra de negocio)
+ Core Frontend como shell (layout, auth, menu)
+ @lumen/ui como pacote de componentes
+ modulos independentes (Git, Docker, banco, migrations, API)
+ contratos obrigatorios (manifesto, OpenAPI, contract testing)
+ banco isolado por modulo (expand-contract para migrations destrutivas)
+ EntityRef para referencias cross-modulo
+ Fase 0 em blocos 0A/0B/0C com criterio de aceite atingivel
+ HML antes de producao
+ NEXUS para IA com degradation_policy por modulo
+ HERMES para workflows com engine identificado em ADR-018
+ notificacoes via roteamento cego no Core
```

O que esta arquitetura nao e:

- nao e monolito acoplado;
- nao e microservicos improvisados;
- nao e God System concentrado no Core;
- nao e plataforma sem padroes de deploy;
- nao e sistema onde cada modulo cria seus proprios padroes de auth, permissao, banco e auditoria.

---

## 33. Historico de versoes

| Versao | Data | Autor | Resumo |
|---|---|---|---|
| 0.1 | 2026-06-16 | Jean | Documento inicial — Core + modulos |
| 0.2 | 2026-06-16 | Revisao | Correcao de direcao: Core Platform + modulos independentes (sem monolito) |
| 0.3 | 2026-06-16 | Revisao critica | 10 ajustes obrigatorios: separacao Core/Frontend/@lumen/ui, notificacoes roteamento cego, expand-contract, EntityRef, degradacao NEXUS/HERMES, Fase 0 em blocos, contract testing, ADR-016/017/018 |
