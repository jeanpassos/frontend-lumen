// SOGI — demonstração do app mobile (PWA): navegação funcional, swipe, voz, push
const { useState: useStateMB } = React;

const MB_NAV_OPTIONS = [
  { id: 'tarefas', label: 'Tarefas', icon: 'tasks' },
  { id: 'projetos', label: 'Projetos', icon: 'projects' },
  { id: 'chat', label: 'Chat', icon: 'chat' },
  { id: 'notif', label: 'Notificações', icon: 'bell' },
  { id: 'chamados', label: 'Chamados', icon: 'tickets' },
  { id: 'calendario', label: 'Agenda', icon: 'calendar' },
  { id: 'aprovacoes', label: 'Aprovações', icon: 'check' },
];

const MB_TITLES = { home: 'Início', tarefas: 'Minhas tarefas', projetos: 'Projetos', chat: 'Chat', notif: 'Notificações', chamados: 'Chamados', calendario: 'Agenda', aprovacoes: 'Aprovações' };

function MobileOverlay({ onClose }) {
  const [navSel, setNavSel] = useStateMB(['tarefas', 'chat', 'notif', 'aprovacoes']);
  const [push, setPush] = useStateMB(true);
  const [pushVisible, setPushVisible] = useStateMB(true);
  const [swiped, setSwiped] = useStateMB(null);
  const [doneIds, setDoneIds] = useStateMB({});
  const [activeNav, setActiveNav] = useStateMB('home');
  const [mbConvo, setMbConvo] = useStateMB(null);
  const [mbMsgs, setMbMsgs] = useStateMB([]);
  const [mbDraft, setMbDraft] = useStateMB('');
  const [approved, setApproved] = useStateMB({});

  const toggleNav = (id) => setNavSel(s => {
    if (s.includes(id)) return s.filter(x => x !== id);
    if (s.length >= 4) { window.SOGI_TOAST('Máximo de 4 atalhos — remova um antes', 'warn'); return s; }
    return [...s, id];
  });

  const card = { background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' };
  const secLabel = { fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' };

  /* linhas de tarefa com swipe (reuso: home + aba tarefas) */
  const taskRows = (list) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {list.map(t => {
        const isSwiped = swiped === t.id;
        const isDone = doneIds[t.id];
        return (
          <div key={t.id} style={{ position: 'relative', borderRadius: 11, overflow: 'hidden', minHeight: 52 }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => { setDoneIds(d => ({ ...d, [t.id]: true })); setSwiped(null); window.SOGI_TOAST('Tarefa concluída! +50 pts 🏅'); }}
                style={{ width: 64, background: '#16a34a', color: '#fff', fontSize: 10, fontWeight: 700 }}>Concluir</button>
              <button onClick={() => { setSwiped(null); window.SOGI_TOAST('Adiada para amanhã'); }}
                style={{ width: 56, background: '#d97706', color: '#fff', fontSize: 10, fontWeight: 700 }}>Adiar</button>
            </div>
            <button onClick={() => setSwiped(s => s === t.id ? null : t.id)} style={{
              position: 'relative', width: '100%', textAlign: 'left', background: '#fff', borderRadius: 11,
              padding: '9px 12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              transform: isSwiped ? 'translateX(-120px)' : 'none', transition: 'transform .25s cubic-bezier(.4,0,.2,1)',
              borderLeft: t.late && !isDone ? '3px solid #dc2626' : '3px solid transparent',
              opacity: isDone ? 0.45 : 1,
            }}>
              <span style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: t.late && !isDone ? '#dc2626' : '#1e293b', lineHeight: 1.35, textDecoration: isDone ? 'line-through' : 'none' }}>{t.title}</span>
              <span style={{ fontSize: 9.5, color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>{t.project} · {t.due}</span>
            </button>
          </div>
        );
      })}
    </div>
  );

  /* ===== telas internas do app ===== */
  const screenHome = (
    <>
      {/* Dashboard mobile */}
      <div style={{ margin: '10px 12px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
        {[
          ['2', 'tarefas hoje', '1 atrasada', '#E85928', 'tasks', 'tarefas'],
          ['5', 'chamados ativos', '1 SLA estourado', '#dc2626', 'tickets', 'chamados'],
          ['96,2%', 'SLA do mês', 'meta 95%', '#16a34a', 'clock', 'chamados'],
          ['3', 'aprovações', 'aguardando você', '#d97706', 'check', 'aprovacoes'],
        ].map(([v, l, sub, color, icon, nav]) => (
          <button key={l} onClick={() => setActiveNav(nav)} style={{ ...card, padding: '10px 11px', textAlign: 'left' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em' }}>{v}</span>
              <span style={{ width: 22, height: 22, borderRadius: 6, background: color + '1c', color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon d={ICONS[icon]} size={11} />
              </span>
            </span>
            <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#1e293b' }}>{l}</span>
            <span style={{ fontSize: 8.5, color: '#94a3b8' }}>{sub}</span>
          </button>
        ))}
      </div>

      {/* Projetos resumo */}
      <div style={{ margin: '8px 12px 0', ...card, padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 7 }}>
          <span style={secLabel}>Projetos</span>
          <span style={{ flex: 1 }}></span>
          <button onClick={() => setActiveNav('projetos')} style={{ fontSize: 9.5, fontWeight: 700, color: '#E85928' }}>ver todos →</button>
        </div>
        {SOGI_DATA.projects.slice(0, 2).map(p => (
          <button key={p.id} onClick={() => setActiveNav('projetos')} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '4px 0' }}>
            <HealthDot health={p.health} />
            <span style={{ flex: 1, fontSize: 10.5, fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
            <span style={{ width: 52, height: 4, borderRadius: 2, background: '#f1f5f9', overflow: 'hidden', flexShrink: 0 }}>
              <span style={{ display: 'block', width: `${p.progress}%`, height: '100%', background: { ok: '#16a34a', warn: '#d97706', risk: '#dc2626' }[p.health] }}></span>
            </span>
            <span style={{ fontSize: 9, color: '#94a3b8', fontFamily: 'var(--font-mono)', width: 28, textAlign: 'right', flexShrink: 0 }}>{p.progress}%</span>
          </button>
        ))}
      </div>

      {push && pushVisible && (
        <div style={{ margin: '10px 12px 0', ...card, padding: '10px 12px', boxShadow: '0 4px 14px rgba(24,60,90,0.15)', display: 'flex', gap: 9, alignItems: 'flex-start', animation: 'sogi-pop .3s ease' }}>
          <span style={{ width: 26, height: 26, borderRadius: 7, background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon d={ICONS.bell} size={13} /></span>
          <button onClick={() => setActiveNav('chamados')} style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <strong style={{ fontSize: 11, display: 'block', color: '#1e293b' }}>Push · Chamado #4821</strong>
            <span style={{ fontSize: 10.5, color: '#64748b', lineHeight: 1.4 }}>Cliente respondeu — SLA estourado, toque para abrir</span>
          </button>
          <button onClick={() => setPushVisible(false)} style={{ color: '#94a3b8', display: 'flex' }}><Icon d={ICONS.x} size={12} /></button>
        </div>
      )}
      <div style={{ margin: '10px 12px 0', ...card, padding: 12 }}>
        <span style={secLabel}>Aprovação rápida · 3 pendentes</span>
        <p style={{ margin: '6px 0 8px', fontSize: 12, color: '#1e293b', fontWeight: 550, lineHeight: 1.4 }}>Compra — 3 licenças Windows Server · R$ 14.700</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => window.SOGI_TOAST('Aprovado pelo celular — assinatura digital registrada')} style={{ flex: 1, background: '#16a34a', color: '#fff', borderRadius: 9, padding: '9px 0', fontWeight: 700, fontSize: 12 }}>Aprovar</button>
          <button onClick={() => window.SOGI_TOAST('Recusado — solicitante notificado', 'warn')} style={{ flex: 1, background: '#f1f5f9', color: '#475569', borderRadius: 9, padding: '9px 0', fontWeight: 700, fontSize: 12 }}>Recusar</button>
        </div>
      </div>
      <div style={{ margin: '12px 12px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
          <span style={secLabel}>Minhas tarefas</span>
          <span style={{ flex: 1 }}></span>
          <span style={{ fontSize: 9, color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>← toque para deslizar</span>
        </div>
        {taskRows(SOGI_DATA.myTasks.slice(0, 3))}
      </div>
    </>
  );

  const screenTasks = (
    <div style={{ margin: '12px 12px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
        <span style={secLabel}>{SOGI_DATA.myTasks.length} tarefas · {SOGI_DATA.myTasks.filter(t => t.late).length} atrasada</span>
        <span style={{ flex: 1 }}></span>
        <button onClick={() => window.SOGI_TOAST('IA priorizou suas tarefas', 'info')} style={{ fontSize: 9.5, fontWeight: 700, color: '#E85928' }}>✦ priorizar IA</button>
      </div>
      {taskRows(SOGI_DATA.myTasks)}
    </div>
  );

  const screenChat = mbConvo ? (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 60px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <button onClick={() => setMbConvo(null)} style={{ color: '#64748b', display: 'flex' }}><Icon d={ICONS.chevL} size={16} /></button>
        <Avatar person={mbConvo} size={26} showStatus />
        <strong style={{ fontSize: 12 }}>{SOGI_DATA.people[mbConvo].name}</strong>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ alignSelf: 'flex-start', background: '#fff', borderRadius: '4px 12px 12px 12px', padding: '8px 11px', fontSize: 11.5, maxWidth: '75%', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', color: '#1e293b' }}>
          Consegue revisar o script antes do almoço?
        </div>
        {mbMsgs.map((m, i) => (
          <div key={i} style={{ alignSelf: 'flex-end', background: '#E85928', color: '#fff', borderRadius: '12px 4px 12px 12px', padding: '8px 11px', fontSize: 11.5, maxWidth: '75%' }}>{m} <span style={{ fontSize: 9, opacity: 0.8 }}>✓✓</span></div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, padding: '8px 10px 10px', background: '#fff' }}>
        <input value={mbDraft} onChange={e => setMbDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && mbDraft.trim()) { setMbMsgs(ms => [...ms, mbDraft.trim()]); setMbDraft(''); } }}
          placeholder="Mensagem…" style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: 18, padding: '8px 13px', fontSize: 11.5, outline: 'none', minWidth: 0 }} />
        <button onClick={() => { if (mbDraft.trim()) { setMbMsgs(ms => [...ms, mbDraft.trim()]); setMbDraft(''); } }}
          style={{ width: 34, height: 34, borderRadius: '50%', background: '#E85928', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon d={ICONS.send} size={14} />
        </button>
      </div>
    </div>
  ) : (
    <div style={{ margin: '12px 12px 0', display: 'flex', flexDirection: 'column', gap: 7 }}>
      {[['ana', 'Consegue revisar o script antes do almoço?', '09:15', 1], ['juliana', 'aprovado! pode seguir com a v2 🎉', 'Ontem', 0], ['carlos', 'janela de manutenção confirmada p/ sábado', 'Ontem', 0]].map(([who, last, when, unread]) => (
        <button key={who} onClick={() => { setMbConvo(who); setMbMsgs([]); }} style={{ ...card, display: 'flex', gap: 9, padding: '10px 12px', textAlign: 'left', alignItems: 'center' }}>
          <Avatar person={who} size={32} showStatus />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: 11.5, color: '#1e293b' }}>{SOGI_DATA.people[who].name.split(' ')[0]}</strong>
              <span style={{ fontSize: 9, color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>{when}</span>
            </span>
            <span style={{ display: 'block', fontSize: 10.5, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: unread ? 700 : 400 }}>{last}</span>
          </span>
          {unread > 0 && <span style={{ background: '#E85928', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 99, minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>}
        </button>
      ))}
    </div>
  );

  const screenNotif = (
    <div style={{ margin: '12px 12px 0', display: 'flex', flexDirection: 'column', gap: 7 }}>
      {SOGI_DATA.notifications.map((n, i) => (
        <button key={i} onClick={() => { window.SOGI_TOAST('Abrindo no app…', 'info'); }} style={{ ...card, display: 'flex', gap: 9, padding: '10px 12px', textAlign: 'left', alignItems: 'flex-start', opacity: n.unread ? 1 : 0.65 }}>
          <Avatar person={n.who} size={26} />
          <span style={{ flex: 1, fontSize: 11, color: '#1e293b', lineHeight: 1.45 }}>
            <strong>{SOGI_DATA.people[n.who].name.split(' ')[0]}</strong> {n.text}
            <span style={{ display: 'block', fontSize: 9, color: '#94a3b8', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{n.when}</span>
          </span>
          {n.unread && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#E85928', marginTop: 4, flexShrink: 0 }}></span>}
        </button>
      ))}
    </div>
  );

  const screenAprov = (
    <div style={{ margin: '12px 12px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {SOGI_DATA.approvals.map(a => (
        <div key={a.id} style={{ ...card, padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
            <Avatar person={a.who} size={20} />
            <span style={{ fontSize: 10, color: '#64748b' }}>{SOGI_DATA.people[a.who].name.split(' ')[0]} · {a.type}</span>
          </div>
          <p style={{ margin: '0 0 8px', fontSize: 11.5, color: '#1e293b', fontWeight: 550, lineHeight: 1.4 }}>{a.what}</p>
          {approved[a.id] ? (
            <span style={{ fontSize: 11, fontWeight: 700, color: approved[a.id] === 'ok' ? '#16a34a' : '#dc2626' }}>
              {approved[a.id] === 'ok' ? '✓ Aprovado com assinatura digital' : '✕ Recusado'}
            </span>
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#1e293b', fontFamily: 'var(--font-mono)', flex: 1 }}>{a.amount}</span>
              <button onClick={() => { setApproved(x => ({ ...x, [a.id]: 'no' })); window.SOGI_TOAST('Recusado — solicitante notificado', 'warn'); }} style={{ background: '#f1f5f9', color: '#475569', borderRadius: 8, padding: '7px 14px', fontWeight: 700, fontSize: 11 }}>Recusar</button>
              <button onClick={() => { setApproved(x => ({ ...x, [a.id]: 'ok' })); window.SOGI_TOAST('Aprovado pelo celular — assinatura registrada'); }} style={{ background: '#16a34a', color: '#fff', borderRadius: 8, padding: '7px 14px', fontWeight: 700, fontSize: 11 }}>Aprovar</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const screenChamados = (
    <div style={{ margin: '12px 12px 0', display: 'flex', flexDirection: 'column', gap: 7 }}>
      {SOGI_DATA.tickets.slice(0, 4).map(t => (
        <button key={t.id} onClick={() => window.SOGI_TOAST(`${t.id} aberto — responda por aqui mesmo`, 'info')} style={{ ...card, padding: '10px 12px', textAlign: 'left', borderLeft: t.slaState === 'breach' ? '3px solid #dc2626' : '3px solid transparent' }}>
          <span style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 3 }}>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>{t.id}</span>
            <span style={{ fontSize: 8.5, fontWeight: 700, borderRadius: 99, padding: '1px 7px', background: t.slaState === 'breach' ? '#fef2f2' : t.slaState === 'warn' ? '#fffbeb' : '#f0fdf4', color: t.slaState === 'breach' ? '#dc2626' : t.slaState === 'warn' ? '#d97706' : '#16a34a' }}>
              {t.slaState === 'breach' ? 'SLA estourado' : `SLA ${t.sla}`}
            </span>
          </span>
          <span style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#1e293b', lineHeight: 1.35 }}>{t.title}</span>
          <span style={{ fontSize: 9.5, color: '#94a3b8' }}>{t.client}</span>
        </button>
      ))}
    </div>
  );

  const screenProjetos = (
    <div style={{ margin: '12px 12px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {SOGI_DATA.projects.map(p => (
        <button key={p.id} onClick={() => window.SOGI_TOAST(`Abrindo ${p.code} no app`, 'info')} style={{ ...card, padding: 12, textAlign: 'left' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <strong style={{ fontSize: 11.5, color: '#1e293b', flex: 1 }}>{p.name}</strong>
            <HealthDot health={p.health} />
          </span>
          <div style={{ height: 5, borderRadius: 3, background: '#f1f5f9', overflow: 'hidden', marginBottom: 4 }}>
            <div style={{ width: `${p.progress}%`, height: '100%', background: { ok: '#16a34a', warn: '#d97706', risk: '#dc2626' }[p.health], borderRadius: 3 }}></div>
          </div>
          <span style={{ fontSize: 9.5, color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>{p.progress}% · até {p.dueDate}</span>
        </button>
      ))}
    </div>
  );

  const screenAgenda = (
    <div style={{ margin: '12px 12px 0', display: 'flex', flexDirection: 'column', gap: 7 }}>
      {SOGI_DATA.events.filter(e => e.day >= 10 && e.day <= 14).map((e, i) => (
        <button key={i} onClick={() => window.SOGI_TOAST('Lembrete agendado por push', 'info')} style={{ ...card, display: 'flex', gap: 10, padding: '10px 12px', textAlign: 'left', alignItems: 'center' }}>
          <span style={{ width: 34, textAlign: 'center', flexShrink: 0 }}>
            <span style={{ display: 'block', fontSize: 14, fontWeight: 800, color: e.day === 10 ? '#E85928' : '#1e293b' }}>{e.day}</span>
            <span style={{ fontSize: 8, color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>JUN</span>
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#1e293b', lineHeight: 1.35 }}>{e.title}</span>
            <span style={{ fontSize: 9.5, color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>{e.time || 'dia todo'}</span>
          </span>
        </button>
      ))}
    </div>
  );

  const screens = { home: screenHome, tarefas: screenTasks, chat: screenChat, notif: screenNotif, aprovacoes: screenAprov, chamados: screenChamados, projetos: screenProjetos, calendario: screenAgenda };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'var(--bg)', display: 'flex', flexDirection: 'column', animation: 'sogi-pop .15s ease' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 22px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--accent-text)', display: 'flex' }}><Icon d={'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z M11 19h2'} size={17} /></span>
        <strong style={{ fontSize: 14 }}>SOGI Mobile · PWA</strong>
        <Badge tone="ok" dot>instalável</Badge>
        <span style={{ flex: 1 }}></span>
        <GhostBtn onClick={onClose}>Voltar ao desktop</GhostBtn>
      </header>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', gap: 26, alignItems: 'flex-start', justifyContent: 'center', padding: '20px 24px', flexWrap: 'wrap' }}>
        {/* Telefone */}
        <div style={{ flexShrink: 0 }}>
          <IOSDevice title="">
            <div style={{ fontFamily: 'var(--font-ui)', background: '#f0f2f5', minHeight: '100%', paddingBottom: 86, position: 'relative' }}>
              {/* Header app */}
              <div style={{ background: '#183c5a', padding: '14px 16px 16px', color: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {activeNav !== 'home' ? (
                    <button onClick={() => setActiveNav('home')} style={{ color: '#fff', display: 'flex' }}><Icon d={ICONS.chevL} size={18} /></button>
                  ) : (
                    <span style={{ width: 30, height: 30, borderRadius: 8, background: '#E85928', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 10 }}>ITS</span>
                  )}
                  <span style={{ flex: 1 }}>
                    <strong style={{ fontSize: 14, display: 'block' }}>{activeNav === 'home' ? 'Bom dia, Rafael 👋' : MB_TITLES[activeNav]}</strong>
                    {activeNav === 'home' && <span style={{ fontSize: 10.5, opacity: 0.7 }}>2 tarefas hoje · 3 aprovações</span>}
                  </span>
                  <Avatar person="rafael" size={30} />
                </div>
              </div>

              {screens[activeNav] || screenHome}

              {/* Comando de voz */}
              <button onClick={() => window.SOGI_TOAST('🎙️ "Criar tarefa: revisar backup amanhã às 9" — tarefa criada por voz', 'info')} style={{
                position: 'absolute', right: 14, bottom: 96, width: 48, height: 48, borderRadius: '50%',
                background: '#E85928', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 18px rgba(232,89,40,0.45)', zIndex: 5,
              }}><Icon d={ICONS.mic} size={20} /></button>

              {/* Bottom nav personalizada */}
              <div style={{ position: 'absolute', left: 10, right: 10, bottom: 26, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderRadius: 18, boxShadow: '0 8px 28px rgba(24,60,90,0.22)', display: 'flex', padding: '8px 4px', zIndex: 4 }}>
                {[{ id: 'home', label: 'Início', icon: 'dashboard' }, ...MB_NAV_OPTIONS.filter(o => navSel.includes(o.id))].map(o => (
                  <button key={o.id} onClick={() => { setActiveNav(o.id); setMbConvo(null); }} style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    color: activeNav === o.id ? '#E85928' : '#94a3b8', padding: '3px 0',
                  }}>
                    <Icon d={ICONS[o.icon]} size={18} sw={activeNav === o.id ? 2 : 1.6} />
                    <span style={{ fontSize: 8.5, fontWeight: 700 }}>{o.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </IOSDevice>
        </div>

        {/* Painel de personalização */}
        <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card title="Personalizar meu app" pad={false}>
            <p style={{ margin: 0, padding: '10px var(--pad) 4px', fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.5 }}>
              Cada usuário escolhe até <strong>4 atalhos</strong> da barra inferior (Início é fixo). Todos os atalhos abrem telas funcionais:
            </p>
            {MB_NAV_OPTIONS.map((o) => {
              const on = navSel.includes(o.id);
              return (
                <button key={o.id} onClick={() => toggleNav(o.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
                  padding: '9px var(--pad)', borderTop: '1px solid var(--border)', fontSize: 12.5,
                  color: on ? 'var(--accent-text)' : 'var(--text-2)', fontWeight: on ? 650 : 500,
                  background: on ? 'var(--accent-soft)' : 'transparent',
                }}>
                  <Icon d={ICONS[o.icon]} size={14} />
                  <span style={{ flex: 1 }}>{o.label}</span>
                  {on && <Icon d={ICONS.check} size={14} sw={2.4} />}
                </button>
              );
            })}
          </Card>
          <Card title="Recursos do PWA" pad={false}>
            {[
              ['Instalável (manifest)', 'adicionar à tela inicial — abre como app', 'check', 'ok'],
              ['Push notifications', push ? 'ativadas — toque no push abre o chamado' : 'desativadas', 'bell', push ? 'ok' : 'neutral'],
              ['Swipe actions', 'toque numa tarefa para deslizar e concluir/adiar', 'tasks', 'accent'],
              ['Comando de voz', 'botão laranja 🎙️ cria tarefas falando', 'mic', 'accent'],
              ['Aprovações rápidas', 'aba Aprovações: aprovar/recusar com assinatura', 'check', 'accent'],
            ].map(([label, desc, icon, tone], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: TONE[tone].bg, color: TONE[tone].fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon d={ICONS[icon]} size={13} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 12, fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: 10.5, color: 'var(--text-3)', lineHeight: 1.4 }}>{desc}</span>
                </span>
                {label === 'Push notifications' && (
                  <button onClick={() => { setPush(p => !p); setPushVisible(true); window.SOGI_TOAST(push ? 'Push desativado' : 'Push ativado'); }} style={{
                    width: 36, height: 20, borderRadius: 10, position: 'relative', flexShrink: 0,
                    background: push ? 'var(--ok)' : 'var(--border-strong)', transition: 'background .2s',
                  }}>
                    <span style={{ position: 'absolute', top: 2.5, left: push ? 18 : 2.5, width: 15, height: 15, borderRadius: '50%', background: '#fff', transition: 'left .2s' }}></span>
                  </button>
                )}
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MobileOverlay });
