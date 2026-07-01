// SOGI — Configurações → Feed: canais por setor, permissões de publicação, agendamento e templates
const { useState: useStateFC } = React;

const FC_INITIAL_CHANNELS = [
  { id: 'geral', name: 'Geral — toda a empresa', owner: 'Diretoria', publishers: ['Administrador', 'Gestor'], audience: 'Todos', posts: 24, active: true, locked: true },
  { id: 'mkt', name: 'Marketing & Comunicação', owner: 'Marketing', publishers: ['Gestor', 'Colaborador'], audience: 'Todos', posts: 11, active: true },
  { id: 'rh', name: 'RH & Pessoas', owner: 'RH', publishers: ['Gestor'], audience: 'Todos', posts: 17, active: true },
  { id: 'ti', name: 'TI — janelas e avisos técnicos', owner: 'Infraestrutura', publishers: ['Gestor', 'Suporte'], audience: 'Todos', posts: 9, active: true },
  { id: 'gamif', name: 'Conquistas (automático)', owner: 'Sistema', publishers: [], audience: 'Todos', posts: 32, active: true, auto: true },
];

const FC_TEMPLATES = [
  { name: 'Comunicado oficial', desc: 'título + texto + anexo, com confirmação de leitura', icon: 'bell', channel: 'Geral', fields: ['Título', 'Texto', 'Anexo'], readReceipt: true, schedule: false },
  { name: 'Campanha de marketing', desc: 'imagem de capa + CTA + link externo', icon: 'megaphone', channel: 'Marketing & Comunicação', fields: ['Título', 'Imagem de capa', 'Texto', 'Botão CTA', 'Link externo'], readReceipt: false, schedule: true },
  { name: 'Aviso de manutenção', desc: 'data/hora, sistemas afetados e plantão', icon: 'server', channel: 'TI — avisos técnicos', fields: ['Título', 'Data/hora da janela', 'Sistemas afetados', 'Plantão'], readReceipt: true, schedule: true },
  { name: 'Boas-vindas a colaborador', desc: 'foto, cargo e setor do novo membro', icon: 'users', channel: 'RH & Pessoas', fields: ['Nome', 'Foto', 'Cargo', 'Setor', 'Mensagem'], readReceipt: false, schedule: false },
  { name: 'Enquete', desc: 'pergunta + até 5 opções, anônima ou aberta', icon: 'check', channel: 'Geral', fields: ['Pergunta', 'Opções (2–5)', 'Prazo de votação'], readReceipt: false, schedule: true },
];

function FeedSettings() {
  const [channels, setChannels] = useStateFC(FC_INITIAL_CHANNELS);
  const [editCh, setEditCh] = useStateFC(null);
  const [policy, setPolicy] = useStateFC({ approval: true, readReceipt: true, schedule: true, reactions: true });
  const [scheduled] = useStateFC([
    { title: 'Campanha: Semana da Segurança da Informação', channel: 'Marketing & Comunicação', when: '16 jun, 09:00', who: 'juliana' },
    { title: 'Lembrete: pesquisa de clima organizacional', channel: 'RH & Pessoas', when: '18 jun, 08:00', who: 'marina' },
  ]);
  const [templates, setTemplates] = useStateFC(FC_TEMPLATES);
  const [editTpl, setEditTpl] = useStateFC(null); // template em edição | { isNew: true }

  const togglePolicy = (k, label) => setPolicy(p => { const v = !p[k]; window.SOGI_TOAST(`${label}: ${v ? 'ativado' : 'desativado'}`); return { ...p, [k]: v }; });

  const saveChannel = (updated, isNew) => {
    if (isNew) setChannels(cs => [...cs, updated]);
    else setChannels(cs => cs.map(c => c.id === updated.id ? updated : c));
    setEditCh(null);
    window.SOGI_TOAST(`Canal "${updated.name}" ${isNew ? 'criado' : 'atualizado'} — publicadores notificados`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Canais */}
      <Card title="Canais do feed" action={
        <PrimaryBtn icon="plus" onClick={() => setEditCh({ id: 'ch' + Date.now(), name: '', owner: 'Marketing', publishers: ['Gestor'], audience: 'Todos', posts: 0, active: true, isNew: true })}>Novo canal</PrimaryBtn>
      } pad={false}>
        {channels.map((c, i) => (
          <div key={c.id} onDoubleClick={() => !c.auto && setEditCh(c)} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none', cursor: c.auto ? 'default' : 'pointer', opacity: c.active ? 1 : 0.55 }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: c.auto ? 'var(--warn-soft)' : 'var(--accent-soft)', color: c.auto ? 'var(--warn)' : 'var(--accent-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon d={ICONS[c.auto ? 'trophy' : 'megaphone']} size={14} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong style={{ fontSize: 12.5 }}>{c.name}</strong>
                {c.locked && <Badge tone="neutral">obrigatório</Badge>}
                {c.auto && <Badge tone="warn">automático</Badge>}
              </span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>
                dono: {c.owner} · {c.auto ? 'posts gerados pela gamificação' : `publicam: ${c.publishers.join(', ') || '—'}`} · {c.posts} posts
              </span>
            </span>
            <Badge tone={c.active ? 'ok' : 'neutral'} dot>{c.active ? 'ativo' : 'pausado'}</Badge>
            {!c.auto && (
              <button title="Configurar canal" onClick={e => { e.stopPropagation(); setEditCh(c); }} style={{ color: 'var(--text-3)', display: 'flex', padding: 6, borderRadius: 7, border: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                <Icon d={ICONS.settings} size={13} />
              </button>
            )}
            <CfSwitch on={c.active} onClick={() => {
              if (c.locked) { window.SOGI_TOAST('O canal Geral é obrigatório e não pode ser pausado', 'warn'); return; }
              setChannels(cs => cs.map(x => x.id === c.id ? { ...x, active: !x.active } : x));
              window.SOGI_TOAST(`Canal "${c.name}" ${c.active ? 'pausado' : 'reativado'}`);
            }} />
          </div>
        ))}
        <p className="mono" style={{ margin: 0, padding: '8px var(--pad)', fontSize: 9, color: 'var(--text-3)', borderTop: '1px solid var(--border)', lineHeight: 1.5 }}>
          duplo clique configura o canal · cada setor publica no seu canal e o feed unifica tudo por audiência
        </p>
      </Card>

      {/* Templates de publicação */}
      <Card title="Templates de publicação" action={<GhostBtn icon="plus" onClick={() => setEditTpl({ isNew: true, name: '', desc: '', icon: 'bell', channel: 'Geral', fields: ['Título', 'Texto'], readReceipt: false, schedule: true })}>Criar template</GhostBtn>} pad={false}>
        {templates.map((t, i) => (
          <div key={t.name + i} onDoubleClick={() => setEditTpl(t)} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--surface-2)', color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon d={ICONS[t.icon]} size={13} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <strong style={{ fontSize: 12 }}>{t.name}</strong>
                {t.readReceipt && <Badge tone="warn">leitura obrigatória</Badge>}
              </span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{t.fields.length} campos · canal padrão: {t.channel}</span>
            </span>
            <button title="Editar template" onClick={e => { e.stopPropagation(); setEditTpl(t); }} style={{ color: 'var(--text-3)', display: 'flex', padding: 6, borderRadius: 7, border: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
              <Icon d={ICONS.settings} size={13} />
            </button>
            <button title="Duplicar" onClick={e => { e.stopPropagation(); setTemplates(ts => [...ts, { ...t, name: t.name + ' (cópia)', fields: [...t.fields] }]); window.SOGI_TOAST(`Template "${t.name} (cópia)" criado`); }} style={{ color: 'var(--text-3)', display: 'flex', padding: 6, borderRadius: 7, border: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--violet)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
              <Icon d={ICONS.docs} size={13} />
            </button>
            <button title="Excluir" onClick={e => { e.stopPropagation(); setTemplates(ts => ts.filter(x => x !== t)); window.SOGI_TOAST(`Template "${t.name}" excluído`, 'warn'); }} style={{ color: 'var(--text-3)', display: 'flex', padding: 6, borderRadius: 7, border: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
              <Icon d={ICONS.trash} size={13} />
            </button>
          </div>
        ))}
        <p className="mono" style={{ margin: 0, padding: '8px var(--pad)', fontSize: 9, color: 'var(--text-3)', borderTop: '1px solid var(--border)' }}>duplo clique edita · o template define os campos que o publicador preenche</p>
      </Card>

      {/* Agendados */}
      <Card title="Publicações agendadas" pad={false}>
        {scheduled.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
            <Avatar person={s.who} size={26} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ fontSize: 12, display: 'block' }}>{s.title}</strong>
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{s.channel}</span>
            </span>
            <Badge tone="violet"><Icon d={ICONS.clock} size={10} /> {s.when}</Badge>
            <button onClick={() => window.SOGI_TOAST('Agendamento cancelado', 'warn')} style={{ color: 'var(--text-3)', display: 'flex', padding: 5 }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
              <Icon d={ICONS.x} size={14} />
            </button>
          </div>
        ))}
      </Card>

      {/* Políticas */}
      <Card title="Políticas do feed" pad={false}>
        {[
          ['approval', 'Aprovação prévia de publicações', 'posts de colaboradores passam pelo dono do canal antes de ir ao ar'],
          ['readReceipt', 'Confirmação de leitura em comunicados', 'comunicados oficiais exigem "li e estou ciente" — com relatório'],
          ['schedule', 'Agendamento de publicações', 'marketing programa campanhas com data e hora'],
          ['reactions', 'Reações e comentários', 'desative para canais somente-leitura'],
        ].map(([k, label, desc], i) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600 }}>{label}</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{desc}</span>
            </span>
            <CfSwitch on={policy[k]} onClick={() => togglePolicy(k, label)} />
          </div>
        ))}
      </Card>

      {editCh && <FeedChannelModal channel={editCh} onClose={() => setEditCh(null)} onSave={saveChannel} />}
      {editTpl && <FeedTemplateModal template={editTpl} onClose={() => setEditTpl(null)} onSave={(t, isNew) => {
        if (isNew) setTemplates(ts => [...ts, t]);
        else setTemplates(ts => ts.map(x => x === editTpl ? t : x));
        setEditTpl(null);
        window.SOGI_TOAST(`Template "${t.name}" ${isNew ? 'criado' : 'salvo'} — disponível para os publicadores`);
      }} />}
    </div>
  );
}

/* ---------- Modal: canal do feed ---------- */
function FeedChannelModal({ channel, onClose, onSave }) {
  const [name, setName] = useStateFC(channel.name);
  const [owner, setOwner] = useStateFC(channel.owner);
  const [publishers, setPublishers] = useStateFC([...channel.publishers]);
  const [audience, setAudience] = useStateFC(channel.audience);
  const isNew = !!channel.isNew;
  const inputStyle = { width: '100%', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', fontFamily: 'var(--font-ui)', background: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' };
  const togglePub = (r) => setPublishers(ps => ps.includes(r) ? ps.filter(x => x !== r) : [...ps, r]);
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(24,60,90,0.45)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'sogi-pop .15s ease' }}>
      <div data-screen-label="Canal do feed" onClick={e => e.stopPropagation()} style={{ width: 480, maxWidth: '94vw', background: 'var(--surface)', borderRadius: 14, boxShadow: 'var(--shadow-pop)', animation: 'sogi-pop .2s cubic-bezier(.3,1.3,.6,1)' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '15px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--accent-text)', display: 'flex' }}><Icon d={ICONS.megaphone} size={16} /></span>
          <strong style={{ fontSize: 14 }}>{isNew ? 'Novo canal do feed' : `Canal — ${channel.name}`}</strong>
          <span style={{ flex: 1 }}></span>
          <button onClick={onClose} style={{ color: 'var(--text-3)', display: 'flex', padding: 4 }}><Icon d={ICONS.x} size={15} /></button>
        </header>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
            Nome do canal
            <input autoFocus={isNew} value={name} onChange={e => setName(e.target.value)} placeholder="Ex.: Comercial — novidades e metas" style={inputStyle} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
              Setor dono
              <select value={owner} onChange={e => setOwner(e.target.value)} style={inputStyle}>
                {['Diretoria', 'Marketing', 'RH', 'Infraestrutura', 'Desenvolvimento', 'Comercial', 'Projetos & Gestão'].map(s => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
              Audiência
              <select value={audience} onChange={e => setAudience(e.target.value)} style={inputStyle}>
                {['Todos', 'Somente o setor', 'Gestores', 'Setores selecionados'].map(a => <option key={a}>{a}</option>)}
              </select>
            </label>
          </div>
          <div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Quem pode publicar</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {SOGI_DATA.roles.map(r => {
                const on = publishers.includes(r);
                return (
                  <button key={r} onClick={() => togglePub(r)} style={{
                    fontSize: 11.5, fontWeight: 600, borderRadius: 99, padding: '5px 13px',
                    border: on ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                    background: on ? 'var(--accent-soft)' : 'transparent',
                    color: on ? 'var(--accent-text)' : 'var(--text-3)',
                  }}>{r}</button>
                );
              })}
            </div>
            <span className="mono" style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', marginTop: 5 }}>demais papéis apenas leem, reagem e comentam</span>
          </div>
        </div>
        <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '13px 20px', borderTop: '1px solid var(--border)' }}>
          <GhostBtn onClick={onClose}>Cancelar</GhostBtn>
          <PrimaryBtn icon="check" onClick={() => {
            if (!name.trim()) { window.SOGI_TOAST('Dê um nome ao canal', 'warn'); return; }
            const { isNew: _, ...rest } = channel;
            onSave({ ...rest, name: name.trim(), owner, publishers, audience }, isNew);
          }}>{isNew ? 'Criar canal' : 'Salvar canal'}</PrimaryBtn>
        </footer>
      </div>
    </div>
  );
}

/* ---------- Modal: template de publicação ---------- */
function FeedTemplateModal({ template, onClose, onSave }) {
  const isNew = !!template.isNew;
  const [name, setName] = useStateFC(template.name || '');
  const [channel, setChannel] = useStateFC(template.channel || 'Geral');
  const [icon, setIcon] = useStateFC(template.icon || 'bell');
  const [fields, setFields] = useStateFC([...(template.fields || [])]);
  const [newField, setNewField] = useStateFC('');
  const [readReceipt, setReadReceipt] = useStateFC(!!template.readReceipt);
  const [schedule, setSchedule] = useStateFC(!!template.schedule);
  const inputStyle = { width: '100%', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', fontFamily: 'var(--font-ui)', background: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' };
  const addField = () => {
    const f = newField.trim();
    if (!f) return;
    setFields(fs => [...fs, f]);
    setNewField('');
  };
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(24,60,90,0.45)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'sogi-pop .15s ease' }}>
      <div data-screen-label="Template de publicação" onClick={e => e.stopPropagation()} style={{ width: 560, maxWidth: '94vw', maxHeight: '92vh', overflowY: 'auto', background: 'var(--surface)', borderRadius: 14, boxShadow: 'var(--shadow-pop)', animation: 'sogi-pop .2s cubic-bezier(.3,1.3,.6,1)' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '15px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--accent-text)', display: 'flex' }}><Icon d={ICONS[icon]} size={16} /></span>
          <strong style={{ fontSize: 14 }}>{isNew ? 'Novo template de publicação' : `Template — ${template.name}`}</strong>
          <span style={{ flex: 1 }}></span>
          <button onClick={onClose} style={{ color: 'var(--text-3)', display: 'flex', padding: 4 }}><Icon d={ICONS.x} size={15} /></button>
        </header>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
              Nome do template
              <input autoFocus={isNew} value={name} onChange={e => setName(e.target.value)} placeholder="Ex.: Vaga interna" style={inputStyle} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
              Canal padrão
              <select value={channel} onChange={e => setChannel(e.target.value)} style={inputStyle}>
                {['Geral', 'Marketing & Comunicação', 'RH & Pessoas', 'TI — avisos técnicos'].map(c => <option key={c}>{c}</option>)}
              </select>
            </label>
          </div>
          <div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Ícone</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {['bell', 'megaphone', 'server', 'users', 'check', 'award', 'calendar'].map(ic => (
                <button key={ic} onClick={() => setIcon(ic)} style={{
                  width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: icon === ic ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                  background: icon === ic ? 'var(--accent-soft)' : 'transparent',
                  color: icon === ic ? 'var(--accent-text)' : 'var(--text-3)',
                }}><Icon d={ICONS[ic]} size={15} /></button>
              ))}
            </div>
          </div>
          <div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Campos do formulário · {fields.length}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {fields.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--surface-2)', borderRadius: 8, padding: '7px 11px' }}>
                  <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', width: 14 }}>{i + 1}</span>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 550 }}>{f}</span>
                  <button onClick={() => setFields(fs => fs.filter((_, j) => j !== i))} style={{ color: 'var(--text-3)', display: 'flex', padding: 3 }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                    <Icon d={ICONS.x} size={12} />
                  </button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 7 }}>
                <input value={newField} onChange={e => setNewField(e.target.value)} onKeyDown={e => e.key === 'Enter' && addField()}
                  placeholder="Adicionar campo… (ex.: Link de inscrição)" style={{ ...inputStyle, flex: 1 }} />
                <button onClick={addField} style={{ width: 38, borderRadius: 8, background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon d={ICONS.plus} size={15} />
                </button>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, cursor: 'pointer' }}>
              <CfSwitch on={readReceipt} onClick={() => setReadReceipt(v => !v)} />
              Confirmação de leitura
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, cursor: 'pointer' }}>
              <CfSwitch on={schedule} onClick={() => setSchedule(v => !v)} />
              Permite agendamento
            </label>
          </div>
        </div>
        <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '13px 20px', borderTop: '1px solid var(--border)' }}>
          <GhostBtn onClick={onClose}>Cancelar</GhostBtn>
          <PrimaryBtn icon="check" onClick={() => {
            if (!name.trim()) { window.SOGI_TOAST('Dê um nome ao template', 'warn'); return; }
            if (fields.length === 0) { window.SOGI_TOAST('Adicione pelo menos 1 campo', 'warn'); return; }
            onSave({ name: name.trim(), desc: fields.slice(0, 3).join(' + ').toLowerCase(), icon, channel, fields, readReceipt, schedule }, isNew);
          }}>{isNew ? 'Criar template' : 'Salvar template'}</PrimaryBtn>
        </footer>
      </div>
    </div>
  );
}

Object.assign(window, { FeedSettings, FeedChannelModal, FeedTemplateModal });
