// SOGI — Central de IA: chat com base de conhecimento (RAG sobre documentos dos projetos)
const { useState: useStateIA, useRef: useRefIA, useEffect: useEffectIA } = React;

// renderiza **negrito** simples
function IARich({ text }) {
  const parts = text.split('**');
  return <>{parts.map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : <React.Fragment key={i}>{p}</React.Fragment>)}</>;
}

function AIScreen() {
  const [msgs, setMsgs] = useStateIA(SOGI_DATA.aiChat);
  const [input, setInput] = useStateIA('');
  const [typing, setTyping] = useStateIA(false);
  const [scope, setScope] = useStateIA('todos');
  const cannedIdx = useRefIA(0);
  const scrollRef = useRefIA(null);

  useEffectIA(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, typing]);

  const ask = (q) => {
    const question = (q ?? input).trim();
    if (!question) return;
    setMsgs(ms => [...ms, { who: 'user', text: question }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const resp = SOGI_DATA.aiCanned[cannedIdx.current % SOGI_DATA.aiCanned.length];
      cannedIdx.current++;
      setTyping(false);
      setMsgs(ms => [...ms, { who: 'ai', text: resp.text, sources: resp.sources }]);
    }, 1100);
  };

  const kb = SOGI_DATA.kb.filter(d => scope === 'todos' || d.project === scope);
  const suggestions = ['Qual o prazo contratual da virada?', 'Riscos abertos da LGPD?', 'O que ficou acordado na reunião do NOC?'];

  return (
    <div data-screen-label="Central de IA" style={{ display: 'flex', flex: 1, minHeight: 0, animation: 'sogi-fade-up .25s ease' }}>
      {/* Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ padding: '14px 22px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 11 }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-soft)', color: 'var(--accent-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon d={ICONS.ai} size={18} />
          </span>
          <div>
            <strong style={{ fontSize: 14, display: 'block' }}>Assistente SOGI</strong>
            <span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>responde com base nos documentos indexados · cita as fontes</span>
          </div>
          <span style={{ flex: 1 }}></span>
          <Badge tone="ok" dot>online</Badge>
        </header>

        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {msgs.map((m, i) => m.who === 'user' ? (
            <div key={i} style={{ alignSelf: 'flex-end', display: 'flex', gap: 10, flexDirection: 'row-reverse', maxWidth: '70%', animation: 'sogi-pop .15s ease' }}>
              <Avatar person="rafael" size={30} />
              <div style={{ background: 'var(--nav-bg)', color: '#fff', borderRadius: '14px 4px 14px 14px', padding: '10px 14px', fontSize: 13, lineHeight: 1.55 }}>{m.text}</div>
            </div>
          ) : (
            <div key={i} style={{ display: 'flex', gap: 10, maxWidth: '78%', animation: 'sogi-pop .15s ease' }}>
              <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--accent-soft)', color: 'var(--accent-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon d={ICONS.ai} size={15} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ background: 'var(--surface)', borderRadius: '4px 14px 14px 14px', padding: '11px 15px', fontSize: 13, lineHeight: 1.6, color: 'var(--text)', boxShadow: 'var(--shadow-card)' }}>
                  <IARich text={m.text} />
                </div>
                {m.sources && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 7, flexWrap: 'wrap' }}>
                    {m.sources.map((s, j) => (
                      <button key={j} onClick={() => window.SOGI_TOAST('Abrindo trecho citado do documento…', 'info')} style={{
                        display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 600,
                        color: 'var(--accent-text)', background: 'var(--accent-soft)', borderRadius: 99, padding: '3px 10px',
                      }}>
                        <Icon d={ICONS.file} size={10} /> {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {typing && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', animation: 'sogi-pop .15s ease' }}>
              <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--accent-soft)', color: 'var(--accent-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon d={ICONS.ai} size={15} />
              </span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>consultando a base de conhecimento…</span>
            </div>
          )}
        </div>

        <footer style={{ padding: '12px 22px 16px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 9, flexWrap: 'wrap' }}>
            {suggestions.map(s => (
              <button key={s} onClick={() => ask(s)} style={{
                fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)', border: '1px solid var(--border)',
                borderRadius: 99, padding: '4px 12px', transition: 'all .12s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent-text)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}>{s}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg)', borderRadius: 12, padding: '5px 5px 5px 16px' }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask()}
              placeholder="Pergunte sobre projetos, contratos, atas, riscos…"
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13.5, minWidth: 0, padding: '8px 0' }} />
            <button onClick={() => ask()} style={{
              width: 38, height: 38, borderRadius: 9, background: 'var(--accent)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}><Icon d={ICONS.send} size={16} /></button>
          </div>
        </footer>
      </div>

      {/* Base de conhecimento */}
      <aside style={{ width: 300, flexShrink: 0, borderLeft: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ padding: '16px 16px 10px' }}>
          <strong style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}>
            <Icon d={ICONS.docs} size={14} /> Base de conhecimento
          </strong>
          <p style={{ margin: '5px 0 12px', fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5 }}>Documentos dos projetos são indexados automaticamente e viram contexto da IA.</p>
          <select value={scope} onChange={e => setScope(e.target.value)} style={{
            width: '100%', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px',
            fontSize: 12.5, fontFamily: 'var(--font-ui)', color: 'var(--text)', background: 'var(--surface)',
          }}>
            <option value="todos">Escopo: todos os projetos</option>
            {['ERP-MIG', 'PORTAL', 'NOC-24', 'LGPD', 'Infra'].map(p => <option key={p} value={p}>Escopo: {p}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
          {kb.map((d, i) => (
            <div key={i} style={{ display: 'flex', gap: 9, padding: '10px 8px', borderRadius: 8, alignItems: 'flex-start' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{
                width: 26, height: 26, borderRadius: 7, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: d.status === 'indexado' ? 'var(--ok-soft)' : 'var(--surface-2)',
                color: d.status === 'indexado' ? 'var(--ok)' : 'var(--text-3)',
              }}>
                <Icon d={d.status === 'indexado' ? ICONS.check : ICONS.alert} size={12} sw={2.2} />
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 11.5, fontWeight: 600, lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</span>
                <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>
                  {d.project} · {d.status === 'indexado' ? `${d.chunks} trechos` : d.status}
                </span>
              </span>
            </div>
          ))}
        </div>
        <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
          <button onClick={() => window.SOGI_TOAST('Re-indexação da base iniciada — 6 documentos na fila', 'info')} style={{
            width: '100%', border: '1.5px dashed var(--border-strong)', borderRadius: 9, padding: '9px 0',
            fontSize: 12, fontWeight: 600, color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}>
            <Icon d={ICONS.refresh} size={13} /> Re-indexar base
          </button>
        </div>
      </aside>
    </div>
  );
}

Object.assign(window, { AIScreen });
