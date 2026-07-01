#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# sync.sh — puxa o projeto do Claude Design, reorganiza no monorepo e publica.
# Uso:  bash scripts/sync.sh        (ou dê duplo-clique em sync.bat)
# Modo: sob comando. Só faz commit/push se o design realmente mudou.
# ---------------------------------------------------------------------------
set -euo pipefail

PROJECT_ID="4b93fe20-eb85-4200-a281-b3a0d237c9f1"
LIVE_URL="https://jeanpassos.github.io/frontend-lumen/"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

DL="https://api.anthropic.com/v1/design/projects/$PROJECT_ID/download"
STATE_DIR="$ROOT/.sync"; mkdir -p "$STATE_DIR"
LAST_HASH_FILE="$STATE_DIR/last.sha256"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT

log(){ echo "[sync] $*"; }

# 1) download (o endpoint é aberto; se um dia exigir token, usa a credencial do /design-login)
log "baixando projeto do Claude Design..."
ZIP="$TMP/project.zip"
code=$(curl -s -o "$ZIP" -w "%{http_code}" "$DL")
if [ "$code" != "200" ]; then
  log "download sem token retornou HTTP $code — tentando credencial /design-login"
  TOKEN=$(node -e 'try{console.log(JSON.parse(require("fs").readFileSync(require("os").homedir()+"/.claude/.credentials.json","utf8")).designOauth.accessToken)}catch(e){}' 2>/dev/null || true)
  [ -n "${TOKEN:-}" ] && code=$(curl -s -o "$ZIP" -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$DL")
fi
[ "$code" = "200" ] || { log "ERRO: download falhou (HTTP $code)"; exit 1; }
head -c2 "$ZIP" | grep -q "PK" || { log "ERRO: o arquivo baixado não é um zip válido"; exit 1; }

# 2) detecção de mudança (evita commit/push desnecessário)
NEW_HASH=$(sha256sum "$ZIP" | awk '{print $1}')
if [ -f "$LAST_HASH_FILE" ] && [ "$(cat "$LAST_HASH_FILE")" = "$NEW_HASH" ]; then
  log "sem mudanças no design desde a última sincronização. Nada a publicar."
  exit 0
fi

# 3) extrai para pasta temporária (só mexe no repo depois de extrair com sucesso)
log "extraindo..."
SRC="$TMP/ex"; mkdir -p "$SRC"
unzip -q "$ZIP" -d "$SRC"
SOGI_UP="$SRC/uploads/SOGI - Sistema Operacional de Gestão Interna"

# 4) regenera SOMENTE as pastas derivadas do design.
#    PRESERVA (feito à mão, NÃO listar aqui): index.html, README, .nojekyll, scripts/,
#    e a pasta de navegação  modulos/  (galeria + embed do SOGI + imagens).
#    Atenção: apagamos "modules" (apps do design), NUNCA "modulos" (camada de apresentação).
log "reorganizando monorepo (core, modules, extras, docs)..."
rm -rf "$ROOT/core" "$ROOT/modules" "$ROOT/extras" "$ROOT/docs"

# --- core ---
mkdir -p "$ROOT/core"
cp "$SRC/LUMEN Core.dc.html"              "$ROOT/core/index.html"
cp "$SRC/Apresentação LUMEN Core.dc.html" "$ROOT/core/apresentacao.html"
cp "$SRC/Pager.dc.html"                   "$ROOT/core/pager.html"
cp "$SRC/support.js" "$SRC/deck-stage.js" "$SRC/image-slot.js" "$ROOT/core/"
cp -r "$SRC/screenshots"                   "$ROOT/core/screenshots"

# --- modules/sogi ---
mkdir -p "$ROOT/modules/sogi"
cp -r "$SRC/sogi/app"    "$ROOT/modules/sogi/app"
cp -r "$SRC/sogi/assets" "$ROOT/modules/sogi/assets"
cp "$SRC/sogi/host.html" "$ROOT/modules/sogi/index.html"

# --- modules/_template ---
mkdir -p "$ROOT/modules/_template"
cp -r "$SRC/uploads/templates/frontend-module" "$ROOT/modules/_template/frontend-module"

# --- extras ---
mkdir -p "$ROOT/extras/mockups"
cp "$SRC/uploads/MATRIZ-COMPOSICAO-DOMINIO.html" "$ROOT/extras/matriz-composicao-dominio.html"
[ -f "$SOGI_UP/uploads/its-design-kit.html" ] && cp "$SOGI_UP/uploads/its-design-kit.html" "$ROOT/extras/its-design-kit.html"
cp "$SRC/uploads/"pasted-*.png "$ROOT/extras/mockups/" 2>/dev/null || true

# --- docs ---
mkdir -p "$ROOT/docs/handoff-core" "$ROOT/docs/handoff-sogi"
cp "$SRC/CLAUDE.md"                                      "$ROOT/docs/CONVENCOES-PROJETO.md"
cp "$SRC/uploads/LUMEN-ARQUITETURA-CORE-MODULAR-v0.2.md" "$ROOT/docs/ARQUITETURA-CORE-MODULAR-v0.3.md"
cp "$SRC/design_handoff_lumen_core/README.md"           "$ROOT/docs/handoff-core/README.md"
cp "$SRC/design_handoff_lumen_core/CLAUDE.md"           "$ROOT/docs/handoff-core/CLAUDE.md"
cp "$SRC/design_handoff_lumen_core/LUMEN-ARQUITETURA-CORE-MODULAR-v0.2.md" "$ROOT/docs/handoff-core/ARQUITETURA-v0.2.md"
for f in README.md ARQUITETURA.md core-openapi.yaml manifest.json; do
  [ -f "$SOGI_UP/design_handoff_sogi/$f" ] && cp "$SOGI_UP/design_handoff_sogi/$f" "$ROOT/docs/handoff-sogi/$f"
done
[ -f "$SOGI_UP/manifest.json" ] && cp "$SOGI_UP/manifest.json" "$ROOT/docs/handoff-sogi/module-manifest.json"

# 5) commit + push (só se houver diferença real)
git add -A
if git diff --cached --quiet; then
  log "o design mudou, mas o resultado é idêntico ao que já está publicado. Nada a commitar."
else
  TS="$(date '+%Y-%m-%d %H:%M')"
  git commit -q -m "sync: atualização do Claude Design ($TS)"
  log "commit criado — enviando ao GitHub..."
  git push -q origin main
  log "push concluído. O GitHub Pages vai reconstruir em ~1 min."
fi

echo "$NEW_HASH" > "$LAST_HASH_FILE"
log "pronto ✅  Site do cliente: $LIVE_URL"
