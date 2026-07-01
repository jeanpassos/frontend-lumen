// SOGI — dados de exemplo (empresa fictícia de TI: ITS Tecnologia)
window.SOGI_DATA = (() => {
  const people = {
    rafael:  { id: 'rafael',  name: 'Rafael Souza',    initials: 'RS', color: '#2563eb', role: 'Gerente de Projetos', status: 'online' },
    ana:     { id: 'ana',     name: 'Ana Beatriz',     initials: 'AB', color: '#7c3aed', role: 'Dev Full-stack',      status: 'online' },
    carlos:  { id: 'carlos',  name: 'Carlos Mendes',   initials: 'CM', color: '#0e7490', role: 'Analista de Infra',   status: 'busy' },
    juliana: { id: 'juliana', name: 'Juliana Castro',  initials: 'JC', color: '#be185d', role: 'UX Designer',         status: 'online' },
    pedro:   { id: 'pedro',   name: 'Pedro Lima',      initials: 'PL', color: '#b45309', role: 'Dev Backend',         status: 'away' },
    marina:  { id: 'marina',  name: 'Marina Alves',    initials: 'MA', color: '#15803d', role: 'QA / Testes',         status: 'online' },
    diego:   { id: 'diego',   name: 'Diego Ferreira',  initials: 'DF', color: '#4338ca', role: 'Suporte N2',          status: 'offline' },
  };

  const projects = [
    {
      id: 'p1', code: 'ERP-MIG', name: 'Migração ERP Senior → Cloud',
      client: 'Metalúrgica Vale Aço', lead: 'rafael',
      team: ['rafael', 'ana', 'pedro', 'carlos'],
      progress: 68, dueDate: '28 Jun', health: 'risk',
      healthNote: '2 tarefas críticas atrasadas no módulo fiscal',
      tasksOpen: 14, tasksDone: 31,
    },
    {
      id: 'p2', code: 'PORTAL', name: 'Portal do Cliente 2.0',
      client: 'ITS — Interno', lead: 'juliana',
      team: ['juliana', 'ana', 'marina'],
      progress: 42, dueDate: '15 Jul', health: 'ok',
      healthNote: 'Dentro do cronograma',
      tasksOpen: 22, tasksDone: 17,
    },
    {
      id: 'p3', code: 'NOC-24', name: 'Implantação NOC 24/7',
      client: 'Hospital Santa Clara', lead: 'carlos',
      team: ['carlos', 'diego', 'pedro'],
      progress: 85, dueDate: '12 Jun', health: 'warn',
      healthNote: 'Aguardando aprovação de escala do cliente',
      tasksOpen: 6, tasksDone: 38,
    },
    {
      id: 'p4', code: 'LGPD', name: 'Adequação LGPD — Fase 2',
      client: 'Coop. Agro Horizonte', lead: 'rafael',
      team: ['rafael', 'marina', 'diego'],
      progress: 23, dueDate: '30 Ago', health: 'ok',
      healthNote: 'Kickoff realizado em 02 Jun',
      tasksOpen: 18, tasksDone: 5,
    },
  ];

  // Kanban do projeto p1
  const kanban = {
    columns: [
      { id: 'backlog', name: 'Backlog', wip: null },
      { id: 'todo', name: 'A Fazer', wip: 6 },
      { id: 'doing', name: 'Em Andamento', wip: 4 },
      { id: 'review', name: 'Validação', wip: 3 },
      { id: 'done', name: 'Concluído', wip: null },
    ],
    tasks: [
      { id: 't1', col: 'doing', title: 'Mapear plano de contas para estrutura cloud', tag: 'Fiscal', tagColor: 'danger', assignee: 'pedro', due: '11 Jun', late: true, priority: 'alta', checklist: [4, 7], comments: 5 },
      { id: 't2', col: 'doing', title: 'Script de migração — tabelas de RH', tag: 'Dados', tagColor: 'accent', assignee: 'ana', due: '13 Jun', late: false, priority: 'alta', checklist: [2, 5], comments: 2 },
      { id: 't3', col: 'review', title: 'Homologar integração bancária (CNAB 240)', tag: 'Fiscal', tagColor: 'danger', assignee: 'rafael', due: '10 Jun', late: true, priority: 'crítica', checklist: [6, 6], comments: 11 },
      { id: 't4', col: 'todo', title: 'Configurar ambiente de homologação', tag: 'Infra', tagColor: 'violet', assignee: 'carlos', due: '14 Jun', late: false, priority: 'média', checklist: [0, 3], comments: 0 },
      { id: 't5', col: 'todo', title: 'Treinamento usuários-chave — módulo compras', tag: 'Treinamento', tagColor: 'ok', assignee: 'rafael', due: '18 Jun', late: false, priority: 'média', checklist: [0, 4], comments: 1 },
      { id: 't6', col: 'backlog', title: 'Relatórios gerenciais customizados (12 un.)', tag: 'Dados', tagColor: 'accent', assignee: 'ana', due: '24 Jun', late: false, priority: 'baixa', checklist: [0, 12], comments: 3 },
      { id: 't7', col: 'backlog', title: 'Plano de rollback e contingência', tag: 'Infra', tagColor: 'violet', assignee: 'carlos', due: '20 Jun', late: false, priority: 'média', checklist: [1, 5], comments: 0 },
      { id: 't8', col: 'done', title: 'Levantamento de customizações do legado', tag: 'Análise', tagColor: 'warn', assignee: 'pedro', due: '02 Jun', late: false, priority: 'alta', checklist: [9, 9], comments: 7 },
      { id: 't9', col: 'done', title: 'De-para de cadastros mestres', tag: 'Dados', tagColor: 'accent', assignee: 'ana', due: '05 Jun', late: false, priority: 'alta', checklist: [5, 5], comments: 4 },
      { id: 't10', col: 'review', title: 'Validar folha de pagamento — competência maio', tag: 'RH', tagColor: 'warn', assignee: 'marina', due: '12 Jun', late: false, priority: 'alta', checklist: [3, 4], comments: 6 },
    ],
  };

  const taskDetail = {
    id: 't3',
    title: 'Homologar integração bancária (CNAB 240)',
    project: 'Migração ERP Senior → Cloud',
    description: 'Validar a geração e o retorno de arquivos CNAB 240 com o Banco do Brasil e Itaú no ambiente de homologação. Conferir layouts de cobrança, pagamento a fornecedores e folha.',
    assignee: 'rafael', participants: ['ana', 'pedro'],
    priority: 'crítica', status: 'Validação', due: '10 Jun', late: true,
    checklist: [
      { text: 'Gerar remessa de cobrança — BB', done: true },
      { text: 'Processar retorno de cobrança — BB', done: true },
      { text: 'Gerar remessa de pagamento — Itaú', done: true },
      { text: 'Processar retorno de pagamento — Itaú', done: true },
      { text: 'Validar arquivo de folha (Itaú)', done: true },
      { text: 'Assinar termo de homologação com o cliente', done: true },
    ],
    comments: [
      { who: 'ana', when: 'há 2 h', text: 'Retorno do Itaú processado sem críticas. Falta só o termo de homologação.' },
      { who: 'rafael', when: 'há 1 h', text: 'Agendei assinatura com o financeiro do cliente para amanhã 10h.' },
      { who: 'pedro', when: 'há 20 min', text: 'Deixei o ambiente de homolog congelado até a assinatura. 👍' },
    ],
  };

  const myTasks = [
    { id: 'mt1', title: 'Homologar integração bancária (CNAB 240)', project: 'ERP-MIG', due: 'Hoje', late: true, priority: 'crítica' },
    { id: 'mt2', title: 'Revisar proposta comercial — NOC 24/7', project: 'NOC-24', due: 'Hoje', late: false, priority: 'alta' },
    { id: 'mt3', title: 'Aprovar wireframes do Portal do Cliente', project: 'PORTAL', due: 'Amanhã', late: false, priority: 'média' },
    { id: 'mt4', title: '1:1 com Ana — plano de carreira', project: 'Gestão', due: 'Amanhã', late: false, priority: 'média' },
    { id: 'mt5', title: 'Atualizar matriz de riscos LGPD', project: 'LGPD', due: '13 Jun', late: false, priority: 'baixa' },
  ];

  const approvals = [
    { id: 'a1', what: 'Compra — 3 licenças Windows Server 2025', who: 'carlos', amount: 'R$ 14.700', type: 'Compras' },
    { id: 'a2', what: 'Hora extra — virada de migração (sáb. 14/06)', who: 'pedro', amount: '12 h', type: 'RH' },
    { id: 'a3', what: 'Mudança de escopo — Portal 2.0 (área de boletos)', who: 'juliana', amount: '+32 h', type: 'Projeto' },
  ];

  const tickets = [
    { id: '#4821', title: 'ERP fora do ar — filial Joinville', client: 'Metalúrgica Vale Aço', sla: '0h 42m', slaState: 'breach', priority: 'crítica', assignee: 'diego', status: 'Em atendimento' },
    { id: '#4818', title: 'Lentidão no módulo de faturamento', client: 'Coop. Agro Horizonte', sla: '2h 10m', slaState: 'warn', priority: 'alta', assignee: 'carlos', status: 'Em atendimento' },
    { id: '#4815', title: 'Erro ao emitir NFS-e após atualização', client: 'Hospital Santa Clara', sla: '5h 30m', slaState: 'ok', priority: 'alta', assignee: 'diego', status: 'Aguardando cliente' },
    { id: '#4809', title: 'Solicitação de novo usuário VPN', client: 'ITS — Interno', sla: '1d 4h', slaState: 'ok', priority: 'baixa', assignee: 'carlos', status: 'Na fila' },
    { id: '#4805', title: 'Backup noturno falhou 2x seguidas', client: 'Metalúrgica Vale Aço', sla: '3h 05m', slaState: 'warn', priority: 'alta', assignee: 'carlos', status: 'Em atendimento' },
  ];

  const aiInsights = [
    { kind: 'risk', title: 'ERP-MIG pode estourar o prazo', text: 'A tarefa "CNAB 240" bloqueia 3 dependências. Se a assinatura atrasar mais de 2 dias, a virada de 28/06 fica comprometida.', action: 'Ver plano sugerido' },
    { kind: 'suggest', title: 'Redistribuir carga de Carlos', text: 'Carlos está com 9 tarefas + 3 chamados ativos (140% da capacidade). Diego tem folga de 30% esta semana.', action: 'Redistribuir' },
    { kind: 'info', title: 'Resumo pronto: reunião NOC 24/7', text: 'A ata da reunião de ontem com o Hospital Santa Clara foi gerada automaticamente a partir da gravação.', action: 'Abrir ata' },
  ];

  const chats = [
    { id: 'c1', kind: 'project', name: 'ERP-MIG · Migração', members: 4, unread: 3, last: 'Pedro: ambiente congelado até a assinatura', when: '09:42' },
    { id: 'c2', kind: 'dm', who: 'ana', unread: 1, last: 'Consegue revisar o script antes do almoço?', when: '09:15' },
    { id: 'c3', kind: 'sector', name: 'Infraestrutura', members: 6, unread: 0, last: 'Carlos: janela de manutenção confirmada p/ sábado', when: 'Ontem' },
    { id: 'c4', kind: 'dm', who: 'juliana', unread: 0, last: 'Você: aprovado! pode seguir com a v2 🎉', when: 'Ontem' },
    { id: 'c5', kind: 'project', name: 'NOC-24 · Implantação', members: 3, unread: 0, last: 'Diego: escala revisada enviada ao cliente', when: 'Seg' },
  ];

  const chatMessages = [
    { who: 'ana', when: '09:02', text: 'Bom dia! Rodei a migração das tabelas de RH no ambiente de teste. 412 mil registros, zero erros. 🎯' },
    { who: 'rafael', when: '09:05', text: 'Excelente, Ana! Isso destrava a validação da folha. Marina, consegue priorizar hoje?' },
    { who: 'marina', when: '09:11', text: 'Consigo sim. Começo pela competência de maio e te retorno até as 15h.' },
    { who: 'pedro', when: '09:38', text: 'Pessoal, sobre o CNAB: retorno do Itaú ok. Falta só o termo de homologação com o cliente.' },
    { who: 'pedro', when: '09:42', text: 'Deixei o ambiente de homolog congelado até a assinatura.' },
  ];

  const activity = [
    { who: 'marina', what: 'concluiu a tarefa', target: 'Validar folha — competência abril', when: 'há 35 min', icon: 'check' },
    { who: 'juliana', what: 'anexou 4 arquivos em', target: 'Portal do Cliente 2.0', when: 'há 1 h', icon: 'file' },
    { who: 'diego', what: 'resolveu o chamado', target: '#4799 — Impressora fiscal', when: 'há 2 h', icon: 'ticket' },
    { who: 'carlos', what: 'reiniciou o serviço', target: 'Socket Server (produção)', when: 'há 3 h', icon: 'server' },
    { who: 'ana', what: 'ganhou a conquista', target: 'Entregadora Pontual 🏅', when: 'ontem', icon: 'award' },
  ];

  return { people, projects, kanban, taskDetail, myTasks, approvals, tickets, aiInsights, chats, chatMessages, activity };
})();
