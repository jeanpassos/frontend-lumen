# LUMEN — Plataforma Modular (Core + Módulos)

Protótipo de alta fidelidade do **LUMEN**, a plataforma corporativa modular do **Grupo ITS CS**.
O **Core** entrega o que é transversal (identidade/login, layout, **menu dirigido por estado**, **RBAC granular**, **multiempresa**, kit de UI e as telas de administração da plataforma); cada **módulo** (como o **SOGI**) se encaixa no Core como um container.

> 🔗 **Demo ao vivo:** https://jeanpassos.github.io/frontend-lumen/
> _(publicado via GitHub Pages a partir da branch `main`)_

---

## 🚀 Como abrir

**No navegador (recomendado):** acesse a [demo ao vivo](https://jeanpassos.github.io/frontend-lumen/) e navegue pelos cards.

**Localmente:** os protótipos usam `fetch()` e módulos via CDN, então precisam ser servidos por HTTP (não abra com duplo-clique/`file://`). Na raiz do projeto:

```bash
npx serve .
# depois abra http://localhost:3000/
```

---

## 🗂️ Estrutura (monorepo)

```
frontend-lumen/
├─ index.html                 # Landing: portal com links para tudo
├─ core/                      # LUMEN Core — o shell da plataforma
│  ├─ index.html              #   protótipo principal (Design Component)
│  ├─ apresentacao.html       #   deck de apresentação
│  ├─ pager.html              #   navegador de páginas
│  ├─ support.js              #   runtime do Design Component
│  ├─ deck-stage.js · image-slot.js
│  └─ screenshots/            #   capturas usadas na apresentação
├─ modules/
│  ├─ sogi/                   # Módulo SOGI (React 18 + Babel via CDN)
│  │  ├─ index.html           #   host do módulo
│  │  ├─ app/                 #   telas .jsx + dados
│  │  └─ assets/
│  └─ _template/
│     └─ frontend-module/     # Molde reutilizável (Next.js/TS) p/ novos módulos
├─ extras/                    # Matriz de domínio, ITS Design Kit, mockups
└─ docs/                      # Handoff: arquitetura, tokens, OpenAPI, manifestos
```

## 🧩 Arquitetura em uma frase

- **Core = plataforma** · **Módulo = "Módulo · Docker"** · **serviços externos (NEXUS/HERMES, IA) = "Serviço externo"**.
- **RBAC**: toda permissão no formato `modulo.recurso.acao`; o backend revalida em cada endpoint; MFA nas ações críticas.
- **Multiempresa**: seletor de empresa no topbar; dados particionados por `company_id`.
- **Menu dirigido por estado**: cada módulo registra suas entradas; o Core controla ordem/visibilidade/permissão.

Detalhes completos em [`docs/ARQUITETURA-CORE-MODULAR-v0.3.md`](docs/ARQUITETURA-CORE-MODULAR-v0.3.md) e [`docs/handoff-core/README.md`](docs/handoff-core/README.md).

## 🎨 Design tokens (resumo)

| Token | Hex | Uso |
|---|---|---|
| Navy | `#183c5a` | Sidebar, primário, selos |
| Orange | `#E85928` | Logo, acento, CTAs |
| Blue | `#2f6fed` | Links, acento secundário |
| App bg | `#f0f2f5` | Fundo |
| Success | `#1f9d57` | Ativo/OK |

Tipografia: **Inter** (UI) + **JetBrains Mono** (valores técnicos: `modulo.recurso.acao`, CNPJ, latências).

---

## ⚙️ Notas técnicas

- **`.nojekyll`** está presente de propósito: o GitHub Pages roda Jekyll por padrão, que quebraria com a sintaxe `{{moduleSlug}}` do template de módulo. O arquivo desliga o Jekyll e serve tudo verbatim.
- Os arquivos `core/*.html` são **Design Components** — HTML com estilos inline + uma classe `Component` renderizada pelo `support.js`. **Não são código de produção**; são referência de alta fidelidade para recriação no stack alvo (ver `docs/`).
- O módulo **SOGI** transforma JSX no navegador via Babel standalone (bom para protótipo; em produção, buildar com o toolchain do módulo).

## 📦 Origem

Gerado a partir de um projeto do **Claude Design** e organizado como monorepo para publicação e handoff.
