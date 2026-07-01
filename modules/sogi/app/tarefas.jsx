// SOGI — Detalhe de tarefa (drawer expansível) + workspace Minhas Tarefas
const { useState: useStateT } = React;

/* ============ Drawer/Modal de detalhe de tarefa ============ */
function TaskDrawer({ onClose }) {
  const t = SOGI_DATA.taskDetail;
  const [expanded, setExpanded] = useStateT(true);
  const [checklist, setChecklist] = useStateT(t.checklist);
  const [comment, setComment] = useStateT('');
  const [comments, setComments] = useStateT(t.comments);
  const [due, setDue] = useStateT('10 Jun');
  const [dueTime, setDueTime] = useStateT('18:00');
  const [estimate, setEstimate] = useStateT('16h');
  const [assignee, setAssignee] = useStateT(t.assignee);
  const [subtasks, setSubtasks] = useStateT([
    { text: 'Validar layout de cobrança (BB)', done: true, who: 'ana' },
    { text: 'Validar layout de pagamento (Itaú)', done: true, who: 'pedro' },
    { text: 'Agendar assinatura com o financeiro', done: false, who: 'rafael' },
  ]);
  const [newSub, setNewSub] = useStateT('');
  const [deps, setDeps] = useStateT(['Script de migração — tabelas de RH']);
  const doneCount = checklist.filter(c => c.done).length;

  const addSub = () => {
    if (!newSub.trim()) return;
    setSubtasks(ss => [...ss, { text: newSub.trim(), done: false, who: 'rafael' }]);
    setNewSub('');
    window.SOGI_TOAST('Subtarefa adicionada');
  };

  const sendComment = () => {
    if (!comment.trim()) return;
    setComments(cs => [...cs, { who: 'rafael', when: 'agora', text: comment.trim() }]);
    setComment('');
  };

  const Header = (
    <header style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
      <Badge tone="warn" dot>{t.status}</Badge>
      {t.late && <Badge tone="danger" dot>atrasada</Badge>}
      <span style={{ flex: 1 }}></span>
      <button title={expanded ? 'Restaurar painel lateral' : 'Expandir para tela cheia'} onClick={() => setExpanded(e => !e)}
        style={{ color: 'var(--text-3)', display: 'flex', padding: 6, borderRadius: 7, border: '1px solid var(--border)', gap: 6, alignItems: 'center', fontSize: 11.5, fontWeight: 600 }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-text)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
        <Icon d={expanded ? 'M9 4H4v5 M15 4h5v5 M9 20H4v-5 M15 20h5v-5' : 'M4 9V4h5 M20 9V4h-5 M4 15v5h5 M20 15v5h-5'} size={14} />
        {expanded ? 'Reduzir' : 'Expandir'}
      </button>
      <button title="Copiar link" onClick={() => window.SOGI_TOAST('Link da tarefa copiado')} style={{ color: 'var(--text-3)', display: 'flex', padding: 5 }}><Icon d={ICONS.link} size={15} /></button>
      <button onClick={onClose} style={{ color: 'var(--text-3)', display: 'flex', padding: 5 }}><Icon d={ICONS.x} size={16} /></button>
    </header>
  );

  const MetaBlock = (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '12px 18px', fontSize: 12.5, alignItems: 'center', alignContent: 'start' }}>
      <MetaLabel>Responsável</MetaLabel>
      <select value={assignee} onChange={e => { setAssignee(e.target.value); window.SOGI_TOAST(`Responsável: ${SOGI_DATA.people[e.target.value].name}`); }} style={{
        border: '1px solid var(--border)', borderRadius: 7, padding: '6px 8px', fontSize: 12.5,
        fontFamily: 'var(--font-ui)', color: 'var(--text)', background: 'var(--surface)', width: 'fit-content',
      }}>
        {Object.values(SOGI_DATA.people).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <MetaLabel>Participantes</MetaLabel>
      <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <AvatarStack ids={t.participants} size={22} />
        <button onClick={() => window.SOGI_TOAST('Adicionar participante', 'info')} style={{
          width: 22, height: 22, borderRadius: '50%', border: '1.5px dashed var(--border-strong)',
          color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><Icon d={ICONS.plus} size={11} /></button>
      </span>
      <MetaLabel>Prioridade</MetaLabel>
      <span><PriorityBadge p={t.priority} /></span>
      <MetaLabel>Prazo</MetaLabel>
      <span style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={due} onChange={e => { setDue(e.target.value); window.SOGI_TOAST(`Prazo alterado para ${e.target.value}`); }} style={{
          border: '1px solid ' + (t.late ? 'var(--danger)' : 'var(--border)'), borderRadius: 7, padding: '5px 8px', fontSize: 12,
          fontFamily: 'var(--font-ui)', color: t.late ? 'var(--danger)' : 'var(--text)', background: 'var(--surface)', fontWeight: 600,
        }}>
          {['10 Jun', '11 Jun', '12 Jun', '13 Jun', '16 Jun', '20 Jun'].map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={dueTime} onChange={e => setDueTime(e.target.value)} style={{
          border: '1px solid var(--border)', borderRadius: 7, padding: '5px 8px', fontSize: 12,
          fontFamily: 'var(--font-ui)', color: 'var(--text)', background: 'var(--surface)',
        }}>
          {['09:00', '12:00', '15:00', '18:00'].map(h => <option key={h}>{h}</option>)}
        </select>
        {t.late && <Badge tone="danger" dot>venceu ontem</Badge>}
      </span>
      <MetaLabel>Estimativa</MetaLabel>
      <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <select value={estimate} onChange={e => setEstimate(e.target.value)} style={{
          border: '1px solid var(--border)', borderRadius: 7, padding: '5px 8px', fontSize: 12,
          fontFamily: 'var(--font-ui)', color: 'var(--text)', background: 'var(--surface)',
        }}>
          {['4h', '8h', '16h', '24h', '40h'].map(h => <option key={h}>{h}</option>)}
        </select>
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)' }}>14h apontadas</span>
      </span>
      <MetaLabel>Projeto</MetaLabel>
      <span className="mono" style={{ fontSize: 11 }}>ERP-MIG</span>
    </div>
  );

  const DepsBlock = (
    <div>
      <SectionLabel>Dependências · {deps.length}</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {deps.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--warn-soft)', borderRadius: 8, padding: '8px 11px' }}>
            <span style={{ color: 'var(--warn)', display: 'flex' }}><Icon d={ICONS.link} size={13} /></span>
            <span style={{ flex: 1, fontSize: 12, fontWeight: 500 }}>Depende de: <strong>{d}</strong></span>
            <Badge tone="ok" dot>concluída</Badge>
            <button onClick={() => { setDeps(ds => ds.filter((_, j) => j !== i)); window.SOGI_TOAST('Dependência removida'); }} style={{ color: 'var(--text-3)', display: 'flex', padding: 3 }}>
              <Icon d={ICONS.x} size={12} />
            </button>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--accent-soft)', borderRadius: 8, padding: '8px 11px' }}>
          <span style={{ color: 'var(--accent-text)', display: 'flex' }}><Icon d={ICONS.alert} size={13} /></span>
          <span style={{ flex: 1, fontSize: 12 }}>Esta tarefa <strong>bloqueia 3 tarefas</strong> da virada</span>
        </div>
        <button onClick={() => { setDeps(ds => [...ds, 'Configurar ambiente de homologação']); window.SOGI_TOAST('Dependência adicionada'); }} style={{
          border: '1.5px dashed var(--border-strong)', borderRadius: 8, padding: '7px 0',
          fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <Icon d={ICONS.plus} size={12} /> Adicionar dependência
        </button>
      </div>
    </div>
  );

  const SubtasksBlock = (
    <div>
      <SectionLabel>Subtarefas · {subtasks.filter(s => s.done).length}/{subtasks.length}</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {subtasks.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 7 }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <button onClick={() => setSubtasks(ss => ss.map((x, j) => j === i ? { ...x, done: !x.done } : x))} style={{
              width: 17, height: 17, borderRadius: 5, flexShrink: 0,
              border: s.done ? 'none' : '1.5px solid var(--border-strong)',
              background: s.done ? 'var(--ok)' : 'transparent', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{s.done && <Icon d={ICONS.check} size={11} sw={2.5} />}</button>
            <span style={{ flex: 1, fontSize: 12.5, color: s.done ? 'var(--text-3)' : 'var(--text)', textDecoration: s.done ? 'line-through' : 'none' }}>{s.text}</span>
            <Avatar person={s.who} size={19} />
          </div>
        ))}
        <div style={{ display: 'flex', gap: 7, marginTop: 4 }}>
          <input value={newSub} onChange={e => setNewSub(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSub()}
            placeholder="Nova subtarefa…"
            style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 7, padding: '7px 10px', fontSize: 12, outline: 'none', minWidth: 0 }} />
          <button onClick={addSub} style={{ background: 'var(--accent)', color: '#fff', borderRadius: 7, padding: '0 12px', fontWeight: 600, fontSize: 12 }}>+</button>
        </div>
      </div>
    </div>
  );

  const ChecklistBlock = (
    <div>
      <SectionLabel>Checklist · {doneCount}/{checklist.length}</SectionLabel>
      <div style={{ height: 5, borderRadius: 3, background: 'var(--bg)', overflow: 'hidden', marginBottom: 10 }}>
        <div style={{ width: `${(doneCount / checklist.length) * 100}%`, height: '100%', background: doneCount === checklist.length ? 'var(--ok)' : 'var(--accent)', transition: 'width .3s ease' }}></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {checklist.map((c, i) => (
          <button key={i} onClick={() => setChecklist(cl => cl.map((x, j) => j === i ? { ...x, done: !x.done } : x))}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 7, textAlign: 'left' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span style={{
              width: 17, height: 17, borderRadius: 5, flexShrink: 0,
              border: c.done ? 'none' : '1.5px solid var(--border-strong)',
              background: c.done ? 'var(--ok)' : 'transparent', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{c.done && <Icon d={ICONS.check} size={11} sw={2.5} />}</span>
            <span style={{ fontSize: 12.5, color: c.done ? 'var(--text-3)' : 'var(--text)', textDecoration: c.done ? 'line-through' : 'none' }}>{c.text}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const CommentsBlock = (
    <div>
      <SectionLabel>Comentários · {comments.length}</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 10 }}>
        {comments.map((c, i) => (
          <div key={i} style={{ display: 'flex', gap: 10 }}>
            <Avatar person={c.who} size={26} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                <strong style={{ fontSize: 12.5 }}>{SOGI_DATA.people[c.who].name}</strong>
                <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{c.when}</span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: 12.5, lineHeight: 1.5, color: 'var(--text-2)' }}>{c.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const Composer = (
    <footer style={{ padding: 14, borderTop: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
      <Avatar person="rafael" size={28} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg)', borderRadius: 9, padding: '4px 4px 4px 12px' }}>
        <input value={comment} onChange={e => setComment(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendComment()}
          placeholder="Escreva um comentário… use @ para mencionar"
          style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 12.5, minWidth: 0 }} />
        <button style={{ color: 'var(--text-3)', display: 'flex', padding: 5 }}><Icon d={ICONS.paperclip} size={14} /></button>
        <button onClick={sendComment} style={{
          width: 30, height: 30, borderRadius: 7, background: 'var(--accent)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}><Icon d={ICONS.send} size={13} /></button>
      </div>
    </footer>
  );

  const TitleBlock = (
    <div>
      <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)', letterSpacing: '0.05em', marginBottom: 6 }}>ERP-MIG · {t.project}</div>
      <h2 style={{ margin: 0, fontSize: expanded ? 21 : 18, fontWeight: 700, lineHeight: 1.35 }}>{t.title}</h2>
    </div>
  );

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(24, 60, 90, 0.4)', zIndex: 50,
      display: 'flex', justifyContent: expanded ? 'center' : 'flex-end', alignItems: expanded ? 'center' : 'stretch',
      animation: 'sogi-pop .15s ease', padding: expanded ? 28 : 0,
    }}>
      <aside data-screen-label="Detalhe de tarefa" onClick={e => e.stopPropagation()} style={{
        width: expanded ? 'min(1060px, 96vw)' : 520, maxWidth: expanded ? '96vw' : '92vw',
        height: expanded ? 'min(760px, 92vh)' : '100%',
        background: 'var(--surface)', borderRadius: expanded ? 16 : 0,
        display: 'flex', flexDirection: 'column',
        boxShadow: expanded ? 'var(--shadow-pop)' : '-12px 0 40px rgba(24,60,90,0.18)',
        animation: 'sogi-drawer-in .22s ease', transition: 'width .25s ease, height .25s ease, border-radius .25s ease',
        overflow: 'hidden',
      }}>
        <style>{`@keyframes sogi-drawer-in { from { transform: translateX(40px); opacity: 0; } to { transform: none; opacity: 1; } }`}</style>
        {Header}
        {expanded ? (
          /* layout 2 colunas */
          <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 320px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, borderRight: '1px solid var(--border)' }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {TitleBlock}
                <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-2)', margin: 0 }}>{t.description}</p>
                {SubtasksBlock}
                {ChecklistBlock}
                {CommentsBlock}
              </div>
              {Composer}
            </div>
            <div style={{ overflowY: 'auto', padding: '20px 22px', background: 'var(--surface-2)' }}>
              <SectionLabel>Detalhes</SectionLabel>
              {MetaBlock}
              <div style={{ marginTop: 20 }}>{DepsBlock}</div>
              <div style={{ marginTop: 20 }}>
                <SectionLabel>Análise da IA</SectionLabel>
                <div style={{ background: 'var(--surface)', borderRadius: 9, padding: 12, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.55, boxShadow: 'var(--shadow-card)' }}>
                  Checklist 100% concluído — falta apenas registrar a assinatura do termo. Ao concluir, 3 tarefas bloqueadas serão liberadas automaticamente.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {TitleBlock}
              {MetaBlock}
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-2)', margin: 0 }}>{t.description}</p>
              {SubtasksBlock}
              {DepsBlock}
              {ChecklistBlock}
              {CommentsBlock}
            </div>
            {Composer}
          </>
        )}
      </aside>
    </div>
  );
}

const MetaLabel = ({ children }) => <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>{children}</span>;
const SectionLabel = ({ children }) => (
  <h4 style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{children}</h4>
);

/* ============ Workspace: Minhas Tarefas ============ */
const MYTASK_TABS = [
  { id: 'lista', label: 'Lista', icon: 'list' },
  { id: 'kanban', label: 'Kanban', icon: 'kanban' },
  { id: 'semana', label: 'Semana', icon: 'calendar' },
];

const MY_KANBAN_COLS = [
  { id: 'Hoje', tone: 'danger' },
  { id: 'Amanhã', tone: 'warn' },
  { id: 'Próximos dias', tone: 'accent' },
  { id: 'Concluídas', tone: 'ok' },
];

function MyTasksScreen({ onOpenTask }) {
  const [tab, setTab] = useStateT('lista');
  const [checked, setChecked] = useStateT({});
  const all = SOGI_DATA.myTasks;
  const groupOf = (t) => checked[t.id] ? 'Concluídas' : (t.due === 'Hoje' ? 'Hoje' : t.due === 'Amanhã' ? 'Amanhã' : 'Próximos dias');

  return (
    <div data-screen-label="Minhas tarefas" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, animation: 'sogi-fade-up .25s ease' }}>
      <div style={{ padding: '24px 24px 0' }}>
        <PageHeader title="Minhas tarefas"
          subtitle={`${all.length - Object.values(checked).filter(Boolean).length} abertas · ${all.filter(t => t.late).length} atrasada · ${Object.values(checked).filter(Boolean).length} concluídas hoje`}
          actions={<>
            <GhostBtn icon="ai" onClick={() => window.SOGI_TOAST('IA reordenou suas tarefas por impacto e urgência', 'info')}>Priorizar com IA</GhostBtn>
            <PrimaryBtn icon="plus" onClick={() => window.SOGI_NEW_TASK()}>Nova tarefa</PrimaryBtn>
          </>} />
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)' }}>
          {MYTASK_TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px', fontSize: 12.5,
              fontWeight: 600, color: tab === t.id ? 'var(--accent-text)' : 'var(--text-2)',
              borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1, transition: 'color .12s',
            }}>
              <Icon d={ICONS[t.icon]} size={14} />{t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'lista' && <MyTasksList all={all} checked={checked} setChecked={setChecked} onOpenTask={onOpenTask} groupOf={groupOf} />}
      {tab === 'kanban' && <MyTasksKanban all={all} checked={checked} onOpenTask={onOpenTask} groupOf={groupOf} />}
      {tab === 'semana' && <MyTasksWeek all={all} onOpenTask={onOpenTask} />}
    </div>
  );
}

function MyTasksList({ all, checked, setChecked, onOpenTask, groupOf }) {
  const groups = ['Hoje', 'Amanhã', 'Próximos dias', 'Concluídas'].map(g => ({ label: g, items: all.filter(t => groupOf(t) === g) }));
  const ctxItems = (t) => [
    { label: 'Abrir tarefa', icon: 'tasks', onClick: () => onOpenTask(t.id) },
    { label: 'Concluir', icon: 'check', onClick: () => { setChecked(c => ({ ...c, [t.id]: true })); window.SOGI_TOAST('Tarefa concluída! +50 pts 🏅'); } },
    { label: 'Adiar para amanhã', icon: 'clock', onClick: () => window.SOGI_TOAST('Prazo adiado para amanhã') },
    { label: 'Atribuir a outra pessoa', icon: 'users', onClick: () => window.SOGI_TOAST('Selecione o novo responsável', 'info') },
    '-',
    { label: 'Excluir tarefa', icon: 'trash', danger: true, onClick: () => window.SOGI_TOAST('Tarefa excluída', 'warn') },
  ];
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 880 }}>
        {groups.map(g => g.items.length > 0 && (
          <div key={g.label}>
            <SectionLabel>{g.label} · {g.items.length}</SectionLabel>
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
              {g.items.map((t, i) => {
                const isLate = t.late && !checked[t.id];
                return (
                <div key={t.id} onContextMenu={e => window.SOGI_CTX(e, ctxItems(t))} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px var(--pad)',
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none', cursor: 'pointer',
                  opacity: checked[t.id] ? 0.5 : 1, transition: 'opacity .2s, background .15s',
                  background: isLate ? 'var(--danger-soft)' : 'transparent',
                  borderLeft: isLate ? '3px solid var(--danger)' : '3px solid transparent',
                }}
                  onClick={() => onOpenTask(t.id)}
                  onMouseEnter={e => e.currentTarget.style.background = isLate ? 'var(--danger-soft)' : 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = isLate ? 'var(--danger-soft)' : 'transparent'}>
                  <button onClick={e => { e.stopPropagation(); setChecked(c => ({ ...c, [t.id]: !c[t.id] })); if (!checked[t.id]) window.SOGI_TOAST('Tarefa concluída! +50 pts 🏅'); }} style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                    border: checked[t.id] ? 'none' : '1.5px solid ' + (isLate ? 'var(--danger)' : 'var(--border-strong)'),
                    background: checked[t.id] ? 'var(--ok)' : 'transparent', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{checked[t.id] && <Icon d={ICONS.check} size={11} sw={2.5} />}</button>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: isLate ? 600 : 500, color: isLate ? 'var(--danger)' : 'var(--text)', textDecoration: checked[t.id] ? 'line-through' : 'none', minWidth: 0 }}>{t.title}</span>
                  {isLate && <Badge tone="danger" dot>atrasada</Badge>}
                  <span className="mono" style={{ fontSize: 10.5, color: isLate ? 'var(--danger)' : 'var(--text-3)', flexShrink: 0 }}>{t.project}</span>
                  <PriorityBadge p={t.priority} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: isLate ? 'var(--danger)' : 'var(--text-2)', width: 54, textAlign: 'right', flexShrink: 0 }}>{t.due}</span>
                </div>
              );})}
            </div>
          </div>
        ))}
      </div>
      <p className="mono" style={{ margin: '14px 0 0', fontSize: 10, color: 'var(--text-3)' }}>dica: botão direito numa tarefa abre o menu de ações rápidas</p>
    </div>
  );
}

function MyTasksKanban({ all, checked, onOpenTask, groupOf }) {
  const [cols, setCols] = useStateT(MY_KANBAN_COLS.map(c => ({ id: c.id, name: c.id, wip: null, tone: c.tone })));
  const [configOpen, setConfigOpen] = useStateT(false);
  const [overrides, setOverrides] = useStateT({});
  const [dragId, setDragId] = useStateT(null);
  const [overCol, setOverCol] = useStateT(null);
  const effGroup = (t) => overrides[t.id] || groupOf(t);
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 24px 0' }}>
        <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>arraste os cards entre colunas · botão direito abre ações</span>
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
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols.length}, minmax(230px, 1fr))`, gap: 14, height: '100%', minWidth: 'min-content' }}>
          {cols.map((col, ci) => {
            const groupId = (MY_KANBAN_COLS[ci] || {}).id;
            const items = groupId ? all.filter(t => effGroup(t) === groupId) : [];
            const isOver = overCol === ci;
            return (
              <div key={col.id}
                onDragOver={e => { e.preventDefault(); setOverCol(ci); }}
                onDragLeave={() => setOverCol(c => c === ci ? null : c)}
                onDrop={() => {
                  if (dragId && groupId) {
                    setOverrides(o => ({ ...o, [dragId]: groupId }));
                    window.SOGI_TOAST(`Tarefa movida para "${col.name}"`);
                  }
                  setDragId(null); setOverCol(null);
                }}
                style={{
                  background: isOver ? 'var(--accent-soft)' : 'rgba(24,60,90,0.04)', borderRadius: 'var(--radius)',
                  display: 'flex', flexDirection: 'column', minHeight: 0, transition: 'background .15s',
                  outline: isOver ? '2px dashed var(--accent)' : 'none', outlineOffset: -2,
                }}>
                <header style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 13px 7px' }}>
                  <Badge tone={col.tone || 'neutral'} dot>{col.name}</Badge>
                  <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{items.length}</span>
                </header>
                <div style={{ flex: 1, overflowY: 'auto', padding: '4px 9px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map(t => {
                    const isLate = t.late && !checked[t.id];
                    return (
                    <div key={t.id} draggable
                      onDragStart={() => setDragId(t.id)}
                      onDragEnd={() => { setDragId(null); setOverCol(null); }}
                      onClick={() => onOpenTask(t.id)}
                      onContextMenu={e => window.SOGI_CTX(e, [
                        { label: 'Abrir tarefa', icon: 'tasks', onClick: () => onOpenTask(t.id) },
                        { label: 'Adiar para amanhã', icon: 'clock', onClick: () => window.SOGI_TOAST('Prazo adiado para amanhã') },
                        '-',
                        { label: 'Excluir tarefa', icon: 'trash', danger: true, onClick: () => window.SOGI_TOAST('Tarefa excluída', 'warn') },
                      ])}
                      style={{
                        background: isLate ? 'var(--danger-soft)' : 'var(--surface)', borderRadius: 9,
                        boxShadow: 'var(--shadow-card)', padding: 12,
                        borderLeft: isLate ? '3px solid var(--danger)' : '3px solid transparent',
                        cursor: 'grab', opacity: dragId === t.id ? 0.45 : 1, transform: dragId === t.id ? 'rotate(2deg)' : 'none',
                        animation: 'sogi-pop .18s ease', transition: 'box-shadow .12s, opacity .12s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-pop)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}>
                      <div style={{ fontSize: 12.5, fontWeight: 550, lineHeight: 1.4, marginBottom: 8, textDecoration: checked[t.id] ? 'line-through' : 'none', color: isLate ? 'var(--danger)' : 'var(--text)' }}>{t.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{t.project}</span>
                        <span style={{ flex: 1 }}></span>
                        {isLate && <Badge tone="danger" dot>atrasada</Badge>}
                        <PriorityBadge p={t.priority} />
                      </div>
                    </div>
                  );})}
                  {items.length === 0 && (
                    <div className="mono" style={{ border: '1.5px dashed var(--border-strong)', borderRadius: 8, padding: '16px 10px', fontSize: 10.5, color: 'var(--text-3)', textAlign: 'center' }}>vazio</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {configOpen && <ColumnsConfigModal cols={cols} onSave={(c) => { setCols(c.map((x, i) => ({ ...x, tone: (cols[i] || {}).tone || 'neutral' }))); window.SOGI_TOAST('Colunas do quadro pessoal atualizadas'); }} onClose={() => setConfigOpen(false)} />}
    </div>
  );
}

function MyTasksWeek({ all, onOpenTask }) {
  const days = [['SEG', '8'], ['TER', '9'], ['QUA', '10'], ['QUI', '11'], ['SEX', '12']];
  const [overrides, setOverrides] = useStateT({});
  const [dragId, setDragId] = useStateT(null);
  const [overDay, setOverDay] = useStateT(null);
  const naturalDay = (t) => t.due === 'Hoje' ? 'QUA' : t.due === 'Amanhã' ? 'QUI' : 'SEX';
  const effDay = (t) => overrides[t.id] || naturalDay(t);
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 24px 0' }}>
        <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>arraste as tarefas entre os dias para replanejar a semana</span>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowX: 'auto', padding: '10px 24px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(190px, 1fr))', gap: 10, height: '100%', minWidth: 'min-content' }}>
          {days.map(([d, n]) => {
            const isToday = d === 'QUA';
            const items = all.filter(t => effDay(t) === d);
            const isOver = overDay === d;
            return (
              <div key={d}
                onDragOver={e => { e.preventDefault(); setOverDay(d); }}
                onDragLeave={() => setOverDay(x => x === d ? null : x)}
                onDrop={() => {
                  if (dragId) {
                    setOverrides(o => ({ ...o, [dragId]: d }));
                    window.SOGI_TOAST(`Tarefa replanejada para ${d} ${n}/06`);
                  }
                  setDragId(null); setOverDay(null);
                }}
                style={{
                  background: isOver ? 'var(--accent-soft)' : 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)',
                  display: 'flex', flexDirection: 'column', minHeight: 0, transition: 'background .15s',
                  outline: isOver ? '2px dashed var(--accent)' : isToday ? '2px solid var(--accent)' : 'none', outlineOffset: -2,
                }}>
                <header style={{ padding: '11px 13px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'baseline', gap: 7 }}>
                  <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: isToday ? 'var(--accent-text)' : 'var(--text-3)', letterSpacing: '0.08em' }}>{d}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: isToday ? 'var(--accent-text)' : 'var(--text)' }}>{n}</span>
                  {isToday && <Badge tone="accent">hoje</Badge>}
                  <span style={{ flex: 1 }}></span>
                  <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>{items.length}</span>
                </header>
                <div style={{ flex: 1, overflowY: 'auto', padding: 9, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {items.map(t => (
                    <button key={t.id} draggable
                      onDragStart={() => setDragId(t.id)}
                      onDragEnd={() => { setDragId(null); setOverDay(null); }}
                      onClick={() => onOpenTask(t.id)} style={{
                      textAlign: 'left', background: 'var(--surface-2)', borderRadius: 8, padding: '9px 11px',
                      borderLeft: `3px solid ${t.late ? 'var(--danger)' : 'var(--accent)'}`,
                      cursor: 'grab', opacity: dragId === t.id ? 0.45 : 1, transform: dragId === t.id ? 'rotate(2deg)' : 'none',
                      transition: 'opacity .12s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-soft)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-2)'}>
                      <span style={{ display: 'block', fontSize: 12, fontWeight: 550, lineHeight: 1.35 }}>{t.title}</span>
                      <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>{t.project}</span>
                    </button>
                  ))}
                  {items.length === 0 && (
                    <div className="mono" style={{ border: '1.5px dashed var(--border-strong)', borderRadius: 8, padding: '14px 8px', fontSize: 10, color: 'var(--text-3)', textAlign: 'center' }}>solte aqui</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TaskDrawer, MyTasksScreen, SectionLabel });
