// SOGI — Feed corporativo estilo rede social: canais, posts, reações, comentários e PERFIS de colaboradores
const { useState: useStateFD } = React;

const FD_CHANNELS = [
  { id: 'todos', label: 'Todos os canais', icon: 'megaphone' },
  { id: 'geral', label: 'Geral', icon: 'building' },
  { id: 'mkt', label: 'Marketing', icon: 'megaphone' },
  { id: 'rh', label: 'RH & Pessoas', icon: 'users' },
  { id: 'ti', label: 'TI — avisos', icon: 'server' },
  { id: 'gamif', label: 'Conquistas', icon: 'trophy' },
];

const FD_INITIAL = [
  {
    id: 'f1', kind: 'comunicado', channel: 'ti', pinned: true, who: 'rafael', when: 'hoje, 08:00',
    title: 'Janela de manutenção — sábado 14/06, 08h às 12h',
    text: 'Equipe, neste sábado faremos a migração do banco da Vale Aço e a troca do storage. Os serviços internos podem oscilar entre 08h e 12h. O plantão será do Carlos e do Diego — chamados críticos seguem pelo telefone de emergência.',
    reactions: { '👍': 8, '🎉': 0, '❤️': 2 }, comments: [
      { who: 'carlos', when: '08:12', text: 'Confirmado! Checklist da janela já está na pasta do projeto.' },
    ],
  },
  {
    id: 'f2', kind: 'conquista', channel: 'gamif', who: 'ana', when: 'ontem, 17:30',
    title: 'Ana desbloqueou: Mestre do Kanban 🏅',
    text: '100 cards concluídos! A Ana é a segunda pessoa da empresa a alcançar esta conquista.',
    reactions: { '👍': 5, '🎉': 12, '❤️': 4 }, comments: [
      { who: 'juliana', when: 'ontem', text: 'Merecidíssimo! 👏👏' },
      { who: 'rafael', when: 'ontem', text: 'Orgulho da equipe! 🎉' },
    ],
  },
  {
    id: 'f3', kind: 'comunicado', channel: 'geral', who: 'rafael', when: 'ontem, 09:00',
    title: 'Novo cliente: Construtora Prisma 🤝',
    text: 'Fechamos o contrato de sustentação de infraestrutura com a Construtora Prisma. Kickoff na próxima segunda — o Carlos lidera a implantação. Bem-vindos a bordo!',
    reactions: { '👍': 9, '🎉': 7, '❤️': 1 }, comments: [],
  },
  {
    id: 'f4', kind: 'rh', channel: 'rh', who: 'marina', when: '06 jun',
    title: 'Aniversariante da semana 🎂',
    text: 'Sábado é aniversário do Pedro! Bolo na copa às 16h de sexta — todos convidados.',
    reactions: { '👍': 3, '🎉': 10, '❤️': 6 }, comments: [
      { who: 'pedro', when: '06 jun', text: 'Obrigado, pessoal! 😄' },
    ],
  },
  {
    id: 'f5', kind: 'mkt', channel: 'mkt', who: 'juliana', when: '05 jun',
    title: 'Nova identidade do Portal do Cliente 🎨',
    text: 'A v2 do Portal do Cliente entrou em homologação com a nova identidade visual. Confiram o preview na pasta do projeto e mandem feedback até sexta!',
    reactions: { '👍': 6, '🎉': 3, '❤️': 5 }, comments: [],
  },
];

const FD_KIND = {
  comunicado: { label: 'Comunicado', tone: 'accent', icon: 'bell' },
  conquista: { label: 'Conquista', tone: 'warn', icon: 'trophy' },
  rh: { label: 'RH & Pessoas', tone: 'ok', icon: 'users' },
  mkt: { label: 'Marketing', tone: 'violet', icon: 'megaphone' },
};

const FD_PROFILES = {
  rafael: { sector: 'Projetos & Gestão', since: 'mar 2021', bio: 'Gerente de projetos. Café, Gantt e zero atrasos (quase sempre).', skills: ['Gestão de projetos', 'ERP Senior', 'Negociação'] },
  ana: { sector: 'Desenvolvimento', since: 'jul 2022', bio: 'Full-stack. Apaixonada por migração de dados e automações.', skills: ['Node.js', 'PostgreSQL', 'ETL'] },
  carlos: { sector: 'Infraestrutura', since: 'jan 2020', bio: 'Infra e redes. Se está no ar, provavelmente fui eu que subi.', skills: ['Redes', 'Virtualização', 'Backup/DR'] },
  juliana: { sector: 'Desenvolvimento', since: 'set 2023', bio: 'UX Designer. Desenho telas que até o financeiro elogia.', skills: ['Figma', 'Design System', 'Pesquisa'] },
  pedro: { sector: 'Desenvolvimento', since: 'fev 2022', bio: 'Backend. CNAB 240 não tem segredos para mim.', skills: ['Java', 'Integrações bancárias', 'APIs'] },
  marina: { sector: 'Projetos & Gestão', since: 'mai 2023', bio: 'QA. Eu encontro o bug antes do cliente. Esse é o trato.', skills: ['Testes', 'Automação', 'Qualidade'] },
  diego: { sector: 'Infraestrutura', since: 'nov 2021', bio: 'Suporte N2. CSAT 4,9★ — atendimento é gente cuidando de gente.', skills: ['Atendimento', 'Diagnóstico', 'ITIL'] },
};

function FeedScreen({ onNavigate }) {
  const [posts, setPosts] = useStateFD(FD_INITIAL);
  const [channel, setChannel] = useStateFD('todos');
  const [profile, setProfile] = useStateFD(null); // id da pessoa
  const [draft, setDraft] = useStateFD('');
  const [myReacts, setMyReacts] = useStateFD({});
  const [commentDrafts, setCommentDrafts] = useStateFD({});
  const [pollVote, setPollVote] = useStateFD(null);

  const publish = () => {
    if (!draft.trim()) { window.SOGI_TOAST('Escreva a publicação primeiro', 'warn'); return; }
    setPosts(ps => [{
      id: 'f' + Date.now(), kind: 'comunicado', channel: channel === 'todos' ? 'geral' : channel,
      who: 'rafael', when: 'agora', title: null, text: draft.trim(),
      reactions: { '👍': 0, '🎉': 0, '❤️': 0 }, comments: [],
    }, ...ps]);
    setDraft('');
    window.SOGI_TOAST('Publicado — colaboradores da audiência foram notificados');
  };

  const react = (pid, emoji) => {
    const key = pid + emoji;
    const had = myReacts[key];
    setMyReacts(m => ({ ...m, [key]: !had }));
    setPosts(ps => ps.map(p => p.id === pid ? { ...p, reactions: { ...p.reactions, [emoji]: p.reactions[emoji] + (had ? -1 : 1) } } : p));
  };

  const comment = (pid) => {
    const text = (commentDrafts[pid] || '').trim();
    if (!text) return;
    setPosts(ps => ps.map(p => p.id === pid ? { ...p, comments: [...p.comments, { who: 'rafael', when: 'agora', text }] } : p));
    setCommentDrafts(d => ({ ...d, [pid]: '' }));
  };

  const visible = posts.filter(p => channel === 'todos' || p.channel === channel);
  const ordered = [...visible.filter(p => p.pinned), ...visible.filter(p => !p.pinned)];
  const poll = { q: 'Confraternização de julho: qual formato vocês preferem?', options: ['Churrasco no sítio', 'Jantar + boliche', 'Tarde de jogos no escritório'], votes: [4, 2, 1] };

  /* ===== Perfil do colaborador ===== */
  if (profile) {
    return <ProfilePage personId={profile} posts={posts} onBack={() => setProfile(null)} onOpenProfile={setProfile} onNavigate={onNavigate} />;
  }

  const PersonLink = ({ id, children, style }) => (
    <button onClick={() => setProfile(id)} style={{ display: 'inline-flex', textAlign: 'left', ...style }} title={`Ver perfil de ${SOGI_DATA.people[id].name.split(' ')[0]}`}>
      {children}
    </button>
  );

  return (
    <div data-screen-label="Feed corporativo" style={{ padding: 24, overflowY: 'auto', flex: 1, animation: 'sogi-fade-up .25s ease' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '210px minmax(0, 1.7fr) minmax(240px, 1fr)', gap: 14, alignItems: 'start', maxWidth: 1180, margin: '0 auto' }}>
        {/* ===== Coluna esquerda: meu perfil + canais ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'sticky', top: 0 }}>
          <button onClick={() => setProfile('rafael')} style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', overflow: 'hidden', textAlign: 'center' }}>
            <div style={{ height: 44, background: 'linear-gradient(120deg, #183c5a, #E85928)' }}></div>
            <div style={{ marginTop: -22, padding: '0 12px 13px' }}>
              <span style={{ display: 'inline-flex', border: '3px solid var(--surface)', borderRadius: '50%' }}><Avatar person="rafael" size={44} /></span>
              <strong style={{ display: 'block', fontSize: 12.5, marginTop: 4 }}>Rafael Souza</strong>
              <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Gerente de Projetos</span>
              <span className="mono" style={{ display: 'block', fontSize: 9.5, color: 'var(--accent-text)', fontWeight: 700, marginTop: 4 }}>ver meu perfil →</span>
            </div>
          </button>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
            {FD_CHANNELS.map((c, i) => (
              <button key={c.id} onClick={() => setChannel(c.id)} style={{
                display: 'flex', alignItems: 'center', gap: 9, width: '100%', textAlign: 'left', padding: '9px 13px',
                borderTop: i > 0 ? '1px solid var(--border)' : 'none', fontSize: 12,
                background: channel === c.id ? 'var(--accent-soft)' : 'transparent',
                color: channel === c.id ? 'var(--accent-text)' : 'var(--text-2)', fontWeight: channel === c.id ? 700 : 500,
              }}
                onMouseEnter={e => { if (channel !== c.id) e.currentTarget.style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { if (channel !== c.id) e.currentTarget.style.background = 'transparent'; }}>
                <Icon d={ICONS[c.icon]} size={13} />{c.label}
              </button>
            ))}
          </div>
          {/* Equipe */}
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', padding: '11px 13px' }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Colaboradores</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 9 }}>
              {Object.keys(SOGI_DATA.people).map(id => (
                <button key={id} onClick={() => setProfile(id)} title={SOGI_DATA.people[id].name} style={{ display: 'flex', transition: 'transform .12s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.12)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                  <Avatar person={id} size={30} showStatus />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ===== Coluna central: composer + posts ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', padding: 14 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Avatar person="rafael" size={32} />
              <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={2}
                placeholder={channel === 'todos' ? 'Compartilhe algo com a empresa…' : `Publicar no canal ${FD_CHANNELS.find(c => c.id === channel).label}…`}
                style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 9, padding: '9px 12px', fontSize: 13, fontFamily: 'var(--font-ui)', lineHeight: 1.5, resize: 'vertical', outline: 'none', background: 'var(--surface)', color: 'var(--text)' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 9, alignItems: 'center' }}>
              <button onClick={() => window.SOGI_TOAST('Anexe imagens à publicação', 'info')} style={{ color: 'var(--text-3)', display: 'flex', padding: 6, borderRadius: 7 }}>
                <Icon d={ICONS.paperclip} size={15} />
              </button>
              <button onClick={() => window.SOGI_TOAST('Agendamento: escolha data e hora da publicação', 'info')} style={{ color: 'var(--text-3)', display: 'flex', padding: 6, borderRadius: 7 }}>
                <Icon d={ICONS.clock} size={15} />
              </button>
              <span className="mono" style={{ fontSize: 9, color: 'var(--text-3)' }}>canal: {channel === 'todos' ? 'Geral' : FD_CHANNELS.find(c => c.id === channel).label}</span>
              <span style={{ flex: 1 }}></span>
              <PrimaryBtn icon="send" onClick={publish}>Publicar</PrimaryBtn>
            </div>
          </div>

          {ordered.map(p => {
            const k = FD_KIND[p.kind] || FD_KIND.comunicado;
            return (
              <article key={p.id} style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', padding: 16, animation: 'sogi-pop .2s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <PersonLink id={p.who}><Avatar person={p.who} size={34} showStatus /></PersonLink>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <PersonLink id={p.who}><strong style={{ fontSize: 13 }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>{SOGI_DATA.people[p.who].name}</strong></PersonLink>
                      <Badge tone={k.tone}><Icon d={ICONS[k.icon]} size={10} /> {k.label}</Badge>
                      {p.pinned && <Badge tone="neutral">📌 fixado</Badge>}
                    </span>
                    <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>{SOGI_DATA.people[p.who].role} · {p.when}</span>
                  </span>
                </div>
                {p.title && <h3 style={{ margin: '0 0 6px', fontSize: 14.5, fontWeight: 700, lineHeight: 1.35 }}>{p.title}</h3>}
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{p.text}</p>

                <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                  {Object.entries(p.reactions).map(([emoji, count]) => {
                    const mine = myReacts[p.id + emoji];
                    return (
                      <button key={emoji} onClick={() => react(p.id, emoji)} style={{
                        display: 'flex', alignItems: 'center', gap: 5, borderRadius: 99, padding: '4px 11px', fontSize: 12.5,
                        border: mine ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                        background: mine ? 'var(--accent-soft)' : 'transparent', transition: 'all .12s',
                      }}>
                        {emoji} <span className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: mine ? 'var(--accent-text)' : 'var(--text-3)' }}>{count}</span>
                      </button>
                    );
                  })}
                </div>

                {p.comments.length > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 9, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    {p.comments.map((c, i) => (
                      <div key={i} style={{ display: 'flex', gap: 9 }}>
                        <PersonLink id={c.who} style={{ flexShrink: 0 }}><Avatar person={c.who} size={24} /></PersonLink>
                        <div style={{ background: 'var(--surface-2)', borderRadius: '4px 12px 12px 12px', padding: '7px 11px', flex: 1 }}>
                          <span style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                            <strong style={{ fontSize: 11.5 }}>{SOGI_DATA.people[c.who].name.split(' ')[0]}</strong>
                            <span className="mono" style={{ fontSize: 9, color: 'var(--text-3)' }}>{c.when}</span>
                          </span>
                          <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.5 }}>{c.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 9, marginTop: 10, alignItems: 'center' }}>
                  <Avatar person="rafael" size={24} />
                  <input value={commentDrafts[p.id] || ''} onChange={e => setCommentDrafts(d => ({ ...d, [p.id]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && comment(p.id)}
                    placeholder="Comentar…"
                    style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 99, padding: '7px 13px', fontSize: 12, outline: 'none', background: 'var(--surface)', color: 'var(--text)', minWidth: 0 }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
              </article>
            );
          })}
          {ordered.length === 0 && (
            <p className="mono" style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-3)', padding: 30 }}>nenhuma publicação neste canal ainda</p>
          )}
        </div>

        {/* ===== Coluna direita ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card title="Destaques da semana" pad={false}>
            {[['ana', 'Maior pontuação da semana', '+340'], ['marina', '100% das entregas no prazo', '+180'], ['diego', 'Melhor CSAT (4,9★)', '+120']].map(([who, what, pts], i) => (
              <button key={who} onClick={() => setProfile(who)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none', width: '100%', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Avatar person={who} size={28} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: 12, display: 'block' }}>{SOGI_DATA.people[who].name.split(' ')[0]}</strong>
                  <span style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{what}</span>
                </span>
                <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--ok)' }}>{pts}</span>
              </button>
            ))}
          </Card>

          <Card title="Enquete da semana">
            <p style={{ margin: '0 0 10px', fontSize: 12.5, fontWeight: 600, lineHeight: 1.45 }}>{poll.q}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {poll.options.map((opt, i) => {
                const votes = poll.votes[i] + (pollVote === i ? 1 : 0);
                const total = poll.votes.reduce((a, b) => a + b, 0) + (pollVote !== null ? 1 : 0);
                const pct = Math.round((votes / total) * 100);
                const voted = pollVote !== null;
                return (
                  <button key={i} onClick={() => { if (pollVote === null) { setPollVote(i); window.SOGI_TOAST('Voto registrado — obrigado!'); } }} style={{
                    position: 'relative', textAlign: 'left', borderRadius: 8, padding: '9px 12px', overflow: 'hidden',
                    border: pollVote === i ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                    cursor: voted ? 'default' : 'pointer',
                  }}>
                    {voted && <span style={{ position: 'absolute', inset: 0, width: `${pct}%`, background: 'var(--accent-soft)', transition: 'width .5s ease' }}></span>}
                    <span style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12, fontWeight: 600 }}>
                      {opt}
                      {voted && <span className="mono" style={{ color: 'var(--accent-text)' }}>{pct}%</span>}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mono" style={{ margin: '8px 0 0', fontSize: 9, color: 'var(--text-3)' }}>{pollVote === null ? '7 votos até agora · anônima' : '8 votos · encerra sexta'}</p>
          </Card>

          <Card title="Aniversários de junho" pad={false}>
            {[['pedro', '14 jun', 'sábado 🎂'], ['juliana', '23 jun', 'terça']].map(([who, when, note], i) => (
              <button key={who} onClick={() => setProfile(who)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none', width: '100%', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Avatar person={who} size={28} />
                <span style={{ flex: 1 }}>
                  <strong style={{ fontSize: 12, display: 'block' }}>{SOGI_DATA.people[who].name}</strong>
                  <span style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{note}</span>
                </span>
                <span className="mono" style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--accent-text)' }}>{when}</span>
              </button>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ============ Página de perfil do colaborador ============ */
function ProfilePage({ personId, posts, onBack, onOpenProfile, onNavigate }) {
  const p = SOGI_DATA.people[personId];
  const prof = FD_PROFILES[personId] || {};
  const rank = SOGI_DATA.game.ranking.find(r => r.who === personId);
  const myPosts = posts.filter(x => x.who === personId);
  const achievements = personId === 'rafael' ? SOGI_DATA.game.achievements.filter(a => a.got) : SOGI_DATA.game.achievements.filter(a => a.got).slice(0, 2);

  return (
    <div data-screen-label="Perfil do colaborador" style={{ overflowY: 'auto', flex: 1, animation: 'sogi-fade-up .25s ease' }}>
      {/* Capa */}
      <div style={{ height: 130, background: `linear-gradient(120deg, #183c5a 30%, ${p.color})`, position: 'relative' }}>
        <button onClick={onBack} style={{
          position: 'absolute', top: 14, left: 18, display: 'flex', alignItems: 'center', gap: 7,
          background: 'rgba(255,255,255,0.92)', borderRadius: 8, padding: '7px 13px', fontSize: 12, fontWeight: 600, color: 'var(--text)',
        }}>
          <Icon d={ICONS.chevL} size={13} /> Voltar ao feed
        </button>
      </div>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 24px 32px' }}>
        {/* Cabeçalho do perfil */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', marginTop: -34, marginBottom: 18, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', border: '4px solid var(--bg)', borderRadius: '50%' }}><Avatar person={personId} size={84} showStatus /></span>
          <div style={{ flex: 1, minWidth: 200, paddingBottom: 4 }}>
            <h1 style={{ margin: 0, fontSize: 21, fontWeight: 800 }}>{p.name}</h1>
            <p style={{ margin: '3px 0 0', fontSize: 12.5, color: 'var(--text-2)' }}>{p.role} · {prof.sector} · na ITS desde {prof.since}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, paddingBottom: 6 }}>
            <GhostBtn icon="chat" onClick={() => { onNavigate && onNavigate('comunicacao'); window.SOGI_TOAST(`Abrindo conversa com ${p.name.split(' ')[0]}`); }}>Mensagem</GhostBtn>
            <GhostBtn icon="mail" onClick={() => window.SOGI_TOAST(`E-mail para ${personId}@its.com.br aberto no webmail`, 'info')}>E-mail</GhostBtn>
            {personId === 'rafael' && <PrimaryBtn icon="settings" onClick={() => window.SOGI_TOAST('Edição do próprio perfil — foto, bio e habilidades', 'info')}>Editar perfil</PrimaryBtn>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 14, alignItems: 'start' }}>
          {/* Coluna esquerda do perfil */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Card title="Sobre">
              <p style={{ margin: '0 0 12px', fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>{prof.bio}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(prof.skills || []).map(s => <Badge key={s} tone="accent">{s}</Badge>)}
              </div>
            </Card>
            <Card title="Gamificação" pad={false}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, textAlign: 'center', padding: '12px var(--pad)' }}>
                {[[rank ? rank.pts.toLocaleString('pt-BR') : '—', 'pontos'], [rank ? '#' + (SOGI_DATA.game.ranking.indexOf(rank) + 1) : '—', 'ranking'], [String(achievements.length), 'conquistas']].map(([v, l]) => (
                  <div key={l}>
                    <div className="mono" style={{ fontSize: 17, fontWeight: 800 }}>{v}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', padding: '0 var(--pad) 13px' }}>
                {achievements.map(a => (
                  <span key={a.name} title={a.name} style={{
                    width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><Icon d={ICONS[a.icon]} size={14} /></span>
                ))}
              </div>
            </Card>
            <Card title="Contato" pad={false}>
              {[['mail', `${personId}@its.com.br`], ['chat', 'chat interno · ' + (p.status === 'online' ? 'disponível agora' : p.status)], ['building', prof.sector]].map(([icon, txt], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                  <Icon d={ICONS[icon]} size={13} style={{ color: 'var(--text-3)' }} />
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text-2)' }}>{txt}</span>
                </div>
              ))}
            </Card>
          </div>

          {/* Publicações da pessoa */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
            <SectionLabel>Publicações de {p.name.split(' ')[0]} · {myPosts.length}</SectionLabel>
            {myPosts.map(post => {
              const k = FD_KIND[post.kind] || FD_KIND.comunicado;
              return (
                <article key={post.id} style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Badge tone={k.tone}><Icon d={ICONS[k.icon]} size={10} /> {k.label}</Badge>
                    <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>{post.when}</span>
                  </div>
                  {post.title && <h3 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, lineHeight: 1.35 }}>{post.title}</h3>}
                  <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>{post.text}</p>
                  <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                    {Object.entries(post.reactions).map(([e, c]) => c > 0 && <span key={e} className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{e} {c}</span>)}
                    {post.comments.length > 0 && <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>💬 {post.comments.length}</span>}
                  </div>
                </article>
              );
            })}
            {myPosts.length === 0 && (
              <p className="mono" style={{ fontSize: 11, color: 'var(--text-3)', padding: 24, textAlign: 'center', background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)' }}>
                ainda não publicou no feed — mas anda ocupado entregando 😄
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FeedScreen, ProfilePage });
