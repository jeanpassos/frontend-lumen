// SOGI — Central de Chamados: dashboard + fila com filas, lista, detalhe com thread, SLA
const { useState: useStateTK, useEffect: useEffectTK } = React;

function TicketsScreen() {
  const [tab, setTab] = useStateTK('fila');
  const [queue, setQueue] = useStateTK('todos');
  const [filterOpen, setFilterOpen] = useStateTK(false);
  const [newSignal, setNewSignal] = useStateTK(0);
  const activeQueue = SOGI_DATA.ticketQueues.find(q => q.id === queue);
  return (
    <div data-screen-label="Chamados" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, animation: 'sogi-fade-up .25s ease' }}>
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', padding: '10px 24px 0', background: 'var(--surface)', alignItems: 'center' }}>
        {[['dashboard', 'Dashboard', 'dashboard'], ['fila', 'Fila de atendimento', 'tickets'], ['relatorios', 'Relatórios', 'reports'], ['base', 'Base de conhecimento', 'docs']].map(([id, label, icon]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px', fontSize: 12.5,
            fontWeight: 600, color: tab === id ? 'var(--accent-text)' : 'var(--text-2)',
            borderBottom: tab === id ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom: -1, transition: 'color .12s',
          }}>
            <Icon d={ICONS[icon]} size={14} />{label}
          </button>
        ))}
        {/* Filtro de filas */}
        <div style={{ position: 'relative', marginLeft: 6, marginBottom: 4 }}>
          <button onClick={() => setFilterOpen(o => !o)} style={{
            display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 600,
            border: '1px solid ' + (queue !== 'todos' ? 'var(--accent)' : 'var(--border)'),
            background: queue !== 'todos' ? 'var(--accent-soft)' : 'transparent',
            color: queue !== 'todos' ? 'var(--accent-text)' : 'var(--text-2)',
            borderRadius: 8, padding: '6px 12px',
          }}>
            <Icon d={ICONS.list} size={13} /> Filtro: {activeQueue ? activeQueue.label : 'Todos'}
            <Icon d={ICONS.chevD} size={11} />
          </button>
          {filterOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, width: 240, background: 'var(--surface)', borderRadius: 11, boxShadow: 'var(--shadow-pop)', zIndex: 50, animation: 'sogi-pop .15s ease', overflow: 'hidden' }}>
              {SOGI_DATA.ticketQueues.map((q, i) => (
                <button key={q.id} onClick={() => { setQueue(q.id); setFilterOpen(false); setTab('fila'); }} style={{
                  display: 'flex', alignItems: 'center', gap: 9, width: '100%', textAlign: 'left',
                  padding: '9px 14px', fontSize: 12.5, borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                  background: queue === q.id ? 'var(--accent-soft)' : 'transparent',
                  fontWeight: queue === q.id ? 650 : 500,
                  color: queue === q.id ? 'var(--accent-text)' : 'var(--text-2)',
                }}
                  onMouseEnter={e => { if (queue !== q.id) e.currentTarget.style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { if (queue !== q.id) e.currentTarget.style.background = 'transparent'; }}>
                  <span style={{ flex: 1 }}>{q.label}</span>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{q.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <span style={{ flex: 1 }}></span>
        <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)', paddingRight: 8 }}>SLA do mês: 96,2%</span>
        <div style={{ marginBottom: 4 }}>
          <PrimaryBtn icon="plus" onClick={() => { setTab('fila'); setNewSignal(s => s + 1); }}>Abrir chamado</PrimaryBtn>
        </div>
      </div>
      {tab === 'dashboard' && <TicketsDashboard onGoQueue={() => setTab('fila')} />}
      {tab === 'fila' && <TicketsInbox queue={queue} newSignal={newSignal} />}
      {tab === 'relatorios' && <TicketsReports />}
      {tab === 'base' && <TicketsKB />}
    </div>
  );
}

/* ============ Dashboard de chamados ============ */
function CountUp({ to, suffix = '' }) {
  const [v, setV] = useStateTK(0);
  useEffectTK(() => {
    let raf, start;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / 700);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{v}{suffix}</>;
}

function TicketsDashboard({ onGoQueue }) {
  const maxCat = Math.max(...SOGI_DATA.ticketsByCategory.map(([, v]) => v));
  const maxDay = Math.max(...SOGI_DATA.ticketsPerDay);
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 24px' }}>
      <div className="kpi-grid" style={{ maxWidth: 1100 }}>
        {[
          ['Ativos agora', 5, 'danger', 'tickets', '1 com SLA estourado'],
          ['Abertos hoje', SOGI_DATA.ticketStats.today, 'accent', 'inbox', '5 já resolvidos'],
          ['1ª resposta média', 12, 'violet', 'clock', 'minutos · meta 15 min'],
          ['SLA do mês', 96, 'ok', 'check', '96,2% · meta 95%'],
        ].map(([label, v, tone, icon, trend]) => (
          <button key={label} onClick={onGoQueue} style={{
            background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)',
            padding: 'var(--pad)', textAlign: 'left', transition: 'transform .12s, box-shadow .12s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-pop)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>{label}</span>
              <span style={{ width: 30, height: 30, borderRadius: 8, background: TONE[tone].bg, color: TONE[tone].fg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon d={ICONS[icon]} size={15} />
              </span>
            </div>
            <span style={{ fontSize: 27, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>
              <CountUp to={v} suffix={label === 'SLA do mês' ? '%' : ''} />
            </span>
            <span style={{ fontSize: 11.5, color: 'var(--text-3)', display: 'block', marginTop: 5 }}>{trend}</span>
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 14, maxWidth: 1100 }}>
        <Card title="Chamados por dia (últimos 7)">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, paddingTop: 8 }}>
            {SOGI_DATA.ticketsPerDay.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, height: '100%', justifyContent: 'flex-end' }}>
                <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-2)', fontWeight: 600 }}>{v}</span>
                <div style={{ width: '100%', maxWidth: 34, height: `${(v / maxDay) * 100}%`, minHeight: 5, background: i === 6 ? 'var(--warn)' : 'var(--accent)', borderRadius: 6, transition: 'height .6s cubic-bezier(.4,0,.2,1)' }}></div>
                <span className="mono" style={{ fontSize: 9, color: 'var(--text-3)' }}>{['qua', 'qui', 'sex', 'sáb', 'dom', 'seg', 'hoje'][i]}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Por categoria (mês)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, paddingTop: 4 }}>
            {SOGI_DATA.ticketsByCategory.map(([cat, v]) => (
              <div key={cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-2)' }}>{cat}</span>
                  <span className="mono" style={{ color: 'var(--text-3)' }}>{v}</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: 'var(--bg)', overflow: 'hidden' }}>
                  <div style={{ width: `${(v / maxCat) * 100}%`, height: '100%', background: 'var(--violet)', borderRadius: 4, transition: 'width .6s ease' }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Atenção agora" pad={false}>
          {SOGI_DATA.tickets.filter(t => t.slaState !== 'ok').map((t, i) => (
            <button key={t.id} onClick={onGoQueue} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '11px var(--pad)', width: '100%', textAlign: 'left',
              borderTop: i > 0 ? '1px solid var(--border)' : 'none',
              background: t.slaState === 'breach' ? 'var(--danger-soft)' : 'transparent',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.slaState === 'breach' ? 'var(--danger)' : 'var(--warn)', flexShrink: 0, animation: t.slaState === 'breach' ? 'sogi-rt-pulse 1.2s infinite' : 'none' }}></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: t.slaState === 'breach' ? 'var(--danger)' : 'var(--text)' }}>{t.id} · {t.title}</span>
                <span style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{t.client}</span>
              </span>
              <Badge tone={t.slaState === 'breach' ? 'danger' : 'warn'} dot>{t.slaState === 'breach' ? `estourado há ${t.sla}` : t.sla}</Badge>
            </button>
          ))}
        </Card>
      </div>
    </div>
  );
}

/* ============ Fila de atendimento ============ */
function TicketsInbox({ queue = 'todos', newSignal = 0 }) {
  const [selected, setSelected] = useStateTK('#4821');
  const [reply, setReply] = useStateTK('');
  const [replyKind, setReplyKind] = useStateTK('reply');
  const [extraTickets, setExtraTickets] = useStateTK([]);
  const [newOpen, setNewOpen] = useStateTK(false);
  const [escalateOpen, setEscalateOpen] = useStateTK(false);
  const [transferOpen, setTransferOpen] = useStateTK(false);
  const [claims, setClaims] = useStateTK({});
  const [fullOpen, setFullOpen] = useStateTK(false);
  const [threads, setThreads] = useStateTK(() => {
    const t = {};
    Object.entries(SOGI_DATA.ticketDetails).forEach(([id, d]) => { t[id] = [...d.thread]; });
    return t;
  });

  // botão "Abrir chamado" do topo dispara o modal aqui
  useEffectTK(() => {
    if (newSignal > 0) setNewOpen(true);
  }, [newSignal]);

  const filterMap = {
    todos: () => true,
    meus: tk => tk.assignee === 'rafael',
    fila: tk => tk.status === 'Na fila',
    atendimento: tk => tk.status === 'Em atendimento',
    aguardando: tk => tk.status === 'Aguardando cliente',
    resolvidos: () => false,
  };
  const allTickets = [...extraTickets, ...SOGI_DATA.tickets];
  const effAssignee = (t) => claims[t.id] || t.assignee;
  const claimTicket = (t) => {
    if (effAssignee(t) === 'rafael') { window.SOGI_TOAST('Este chamado já está com você', 'info'); return; }
    setClaims(c => ({ ...c, [t.id]: 'rafael' }));
    setThreads(th => ({ ...th, [t.id]: [...(th[t.id] || []), { who: 'rafael', kind: 'event', when: 'agora', text: 'pegou o chamado e agora é o responsável pelo atendimento' }] }));
    window.SOGI_TOAST(`${t.id} atribuído a você — SLA segue contando`);
  };
  const list = allTickets.filter(filterMap[queue]);
  const tk = allTickets.find(t => t.id === selected);
  const detail = tk ? (SOGI_DATA.ticketDetails[tk.id] || tk.detail) : null;
  const tones = { breach: 'danger', warn: 'warn', ok: 'ok' };

  const createTicket = (t) => {
    setExtraTickets(ts => [t, ...ts]);
    setThreads(th => ({ ...th, [t.id]: [] }));
    setSelected(t.id);
    window.SOGI_TOAST(`Chamado ${t.id} aberto — SLA de ${t.detail.slaTarget} iniciado`);
  };

  const escalate = (level, motivo) => {
    setThreads(th => ({ ...th, [tk.id]: [...(th[tk.id] || []), { who: 'rafael', kind: 'note', when: 'agora', text: `Chamado escalado para ${level}. Motivo: ${motivo}` }] }));
    setEscalateOpen(false);
    window.SOGI_TOAST(`${tk.id} escalado para ${level} — responsável notificado`, 'warn');
  };

  const sendReply = () => {
    if (!reply.trim() || !tk) return;
    setThreads(th => ({ ...th, [tk.id]: [...(th[tk.id] || []), { who: 'rafael', kind: replyKind, when: 'agora', text: reply.trim() }] }));
    window.SOGI_TOAST(replyKind === 'reply' ? 'Resposta enviada ao solicitante' : 'Nota interna registrada');
    setReply('');
  };

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
      {/* Lista */}
      <div style={{ width: 340, flexShrink: 0, borderRight: '1px solid var(--border)', overflowY: 'auto', background: 'var(--surface-2)' }}>
        <div style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, position: 'sticky', top: 0, background: 'var(--surface-2)', zIndex: 2 }}>
          <strong style={{ fontSize: 12.5, flex: 1 }}>{(SOGI_DATA.ticketQueues.find(q => q.id === queue) || {}).label || 'Todos'}</strong>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{list.length} · CSAT {SOGI_DATA.ticketStats.csat}★</span>
        </div>
        {list.length === 0 && (
          <p className="mono" style={{ padding: 20, fontSize: 11, color: 'var(--text-3)', textAlign: 'center' }}>nenhum chamado nesta fila</p>
        )}
        {list.map(t => {
          const active = selected === t.id;
          return (
            <button key={t.id} onClick={() => setSelected(t.id)}
              onDoubleClick={() => { setSelected(t.id); setFullOpen(true); }}
              title="duplo clique abre o chamado completo"
              onContextMenu={e => window.SOGI_CTX(e, [
                { label: 'Ver completo', icon: 'tickets', onClick: () => { setSelected(t.id); setFullOpen(true); } },
                { label: 'Transferir de fila', icon: 'inbox', onClick: () => { setSelected(t.id); setTransferOpen(true); } },
                { label: 'Pegar chamado (atribuir a mim)', icon: 'users', onClick: () => claimTicket(t) },
                { label: 'Escalar para N3', icon: 'arrowUp', onClick: () => window.SOGI_TOAST(`${t.id} escalado para o nível 3`, 'warn') },
                { label: 'Resolver', icon: 'check', onClick: () => window.SOGI_TOAST(`${t.id} resolvido — pesquisa enviada`) },
                '-',
                { label: 'Cancelar chamado', icon: 'trash', danger: true, onClick: () => window.SOGI_TOAST(`${t.id} cancelado`, 'warn') },
              ])}
              style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '13px 16px',
              borderBottom: '1px solid var(--border)',
              background: active ? 'var(--surface)' : 'transparent',
              borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
              transition: 'background .12s',
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.6)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)' }}>{t.id}</span>
                <PriorityBadge p={t.priority} />
                <span style={{ flex: 1 }}></span>
                <Badge tone={tones[t.slaState]} dot>{t.slaState === 'breach' ? 'estourado' : t.sla}</Badge>
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.35, marginBottom: 4 }}>{t.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 11, color: 'var(--text-3)', flex: 1 }}>{t.client}</span>
                {claims[t.id] && <Badge tone="accent">você pegou</Badge>}
                <Avatar person={effAssignee(t)} size={18} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Detalhe */}
      {tk && detail ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Cabeçalho do ticket */}
          <header style={{ padding: '14px 22px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)' }}>{tk.id}</span>
              <Badge tone={tones[tk.slaState]} dot>{tk.slaState === 'breach' ? `SLA estourado há ${tk.sla}` : `SLA restante: ${tk.sla}`}</Badge>
              <Badge tone="neutral">{detail.category} / {detail.subcategory}</Badge>
              <Badge tone="violet">{detail.channel}</Badge>
              <span style={{ flex: 1 }}></span>
              <button title="Ver chamado completo" onClick={() => setFullOpen(true)} style={{
                color: 'var(--text-3)', display: 'flex', padding: 6, borderRadius: 7, border: '1px solid var(--border)', gap: 6, alignItems: 'center', fontSize: 11.5, fontWeight: 600,
              }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-text)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                <Icon d={'M4 9V4h5 M20 9V4h-5 M4 15v5h5 M20 15v5h-5'} size={13} /> Ver completo
              </button>
              <button title="Pegar este chamado para mim" onClick={() => claimTicket(tk)} style={{
                display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600,
                borderRadius: 8, padding: '8px 12px',
                background: effAssignee(tk) === 'rafael' ? 'var(--ok-soft)' : 'var(--violet)',
                color: effAssignee(tk) === 'rafael' ? 'var(--ok)' : '#fff',
              }}>
                <Icon d={effAssignee(tk) === 'rafael' ? ICONS.check : ICONS.users} size={13} />
                {effAssignee(tk) === 'rafael' ? 'Com você' : 'Pegar chamado'}
              </button>
              <GhostBtn icon="inbox" onClick={() => setTransferOpen(true)}>Transferir</GhostBtn>
              <GhostBtn icon="arrowUp" onClick={() => setEscalateOpen(true)}>Escalar</GhostBtn>
              <PrimaryBtn icon="check" onClick={() => window.SOGI_TOAST(`${tk.id} resolvido — pesquisa de satisfação enviada`)}>Resolver</PrimaryBtn>
            </div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{tk.title}</h2>
            <div style={{ display: 'flex', gap: 18, marginTop: 8, fontSize: 11.5, color: 'var(--text-3)', flexWrap: 'wrap' }}>
              <span>Solicitante: <strong style={{ color: 'var(--text-2)' }}>{detail.requester}</strong></span>
              <span>Aberto: <strong style={{ color: 'var(--text-2)' }}>{detail.opened}</strong></span>
              <span>SLA alvo: <strong style={{ color: 'var(--text-2)' }}>{detail.slaTarget}</strong></span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>Responsável: <Avatar person={effAssignee(tk)} size={17} /> <strong style={{ color: 'var(--text-2)' }}>{SOGI_DATA.people[effAssignee(tk)].name.split(' ')[0]}{claims[tk.id] ? ' (pegou agora)' : ''}</strong></span>
            </div>
          </header>

          {/* Thread */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* descrição original */}
            <div style={{ background: 'var(--surface)', borderRadius: 10, boxShadow: 'var(--shadow-card)', padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                <span style={{
                  width: 26, height: 26, borderRadius: '50%', background: 'var(--nav-bg)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700,
                }}>{detail.requester.slice(0, 1)}</span>
                <strong style={{ fontSize: 12.5 }}>{detail.requester.split(' — ')[0]}</strong>
                <Badge tone="neutral">abertura</Badge>
                <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 'auto' }}>{detail.opened}</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: 'var(--text-2)' }}>{detail.desc}</p>
            </div>

            {(threads[tk.id] || []).map((m, i) => m.kind === 'event' ? (
              <div key={i} style={{ alignSelf: 'center', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--violet-soft)', borderRadius: 99, padding: '5px 14px', animation: 'sogi-pop .15s ease' }}>
                <Avatar person={m.who} size={18} />
                <span style={{ fontSize: 11.5, color: 'var(--violet)', fontWeight: 600 }}>
                  {SOGI_DATA.people[m.who].name.split(' ')[0]} {m.text}
                </span>
                <span className="mono" style={{ fontSize: 9, color: 'var(--text-3)' }}>{m.when}</span>
              </div>
            ) : (
              <div key={i} style={{
                background: m.kind === 'note' ? 'var(--warn-soft)' : 'var(--surface)',
                borderRadius: 10, boxShadow: m.kind === 'note' ? 'none' : 'var(--shadow-card)',
                border: m.kind === 'note' ? '1px dashed var(--warn)' : 'none',
                padding: 14, animation: 'sogi-pop .15s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                  <Avatar person={m.who} size={26} />
                  <strong style={{ fontSize: 12.5 }}>{SOGI_DATA.people[m.who].name}</strong>
                  <Badge tone={m.kind === 'note' ? 'warn' : 'accent'}>{m.kind === 'note' ? 'nota interna' : 'resposta ao cliente'}</Badge>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 'auto' }}>{m.when}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: 'var(--text-2)' }}>{m.text}</p>
              </div>
            ))}
          </div>

          {/* Composer */}
          <footer style={{ padding: '12px 22px 16px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              {[['reply', 'Responder ao cliente'], ['note', 'Nota interna']].map(([id, label]) => (
                <button key={id} onClick={() => setReplyKind(id)} style={{
                  fontSize: 11.5, fontWeight: 600, borderRadius: 99, padding: '4px 13px',
                  background: replyKind === id ? (id === 'note' ? 'var(--warn-soft)' : 'var(--accent-soft)') : 'transparent',
                  color: replyKind === id ? (id === 'note' ? 'var(--warn)' : 'var(--accent-text)') : 'var(--text-3)',
                  border: '1px solid ' + (replyKind === id ? 'transparent' : 'var(--border)'),
                }}>{label}</button>
              ))}
              <span style={{ flex: 1 }}></span>
              <button onClick={() => window.SOGI_TOAST('IA sugeriu uma resposta com base em chamados similares', 'info')} style={{
                fontSize: 11.5, fontWeight: 600, color: 'var(--accent-text)', display: 'flex', alignItems: 'center', gap: 5,
              }}><Icon d={ICONS.ai} size={12} /> Sugerir resposta</button>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: replyKind === 'note' ? 'var(--warn-soft)' : 'var(--bg)', borderRadius: 10, padding: '5px 5px 5px 14px', transition: 'background .2s' }}>
              <input value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendReply()}
                placeholder={replyKind === 'note' ? 'Nota visível apenas para a equipe…' : `Responder a ${detail.requester.split(' — ')[0]}…`}
                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13, minWidth: 0, padding: '6px 0' }} />
              <button onClick={sendReply} style={{
                width: 34, height: 34, borderRadius: 8, background: replyKind === 'note' ? 'var(--warn)' : 'var(--accent)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}><Icon d={ICONS.send} size={15} /></button>
            </div>
          </footer>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>
          <p className="mono" style={{ fontSize: 11.5 }}>selecione um chamado na lista</p>
        </div>
      )}

      {newOpen && <NewTicketModal onClose={() => setNewOpen(false)} onCreate={createTicket} />}
      {escalateOpen && tk && <EscalateModal ticket={tk} onClose={() => setEscalateOpen(false)} onEscalate={escalate} />}
      {transferOpen && tk && <TransferQueueModal ticket={tk} onClose={() => setTransferOpen(false)}
        onTransfer={(fila, agent, motivo) => {
          setThreads(th => ({ ...th, [tk.id]: [...(th[tk.id] || []), { who: 'rafael', kind: 'note', when: 'agora', text: `Transferido para a fila "${fila}"${agent ? ` · atribuído a ${SOGI_DATA.people[agent].name}` : ''}. Motivo: ${motivo}` }] }));
          setTransferOpen(false);
          window.SOGI_TOAST(`${tk.id} transferido para "${fila}" — fila notificada`);
        }} />}
      {fullOpen && tk && detail && (
        <TicketFullModal ticket={{ ...tk, assignee: effAssignee(tk) }} detail={detail} thread={threads[tk.id] || []}
          claimed={effAssignee(tk) === 'rafael'}
          onClaim={() => claimTicket(tk)}
          onTransfer={() => { setFullOpen(false); setTransferOpen(true); }}
          onEscalate={() => { setFullOpen(false); setEscalateOpen(true); }}
          onSend={(kind, text) => {
            setThreads(th => ({ ...th, [tk.id]: [...(th[tk.id] || []), { who: 'rafael', kind, when: 'agora', text }] }));
            window.SOGI_TOAST(kind === 'reply' ? 'Resposta enviada ao solicitante' : kind === 'note' ? 'Nota interna registrada' : 'Rascunho privado salvo — só você vê');
          }}
          onClose={() => setFullOpen(false)} />
      )}
    </div>
  );
}

/* ============ Modal: novo chamado (padrão Zendesk/Jira) ============ */
function NewTicketModal({ onClose, onCreate }) {
  const [title, setTitle] = useStateTK('');
  const [client, setClient] = useStateTK('Metalúrgica Vale Aço');
  const [requester, setRequester] = useStateTK('');
  const [sector, setSector] = useStateTK('Suporte N1');
  const [cat, setCat] = useStateTK('Infraestrutura');
  const [channel, setChannel] = useStateTK('Portal');
  const [prio, setPrio] = useStateTK('média');
  const [assignee, setAssignee] = useStateTK('auto');
  const [watchers, setWatchers] = useStateTK(['rafael']);
  const [attachments, setAttachments] = useStateTK([]);
  const [desc, setDesc] = useStateTK('');
  const slaByPrio = { 'crítica': '15 min / 4h', 'alta': '1h / 8h', 'média': '4h / 24h', 'baixa': '8h / 72h' };
  const autoAgent = { 'Infraestrutura': 'carlos', 'Sistemas': 'diego', 'Acessos': 'diego', 'E-mail': 'carlos', 'Telefonia': 'diego', 'Outros': 'diego' };

  const addAttachment = () => {
    const samples = ['print-erro.png', 'log-aplicacao.txt', 'evidencia-tela.mp4', 'export-relatorio.xlsx'];
    const name = samples[attachments.length % samples.length];
    setAttachments(a => [...a, { name, size: (Math.random() * 4 + 0.2).toFixed(1) + ' MB' }]);
    window.SOGI_TOAST(`Anexo "${name}" adicionado`);
  };
  const toggleWatcher = (id) => setWatchers(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);

  const create = () => {
    if (!title.trim()) { window.SOGI_TOAST('Informe o assunto do chamado', 'warn'); return; }
    if (!desc.trim()) { window.SOGI_TOAST('Descreva o problema — isso acelera o atendimento', 'warn'); return; }
    const id = '#' + (4830 + Math.floor(Math.random() * 60));
    const agent = assignee === 'auto' ? (autoAgent[cat] || 'diego') : assignee;
    onCreate({
      id, title: title.trim(), client, sla: slaByPrio[prio].split(' / ')[1], slaState: 'ok',
      priority: prio, assignee: agent, status: assignee === 'auto' ? 'Na fila' : 'Em atendimento',
      detail: {
        category: cat, subcategory: 'Geral', channel, opened: 'agora',
        slaTarget: slaByPrio[prio].split(' / ')[1] + ` (${prio})`,
        requester: (requester.trim() || 'Rafael Souza') + ' — ' + client,
        sector, watchers, attachments: attachments.map(a => a.name),
        desc: desc.trim(), thread: [],
      },
    });
    onClose();
  };
  const inputStyle = { border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', fontFamily: 'var(--font-ui)', background: 'var(--surface)', color: 'var(--text)', width: '100%', boxSizing: 'border-box' };
  const FieldLabel = ({ children }) => <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>{children}</span>;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(24,60,90,0.45)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 22, animation: 'sogi-pop .15s ease' }}>
      <div data-screen-label="Novo chamado" onClick={e => e.stopPropagation()} style={{
        width: 'min(880px, 96vw)', maxHeight: '92vh', background: 'var(--surface)', borderRadius: 16,
        boxShadow: 'var(--shadow-pop)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        animation: 'sogi-pop .2s cubic-bezier(.3,1.3,.6,1)',
      }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '15px 22px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--accent-soft)', color: 'var(--accent-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon d={ICONS.tickets} size={16} />
          </span>
          <strong style={{ fontSize: 14.5 }}>Abrir chamado</strong>
          <Badge tone="accent">SLA {slaByPrio[prio]}</Badge>
          <span style={{ flex: 1 }}></span>
          <button onClick={onClose} style={{ color: 'var(--text-3)', display: 'flex', padding: 4 }}><Icon d={ICONS.x} size={16} /></button>
        </header>

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1.5fr 1fr' }}>
          {/* Coluna principal */}
          <div style={{ padding: '18px 22px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <FieldLabel>Assunto *</FieldLabel>
              <input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="Resuma o problema em uma frase" style={inputStyle} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <FieldLabel>Descrição *</FieldLabel>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={7}
                placeholder={'Descreva com detalhes:\n• O que aconteceu e desde quando\n• Quantos usuários afetados\n• Mensagem de erro (se houver)\n• O que já foi tentado'}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.55, flex: 1 }} />
            </div>
            <div>
              <FieldLabel>Anexos · prints, logs, evidências</FieldLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {attachments.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--surface-2)', borderRadius: 8, padding: '7px 11px' }}>
                    <Icon d={ICONS.paperclip} size={13} style={{ color: 'var(--violet)' }} />
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 550 }}>{a.name}</span>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{a.size}</span>
                    <button onClick={() => setAttachments(as => as.filter((_, j) => j !== i))} style={{ color: 'var(--text-3)', display: 'flex', padding: 3 }}>
                      <Icon d={ICONS.x} size={12} />
                    </button>
                  </div>
                ))}
                <button onClick={addAttachment} style={{
                  border: '1.5px dashed var(--border-strong)', borderRadius: 8, padding: '10px 0',
                  fontSize: 12, fontWeight: 600, color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                }}>
                  <Icon d={ICONS.paperclip} size={13} /> Anexar arquivo ou arraste aqui
                </button>
              </div>
            </div>
          </div>

          {/* Propriedades (lateral, estilo Jira) */}
          <div style={{ padding: '18px 20px', background: 'var(--surface-2)', display: 'flex', flexDirection: 'column', gap: 13 }}>
            <div>
              <FieldLabel>Solicitante</FieldLabel>
              <input value={requester} onChange={e => setRequester(e.target.value)} placeholder="Nome de quem reportou" style={inputStyle} />
            </div>
            <div>
              <FieldLabel>Cliente / Empresa</FieldLabel>
              <select value={client} onChange={e => setClient(e.target.value)} style={inputStyle}>
                {['Metalúrgica Vale Aço', 'Hospital Santa Clara', 'Coop. Agro Horizonte', 'ITS — Interno'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <FieldLabel>Setor / Fila</FieldLabel>
                <select value={sector} onChange={e => setSector(e.target.value)} style={inputStyle}>
                  {['Suporte N1', 'Infraestrutura', 'Desenvolvimento', 'Fiscal/Sistemas', 'Administrativo'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <FieldLabel>Categoria</FieldLabel>
                <select value={cat} onChange={e => setCat(e.target.value)} style={inputStyle}>
                  {SOGI_DATA.ticketCategories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <FieldLabel>Canal</FieldLabel>
                <select value={channel} onChange={e => setChannel(e.target.value)} style={inputStyle}>
                  {['Portal', 'E-mail', 'Telefone', 'WhatsApp', 'Presencial'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <FieldLabel>Prioridade</FieldLabel>
                <select value={prio} onChange={e => setPrio(e.target.value)} style={inputStyle}>
                  {['baixa', 'média', 'alta', 'crítica'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div>
              <FieldLabel>Atribuir a</FieldLabel>
              <select value={assignee} onChange={e => setAssignee(e.target.value)} style={inputStyle}>
                <option value="auto">Automático pela categoria → {SOGI_DATA.people[autoAgent[cat] || 'diego'].name.split(' ')[0]}</option>
                {['diego', 'carlos', 'pedro', 'ana'].map(id => <option key={id} value={id}>{SOGI_DATA.people[id].name}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>Visualizadores (CC)</FieldLabel>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {Object.values(SOGI_DATA.people).map(p => {
                  const on = watchers.includes(p.id);
                  return (
                    <button key={p.id} onClick={() => toggleWatcher(p.id)} title={p.name} style={{
                      display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 600,
                      borderRadius: 99, padding: '3px 9px 3px 4px', transition: 'all .12s',
                      border: on ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                      background: on ? 'var(--accent-soft)' : 'var(--surface)',
                      color: on ? 'var(--accent-text)' : 'var(--text-3)',
                    }}>
                      <Avatar person={p.id} size={17} />
                      {p.name.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
              <span className="mono" style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', marginTop: 5 }}>recebem todas as atualizações do chamado</span>
            </div>
          </div>
        </div>

        <footer style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 22px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>* obrigatórios · o solicitante recebe o nº do chamado por e-mail</span>
          <span style={{ flex: 1 }}></span>
          <GhostBtn onClick={onClose}>Cancelar</GhostBtn>
          <PrimaryBtn icon="plus" onClick={create}>Abrir chamado</PrimaryBtn>
        </footer>
      </div>
    </div>
  );
}

/* ============ Modal: escalar ============ */
function EscalateModal({ ticket, onClose, onEscalate }) {
  const [level, setLevel] = useStateTK('Nível 3 (especialista)');
  const [motivo, setMotivo] = useStateTK('');
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(24,60,90,0.4)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'sogi-pop .15s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 430, maxWidth: '92vw', background: 'var(--surface)', borderRadius: 14, boxShadow: 'var(--shadow-pop)', animation: 'sogi-pop .2s cubic-bezier(.3,1.3,.6,1)' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '15px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--warn)', display: 'flex' }}><Icon d={ICONS.arrowUp} size={16} /></span>
          <strong style={{ fontSize: 14 }}>Escalar {ticket.id}</strong>
          <span style={{ flex: 1 }}></span>
          <button onClick={onClose} style={{ color: 'var(--text-3)', display: 'flex', padding: 4 }}><Icon d={ICONS.x} size={15} /></button>
        </header>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 13 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
            Escalar para
            <select value={level} onChange={e => setLevel(e.target.value)} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontFamily: 'var(--font-ui)', background: 'var(--surface)', color: 'var(--text)' }}>
              {['Nível 2 (infra)', 'Nível 3 (especialista)', 'Fornecedor externo', 'Gestor de plantão'].map(l => <option key={l}>{l}</option>)}
            </select>
          </label>
          <textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={3} placeholder="Motivo do escalonamento (obrigatório para auditoria)…"
            style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'var(--font-ui)', background: 'var(--surface)', color: 'var(--text)', lineHeight: 1.5 }} />
          <div style={{ background: 'var(--warn-soft)', borderRadius: 8, padding: 10, fontSize: 11.5, color: 'var(--warn)', lineHeight: 1.5 }}>
            O SLA continua contando. O novo responsável é notificado por chat + WhatsApp.
          </div>
        </div>
        <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '13px 20px', borderTop: '1px solid var(--border)' }}>
          <GhostBtn onClick={onClose}>Cancelar</GhostBtn>
          <button onClick={() => { if (!motivo.trim()) { window.SOGI_TOAST('Informe o motivo do escalonamento', 'warn'); return; } onEscalate(level, motivo.trim()); }} style={{
            display: 'flex', alignItems: 'center', gap: 7, background: 'var(--warn)', color: '#fff',
            borderRadius: 8, padding: '8px 14px', fontWeight: 600, fontSize: 12.5,
          }}>
            <Icon d={ICONS.arrowUp} size={14} /> Confirmar escalonamento
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ============ Modal: chamado completo ============ */
function TicketFullModal({ ticket, detail, thread, onClose, onSend, onTransfer, onEscalate, onClaim, claimed }) {
  const tones = { breach: 'danger', warn: 'warn', ok: 'ok' };
  const [kind, setKind] = useStateTK('reply');
  const [text, setText] = useStateTK('');
  const [aiBusy, setAiBusy] = useStateTK(false);
  const send = () => {
    if (!text.trim()) { window.SOGI_TOAST('Escreva a mensagem primeiro', 'warn'); return; }
    onSend && onSend(kind, text.trim());
    setText('');
  };
  const aiSearch = () => {
    setAiBusy(true);
    setTimeout(() => {
      setAiBusy(false);
      setKind('reply');
      setText('Olá! Identificamos o cenário descrito. Conforme nosso procedimento "Failover de link (filiais)" da base de conhecimento, o acesso foi restabelecido via contingência 4G e o link principal tem previsão de retorno em até 2h pela operadora (protocolo registrado). Manteremos o monitoramento ativo até a normalização completa.');
      window.SOGI_TOAST('IA pesquisou na base: 2 artigos relevantes — resposta sugerida no campo', 'info');
    }, 1100);
  };
  const kindMeta = {
    reply: { label: 'Responder ao cliente', bg: 'var(--accent-soft)', fg: 'var(--accent-text)', btn: 'var(--accent)' },
    note: { label: 'Nota interna', bg: 'var(--warn-soft)', fg: 'var(--warn)', btn: 'var(--warn)' },
    draft: { label: 'Rascunho privado', bg: 'var(--surface-2)', fg: 'var(--text-2)', btn: 'var(--text-3)' },
  };
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(24,60,90,0.45)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 26, animation: 'sogi-pop .15s ease' }}>
      <div data-screen-label="Chamado completo" onClick={e => e.stopPropagation()} style={{
        width: 'min(1040px, 96vw)', height: 'min(740px, 92vh)', background: 'var(--surface)', borderRadius: 16,
        boxShadow: 'var(--shadow-pop)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        animation: 'sogi-pop .2s cubic-bezier(.3,1.3,.6,1)',
      }}>
        <header style={{ padding: '14px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-3)' }}>{ticket.id}</span>
          <Badge tone={tones[ticket.slaState]} dot>{ticket.slaState === 'breach' ? `SLA estourado há ${ticket.sla}` : `SLA: ${ticket.sla}`}</Badge>
          <PriorityBadge p={ticket.priority} />
          <span style={{ flex: 1 }}></span>
          <button title={claimed ? 'Chamado já está com você' : 'Pegar este chamado'} onClick={onClaim} style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, borderRadius: 8, padding: '7px 11px',
            background: claimed ? 'var(--ok-soft)' : 'var(--violet)', color: claimed ? 'var(--ok)' : '#fff',
          }}>
            <Icon d={claimed ? ICONS.check : ICONS.users} size={13} /> {claimed ? 'Com você' : 'Pegar'}
          </button>
          <GhostBtn icon="inbox" onClick={onTransfer}>Transferir</GhostBtn>
          <GhostBtn icon="arrowUp" onClick={onEscalate}>Escalar</GhostBtn>
          <PrimaryBtn icon="check" onClick={() => { window.SOGI_TOAST(`${ticket.id} resolvido — pesquisa de satisfação enviada`); onClose(); }}>Resolver</PrimaryBtn>
          <GhostBtn icon="download" onClick={() => window.SOGI_TOAST('Exportando chamado completo (PDF)…')}>Exportar</GhostBtn>
          <button onClick={onClose} style={{ color: 'var(--text-3)', display: 'flex', padding: 5 }}><Icon d={ICONS.x} size={16} /></button>
        </header>
        <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 300px' }}>
          {/* Thread completa + composer */}
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, borderRight: '1px solid var(--border)' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '18px 24px' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 19, fontWeight: 700, lineHeight: 1.35 }}>{ticket.title}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                  <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--nav-bg)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{detail.requester.slice(0, 1)}</span>
                  <strong style={{ fontSize: 12.5 }}>{detail.requester.split(' — ')[0]}</strong>
                  <Badge tone="neutral">abertura</Badge>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 'auto' }}>{detail.opened}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-2)' }}>{detail.desc}</p>
              </div>
              {thread.map((m, i) => m.kind === 'event' ? (
                <div key={i} style={{ alignSelf: 'center', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--violet-soft)', borderRadius: 99, padding: '5px 14px' }}>
                  <Avatar person={m.who} size={18} />
                  <span style={{ fontSize: 11.5, color: 'var(--violet)', fontWeight: 600 }}>{SOGI_DATA.people[m.who].name.split(' ')[0]} {m.text}</span>
                  <span className="mono" style={{ fontSize: 9, color: 'var(--text-3)' }}>{m.when}</span>
                </div>
              ) : (
                <div key={i} style={{
                  background: m.kind === 'note' ? 'var(--warn-soft)' : m.kind === 'draft' ? 'var(--surface-2)' : 'var(--surface)',
                  borderRadius: 10, boxShadow: m.kind === 'note' || m.kind === 'draft' ? 'none' : 'var(--shadow-card)',
                  border: m.kind === 'note' ? '1px dashed var(--warn)' : m.kind === 'draft' ? '1.5px dashed var(--border-strong)' : 'none', padding: 14,
                  opacity: m.kind === 'draft' ? 0.85 : 1,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                    <Avatar person={m.who} size={26} />
                    <strong style={{ fontSize: 12.5 }}>{SOGI_DATA.people[m.who].name}</strong>
                    <Badge tone={m.kind === 'note' ? 'warn' : m.kind === 'draft' ? 'neutral' : 'accent'}>
                      {m.kind === 'note' ? 'nota interna' : m.kind === 'draft' ? '🔒 rascunho · só você vê' : 'resposta ao cliente'}
                    </Badge>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 'auto' }}>{m.when}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-2)' }}>{m.text}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Composer completo */}
          <footer style={{ padding: '10px 24px 14px', borderTop: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
              {Object.entries(kindMeta).map(([id, km]) => (
                <button key={id} onClick={() => setKind(id)} style={{
                  fontSize: 11.5, fontWeight: 600, borderRadius: 99, padding: '4px 13px', display: 'flex', alignItems: 'center', gap: 5,
                  background: kind === id ? km.bg : 'transparent',
                  color: kind === id ? km.fg : 'var(--text-3)',
                  border: '1px solid ' + (kind === id ? 'transparent' : 'var(--border)'),
                }}>
                  {id === 'draft' && <Icon d={ICONS.eye} size={11} />}
                  {km.label}
                </button>
              ))}
              <span style={{ flex: 1 }}></span>
              <button onClick={aiSearch} disabled={aiBusy} style={{
                fontSize: 11.5, fontWeight: 600, color: 'var(--accent-text)', background: 'var(--accent-soft)',
                borderRadius: 99, padding: '4px 13px', display: 'flex', alignItems: 'center', gap: 5, opacity: aiBusy ? 0.6 : 1,
              }}>
                <Icon d={ICONS.ai} size={12} /> {aiBusy ? 'pesquisando na base…' : 'IA: pesquisar na base do projeto'}
              </button>
            </div>
            {kind === 'draft' && (
              <p className="mono" style={{ margin: '0 0 7px', fontSize: 9.5, color: 'var(--text-3)' }}>🔒 rascunhos privados ficam visíveis apenas para você — úteis para anotações de diagnóstico</p>
            )}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', background: kindMeta[kind].bg, borderRadius: 10, padding: '6px 6px 6px 14px', transition: 'background .2s' }}>
              <textarea value={text} onChange={e => setText(e.target.value)} rows={2}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={kind === 'reply' ? `Responder a ${detail.requester.split(' — ')[0]}…` : kind === 'note' ? 'Nota visível apenas para a equipe…' : 'Anotação privada só para você…'}
                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13, minWidth: 0, padding: '6px 0', resize: 'none', fontFamily: 'var(--font-ui)', color: 'var(--text)', lineHeight: 1.5 }} />
              <button onClick={send} style={{
                width: 36, height: 36, borderRadius: 8, background: kindMeta[kind].btn, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}><Icon d={ICONS.send} size={15} /></button>
            </div>
          </footer>
          </div>
          {/* Meta */}
          <div style={{ overflowY: 'auto', padding: '18px 20px', background: 'var(--surface-2)' }}>
            <SectionLabel>Detalhes do chamado</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '11px 14px', fontSize: 12, alignItems: 'center' }}>
              <span style={{ color: 'var(--text-3)' }}>Solicitante</span><span style={{ fontWeight: 600 }}>{detail.requester.split(' — ')[0]}</span>
              <span style={{ color: 'var(--text-3)' }}>Cliente</span><span>{ticket.client}</span>
              <span style={{ color: 'var(--text-3)' }}>Categoria</span><span>{detail.category} / {detail.subcategory}</span>
              {detail.sector && <>
                <span style={{ color: 'var(--text-3)' }}>Setor / Fila</span><span><Badge tone="accent">{detail.sector}</Badge></span>
              </>}
              <span style={{ color: 'var(--text-3)' }}>Canal</span><span><Badge tone="violet">{detail.channel}</Badge></span>
              <span style={{ color: 'var(--text-3)' }}>Aberto em</span><span className="mono" style={{ fontSize: 11 }}>{detail.opened}</span>
              <span style={{ color: 'var(--text-3)' }}>SLA alvo</span><span className="mono" style={{ fontSize: 11 }}>{detail.slaTarget}</span>
              <span style={{ color: 'var(--text-3)' }}>Responsável</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Avatar person={ticket.assignee} size={20} />{SOGI_DATA.people[ticket.assignee].name}</span>
              <span style={{ color: 'var(--text-3)' }}>Status</span><span><Badge tone="accent" dot>{ticket.status}</Badge></span>
              {detail.watchers && detail.watchers.length > 0 && <>
                <span style={{ color: 'var(--text-3)' }}>Visualizadores</span>
                <span><AvatarStack ids={detail.watchers} size={20} /></span>
              </>}
            </div>
            {detail.attachments && detail.attachments.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <SectionLabel>Anexos · {detail.attachments.length}</SectionLabel>
                {detail.attachments.map((a, i) => (
                  <button key={i} onClick={() => window.SOGI_TOAST(`Baixando "${a}"…`)} style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left',
                    background: 'var(--surface)', borderRadius: 8, padding: '8px 11px', marginBottom: 6,
                    boxShadow: 'var(--shadow-card)', fontSize: 12, fontWeight: 550,
                  }}>
                    <Icon d={ICONS.paperclip} size={12} style={{ color: 'var(--violet)' }} /> {a}
                  </button>
                ))}
              </div>
            )}
            <div style={{ marginTop: 18 }}>
              <SectionLabel>Linha do tempo do SLA</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[['Abertura', detail.opened, 'ok'], ['1ª resposta', '12 min depois', 'ok'], ['Resolução prevista', detail.slaTarget, ticket.slaState === 'breach' ? 'danger' : 'warn']].map(([l, v, tone], i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: `var(--${tone})`, flexShrink: 0 }}></span>
                    <span style={{ fontSize: 11.5, flex: 1 }}>{l}</span>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 18 }}>
              <SectionLabel>Artigos relacionados (base)</SectionLabel>
              {['Procedimento de failover de link', 'Runbook — indisponibilidade ERP'].map((a, i) => (
                <button key={i} onClick={() => window.SOGI_TOAST('Abrindo artigo da base de conhecimento…', 'info')} style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left',
                  background: 'var(--surface)', borderRadius: 8, padding: '9px 11px', marginBottom: 6,
                  boxShadow: 'var(--shadow-card)', fontSize: 12, fontWeight: 550,
                }}>
                  <Icon d={ICONS.docs} size={13} style={{ color: 'var(--violet)' }} /> {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Base de conhecimento ============ */
const KB_ARTICLES = [
  { id: 1, title: 'Procedimento de failover de link (filiais)', cat: 'Infraestrutura', views: 142, updated: '08 jun', author: 'carlos', body: 'Quando o link principal de uma filial cair:\n\n1. Confirme a queda no Zabbix (latência > 5s ou perda total).\n2. Acione o failover 4G pelo painel do roteador (Mikrotik → Interfaces → LTE).\n3. Verifique a reconvergência do BGP (até 90s).\n4. Avise o cliente com previsão de retorno.\n5. Abra incidente com a operadora e registre o protocolo no chamado.\n\nTempo médio de restabelecimento: 8 minutos.' },
  { id: 2, title: 'Runbook — indisponibilidade total do ERP', cat: 'Sistemas', views: 98, updated: '05 jun', author: 'pedro', body: '1. Verifique serviços no servidor de aplicação (status do pool).\n2. Confira conexões do PostgreSQL (max_connections).\n3. Se banco OK, reinicie o serviço de aplicação.\n4. Se persistir, acione plano de contingência e comunique gestores.\n\nEscalar para N3 após 30 min sem resolução.' },
  { id: 3, title: 'Como configurar VPN para novo colaborador', cat: 'Acessos', views: 87, updated: '02 jun', author: 'diego', body: '1. Crie o usuário no servidor VPN (WireGuard).\n2. Gere o par de chaves e o QR code.\n3. Envie instruções pelo SOGI (modelo "Acesso VPN").\n4. Valide o primeiro acesso com o colaborador.\n5. Registre no inventário de acessos.' },
  { id: 4, title: 'Backup falhou — checklist de diagnóstico', cat: 'Infraestrutura', views: 64, updated: 'ontem', author: 'carlos', body: '1. Verifique espaço em disco no destino (limite 90%).\n2. Confira credenciais do job (rotação de senha).\n3. Valide janela: jobs concorrentes causam lock.\n4. Re-execute manualmente e acompanhe o log.\n5. Se recorrente, abra tarefa para expansão de volume.' },
  { id: 5, title: 'Emissão de NFS-e — erros de certificado', cat: 'Sistemas', views: 53, updated: '04 jun', author: 'diego', body: 'Erro "certificado inválido" geralmente indica:\n\n• Certificado A1 expirado → solicitar novo .pfx ao cliente.\n• Senha incorreta após troca → atualizar no módulo fiscal.\n• Cadeia incompleta → reinstalar cadeia ICP-Brasil.\n\nApós atualizar, emita uma nota de teste em homologação.' },
];

function TicketsKB() {
  const [q, setQ] = useStateTK('');
  const [open, setOpen] = useStateTK(KB_ARTICLES[0]);
  const list = KB_ARTICLES.filter(a => !q.trim() || (a.title + a.cat).toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
      <div style={{ width: 330, flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 14px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', borderRadius: 8, padding: '8px 11px' }}>
            <Icon d={ICONS.search} size={14} style={{ color: 'var(--text-3)' }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar artigos, procedimentos…"
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 12.5, minWidth: 0 }} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {list.map(a => {
            const isOpen = open && open.id === a.id;
            return (
              <button key={a.id} onClick={() => setOpen(a)} style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
                background: isOpen ? 'var(--accent-soft)' : 'transparent',
                borderLeft: isOpen ? '3px solid var(--accent)' : '3px solid transparent',
              }}
                onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = 'transparent'; }}>
                <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, lineHeight: 1.4, marginBottom: 4 }}>{a.title}</span>
                <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Badge tone="violet">{a.cat}</Badge>
                  <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>{a.views} acessos · {a.updated}</span>
                </span>
              </button>
            );
          })}
          {list.length === 0 && <p className="mono" style={{ padding: 18, fontSize: 11, color: 'var(--text-3)', textAlign: 'center' }}>nenhum artigo para "{q}"</p>}
        </div>
        <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
          <PrimaryBtn icon="plus" onClick={() => window.SOGI_TOAST('Novo artigo — editor aberto', 'info')}>Novo artigo</PrimaryBtn>
        </div>
      </div>
      {open ? (
        <div style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
          <header style={{ padding: '18px 26px 14px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <Badge tone="violet">{open.cat}</Badge>
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)', alignSelf: 'center' }}>{open.views} acessos · atualizado {open.updated}</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, lineHeight: 1.35 }}>{open.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
              <Avatar person={open.author} size={22} />
              <span style={{ fontSize: 11.5, color: 'var(--text-2)' }}>{SOGI_DATA.people[open.author].name}</span>
              <span style={{ flex: 1 }}></span>
              <GhostBtn icon="link" onClick={() => window.SOGI_TOAST('Link do artigo copiado')}>Copiar link</GhostBtn>
              <GhostBtn icon="chat" onClick={() => window.SOGI_TOAST('Artigo anexado à resposta do chamado')}>Usar no chamado</GhostBtn>
            </div>
          </header>
          <div style={{ padding: '20px 26px', fontSize: 13.5, lineHeight: 1.75, color: 'var(--text)', whiteSpace: 'pre-line', maxWidth: 720 }}>
            {open.body}
          </div>
          <div style={{ padding: '0 26px 26px', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Este artigo resolveu?</span>
            <button onClick={() => window.SOGI_TOAST('Obrigado pelo feedback! 👍')} style={{ fontSize: 13, padding: '4px 10px', borderRadius: 7, border: '1px solid var(--border)' }}>👍 32</button>
            <button onClick={() => window.SOGI_TOAST('Feedback registrado — vamos melhorar o artigo', 'info')} style={{ fontSize: 13, padding: '4px 10px', borderRadius: 7, border: '1px solid var(--border)' }}>👎 2</button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>selecione um artigo</p>
        </div>
      )}
    </div>
  );
}

/* ============ Modal: transferir de fila ============ */
function TransferQueueModal({ ticket, onClose, onTransfer }) {
  const [fila, setFila] = useStateTK(SOGI_DATA.serviceQueues[1]);
  const [agent, setAgent] = useStateTK('');
  const [motivo, setMotivo] = useStateTK('');
  const selStyle = { width: '100%', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontFamily: 'var(--font-ui)', background: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' };
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(24,60,90,0.4)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'sogi-pop .15s ease' }}>
      <div data-screen-label="Transferir chamado" onClick={e => e.stopPropagation()} style={{ width: 440, maxWidth: '94vw', background: 'var(--surface)', borderRadius: 14, boxShadow: 'var(--shadow-pop)', animation: 'sogi-pop .2s cubic-bezier(.3,1.3,.6,1)' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '15px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--violet)', display: 'flex' }}><Icon d={ICONS.inbox} size={16} /></span>
          <strong style={{ fontSize: 14 }}>Transferir {ticket.id} de fila</strong>
          <span style={{ flex: 1 }}></span>
          <button onClick={onClose} style={{ color: 'var(--text-3)', display: 'flex', padding: 4 }}><Icon d={ICONS.x} size={15} /></button>
        </header>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 13 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
            Fila de destino
            <select value={fila} onChange={e => setFila(e.target.value)} style={selStyle}>
              {SOGI_DATA.serviceQueues.map(q => <option key={q}>{q}</option>)}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
            Atribuir a (opcional)
            <select value={agent} onChange={e => setAgent(e.target.value)} style={selStyle}>
              <option value="">Deixar a fila distribuir (round-robin)</option>
              {['diego', 'carlos', 'pedro', 'ana'].map(id => <option key={id} value={id}>{SOGI_DATA.people[id].name}</option>)}
            </select>
          </label>
          <textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={2} placeholder="Motivo da transferência (registrado no histórico)…"
            style={{ ...selStyle, resize: 'vertical', lineHeight: 1.5, outline: 'none' }} />
          <div style={{ background: 'var(--violet-soft)', borderRadius: 8, padding: 10, fontSize: 11.5, color: 'var(--violet)', lineHeight: 1.5 }}>
            O SLA é preservado. O solicitante e os visualizadores são notificados da transferência.
          </div>
        </div>
        <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '13px 20px', borderTop: '1px solid var(--border)' }}>
          <GhostBtn onClick={onClose}>Cancelar</GhostBtn>
          <PrimaryBtn icon="inbox" onClick={() => { if (!motivo.trim()) { window.SOGI_TOAST('Informe o motivo da transferência', 'warn'); return; } onTransfer(fila, agent, motivo.trim()); }}>Transferir</PrimaryBtn>
        </footer>
      </div>
    </div>
  );
}

/* ============ Relatórios de chamados ============ */
function TicketsReports() {
  const [period, setPeriod] = useStateTK('Junho de 2026');
  const byAgent = [['diego', 18, '4,9'], ['carlos', 14, '4,6'], ['pedro', 6, '4,7'], ['ana', 3, '4,8']];
  const byQueue = [['Suporte N1', 22], ['Infraestrutura', 11], ['Fiscal/Sistemas', 6], ['Desenvolvimento', 2]];
  const weekly = [9, 12, 8, 14, 11, 7];
  const maxA = Math.max(...byAgent.map(a => a[1])), maxQ = Math.max(...byQueue.map(q => q[1])), maxW = Math.max(...weekly);
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <select value={period} onChange={e => { setPeriod(e.target.value); window.SOGI_TOAST('Período atualizado — métricas recalculadas'); }} style={{
          border: '1px solid var(--border)', borderRadius: 8, padding: '7px 11px', fontSize: 12.5,
          fontFamily: 'var(--font-ui)', background: 'var(--surface)', color: 'var(--text)',
        }}>
          {['Junho de 2026', 'Maio de 2026', 'Últimos 90 dias', 'Ano de 2026'].map(p => <option key={p}>{p}</option>)}
        </select>
        <span style={{ flex: 1 }}></span>
        <GhostBtn icon="download" onClick={() => window.SOGI_TOAST('Exportando métricas de chamados (CSV)…')}>Exportar CSV</GhostBtn>
        <GhostBtn icon="docs" onClick={() => window.SOGI_TOAST('Gerando relatório executivo de chamados (PDF)…')}>Exportar PDF</GhostBtn>
        <PrimaryBtn icon="ai" onClick={() => window.SOGI_TOAST('IA analisando os indicadores do período…', 'info')}>Análise da IA</PrimaryBtn>
      </div>

      <div className="kpi-grid" style={{ maxWidth: 1100 }}>
        {[
          ['Total no período', '41', 'accent', 'tickets', '+8% vs maio'],
          ['MTTR (resolução média)', '5,2h', 'violet', 'clock', 'meta: 8h'],
          ['Reabertos', '2', 'warn', 'refresh', '4,8% · meta < 5%'],
          ['CSAT médio', '4,7 ★', 'ok', 'award', '32 avaliações'],
        ].map(([label, v, tone, icon, trend]) => (
          <div key={label} style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', padding: 'var(--pad)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>{label}</span>
              <span style={{ width: 30, height: 30, borderRadius: 8, background: TONE[tone].bg, color: TONE[tone].fg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon d={ICONS[icon]} size={15} />
              </span>
            </div>
            <span style={{ fontSize: 27, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>{v}</span>
            <span style={{ fontSize: 11.5, color: 'var(--text-3)', display: 'block', marginTop: 5 }}>{trend}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 14, maxWidth: 1100 }}>
        <Card title="Resolvidos por agente" pad={false}>
          {byAgent.map(([who, v, csat], i) => (
            <div key={who} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <Avatar person={who} size={26} />
              <span style={{ width: 70, fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{SOGI_DATA.people[who].name.split(' ')[0]}</span>
              <div style={{ flex: 1, height: 12, borderRadius: 6, background: 'var(--bg)', overflow: 'hidden' }}>
                <div style={{ width: `${(v / maxA) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: 6, transition: 'width .5s ease' }}></div>
              </div>
              <span className="mono" style={{ fontSize: 11.5, fontWeight: 700, width: 24, textAlign: 'right' }}>{v}</span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--warn)', width: 38, textAlign: 'right' }}>{csat}★</span>
            </div>
          ))}
        </Card>
        <Card title="Volume por fila" pad={false}>
          {byQueue.map(([q, v], i) => (
            <div key={q} style={{ padding: '10px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-2)' }}>{q}</span>
                <span className="mono" style={{ color: 'var(--text-3)' }}>{v}</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: 'var(--bg)', overflow: 'hidden' }}>
                <div style={{ width: `${(v / maxQ) * 100}%`, height: '100%', background: 'var(--violet)', borderRadius: 4 }}></div>
              </div>
            </div>
          ))}
        </Card>
        <Card title="Abertos × resolvidos por semana">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130, paddingTop: 8 }}>
            {weekly.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, height: '100%', justifyContent: 'flex-end' }}>
                <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-2)', fontWeight: 600 }}>{v}</span>
                <div style={{ width: '100%', maxWidth: 30, height: `${(v / maxW) * 100}%`, minHeight: 5, background: 'var(--accent)', borderRadius: 6, transition: 'height .5s ease' }}></div>
                <span className="mono" style={{ fontSize: 9, color: 'var(--text-3)' }}>S{19 + i}</span>
              </div>
            ))}
          </div>
          <p className="mono" style={{ margin: '8px 0 0', fontSize: 9.5, color: 'var(--text-3)' }}>backlog atual: 5 · menor backlog do trimestre</p>
        </Card>
      </div>
    </div>
  );
}

Object.assign(window, { TicketsScreen, TicketsInbox, TicketsKB, NewTicketModal, EscalateModal, TicketFullModal, TransferQueueModal, TicketsReports });
