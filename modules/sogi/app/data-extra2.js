// SOGI — dados v3: tickets detalhados, executivo, base de conhecimento, gamificação+, empresas, integrações
(() => {
  const D = window.SOGI_DATA;

  // ===== Chamados: detalhe com thread =====
  D.ticketQueues = [
    { id: 'todos', label: 'Todos os ativos', count: 5 },
    { id: 'meus', label: 'Atribuídos a mim', count: 0 },
    { id: 'fila', label: 'Na fila', count: 1 },
    { id: 'atendimento', label: 'Em atendimento', count: 3 },
    { id: 'aguardando', label: 'Aguardando cliente', count: 1 },
    { id: 'resolvidos', label: 'Resolvidos (7 dias)', count: 23 },
  ];

  D.ticketDetails = {
    '#4821': {
      category: 'Infraestrutura', subcategory: 'Indisponibilidade', channel: 'Telefone',
      opened: 'hoje, 07:18', slaTarget: '4h (crítico)', requester: 'Paulo Andrade — Metalúrgica Vale Aço',
      desc: 'ERP completamente inacessível na filial Joinville desde as 7h. Aproximadamente 40 usuários parados. Erro de timeout ao conectar.',
      thread: [
        { who: 'diego', kind: 'note', when: '07:22', text: 'Triagem: link principal da filial caiu. Acionando failover 4G enquanto investigo com a operadora.' },
        { who: 'diego', kind: 'reply', when: '07:30', text: 'Paulo, identificamos queda do link principal. Estamos ativando o contingenciamento — previsão de retorno em 40 min.' },
        { who: 'carlos', kind: 'note', when: '08:03', text: 'Failover ativo. BGP reconvergiu. Validando acesso dos usuários.' },
        { who: 'diego', kind: 'reply', when: '08:15', text: 'Acesso restabelecido via contingência. Acompanhando estabilidade até o link principal voltar.' },
      ],
    },
    '#4818': {
      category: 'Sistemas', subcategory: 'Performance', channel: 'Portal',
      opened: 'hoje, 06:40', slaTarget: '8h (alto)', requester: 'Sandra Melo — Coop. Agro Horizonte',
      desc: 'Faturamento demorando mais de 2 minutos para processar cada nota desde a atualização de ontem.',
      thread: [
        { who: 'carlos', kind: 'note', when: '07:10', text: 'Plano de execução da query de impostos mudou após o patch. Analisando índices.' },
        { who: 'carlos', kind: 'reply', when: '08:30', text: 'Sandra, identificamos a causa (índice de banco). Aplicaremos a correção na janela do meio-dia.' },
      ],
    },
    '#4815': {
      category: 'Sistemas', subcategory: 'Erro', channel: 'E-mail',
      opened: 'ontem, 16:20', slaTarget: '8h (alto)', requester: 'Dr. Henrique Costa — Hospital Santa Clara',
      desc: 'Erro "certificado inválido" ao emitir NFS-e após atualização do módulo fiscal.',
      thread: [
        { who: 'diego', kind: 'reply', when: 'ontem, 17:05', text: 'Dr. Henrique, o certificado A1 expirou. Precisamos do novo arquivo .pfx para concluir.' },
      ],
    },
    '#4809': {
      category: 'Acessos', subcategory: 'Novo usuário', channel: 'Portal',
      opened: 'ontem, 11:30', slaTarget: '24h (baixo)', requester: 'RH — ITS Tecnologia',
      desc: 'Criação de acesso VPN para novo colaborador (início dia 16/06).',
      thread: [],
    },
    '#4805': {
      category: 'Infraestrutura', subcategory: 'Backup', channel: 'Monitoramento',
      opened: 'hoje, 03:12', slaTarget: '8h (alto)', requester: 'Alerta automático — Zabbix',
      desc: 'Job de backup noturno do banco da Vale Aço falhou pela 2ª noite consecutiva (erro de espaço em disco no destino).',
      thread: [
        { who: 'carlos', kind: 'note', when: '07:45', text: 'Volume de destino com 96% de uso. Expandindo LUN e re-executando o job.' },
      ],
    },
  };

  D.ticketStats = { today: 8, resolved: 5, avgFirstResponse: '12 min', csat: '4,7' };

  // ===== Relatórios: executivo =====
  D.exec = {
    mrr: [38, 41, 40, 44, 47, 49],           // R$ mil, jan–jun
    margin: [22, 24, 21, 26, 28, 29],         // %
    billableSplit: { billable: 68, internal: 22, bench: 10 },
    nps: 72,
    clients: [
      { name: 'Metalúrgica Vale Aço', mrr: 'R$ 18.4k', health: 'risk', contracts: 3 },
      { name: 'Hospital Santa Clara', mrr: 'R$ 12.1k', health: 'ok', contracts: 2 },
      { name: 'Coop. Agro Horizonte', mrr: 'R$ 9.8k', health: 'ok', contracts: 2 },
      { name: 'Construtora Prisma', mrr: 'R$ 5.2k', health: 'warn', contracts: 1 },
    ],
    forecast: { label: 'Projeção de entrega ERP-MIG', current: 68, projected: [68, 74, 81, 87, 93, 100], risk: '28/06 com 2 dias de buffer se o CNAB sair até 12/06' },
  };
  D.ticketsPerDay = [6, 9, 4, 7, 11, 5, 8];
  D.opsByPerson = [
    { who: 'ana', done: 22, hours: 64 },
    { who: 'pedro', done: 17, hours: 58 },
    { who: 'marina', done: 15, hours: 52 },
    { who: 'carlos', done: 12, hours: 71 },
    { who: 'juliana', done: 14, hours: 49 },
    { who: 'diego', done: 9, hours: 66 },
  ];

  // ===== IA: base de conhecimento =====
  D.kb = [
    { name: 'Plano de migração ERP v3.2.pdf', project: 'ERP-MIG', status: 'indexado', chunks: 142 },
    { name: 'Matriz de riscos LGPD.xlsx', project: 'LGPD', status: 'indexado', chunks: 38 },
    { name: 'Ata — Reunião NOC 09-06.docx', project: 'NOC-24', status: 'indexado', chunks: 12 },
    { name: 'Contrato Vale Aço — aditivo 02.pdf', project: 'ERP-MIG', status: 'indexado', chunks: 56 },
    { name: 'Runbook — backup e contingência.md', project: 'Infra', status: 'indexado', chunks: 24 },
    { name: 'Wireframes Portal 2.0 — v2.fig', project: 'PORTAL', status: 'não indexável', chunks: 0 },
  ];
  D.aiChat = [
    { who: 'user', text: 'Qual é o plano de rollback da virada do ERP?' },
    { who: 'ai', text: 'Segundo o **Plano de migração ERP v3.2** (seção 9, pág. 34), o rollback prevê: (1) snapshot completo do banco às 22h de 27/06, antes da virada; (2) janela de decisão go/no-go até 06h de 28/06; (3) se acionado, restauração do snapshot + reativação do legado em até 4h, com DNS revertido. O responsável é o Carlos Mendes, e o critério de acionamento é falha em qualquer um dos 12 testes críticos da seção 8.', sources: ['Plano de migração ERP v3.2.pdf · seção 9', 'Runbook — backup e contingência.md'] },
  ];
  D.aiCanned = [
    { text: 'Com base no **Contrato Vale Aço — aditivo 02** (cláusula 4.2), o prazo contratual da virada é 30/06 com multa de 0,5% por dia útil de atraso. O cronograma atual (28/06) tem 2 dias úteis de folga.', sources: ['Contrato Vale Aço — aditivo 02.pdf · cláusula 4.2'] },
    { text: 'A **Matriz de riscos LGPD** lista 14 riscos abertos, sendo 3 de severidade alta: retenção de dados de ex-funcionários, ausência de DPO formal e logs de acesso incompletos. Sugiro priorizar o item de logs, que também impacta a auditoria do SOGI.', sources: ['Matriz de riscos LGPD.xlsx · aba "Abertos"'] },
    { text: 'Pela **Ata da reunião NOC de 09/06**, ficou acordado: escala 24/7 inicia em 15/06 com 4 operadores, o cliente aprova a escala até 11/06, e o go-live formal é 12/06. Pendência: assinatura da escala revisada (enviada ontem pelo Diego).', sources: ['Ata — Reunião NOC 09-06.docx'] },
  ];

  // ===== Gamificação: histórico + config =====
  D.gameHistory = [
    { when: 'hoje, 09:10', what: 'Entrega no prazo — "Validar folha competência abril"', pts: '+50', who: 'marina' },
    { when: 'hoje, 08:20', what: 'Chamado #4799 resolvido dentro do SLA', pts: '+30', who: 'diego' },
    { when: 'ontem, 17:30', what: 'Conquista desbloqueada — Mestre do Kanban', pts: '+200', who: 'ana' },
    { when: 'ontem, 15:00', what: 'Ajuda registrada — revisão de código para Pedro', pts: '+15', who: 'ana' },
    { when: 'ontem, 11:45', what: 'Tarefa crítica atrasada — "CNAB 240"', pts: '-20', who: 'rafael' },
    { when: '06 jun, 16:00', what: 'Colaborador do Mês — Maio 2026', pts: '+500', who: 'rafael' },
  ];
  D.gameRules = [
    { rule: 'Tarefa entregue no prazo', pts: '+50' },
    { rule: 'Chamado resolvido dentro do SLA', pts: '+30' },
    { rule: 'Ajuda a colega registrada', pts: '+15' },
    { rule: 'Conquista desbloqueada', pts: '+200' },
    { rule: 'Tarefa crítica atrasada', pts: '-20' },
  ];

  // ===== Multi-empresa =====
  D.companies = [
    { id: 'its', name: 'ITS Tecnologia', cnpj: '12.345.678/0001-90', users: 7, modules: 6, active: true, current: true },
    { id: 'itsf', name: 'ITS Filial — São Paulo', cnpj: '12.345.678/0002-71', users: 3, modules: 4, active: true, current: false },
    { id: 'lab', name: 'ITS Labs (sandbox)', cnpj: '—', users: 2, modules: 9, active: false, current: false },
  ];

  // ===== Integrações =====
  D.integrations = [
    { name: 'WhatsApp Cloud API', kind: 'Mensageria', status: 'connected', detail: 'número +55 47 9 8888-0001 · 1.240 msgs/mês' },
    { name: 'SMTP — Google Workspace', kind: 'E-mail', status: 'connected', detail: 'noreply@its.com.br · 3.800 e-mails/mês' },
    { name: 'Twilio SMS', kind: 'SMS', status: 'disconnected', detail: 'configurar SID e token' },
    { name: 'SendGrid', kind: 'E-mail', status: 'disconnected', detail: 'alternativa de envio em massa' },
    { name: 'Z-API', kind: 'Mensageria', status: 'disconnected', detail: 'WhatsApp não-oficial (fallback)' },
    { name: 'Webhooks', kind: 'Automação', status: 'connected', detail: '4 endpoints ativos' },
    { name: 'Zabbix', kind: 'Monitoramento', status: 'connected', detail: 'abre chamados automáticos' },
    { name: 'Google Calendar', kind: 'Agenda', status: 'connected', detail: 'sincronização bidirecional' },
  ];

  // ===== Permissões =====
  D.roles = ['Administrador', 'Gestor', 'Colaborador', 'Suporte', 'Visitante'];
  D.permModules = ['Projetos', 'Tarefas', 'Chamados', 'Comunicação', 'Documentos', 'Relatórios', 'IA', 'Configurações'];
  D.permMatrix = {
    'Administrador': [2, 2, 2, 2, 2, 2, 2, 2],
    'Gestor':        [2, 2, 2, 2, 2, 2, 1, 1],
    'Colaborador':   [1, 2, 1, 2, 1, 1, 1, 0],
    'Suporte':       [1, 1, 2, 2, 1, 1, 1, 0],
    'Visitante':     [1, 1, 0, 0, 1, 1, 0, 0],
  }; // 0 = sem acesso, 1 = leitura, 2 = total

  // ===== Workload: alocação por projeto =====
  D.workloadAlloc = [
    { who: 'carlos', alloc: [['ERP-MIG', 50], ['NOC-24', 55], ['Chamados', 35]] },
    { who: 'ana', alloc: [['ERP-MIG', 60], ['PORTAL', 35]] },
    { who: 'rafael', alloc: [['ERP-MIG', 45], ['LGPD', 25], ['Gestão', 18]] },
    { who: 'pedro', alloc: [['ERP-MIG', 65], ['Chamados', 11]] },
    { who: 'marina', alloc: [['ERP-MIG', 35], ['LGPD', 27]] },
    { who: 'diego', alloc: [['NOC-24', 30], ['Chamados', 40]] },
    { who: 'juliana', alloc: [['PORTAL', 55]] },
  ];
  D.projColors = { 'ERP-MIG': '#E85928', 'PORTAL': '#0284c7', 'NOC-24': '#16a34a', 'LGPD': '#d97706', 'Chamados': '#64748b', 'Gestão': '#183c5a' };

  // ===== Documentos: pastas por projeto =====
  D.projectDocs = {
    p1: [
      { name: 'Plano de migração ERP v3.2.pdf', type: 'pdf', size: '4,2 MB', owner: 'rafael', when: 'hoje' },
      { name: 'Contrato Vale Aço — aditivo 02.pdf', type: 'pdf', size: '1,8 MB', owner: 'rafael', when: '06 jun' },
      { name: 'De-para de cadastros.xlsx', type: 'sheet', size: '2,1 MB', owner: 'ana', when: '05 jun' },
      { name: 'Mapa de rede — Vale Aço.diagram', type: 'diagram', size: '—', owner: 'carlos', when: '03 jun' },
      { name: 'Fluxo de virada — produção.diagram', type: 'diagram', size: '—', owner: 'rafael', when: '01 jun' },
    ],
    p2: [
      { name: 'Wireframes Portal 2.0 — v2.fig', type: 'design', size: '12,4 MB', owner: 'juliana', when: '05 jun' },
      { name: 'Especificação de API.md', type: 'doc', size: '88 KB', owner: 'pedro', when: '02 jun' },
    ],
    p3: [
      { name: 'Ata — Reunião NOC 09-06.docx', type: 'doc', size: '186 KB', owner: 'diego', when: 'ontem' },
      { name: 'Escala NOC 24x7 — proposta.xlsx', type: 'sheet', size: '340 KB', owner: 'carlos', when: '04 jun' },
      { name: 'Topologia NOC.diagram', type: 'diagram', size: '—', owner: 'carlos', when: '02 jun' },
    ],
    p4: [
      { name: 'Matriz de riscos LGPD.xlsx', type: 'sheet', size: '920 KB', owner: 'marina', when: 'ontem' },
    ],
  };
})();
