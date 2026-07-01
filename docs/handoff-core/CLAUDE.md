# LUMEN Core — instruções persistentes do projeto

Arquivo principal: `LUMEN Core.dc.html` (Design Component único).

## PADRÃO DE LISTA (vale para TODAS as páginas que exibem lista/tabela)

Toda página com lista de registros DEVE ter, sem exceção:

1. **Busca** — campo que filtra por texto (nome + campos relevantes), com contador "N registros" ao vivo e estado vazio quando não há resultado.
2. **Alternância Lista / Cards** — toggle no cabeçalho; lista é o padrão.
3. **Ordenação por coluna** — cabeçalhos clicáveis com seta; alterna A–Z / Z–A (e maior→menor / menor→maior em números). Indicador visual da coluna ativa e direção.
4. **Itens por página** — seletor (ex.: 10 / 25 / 50 / 100); padrão 10.
5. **Paginação** — controles anterior/próxima + números de página + texto "X–Y de Z".
6. **Ações por linha (⋯)** — menu com ações reais (mutam o estado + toast). Nas 2 últimas linhas o menu abre PARA CIMA (`bottom`) para não cortar; container do menu não pode clipar (`overflow:visible` na linha/área do menu).
7. **Todos os botões funcionam** — nada decorativo; cada ação muta estado e dá feedback (toast/drawer).

Páginas que seguem (ou devem seguir) esse padrão: Usuários, Níveis de acesso, Cadastros (dados-mestres), Integrações, Saúde dos serviços, Contratos, Licitações, Service Desk, Inventário, Documents, Work Management (listas internas).

## Arquitetura / selo
- Core = plataforma; módulos = "Módulo · Docker"; serviços externos (NEXUS/HERMES, IA) = "Serviço externo".
- RBAC: permissões no formato `modulo.recurso.acao`; backend revalida em todo endpoint; MFA nas ações críticas.
- Multiempresa: seletor de empresa no topbar (Grupo ITS CS).
- Domínio SOGI é referência conceitual (WIP/projetos, tickets/SLA, versão de documento) — não é projeto de UI anexado.
- **Menu dirigido por estado** (`state.nav`, seed em `navSeed()`). Cada módulo "registra" suas entradas; o Core controla ordem/visibilidade/RBAC. Não voltar a um array estático em `modules()`.
- **Página Navegação & menu** (rota `navegacao`, em Plataforma): admin do sidebar — ocultar/mostrar (olho), reordenar (drag + mover ↑/↓), renomear, gate por perfil (chips A/G/O/L) e "pré-visualizar como" perfil. Tudo reflete no sidebar AO VIVO. Restaurar padrão reseta o modelo.

## Estilo
- Inline styles apenas. Paleta aprovada pelo usuário (diverge do bundle do design system de propósito — não "corrigir").
- Sem AI slop. Densidade compacta nas tabelas.
