// SOGI — dados v4: e-mails, WhatsApp, log do sistema, contas de e-mail, config de chamados
(() => {
  const D = window.SOGI_DATA;

  // ===== Comunicação unificada: mídias =====
  D.inbox = [
    { id: 'c1', media: 'chat', kind: 'project', name: 'ERP-MIG · Migração', members: 4, unread: 3, last: 'Pedro: ambiente congelado até a assinatura', when: '09:42' },
    { id: 'c2', media: 'chat', kind: 'dm', who: 'ana', unread: 1, last: 'Consegue revisar o script antes do almoço?', when: '09:15' },
    { id: 'w1', media: 'whatsapp', kind: 'dm', name: 'Paulo Andrade (Vale Aço)', unread: 2, last: 'Ok, aguardo o retorno do chamado', when: '09:50' },
    { id: 'e1', media: 'email', kind: 'email', name: 'E-mail — rafael@its.com.br', unread: 4, last: 'Hospital Santa Clara: Aprovação da escala NOC', when: '08:30' },
    { id: 'c3', media: 'chat', kind: 'sector', name: 'Infraestrutura', members: 6, unread: 0, last: 'Carlos: janela de manutenção confirmada p/ sábado', when: 'Ontem' },
    { id: 'c4', media: 'chat', kind: 'dm', who: 'juliana', unread: 0, last: 'Você: aprovado! pode seguir com a v2 🎉', when: 'Ontem' },
  ];

  D.waMessages = [
    { who: 'them', when: '09:31', text: 'Bom dia Rafael! Alguma previsão para o ERP voltar na filial?' },
    { who: 'me', when: '09:35', text: 'Bom dia Paulo! Já restabelecemos via contingência. O link principal volta até as 11h.', read: true },
    { who: 'them', when: '09:48', text: 'Perfeito, o pessoal já está conseguindo faturar 👏' },
    { who: 'them', when: '09:50', text: 'Ok, aguardo o retorno do chamado' },
  ];

  D.emails = {
    entrada: [
      { id: 'm1', from: 'Dr. Henrique Costa', addr: 'henrique@santaclara.com.br', subject: 'Aprovação da escala NOC 24/7', preview: 'Rafael, a diretoria aprovou a escala revisada. Podemos assinar...', when: '08:30', unread: true, body: 'Rafael, bom dia.\n\nA diretoria aprovou a escala revisada do NOC 24/7 enviada ontem pelo Diego. Podemos assinar o termo ainda esta semana.\n\nAproveito para confirmar o go-live em 12/06 conforme combinado na última reunião.\n\nAbraço,\nDr. Henrique Costa\nDiretor de TI — Hospital Santa Clara' },
      { id: 'm2', from: 'Sandra Melo', addr: 'sandra@agrohorizonte.coop.br', subject: 'RE: Lentidão no faturamento', preview: 'Obrigada pelo retorno rápido. Confirmo a janela do meio-dia...', when: '07:55', unread: true, body: 'Bom dia,\n\nObrigada pelo retorno rápido. Confirmo a janela do meio-dia para aplicação da correção do índice.\n\nAtt,\nSandra Melo' },
      { id: 'm3', from: 'Banco do Brasil — CNAB', addr: 'cnab@bb.com.br', subject: 'Arquivo retorno processado — 09/06', preview: 'Seu arquivo de retorno foi processado com sucesso...', when: 'ontem', unread: true, body: 'Prezado cliente,\n\nSeu arquivo de retorno CNAB 240 de 09/06 foi processado com sucesso. 142 títulos liquidados.\n\nBanco do Brasil' },
      { id: 'm4', from: 'Juliana Castro', addr: 'juliana@its.com.br', subject: 'Wireframes v2 — Portal do Cliente', preview: 'Segue o link do Figma com a v2 revisada conforme seu feedback...', when: 'ontem', unread: true, body: 'Oi Rafael!\n\nSegue o link do Figma com a v2 revisada conforme seu feedback de ontem. Mudei o fluxo de boletos e a área de chamados.\n\nQualquer coisa me chama no chat 😊\n\nJu' },
    ],
    enviados: [
      { id: 's1', from: 'Você → Paulo Andrade', addr: 'paulo@valeaco.ind.br', subject: 'Plano de virada — ERP', preview: 'Paulo, segue o plano de virada atualizado com a janela de 28/06...', when: 'ontem', body: 'Paulo,\n\nSegue o plano de virada atualizado com a janela de 28/06.\n\nAbs, Rafael' },
    ],
    rascunhos: [
      { id: 'd1', from: 'Rascunho', addr: 'diretoria@its.com.br', subject: 'Status mensal — junho (rascunho)', preview: 'Resumo executivo do mês: 4 projetos ativos, SLA 96,2%...', when: 'hoje', body: 'Resumo executivo do mês: 4 projetos ativos, SLA 96,2%...' },
    ],
    excluidos: [],
  };

  D.emailAccounts = [
    { user: 'rafael', email: 'rafael@its.com.br', quota: '4,2 GB / 10 GB', status: 'ativo', signature: true },
    { user: 'ana', email: 'ana@its.com.br', quota: '1,8 GB / 10 GB', status: 'ativo', signature: true },
    { user: 'diego', email: 'suporte@its.com.br', quota: '7,1 GB / 10 GB', status: 'ativo', signature: false },
  ];

  // ===== Log do sistema (auditoria v2) =====
  D.syslog = [
    { when: 'hoje, 09:51:12', who: 'rafael', kind: 'approval', mod: 'Compras', what: 'Aprovou compra — 3 licenças Windows Server (R$ 14.700)', ip: '10.0.4.12' },
    { when: 'hoje, 09:42:03', who: 'pedro', kind: 'change', mod: 'Projetos', what: 'Comentou na tarefa "CNAB 240"', ip: '10.0.4.19' },
    { when: 'hoje, 08:15:44', who: 'diego', kind: 'change', mod: 'Chamados', what: 'Respondeu ao chamado #4821 (cliente notificado)', ip: '10.0.4.27' },
    { when: 'hoje, 07:22:18', who: 'carlos', kind: 'service', mod: 'Infra', what: 'Reiniciou serviço Socket Server (produção)', ip: '10.0.4.31' },
    { when: 'hoje, 06:00:00', who: 'rafael', kind: 'system', mod: 'IA', what: 'Varredura diária de riscos executada — 1 risco novo detectado', ip: 'sistema' },
    { when: 'ontem, 17:40:55', who: 'ana', kind: 'change', mod: 'Tarefas', what: 'Alterou prazo da tarefa "Script de migração RH" de 12/06 → 13/06', ip: '10.0.4.18' },
    { when: 'ontem, 15:12:30', who: 'diego', kind: 'supervision', mod: 'Comunicação', what: 'Acessou modo supervisão do chat (conversa Ana × Pedro)', ip: '10.0.4.27' },
    { when: 'ontem, 11:45:02', who: 'marina', kind: 'login', mod: 'Auth', what: 'Login via SSO (Google Workspace)', ip: '187.94.11.8' },
    { when: 'ontem, 09:30:11', who: 'rafael', kind: 'delete', mod: 'Documentos', what: 'Excluiu anexo duplicado "wireframe-v1-old.fig"', ip: '10.0.4.12' },
    { when: '08 jun, 22:14:09', who: 'carlos', kind: 'system', mod: 'Backup', what: 'Backup noturno falhou — espaço em disco (alerta gerado)', ip: 'sistema' },
    { when: '08 jun, 14:20:33', who: 'juliana', kind: 'change', mod: 'Documentos', what: 'Enviou "Wireframes Portal 2.0 — v2.fig" (12,4 MB)', ip: '10.0.4.22' },
    { when: '08 jun, 08:02:51', who: 'pedro', kind: 'login', mod: 'Auth', what: 'Falha de login (senha incorreta, 2ª tentativa)', ip: '189.4.20.77' },
  ];

  // ===== Configuração de chamados =====
  D.ticketSLAConfig = [
    { prio: 'crítica', first: '15 min', resolve: '4 h' },
    { prio: 'alta', first: '1 h', resolve: '8 h' },
    { prio: 'média', first: '4 h', resolve: '24 h' },
    { prio: 'baixa', first: '8 h', resolve: '72 h' },
  ];
  D.ticketCategories = ['Infraestrutura', 'Sistemas', 'Acessos', 'E-mail', 'Telefonia', 'Outros'];
  D.serviceQueues = ['Suporte N1', 'Infraestrutura', 'Desenvolvimento', 'Fiscal/Sistemas', 'Administrativo'];
  D.ticketMacros = [
    'Saudação + coleta de informações iniciais',
    'Solicitar acesso remoto (AnyDesk)',
    'Encerramento com pesquisa de satisfação',
    'Aguardando retorno do cliente (1º aviso)',
  ];
  D.ticketsByCategory = [['Infraestrutura', 9], ['Sistemas', 7], ['Acessos', 4], ['E-mail', 2], ['Outros', 1]];

  // ===== Builder de relatórios =====
  D.builderWidgets = [
    { type: 'kpi', label: 'Cartão KPI' },
    { type: 'bars', label: 'Barras — tarefas/semana' },
    { type: 'line', label: 'Linha — SLA' },
    { type: 'donut', label: 'Donut — horas' },
    { type: 'table', label: 'Tabela — top clientes' },
    { type: 'tickets', label: 'Chamados por dia' },
    { type: 'email', label: 'E-mails (envio/recebto)' },
    { type: 'project', label: 'Saúde do projeto' },
    { type: 'burndown', label: 'Burndown do projeto' },
    { type: 'gamification', label: 'Top 3 — gamificação' },
    { type: 'slaprio', label: 'SLA por prioridade' },
    { type: 'workload', label: 'Carga da equipe' },
  ];
  D.emailStats = { sent: [38, 45, 52, 41, 60, 48, 22], received: [61, 70, 66, 58, 84, 72, 30] };

  // ===== Stickers do chat =====
  D.stickers = ['👍', '🎉', '🔥', '❤️', '😂', '🚀', '👏', '✅', '☕', '🤝', '💪', '🙏'];
})();
