// SOGI — Gamificação: visão geral, conquistas, ranking, histórico, configurações
const { useState: useStateGM } = React;

const GM_TABS = [
  { id: 'visao', label: 'Visão geral', icon: 'dashboard' },
  { id: 'conquistas', label: 'Conquistas', icon: 'award' },
  { id: 'ranking', label: 'Ranking', icon: 'trophy' },
  { id: 'historico', label: 'Histórico', icon: 'list' },
  { id: 'config', label: 'Regras & Config', icon: 'settings' },
];

function GamificationScreen() {
  const [tab, setTab] = useStateGM('visao');
  return (
    <div data-screen-label="Gamificação" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, animation: 'sogi-fade-up .25s ease' }}>
      <div style={{ padding: '24px 24px 0' }}>
        <PageHeader title="Gamificação" subtitle="Pontos por prazo, SLA, qualidade e colaboração — engajamento saudável da equipe"
          actions={<GhostBtn icon="bell" onClick={() => window.SOGI_TOAST('Resumo semanal de pontos enviado à equipe')}>Notificar equipe</GhostBtn>} />
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)' }}>
          {GM_TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px', fontSize: 12.5,
              fontWeight: 600, color: tab === t.id ? 'var(--accent-text)' : 'var(--text-2)',
              borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1, transition: 'color .12s',
            }}>
              <Icon d={ICONS[t.icon]} size={14} />{t.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 24px' }}>
        {tab === 'visao' && <GmOverview onGoTab={setTab} />}
        {tab === 'conquistas' && <GmAchievements />}
        {tab === 'ranking' && <GmRanking />}
        {tab === 'historico' && <GmHistory />}
        {tab === 'config' && <GmConfig />}
      </div>
    </div>
  );
}

/* ---------- Visão geral ---------- */
function GmOverview({ onGoTab }) {
  const g = SOGI_DATA.game;
  const nextLevelPts = 3000;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14, maxWidth: 1100, alignItems: 'start' }}>
      {/* Meu placar */}
      <section style={{
        background: 'linear-gradient(135deg, var(--nav-bg), var(--nav-bg-2))', borderRadius: 'var(--radius)',
        padding: 'var(--pad)', color: '#fff', boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar person="rafael" size={46} />
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: 15, display: 'block' }}>Rafael Souza</strong>
            <span style={{ fontSize: 11.5, opacity: 0.75 }}>{g.me.level}</span>
          </div>
          <span style={{ textAlign: 'right' }}>
            <span className="mono" style={{ fontSize: 26, fontWeight: 700, display: 'block', lineHeight: 1 }}>{g.me.points.toLocaleString('pt-BR')}</span>
            <span style={{ fontSize: 10.5, opacity: 0.75 }}>pontos</span>
          </span>
        </div>
        {/* progresso até o próximo nível */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, opacity: 0.8, marginBottom: 5 }}>
            <span>Nível 12</span>
            <span className="mono">{g.me.points} / {nextLevelPts} → Nível 13</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
            <div style={{ width: `${(g.me.points / nextLevelPts) * 100}%`, height: '100%', borderRadius: 4, background: 'var(--accent)', transition: 'width .6s ease' }}></div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 18, marginTop: 13, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          <span style={{ fontSize: 11.5 }}><strong className="mono" style={{ fontSize: 14 }}>#{g.me.position}</strong> no ranking</span>
          <span style={{ fontSize: 11.5 }}><strong className="mono" style={{ fontSize: 14 }}>{g.me.streak}</strong> dias sem atraso 🔥</span>
          <span style={{ fontSize: 11.5 }}><strong className="mono" style={{ fontSize: 14 }}>3</strong> conquistas</span>
        </div>
      </section>

      {/* Próxima conquista */}
      <Card title="Próximas conquistas" pad={false}>
        {[
          { name: 'Especialista em Chamados', prog: 38, total: 50, unit: 'chamados sem reabertura' },
          { name: 'Parceiro da Equipe', prog: 22, total: 30, unit: 'ajudas registradas' },
          { name: 'Zero Atraso', prog: 9, total: 22, unit: 'dias úteis do mês' },
        ].map((a, i) => (
          <div key={i} style={{ padding: '12px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <strong style={{ fontSize: 12.5 }}>{a.name}</strong>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{a.prog}/{a.total}</span>
            </div>
            <div style={{ height: 7, borderRadius: 4, background: 'var(--bg)', overflow: 'hidden' }}>
              <div style={{ width: `${(a.prog / a.total) * 100}%`, height: '100%', background: 'var(--warn)', borderRadius: 4 }}></div>
            </div>
            <span style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{a.unit}</span>
          </div>
        ))}
        <button onClick={() => onGoTab('conquistas')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px var(--pad)', borderTop: '1px solid var(--border)', width: '100%', fontSize: 12, fontWeight: 600, color: 'var(--accent-text)' }}>
          Ver todas as conquistas <Icon d={ICONS.chevR} size={12} />
        </button>
      </Card>

      {/* Destaques da semana */}
      <Card title="Destaques da semana" pad={false}>
        {[
          { who: 'ana', what: 'Maior pontuação da semana', pts: '+340' },
          { who: 'marina', what: '100% das entregas no prazo', pts: '+180' },
          { who: 'diego', what: 'Melhor CSAT em chamados (4,9★)', pts: '+120' },
        ].map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
            <Avatar person={d.who} size={30} showStatus />
            <span style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ fontSize: 12.5, display: 'block' }}>{SOGI_DATA.people[d.who].name}</strong>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{d.what}</span>
            </span>
            <span className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ok)' }}>{d.pts}</span>
            <button onClick={() => window.SOGI_TOAST(`Parabéns enviado para ${SOGI_DATA.people[d.who].name.split(' ')[0]} 🎉`)} title="Parabenizar" style={{
              fontSize: 14, padding: 5, borderRadius: 7, border: '1px solid var(--border)',
            }}>👏</button>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ---------- Conquistas ---------- */
function GmAchievements() {
  const progress = { 'Especialista em Chamados': [38, 50], 'Parceiro da Equipe': [22, 30], 'Zero Atraso': [9, 22] };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12, maxWidth: 1100 }}>
      {SOGI_DATA.game.achievements.map((a, i) => {
        const prog = progress[a.name];
        return (
          <div key={i} style={{
            background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)',
            padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 9,
            opacity: a.got ? 1 : 0.8, transition: 'transform .12s, box-shadow .12s', cursor: 'default',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-pop)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}>
            <span style={{
              width: 54, height: 54, borderRadius: '50%',
              background: a.got ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'var(--surface-2)',
              color: a.got ? '#fff' : 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: a.got ? '0 4px 14px rgba(217,119,6,0.35)' : 'none',
            }}><Icon d={ICONS[a.icon]} size={24} sw={1.6} /></span>
            <strong style={{ fontSize: 13 }}>{a.name}</strong>
            <span style={{ fontSize: 11.5, color: 'var(--text-3)', lineHeight: 1.45 }}>{a.desc}</span>
            {a.got ? (
              <Badge tone="ok" dot>desbloqueada</Badge>
            ) : prog ? (
              <div style={{ width: '100%' }}>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--bg)', overflow: 'hidden', marginBottom: 4 }}>
                  <div style={{ width: `${(prog[0] / prog[1]) * 100}%`, height: '100%', background: 'var(--warn)', borderRadius: 3 }}></div>
                </div>
                <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{prog[0]}/{prog[1]}</span>
              </div>
            ) : (
              <Badge tone="neutral">bloqueada</Badge>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Ranking ---------- */
function GmRanking() {
  const [scope, setScope] = useStateGM('individual');
  const r = SOGI_DATA.game.ranking;
  const podium = [r[1], r[0], r[2]]; // 2º, 1º, 3º
  const podiumH = [74, 96, 58];
  const medal = ['🥈', '🥇', '🥉'];
  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', borderRadius: 9, padding: 4, boxShadow: 'var(--shadow-card)', width: 'fit-content', marginBottom: 16 }}>
        {[['individual', 'Individual'], ['setorial', 'Setorial'], ['corporativo', 'Corporativo']].map(([id, label]) => (
          <button key={id} onClick={() => setScope(id)} style={{
            fontSize: 12, fontWeight: 600, borderRadius: 7, padding: '6px 16px',
            background: scope === id ? 'var(--accent)' : 'transparent',
            color: scope === id ? '#fff' : 'var(--text-2)', transition: 'all .15s',
          }}>{label}</button>
        ))}
      </div>

      {scope === 'individual' && (
        <div>
          {/* Pódio */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 14, margin: '10px 0 20px' }}>
            {podium.map((p, i) => (
              <div key={p.who} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 20 }}>{medal[i]}</span>
                <Avatar person={p.who} size={i === 1 ? 52 : 42} />
                <strong style={{ fontSize: 12 }}>{SOGI_DATA.people[p.who].name.split(' ')[0]}</strong>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{p.pts.toLocaleString('pt-BR')}</span>
                <div style={{
                  width: 86, height: podiumH[i], borderRadius: '8px 8px 0 0',
                  background: i === 1 ? 'linear-gradient(180deg, var(--accent), var(--accent-strong))' : 'var(--surface)',
                  boxShadow: 'var(--shadow-card)',
                }}></div>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
            {r.map((p, i) => {
              const me = p.who === 'rafael';
              return (
                <div key={p.who} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px var(--pad)',
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                  background: me ? 'var(--accent-soft)' : 'transparent',
                }}>
                  <span className="mono" style={{
                    width: 26, height: 26, borderRadius: '50%', fontSize: 11, fontWeight: 700, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: i === 0 ? 'var(--warn)' : i < 3 ? 'var(--border-strong)' : 'var(--surface-2)',
                    color: i === 0 ? '#fff' : 'var(--text-2)',
                  }}>{i + 1}</span>
                  <Avatar person={p.who} size={30} showStatus />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 12.5, fontWeight: me ? 700 : 600 }}>{SOGI_DATA.people[p.who].name}{me && ' (você)'}</span>
                    <span style={{ display: 'block', fontSize: 10.5, color: 'var(--text-3)' }}>{SOGI_DATA.people[p.who].role}</span>
                  </span>
                  <span className="mono" style={{
                    fontSize: 10.5, fontWeight: 600, flexShrink: 0,
                    color: p.delta.startsWith('+') ? 'var(--ok)' : p.delta.startsWith('-') ? 'var(--danger)' : 'var(--text-3)',
                  }}>{p.delta !== '0' ? p.delta : '—'}</span>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 700, width: 60, textAlign: 'right' }}>{p.pts.toLocaleString('pt-BR')}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {scope === 'setorial' && (
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
          {SOGI_DATA.game.sectors.map((s, i) => {
            const max = Math.max(...SOGI_DATA.game.sectors.map(x => x.pts));
            return (
              <div key={i} style={{ padding: '13px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                  <strong>{i + 1}º · {s.name}</strong>
                  <span className="mono" style={{ fontWeight: 700 }}>{s.pts.toLocaleString('pt-BR')}</span>
                </div>
                <div style={{ height: 10, borderRadius: 5, background: 'var(--bg)', overflow: 'hidden' }}>
                  <div style={{ width: `${(s.pts / max) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: 5, transition: 'width .5s ease' }}></div>
                </div>
                <span style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{s.members} membros · média {Math.round(s.pts / s.members).toLocaleString('pt-BR')} pts</span>
              </div>
            );
          })}
        </div>
      )}

      {scope === 'corporativo' && (
        <Card title="Ranking corporativo — grupo ITS" pad={false}>
          {[['ITS Tecnologia (matriz)', 16350, 7], ['ITS Filial — São Paulo', 6890, 3]].map(([name, pts, members], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <span className="mono" style={{
                width: 26, height: 26, borderRadius: '50%', fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i === 0 ? 'var(--warn)' : 'var(--surface-2)', color: i === 0 ? '#fff' : 'var(--text-2)',
              }}>{i + 1}</span>
              <span style={{ flex: 1 }}>
                <strong style={{ fontSize: 12.5, display: 'block' }}>{name}</strong>
                <span style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{members} colaboradores ativos</span>
              </span>
              <span className="mono" style={{ fontSize: 13, fontWeight: 700 }}>{pts.toLocaleString('pt-BR')}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

/* ---------- Histórico ---------- */
function GmHistory() {
  return (
    <div style={{ maxWidth: 720 }}>
      <Card title="Histórico de pontuação — equipe" pad={false}>
        {SOGI_DATA.gameHistory.map((h, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
            <Avatar person={h.who} size={28} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 12.5, fontWeight: 500, lineHeight: 1.4 }}>{h.what}</span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{SOGI_DATA.people[h.who].name.split(' ')[0]} · {h.when}</span>
            </span>
            <span className="mono" style={{
              fontSize: 13, fontWeight: 700, flexShrink: 0,
              color: h.pts.startsWith('+') ? 'var(--ok)' : 'var(--danger)',
            }}>{h.pts}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ---------- Regras & Config ---------- */
function GmConfig() {
  const [cfg, setCfg] = useStateGM({ notif: true, rankingPublic: true, badgeFeed: true, negativos: false });
  const toggle = (k, label) => {
    setCfg(c => {
      const v = !c[k];
      window.SOGI_TOAST(`${label}: ${v ? 'ativado' : 'desativado'}`);
      return { ...c, [k]: v };
    });
  };
  const Switch = ({ on, onClick }) => (
    <button onClick={onClick} style={{
      width: 38, height: 21, borderRadius: 11, flexShrink: 0, position: 'relative',
      background: on ? 'var(--ok)' : 'var(--border-strong)', transition: 'background .2s',
    }}>
      <span style={{
        position: 'absolute', top: 2.5, left: on ? 19 : 2.5, width: 16, height: 16,
        borderRadius: '50%', background: '#fff', transition: 'left .2s cubic-bezier(.4,0,.2,1)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
      }}></span>
    </button>
  );
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: 14, maxWidth: 900, alignItems: 'start' }}>
      <Card title="Regras de pontuação" pad={false}>
        {SOGI_DATA.gameRules.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ flex: 1, fontSize: 12.5 }}>{r.rule}</span>
            <span className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: r.pts.startsWith('+') ? 'var(--ok)' : 'var(--danger)' }}>{r.pts}</span>
          </div>
        ))}
        <button onClick={() => window.SOGI_TOAST('Edição de regras — acesso de administrador', 'info')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px var(--pad)', borderTop: '1px solid var(--border)', width: '100%', fontSize: 12, fontWeight: 600, color: 'var(--accent-text)' }}>
          <Icon d={ICONS.settings} size={13} /> Editar regras
        </button>
      </Card>
      <Card title="Preferências do módulo" pad={false}>
        {[
          ['notif', 'Notificações de conquista', 'avisa no chat quando alguém desbloqueia'],
          ['rankingPublic', 'Ranking visível para todos', 'desative para ranking apenas entre gestores'],
          ['badgeFeed', 'Destaques no feed corporativo', 'publica os destaques da semana'],
          ['negativos', 'Pontos negativos por atraso', 'penaliza tarefas críticas atrasadas'],
        ].map(([k, label, desc], i) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600 }}>{label}</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{desc}</span>
            </span>
            <Switch on={cfg[k]} onClick={() => toggle(k, label)} />
          </div>
        ))}
      </Card>
    </div>
  );
}

Object.assign(window, { GamificationScreen });
