// SOGI — Portal do Cliente: chamados, abertura, status do projeto e aprovações
const { useState: useStatePT } = React;

const PT_CLIENT = { name: 'Paulo Andrade', company: 'Metalúrgica Vale Aço', initials: 'PA' };

function PortalScreen({ onExit }) {
  const [tab, setTab] = useStatePT('chamados');
  const [tickets, setTickets] = useStatePT(SOGI_DATA.tickets.filter(t => t.client === 'Metalúrgica Vale Aço'));
  const [selected, setSelected] = useStatePT(null);
  const [reply, setReply] = useStatePT('');
  const [replies, setReplies] = useStatePT({});
  const [approved, setApproved] = useStatePT(false);

  const TABS = [
    ['chamados', 'Meus chamados', 'tickets'],
    ['abrir', 'Abrir chamado', 'plus'],
    ['projeto', 'Meu projeto', 'projects'],
    ['aprovacoes', 'Aprovações', 'check'],
  ];
  const tones = { breach: 'danger', warn: 'warn', ok: 'ok' };
  const tk = tickets.find(t => t.id === selected);
  const detail = tk ? SOGI_DATA.ticketDetails[tk.id] : null;
  const p = SOGI_DATA.projects[0]; // ERP-MIG

  const sendReply = () => {
    if (!reply.trim() || !tk) return;
    setReplies(r => ({ ...r, [tk.id]: [...(r[tk.id] || []), { text: reply.trim(), when: 'agora' }] }));
    window.SOGI_TOAST('Mensagem enviada — a equipe ITS foi notificada');
    setReply('');
  };

  return (
    <div data-screen-label="Portal do Cliente" style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'var(--bg)', display: 'flex', flexDirection: 'column', animation: 'sogi-pop .15s ease' }}>
      {/* Header do portal */}
      <header style={{ background: '#183c5a', flexShrink: 0 }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src="assets/its-logo-light.png" alt="ITS" style={{ height: 34, width: 'auto' }} />
          <span style={{ color: '#9fb3c8', fontSize: 11, borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: 14 }}>Portal do Cliente</span>
          <span style={{ flex: 1 }}></span>
          <span style={{ textAlign: 'right', lineHeight: 1.3 }}>
            <span style={{ display: 'block', color: '#fff', fontSize: 12.5, fontWeight: 600 }}>{PT_CLIENT.name}</span>
            <span style={{ display: 'block', color: '#9fb3c8', fontSize: 10.5 }}>{PT_CLIENT.company}</span>
          </span>
          <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#E85928', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>{PT_CLIENT.initials}</span>
          <button onClick={onExit} title="Sair do portal" style={{ color: '#9fb3c8', display: 'flex', padding: 6, borderRadius: 7, border: '1px solid rgba(255,255,255,0.15)' }}>
            <Icon d={ICONS.power} size={14} />
          </button>
        </div>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 2 }}>
          {TABS.map(([id, label, icon]) => (
            <button key={id} onClick={() => { setTab(id); setSelected(null); }} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '10px 16px', fontSize: 12.5, fontWeight: 600,
              color: tab === id ? '#fff' : '#9fb3c8',
              borderBottom: tab === id ? '3px solid #E85928' : '3px solid transparent', transition: 'color .12s',
            }}>
              <Icon d={ICONS[icon]} size={14} />{label}
              {id === 'aprovacoes' && !approved && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#E85928' }}></span>}
            </button>
          ))}
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '22px 24px 32px' }}>
          {/* ===== Meus chamados ===== */}
          {tab === 'chamados' && !selected && (
            <div>
              <PageHeader title="Meus chamados" subtitle={`${tickets.length} ativos · SLA contratado: crítico 4h · alto 8h`}
                actions={<PrimaryBtn icon="plus" onClick={() => setTab('abrir')}>Abrir chamado</PrimaryBtn>} />
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
                {tickets.map((t, i) => (
                  <button key={t.id} onClick={() => setSelected(t.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
                    padding: '13px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <span className="mono" style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-3)', flexShrink: 0 }}>{t.id}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>{t.title}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{t.status} · responsável: {SOGI_DATA.people[t.assignee].name.split(' ')[0]} (ITS)</span>
                    </span>
                    <Badge tone={tones[t.slaState]} dot>{t.slaState === 'breach' ? 'em tratamento prioritário' : `SLA ${t.sla}`}</Badge>
                    <Icon d={ICONS.chevR} size={14} style={{ color: 'var(--text-3)' }} />
                  </button>
                ))}
              </div>
              <p className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', marginTop: 12 }}>histórico completo e faturas disponíveis mediante solicitação ao gerente de contas</p>
            </div>
          )}

          {/* ===== Detalhe do chamado (cliente) ===== */}
          {tab === 'chamados' && selected && tk && detail && (
            <div>
              <PageHeader crumbs={[{ label: 'Meus chamados', onClick: () => setSelected(null) }, { label: tk.id }]}
                title={tk.title}
                subtitle={`Aberto ${detail.opened} · ${detail.category} / ${detail.subcategory}`}
                actions={<Badge tone={tones[tk.slaState]} dot>{tk.slaState === 'breach' ? 'tratamento prioritário' : `SLA ${tk.sla}`}</Badge>} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 720 }}>
                <div style={{ background: 'var(--surface)', borderRadius: 10, boxShadow: 'var(--shadow-card)', padding: 14 }}>
                  <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>sua solicitação</span>
                  <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.55, color: 'var(--text-2)' }}>{detail.desc}</p>
                </div>
                {detail.thread.filter(m => m.kind === 'reply').map((m, i) => (
                  <div key={i} style={{ background: 'var(--accent-soft)', borderRadius: 10, padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <Avatar person={m.who} size={22} />
                      <strong style={{ fontSize: 12 }}>{SOGI_DATA.people[m.who].name} · ITS</strong>
                      <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', marginLeft: 'auto' }}>{m.when}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: 'var(--text-2)' }}>{m.text}</p>
                  </div>
                ))}
                {(replies[tk.id] || []).map((r, i) => (
                  <div key={i} style={{ background: 'var(--surface)', borderRadius: 10, boxShadow: 'var(--shadow-card)', padding: 14, animation: 'sogi-pop .15s ease' }}>
                    <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>você · {r.when}</span>
                    <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.55, color: 'var(--text-2)' }}>{r.text}</p>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--surface)', borderRadius: 10, padding: '5px 5px 5px 14px', boxShadow: 'var(--shadow-card)' }}>
                  <input value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendReply()}
                    placeholder="Responder à equipe ITS…"
                    style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13, minWidth: 0, padding: '8px 0' }} />
                  <button title="Anexar" onClick={() => window.SOGI_TOAST('Selecione o arquivo para anexar', 'info')} style={{ color: 'var(--text-3)', display: 'flex', padding: 6 }}>
                    <Icon d={ICONS.paperclip} size={15} />
                  </button>
                  <button onClick={sendReply} style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon d={ICONS.send} size={15} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== Abrir chamado ===== */}
          {tab === 'abrir' && <PortalNewTicket onCreated={(t) => { setTickets(ts => [t, ...ts]); setTab('chamados'); }} />}

          {/* ===== Meu projeto ===== */}
          {tab === 'projeto' && (
            <div>
              <PageHeader title={p.name} subtitle={`Gerente do projeto: ${SOGI_DATA.people[p.lead].name} (ITS) · entrega prevista: ${p.dueDate}`}
                actions={<Badge tone={p.health === 'risk' ? 'danger' : 'ok'} dot>{{ ok: 'Saudável', warn: 'Atenção', risk: 'Atenção da diretoria' }[p.health]}</Badge>} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
                <Card title="Progresso geral">
                  <div className="mono" style={{ fontSize: 34, fontWeight: 800, color: 'var(--accent-text)', marginBottom: 6 }}>{p.progress}%</div>
                  <div style={{ height: 10, borderRadius: 5, background: 'var(--bg)', overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ width: `${p.progress}%`, height: '100%', background: 'var(--accent)', borderRadius: 5 }}></div>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.55 }}>{p.tasksDone} de {p.tasksDone + p.tasksOpen} entregas concluídas. Próximo marco: homologação bancária (aguarda sua assinatura).</p>
                </Card>
                <Card title="Linha do tempo" pad={false}>
                  {[['Levantamento e análise', 'concluído', 'done'], ['Migração de dados', 'concluído', 'done'], ['Homologação bancária', 'aguardando sua aprovação', 'late'], ['Treinamento das equipes', '18 jun', 'todo'], ['Virada para produção', '28 jun', 'todo']].map(([label, when, st], i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                        background: st === 'done' ? 'var(--ok)' : st === 'late' ? 'var(--warn)' : 'var(--surface-2)',
                        border: st === 'todo' ? '1.5px solid var(--border-strong)' : 'none',
                      }}>{st === 'done' && <Icon d={ICONS.check} size={11} sw={2.5} />}{st === 'late' && <Icon d={ICONS.clock} size={11} sw={2.2} />}</span>
                      <span style={{ flex: 1, fontSize: 12.5, fontWeight: 550 }}>{label}</span>
                      <span className="mono" style={{ fontSize: 10, color: st === 'late' ? 'var(--warn)' : 'var(--text-3)', fontWeight: st === 'late' ? 700 : 400 }}>{when}</span>
                    </div>
                  ))}
                </Card>
              </div>
            </div>
          )}

          {/* ===== Aprovações ===== */}
          {tab === 'aprovacoes' && (
            <div>
              <PageHeader title="Aprovações pendentes" subtitle="Documentos que aguardam sua assinatura digital" />
              <div style={{ maxWidth: 640 }}>
                <Card title="Termo de homologação — Integração bancária (CNAB 240)" action={approved ? <Badge tone="ok" dot>assinado</Badge> : <Badge tone="warn" dot>aguardando você</Badge>}>
                  <p style={{ margin: '0 0 12px', fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
                    Todos os 6 testes de homologação foram concluídos com sucesso (remessa e retorno de cobrança, pagamento e folha — BB e Itaú). Sua assinatura libera a virada para produção em 28/06.
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <GhostBtn icon="download" onClick={() => window.SOGI_TOAST('Baixando termo de homologação (PDF)…')}>Baixar termo</GhostBtn>
                    {!approved && <PrimaryBtn icon="check" onClick={() => { setApproved(true); window.SOGI_TOAST('Termo assinado digitalmente — a equipe ITS foi notificada e 3 tarefas foram desbloqueadas'); }}>Assinar digitalmente</PrimaryBtn>}
                  </div>
                  {approved && (
                    <p className="mono" style={{ margin: '12px 0 0', fontSize: 10, color: 'var(--ok)' }}>✓ assinado por {PT_CLIENT.name} · hoje · IP registrado para auditoria</p>
                  )}
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Abertura de chamado pelo cliente ---------- */
function PortalNewTicket({ onCreated }) {
  const [title, setTitle] = useStatePT('');
  const [cat, setCat] = useStatePT('Sistemas');
  const [prio, setPrio] = useStatePT('média');
  const [desc, setDesc] = useStatePT('');
  const [attached, setAttached] = useStatePT(false);
  const create = () => {
    if (!title.trim()) { window.SOGI_TOAST('Dê um título ao chamado', 'warn'); return; }
    if (!desc.trim()) { window.SOGI_TOAST('Descreva o problema para agilizar o atendimento', 'warn'); return; }
    const id = '#' + (4830 + Math.floor(Math.random() * 60));
    SOGI_DATA.ticketDetails[id] = {
      category: cat, subcategory: 'Aberto pelo portal', channel: 'Portal do Cliente',
      opened: 'agora', slaTarget: prio === 'crítica' ? '4h (crítico)' : prio === 'alta' ? '8h (alto)' : '24h',
      requester: PT_CLIENT.name + ' — ' + PT_CLIENT.company, desc: desc.trim(), thread: [],
    };
    onCreated({ id, title: title.trim(), client: PT_CLIENT.company, sla: prio === 'crítica' ? '4h 00m' : '8h 00m', slaState: 'ok', priority: prio, assignee: 'diego', status: 'Na fila' });
    window.SOGI_TOAST(`Chamado ${id} aberto — você receberá atualizações por e-mail e aqui no portal`);
  };
  const inputStyle = { width: '100%', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', fontFamily: 'var(--font-ui)', background: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' };
  return (
    <div>
      <PageHeader title="Abrir chamado" subtitle="Descreva o problema — nossa IA roteia automaticamente para a equipe certa" />
      <div style={{ maxWidth: 640, background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
          Título do chamado
          <input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex.: Erro ao emitir nota fiscal no módulo de faturamento" style={inputStyle} />
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
            Categoria
            <select value={cat} onChange={e => setCat(e.target.value)} style={inputStyle}>
              {SOGI_DATA.ticketCategories.map(c => <option key={c}>{c}</option>)}
            </select>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>Urgência</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {['baixa', 'média', 'alta', 'crítica'].map(pr => (
                <button key={pr} onClick={() => setPrio(pr)} style={{
                  flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 11.5, fontWeight: 600,
                  border: prio === pr ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                  background: prio === pr ? 'var(--accent-soft)' : 'var(--surface)',
                  color: prio === pr ? 'var(--accent-text)' : 'var(--text-2)',
                }}>{pr}</button>
              ))}
            </div>
          </div>
        </div>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
          Descrição do problema
          <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4}
            placeholder="O que aconteceu, desde quando, quantos usuários afetados, mensagens de erro…"
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.55 }} />
        </label>
        <button onClick={() => { setAttached(true); window.SOGI_TOAST('print-erro-faturamento.png anexado'); }} style={{
          display: 'flex', alignItems: 'center', gap: 9, border: '1.5px dashed var(--border-strong)', borderRadius: 9,
          padding: '11px 14px', fontSize: 12.5, fontWeight: 600, color: attached ? 'var(--ok)' : 'var(--text-3)', textAlign: 'left',
        }}>
          <Icon d={attached ? ICONS.check : ICONS.paperclip} size={15} />
          {attached ? 'print-erro-faturamento.png anexado · clique para adicionar mais' : 'Anexar prints ou arquivos (opcional, mas ajuda muito)'}
        </button>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <PrimaryBtn icon="send" onClick={create}>Abrir chamado</PrimaryBtn>
        </div>
        <p className="mono" style={{ margin: 0, fontSize: 9.5, color: 'var(--text-3)', lineHeight: 1.6 }}>
          SLA contratado: crítico 4h · alto 8h · médio 24h · você acompanha tudo em "Meus chamados"
        </p>
      </div>
    </div>
  );
}

Object.assign(window, { PortalScreen, PortalNewTicket });
