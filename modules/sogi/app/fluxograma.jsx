// SOGI — Fluxograma BPM editável: arrastar nós, criar etapas, ligar blocos, zoom
const { useState: useStateFL, useRef: useRefFL, useEffect: useEffectFL } = React;

const FL_INITIAL_NODES = [
  { id: 'inicio', name: 'Início', type: 'terminal', x: 440, y: 52, state: 'done', desc: 'Abertura do processo de migração ERP.', owner: 'rafael' },
  { id: 'analise', name: 'Análise', type: 'process', x: 440, y: 158, state: 'done', desc: 'Levantamento técnico, customizações e de-para de dados.', owner: 'pedro', sla: '5 dias úteis' },
  { id: 'aprovacao', name: 'Aprovação', type: 'process', x: 440, y: 272, state: 'active', desc: 'Termo de homologação assinado pelo cliente (CNAB 240 e folha).', owner: 'rafael', sla: '2 dias úteis', actions: ['Criar tarefa de virada', 'Enviar WhatsApp ao cliente', 'Notificar responsável'] },
  { id: 'decisao', name: 'Aprovado?', type: 'decision', x: 440, y: 396, state: 'pending', desc: 'Gate de qualidade: cliente valida a homologação.', owner: 'rafael' },
  { id: 'execucao', name: 'Execução', type: 'process', x: 440, y: 520, state: 'pending', desc: 'Migração de dados e configuração do ambiente produtivo.', owner: 'ana', sla: '8 dias úteis' },
  { id: 'validacao', name: 'Validação', type: 'process', x: 440, y: 626, state: 'pending', desc: 'Testes integrados com usuários-chave.', owner: 'marina', sla: '3 dias úteis' },
  { id: 'entrega', name: 'Entrega', type: 'terminal', x: 440, y: 726, state: 'pending', desc: 'Virada para produção com suporte assistido.', owner: 'rafael' },
];

const FL_INITIAL_EDGES = [
  { from: 'inicio', to: 'analise' },
  { from: 'analise', to: 'aprovacao' },
  { from: 'aprovacao', to: 'decisao' },
  { from: 'decisao', to: 'execucao', label: 'Sim' },
  { from: 'execucao', to: 'validacao' },
  { from: 'validacao', to: 'entrega' },
];

const FL_STATE = {
  done: { stroke: '#16a34a', fill: 'var(--ok-soft)', label: 'Concluído', tone: 'ok' },
  active: { stroke: '#E85928', fill: 'var(--accent-soft)', label: 'Em andamento', tone: 'accent' },
  pending: { stroke: '#cbd5e1', fill: 'var(--surface)', label: 'Pendente', tone: 'neutral' },
};

const flHalfH = (n) => n.type === 'decision' ? 40 : n.type === 'terminal' ? 21 : 29;
const flHalfW = (n) => n.type === 'decision' ? 78 : n.type === 'terminal' ? 62 : 85;

/* ===== Múltiplos fluxos por projeto (salvos na pasta do projeto) ===== */
const FL_VIRADA_NODES = [
  { id: 'v-inicio', name: 'Início', type: 'terminal', x: 440, y: 52, state: 'done', desc: 'Janela de virada aprovada (sáb. 28/06, 22h).', owner: 'rafael' },
  { id: 'v-backup', name: 'Backup completo', type: 'process', x: 440, y: 165, state: 'done', desc: 'Snapshot do banco + arquivos do legado.', owner: 'carlos', sla: '4h' },
  { id: 'v-freeze', name: 'Congelar legado', type: 'process', x: 440, y: 280, state: 'active', desc: 'Bloqueio de lançamentos no sistema antigo.', owner: 'carlos', sla: '30min' },
  { id: 'v-migra', name: 'Migrar dados', type: 'process', x: 440, y: 395, state: 'pending', desc: 'Execução dos scripts de migração final.', owner: 'ana', sla: '5h' },
  { id: 'v-valida', name: 'Validação assistida', type: 'process', x: 440, y: 510, state: 'pending', desc: 'Usuários-chave validam os 12 testes críticos.', owner: 'marina', sla: '2h' },
  { id: 'v-fim', name: 'Go-live', type: 'terminal', x: 440, y: 618, state: 'pending', desc: 'DNS apontado e produção liberada.', owner: 'rafael' },
];
const FL_VIRADA_EDGES = [
  { from: 'v-inicio', to: 'v-backup' }, { from: 'v-backup', to: 'v-freeze' },
  { from: 'v-freeze', to: 'v-migra' }, { from: 'v-migra', to: 'v-valida' }, { from: 'v-valida', to: 'v-fim' },
];

const FL_RFC_NODES = [
  { id: 'rfc-inicio', name: 'Solicitação', type: 'terminal', x: 440, y: 52, state: 'done', desc: 'Pedido de mudança (RFC) registrado.', owner: 'rafael' },
  { id: 'rfc-analise', name: 'Análise técnica', type: 'process', x: 440, y: 170, state: 'active', desc: 'Avaliação de impacto, risco e esforço.', owner: 'carlos', sla: '2 dias' },
  { id: 'rfc-gate', name: 'Aprovar?', type: 'decision', x: 440, y: 305, state: 'pending', desc: 'Comitê de mudanças decide.', owner: 'rafael' },
  { id: 'rfc-exec', name: 'Implementar', type: 'process', x: 240, y: 440, state: 'pending', desc: 'Mudança executada em janela controlada.', owner: 'pedro', sla: '5 dias' },
  { id: 'rfc-arq', name: 'Arquivar', type: 'terminal', x: 640, y: 440, state: 'pending', desc: 'RFC rejeitada — solicitante notificado.', owner: 'rafael' },
];
const FL_RFC_EDGES = [
  { from: 'rfc-inicio', to: 'rfc-analise' }, { from: 'rfc-analise', to: 'rfc-gate' },
  { from: 'rfc-gate', to: 'rfc-exec', label: 'Sim' }, { from: 'rfc-gate', to: 'rfc-arq', label: 'Não' },
];

const FLOWS_INITIAL = [
  { id: 'f1', name: 'Processo de migração (principal)', owner: 'rafael', myAccess: 'editar', updated: 'hoje, 09:10', nodes: FL_INITIAL_NODES, edges: FL_INITIAL_EDGES },
  { id: 'f2', name: 'Virada para produção', owner: 'carlos', myAccess: 'visualizar', updated: '01 jun', nodes: FL_VIRADA_NODES, edges: FL_VIRADA_EDGES },
  { id: 'f3', name: 'Aprovação de mudanças (RFC)', owner: 'rafael', myAccess: 'editar', updated: '28 mai', nodes: FL_RFC_NODES, edges: FL_RFC_EDGES },
];

function FlowView() {
  const [flows, setFlows] = useStateFL(FLOWS_INITIAL);
  const [activeFlowId, setActiveFlowId] = useStateFL('f1');
  const flow = flows.find(f => f.id === activeFlowId) || flows[0];
  const readOnly = flow.myAccess !== 'editar';
  const [nodes, setNodes] = useStateFL(FL_INITIAL_NODES);
  const [edges, setEdges] = useStateFL(FL_INITIAL_EDGES);
  const [selected, setSelected] = useStateFL('aprovacao');
  const [zoom, setZoom] = useStateFL(1);
  const [connecting, setConnecting] = useStateFL(false); // false | true | nodeId (origem escolhida)
  const [permOpen, setPermOpen] = useStateFL(false);
  const [fullscreen, setFullscreen] = useStateFL(false);
  const canvasRef = useRefFL(null);
  const svgRef = useRefFL(null);
  const dragRef = useRefFL(null);
  const movedRef = useRefFL(false);
  const nextId = useRefFL(1);
  const flowSeq = useRefFL(1);

  // trocar de fluxo carrega o que foi salvo
  useEffectFL(() => {
    const f = flows.find(x => x.id === activeFlowId);
    if (!f) return;
    setNodes(f.nodes.map(n => ({ ...n })));
    setEdges(f.edges.map(e => ({ ...e })));
    setSelected((f.nodes[1] || f.nodes[0]).id);
    setConnecting(false);
  }, [activeFlowId]);

  const denyRO = () => window.SOGI_TOAST('Acesso somente leitura neste fluxo — peça edição ao dono (Carlos)', 'warn');

  const saveFlow = () => {
    if (readOnly) { denyRO(); return; }
    setFlows(fs => fs.map(f => f.id === activeFlowId ? { ...f, nodes: nodes.map(n => ({ ...n })), edges: edges.map(e => ({ ...e })), updated: 'agora' } : f));
    const docName = flow.name + '.diagram';
    const docs = SOGI_DATA.projectDocs.p1;
    if (!docs.some(d => d.name === docName)) docs.unshift({ name: docName, type: 'diagram', size: '—', owner: 'rafael', when: 'agora' });
    window.SOGI_TOAST(`"${flow.name}" salvo na pasta do projeto (Documentos → ERP-MIG)`);
  };

  const newFlow = () => {
    const id = 'fx' + flowSeq.current++;
    const base = [
      { id: id + '-i', name: 'Início', type: 'terminal', x: 440, y: 80, state: 'pending', desc: 'Ponto de partida do novo fluxo.', owner: 'rafael' },
      { id: id + '-f', name: 'Fim', type: 'terminal', x: 440, y: 280, state: 'pending', desc: 'Encerramento do fluxo.', owner: 'rafael' },
    ];
    setFlows(fs => [...fs, { id, name: `Novo fluxo ${flowSeq.current - 1}`, owner: 'rafael', myAccess: 'editar', updated: 'agora', nodes: base, edges: [{ from: id + '-i', to: id + '-f' }] }]);
    setActiveFlowId(id);
    window.SOGI_TOAST('Novo fluxo criado — adicione etapas e salve na pasta do projeto');
  };

  const deleteFlow = () => {
    if (flow.owner !== 'rafael') { window.SOGI_TOAST('Apenas o dono ou admin pode excluir este fluxo', 'warn'); return; }
    if (flows.length <= 1) { window.SOGI_TOAST('O projeto precisa de ao menos um fluxo', 'warn'); return; }
    const next = flows.find(f => f.id !== activeFlowId).id;
    setFlows(fs => fs.filter(f => f.id !== activeFlowId));
    setActiveFlowId(next);
    window.SOGI_TOAST(`Fluxo "${flow.name}" excluído — registrado na auditoria`, 'warn');
  };

  const sel = nodes.find(n => n.id === selected) || nodes[0];
  const W = 880, H = 790;

  const fitZoom = () => {
    const el = canvasRef.current;
    if (!el) return;
    const avail = el.clientWidth - 16;
    setZoom(Math.max(0.35, Math.min(1.2, +(avail / W).toFixed(2))));
  };
  useEffectFL(() => {
    fitZoom();
    window.addEventListener('resize', fitZoom);
    return () => window.removeEventListener('resize', fitZoom);
  }, []);

  // refazer o ajuste de zoom ao entrar/sair da tela cheia + Esc para sair
  useEffectFL(() => {
    const t = setTimeout(fitZoom, 60);
    const onKey = (e) => { if (e.key === 'Escape') setFullscreen(false); };
    if (fullscreen) document.addEventListener('keydown', onKey);
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey); };
  }, [fullscreen]);

  // coords do mouse no espaço do SVG
  const svgCoords = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / zoom, y: (e.clientY - rect.top) / zoom };
  };

  const onNodeMouseDown = (e, n) => {
    if (connecting || readOnly) return;
    e.preventDefault();
    const c = svgCoords(e);
    dragRef.current = { id: n.id, dx: c.x - n.x, dy: c.y - n.y, moved: false };
  };
  const onMouseMove = (e) => {
    if (!dragRef.current) return;
    const c = svgCoords(e);
    const { id, dx, dy } = dragRef.current;
    dragRef.current.moved = true;
    setNodes(ns => ns.map(n => n.id === id ? {
      ...n,
      x: Math.max(95, Math.min(W - 95, c.x - dx)),
      y: Math.max(45, Math.min(H - 45, c.y - dy)),
    } : n));
  };
  const stopDrag = () => { movedRef.current = !!(dragRef.current && dragRef.current.moved); dragRef.current = null; };

  const onNodeClick = (n) => {
    if (connecting === true) {
      setConnecting(n.id);
      window.SOGI_TOAST(`Origem: "${n.name}" — agora clique no bloco de destino`, 'info');
      return;
    }
    if (typeof connecting === 'string') {
      if (connecting !== n.id) {
        setEdges(es => [...es, { from: connecting, to: n.id, custom: true }]);
        window.SOGI_TOAST('Ligação criada entre os blocos');
      }
      setConnecting(false);
      return;
    }
    setSelected(n.id);
  };

  const addNode = (type) => {
    if (readOnly) { denyRO(); return; }
    const id = 'novo' + nextId.current++;
    setNodes(ns => [...ns, {
      id, type, name: type === 'decision' ? 'Decisão?' : 'Nova etapa',
      x: 200 + (nextId.current % 3) * 40, y: 480 + (nextId.current % 4) * 40,
      state: 'pending', desc: 'Etapa criada agora — arraste para posicionar e use "Ligar" para conectar ao fluxo.', owner: 'rafael',
    }]);
    setSelected(id);
    window.SOGI_TOAST('Etapa criada — arraste para posicionar');
  };

  const removeSelected = () => {
    if (readOnly) { denyRO(); return; }
    if (['inicio', 'entrega'].includes(sel.id)) { window.SOGI_TOAST('Início e Entrega não podem ser removidos', 'warn'); return; }
    setEdges(es => es.filter(e => e.from !== sel.id && e.to !== sel.id));
    setNodes(ns => ns.filter(n => n.id !== sel.id));
    setSelected('inicio');
    window.SOGI_TOAST('Etapa removida do fluxo', 'warn');
  };

  // aresta genérica entre dois nós (encurta nas bordas, seta no destino)
  const Edge = ({ edge }) => {
    const a = nodes.find(n => n.id === edge.from), b = nodes.find(n => n.id === edge.to);
    if (!a || !b) return null;
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len, uy = dy / len;
    // raio aproximado de cada nó na direção da aresta
    const rA = Math.abs(uy) > Math.abs(ux) ? flHalfH(a) : flHalfW(a);
    const rB = Math.abs(uy) > Math.abs(ux) ? flHalfH(b) : flHalfW(b);
    const x1 = a.x + ux * rA, y1 = a.y + uy * rA;
    const x2 = b.x - ux * (rB + 8), y2 = b.y - uy * (rB + 8);
    const doneEdge = a.state === 'done';
    const color = edge.custom ? '#0284c7' : doneEdge ? '#16a34a' : '#cbd5e1';
    // seta
    const ax = b.x - ux * rB, ay = b.y - uy * rB;
    const px = -uy, py = ux;
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2" strokeDasharray={edge.custom ? '6 4' : 'none'} />
        <polygon points={`${x2 + px * 5},${y2 + py * 5} ${x2 - px * 5},${y2 - py * 5} ${ax},${ay}`} fill={color} />
        {edge.label && (
          <g>
            <rect x={(x1 + x2) / 2 + 6} y={(y1 + y2) / 2 - 10} width={34} height={20} rx={10} fill="var(--ok-soft)" stroke="#16a34a" strokeWidth="1" />
            <text x={(x1 + x2) / 2 + 23} y={(y1 + y2) / 2 + 4} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#16a34a">{edge.label}</text>
          </g>
        )}
      </g>
    );
  };

  // loop de rejeição (decisão → análise), recalculado pelas posições atuais
  const RejectLoop = () => {
    const d = nodes.find(n => n.id === 'decisao'), an = nodes.find(n => n.id === 'analise');
    if (!d || !an) return null;
    const railX = Math.min(d.x, an.x) - 250 > 40 ? Math.min(d.x, an.x) - 250 : 60;
    return (
      <g>
        <path d={`M ${d.x - 78} ${d.y} H ${railX + 15} Q ${railX} ${d.y} ${railX} ${d.y - 15} V ${an.y + 15} Q ${railX} ${an.y} ${railX + 15} ${an.y} H ${an.x - 85 - 12}`}
          fill="none" stroke="#dc2626" strokeWidth="1.8" strokeDasharray="6 5" opacity="0.75" />
        <polygon points={`${an.x - 85 - 13},${an.y - 5} ${an.x - 85 - 13},${an.y + 5} ${an.x - 85 - 1},${an.y}`} fill="#dc2626" opacity="0.75" />
        <rect x={railX - 71 + (d.x - 78 - railX) / 2} y={(d.y + an.y) / 2 - 11} width="142" height="22" rx="11" fill="var(--danger-soft)" stroke="#dc2626" strokeWidth="1" opacity="0.95" />
        <text x={railX + (d.x - 78 - railX) / 2} y={(d.y + an.y) / 2 + 4} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#dc2626">Não — retrabalho</text>
      </g>
    );
  };

  return (
    <div style={fullscreen
      ? { position: 'fixed', inset: 0, zIndex: 65, background: 'var(--bg)', display: 'flex', flexDirection: 'column', animation: 'sogi-pop .15s ease' }
      : { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Barra de fluxos do projeto */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px 0', flexWrap: 'wrap' }}>
        {flows.map(f => {
          const isActive = f.id === activeFlowId;
          return (
            <button key={f.id} onClick={() => setActiveFlowId(f.id)}
              onContextMenu={e => window.SOGI_CTX(e, [
                { label: 'Abrir fluxo', icon: 'flow', onClick: () => setActiveFlowId(f.id) },
                { label: 'Permissões de acesso', icon: 'shield', onClick: () => { setActiveFlowId(f.id); setPermOpen(true); } },
                '-',
                { label: 'Excluir fluxo', icon: 'trash', danger: true, onClick: () => { setActiveFlowId(f.id); setTimeout(deleteFlow, 0); } },
              ])}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 600,
                borderRadius: 99, padding: '6px 13px', transition: 'all .12s',
                background: isActive ? 'var(--nav-bg)' : 'var(--surface)',
                color: isActive ? '#fff' : 'var(--text-2)',
                border: '1px solid ' + (isActive ? 'var(--nav-bg)' : 'var(--border)'),
              }}>
              <Icon d={ICONS.flow} size={12} />
              {f.name}
              {f.myAccess === 'visualizar' && <span title="somente visualização" style={{ display: 'flex', opacity: 0.8 }}><Icon d={ICONS.eye} size={12} /></span>}
            </button>
          );
        })}
        <button onClick={newFlow} style={{
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600,
          borderRadius: 99, padding: '6px 13px', border: '1.5px dashed var(--border-strong)', color: 'var(--text-3)',
        }}>
          <Icon d={ICONS.plus} size={12} /> Novo fluxo
        </button>
        <span style={{ flex: 1 }}></span>
        <Badge tone={readOnly ? 'warn' : 'ok'} dot>{readOnly ? 'somente visualização' : 'você pode editar'}</Badge>
        <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>dono: {SOGI_DATA.people[flow.owner].name.split(' ')[0]} · salvo {flow.updated}</span>
        {flow.owner === 'rafael' && (
          <button onClick={deleteFlow} title="Excluir este fluxo (dono/admin)" style={{
            display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600,
            color: 'var(--danger)', border: '1px solid var(--border)', borderRadius: 7, padding: '5px 10px',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-soft)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Icon d={ICONS.trash} size={12} /> Excluir fluxo
          </button>
        )}
        <button onClick={() => setFullscreen(f => !f)} title={fullscreen ? 'Sair da tela cheia (Esc)' : 'Expandir para tela cheia'} style={{
          display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600,
          color: fullscreen ? '#fff' : 'var(--text-2)', borderRadius: 7, padding: '5px 10px',
          background: fullscreen ? 'var(--accent)' : 'transparent',
          border: '1px solid ' + (fullscreen ? 'var(--accent)' : 'var(--border)'),
        }}>
          <Icon d={fullscreen ? 'M9 4H4v5 M15 4h5v5 M9 20H4v-5 M15 20h5v-5' : 'M4 9V4h5 M20 9V4h-5 M4 15v5h5 M20 15v5h-5'} size={13} />
          {fullscreen ? 'Reduzir' : 'Tela cheia'}
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: '10px 24px 24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14 }}>
      <div ref={canvasRef} style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', position: 'relative', overflow: 'auto', minHeight: 0 }}>
        {/* Toolbar */}
        <div style={{ position: 'sticky', top: 0, left: 0, zIndex: 5, display: 'flex', gap: 8, padding: '10px 12px', background: 'linear-gradient(var(--surface) 75%, transparent)', alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.05em' }}>{readOnly ? 'BPM · leitura' : 'BPM · arraste os blocos'}</span>
          <span style={{ flex: 1 }}></span>
          {!readOnly && <>
          <button onClick={saveFlow} style={{ fontSize: 11.5, fontWeight: 600, color: '#fff', background: 'var(--ok)', borderRadius: 7, padding: '5px 11px', display: 'flex', gap: 5, alignItems: 'center' }}>
            <Icon d={ICONS.check} size={12} /> Salvar
          </button>
          <button onClick={() => setPermOpen(true)} style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 7, padding: '5px 11px', display: 'flex', gap: 5, alignItems: 'center' }}>
            <Icon d={ICONS.shield} size={12} /> Permissões
          </button>
          <button onClick={() => addNode('process')} style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--accent-text)', background: 'var(--accent-soft)', borderRadius: 7, padding: '5px 11px', display: 'flex', gap: 5, alignItems: 'center' }}>
            <Icon d={ICONS.plus} size={12} /> Etapa
          </button>
          <button onClick={() => addNode('decision')} style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--violet)', background: 'var(--violet-soft)', borderRadius: 7, padding: '5px 11px', display: 'flex', gap: 5, alignItems: 'center' }}>
            <Icon d={ICONS.flow} size={12} /> Decisão
          </button>
          <button onClick={() => { setConnecting(c => c ? false : true); if (!connecting) window.SOGI_TOAST('Modo ligação: clique no bloco de ORIGEM', 'info'); }} style={{
            fontSize: 11.5, fontWeight: 600, borderRadius: 7, padding: '5px 11px', display: 'flex', gap: 5, alignItems: 'center',
            color: connecting ? '#fff' : 'var(--violet)', background: connecting ? 'var(--violet)' : 'var(--violet-soft)',
          }}>
            <Icon d={ICONS.link} size={12} /> {connecting ? 'Ligando… (Esc p/ sair)' : 'Ligar blocos'}
          </button>
          <button onClick={removeSelected} style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--danger)', background: 'var(--danger-soft)', borderRadius: 7, padding: '5px 11px', display: 'flex', gap: 5, alignItems: 'center' }}>
            <Icon d={ICONS.trash} size={12} /> Remover
          </button>
          </>}
          <span style={{ width: 1, height: 18, background: 'var(--border)' }}></span>
          <button onClick={() => setZoom(z => Math.max(0.5, +(z - 0.15).toFixed(2)))} style={{ border: '1px solid var(--border)', borderRadius: 7, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)', fontWeight: 700 }}>−</button>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)', width: 38, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(1.6, +(z + 0.15).toFixed(2)))} style={{ border: '1px solid var(--border)', borderRadius: 7, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)', fontWeight: 700 }}>+</button>
          <button onClick={fitZoom} className="mono" style={{ border: '1px solid var(--border)', borderRadius: 7, height: 26, padding: '0 9px', fontSize: 10, color: 'var(--text-2)' }}>fit</button>
        </div>

        <svg ref={svgRef} width={W * zoom} height={H * zoom} viewBox={`0 0 ${W} ${H}`}
          onMouseMove={onMouseMove} onMouseUp={stopDrag} onMouseLeave={stopDrag}
          style={{ display: 'block', margin: '0 auto', cursor: connecting ? 'crosshair' : 'default' }}>
          <defs>
            <pattern id="flgrid" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="1.2" cy="1.2" r="1.2" fill="var(--border)" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#flgrid)" onClick={() => { if (connecting) { setConnecting(false); window.SOGI_TOAST('Modo ligação cancelado', 'warn'); } }} />

          {edges.map((e, i) => <Edge key={i} edge={e} />)}
          <RejectLoop />

          {/* automações da Aprovação */}
          {(nodes.find(n => n.id === 'aprovacao') || {}).actions && nodes.find(n => n.id === 'aprovacao').actions.map((a, i) => {
            const ap = nodes.find(n => n.id === 'aprovacao');
            const cy = ap.y - 40 + i * 40;
            const chipX = Math.min(ap.x + 158, W - 230);
            return (
              <g key={i} style={{ cursor: 'pointer' }} onClick={() => window.SOGI_TOAST(`Automação: ${a}`, 'info')}>
                <path d={`M ${ap.x + 85} ${ap.y} C ${ap.x + 130} ${ap.y}, ${ap.x + 130} ${cy}, ${chipX} ${cy}`}
                  fill="none" stroke="#d97706" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.8" />
                <rect x={chipX} y={cy - 14} width="218" height="28" rx="14" fill="var(--warn-soft)" stroke="#d97706" strokeWidth="1.2" />
                <text x={chipX + 18} y={cy + 4} fontSize="11" fontWeight="600" fill="#92400e">⚡ {a}</text>
              </g>
            );
          })}

          {/* nós */}
          {nodes.map((n) => {
            const s = FL_STATE[n.state];
            const isSel = selected === n.id;
            const isConnSrc = connecting === n.id;
            const common = {
              stroke: isConnSrc ? '#0284c7' : s.stroke, strokeWidth: isSel || isConnSrc ? 3 : 2, fill: s.fill,
              style: { cursor: connecting ? 'crosshair' : 'grab', filter: isSel ? 'drop-shadow(0 4px 10px rgba(24,60,90,0.25))' : 'drop-shadow(0 1px 3px rgba(24,60,90,0.12))' },
            };
            return (
              <g key={n.id} onClick={() => { if (!movedRef.current) onNodeClick(n); movedRef.current = false; }}
                onMouseDown={e => onNodeMouseDown(e, n)}>
                {n.type === 'terminal' && <rect x={n.x - 62} y={n.y - 21} width="124" height="42" rx="21" {...common} />}
                {n.type === 'process' && <rect x={n.x - 85} y={n.y - 29} width="170" height="58" rx="10" {...common} />}
                {n.type === 'decision' && (
                  <polygon points={`${n.x},${n.y - 40} ${n.x + 78},${n.y} ${n.x},${n.y + 40} ${n.x - 78},${n.y}`} {...common} />
                )}
                {n.state === 'active' && (
                  <circle cx={n.x + flHalfW(n) - 8} cy={n.y - flHalfH(n) + 8} r="5" fill="#E85928">
                    <animate attributeName="opacity" values="1;0.35;1" dur="1.6s" repeatCount="indefinite" />
                  </circle>
                )}
                <text x={n.x} y={n.y + (n.type === 'process' ? -4 : 4.5)} textAnchor="middle" fontSize="13.5" fontWeight="700"
                  fill={n.state === 'pending' ? 'var(--text-3)' : 'var(--text)'} style={{ pointerEvents: 'none', userSelect: 'none' }}>{n.name}</text>
                {n.type === 'process' && (
                  <text x={n.x} y={n.y + 16} textAnchor="middle" fontSize="9.5" fontWeight="600"
                    fill={s.stroke} style={{ pointerEvents: 'none', userSelect: 'none', letterSpacing: '0.04em' }}>
                    {s.label.toUpperCase()}{n.sla ? ` · SLA ${n.sla}` : ''}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Painel da etapa */}
      <div style={{ overflowY: 'auto', minHeight: 0 }}>
        <Card title={`Etapa: ${sel.name}`} action={<Badge tone={FL_STATE[sel.state].tone} dot>{FL_STATE[sel.state].label}</Badge>}>
          <p style={{ margin: '0 0 14px', fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.55 }}>{sel.desc}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '9px 14px', fontSize: 12, alignItems: 'center', marginBottom: 16 }}>
            <span style={{ color: 'var(--text-3)' }}>Responsável</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Avatar person={sel.owner} size={20} />{SOGI_DATA.people[sel.owner].name}</span>
            {sel.sla && <>
              <span style={{ color: 'var(--text-3)' }}>SLA da etapa</span>
              <span className="mono" style={{ fontSize: 11.5 }}>{sel.sla}</span>
            </>}
          </div>
          {sel.actions ? (
            <div>
              <SectionLabel>Ações automáticas ao concluir</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sel.actions.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--warn-soft)', borderRadius: 8, padding: '9px 12px' }}>
                    <span style={{ color: 'var(--warn)', display: 'flex' }}><Icon d={ICONS.zap} size={14} /></span>
                    <span style={{ fontSize: 12.5, fontWeight: 500, flex: 1 }}>{a}</span>
                    <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>auto</span>
                  </div>
                ))}
              </div>
              <button onClick={() => readOnly ? denyRO() : window.SOGI_TOAST('Etapa "Aprovação" avançada — 3 automações executadas')} style={{
                marginTop: 14, width: '100%', background: 'var(--accent)', color: '#fff', borderRadius: 8,
                padding: '9px 0', fontWeight: 600, fontSize: 12.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: readOnly ? 0.55 : 1,
              }}>
                <Icon d={ICONS.play} size={13} /> Avançar etapa
              </button>
            </div>
          ) : (
            <button onClick={() => readOnly ? denyRO() : window.SOGI_TOAST('Configure gatilhos para esta etapa', 'info')} style={{
              width: '100%', border: '1.5px dashed var(--border-strong)', borderRadius: 8, padding: '9px 0',
              fontWeight: 600, fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            }}>
              <Icon d={ICONS.zap} size={13} /> Adicionar automação
            </button>
          )}
        </Card>
        <div style={{ marginTop: 12 }}>
          <Card title="Histórico do processo" pad={false}>
            {[
              ['Análise concluída por Pedro', '04 jun, 17:20'],
              ['Automação: tarefa "CNAB 240" criada', '05 jun, 08:00'],
              ['Aprovação iniciada — termo enviado', '05 jun, 08:01'],
              ['WhatsApp enviado ao cliente (lido ✓✓)', '05 jun, 08:02'],
            ].map(([w, t], i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '9px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none', alignItems: 'flex-start' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok)', marginTop: 5, flexShrink: 0 }}></span>
                <span style={{ flex: 1, fontSize: 11.5, lineHeight: 1.45 }}>
                  {w}
                  <span className="mono" style={{ display: 'block', fontSize: 9.5, color: 'var(--text-3)', marginTop: 2 }}>{t}</span>
                </span>
              </div>
            ))}
          </Card>
        </div>
      </div>
      </div>

      {permOpen && <FlowPermissionsModal flow={flow} onClose={() => setPermOpen(false)} />}
    </div>
  );
}

/* ---------- Modal: permissões do fluxo ---------- */
function FlowPermissionsModal({ flow, onClose }) {
  const [acl, setAcl] = useStateFL(() => {
    const base = {};
    Object.values(SOGI_DATA.people).forEach(p => {
      base[p.id] = p.id === flow.owner ? 'editar' : ['ana', 'pedro'].includes(p.id) ? 'editar' : ['marina', 'carlos'].includes(p.id) ? 'visualizar' : 'sem acesso';
    });
    return base;
  });
  const levels = ['sem acesso', 'visualizar', 'editar'];
  const levelTone = { 'sem acesso': 'neutral', 'visualizar': 'warn', 'editar': 'ok' };
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(24,60,90,0.4)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'sogi-pop .15s ease' }}>
      <div data-screen-label="Permissões do fluxo" onClick={e => e.stopPropagation()} style={{ width: 470, maxWidth: '94vw', maxHeight: '88vh', overflowY: 'auto', background: 'var(--surface)', borderRadius: 14, boxShadow: 'var(--shadow-pop)', animation: 'sogi-pop .2s cubic-bezier(.3,1.3,.6,1)' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '15px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--violet)', display: 'flex' }}><Icon d={ICONS.shield} size={16} /></span>
          <strong style={{ fontSize: 14 }}>Permissões — {flow.name}</strong>
          <span style={{ flex: 1 }}></span>
          <button onClick={onClose} style={{ color: 'var(--text-3)', display: 'flex', padding: 4 }}><Icon d={ICONS.x} size={15} /></button>
        </header>
        <div style={{ padding: '8px 0' }}>
          {Object.values(SOGI_DATA.people).map((p, i) => {
            const isOwner = p.id === flow.owner;
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 20px', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <Avatar person={p.id} size={28} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: 12.5, display: 'block' }}>{p.name}{isOwner && ' (dono)'}</strong>
                  <span style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{p.role}</span>
                </span>
                {isOwner ? (
                  <Badge tone="violet" dot>editar + excluir</Badge>
                ) : (
                  <div style={{ display: 'flex', gap: 4 }}>
                    {levels.map(l => (
                      <button key={l} onClick={() => setAcl(a => ({ ...a, [p.id]: l }))} style={{
                        fontSize: 10.5, fontWeight: 600, borderRadius: 99, padding: '4px 10px',
                        border: acl[p.id] === l ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                        background: acl[p.id] === l ? 'var(--accent-soft)' : 'transparent',
                        color: acl[p.id] === l ? 'var(--accent-text)' : 'var(--text-3)',
                      }}>{l}</button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border)', background: 'var(--surface-2)', fontSize: 11, color: 'var(--text-3)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-2)' }}>Níveis:</strong> <em>visualizar</em> — abre o fluxo em modo leitura · <em>editar</em> — altera blocos e salva · <em>excluir</em> — reservado ao dono e administradores. Tudo é registrado na auditoria.
        </div>
        <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '13px 20px', borderTop: '1px solid var(--border)' }}>
          <GhostBtn onClick={onClose}>Cancelar</GhostBtn>
          <PrimaryBtn icon="check" onClick={() => { window.SOGI_TOAST('Permissões do fluxo atualizadas — registrado na auditoria'); onClose(); }}>Salvar permissões</PrimaryBtn>
        </footer>
      </div>
    </div>
  );
}

Object.assign(window, { FlowView });
