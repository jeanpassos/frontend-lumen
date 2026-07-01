// SOGI — Calendário (junho 2026)
const { useState: useStateCal } = React;

const CAL_KINDS = {
  meeting: { label: 'Reunião', tone: 'accent' },
  delivery: { label: 'Entrega', tone: 'danger' },
  task: { label: 'Tarefa', tone: 'violet' },
  maintenance: { label: 'Manutenção', tone: 'warn' },
};

function CalendarScreen({ onOpenTask }) {
  const [filter, setFilter] = useStateCal(null);
  const [selected, setSelected] = useStateCal(10);
  const [viewMode, setViewMode] = useStateCal('mes');
  const [allEvents, setAllEvents] = useStateCal(SOGI_DATA.events);
  const [newEventOpen, setNewEventOpen] = useStateCal(false);
  const [eventDetail, setEventDetail] = useStateCal(null);
  const events = allEvents.filter(e => !filter || e.kind === filter);

  // Junho 2026: dia 1 = segunda. Grade dom→sáb, 5 semanas (31 mai – 4 jul)
  const cells = [];
  cells.push({ day: 31, off: true });
  for (let d = 1; d <= 30; d++) cells.push({ day: d, off: false });
  for (let d = 1; d <= 4; d++) cells.push({ day: d, off: true });

  const dayEvents = (d) => events.filter(e => e.day === d);
  const selectedEvents = allEvents.filter(e => e.day === selected);

  const openEvent = (e) => {
    if (e.kind === 'task' && onOpenTask) onOpenTask();
    else setEventDetail(e);
  };

  return (
    <div data-screen-label="Calendário" style={{ padding: 24, overflowY: 'auto', flex: 1, animation: 'sogi-fade-up .25s ease' }}>
      <PageHeader title="Calendário" subtitle={viewMode === 'mes' ? `Junho de 2026 · ${allEvents.length} eventos no mês` : '2026 · visão anual'}
        actions={<>
          <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', borderRadius: 9, padding: 4, boxShadow: 'var(--shadow-card)' }}>
            {[['mes', 'Mês'], ['ano', 'Ano']].map(([id, label]) => (
              <button key={id} onClick={() => setViewMode(id)} style={{
                fontSize: 12, fontWeight: 600, borderRadius: 7, padding: '6px 14px',
                background: viewMode === id ? 'var(--accent)' : 'transparent',
                color: viewMode === id ? '#fff' : 'var(--text-2)', transition: 'all .15s',
              }}>{label}</button>
            ))}
          </div>
          <PrimaryBtn icon="plus" onClick={() => setNewEventOpen(true)}>Novo evento</PrimaryBtn>
        </>} />

      {viewMode === 'ano' ? (
        <YearView onPickMonth={(m) => { if (m === 5) setViewMode('mes'); else window.SOGI_TOAST('Navegação simulada — somente junho tem dados no protótipo', 'info'); }} eventCount={allEvents.length} />
      ) : (
      <>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
        <button onClick={() => setFilter(null)} style={{
          fontSize: 12, fontWeight: 600, borderRadius: 99, padding: '5px 13px',
          background: !filter ? 'var(--nav-bg)' : 'var(--surface)', color: !filter ? '#fff' : 'var(--text-2)',
          border: '1px solid ' + (!filter ? 'var(--nav-bg)' : 'var(--border)'), transition: 'all .12s',
        }}>Todos</button>
        {Object.entries(CAL_KINDS).map(([k, v]) => (
          <button key={k} onClick={() => setFilter(f => f === k ? null : k)} style={{
            fontSize: 12, fontWeight: 600, borderRadius: 99, padding: '5px 13px', display: 'flex', alignItems: 'center', gap: 6,
            background: filter === k ? 'var(--nav-bg)' : 'var(--surface)', color: filter === k ? '#fff' : 'var(--text-2)',
            border: '1px solid ' + (filter === k ? 'var(--nav-bg)' : 'var(--border)'), transition: 'all .12s',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: TONE[v.tone].fg }}></span>
            {v.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14, alignItems: 'start' }}>
        {/* Grade do mês */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
            {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map(d => (
              <div key={d} className="mono" style={{ padding: '8px 0', textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.08em' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {cells.map((c, i) => {
              const evs = c.off ? [] : dayEvents(c.day);
              const isToday = !c.off && c.day === 10;
              const isSel = !c.off && c.day === selected;
              return (
                <button key={i} onClick={() => !c.off && setSelected(c.day)} style={{
                  minHeight: 86, padding: 6, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 3,
                  borderTop: i >= 7 ? '1px solid var(--border)' : 'none',
                  borderLeft: i % 7 !== 0 ? '1px solid var(--border)' : 'none',
                  background: isSel ? 'var(--accent-soft)' : c.off ? 'var(--surface-2)' : 'var(--surface)',
                  cursor: c.off ? 'default' : 'pointer', transition: 'background .12s',
                }}
                  onMouseEnter={e => { if (!c.off && !isSel) e.currentTarget.style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { if (!c.off && !isSel) e.currentTarget.style.background = 'var(--surface)'; }}>
                  <span style={{
                    fontSize: 11.5, fontWeight: 600, width: 22, height: 22, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isToday ? 'var(--accent)' : 'transparent',
                    color: isToday ? '#fff' : c.off ? 'var(--text-3)' : 'var(--text-2)',
                  }}>{c.day}</span>
                  {evs.slice(0, 2).map((e, j) => (
                    <span key={j} onClick={ev => { ev.stopPropagation(); setSelected(c.day); openEvent(e); }} style={{
                      fontSize: 10, fontWeight: 600, borderRadius: 4, padding: '2px 6px',
                      background: TONE[CAL_KINDS[e.kind].tone].bg, color: TONE[CAL_KINDS[e.kind].tone].fg,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
                      cursor: 'pointer', transition: 'transform .1s',
                    }}
                      onMouseEnter={ev => ev.currentTarget.style.transform = 'scale(1.04)'}
                      onMouseLeave={ev => ev.currentTarget.style.transform = 'none'}>{e.title}</span>
                  ))}
                  {evs.length > 2 && <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', paddingLeft: 4 }}>+{evs.length - 2} mais</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Agenda do dia */}
        <Card title={`Dia ${selected} de junho`} pad={false}>
          {selectedEvents.length === 0 && (
            <p style={{ padding: 'var(--pad)', margin: 0, fontSize: 12.5, color: 'var(--text-3)' }}>Nenhum evento neste dia.</p>
          )}
          {selectedEvents.map((e, i) => (
            <button key={i} onClick={() => openEvent(e)} style={{
              display: 'flex', gap: 11, padding: '11px var(--pad)', width: '100%', textAlign: 'left',
              borderTop: i > 0 ? '1px solid var(--border)' : 'none', alignItems: 'flex-start',
            }}
              onMouseEnter={ev => ev.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
              <span style={{ width: 4, alignSelf: 'stretch', borderRadius: 2, background: TONE[CAL_KINDS[e.kind].tone].fg, flexShrink: 0 }}></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, lineHeight: 1.4 }}>{e.title}</span>
                <span style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                  <Badge tone={CAL_KINDS[e.kind].tone}>{CAL_KINDS[e.kind].label}</Badge>
                  {e.time && <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{e.time}</span>}
                </span>
              </span>
            </button>
          ))}
        </Card>
      </div>
      </>
      )}

      {newEventOpen && <NewEventModal day={selected} onClose={() => setNewEventOpen(false)}
        onCreate={(ev) => { setAllEvents(es => [...es, ev]); setSelected(ev.day); window.SOGI_TOAST('Evento criado — convites enviados aos participantes'); }} />}
      {eventDetail && <EventDetailModal event={eventDetail} onClose={() => setEventDetail(null)} />}
    </div>
  );
}

/* ---------- Visão anual ---------- */
function YearView({ onPickMonth, eventCount }) {
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const counts = [8, 11, 9, 14, 12, eventCount, 4, 2, 0, 0, 0, 0];
  const firstDow = [4, 0, 0, 3, 5, 1, 3, 6, 2, 4, 0, 2]; // dia da semana do dia 1 (dom=0)
  const daysIn = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(225px, 1fr))', gap: 12 }}>
      {months.map((m, mi) => (
        <button key={m} onClick={() => onPickMonth(mi)} style={{
          background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)',
          padding: 13, textAlign: 'left', transition: 'transform .12s, box-shadow .12s',
          outline: mi === 5 ? '2px solid var(--accent)' : 'none', outlineOffset: -2,
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-pop)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <strong style={{ fontSize: 12.5, color: mi === 5 ? 'var(--accent-text)' : 'var(--text)' }}>{m}</strong>
            <span style={{ flex: 1 }}></span>
            {counts[mi] > 0 && <Badge tone={mi === 5 ? 'accent' : 'neutral'}>{counts[mi]} eventos</Badge>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
              <span key={i} className="mono" style={{ fontSize: 7.5, color: 'var(--text-3)', textAlign: 'center' }}>{d}</span>
            ))}
            {Array.from({ length: firstDow[mi] }, (_, i) => <span key={'e' + i}></span>)}
            {Array.from({ length: daysIn[mi] }, (_, i) => {
              const isToday = mi === 5 && i + 1 === 10;
              const hasEv = mi === 5 && SOGI_DATA.events.some(e => e.day === i + 1);
              return (
                <span key={i} className="mono" style={{
                  fontSize: 8, textAlign: 'center', borderRadius: 3, padding: '1.5px 0',
                  background: isToday ? 'var(--accent)' : hasEv ? 'var(--accent-soft)' : 'transparent',
                  color: isToday ? '#fff' : hasEv ? 'var(--accent-text)' : 'var(--text-3)',
                  fontWeight: isToday || hasEv ? 700 : 400,
                }}>{i + 1}</span>
              );
            })}
          </div>
        </button>
      ))}
    </div>
  );
}

/* ---------- Modal: novo evento ---------- */
function NewEventModal({ day, onClose, onCreate }) {
  const [title, setTitle] = useStateCal('');
  const [kind, setKind] = useStateCal('meeting');
  const [evDay, setEvDay] = useStateCal(day);
  const [time, setTime] = useStateCal('09:00');
  const create = () => {
    if (!title.trim()) { window.SOGI_TOAST('Dê um nome ao evento', 'warn'); return; }
    onCreate({ day: evDay, title: title.trim(), kind, time: kind === 'delivery' ? null : time });
    onClose();
  };
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(24,60,90,0.4)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'sogi-pop .15s ease' }}>
      <div data-screen-label="Novo evento" onClick={e => e.stopPropagation()} style={{ width: 420, maxWidth: '92vw', background: 'var(--surface)', borderRadius: 14, boxShadow: 'var(--shadow-pop)', animation: 'sogi-pop .2s cubic-bezier(.3,1.3,.6,1)' }}>
        <header style={{ display: 'flex', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid var(--border)' }}>
          <strong style={{ fontSize: 14 }}>Novo evento</strong>
          <span style={{ flex: 1 }}></span>
          <button onClick={onClose} style={{ color: 'var(--text-3)', display: 'flex', padding: 4 }}><Icon d={ICONS.x} size={15} /></button>
        </header>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 13 }}>
          <input autoFocus value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && create()}
            placeholder="Título do evento"
            style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          <div style={{ display: 'flex', gap: 6 }}>
            {Object.entries(CAL_KINDS).map(([k, v]) => (
              <button key={k} onClick={() => setKind(k)} style={{
                flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 11.5, fontWeight: 600,
                border: kind === k ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                background: kind === k ? 'var(--accent-soft)' : 'var(--surface)',
                color: kind === k ? 'var(--accent-text)' : 'var(--text-2)',
              }}>{v.label}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
              Dia (junho)
              <select value={evDay} onChange={e => setEvDay(+e.target.value)} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', fontSize: 13, fontFamily: 'var(--font-ui)', color: 'var(--text)', background: 'var(--surface)' }}>
                {Array.from({ length: 30 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1} jun</option>)}
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
              Horário
              <select value={time} onChange={e => setTime(e.target.value)} disabled={kind === 'delivery'} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', fontSize: 13, fontFamily: 'var(--font-ui)', color: 'var(--text)', background: 'var(--surface)', opacity: kind === 'delivery' ? 0.5 : 1 }}>
                {['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map(t => <option key={t}>{t}</option>)}
              </select>
            </label>
          </div>
        </div>
        <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '13px 20px', borderTop: '1px solid var(--border)' }}>
          <GhostBtn onClick={onClose}>Cancelar</GhostBtn>
          <PrimaryBtn icon="plus" onClick={create}>Criar evento</PrimaryBtn>
        </footer>
      </div>
    </div>
  );
}

/* ---------- Modal: detalhe do evento ---------- */
function EventDetailModal({ event, onClose }) {
  const k = CAL_KINDS[event.kind];
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(24,60,90,0.4)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'sogi-pop .15s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 400, maxWidth: '92vw', background: 'var(--surface)', borderRadius: 14, boxShadow: 'var(--shadow-pop)', animation: 'sogi-pop .2s cubic-bezier(.3,1.3,.6,1)' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '15px 20px', borderBottom: '1px solid var(--border)' }}>
          <Badge tone={k.tone} dot>{k.label}</Badge>
          <span style={{ flex: 1 }}></span>
          <button onClick={onClose} style={{ color: 'var(--text-3)', display: 'flex', padding: 4 }}><Icon d={ICONS.x} size={15} /></button>
        </header>
        <div style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, lineHeight: 1.35 }}>{event.title}</h3>
          <div style={{ display: 'flex', gap: 14, fontSize: 12.5, color: 'var(--text-2)', marginBottom: 16 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon d={ICONS.calendar} size={13} /> {event.day} de junho</span>
            {event.time && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon d={ICONS.clock} size={13} /> {event.time}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Participantes:</span>
            <AvatarStack ids={['rafael', 'ana', 'carlos']} size={24} />
          </div>
          <NotifyChannels />
          <div style={{ display: 'flex', gap: 8 }}>
            <GhostBtn icon="calendar" onClick={() => { window.SOGI_TOAST('Evento sincronizado com o Google Calendar'); onClose(); }}>Sincronizar</GhostBtn>
            <PrimaryBtn icon="chat" onClick={() => { window.SOGI_TOAST('Lembrete enviado aos participantes'); onClose(); }}>Lembrar equipe</PrimaryBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Canais de notificação do evento ---------- */
function NotifyChannels() {
  const [chans, setChans] = useStateCal({ Interno: true, 'E-mail': true, WhatsApp: false, SMS: false, Push: true });
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Notificar por</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {Object.entries(chans).map(([c, on]) => (
          <button key={c} onClick={() => setChans(cs => ({ ...cs, [c]: !cs[c] }))} style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 600,
            borderRadius: 99, padding: '5px 12px', transition: 'all .12s',
            border: on ? '1.5px solid var(--accent)' : '1px solid var(--border)',
            background: on ? 'var(--accent-soft)' : 'transparent',
            color: on ? 'var(--accent-text)' : 'var(--text-3)',
          }}>
            {on && <Icon d={ICONS.check} size={11} sw={2.5} />}
            {c}
          </button>
        ))}
        <button onClick={() => window.SOGI_TOAST(`Lembrete agendado: ${Object.entries(chans).filter(([, v]) => v).map(([k]) => k).join(', ')}`)} style={{
          fontSize: 11.5, fontWeight: 600, color: '#fff', background: 'var(--ok)', borderRadius: 99, padding: '5px 13px',
        }}>Agendar lembrete</button>
      </div>
    </div>
  );
}

Object.assign(window, { CalendarScreen, CAL_KINDS, NewEventModal, EventDetailModal, YearView });
