# Sincronização · Claude Design → GitHub → Pages

Este repositório é um **espelho publicável** do projeto do Claude Design.
A fonte da verdade é o **Claude Design** (web) — as pastas `core/`, `modules/`, `extras/` e `docs/` são **geradas** a partir dele. Não edite essas pastas à mão: edite no Claude Design e sincronize.

Já são mantidos à mão (o sync **não** sobrescreve): `index.html` (landing), `README.md`, `.nojekyll`, `.gitignore`, `scripts/`, `sync.bat`.

## Como publicar uma alteração (modo sob comando)

Depois de mexer no design, faça **uma** das opções:

- **Duplo-clique** em `sync.bat`, ou
- No terminal (Git Bash / PowerShell), na raiz do projeto:
  ```bash
  bash scripts/sync.sh
  ```

O script:
1. baixa o projeto atual do Claude Design (zip completo);
2. **só continua se algo mudou** (compara hash — não gera commit à toa);
3. reorganiza no monorepo;
4. faz `commit` + `push` no GitHub;
5. o **GitHub Pages reconstrói sozinho** em ~1 min.

**Site do cliente:** https://jeanpassos.github.io/frontend-lumen/

## (Opcional) Deixar automático a cada 5 minutos

Você escolheu o modo sob comando, mas se um dia quiser ligar o automático,
rode isto **uma vez** no PowerShell (cria uma tarefa agendada no Windows):

```powershell
$acao    = New-ScheduledTaskAction -Execute "C:\Program Files\Git\bin\bash.exe" `
           -Argument '"C:/Projetos-DEV/2026/LUMENS/V1-Template/scripts/sync.sh"'
$gatilho = New-ScheduledTaskTrigger -Once -At (Get-Date) `
           -RepetitionInterval (New-TimeSpan -Minutes 5)
Register-ScheduledTask -TaskName "LUMEN-sync" -Action $acao -Trigger $gatilho -Description "Sync LUMEN (Claude Design -> GitHub Pages)"
```

Para desligar depois:
```powershell
Unregister-ScheduledTask -TaskName "LUMEN-sync" -Confirm:$false
```

> ⚠️ No modo automático, *qualquer* estado do design (mesmo edição pela metade) pode ir ao ar. Por isso o padrão aqui é **sob comando**.

## Trazer o projeto do zero em outra máquina

```bash
curl -o lumen.zip "https://api.anthropic.com/v1/design/projects/4b93fe20-eb85-4200-a281-b3a0d237c9f1/download"
```
(o UUID do projeto funciona como chave; não pede login)
