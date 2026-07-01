// SOGI — Documentos: pastas gerais + pastas de projeto + criação de documentos e diagramas
const { useState: useStateDOC, useRef: useRefDOC } = React;

const DOC_ICON = {
  pdf: { tone: 'danger', label: 'PDF' },
  doc: { tone: 'accent', label: 'DOC' },
  sheet: { tone: 'ok', label: 'XLS' },
  design: { tone: 'violet', label: 'FIG' },
  diagram: { tone: 'warn', label: 'DGM' },
};

function DocumentsScreen() {
  const [view, setView] = useStateDOC({ kind: 'all' }); // all | folder | project
  const [createOpen, setCreateOpen] = useStateDOC(false);
  const [editorOpen, setEditorOpen] = useStateDOC(null); // null | 'rede' | 'fluxo'
  const [extraDocs, setExtraDocs] = useStateDOC([]);

  const createDoc = (type, name) => {
    setExtraDocs(ds => [{ name, type, size: '—', owner: 'rafael', when: 'agora', folder: 'Projetos' }, ...ds]);
    window.SOGI_TOAST(`"${name}" criado na pasta atual`);
  };

  let docs, title;
  if (view.kind === 'all') { docs = [...extraDocs, ...SOGI_DATA.docs]; title = 'Todos os arquivos'; }
  else if (view.kind === 'folder') { docs = [...extraDocs, ...SOGI_DATA.docs].filter(d => d.folder === view.name); title = view.name; }
  else { docs = [...extraDocs, ...(SOGI_DATA.projectDocs[view.id] || [])]; title = SOGI_DATA.projects.find(p => p.id === view.id).name; }

  return (
    <div data-screen-label="Documentos" style={{ padding: 24, overflowY: 'auto', flex: 1, animation: 'sogi-fade-up .25s ease' }}>
      <PageHeader title="Documentos" subtitle="89 arquivos · 2,1 GB de 50 GB usados · base de apoio técnico e setorial"
        actions={
          <div style={{ position: 'relative', display: 'flex', gap: 8 }}>
            <GhostBtn icon="arrowUp" onClick={() => window.SOGI_TOAST('Selecione arquivos para enviar', 'info')}>Enviar</GhostBtn>
            <PrimaryBtn icon="plus" onClick={() => setCreateOpen(o => !o)}>Criar</PrimaryBtn>
            {createOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 250, background: 'var(--surface)', borderRadius: 12, boxShadow: 'var(--shadow-pop)', zIndex: 40, animation: 'sogi-pop .15s ease', overflow: 'hidden' }}>
                {[
                  ['Documento de texto', 'docs', () => createDoc('doc', 'Novo documento.docx')],
                  ['Planilha', 'reports', () => createDoc('sheet', 'Nova planilha.xlsx')],
                  ['Fluxograma de processo', 'flow', () => setEditorOpen('fluxo')],
                  ['Mapa de rede / topologia', 'server', () => setEditorOpen('rede')],
                ].map(([label, icon, fn], i) => (
                  <button key={label} onClick={() => { setCreateOpen(false); fn(); }} style={{
                    display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px', width: '100%', textAlign: 'left',
                    fontSize: 12.5, fontWeight: 550, color: 'var(--text-2)', borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <span style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--accent-soft)', color: 'var(--accent-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon d={ICONS[icon]} size={14} />
                    </span>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        } />

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 14, alignItems: 'start' }}>
        {/* Navegação de pastas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card pad={false}>
            <button onClick={() => setView({ kind: 'all' })} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px var(--pad)', width: '100%', textAlign: 'left',
              background: view.kind === 'all' ? 'var(--accent-soft)' : 'transparent', fontWeight: view.kind === 'all' ? 650 : 500, fontSize: 12.5,
              color: view.kind === 'all' ? 'var(--accent-text)' : 'var(--text-2)',
            }}>
              <Icon d={ICONS.docs} size={15} /> Todos os arquivos
            </button>
            {SOGI_DATA.docFolders.map(f => {
              const active = view.kind === 'folder' && view.name === f.name;
              return (
                <button key={f.id} onClick={() => setView({ kind: 'folder', name: f.name })} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px var(--pad)', width: '100%', textAlign: 'left',
                  borderTop: '1px solid var(--border)', fontSize: 12.5,
                  background: active ? 'var(--accent-soft)' : 'transparent', fontWeight: active ? 650 : 500,
                  color: active ? 'var(--accent-text)' : 'var(--text-2)',
                }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                  <Icon d={ICONS.folder} size={15} />
                  <span style={{ flex: 1 }}>{f.name}</span>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{f.count}</span>
                </button>
              );
            })}
          </Card>

          {/* Pastas de projeto */}
          <Card title="Pastas de projeto" pad={false}>
            {SOGI_DATA.projects.map((p, i) => {
              const active = view.kind === 'project' && view.id === p.id;
              return (
                <button key={p.id} onClick={() => setView({ kind: 'project', id: p.id })} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px var(--pad)', width: '100%', textAlign: 'left',
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none', fontSize: 12.5,
                  background: active ? 'var(--accent-soft)' : 'transparent', fontWeight: active ? 650 : 500,
                  color: active ? 'var(--accent-text)' : 'var(--text-2)',
                }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                  <span className="mono" style={{
                    fontSize: 8.5, fontWeight: 700, borderRadius: 4, padding: '3px 5px', flexShrink: 0,
                    background: (SOGI_DATA.projColors[p.code] || 'var(--accent)') + '22', color: SOGI_DATA.projColors[p.code] || 'var(--accent-text)',
                  }}>{p.code}</span>
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{(SOGI_DATA.projectDocs[p.id] || []).length}</span>
                </button>
              );
            })}
          </Card>
        </div>

        {/* Arquivos */}
        <div>
          {view.kind === 'project' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <SectionLabel>{title} — documentos do projeto</SectionLabel>
              <span style={{ flex: 1 }}></span>
              <Badge tone="accent"><Icon d={ICONS.ai} size={10} /> indexado na base de conhecimento</Badge>
            </div>
          )}
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                  {['Nome', 'Dono', 'Tamanho', 'Modificado', ''].map((h, i) => (
                    <th key={i} style={{ textAlign: 'left', padding: '9px 14px', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docs.map((d, i) => {
                  const ic = DOC_ICON[d.type];
                  const isDiagram = d.type === 'diagram';
                  return (
                    <tr key={i} onClick={() => isDiagram && setEditorOpen(d.name.includes('rede') || d.name.includes('Topologia') ? 'rede' : 'fluxo')}
                      style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className="mono" style={{
                            fontSize: 8.5, fontWeight: 700, borderRadius: 5, padding: '4px 5px', letterSpacing: '0.04em',
                            background: TONE[ic.tone].bg, color: TONE[ic.tone].fg, flexShrink: 0,
                          }}>{ic.label}</span>
                          <span style={{ fontWeight: 550 }}>{d.name}</span>
                          {d.ai && <Badge tone="accent"><Icon d={ICONS.ai} size={10} /> IA</Badge>}
                          {isDiagram && <Badge tone="warn">editável</Badge>}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <Avatar person={d.owner} size={20} />{SOGI_DATA.people[d.owner].name.split(' ')[0]}
                        </span>
                      </td>
                      <td className="mono" style={{ padding: '10px 14px', fontSize: 11, color: 'var(--text-2)' }}>{d.size}</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-3)', fontSize: 12 }}>{d.when}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <button onClick={e => { e.stopPropagation(); window.SOGI_TOAST(`Baixando "${d.name}"…`); }}
                          style={{ color: 'var(--text-3)', display: 'inline-flex', padding: 5, borderRadius: 6 }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-text)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                          <Icon d={ICONS.download} size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {docs.length === 0 && (
                  <tr><td colSpan="5" className="mono" style={{ padding: 20, fontSize: 11, color: 'var(--text-3)', textAlign: 'center' }}>pasta vazia — use "Criar" para começar</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editorOpen && <DiagramEditor kind={editorOpen} onClose={() => setEditorOpen(null)}
        onSave={(name) => createDoc('diagram', name)} />}
    </div>
  );
}

/* ============ Editor de diagramas (mapa de rede / fluxo) ============ */
const NET_PALETTE = [
  { type: 'server', label: 'Servidor', icon: 'server', color: '#183c5a' },
  { type: 'firewall', label: 'Firewall', icon: 'shield', color: '#dc2626' },
  { type: 'switch', label: 'Switch', icon: 'flow', color: '#0284c7' },
  { type: 'cloud', label: 'Nuvem', icon: 'chat', color: '#64748b' },
  { type: 'db', label: 'Banco', icon: 'docs', color: '#16a34a' },
  { type: 'user', label: 'Usuários', icon: 'users', color: '#d97706' },
];

const NET_INITIAL = [
  { id: 1, type: 'cloud', label: 'Internet', x: 330, y: 30 },
  { id: 2, type: 'firewall', label: 'Firewall pfSense', x: 330, y: 130 },
  { id: 3, type: 'switch', label: 'Switch Core', x: 330, y: 230 },
  { id: 4, type: 'server', label: 'Servidor ERP', x: 130, y: 340 },
  { id: 5, type: 'db', label: 'PostgreSQL', x: 330, y: 340 },
  { id: 6, type: 'user', label: 'Estações (40)', x: 530, y: 340 },
];
const NET_LINKS = [[1, 2], [2, 3], [3, 4], [3, 5], [3, 6]];

function DiagramEditor({ kind, onClose, onSave }) {
  const [nodes, setNodes] = useStateDOC(NET_INITIAL);
  const [links, setLinks] = useStateDOC(NET_LINKS);
  const [sel, setSel] = useStateDOC(null);
  const [connecting, setConnecting] = useStateDOC(false); // false | true | nodeId
  const dragRef = useRefDOC(null);
  const nextId = useRefDOC(100);

  const onMouseDown = (e, n) => {
    if (connecting) return;
    setSel(n.id);
    const rect = e.currentTarget.closest('.dgm-canvas').getBoundingClientRect();
    dragRef.current = { id: n.id, dx: e.clientX - rect.left - n.x, dy: e.clientY - rect.top - n.y };
  };

  const onNodeClick = (n) => {
    if (connecting === true) {
      setConnecting(n.id);
      window.SOGI_TOAST(`Origem: "${n.label}" — clique no bloco de destino`, 'info');
      return;
    }
    if (typeof connecting === 'number' || (typeof connecting === 'string' && connecting !== true)) {
      if (connecting !== n.id) {
        setLinks(ls => [...ls, [connecting, n.id]]);
        window.SOGI_TOAST('Ligação criada entre os blocos');
      }
      setConnecting(false);
      return;
    }
    setSel(n.id);
  };
  const onMouseMove = (e) => {
    if (!dragRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const { id, dx, dy } = dragRef.current;
    const x = Math.max(10, Math.min(rect.width - 130, e.clientX - rect.left - dx));
    const y = Math.max(10, Math.min(rect.height - 60, e.clientY - rect.top - dy));
    setNodes(ns => ns.map(n => n.id === id ? { ...n, x, y } : n));
  };
  const stopDrag = () => { dragRef.current = null; };

  const addNode = (p) => {
    const id = nextId.current++;
    setNodes(ns => [...ns, { id, type: p.type, label: p.label, x: 280 + (id % 5) * 22, y: 160 + (id % 4) * 22 }]);
    setSel(id);
  };
  const removeSel = () => {
    setLinks(ls => ls.filter(([a, b]) => a !== sel && b !== sel));
    setNodes(ns => ns.filter(n => n.id !== sel));
    setSel(null);
  };
  const center = (n) => ({ cx: n.x + 60, cy: n.y + 27 });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(24,60,90,0.5)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 22, animation: 'sogi-pop .15s ease' }}>
      <div data-screen-label="Editor de diagrama" style={{ width: 'min(1100px, 96vw)', height: 'min(720px, 92vh)', background: 'var(--surface)', borderRadius: 16, boxShadow: 'var(--shadow-pop)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'sogi-pop .2s cubic-bezier(.3,1.3,.6,1)' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--warn)', display: 'flex' }}><Icon d={ICONS.flow} size={16} /></span>
          <strong style={{ fontSize: 13.5 }}>{kind === 'rede' ? 'Mapa de rede — Vale Aço' : 'Fluxograma de processo'}</strong>
          <Badge tone="warn">rascunho</Badge>
          <span style={{ flex: 1 }}></span>
          <button onClick={() => { setConnecting(c => c ? false : true); if (!connecting) window.SOGI_TOAST('Modo ligação: clique no bloco de ORIGEM', 'info'); }} style={{
            fontSize: 11.5, fontWeight: 600, borderRadius: 7, padding: '5px 11px', display: 'flex', gap: 5, alignItems: 'center',
            color: connecting ? '#fff' : 'var(--violet)', background: connecting ? 'var(--violet)' : 'var(--violet-soft)',
          }}>
            <Icon d={ICONS.link} size={12} /> {connecting ? 'Ligando…' : 'Ligar blocos'}
          </button>
          {sel && (
            <button onClick={removeSel} style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--danger)', border: '1px solid var(--danger-soft)', background: 'var(--danger-soft)', borderRadius: 7, padding: '5px 11px' }}>
              Excluir selecionado
            </button>
          )}
          <GhostBtn icon="download" onClick={() => window.SOGI_TOAST('Diagrama exportado como PNG')}>Exportar</GhostBtn>
          <PrimaryBtn icon="check" onClick={() => { onSave && onSave(kind === 'rede' ? 'Mapa de rede — novo.diagram' : 'Fluxograma de processo — novo.diagram'); onClose(); }}>Salvar</PrimaryBtn>
          <button onClick={onClose} style={{ color: 'var(--text-3)', display: 'flex', padding: 5 }}><Icon d={ICONS.x} size={16} /></button>
        </header>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '170px 1fr', minHeight: 0 }}>
          {/* Paleta */}
          <div style={{ borderRight: '1px solid var(--border)', padding: 12, overflowY: 'auto', background: 'var(--surface-2)' }}>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 9 }}>Componentes</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {NET_PALETTE.map(p => (
                <button key={p.type} onClick={() => addNode(p)} style={{
                  display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', borderRadius: 8,
                  background: 'var(--surface)', boxShadow: 'var(--shadow-card)', fontSize: 12, fontWeight: 600,
                  color: 'var(--text-2)', textAlign: 'left', transition: 'transform .1s',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateX(2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                  <span style={{ width: 24, height: 24, borderRadius: 6, background: p.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon d={ICONS[p.icon]} size={12} />
                  </span>
                  {p.label}
                  <span style={{ marginLeft: 'auto', color: 'var(--text-3)' }}><Icon d={ICONS.plus} size={11} /></span>
                </button>
              ))}
            </div>
            <p className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', lineHeight: 1.6, marginTop: 14 }}>clique para adicionar · arraste os blocos · "Ligar blocos" cria as linhas de lógica</p>
          </div>
          {/* Canvas */}
          <div className="dgm-canvas" onMouseMove={onMouseMove} onMouseUp={stopDrag} onMouseLeave={stopDrag}
            style={{ position: 'relative', overflow: 'hidden', cursor: connecting ? 'crosshair' : 'default', background: 'radial-gradient(circle, var(--border) 1.2px, transparent 1.2px) 0 0 / 22px 22px' }}>
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              {links.map(([a, b], i) => {
                const na = nodes.find(n => n.id === a), nb = nodes.find(n => n.id === b);
                if (!na || !nb) return null;
                const ca = center(na), cb = center(nb);
                return <line key={i} x1={ca.cx} y1={ca.cy} x2={cb.cx} y2={cb.cy} stroke="#94a3b8" strokeWidth="2" strokeDasharray="2 4" />;
              })}
            </svg>
            {nodes.map(n => {
              const p = NET_PALETTE.find(x => x.type === n.type);
              const isSel = sel === n.id;
              const isConnSrc = connecting === n.id;
              return (
                <div key={n.id} onMouseDown={e => onMouseDown(e, n)} onClick={() => onNodeClick(n)} style={{
                  position: 'absolute', left: n.x, top: n.y, width: 120, userSelect: 'none',
                  background: 'var(--surface)', borderRadius: 10, padding: '9px 10px',
                  boxShadow: isConnSrc ? `0 0 0 2px var(--violet), var(--shadow-pop)` : isSel ? `0 0 0 2px ${p.color}, var(--shadow-pop)` : 'var(--shadow-card)',
                  cursor: connecting ? 'crosshair' : 'grab', display: 'flex', alignItems: 'center', gap: 8, transition: 'box-shadow .12s',
                }}>
                  <span style={{ width: 26, height: 26, borderRadius: 7, background: p.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon d={ICONS[p.icon]} size={13} />
                  </span>
                  <span style={{ fontSize: 10.5, fontWeight: 650, lineHeight: 1.25 }}>{n.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DocumentsScreen, DiagramEditor });
