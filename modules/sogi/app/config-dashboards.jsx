// SOGI — Configurações → Dashboards: templates por perfil + editor WYSIWYG (canvas tela cheia)
// Widgets parametrizáveis (projeto único, fila de chamados), builder de widgets e drag fluido.
const { useState: useStateDB, useRef: useRefDB } = React;

let __dbUid = 1;
const dbUid = () => 'w' + (Date.now() % 100000) + '_' + (__dbUid++);

const DB_WIDGETS = [
  { id: 'kpis_op', label: 'KPIs de operação', icon: 'dashboard', desc: 'projetos, tarefas, chamados, SLA', wide: true },
  { id: 'minhas_tarefas', label: 'Minhas tarefas', icon: 'tasks', desc: 'lista do dia com prazos' },
  { id: 'projetos', label: 'Projetos (todos)', icon: 'projects', desc: 'saúde e progresso da carteira' },
  { id: 'projeto_unico', label: 'Projeto específico', icon: 'projects', desc: 'visão de UM projeto — você escolhe qual', param: 'project' },
  { id: 'fila_chamados', label: 'Fila de chamados', icon: 'tickets', desc: 'uma fila específica — você escolhe', param: 'queue' },
  { id: 'aprovacoes', label: 'Aprovações', icon: 'check', desc: 'pendências com aprovar/recusar' },
  { id: 'chamados', label: 'Chamados críticos', icon: 'tickets', desc: 'SLA em risco (geral)' },
  { id: 'grafico_tarefas', label: 'Gráfico: tarefas/semana', icon: 'reports', desc: 'barras de produtividade' },
  { id: 'sla_mes', label: 'Gráfico: SLA mensal', icon: 'clock', desc: 'linha do SLA vs meta' },
  { id: 'horas_projeto', label: 'Gráfico: horas/projeto', icon: 'gantt', desc: 'distribuição de horas' },
  { id: 'mencoes', label: 'Menções & chat', icon: 'chat', desc: 'onde te citaram' },
  { id: 'gamificacao', label: 'Meus pontos', icon: 'trophy', desc: 'ranking e conquistas' },
  { id: 'eventos', label: 'Próximos eventos', icon: 'calendar', desc: 'agenda da semana' },
  { id: 'mrr', label: 'MRR & margem', icon: 'reports', desc: 'receita recorrente (diretoria)' },
  { id: 'carteira', label: 'Carteira de clientes', icon: 'building', desc: 'contratos e risco de receita' },
  { id: 'ia_diretoria', label: 'Análise da IA', icon: 'ai', desc: 'recomendações executivas' },
  { id: 'atividade', label: 'Atividade da equipe', icon: 'users', desc: 'feed do que aconteceu' },
];

const DB_QUEUES = ['Suporte N1', 'Infraestrutura', 'Fiscal/Sistemas', 'Desenvolvimento'];

const mkInst = (type, params = {}) => ({ iid: dbUid(), type, params });
const toInstances = (arr) => arr.map(x => typeof x === 'string' ? mkInst(x) : x);

const DB_INITIAL_TEMPLATES = [
  { id: 'tpl1', name: 'Operacional — Colaborador', role: 'Colaborador', isDefault: true, widgets: ['minhas_tarefas', 'mencoes', 'gamificacao', 'eventos'] },
  { id: 'tpl2', name: 'Gestão de equipe', role: 'Gestor', isDefault: true, widgets: ['kpis_op', 'minhas_tarefas', 'projetos', 'aprovacoes', 'chamados', 'atividade'] },
  { id: 'tpl3', name: 'Visão do negócio', role: 'Administrador', isDefault: true, widgets: ['mrr', 'carteira', 'projeto_unico', 'ia_diretoria'] },
  { id: 'tpl4', name: 'Suporte / NOC', role: 'Suporte', isDefault: true, widgets: ['chamados', 'fila_chamados', 'kpis_op', 'eventos'] },
];

/* ---------- corpo dos widgets ---------- */
function WidgetRows({ items }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map(([txt, right, danger], i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: danger ? 'var(--danger)' : 'var(--border-strong)', flexShrink: 0 }}></span>
          <span style={{ flex: 1, fontSize: 12, color: danger ? 'var(--danger)' : 'var(--text-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: danger ? 600 : 400 }}>{txt}</span>
          <span className="mono" style={{ fontSize: 10, color: danger ? 'var(--danger)' : 'var(--text-3)', flexShrink: 0 }}>{right}</span>
        </div>
      ))}
    </div>
  );
}

function WidgetBars({ data, labels, color }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 92, paddingTop: 4 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, height: '100%', justifyContent: 'flex-end' }}>
          <span className="mono" style={{ fontSize: 8.5, color: 'var(--text-2)', fontWeight: 600 }}>{v}</span>
          <div style={{ width: '100%', maxWidth: 26, height: `${(v / max) * 100}%`, minHeight: 4, background: color, borderRadius: 5 }}></div>
          <span className="mono" style={{ fontSize: 8, color: 'var(--text-3)' }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

function WidgetBody({ type, params = {} }) {
  const D = SOGI_DATA;
  switch (type) {
    case 'kpis_op': return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[['4', 'projetos ativos', 'accent'], ['60', 'tarefas abertas', 'violet'], ['5', 'chamados', 'danger'], ['96,2%', 'SLA do mês', 'ok']].map(([v, l, tone]) => (
          <div key={l} style={{ background: TONE[tone].bg, borderRadius: 9, padding: '12px 13px' }}>
            <div className="mono" style={{ fontSize: 20, fontWeight: 800, color: TONE[tone].fg }}>{v}</div>
            <div style={{ fontSize: 10.5, color: 'var(--text-2)', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
    );
    case 'minhas_tarefas': return <WidgetRows items={D.myTasks.slice(0, 4).map(t => [t.title, t.due, t.late])} />;
    case 'projetos': return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {D.projects.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <HealthDot health={p.health} />
            <span style={{ flex: 1, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
            <span style={{ width: 64, height: 5, borderRadius: 3, background: 'var(--bg)', overflow: 'hidden', flexShrink: 0 }}>
              <span style={{ display: 'block', width: `${p.progress}%`, height: '100%', background: { ok: 'var(--accent)', warn: 'var(--warn)', risk: 'var(--danger)' }[p.health] }}></span>
            </span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)', width: 30, textAlign: 'right' }}>{p.progress}%</span>
          </div>
        ))}
      </div>
    );
    case 'projeto_unico': {
      const p = D.projects.find(x => x.id === (params.projectId || 'p1')) || D.projects[0];
      const ptasks = D.kanban.tasks.filter(t => t.col !== 'done').slice(0, 3);
      return (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
            <HealthDot health={p.health} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
              <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{p.client} · entrega {p.dueDate}</span>
            </span>
            <AvatarStack ids={p.team} size={20} max={3} />
          </div>
          <div style={{ height: 7, borderRadius: 4, background: 'var(--bg)', overflow: 'hidden', marginBottom: 4 }}>
            <div style={{ width: `${p.progress}%`, height: '100%', background: { ok: 'var(--accent)', warn: 'var(--warn)', risk: 'var(--danger)' }[p.health], borderRadius: 4 }}></div>
          </div>
          <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', marginBottom: 9 }}>{p.progress}% · {p.tasksDone}/{p.tasksDone + p.tasksOpen} tarefas · {p.healthNote}</div>
          {p.id === 'p1'
            ? <WidgetRows items={ptasks.map(t => [t.title, t.due, t.late])} />
            : <WidgetRows items={[[p.healthNote, p.dueDate, p.health === 'risk']]} />}
        </div>
      );
    }
    case 'fila_chamados': {
      const q = params.queue || 'Suporte N1';
      const tks = D.tickets.slice(0, q === 'Infraestrutura' ? 2 : 3);
      return (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 9 }}>
            {[['na fila', 1], ['atendendo', 3], ['SLA risco', 2]].map(([l, v]) => (
              <div key={l} style={{ flex: 1, background: 'var(--surface-2)', borderRadius: 8, padding: '7px 6px', textAlign: 'center' }}>
                <div className="mono" style={{ fontSize: 14, fontWeight: 800 }}>{v}</div>
                <div style={{ fontSize: 9, color: 'var(--text-3)' }}>{l}</div>
              </div>
            ))}
          </div>
          <WidgetRows items={tks.map(t => [t.title, t.slaState === 'breach' ? 'estourado' : t.sla, t.slaState === 'breach'])} />
        </div>
      );
    }
    case 'aprovacoes': return <WidgetRows items={D.approvals.map(a => [a.what, a.amount, false])} />;
    case 'chamados': return <WidgetRows items={D.tickets.slice(0, 4).map(t => [t.title, t.slaState === 'breach' ? 'estourado' : t.sla, t.slaState === 'breach'])} />;
    case 'grafico_tarefas': return <WidgetBars data={D.reportWeekly.map(w => w.done)} labels={D.reportWeekly.map(w => w.w)} color="var(--accent)" />;
    case 'sla_mes': return <WidgetBars data={D.reportSLA.map(s => s.v)} labels={D.reportSLA.map(s => s.m)} color="var(--ok)" />;
    case 'horas_projeto': return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {D.reportHours.map((h, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="mono" style={{ fontSize: 10, fontWeight: 600, width: 58, color: 'var(--text-2)' }}>{h.p}</span>
            <span style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--bg)', overflow: 'hidden' }}>
              <span style={{ display: 'block', width: `${(h.h / 312) * 100}%`, height: '100%', background: D.projColors[h.p] || h.color, borderRadius: 4 }}></span>
            </span>
            <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', width: 32, textAlign: 'right' }}>{h.h}h</span>
          </div>
        ))}
      </div>
    );
    case 'mencoes': return <WidgetRows items={D.notifications.slice(0, 4).map(n => [SOGI_DATA.people[n.who].name.split(' ')[0] + ' ' + n.text, n.when, false])} />;
    case 'gamificacao': return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <Avatar person="rafael" size={36} />
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600 }}>{D.game.me.level}</span>
          <span style={{ fontSize: 10.5, color: 'var(--text-3)' }}>#{D.game.me.position} no ranking · {D.game.me.streak} dias sem atraso 🔥</span>
        </span>
        <span className="mono" style={{ fontSize: 19, fontWeight: 800, color: 'var(--warn)' }}>{D.game.me.points.toLocaleString('pt-BR')}</span>
      </div>
    );
    case 'eventos': return <WidgetRows items={D.events.filter(e => e.day >= 10).slice(0, 4).map(e => [e.title, e.day + ' jun' + (e.time ? ' · ' + e.time : ''), false])} />;
    case 'mrr': return (
      <div style={{ display: 'flex', gap: 10 }}>
        {[['R$ 49k', 'MRR', 'ok'], ['29%', 'margem', 'accent'], [String(D.exec.nps), 'NPS', 'violet'], ['68%', 'faturáveis', 'ok']].map(([v, l, tone]) => (
          <div key={l} style={{ flex: 1, background: TONE[tone].bg, borderRadius: 9, padding: '11px 8px', textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: 16, fontWeight: 800, color: TONE[tone].fg }}>{v}</div>
            <div style={{ fontSize: 9.5, color: 'var(--text-2)', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
    );
    case 'carteira': return <WidgetRows items={D.exec.clients.map(c => [c.name + ' · ' + c.contracts + ' contratos', c.mrr, c.health === 'risk'])} />;
    case 'ia_diretoria': return (
      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
        MRR +19% no semestre, margem em 29%. Risco: 41% da receita concentrada na Vale Aço com projeto em risco — priorize a virada do ERP e acelere a proposta Prisma.
      </p>
    );
    case 'atividade': return <WidgetRows items={D.activity.slice(0, 4).map(a => [SOGI_DATA.people[a.who].name.split(' ')[0] + ' ' + a.what + ' ' + a.target, a.when, false])} />;
    case 'custom': return null; // tratado no card
    case 'builder': {
      const src = params.source || 'Tarefas';
      const viz = params.viz || 'KPI';
      if (viz === 'KPI') {
        const map = { 'Tarefas': ['60', 'tarefas abertas · 12 vencem esta semana', 'violet'], 'Chamados': ['5', 'chamados ativos · 1 SLA estourado', 'danger'], 'Projetos': ['4', 'projetos ativos · 2 exigem atenção', 'accent'], 'Horas': ['612h', 'alocadas nas próximas 2 semanas', 'ok'] };
        const [v, l, tone] = map[src];
        return (
          <div style={{ background: TONE[tone].bg, borderRadius: 10, padding: '16px 16px', textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: 30, fontWeight: 800, color: TONE[tone].fg }}>{v}</div>
            <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 4 }}>{l}</div>
          </div>
        );
      }
      if (viz === 'Barras') {
        const map = {
          'Tarefas': [D.reportWeekly.map(w => w.done), D.reportWeekly.map(w => w.w), 'var(--violet)'],
          'Chamados': [D.ticketsPerDay, ['qua', 'qui', 'sex', 'sáb', 'dom', 'seg', 'hoje'], 'var(--danger)'],
          'Projetos': [D.projects.map(p => p.progress), D.projects.map(p => p.code.slice(0, 4)), 'var(--accent)'],
          'Horas': [D.reportHours.map(h => h.h), D.reportHours.map(h => h.p.slice(0, 4)), 'var(--ok)'],
        };
        const [data, labels, color] = map[src];
        return <WidgetBars data={data} labels={labels} color={color} />;
      }
      // Lista
      const map = {
        'Tarefas': D.myTasks.slice(0, 4).map(t => [t.title, t.due, t.late]),
        'Chamados': D.tickets.slice(0, 4).map(t => [t.title, t.sla, t.slaState === 'breach']),
        'Projetos': D.projects.map(p => [p.name, p.progress + '%', p.health === 'risk']),
        'Horas': D.reportHours.map(h => [h.p, h.h + 'h', false]),
      };
      return <WidgetRows items={map[src]} />;
    }
    default: return null;
  }
}

/* ---------- lista de templates ---------- */
function DashboardsSettings() {
  const [templates, setTemplates] = useStateDB(DB_INITIAL_TEMPLATES);
  const [editing, setEditing] = useStateDB(null);
  const [allowUserEdit, setAllowUserEdit] = useStateDB(true);

  const dupe = (t) => {
    const copy = { ...t, id: 'tpl' + Date.now(), name: t.name + ' (cópia)', isDefault: false, widgets: toInstances(t.widgets).map(w => ({ ...w, iid: dbUid(), params: { ...w.params } })) };
    setTemplates(ts => [...ts, copy]);
    window.SOGI_TOAST(`Template "${copy.name}" criado — personalize os widgets`);
    setEditing(copy);
  };
  const remove = (t) => {
    if (t.isDefault) { window.SOGI_TOAST('Templates padrão não podem ser excluídos — duplique e adapte', 'warn'); return; }
    setTemplates(ts => ts.filter(x => x.id !== t.id));
    window.SOGI_TOAST(`Template "${t.name}" excluído`, 'warn');
  };
  const saveEditing = (updated) => {
    setTemplates(ts => ts.map(x => x.id === updated.id ? updated : x));
    setEditing(null);
    window.SOGI_TOAST(`Template "${updated.name}" salvo — aplicado aos usuários do papel ${updated.role}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card title="Templates de dashboard por perfil" action={
        <PrimaryBtn icon="plus" onClick={() => {
          const t = { id: 'tpl' + Date.now(), name: 'Novo template', role: 'Colaborador', isDefault: false, widgets: [mkInst('minhas_tarefas')] };
          setTemplates(ts => [...ts, t]);
          setEditing(t);
        }}>Novo template</PrimaryBtn>
      } pad={false}>
        {templates.map((t, i) => (
          <div key={t.id} onDoubleClick={() => setEditing(t)} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span style={{ width: 46, height: 34, borderRadius: 6, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, padding: 3, flexShrink: 0 }}>
              {t.widgets.slice(0, 4).map((w, j) => (
                <span key={j} style={{ borderRadius: 2, background: ['var(--accent)', 'var(--violet)', 'var(--ok)', 'var(--warn)'][j % 4], opacity: 0.65 }}></span>
              ))}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong style={{ fontSize: 12.5 }}>{t.name}</strong>
                {t.isDefault && <Badge tone="neutral">padrão</Badge>}
              </span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{t.widgets.length} widgets · papel: {t.role}</span>
            </span>
            <Badge tone={{ 'Colaborador': 'accent', 'Gestor': 'violet', 'Administrador': 'danger', 'Suporte': 'ok', 'Visitante': 'neutral' }[t.role] || 'neutral'}>{t.role}</Badge>
            <button title="Editar no canvas" onClick={e => { e.stopPropagation(); setEditing(t); }} style={{ color: 'var(--text-3)', display: 'flex', padding: 6, borderRadius: 7, border: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
              <Icon d={ICONS.settings} size={13} />
            </button>
            <button title="Duplicar" onClick={e => { e.stopPropagation(); dupe(t); }} style={{ color: 'var(--text-3)', display: 'flex', padding: 6, borderRadius: 7, border: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--violet)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
              <Icon d={ICONS.docs} size={13} />
            </button>
            <button title="Excluir" onClick={e => { e.stopPropagation(); remove(t); }} style={{ color: 'var(--text-3)', display: 'flex', padding: 6, borderRadius: 7, border: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
              <Icon d={ICONS.trash} size={13} />
            </button>
          </div>
        ))}
        <p className="mono" style={{ margin: 0, padding: '8px var(--pad)', fontSize: 9, color: 'var(--text-3)', borderTop: '1px solid var(--border)', lineHeight: 1.5 }}>
          duplo clique abre o editor em tela cheia · arraste os cards no canvas · o template do papel vira o dashboard inicial do usuário
        </p>
      </Card>

      <Card title="Política de personalização" pad={false}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px var(--pad)' }}>
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600 }}>Usuários podem adaptar o template</span>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>cada um reordena/adiciona widgets a partir do template do seu papel — a base continua governada pelo admin</span>
          </span>
          <CfSwitch on={allowUserEdit} onClick={() => { setAllowUserEdit(v => !v); window.SOGI_TOAST(allowUserEdit ? 'Personalização bloqueada — todos veem exatamente o template' : 'Personalização liberada'); }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px var(--pad)', borderTop: '1px solid var(--border)' }}>
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600 }}>Dashboards salvos no Relatórios</span>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>os dashboards que usuários criam no builder de Relatórios podem ser promovidos a template</span>
          </span>
          <GhostBtn icon="reports" onClick={() => window.SOGI_TOAST('2 dashboards de usuários disponíveis para promover a template', 'info')}>Ver salvos</GhostBtn>
        </div>
      </Card>

      {editing && <TemplateEditorModal template={editing} onClose={() => setEditing(null)} onSave={saveEditing} />}
    </div>
  );
}

/* ---------- Editor WYSIWYG em tela cheia ---------- */
function TemplateEditorModal({ template, onClose, onSave }) {
  const [name, setName] = useStateDB(template.name);
  const [role, setRole] = useStateDB(template.role);
  const [items, setItems] = useStateDB(() => toInstances(template.widgets));
  const [galleryOpen, setGalleryOpen] = useStateDB(true);
  const [builderOpen, setBuilderOpen] = useStateDB(false);
  const [dragIid, setDragIid] = useStateDB(null);
  const lastSwap = useRefDB(0);

  const meta = (it) => it.type === 'custom'
    ? { label: it.params.label || 'Card', icon: 'docs', custom: true }
    : it.type === 'builder'
      ? { label: it.params.title || 'Meu widget', icon: 'reports', builder: true }
      : DB_WIDGETS.find(x => x.id === it.type);

  const setParams = (iid, patch) => setItems(arr => arr.map(it => it.iid === iid ? { ...it, params: { ...it.params, ...patch } } : it));

  // drag fluido: reordena AO VIVO enquanto passa por cima (com proteção anti-jitter)
  const liveReorder = (targetIid) => {
    if (!dragIid || dragIid === targetIid) return;
    const now = Date.now();
    if (now - lastSwap.current < 120) return;
    setItems(arr => {
      const from = arr.findIndex(x => x.iid === dragIid);
      const to = arr.findIndex(x => x.iid === targetIid);
      if (from < 0 || to < 0 || from === to) return arr;
      lastSwap.current = now;
      const copy = [...arr];
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);
      return copy;
    });
  };

  const addWidget = (id) => {
    setItems(arr => [...arr, mkInst(id, id === 'projeto_unico' ? { projectId: 'p1' } : id === 'fila_chamados' ? { queue: 'Suporte N1' } : {})]);
    window.SOGI_TOAST('Widget adicionado — arraste para posicionar');
  };

  return (
    <div data-screen-label="Editor de dashboard (canvas)" style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'var(--bg)', display: 'flex', flexDirection: 'column', animation: 'sogi-pop .15s ease' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', flexShrink: 0, flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--accent-text)', display: 'flex' }}><Icon d={ICONS.dashboard} size={17} /></span>
        <input value={name} onChange={e => setName(e.target.value)} style={{
          border: '1px solid transparent', borderRadius: 7, padding: '6px 9px', fontSize: 14, fontWeight: 700,
          outline: 'none', background: 'transparent', color: 'var(--text)', width: 240,
        }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
          onBlur={e => { e.target.style.borderColor = 'transparent'; }} />
        <select value={role} onChange={e => setRole(e.target.value)} style={{
          border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', fontSize: 12,
          fontFamily: 'var(--font-ui)', background: 'var(--surface)', color: 'var(--text)', fontWeight: 600,
        }}>
          {SOGI_DATA.roles.map(r => <option key={r} value={r}>papel: {r}</option>)}
        </select>
        <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>{items.length} cards · arraste pelo card para reordenar ao vivo</span>
        <span style={{ flex: 1 }}></span>
        <GhostBtn icon="ai" onClick={() => setBuilderOpen(true)}>Criar widget</GhostBtn>
        <GhostBtn icon="plus" onClick={() => setGalleryOpen(o => !o)}>{galleryOpen ? 'Fechar galeria' : 'Galeria'}</GhostBtn>
        <GhostBtn onClick={onClose}>Cancelar</GhostBtn>
        <PrimaryBtn icon="check" onClick={() => {
          if (!name.trim()) { window.SOGI_TOAST('Dê um nome ao template', 'warn'); return; }
          if (items.length === 0) { window.SOGI_TOAST('Adicione pelo menos 1 widget', 'warn'); return; }
          onSave({ ...template, name: name.trim(), role, widgets: items });
        }}>Salvar template</PrimaryBtn>
      </header>

      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        {/* Canvas */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }} onDragOver={e => e.preventDefault()} onDrop={() => setDragIid(null)}>
          <div style={{ marginBottom: 16 }}>
            <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700, letterSpacing: '-0.01em' }}>Bom dia, Rafael 👋</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-2)' }}>É assim que os usuários do papel <strong>{role}</strong> verão o dashboard.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, alignItems: 'start' }}>
            {items.map((it, i) => {
              const w = meta(it);
              if (!w) return null;
              const isWide = w.wide;
              const dragging = dragIid === it.iid;
              return (
                <div key={it.iid} draggable
                  onDragStart={e => { setDragIid(it.iid); e.dataTransfer.effectAllowed = 'move'; }}
                  onDragEnd={() => setDragIid(null)}
                  onDragOver={e => { e.preventDefault(); liveReorder(it.iid); }}
                  onDrop={e => { e.preventDefault(); setDragIid(null); }}
                  style={{
                    background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 16,
                    boxShadow: dragging ? '0 12px 32px rgba(24,60,90,0.3)' : 'var(--shadow-card)',
                    gridColumn: isWide ? '1 / -1' : 'auto',
                    opacity: dragging ? 0.55 : 1, transform: dragging ? 'scale(1.02) rotate(1deg)' : 'none',
                    cursor: 'grab', transition: 'box-shadow .15s, transform .15s, opacity .15s', position: 'relative',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ color: 'var(--text-3)', display: 'flex', cursor: 'grab' }} title="arraste para mover">
                      <Icon d={'M9 6h.01 M15 6h.01 M9 12h.01 M15 12h.01 M9 18h.01 M15 18h.01'} size={15} sw={2.6} />
                    </span>
                    <span style={{ width: 24, height: 24, borderRadius: 7, background: 'var(--accent-soft)', color: 'var(--accent-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon d={ICONS[w.icon]} size={12} />
                    </span>
                    {w.custom || w.builder ? (
                      <input value={w.custom ? (it.params.label || '') : (it.params.title || '')}
                        onChange={e => setParams(it.iid, w.custom ? { label: e.target.value } : { title: e.target.value })}
                        onMouseDown={e => e.stopPropagation()} draggable={false}
                        style={{ fontSize: 13, fontWeight: 650, border: '1px solid transparent', borderRadius: 6, padding: '2px 6px', outline: 'none', background: 'transparent', color: 'var(--text)', width: 170 }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'transparent'} />
                    ) : (
                      <strong style={{ fontSize: 13 }}>{w.label}</strong>
                    )}
                    {/* parâmetro: projeto */}
                    {it.type === 'projeto_unico' && (
                      <select value={it.params.projectId || 'p1'} onChange={e => setParams(it.iid, { projectId: e.target.value })}
                        onMouseDown={e => e.stopPropagation()} draggable={false}
                        style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '2px 6px', fontSize: 10.5, fontFamily: 'var(--font-mono)', background: 'var(--surface)', color: 'var(--accent-text)', fontWeight: 600 }}>
                        {SOGI_DATA.projects.map(p => <option key={p.id} value={p.id}>{p.code}</option>)}
                      </select>
                    )}
                    {/* parâmetro: fila */}
                    {it.type === 'fila_chamados' && (
                      <select value={it.params.queue || 'Suporte N1'} onChange={e => setParams(it.iid, { queue: e.target.value })}
                        onMouseDown={e => e.stopPropagation()} draggable={false}
                        style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '2px 6px', fontSize: 10.5, fontFamily: 'var(--font-mono)', background: 'var(--surface)', color: 'var(--accent-text)', fontWeight: 600 }}>
                        {DB_QUEUES.map(q => <option key={q}>{q}</option>)}
                      </select>
                    )}
                    {w.builder && <Badge tone="violet">{it.params.source} · {it.params.viz}</Badge>}
                    <span style={{ flex: 1 }}></span>
                    <button title="Remover do dashboard" onClick={() => setItems(arr => arr.filter(x => x.iid !== it.iid))}
                      style={{ color: 'var(--text-3)', display: 'flex', padding: 4, borderRadius: 6 }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                      <Icon d={ICONS.x} size={13} />
                    </button>
                  </div>
                  {it.type === 'custom' ? (
                    <textarea value={it.params.note || ''} onChange={e => setParams(it.iid, { note: e.target.value })}
                      onMouseDown={e => e.stopPropagation()} draggable={false} rows={3}
                      style={{ width: '100%', border: '1.5px dashed var(--border-strong)', borderRadius: 8, padding: 10, fontSize: 12, color: 'var(--text-2)', fontFamily: 'var(--font-ui)', lineHeight: 1.55, resize: 'vertical', outline: 'none', background: 'var(--surface-2)', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border-strong)'} />
                  ) : (
                    <WidgetBody type={it.type} params={it.params} />
                  )}
                </div>
              );
            })}
            {items.length === 0 && (
              <div className="mono" style={{ gridColumn: '1 / -1', border: '2px dashed var(--border-strong)', borderRadius: 12, padding: 50, fontSize: 11, color: 'var(--text-3)', textAlign: 'center' }}>
                dashboard vazio — abra a galeria e adicione widgets
              </div>
            )}
          </div>
        </div>

        {/* Galeria lateral */}
        {galleryOpen && (
          <aside style={{ width: 290, flexShrink: 0, background: 'var(--surface)', borderLeft: '1px solid var(--border)', overflowY: 'auto', padding: 14, animation: 'sogi-fade-up .2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <strong style={{ fontSize: 12.5 }}>Galeria de widgets</strong>
              <span style={{ flex: 1 }}></span>
              <button onClick={() => setGalleryOpen(false)} style={{ color: 'var(--text-3)', display: 'flex', padding: 4 }}><Icon d={ICONS.x} size={14} /></button>
            </div>
            <button onClick={() => setBuilderOpen(true)} style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', borderRadius: 9,
              padding: '10px 11px', border: '1.5px dashed var(--violet)', background: 'var(--violet-soft)', marginBottom: 7,
            }}>
              <span style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--violet)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon d={ICONS.ai} size={14} />
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--violet)' }}>Criar widget (builder)</span>
                <span style={{ fontSize: 10, color: 'var(--text-2)' }}>escolha fonte de dados + visualização</span>
              </span>
            </button>
            <button onClick={() => {
              setItems(arr => [...arr, mkInst('custom', { label: 'Novo card', note: 'Clique no texto para editar. Use para metas do setor, links úteis ou avisos fixos.' })]);
              window.SOGI_TOAST('Card personalizado criado — edite direto no canvas');
            }} style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', borderRadius: 9,
              padding: '10px 11px', border: '1.5px dashed var(--accent)', background: 'var(--accent-soft)', marginBottom: 10,
            }}>
              <span style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon d={ICONS.plus} size={14} />
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--accent-text)' }}>Card de texto livre</span>
                <span style={{ fontSize: 10, color: 'var(--text-2)' }}>metas, links, avisos fixos</span>
              </span>
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {DB_WIDGETS.map(w => {
                const usedCount = items.filter(x => x.type === w.id).length;
                const repeatable = !!w.param; // parametrizáveis podem repetir
                const disabled = usedCount > 0 && !repeatable;
                return (
                  <button key={w.id} disabled={disabled} onClick={() => addWidget(w.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', borderRadius: 9, padding: '9px 11px',
                    border: '1px solid var(--border)', background: 'var(--surface)', opacity: disabled ? 0.45 : 1,
                    cursor: disabled ? 'default' : 'pointer', transition: 'all .12s',
                  }}
                    onMouseEnter={e => { if (!disabled) e.currentTarget.style.borderColor = 'var(--accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
                    <span style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--surface-2)', color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon d={ICONS[w.icon]} size={13} />
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{w.label}</span>
                        {repeatable && usedCount > 0 && <span className="mono" style={{ fontSize: 8.5, color: 'var(--violet)', fontWeight: 700 }}>×{usedCount}</span>}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{disabled ? 'já está no dashboard' : w.desc}</span>
                    </span>
                    {!disabled && <Icon d={ICONS.plus} size={13} style={{ color: 'var(--accent-text)' }} />}
                  </button>
                );
              })}
            </div>
            <p className="mono" style={{ fontSize: 9, color: 'var(--text-3)', lineHeight: 1.6, marginTop: 10 }}>
              widgets com seletor (projeto, fila) podem ser adicionados várias vezes — um para cada projeto/fila
            </p>
          </aside>
        )}
      </div>

      {builderOpen && <WidgetBuilderModal onClose={() => setBuilderOpen(false)} onCreate={(params) => {
        setItems(arr => [...arr, mkInst('builder', params)]);
        setBuilderOpen(false);
        window.SOGI_TOAST(`Widget "${params.title}" criado — arraste para posicionar`);
      }} />}
    </div>
  );
}

/* ---------- Builder de widgets ---------- */
function WidgetBuilderModal({ onClose, onCreate }) {
  const [title, setTitle] = useStateDB('Meu widget');
  const [source, setSource] = useStateDB('Tarefas');
  const [viz, setViz] = useStateDB('KPI');
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(24,60,90,0.45)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'sogi-pop .15s ease' }}>
      <div data-screen-label="Builder de widget" onClick={e => e.stopPropagation()} style={{ width: 620, maxWidth: '96vw', maxHeight: '92vh', overflowY: 'auto', background: 'var(--surface)', borderRadius: 14, boxShadow: 'var(--shadow-pop)', animation: 'sogi-pop .2s cubic-bezier(.3,1.3,.6,1)' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '15px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--violet)', display: 'flex' }}><Icon d={ICONS.ai} size={16} /></span>
          <strong style={{ fontSize: 14 }}>Criar widget</strong>
          <span style={{ flex: 1 }}></span>
          <button onClick={onClose} style={{ color: 'var(--text-3)', display: 'flex', padding: 4 }}><Icon d={ICONS.x} size={15} /></button>
        </header>
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '220px 1fr', gap: 18 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
              Título
              <input value={title} onChange={e => setTitle(e.target.value)} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none' }} />
            </label>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Fonte de dados</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {['Tarefas', 'Chamados', 'Projetos', 'Horas'].map(s => (
                  <button key={s} onClick={() => setSource(s)} style={{
                    textAlign: 'left', borderRadius: 8, padding: '8px 11px', fontSize: 12, fontWeight: 600,
                    border: source === s ? '1.5px solid var(--violet)' : '1px solid var(--border)',
                    background: source === s ? 'var(--violet-soft)' : 'transparent',
                    color: source === s ? 'var(--violet)' : 'var(--text-2)',
                  }}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Visualização</span>
              <div style={{ display: 'flex', gap: 5 }}>
                {['KPI', 'Lista', 'Barras'].map(v => (
                  <button key={v} onClick={() => setViz(v)} style={{
                    flex: 1, borderRadius: 8, padding: '8px 0', fontSize: 11.5, fontWeight: 600,
                    border: viz === v ? '1.5px solid var(--violet)' : '1px solid var(--border)',
                    background: viz === v ? 'var(--violet-soft)' : 'transparent',
                    color: viz === v ? 'var(--violet)' : 'var(--text-2)',
                  }}>{v}</button>
                ))}
              </div>
            </div>
          </div>
          {/* Preview ao vivo */}
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 7 }}>Pré-visualização ao vivo</span>
            <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 14 }}>
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11 }}>
                  <span style={{ width: 24, height: 24, borderRadius: 7, background: 'var(--violet-soft)', color: 'var(--violet)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon d={ICONS.reports} size={12} />
                  </span>
                  <strong style={{ fontSize: 13 }}>{title || 'Meu widget'}</strong>
                  <Badge tone="violet">{source} · {viz}</Badge>
                </div>
                <WidgetBody type="builder" params={{ source, viz, title }} />
              </div>
            </div>
          </div>
        </div>
        <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '13px 20px', borderTop: '1px solid var(--border)' }}>
          <GhostBtn onClick={onClose}>Cancelar</GhostBtn>
          <PrimaryBtn icon="check" onClick={() => {
            if (!title.trim()) { window.SOGI_TOAST('Dê um título ao widget', 'warn'); return; }
            onCreate({ title: title.trim(), source, viz });
          }}>Adicionar ao dashboard</PrimaryBtn>
        </footer>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardsSettings, TemplateEditorModal, WidgetBody, WidgetBuilderModal });
