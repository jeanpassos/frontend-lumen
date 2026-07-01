// SOGI — Projetos: lista, workspace do projeto, Kanban com drag & drop, detalhe de tarefa
const { useState: useStateP } = React;

/* ============ Lista de projetos ============ */
function ProjectsScreen({ onOpenProject }) {
  const D = SOGI_DATA;
  return (
    <div data-screen-label="Projetos" style={{ padding: 24, overflowY: 'auto', flex: 1, animation: 'sogi-fade-up .25s ease' }}>
      <PageHeader
        title="Projetos"
        subtitle="4 projetos ativos · 2 exigem atenção"
        actions={<>
          <GhostBtn icon="flow" onClick={() => window.SOGI_TOAST('Modelos de fluxo BPM — em breve', 'info')}>Modelos de fluxo</GhostBtn>
          <PrimaryBtn icon="plus" onClick={() => window.SOGI_TOAST('Assistente de novo projeto — descreva o objetivo e a IA monta as etapas', 'info')}>Novo projeto</PrimaryBtn>
        </>}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 14 }}>
        {D.projects.map(p => (
          <button key={p.id} onClick={() => onOpenProject(p.id)} style={{
            background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)',
            padding: 'var(--pad)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12,
            transition: 'transform .12s, box-shadow .12s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-pop)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="mono" style={{
                fontSize: 10.5, fontWeight: 600, letterSpacing: '0.05em', color: 'var(--accent-text)',
                background: 'var(--accent-soft)', borderRadius: 5, padding: '2px 7px',
              }}>{p.code}</span>
              <span style={{ flex: 1 }}></span>
              <HealthDot health={p.health} />
              <span style={{ fontSize: 11.5, color: 'var(--text-2)', fontWeight: 600 }}>
                {{ ok: 'Saudável', warn: 'Atenção', risk: 'Em risco' }[p.health]}
              </span>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 650 }}>{p.name}</h3>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-3)' }}>{p.client}</p>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.45 }}>{p.healthNote}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AvatarStack ids={p.team} size={24} />
              <span style={{ flex: 1 }}></span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>
                {p.tasksDone}/{p.tasksDone + p.tasksOpen} tarefas
              </span>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>
                <span>Progresso</span>
                <span className="mono" style={{ fontWeight: 600, color: 'var(--text-2)' }}>{p.progress}% · até {p.dueDate}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--bg)', overflow: 'hidden' }}>
                <div style={{
                  width: `${p.progress}%`, height: '100%', borderRadius: 3,
                  background: { ok: 'var(--accent)', warn: 'var(--warn)', risk: 'var(--danger)' }[p.health],
                }}></div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============ Workspace do projeto ============ */
const PROJECT_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'kanban', label: 'Kanban', icon: 'kanban' },
  { id: 'lista', label: 'Lista', icon: 'list' },
  { id: 'gantt', label: 'Gantt', icon: 'gantt' },
  { id: 'fluxo', label: 'Fluxograma', icon: 'flow' },
  { id: 'workload', label: 'Workload', icon: 'users' },
];

function ProjectWorkspace({ projectId, onBack, onOpenTask }) {
  const p = SOGI_DATA.projects.find(x => x.id === projectId) || SOGI_DATA.projects[0];
  const [tab, setTab] = useStateP('kanban');
  const [inviteOpen, setInviteOpen] = useStateP(false);
  return (
    <div data-screen-label={`Projeto ${p.code}`} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, animation: 'sogi-fade-up .25s ease' }}>
      <div style={{ padding: '24px 24px 0' }}>
        <PageHeader
          crumbs={[{ label: 'Projetos', onClick: onBack }, { label: p.code }]}
          title={p.name}
          actions={<>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 6, position: 'relative' }}>
              <AvatarStack ids={p.team} size={26} />
              <GhostBtn icon="plus" onClick={() => setInviteOpen(o => !o)}>Convidar</GhostBtn>
              {inviteOpen && <InvitePopover team={p.team} onClose={() => setInviteOpen(false)} />}
            </div>
            <PrimaryBtn icon="plus" onClick={() => window.SOGI_NEW_TASK()}>Nova tarefa</PrimaryBtn>
          </>}
        />
        {/* Abas de visualização */}
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 0 }}>
          {PROJECT_TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px', fontSize: 12.5,
              fontWeight: 600, color: tab === t.id ? 'var(--accent-text)' : 'var(--text-2)',
              borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1, transition: 'color .12s',
            }}>
              <Icon d={ICONS[t.icon]} size={14} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'dashboard' && <ProjectDashboard project={p} />}
      {tab === 'kanban' && <KanbanBoard onOpenTask={onOpenTask} />}
      {tab === 'lista' && <TaskListView onOpenTask={onOpenTask} />}
      {tab === 'gantt' && <GanttView onOpenTask={onOpenTask} />}
      {tab === 'fluxo' && <FlowView />}
      {tab === 'workload' && <WorkloadView />}
    </div>
  );
}

/* ============ Popover: convidar para o projeto ============ */
function InvitePopover({ team, onClose }) {
  const [email, setEmail] = useStateP('');
  React.useEffect(() => {
    const h = () => onClose();
    setTimeout(() => document.addEventListener('click', h), 0);
    return () => document.removeEventListener('click', h);
  }, []);
  const others = Object.values(SOGI_DATA.people).filter(p => !team.includes(p.id));
  return (
    <div onClick={e => e.stopPropagation()} style={{
      position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 290, background: 'var(--surface)',
      borderRadius: 12, boxShadow: 'var(--shadow-pop)', zIndex: 60, animation: 'sogi-pop .15s ease', overflow: 'hidden',
    }}>
      <header style={{ padding: '12px 14px 8px', fontSize: 10.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Convidar para o projeto</header>
      {others.map(p => (
        <button key={p.id} onClick={() => { window.SOGI_TOAST(`${p.name} adicionado(a) ao projeto`); onClose(); }} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', width: '100%', textAlign: 'left',
          borderTop: '1px solid var(--border)',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <Avatar person={p.id} size={28} showStatus />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600 }}>{p.name}</span>
            <span style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{p.role}</span>
          </span>
          <span style={{ color: 'var(--accent-text)', display: 'flex' }}><Icon d={ICONS.plus} size={14} /></span>
        </button>
      ))}
      <div style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 7 }}>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="e-mail externo…"
          style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 7, padding: '7px 10px', fontSize: 12, outline: 'none', minWidth: 0 }} />
        <button onClick={() => { if (email.trim()) { window.SOGI_TOAST(`Convite enviado para ${email.trim()}`); setEmail(''); onClose(); } }} style={{
          background: 'var(--accent)', color: '#fff', borderRadius: 7, padding: '0 12px', fontWeight: 600, fontSize: 12,
        }}>Enviar</button>
      </div>
    </div>
  );
}

/* ============ Kanban com drag & drop e colunas configuráveis ============ */
function KanbanBoard({ onOpenTask }) {
  const [tasks, setTasks] = useStateP(SOGI_DATA.kanban.tasks);
  const [cols, setCols] = useStateP(SOGI_DATA.kanban.columns);
  const [dragId, setDragId] = useStateP(null);
  const [overCol, setOverCol] = useStateP(null);
  const [configOpen, setConfigOpen] = useStateP(false);

  const drop = (colId) => {
    if (dragId) setTasks(ts => ts.map(t => t.id === dragId ? { ...t, col: colId } : t));
    setDragId(null); setOverCol(null);
  };

  const cardCtx = (t) => [
    { label: 'Abrir tarefa', icon: 'tasks', onClick: () => onOpenTask(t.id) },
    { label: 'Mover para Concluído', icon: 'check', onClick: () => { setTasks(ts => ts.map(x => x.id === t.id ? { ...x, col: 'done' } : x)); window.SOGI_TOAST('Tarefa concluída! +50 pts 🏅'); } },
    { label: 'Atribuir a mim', icon: 'users', onClick: () => { setTasks(ts => ts.map(x => x.id === t.id ? { ...x, assignee: 'rafael' } : x)); window.SOGI_TOAST('Tarefa atribuída a você'); } },
    { label: 'Duplicar', icon: 'docs', onClick: () => { setTasks(ts => [...ts, { ...t, id: 'dup' + Date.now(), title: t.title + ' (cópia)' }]); window.SOGI_TOAST('Tarefa duplicada'); } },
    '-',
    { label: 'Excluir tarefa', icon: 'trash', danger: true, onClick: () => { setTasks(ts => ts.filter(x => x.id !== t.id)); window.SOGI_TOAST('Tarefa excluída', 'warn'); } },
  ];

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px 0' }}>
        <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>arraste os cards · botão direito abre ações</span>
        <span style={{ flex: 1 }}></span>
        <button onClick={() => setConfigOpen(true)} style={{
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 600,
          color: 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 7, padding: '5px 11px',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}>
          <Icon d={ICONS.settings} size={13} /> Configurar colunas
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowX: 'auto', padding: '10px 24px 24px' }}>
        <div style={{ display: 'flex', gap: 14, height: '100%', minWidth: 'min-content' }}>
          {cols.map(col => {
            const colTasks = tasks.filter(t => t.col === col.id);
            const isOver = overCol === col.id;
            return (
              <div key={col.id}
                onDragOver={e => { e.preventDefault(); setOverCol(col.id); }}
                onDragLeave={() => setOverCol(c => c === col.id ? null : c)}
                onDrop={() => drop(col.id)}
                style={{
                  width: 272, flexShrink: 0, display: 'flex', flexDirection: 'column', minHeight: 0,
                  background: isOver ? 'var(--accent-soft)' : 'rgba(22,36,58,0.035)',
                  borderRadius: 'var(--radius)', transition: 'background .15s',
                  outline: isOver ? '2px dashed var(--accent)' : 'none', outlineOffset: -2,
                }}>
                <header style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 13px 7px' }}>
                  <strong style={{ fontSize: 12.5 }}>{col.name}</strong>
                  <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)', background: 'var(--surface)', borderRadius: 99, padding: '1px 7px', border: '1px solid var(--border)' }}>
                    {colTasks.length}{col.wip ? `/${col.wip}` : ''}
                  </span>
                  {col.wip && colTasks.length > col.wip && <Badge tone="danger">WIP!</Badge>}
                  <span style={{ flex: 1 }}></span>
                  <button onClick={() => window.SOGI_NEW_TASK()} style={{ color: 'var(--text-3)', display: 'flex' }}><Icon d={ICONS.plus} size={13} /></button>
                </header>
                <div style={{ flex: 1, overflowY: 'auto', padding: '4px 9px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {colTasks.map(t => (
                    <KanbanCard key={t.id} task={t} dragging={dragId === t.id}
                      onDragStart={() => setDragId(t.id)} onDragEnd={() => { setDragId(null); setOverCol(null); }}
                      onClick={() => onOpenTask(t.id)}
                      onContextMenu={e => window.SOGI_CTX(e, cardCtx(t))} />
                  ))}
                  {colTasks.length === 0 && (
                    <div className="mono" style={{
                      border: '1.5px dashed var(--border-strong)', borderRadius: 8, padding: '18px 10px',
                      fontSize: 10.5, color: 'var(--text-3)', textAlign: 'center',
                    }}>solte aqui</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {configOpen && <ColumnsConfigModal cols={cols} onSave={(c) => { setCols(c); window.SOGI_TOAST('Colunas do quadro atualizadas'); }} onClose={() => setConfigOpen(false)} />}
    </div>
  );
}

/* ============ Modal: configurar colunas (admin) ============ */
function ColumnsConfigModal({ cols, onSave, onClose }) {
  const [list, setList] = useStateP(cols.map(c => ({ ...c })));
  const update = (i, patch) => setList(l => l.map((c, j) => j === i ? { ...c, ...patch } : c));
  const remove = (i) => setList(l => l.filter((_, j) => j !== i));
  const add = () => setList(l => [...l, { id: 'col' + Date.now(), name: 'Nova coluna', wip: null }]);
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(24,60,90,0.4)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'sogi-pop .15s ease' }}>
      <div data-screen-label="Configurar colunas" onClick={e => e.stopPropagation()} style={{ width: 480, maxWidth: '94vw', background: 'var(--surface)', borderRadius: 14, boxShadow: 'var(--shadow-pop)', animation: 'sogi-pop .2s cubic-bezier(.3,1.3,.6,1)' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '15px 20px', borderBottom: '1px solid var(--border)' }}>
          <strong style={{ fontSize: 14 }}>Configurar colunas do quadro</strong>
          <Badge tone="violet">admin</Badge>
          <span style={{ flex: 1 }}></span>
          <button onClick={onClose} style={{ color: 'var(--text-3)', display: 'flex', padding: 4 }}><Icon d={ICONS.x} size={15} /></button>
        </header>
        <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '54vh', overflowY: 'auto' }}>
          {list.map((c, i) => (
            <div key={c.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)', width: 16, textAlign: 'center' }}>{i + 1}</span>
              <input value={c.name} onChange={e => update(i, { name: e.target.value })}
                style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 7, padding: '8px 10px', fontSize: 12.5, outline: 'none', minWidth: 0 }} />
              <select value={c.wip || ''} onChange={e => update(i, { wip: e.target.value ? +e.target.value : null })} title="Limite WIP"
                style={{ border: '1px solid var(--border)', borderRadius: 7, padding: '7px 8px', fontSize: 11.5, fontFamily: 'var(--font-ui)', color: 'var(--text-2)', background: 'var(--surface)' }}>
                <option value="">sem WIP</option>
                {[2, 3, 4, 5, 6, 8].map(n => <option key={n} value={n}>WIP {n}</option>)}
              </select>
              <button onClick={() => remove(i)} title="Remover coluna" style={{ color: 'var(--text-3)', display: 'flex', padding: 5 }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                <Icon d={ICONS.trash} size={14} />
              </button>
            </div>
          ))}
          <button onClick={add} style={{
            border: '1.5px dashed var(--border-strong)', borderRadius: 8, padding: '8px 0',
            fontSize: 12, fontWeight: 600, color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Icon d={ICONS.plus} size={13} /> Adicionar coluna
          </button>
          <p className="mono" style={{ margin: '2px 0 0', fontSize: 9.5, color: 'var(--text-3)', lineHeight: 1.6 }}>cada projeto pode ter colunas próprias · o padrão é Backlog → A Fazer → Em Andamento → Validação → Concluído</p>
        </div>
        <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '13px 20px', borderTop: '1px solid var(--border)' }}>
          <GhostBtn onClick={onClose}>Cancelar</GhostBtn>
          <PrimaryBtn icon="check" onClick={() => { onSave(list); onClose(); }}>Salvar colunas</PrimaryBtn>
        </footer>
      </div>
    </div>
  );
}

function KanbanCard({ task, dragging, onDragStart, onDragEnd, onClick, onContextMenu }) {
  const done = task.checklist[0]; const total = task.checklist[1];
  return (
    <div draggable onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={onClick} onContextMenu={onContextMenu} style={{
      background: task.late ? 'var(--danger-soft)' : 'var(--surface)', borderRadius: 9,
      boxShadow: 'var(--shadow-card)', padding: 12,
      borderLeft: task.late ? '3px solid var(--danger)' : '3px solid transparent',
      cursor: 'grab', opacity: dragging ? 0.45 : 1, transform: dragging ? 'rotate(2deg)' : 'none',
      transition: 'box-shadow .12s, opacity .12s', animation: 'sogi-pop .18s ease',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-pop)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
        <Badge tone={task.tagColor}>{task.tag}</Badge>
        {task.late && <Badge tone="danger" dot>atrasada</Badge>}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 550, lineHeight: 1.4, marginBottom: 10, color: task.late ? 'var(--danger)' : 'var(--text)' }}>{task.title}</div>
      {total > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--bg)', overflow: 'hidden' }}>
            <div style={{ width: `${(done / total) * 100}%`, height: '100%', background: done === total ? 'var(--ok)' : 'var(--accent)', borderRadius: 2 }}></div>
          </div>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{done}/{total}</span>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar person={task.assignee} size={22} />
        <span style={{ fontSize: 11, color: task.late ? 'var(--danger)' : 'var(--text-3)', fontWeight: task.late ? 600 : 400, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon d={ICONS.clock} size={12} />{task.due}
        </span>
        <span style={{ flex: 1 }}></span>
        {task.comments > 0 && (
          <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon d={ICONS.chat} size={12} />{task.comments}
          </span>
        )}
      </div>
    </div>
  );
}

/* ============ Visualização em lista ============ */
function TaskListView({ onOpenTask }) {
  const tasks = SOGI_DATA.kanban.tasks;
  const cols = SOGI_DATA.kanban.columns;
  const colName = id => cols.find(c => c.id === id).name;
  const colTone = { backlog: 'neutral', todo: 'accent', doing: 'violet', review: 'warn', done: 'ok' };
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 24px' }}>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              {['Tarefa', 'Status', 'Responsável', 'Prioridade', 'Prazo', 'Checklist'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '9px 14px', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id} onClick={() => onOpenTask(t.id)}
                onContextMenu={e => window.SOGI_CTX(e, [
                  { label: 'Abrir tarefa', icon: 'tasks', onClick: () => onOpenTask(t.id) },
                  { label: 'Atribuir a mim', icon: 'users', onClick: () => window.SOGI_TOAST('Tarefa atribuída a você') },
                  '-',
                  { label: 'Excluir tarefa', icon: 'trash', danger: true, onClick: () => window.SOGI_TOAST('Tarefa excluída', 'warn') },
                ])}
                style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', background: t.late ? 'var(--danger-soft)' : 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.background = t.late ? 'var(--danger-soft)' : 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = t.late ? 'var(--danger-soft)' : 'transparent'}>
                <td style={{ padding: '10px 14px', fontWeight: t.late ? 600 : 500, maxWidth: 340, color: t.late ? 'var(--danger)' : 'var(--text)', borderLeft: t.late ? '3px solid var(--danger)' : '3px solid transparent' }}>{t.title}</td>
                <td style={{ padding: '10px 14px' }}><Badge tone={colTone[t.col]} dot>{colName(t.col)}</Badge></td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Avatar person={t.assignee} size={21} />
                    <span style={{ fontSize: 12 }}>{SOGI_DATA.people[t.assignee].name.split(' ')[0]}</span>
                  </span>
                </td>
                <td style={{ padding: '10px 14px' }}><PriorityBadge p={t.priority} /></td>
                <td style={{ padding: '10px 14px', color: t.late ? 'var(--danger)' : 'var(--text-2)', fontWeight: t.late ? 600 : 400 }}>{t.due}</td>
                <td className="mono" style={{ padding: '10px 14px', color: 'var(--text-3)', fontSize: 11 }}>{t.checklist[0]}/{t.checklist[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

Object.assign(window, { ProjectsScreen, ProjectWorkspace, KanbanBoard, TaskListView, ColumnsConfigModal, InvitePopover });
