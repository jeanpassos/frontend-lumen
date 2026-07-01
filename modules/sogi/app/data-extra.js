// SOGI — dados extras: calendário, documentos, relatórios, gamificação, módulos, auditoria, supervisão
(() => {
  const D = window.SOGI_DATA;

  // Calendário — junho 2026 (1º jun = segunda-feira)
  D.events = [
    { day: 2, title: 'Kickoff LGPD Fase 2', kind: 'meeting', time: '09:00' },
    { day: 5, title: 'Entrega: de-para cadastros', kind: 'delivery', time: null },
    { day: 9, title: 'Reunião NOC — Hosp. Santa Clara', kind: 'meeting', time: '14:00' },
    { day: 10, title: 'CNAB 240 — homologação', kind: 'task', time: null },
    { day: 10, title: 'Aprovar wireframes Portal', kind: 'task', time: null },
    { day: 11, title: 'Sprint review ERP-MIG', kind: 'meeting', time: '10:00' },
    { day: 12, title: 'Entrega: NOC 24/7 go-live', kind: 'delivery', time: null },
    { day: 14, title: 'Janela de manutenção (sáb.)', kind: 'maintenance', time: '08:00' },
    { day: 16, title: '1:1 Rafael × Ana', kind: 'meeting', time: '11:00' },
    { day: 18, title: 'Treinamento módulo compras', kind: 'task', time: '09:00' },
    { day: 22, title: 'Comitê executivo — status mensal', kind: 'meeting', time: '15:00' },
    { day: 24, title: 'Entrega: relatórios customizados', kind: 'delivery', time: null },
    { day: 28, title: 'Virada ERP — produção', kind: 'delivery', time: null },
  ];

  // Documentos
  D.docFolders = [
    { id: 'f1', name: 'Projetos', count: 24 },
    { id: 'f2', name: 'Contratos', count: 11 },
    { id: 'f3', name: 'Propostas comerciais', count: 8 },
    { id: 'f4', name: 'Processos internos', count: 15 },
    { id: 'f5', name: 'Atas de reunião', count: 31 },
  ];
  D.docs = [
    { name: 'Plano de migração ERP v3.2.pdf', type: 'pdf', size: '4,2 MB', owner: 'rafael', when: 'hoje, 08:14', folder: 'Projetos' },
    { name: 'Ata — Reunião NOC 09-06.docx', type: 'doc', size: '186 KB', owner: 'diego', when: 'ontem', folder: 'Atas de reunião', ai: true },
    { name: 'Matriz de riscos LGPD.xlsx', type: 'sheet', size: '920 KB', owner: 'marina', when: 'ontem', folder: 'Projetos' },
    { name: 'Contrato Vale Aço — aditivo 02.pdf', type: 'pdf', size: '1,8 MB', owner: 'rafael', when: '06 jun', folder: 'Contratos' },
    { name: 'Wireframes Portal 2.0 — v2.fig', type: 'design', size: '12,4 MB', owner: 'juliana', when: '05 jun', folder: 'Projetos' },
    { name: 'Escala NOC 24x7 — proposta.xlsx', type: 'sheet', size: '340 KB', owner: 'carlos', when: '04 jun', folder: 'Propostas comerciais' },
    { name: 'Runbook — backup e contingência.md', type: 'doc', size: '64 KB', owner: 'carlos', when: '02 jun', folder: 'Processos internos' },
  ];

  // Relatórios
  D.reportWeekly = [
    { w: 'S19', done: 14 }, { w: 'S20', done: 18 }, { w: 'S21', done: 11 },
    { w: 'S22', done: 22 }, { w: 'S23', done: 19 }, { w: 'S24', done: 9 },
  ];
  D.reportSLA = [
    { m: 'Jan', v: 93.1 }, { m: 'Fev', v: 94.8 }, { m: 'Mar', v: 92.4 },
    { m: 'Abr', v: 95.6 }, { m: 'Mai', v: 97.1 }, { m: 'Jun', v: 96.2 },
  ];
  D.reportHours = [
    { p: 'ERP-MIG', h: 312, color: 'var(--accent)' },
    { p: 'PORTAL', h: 178, color: 'var(--violet)' },
    { p: 'NOC-24', h: 142, color: 'var(--ok)' },
    { p: 'LGPD', h: 64, color: 'var(--warn)' },
  ];

  // Gamificação
  D.game = {
    me: { points: 2840, level: 'Nível 12 — Estrategista', position: 2, streak: 9 },
    achievements: [
      { name: 'Entregador Pontual', desc: '20 tarefas no prazo seguidas', icon: 'clock', got: true },
      { name: 'Mestre do Kanban', desc: '100 cards concluídos', icon: 'kanban', got: true },
      { name: 'Especialista em Chamados', desc: '50 chamados sem reabertura', icon: 'tickets', got: false },
      { name: 'Colaborador do Mês', desc: 'Maio de 2026', icon: 'award', got: true },
      { name: 'Parceiro da Equipe', desc: '30 ajudas registradas', icon: 'users', got: false },
      { name: 'Zero Atraso', desc: 'Mês inteiro sem atrasos', icon: 'check', got: false },
    ],
    ranking: [
      { who: 'ana', pts: 3120, delta: '+2' },
      { who: 'rafael', pts: 2840, delta: '0' },
      { who: 'marina', pts: 2610, delta: '+1' },
      { who: 'carlos', pts: 2390, delta: '-2' },
      { who: 'juliana', pts: 2150, delta: '0' },
      { who: 'pedro', pts: 1980, delta: '-1' },
      { who: 'diego', pts: 1720, delta: '0' },
    ],
    sectors: [
      { name: 'Desenvolvimento', pts: 7250, members: 3 },
      { name: 'Infraestrutura', pts: 4110, members: 2 },
      { name: 'Projetos & Gestão', pts: 4990, members: 2 },
    ],
  };

  // Módulos da plataforma
  D.modules = [
    { id: 'projetos', name: 'Projetos', version: '2.4.1', status: 'active', cpu: '4%', deps: ['Tarefas'] },
    { id: 'tarefas', name: 'Tarefas', version: '2.4.1', status: 'active', cpu: '6%', deps: [] },
    { id: 'chamados', name: 'Chamados / SLA', version: '1.9.0', status: 'active', cpu: '3%', deps: ['Notificações'] },
    { id: 'chat', name: 'Comunicação', version: '3.1.2', status: 'active', cpu: '11%', deps: ['Socket Server'] },
    { id: 'ia', name: 'Inteligência Artificial', version: '0.9.4-beta', status: 'active', cpu: '18%', deps: ['AI Service'] },
    { id: 'game', name: 'Gamificação', version: '1.2.0', status: 'active', cpu: '1%', deps: ['Tarefas'] },
    { id: 'rh', name: 'RH', version: '1.0.3', status: 'inactive', cpu: '—', deps: [] },
    { id: 'fin', name: 'Financeiro', version: '1.1.0', status: 'inactive', cpu: '—', deps: [] },
    { id: 'compras', name: 'Compras', version: '0.8.2', status: 'inactive', cpu: '—', deps: ['Financeiro'] },
  ];

  // Saúde da stack
  D.services = [
    { name: 'API Gateway', status: 'ok', cpu: 22, ram: 41, latency: '12 ms', uptime: '99.99%' },
    { name: 'Auth', status: 'ok', cpu: 8, ram: 28, latency: '6 ms', uptime: '100%' },
    { name: 'PostgreSQL', status: 'ok', cpu: 35, ram: 62, latency: '3 ms', uptime: '99.98%' },
    { name: 'Redis', status: 'ok', cpu: 5, ram: 19, latency: '1 ms', uptime: '100%' },
    { name: 'RabbitMQ', status: 'warn', cpu: 48, ram: 71, latency: '9 ms', uptime: '99.91%', note: 'fila de notificações acima do normal' },
    { name: 'MinIO', status: 'ok', cpu: 12, ram: 33, latency: '8 ms', uptime: '99.97%' },
    { name: 'Socket Server', status: 'ok', cpu: 17, ram: 39, latency: '4 ms', uptime: '99.95%' },
    { name: 'AI Service', status: 'ok', cpu: 56, ram: 68, latency: '180 ms', uptime: '99.90%' },
    { name: 'Notification Service', status: 'ok', cpu: 9, ram: 24, latency: '15 ms', uptime: '99.99%' },
    { name: 'Chat Service', status: 'ok', cpu: 14, ram: 31, latency: '7 ms', uptime: '99.98%' },
  ];

  // Auditoria
  D.audit = [
    { who: 'rafael', what: 'Aprovou compra — 3 licenças Windows Server', ip: '10.0.4.12', when: 'hoje, 09:51', kind: 'approval' },
    { who: 'carlos', what: 'Reiniciou serviço Socket Server (produção)', ip: '10.0.4.31', when: 'hoje, 07:22', kind: 'service' },
    { who: 'ana', what: 'Alterou prazo da tarefa "Script de migração RH"', ip: '10.0.4.18', when: 'ontem, 17:40', kind: 'change' },
    { who: 'diego', what: 'Acessou modo supervisão do chat', ip: '10.0.4.27', when: 'ontem, 15:12', kind: 'supervision' },
    { who: 'rafael', what: 'Login via SSO (Google Workspace)', ip: '187.94.11.3', when: 'ontem, 08:02', kind: 'login' },
    { who: 'marina', what: 'Excluiu anexo duplicado em PORTAL', ip: '10.0.4.22', when: '06 jun, 16:33', kind: 'delete' },
  ];

  // Usuários (configurações)
  D.usersAdmin = [
    { who: 'rafael', role: 'Administrador', sector: 'Projetos & Gestão', active: true },
    { who: 'ana', role: 'Colaborador', sector: 'Desenvolvimento', active: true },
    { who: 'carlos', role: 'Gestor de Infra', sector: 'Infraestrutura', active: true },
    { who: 'juliana', role: 'Colaborador', sector: 'Desenvolvimento', active: true },
    { who: 'pedro', role: 'Colaborador', sector: 'Desenvolvimento', active: true },
    { who: 'marina', role: 'Colaborador', sector: 'Projetos & Gestão', active: true },
    { who: 'diego', role: 'Supervisor de Suporte', sector: 'Infraestrutura', active: true },
  ];

  // Supervisão de conversas (admin)
  D.supervised = [
    {
      id: 's1', participants: ['ana', 'pedro'], kind: 'dm', msgs: 142, lastWhen: '09:48', flag: null,
      messages: [
        { who: 'ana', when: '09:31', text: 'Pedro, o script de RH tá pronto pra revisão. Consegue olhar antes do almoço?' },
        { who: 'pedro', when: '09:40', text: 'Consigo. Me manda o link do MR que eu reviso até 11h30.' },
        { who: 'ana', when: '09:48', text: 'Mandei! Qualquer coisa me chama aqui.' },
      ],
    },
    {
      id: 's2', participants: ['carlos', 'diego'], kind: 'dm', msgs: 89, lastWhen: '08:15', flag: 'sla',
      messages: [
        { who: 'diego', when: '07:58', text: 'Carlos, o #4821 estourou o SLA. Cliente ligou 2x já.' },
        { who: 'carlos', when: '08:03', text: 'Tô subindo o failover agora. Avisa o cliente que volta em 40 min.' },
        { who: 'diego', when: '08:15', text: 'Avisado. Vou registrar a causa raiz no chamado.' },
      ],
    },
    {
      id: 's3', participants: ['juliana', 'marina'], kind: 'dm', msgs: 56, lastWhen: 'ontem', flag: null,
      messages: [
        { who: 'juliana', when: '16:20', text: 'Marina, os testes do fluxo de boletos passaram?' },
        { who: 'marina', when: '16:45', text: 'Passaram 18 de 20. Os 2 que falharam são de layout no mobile, te mando os prints.' },
      ],
    },
  ];

  // Notificações (dropdown)
  D.notifications = [
    { who: 'ana', text: 'mencionou você em ERP-MIG · Migração', when: 'há 12 min', unread: true },
    { who: 'diego', text: 'escalou o chamado #4821 para você', when: 'há 40 min', unread: true },
    { who: 'marina', text: 'concluiu "Validar folha — competência abril"', when: 'há 1 h', unread: true },
    { who: 'juliana', text: 'pediu sua aprovação: mudança de escopo Portal 2.0', when: 'há 2 h', unread: true },
    { who: 'carlos', text: 'reiniciou o Socket Server — ação registrada', when: 'há 3 h', unread: false },
  ];

  // Gantt (projeto ERP-MIG) — dias de junho
  D.gantt = [
    { name: 'Levantamento de customizações', start: 1, end: 4, who: 'pedro', state: 'done' },
    { name: 'De-para de cadastros mestres', start: 2, end: 5, who: 'ana', state: 'done' },
    { name: 'Homologação CNAB 240', start: 5, end: 10, who: 'rafael', state: 'late' },
    { name: 'Script de migração — RH', start: 8, end: 13, who: 'ana', state: 'doing' },
    { name: 'Validação folha de pagamento', start: 10, end: 12, who: 'marina', state: 'doing' },
    { name: 'Ambiente de homologação', start: 11, end: 14, who: 'carlos', state: 'todo' },
    { name: 'Treinamento usuários-chave', start: 15, end: 19, who: 'rafael', state: 'todo' },
    { name: 'Relatórios customizados', start: 16, end: 24, who: 'ana', state: 'todo' },
    { name: 'Plano de rollback', start: 18, end: 20, who: 'carlos', state: 'todo' },
    { name: 'Virada para produção', start: 26, end: 28, who: 'rafael', state: 'milestone' },
  ];

  // Fluxograma BPM
  D.bpm = {
    nodes: [
      { id: 'inicio', name: 'Início', state: 'done', desc: 'Abertura do processo de migração' },
      { id: 'analise', name: 'Análise', state: 'done', desc: 'Levantamento técnico e de customizações' },
      { id: 'aprovacao', name: 'Aprovação', state: 'active', desc: 'Termo de homologação com o cliente', actions: ['Criar tarefa', 'Enviar WhatsApp', 'Notificar responsável'] },
      { id: 'execucao', name: 'Execução', state: 'pending', desc: 'Migração de dados e configuração' },
      { id: 'validacao', name: 'Validação', state: 'pending', desc: 'Testes integrados com usuários-chave' },
      { id: 'entrega', name: 'Entrega', state: 'pending', desc: 'Virada para produção e suporte assistido' },
    ],
  };

  // Workload
  D.workload = [
    { who: 'carlos', capacity: 140, tasks: 9, tickets: 3 },
    { who: 'ana', capacity: 95, tasks: 7, tickets: 0 },
    { who: 'rafael', capacity: 88, tasks: 6, tickets: 0 },
    { who: 'pedro', capacity: 76, tasks: 5, tickets: 1 },
    { who: 'marina', capacity: 62, tasks: 4, tickets: 0 },
    { who: 'diego', capacity: 70, tasks: 2, tickets: 4 },
    { who: 'juliana', capacity: 55, tasks: 4, tickets: 0 },
  ];
})();
