// SOGI — Comunicação unificada: chat interno (estilo WhatsApp), WhatsApp de clientes, e-mail (webmail) e supervisão
const { useState: useStateC, useRef: useRefC, useEffect: useEffectC } = React;

const MEDIA_META = {
  chat: { label: 'Chat', icon: 'chat', color: 'var(--accent)' },
  email: { label: 'E-mail', icon: 'mail', color: '#0284c7' },
  chamados: { label: 'Chamados', icon: 'tickets', color: '#d97706' },
  tarefas: { label: 'Tarefas', icon: 'tasks', color: '#7c3aed' },
};

const CHANNEL_ITEMS = [
  { id: 'tk1', media: 'chamados', kind: 'channel', name: '#4821 · ERP fora do ar — Joinville', unread: 1, last: 'Cliente respondeu: "pessoal já consegue faturar"', when: '09:52', body: 'Paulo Andrade respondeu no chamado #4821:\n\n"Pessoal já consegue faturar pela contingência. Aguardo o retorno do link principal para encerrarmos."\n\nSLA: estourado há 0h42 · Responsável: Diego · Fila: Infraestrutura', action: 'chamados', actionLabel: 'Abrir na central de chamados' },
  { id: 'tk2', media: 'chamados', kind: 'channel', name: '#4818 · Lentidão no faturamento', unread: 0, last: 'Você foi adicionado como visualizador', when: '08:40', body: 'Carlos adicionou você como visualizador do chamado #4818.\n\nÚltima atualização: "identificamos a causa (índice de banco), correção na janela do meio-dia".', action: 'chamados', actionLabel: 'Abrir na central de chamados' },
  { id: 'ts1', media: 'tarefas', kind: 'channel', name: 'CNAB 240 — homologação', unread: 1, last: 'Pedro: ambiente congelado até a assinatura', when: '09:42', body: 'Atualizações da tarefa "Homologar integração bancária (CNAB 240)":\n\n• Pedro comentou: "ambiente congelado até a assinatura"\n• Checklist 6/6 concluído\n• Prazo: hoje, 18h (atrasada)', action: 'task', actionLabel: 'Abrir tarefa completa' },
];

// renderiza @menções e links
function MsgRich({ text, light }) {
  const parts = text.split(/(@[A-Za-zÀ-ú]+|https?:\/\/\S+)/g);
  return <>{parts.map((p, i) => {
    if (/^@/.test(p)) return <strong key={i} style={{ color: light ? '#fff' : 'var(--violet)', background: light ? 'rgba(255,255,255,0.18)' : 'var(--violet-soft)', borderRadius: 4, padding: '0 3px' }}>{p}</strong>;
    if (/^https?:/.test(p)) return <a key={i} href="#" onClick={e => { e.preventDefault(); window.SOGI_TOAST('Abrindo link…', 'info'); }} style={{ color: light ? '#fff' : 'var(--violet)', textDecoration: 'underline' }}>{p}</a>;
    return <React.Fragment key={i}>{p}</React.Fragment>;
  })}</>;
}

function ChatScreen({ onNavigate }) {
  const D = SOGI_DATA;
  const [mode, setMode] = useStateC('minhas');
  const [mediaFilter, setMediaFilter] = useStateC(null);
  const [activeId, setActiveId] = useStateC('c1');
  const [activeSup, setActiveSup] = useStateC('s2');
  const [emailOpenId, setEmailOpenId] = useStateC('m1');
  const [newConvOpen, setNewConvOpen] = useStateC(false);
  const [extraConvs, setExtraConvs] = useStateC([]);

  const createConversation = (sel, groupName) => {
    const id = 'nc' + Date.now();
    const conv = sel.length === 1
      ? { id, media: 'chat', kind: 'dm', who: sel[0], unread: 0, last: 'conversa iniciada agora', when: 'agora' }
      : { id, media: 'chat', kind: 'sector', name: groupName, members: sel.length + 1, unread: 0, last: `você criou o grupo com ${sel.length} pessoas`, when: 'agora' };
    setExtraConvs(cs => [conv, ...cs]);
    setActiveId(id);
    setNewConvOpen(false);
    window.SOGI_TOAST(sel.length === 1 ? `Conversa com ${D.people[sel[0]].name.split(' ')[0]} iniciada` : `Grupo "${groupName}" criado com ${sel.length} pessoas`);
  };

  // sem WhatsApp nesta fase · e-mails entram como itens individuais na caixa unificada
  const baseInbox = D.inbox.filter(c => c.media !== 'whatsapp' && c.media !== 'email');
  const emailItems = D.emails.entrada.map(m => ({
    id: 'em-' + m.id, media: 'email', kind: 'email-single', emailId: m.id,
    name: m.from, unread: m.unread ? 1 : 0, last: m.subject, when: m.when,
  }));
  const unified = [...extraConvs, ...baseInbox.slice(0, 2), CHANNEL_ITEMS[0], ...emailItems.slice(0, 2), CHANNEL_ITEMS[2], ...baseInbox.slice(2), ...emailItems.slice(2), CHANNEL_ITEMS[1]];
  const inbox = unified.filter(c => !mediaFilter || c.media === mediaFilter);
  const active = unified.find(c => c.id === activeId) || unified[0];

  useEffectC(() => {
    if (mode === 'supervisao') window.SOGI_TOAST('Modo supervisão ativado — acesso registrado na auditoria', 'warn');
  }, [mode]);

  const convName = (c) => c.kind === 'dm' && c.who ? D.people[c.who].name : c.name;

  const listCtx = (c) => [
    { label: 'Marcar como lida', icon: 'check', onClick: () => window.SOGI_TOAST('Conversa marcada como lida') },
    { label: 'Fixar no topo', icon: 'arrowUp', onClick: () => window.SOGI_TOAST('Conversa fixada no topo') },
    { label: 'Silenciar por 1 dia', icon: 'bell', onClick: () => window.SOGI_TOAST('Notificações silenciadas até amanhã', 'info') },
    '-',
    { label: 'Arquivar', icon: 'folder', onClick: () => window.SOGI_TOAST('Conversa arquivada', 'warn') },
  ];

  return (
    <div data-screen-label="Comunicação" style={{ display: 'flex', flex: 1, minHeight: 0, animation: 'sogi-fade-up .25s ease' }}>
      {/* Lista de conversas */}
      <div style={{ width: 300, flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 16px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 10px' }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, flex: 1 }}>Comunicação</h2>
            <button title="Nova conversa" onClick={() => setNewConvOpen(true)} style={{
              width: 30, height: 30, borderRadius: 8, background: 'var(--accent)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Icon d={ICONS.plus} size={15} /></button>
          </div>
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg)', borderRadius: 8, padding: 3, marginBottom: 10 }}>
            {[['minhas', 'Caixa de entrada'], ['supervisao', 'Supervisão']].map(([id, label]) => (
              <button key={id} onClick={() => setMode(id)} style={{
                flex: 1, fontSize: 11.5, fontWeight: 600, borderRadius: 6, padding: '5px 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                background: mode === id ? 'var(--surface)' : 'transparent',
                color: mode === id ? (id === 'supervisao' ? 'var(--warn)' : 'var(--text)') : 'var(--text-3)',
                boxShadow: mode === id ? 'var(--shadow-card)' : 'none', transition: 'all .15s',
              }}>
                {id === 'supervisao' && <Icon d={ICONS.shield} size={12} />}
                {label}
              </button>
            ))}
          </div>
          {mode === 'minhas' && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              <MediaChip label="Todas" active={!mediaFilter} onClick={() => setMediaFilter(null)} />
              {Object.entries(MEDIA_META).map(([m, meta]) => (
                <MediaChip key={m} label={meta.label} icon={meta.icon} color={meta.color} active={mediaFilter === m} onClick={() => setMediaFilter(f => f === m ? null : m)} />
              ))}
            </div>
          )}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px 12px', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {mode === 'minhas' ? inbox.map(c => {
            const isActive = activeId === c.id;
            const meta = MEDIA_META[c.media];
            return (
              <button key={c.id} onClick={() => { setActiveId(c.id); if (c.kind === 'email-single') setEmailOpenId(c.emailId); }}
                onContextMenu={e => window.SOGI_CTX(e, listCtx(c))} style={{
                display: 'flex', gap: 10, padding: '9px 10px', borderRadius: 9, textAlign: 'left',
                background: isActive ? 'var(--accent-soft)' : 'transparent', alignItems: 'flex-start',
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                <span style={{ position: 'relative', flexShrink: 0 }}>
                  {c.kind === 'dm' && c.who
                    ? <Avatar person={c.who} size={34} showStatus />
                    : <span style={{
                        width: 34, height: 34, borderRadius: 9,
                        background: c.media === 'email' ? 'var(--violet-soft)' : c.kind === 'project' ? 'var(--accent-soft)' : 'var(--ok-soft)',
                        color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>{c.media === 'email'
                        ? <span style={{ fontSize: 12, fontWeight: 700 }}>{c.name.slice(0, 1)}</span>
                        : <Icon d={ICONS[c.kind === 'channel' ? meta.icon : (c.kind === 'project' ? 'projects' : 'users')]} size={15} />}</span>}
                  {/* badge da mídia */}
                  <span style={{
                    position: 'absolute', right: -4, bottom: -4, width: 16, height: 16, borderRadius: '50%',
                    background: meta.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid var(--surface)',
                  }}><Icon d={ICONS[meta.icon]} size={8} sw={2.4} /></span>
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
                    <strong style={{ fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{convName(c)}</strong>
                    <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', flexShrink: 0 }}>{c.when}</span>
                  </span>
                  <span style={{
                    display: 'block', fontSize: 11.5, color: 'var(--text-3)', marginTop: 2,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    fontWeight: c.unread ? 600 : 400,
                  }}>{c.last}</span>
                </span>
                {c.unread > 0 && (
                  <span style={{
                    background: meta.color, color: '#fff', fontSize: 10, fontWeight: 700,
                    borderRadius: 99, minWidth: 17, height: 17, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', padding: '0 5px', marginTop: 2,
                  }}>{c.unread}</span>
                )}
              </button>
            );
          }) : D.supervised.map(s => {
            const isActive = activeSup === s.id;
            return (
              <button key={s.id} onClick={() => setActiveSup(s.id)} style={{
                display: 'flex', gap: 10, padding: '9px 10px', borderRadius: 9, textAlign: 'left',
                background: isActive ? 'var(--warn-soft)' : 'transparent', alignItems: 'center',
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                <AvatarStack ids={s.participants} size={26} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
                    <strong style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.participants.map(p => D.people[p].name.split(' ')[0]).join(' × ')}
                    </strong>
                    <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', flexShrink: 0 }}>{s.lastWhen}</span>
                  </span>
                  <span className="mono" style={{ display: 'block', fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{s.msgs} mensagens</span>
                </span>
                {s.flag && <Badge tone="danger" dot>SLA</Badge>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Painel principal */}
      {mode === 'supervisao'
        ? <SupervisionView sup={D.supervised.find(s => s.id === activeSup)} />
        : mediaFilter === 'email'
          ? <WebmailView openId={emailOpenId} onOpenId={setEmailOpenId} />
          : active && active.kind === 'email-single'
            ? <EmailSingleView emailId={active.emailId} onOpenBox={() => setMediaFilter('email')} />
            : active && active.kind === 'channel'
              ? <ChannelItemView item={active} onNavigate={onNavigate} />
              : <ConversationView conv={active} />}
      {newConvOpen && <NewConversationModal onClose={() => setNewConvOpen(false)} onCreate={createConversation} />}
    </div>
  );
}

function MediaChip({ label, icon, color, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600,
      borderRadius: 99, padding: '4px 10px', transition: 'all .12s',
      background: active ? 'var(--nav-bg)' : 'var(--surface)',
      color: active ? '#fff' : 'var(--text-2)',
      border: '1px solid ' + (active ? 'var(--nav-bg)' : 'var(--border)'),
    }}>
      {icon && <span style={{ color: active ? '#fff' : color, display: 'flex' }}><Icon d={ICONS[icon]} size={11} /></span>}
      {label}
    </button>
  );
}

/* ============ Conversa estilo WhatsApp (chat interno + whatsapp) ============ */
function ConversationView({ conv }) {
  const isWa = conv.media === 'whatsapp';
  const D = SOGI_DATA;
  const [messages, setMessages] = useStateC(() => isWa
    ? D.waMessages.map(m => ({ ...m, mine: m.who === 'me' }))
    : D.chatMessages.map(m => ({ ...m, mine: m.who === 'rafael' })));
  const [draft, setDraft] = useStateC('');
  const [pickerOpen, setPickerOpen] = useStateC(false);
  const [recording, setRecording] = useStateC(false);
  const [reactions, setReactions] = useStateC({});
  const scrollRef = useRefC(null);

  useEffectC(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = (text) => {
    const tx = (text ?? draft).trim();
    if (!tx) return;
    setMessages(ms => [...ms, { mine: true, who: 'rafael', when: 'agora', text: tx, read: false, justSent: true }]);
    setDraft('');
    setPickerOpen(false);
    setTimeout(() => setMessages(ms => ms.map(m => m.justSent ? { ...m, read: true, justSent: false } : m)), 1600);
  };

  const sendAudio = () => {
    setRecording(false);
    setMessages(ms => [...ms, { mine: true, who: 'rafael', when: 'agora', audio: '0:07', read: false }]);
    window.SOGI_TOAST('Mensagem de voz enviada');
  };

  const react = (i, emoji) => {
    setReactions(r => ({ ...r, [i]: r[i] === emoji ? null : emoji }));
  };

  const summarize = () => {
    setMessages(ms => [...ms, { ai: true, text: isWa
      ? 'Resumo: cliente confirmou que o faturamento voltou via contingência e aguarda o fechamento do chamado #4821.'
      : 'Resumo: migração de RH concluída (412 mil registros). Marina valida a folha até 15h. CNAB aguarda apenas o termo de homologação.' }]);
  };

  const title = conv.kind === 'dm' && conv.who ? D.people[conv.who].name : conv.name;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <header style={{
        padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        {conv.kind === 'dm' && conv.who
          ? <Avatar person={conv.who} size={34} showStatus />
          : <span style={{
              width: 34, height: 34, borderRadius: 9,
              background: isWa ? 'var(--ok-soft)' : 'var(--accent-soft)',
              color: isWa ? '#16a34a' : 'var(--accent-text)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Icon d={ICONS[isWa ? 'whatsapp' : 'projects']} size={16} /></span>}
        <div>
          <strong style={{ fontSize: 13.5, display: 'block' }}>{title}</strong>
          <span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>
            {isWa ? 'WhatsApp · cliente Vale Aço · +55 47 9 9123-4567' : conv.kind === 'dm' ? 'online agora' : `${conv.members} membros · 3 online`}
          </span>
        </div>
        <span style={{ flex: 1 }}></span>
        {!isWa && conv.kind !== 'dm' && <AvatarStack ids={['rafael', 'ana', 'pedro', 'marina']} size={24} />}
        {isWa && <Badge tone="ok" dot>WhatsApp Cloud API</Badge>}
        <button onClick={summarize} style={{
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600,
          color: 'var(--accent-text)', background: 'var(--accent-soft)', borderRadius: 8, padding: '6px 11px',
        }}>
          <Icon d={ICONS.ai} size={13} /> Resumir
        </button>
      </header>

      <div ref={scrollRef} style={{
        flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 4,
        background: isWa ? 'var(--ok-soft)' : 'transparent',
      }}>
        <div style={{ alignSelf: 'center', marginBottom: 10 }}>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)', background: 'var(--surface)', borderRadius: 99, padding: '3px 12px', border: '1px solid var(--border)' }}>hoje · 10 jun</span>
        </div>
        {messages.map((m, i) => {
          if (m.ai) return (
            <div key={i} style={{ alignSelf: 'center', maxWidth: '78%', margin: '8px 0', animation: 'sogi-pop .15s ease' }}>
              <div style={{ background: 'var(--accent-soft)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 14px', fontSize: 12.5, lineHeight: 1.55, color: 'var(--text-2)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--accent-text)', marginBottom: 4, fontSize: 11.5 }}>
                  <Icon d={ICONS.ai} size={12} /> Resumo da IA
                </span>
                {m.text}
              </div>
            </div>
          );
          const mine = m.mine;
          return (
            <div key={i} className="sogi-msg-row" style={{
              display: 'flex', gap: 8, flexDirection: mine ? 'row-reverse' : 'row',
              alignItems: 'flex-end', marginBottom: reactions[i] ? 16 : 6, animation: 'sogi-pop .15s ease', position: 'relative',
            }}>
              {!mine && !isWa && m.who && <Avatar person={m.who} size={26} />}
              <div style={{ maxWidth: '64%', position: 'relative' }}>
                {!mine && !isWa && m.who && conv.kind !== 'dm' && (
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: SOGI_DATA.people[m.who] ? SOGI_DATA.people[m.who].color : 'var(--text-3)', display: 'block', marginBottom: 2, marginLeft: 4 }}>
                    {SOGI_DATA.people[m.who].name.split(' ')[0]}
                  </span>
                )}
                <div onDoubleClick={() => react(i, '👍')}
                  onContextMenu={e => window.SOGI_CTX(e, [
                    { label: 'Reagir 👍', onClick: () => react(i, '👍') },
                    { label: 'Reagir ❤️', onClick: () => react(i, '❤️') },
                    { label: 'Reagir 😂', onClick: () => react(i, '😂') },
                    { label: 'Responder', icon: 'chat', onClick: () => window.SOGI_TOAST('Respondendo à mensagem', 'info') },
                    { label: 'Copiar texto', icon: 'docs', onClick: () => window.SOGI_TOAST('Texto copiado') },
                    '-',
                    { label: 'Apagar para mim', icon: 'trash', danger: true, onClick: () => window.SOGI_TOAST('Mensagem apagada', 'warn') },
                  ])}
                  style={{
                    background: mine ? (isWa ? '#16a34a' : 'var(--accent)') : 'var(--surface)',
                    color: mine ? '#fff' : 'var(--text)',
                    borderRadius: mine ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                    padding: m.audio ? '8px 12px' : '8px 12px', fontSize: 13, lineHeight: 1.5,
                    boxShadow: 'var(--shadow-card)', cursor: 'default',
                  }}>
                  {m.audio ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <button onClick={() => window.SOGI_TOAST('Reproduzindo áudio…', 'info')} style={{
                        width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}><Icon d={ICONS.play} size={12} /></button>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {[6, 11, 8, 14, 9, 13, 7, 12, 8, 10, 6, 9, 13, 8, 5].map((h, j) => (
                          <span key={j} style={{ width: 2.5, height: h, borderRadius: 2, background: 'rgba(255,255,255,0.75)' }}></span>
                        ))}
                      </span>
                      <span className="mono" style={{ fontSize: 10, opacity: 0.85 }}>{m.audio}</span>
                    </span>
                  ) : (
                    <MsgRich text={m.text} light={mine} />
                  )}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginLeft: 8, verticalAlign: 'bottom' }}>
                    <span className="mono" style={{ fontSize: 8.5, opacity: 0.7 }}>{m.when}</span>
                    {mine && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: m.read ? (isWa ? '#bfdbfe' : '#bfdbfe') : 'rgba(255,255,255,0.6)' }}>✓✓</span>
                    )}
                  </span>
                </div>
                {reactions[i] && (
                  <span style={{
                    position: 'absolute', bottom: -13, [mine ? 'right' : 'left']: 8,
                    background: 'var(--surface)', borderRadius: 99, padding: '1px 6px', fontSize: 11,
                    boxShadow: 'var(--shadow-card)', animation: 'sogi-pop .2s cubic-bezier(.3,1.5,.6,1)',
                  }}>{reactions[i]}</span>
                )}
              </div>
            </div>
          );
        })}
        {recording && (
          <div style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--danger-soft)', borderRadius: 99, padding: '6px 14px', animation: 'sogi-pop .15s ease' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', animation: 'sogi-rt-pulse 1s infinite' }}></span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 700 }}>gravando… 0:03</span>
          </div>
        )}
      </div>

      <footer style={{ padding: '10px 20px 14px', background: 'var(--surface)', borderTop: '1px solid var(--border)', position: 'relative' }}>
        {pickerOpen && (
          <div style={{
            position: 'absolute', bottom: 'calc(100% + 6px)', left: 18, background: 'var(--surface)',
            borderRadius: 12, boxShadow: 'var(--shadow-pop)', padding: 10, zIndex: 30, animation: 'sogi-pop .15s ease',
            display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, width: 230,
          }}>
            {SOGI_DATA.stickers.map(s => (
              <button key={s} onClick={() => send(s)} style={{ fontSize: 20, padding: 5, borderRadius: 8, transition: 'transform .1s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.3)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>{s}</button>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg)', borderRadius: 12, padding: '5px 5px 5px 8px' }}>
          <button onClick={() => setPickerOpen(o => !o)} title="Emojis e stickers" style={{ color: pickerOpen ? 'var(--accent-text)' : 'var(--text-3)', display: 'flex', padding: 6 }}>
            <Icon d={ICONS.smile} size={18} />
          </button>
          <button title="Anexar arquivo" onClick={() => window.SOGI_TOAST('Selecione o arquivo para enviar', 'info')} style={{ color: 'var(--text-3)', display: 'flex', padding: 6 }}>
            <Icon d={ICONS.paperclip} size={16} />
          </button>
          <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={`Mensagem ${isWa ? 'para o cliente (WhatsApp)' : ''}… use @ para mencionar`}
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13, minWidth: 0, padding: '7px 0' }} />
          {draft.trim() ? (
            <button onClick={() => send()} style={{
              width: 36, height: 36, borderRadius: 9, background: isWa ? '#16a34a' : 'var(--accent)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}><Icon d={ICONS.send} size={15} /></button>
          ) : (
            <button onMouseDown={() => setRecording(true)} onMouseUp={sendAudio} onMouseLeave={() => recording && sendAudio()}
              title="Segure para gravar áudio" style={{
              width: 36, height: 36, borderRadius: 9, background: recording ? 'var(--danger)' : (isWa ? '#16a34a' : 'var(--accent)'), color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .15s',
            }}><Icon d={ICONS.mic} size={16} /></button>
          )}
        </div>
        <p className="mono" style={{ margin: '6px 0 0', fontSize: 9, color: 'var(--text-3)', textAlign: 'center' }}>
          duplo clique reage 👍 · botão direito abre ações · segure o microfone para gravar áudio
        </p>
      </footer>
    </div>
  );
}

/* ============ Webmail (estilo Outlook clássico) ============ */
const MAIL_FOLDERS = [
  { id: 'entrada', label: 'Caixa de entrada', icon: 'inbox' },
  { id: 'rascunhos', label: 'Rascunhos', icon: 'draft' },
  { id: 'enviados', label: 'Enviados', icon: 'send' },
  { id: 'excluidos', label: 'Excluídos', icon: 'trash' },
];

function WebmailView({ openId: openProp, onOpenId }) {
  const [folder, setFolder] = useStateC('entrada');
  const [openLocal, setOpenLocal] = useStateC('m1');
  const openId = openProp ?? openLocal;
  const setOpenId = (id) => { setOpenLocal(id); onOpenId && onOpenId(id); };
  const [reply, setReply] = useStateC('');
  const list = SOGI_DATA.emails[folder] || [];
  const open = list.find(m => m.id === openId) || list[0];

  return (
    <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
      {/* Rail de ícones */}
      <div style={{ width: 52, flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 10, gap: 4 }}>
        {MAIL_FOLDERS.map(f => {
          const isActive = folder === f.id;
          const count = (SOGI_DATA.emails[f.id] || []).length;
          return (
            <button key={f.id} onClick={() => { setFolder(f.id); setOpenId((SOGI_DATA.emails[f.id] || [])[0]?.id); }} title={f.label} style={{
              width: 38, height: 38, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isActive ? 'var(--violet-soft)' : 'transparent',
              color: isActive ? 'var(--violet)' : 'var(--text-3)', position: 'relative', transition: 'all .12s',
            }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-2)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
              <Icon d={ICONS[f.icon]} size={17} />
              {f.id === 'entrada' && count > 0 && (
                <span style={{ position: 'absolute', top: 2, right: 2, minWidth: 14, height: 14, borderRadius: 7, background: 'var(--violet)', color: '#fff', fontSize: 8.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>{count}</span>
              )}
            </button>
          );
        })}
        <span style={{ flex: 1 }}></span>
        <button title="Escrever novo e-mail" onClick={() => window.SOGI_TOAST('Novo e-mail — compositor aberto', 'info')} style={{
          width: 38, height: 38, borderRadius: 9, background: 'var(--violet)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
        }}><Icon d={ICONS.plus} size={17} /></button>
      </div>

      {/* Lista de mensagens */}
      <div style={{ width: 280, flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--surface-2)', overflowY: 'auto' }}>
        <div style={{ padding: '12px 14px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <strong style={{ fontSize: 13 }}>{MAIL_FOLDERS.find(f => f.id === folder).label}</strong>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{list.length}</span>
          <span style={{ flex: 1 }}></span>
          <Badge tone="violet">rafael@its.com.br</Badge>
        </div>
        {list.length === 0 && <p className="mono" style={{ padding: 16, fontSize: 10.5, color: 'var(--text-3)', textAlign: 'center' }}>pasta vazia</p>}
        {list.map(m => {
          const isOpen = open && open.id === m.id;
          return (
            <button key={m.id} onClick={() => setOpenId(m.id)}
              onContextMenu={e => window.SOGI_CTX(e, [
                { label: 'Abrir', icon: 'mail', onClick: () => setOpenId(m.id) },
                { label: 'Marcar como não lido', icon: 'inbox', onClick: () => window.SOGI_TOAST('Marcado como não lido') },
                { label: 'Encaminhar', icon: 'send', onClick: () => window.SOGI_TOAST('Encaminhando e-mail…', 'info') },
                '-',
                { label: 'Excluir', icon: 'trash', danger: true, onClick: () => window.SOGI_TOAST('Movido para Excluídos', 'warn') },
              ])}
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '11px 14px',
                borderBottom: '1px solid var(--border)',
                background: isOpen ? 'var(--surface)' : 'transparent',
                borderLeft: isOpen ? '3px solid var(--violet)' : '3px solid transparent',
              }}
              onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.55)'; }}
              onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = 'transparent'; }}>
              <span style={{ display: 'flex', justifyContent: 'space-between', gap: 6, marginBottom: 2 }}>
                <strong style={{ fontSize: 12, fontWeight: m.unread ? 750 : 550, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.from}</strong>
                <span className="mono" style={{ fontSize: 9, color: 'var(--text-3)', flexShrink: 0 }}>{m.when}</span>
              </span>
              <span style={{ display: 'block', fontSize: 11.5, fontWeight: m.unread ? 650 : 450, color: m.unread ? 'var(--violet)' : 'var(--text-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.subject}</span>
              <span style={{ display: 'block', fontSize: 10.5, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>{m.preview}</span>
            </button>
          );
        })}
      </div>

      {/* Leitura em cima + compor embaixo (Outlook clássico) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {open ? (
          <>
            <div style={{ flex: 1.4, overflowY: 'auto', minHeight: 0, borderBottom: '1px solid var(--border)' }}>
              <header style={{ padding: '14px 22px 12px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                <h2 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700 }}>{open.subject}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 30, height: 30, borderRadius: '50%', background: 'var(--violet)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                  }}>{open.from.slice(0, 1)}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ fontSize: 12.5, display: 'block' }}>{open.from}</strong>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{open.addr} · {open.when}</span>
                  </span>
                  <GhostBtn icon="send" onClick={() => window.SOGI_TOAST('Encaminhando e-mail…', 'info')}>Encaminhar</GhostBtn>
                  <GhostBtn icon="tasks" onClick={() => { window.SOGI_NEW_TASK(); }}>Criar tarefa</GhostBtn>
                </div>
              </header>
              <div style={{ padding: '16px 22px', fontSize: 13.5, lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-line' }}>
                {open.body}
              </div>
            </div>
            {/* Composer fixo embaixo */}
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
              <div style={{ padding: '9px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 9 }}>
                <Badge tone="violet">Responder</Badge>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)' }}>para: {open.addr}</span>
                <span style={{ flex: 1 }}></span>
                <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>assinatura: ITS padrão ✓</span>
              </div>
              <textarea value={reply} onChange={e => setReply(e.target.value)}
                placeholder={`Escreva sua resposta para ${open.from.split(' ')[0]}…`}
                style={{
                  flex: 1, border: 'none', outline: 'none', resize: 'none', padding: '12px 22px',
                  fontSize: 13, lineHeight: 1.6, fontFamily: 'var(--font-ui)', background: 'transparent', color: 'var(--text)', minHeight: 0,
                }} />
              <div style={{ padding: '10px 22px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
                <PrimaryBtn icon="send" onClick={() => { if (reply.trim()) { window.SOGI_TOAST('E-mail enviado com a assinatura ITS'); setReply(''); } else window.SOGI_TOAST('Escreva a resposta primeiro', 'warn'); }}>Enviar</PrimaryBtn>
                <GhostBtn icon="paperclip" onClick={() => window.SOGI_TOAST('Anexar arquivo ao e-mail', 'info')}>Anexar</GhostBtn>
                <GhostBtn icon="ai" onClick={() => setReply('Olá!\n\nObrigado pelo retorno. Confirmo o recebimento e retorno ainda hoje com os próximos passos.\n\nAbraço,\nRafael Souza · ITS Tecnologia')}>Rascunho com IA</GhostBtn>
                <span style={{ flex: 1 }}></span>
                <button onClick={() => { setReply(''); window.SOGI_TOAST('Rascunho descartado', 'warn'); }} style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)' }}>Descartar</button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>selecione uma mensagem</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ E-mail aberto individualmente (caixa unificada) ============ */
function EmailSingleView({ emailId, onOpenBox }) {
  const m = SOGI_DATA.emails.entrada.find(x => x.id === emailId) || SOGI_DATA.emails.entrada[0];
  const [reply, setReply] = useStateC('');
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <header style={{ padding: '12px 22px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 11 }}>
        <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--violet)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{m.from.slice(0, 1)}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <strong style={{ fontSize: 13.5, display: 'block' }}>{m.from}</strong>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{m.addr} · {m.when} · via e-mail</span>
        </span>
        <Badge tone="violet"><Icon d={ICONS.mail} size={10} /> e-mail</Badge>
        <GhostBtn icon="inbox" onClick={onOpenBox}>Abrir caixa completa</GhostBtn>
      </header>
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 24px' }}>
        <h2 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 700, lineHeight: 1.4 }}>{m.subject}</h2>
        <div style={{ background: 'var(--surface)', borderRadius: 12, boxShadow: 'var(--shadow-card)', padding: '16px 20px', fontSize: 13.5, lineHeight: 1.7, whiteSpace: 'pre-line', maxWidth: 720 }}>
          {m.body}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <GhostBtn icon="send" onClick={() => window.SOGI_TOAST('Encaminhando e-mail…', 'info')}>Encaminhar</GhostBtn>
          <GhostBtn icon="tasks" onClick={() => window.SOGI_NEW_TASK()}>Criar tarefa</GhostBtn>
          <GhostBtn icon="ai" onClick={() => setReply('Olá!\n\nObrigado pelo retorno. Confirmo o recebimento e retorno ainda hoje com os próximos passos.\n\nAbraço,\nRafael Souza · ITS Tecnologia')}>Rascunho com IA</GhostBtn>
        </div>
      </div>
      <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ padding: '9px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 9 }}>
          <Badge tone="violet">Responder</Badge>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)' }}>para: {m.addr}</span>
          <span style={{ flex: 1 }}></span>
          <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>assinatura: ITS padrão ✓</span>
        </div>
        <textarea value={reply} onChange={e => setReply(e.target.value)} rows={3}
          placeholder={`Responder a ${m.from.split(' ')[0]}…`}
          style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', padding: '12px 22px', fontSize: 13, lineHeight: 1.6, fontFamily: 'var(--font-ui)', background: 'transparent', color: 'var(--text)', boxSizing: 'border-box' }} />
        <div style={{ padding: '0 22px 14px', display: 'flex', gap: 8 }}>
          <PrimaryBtn icon="send" onClick={() => { if (reply.trim()) { window.SOGI_TOAST('E-mail enviado com a assinatura ITS'); setReply(''); } else window.SOGI_TOAST('Escreva a resposta primeiro', 'warn'); }}>Enviar</PrimaryBtn>
          <GhostBtn icon="paperclip" onClick={() => window.SOGI_TOAST('Anexar arquivo ao e-mail', 'info')}>Anexar</GhostBtn>
        </div>
      </footer>
    </div>
  );
}

/* ============ Item de canal (chamados / tarefas na caixa unificada) ============ */
function ChannelItemView({ item, onNavigate }) {
  const meta = MEDIA_META[item.media];
  const [replies, setReplies] = useStateC([]);
  const [draft, setDraft] = useStateC('');
  const isTask = item.action === 'task';
  const send = () => {
    if (!draft.trim()) return;
    setReplies(rs => [...rs, { text: draft.trim(), when: 'agora' }]);
    window.SOGI_TOAST(isTask
      ? 'Comentário enviado na tarefa — participantes notificados'
      : 'Resposta registrada no chamado — solicitante notificado');
    setDraft('');
  };
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <header style={{ padding: '12px 22px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 11 }}>
        <span style={{ width: 34, height: 34, borderRadius: 9, background: meta.color + '22', color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon d={ICONS[meta.icon]} size={16} />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <strong style={{ fontSize: 13.5, display: 'block' }}>{item.name}</strong>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>canal: {meta.label} · {item.when}</span>
        </span>
        <Badge tone={item.media === 'chamados' ? 'warn' : 'violet'}><Icon d={ICONS[meta.icon]} size={10} /> {meta.label}</Badge>
      </header>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <div style={{ background: 'var(--surface)', borderRadius: 12, boxShadow: 'var(--shadow-card)', padding: '16px 20px', fontSize: 13.5, lineHeight: 1.7, whiteSpace: 'pre-line', maxWidth: 680 }}>
          {item.body}
        </div>
        {/* respostas enviadas daqui */}
        {replies.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginTop: 14, maxWidth: 680, flexDirection: 'row-reverse', animation: 'sogi-pop .15s ease' }}>
            <Avatar person="rafael" size={28} />
            <div style={{ maxWidth: '75%' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 3, flexDirection: 'row-reverse' }}>
                <strong style={{ fontSize: 11.5 }}>Você</strong>
                <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>{r.when}</span>
                <Badge tone={isTask ? 'violet' : 'warn'}>{isTask ? 'comentário na tarefa' : 'resposta no chamado'}</Badge>
              </div>
              <div style={{ background: meta.color, color: '#fff', borderRadius: '12px 4px 12px 12px', padding: '9px 13px', fontSize: 13, lineHeight: 1.5 }}>{r.text}</div>
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          {item.action === 'chamados' ? (
            <PrimaryBtn icon="tickets" onClick={() => onNavigate && onNavigate('chamados')}>{item.actionLabel}</PrimaryBtn>
          ) : (
            <PrimaryBtn icon="tasks" onClick={() => window.SOGI_OPEN_TASK && window.SOGI_OPEN_TASK()}>{item.actionLabel}</PrimaryBtn>
          )}
          <GhostBtn icon="check" onClick={() => window.SOGI_TOAST('Notificação marcada como lida')}>Marcar como lida</GhostBtn>
          <GhostBtn icon="bell" onClick={() => window.SOGI_TOAST('Notificações deste item silenciadas por 1 dia', 'info')}>Silenciar</GhostBtn>
        </div>
      </div>
      {/* Composer: responde direto no canal */}
      <footer style={{ padding: '10px 22px 14px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg)', borderRadius: 12, padding: '5px 5px 5px 14px' }}>
          <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={isTask ? 'Comentar na tarefa… o retorno vai para os participantes' : 'Responder no chamado… o solicitante é notificado'}
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13, minWidth: 0, padding: '7px 0' }} />
          <button title="Anexar" onClick={() => window.SOGI_TOAST('Selecione o arquivo para anexar', 'info')} style={{ color: 'var(--text-3)', display: 'flex', padding: 6 }}>
            <Icon d={ICONS.paperclip} size={15} />
          </button>
          <button onClick={send} style={{
            width: 36, height: 36, borderRadius: 9, background: meta.color, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}><Icon d={ICONS.send} size={15} /></button>
        </div>
        <p className="mono" style={{ margin: '6px 0 0', fontSize: 9, color: 'var(--text-3)', textAlign: 'center' }}>
          {isTask ? 'sua resposta vira comentário na tarefa — sem sair da comunicação' : 'sua resposta vai para a thread do chamado — sem sair da comunicação'}
        </p>
      </footer>
    </div>
  );
}

/* ============ Supervisão (admin) ============ */
function SupervisionView({ sup }) {
  const scrollRef = useRefC(null);
  useEffectC(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [sup]);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <div style={{
        background: 'var(--warn-soft)', borderBottom: '1px solid var(--border)', padding: '9px 20px',
        display: 'flex', alignItems: 'center', gap: 9, fontSize: 12, color: 'var(--warn)', fontWeight: 600,
      }}>
        <Icon d={ICONS.shield} size={14} />
        Modo supervisão — leitura somente. Este acesso fica registrado na auditoria.
      </div>
      <header style={{
        padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <AvatarStack ids={sup.participants} size={28} />
        <div>
          <strong style={{ fontSize: 13.5, display: 'block' }}>
            {sup.participants.map(p => SOGI_DATA.people[p].name).join(' × ')}
          </strong>
          <span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>conversa individual · {sup.msgs} mensagens</span>
        </div>
        <span style={{ flex: 1 }}></span>
        {sup.flag && <Badge tone="danger" dot>relacionada a SLA</Badge>}
        <button onClick={() => window.SOGI_TOAST('Transcrição exportada — registrado na auditoria', 'warn')} style={{
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600,
          color: 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 11px',
        }}>
          <Icon d={ICONS.download} size={13} /> Exportar transcrição
        </button>
      </header>
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {sup.messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, animation: 'sogi-pop .15s ease' }}>
            <Avatar person={m.who} size={30} />
            <div style={{ maxWidth: '62%' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 3 }}>
                <strong style={{ fontSize: 11.5 }}>{SOGI_DATA.people[m.who].name.split(' ')[0]}</strong>
                <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>{m.when}</span>
              </div>
              <div style={{
                background: 'var(--surface)', color: 'var(--text)', borderRadius: '4px 14px 14px 14px',
                padding: '9px 13px', fontSize: 13, lineHeight: 1.5, boxShadow: 'var(--shadow-card)',
              }}>{m.text}</div>
            </div>
          </div>
        ))}
        <div style={{ alignSelf: 'center', marginTop: 6 }}>
          <span className="mono" style={{ fontSize: 10, color: 'var(--warn)', background: 'var(--warn-soft)', borderRadius: 99, padding: '3px 12px' }}>
            visualização de auditoria · sem permissão de envio
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Modal: nova conversa ---------- */
function NewConversationModal({ onClose, onCreate }) {
  const [sel, setSel] = useStateC([]);
  const [groupName, setGroupName] = useStateC('');
  const toggle = (id) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const create = () => {
    if (sel.length === 0) { window.SOGI_TOAST('Selecione pelo menos uma pessoa', 'warn'); return; }
    if (sel.length > 1 && !groupName.trim()) { window.SOGI_TOAST('Dê um nome ao grupo', 'warn'); return; }
    onCreate(sel, groupName.trim());
  };
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(24,60,90,0.45)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'sogi-pop .15s ease' }}>
      <div data-screen-label="Nova conversa" onClick={e => e.stopPropagation()} style={{ width: 420, maxWidth: '94vw', background: 'var(--surface)', borderRadius: 14, boxShadow: 'var(--shadow-pop)', animation: 'sogi-pop .2s cubic-bezier(.3,1.3,.6,1)' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '15px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--accent-text)', display: 'flex' }}><Icon d={ICONS.chat} size={16} /></span>
          <strong style={{ fontSize: 14 }}>Nova conversa</strong>
          <span style={{ flex: 1 }}></span>
          <button onClick={onClose} style={{ color: 'var(--text-3)', display: 'flex', padding: 4 }}><Icon d={ICONS.x} size={15} /></button>
        </header>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 13 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>Com quem? {sel.length > 0 && <span className="mono" style={{ color: 'var(--accent-text)' }}>· {sel.length} selecionado(s)</span>}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 260, overflowY: 'auto' }}>
            {Object.values(SOGI_DATA.people).filter(p => p.id !== 'rafael').map(p => {
              const on = sel.includes(p.id);
              return (
                <button key={p.id} onClick={() => toggle(p.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', borderRadius: 9, padding: '8px 10px',
                  border: on ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                  background: on ? 'var(--accent-soft)' : 'transparent', transition: 'all .12s',
                }}>
                  <Avatar person={p.id} size={28} showStatus />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ fontSize: 12.5, display: 'block' }}>{p.name}</strong>
                    <span style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{p.role}</span>
                  </span>
                  {on && <Icon d={ICONS.check} size={15} sw={2.4} style={{ color: 'var(--accent-text)' }} />}
                </button>
              );
            })}
          </div>
          {sel.length > 1 && (
            <input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Nome do grupo (ex.: Virada ERP — war room)"
              style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', background: 'var(--surface)', color: 'var(--text)' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          )}
        </div>
        <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '13px 20px', borderTop: '1px solid var(--border)' }}>
          <GhostBtn onClick={onClose}>Cancelar</GhostBtn>
          <PrimaryBtn icon="chat" onClick={create}>{sel.length > 1 ? 'Criar grupo' : 'Iniciar conversa'}</PrimaryBtn>
        </footer>
      </div>
    </div>
  );
}

Object.assign(window, { ChatScreen, WebmailView, ConversationView, SupervisionView, EmailSingleView, ChannelItemView, NewConversationModal });
