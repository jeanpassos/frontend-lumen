// SOGI — Dashboard 360° · visão por nível de acesso (colaborador / gerencial / executivo)
const VIEW_LEVELS = [
  { id: 'colaborador', label: 'Minha visão', desc: 'Colaborador' },
  { id: 'gerencial', label: 'Gerencial', desc: 'Gestores' },
  { id: 'executivo', label: 'Executivo', desc: 'Diretoria' },
];

function DashboardScreen({ onNavigate, onOpenProject }) {
  const [level, setLevel] = React.useState('gerencial');
  const subtitle = {
    colaborador: 'Terça-feira, 10 de junho · Seu dia: 2 tarefas vencem hoje e você tem 4 menções não lidas.',
    gerencial: 'Terça-feira, 10 de junho · Você tem 2 tarefas vencendo hoje e 3 aprovações pendentes.',
    executivo: 'Terça-feira, 10 de junho · Visão consolidada do negócio — MRR, margem, clientes e riscos.',
  }[level];
  return (
    <div data-screen-label="Dashboard 360" style={{ padding: 24, overflowY: 'auto', flex: 1, animation: 'sogi-fade-up .25s ease' }}>
      <PageHeader
        title="Bom dia, Rafael 👋"
        subtitle={subtitle}
        actions={<>
          <GhostBtn icon="reports" onClick={() => onNavigate('relatorios')}>Relatório semanal</GhostBtn>
          <PrimaryBtn icon="plus" onClick={() => window.SOGI_NEW_TASK()}>Nova tarefa</PrimaryBtn>
        </>}
      />

      {/* Seletor de nível de visão */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', borderRadius: 10, padding: 4, boxShadow: 'var(--shadow-card)' }}>
          {VIEW_LEVELS.map(v => (
            <button key={v.id} onClick={() => setLevel(v.id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 8, padding: '6px 18px',
              background: level === v.id ? 'var(--accent)' : 'transparent', transition: 'all .15s',
            }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: level === v.id ? '#fff' : 'var(--text-2)' }}>{v.label}</span>
              <span className="mono" style={{ fontSize: 8.5, color: level === v.id ? 'rgba(255,255,255,0.75)' : 'var(--text-3)', letterSpacing: '0.05em' }}>{v.desc}</span>
            </button>
          ))}
        </div>
        <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>
          {level === 'colaborador' ? 'foco no seu dia: tarefas, menções e pontos' : level === 'gerencial' ? 'operação da equipe: projetos, aprovações e SLA' : 'negócio: receita, margem e carteira — visível só para diretoria'}
        </span>
      </div>

      {level === 'colaborador' && <DashColaborador onNavigate={onNavigate} />}
      {level === 'gerencial' && <DashGerencial onNavigate={onNavigate} onOpenProject={onOpenProject} />}
      {level === 'executivo' && <DashExecutivo onNavigate={onNavigate} />}
    </div>
  );
}

/* ============ Visão do colaborador ============ */
function DashColaborador({ onNavigate }) {
  const D = SOGI_DATA;
  const g = D.game;
  return (
    <>
      <div className="kpi-grid">
        <KPI label="Minhas tarefas hoje" value="2" trend="1 atrasada — CNAB 240" tone="danger" icon="tasks" onClick={() => onNavigate('tarefas')} />
        <KPI label="Menções não lidas" value="4" trend="3 no chat · 1 em tarefa" tone="accent" icon="chat" onClick={() => onNavigate('comunicacao')} />
        <KPI label="Meus pontos" value={g.me.points.toLocaleString('pt-BR')} trend={`#${g.me.position} no ranking · ${g.me.streak} dias sem atraso`} tone="warn" icon="trophy" onClick={() => onNavigate('gamificacao')} />
        <KPI label="Minha semana" value="5" trend="tarefas concluídas · +12% vs anterior" tone="ok" icon="check" onClick={() => onNavigate('tarefas')} />
      </div>
      <div className="dash-grid">
        <Card title="Meu dia" action={<SmallLink onClick={() => onNavigate('tarefas')}>todas as tarefas</SmallLink>} pad={false}>
          {D.myTasks.map((t, i) => (
            <div key={t.id} onClick={() => window.SOGI_OPEN_TASK && window.SOGI_OPEN_TASK()} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px var(--pad)',
              borderTop: i > 0 ? '1px solid var(--border)' : 'none', cursor: 'pointer',
              background: t.late ? 'var(--danger-soft)' : 'transparent',
            }}
              onMouseEnter={e => e.currentTarget.style.background = t.late ? 'var(--danger-soft)' : 'var(--surface-2)'}
              onMouseLeave={e => e.currentTarget.style.background = t.late ? 'var(--danger-soft)' : 'transparent'}>
              <span style={{ width: 17, height: 17, borderRadius: 5, border: '1.5px solid var(--border-strong)', flexShrink: 0 }}></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: t.late ? 'var(--danger)' : 'var(--text)' }}>{t.title}</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 2 }}>{t.project}</div>
              </div>
              <PriorityBadge p={t.priority} />
              <span style={{ fontSize: 12, fontWeight: 600, color: t.late ? 'var(--danger)' : 'var(--text-2)', width: 64, textAlign: 'right' }}>{t.due}</span>
            </div>
          ))}
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card title="Minhas menções" action={<Badge tone="accent">4</Badge>} pad={false}>
            {D.notifications.slice(0, 4).map((n, i) => (
              <div key={i} onClick={() => onNavigate('comunicacao')} style={{ display: 'flex', gap: 10, padding: '10px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none', cursor: 'pointer', alignItems: 'flex-start' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Avatar person={n.who} size={24} />
                <span style={{ flex: 1, minWidth: 0, fontSize: 12, lineHeight: 1.45 }}>
                  <strong>{SOGI_DATA.people[n.who].name.split(' ')[0]}</strong> <span style={{ color: 'var(--text-2)' }}>{n.text}</span>
                  <span className="mono" style={{ display: 'block', fontSize: 9.5, color: 'var(--text-3)', marginTop: 2 }}>{n.when}</span>
                </span>
              </div>
            ))}
          </Card>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Gamificação pessoal */}
          <section style={{ background: 'linear-gradient(135deg, var(--nav-bg), var(--nav-bg-2))', borderRadius: 'var(--radius)', padding: 'var(--pad)', color: '#fff', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <Avatar person="rafael" size={40} />
              <span style={{ flex: 1 }}>
                <strong style={{ fontSize: 13.5, display: 'block' }}>{g.me.level}</strong>
                <span style={{ fontSize: 10.5, opacity: 0.7 }}>{g.me.streak} dias sem atraso 🔥</span>
              </span>
              <span className="mono" style={{ fontSize: 20, fontWeight: 800 }}>{g.me.points.toLocaleString('pt-BR')}</span>
            </div>
            <button onClick={() => onNavigate('gamificacao')} style={{ marginTop: 12, width: '100%', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 8, padding: '7px 0', fontWeight: 600, fontSize: 11.5 }}>
              Ver conquistas e ranking →
            </button>
          </section>
          <Card title="Próximos eventos" pad={false}>
            {SOGI_DATA.events.filter(e => e.day >= 10 && e.day <= 12).slice(0, 3).map((e, i) => (
              <div key={i} onClick={() => onNavigate('calendario')} style={{ display: 'flex', gap: 10, padding: '10px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none', cursor: 'pointer', alignItems: 'center' }}
                onMouseEnter={ev => ev.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                <span className="mono" style={{ width: 34, textAlign: 'center', fontSize: 13, fontWeight: 800, color: e.day === 10 ? 'var(--accent-text)' : 'var(--text-2)', flexShrink: 0 }}>{e.day}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 12, fontWeight: 550, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.title}</span>
                  <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>{e.time || 'dia todo'}</span>
                </span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}

/* ============ Visão executiva (diretoria) ============ */
function DashExecutivo({ onNavigate }) {
  const e = SOGI_DATA.exec;
  return (
    <>
      <div className="kpi-grid">
        <KPI label="MRR (receita recorrente)" value="R$ 49k" trend="+19% no semestre" tone="ok" icon="reports" onClick={() => onNavigate('relatorios')} />
        <KPI label="Margem operacional" value="29%" trend="+7 p.p. vs janeiro" tone="accent" icon="arrowUp" onClick={() => onNavigate('relatorios')} />
        <KPI label="NPS" value={String(e.nps)} trend="zona de excelência" tone="violet" icon="award" onClick={() => onNavigate('relatorios')} />
        <KPI label="Horas faturáveis" value="68%" trend="meta: 65%" tone="ok" icon="clock" onClick={() => onNavigate('relatorios')} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
        <Card title="Carteira de clientes" pad={false}>
          {e.clients.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <HealthDot health={c.health} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600 }}>{c.name}</span>
                <span style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{c.contracts} contratos ativos</span>
              </span>
              <span className="mono" style={{ fontSize: 12.5, fontWeight: 700 }}>{c.mrr}</span>
            </div>
          ))}
          <div style={{ padding: '9px var(--pad)', borderTop: '1px solid var(--border)', background: 'var(--danger-soft)', fontSize: 11, color: 'var(--danger)', lineHeight: 1.5 }}>
            <strong>Risco de receita:</strong> Vale Aço = 41% do MRR com projeto em risco — priorize a virada do ERP.
          </div>
        </Card>
        <Card title="Saúde dos projetos × receita" pad={false}>
          {SOGI_DATA.projects.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <HealthDot health={p.health} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                <span style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{p.client} · entrega {p.dueDate}</span>
              </span>
              <ProgressBar value={p.progress} health={p.health} width={80} />
            </div>
          ))}
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card title="Análise da IA para a diretoria">
            <div style={{ background: 'var(--surface-2)', borderRadius: 9, padding: 12, fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
              O semestre fecha com <strong>MRR +19%</strong> e margem em <strong>29%</strong>. O principal risco é a concentração de receita na Vale Aço (41%) com a virada do ERP em risco. Recomendo: (1) garantir o CNAB até quinta, (2) acelerar a proposta da Construtora Prisma para diluir a carteira, (3) renovar o contrato NOC antes do go-live de 12/06.
            </div>
            <button onClick={() => onNavigate('relatorios')} style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: 'var(--accent-text)', display: 'flex', alignItems: 'center', gap: 5 }}>
              Abrir relatórios completos <Icon d={ICONS.chevR} size={12} />
            </button>
          </Card>
          <Card title="Força de trabalho">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, textAlign: 'center' }}>
              {[['7', 'colaboradores'], ['96%', 'engajamento'], ['1', 'sobrecarga']].map(([v, l]) => (
                <div key={l} style={{ background: 'var(--surface-2)', borderRadius: 9, padding: '12px 6px' }}>
                  <div className="mono" style={{ fontSize: 17, fontWeight: 700 }}>{v}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

/* ============ Visão gerencial (a original) ============ */
function DashGerencial({ onNavigate, onOpenProject }) {
  const D = SOGI_DATA;
  return (
    <>
      {/* KPIs de operação */}
      <div className="kpi-grid">
        <KPI label="Projetos ativos" value="4" trend="+1 este mês" tone="accent" icon="projects" onClick={() => onNavigate('projetos')} />
        <KPI label="Tarefas abertas" value="60" trend="12 vencem esta semana" tone="violet" icon="tasks" onClick={() => onNavigate('tarefas')} />
        <KPI label="Chamados ativos" value="5" trend="1 com SLA estourado" tone="danger" icon="tickets" onClick={() => onNavigate('chamados')} />
        <KPI label="SLA do mês" value="96,2%" trend="meta: 95%" tone="ok" icon="clock" onClick={() => onNavigate('chamados')} />
      </div>

      {/* Grid principal */}
      <div className="dash-grid">
        {/* Coluna 1 — minhas tarefas + projetos em risco */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card title="Minhas tarefas" action={<SmallLink onClick={() => onNavigate('tarefas')}>ver todas</SmallLink>} pad={false}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {D.myTasks.map((t, i) => (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px var(--pad)',
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none', cursor: 'pointer',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{
                    width: 17, height: 17, borderRadius: 5, border: '1.5px solid var(--border-strong)', flexShrink: 0,
                  }}></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 2 }}>{t.project}</div>
                  </div>
                  <PriorityBadge p={t.priority} />
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: t.late ? 'var(--danger)' : 'var(--text-2)',
                    display: 'flex', alignItems: 'center', gap: 5, width: 72, justifyContent: 'flex-end',
                  }}>
                    <Icon d={ICONS.clock} size={13} />{t.due}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Projetos" action={<SmallLink onClick={() => onNavigate('projetos')}>ver todos</SmallLink>} pad={false}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {D.projects.map((p, i) => (
                <div key={p.id} onClick={() => onOpenProject(p.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '11px var(--pad)',
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none', cursor: 'pointer',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <HealthDot health={p.health} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>{p.client} · entrega {p.dueDate}</div>
                  </div>
                  <AvatarStack ids={p.team} size={22} max={3} />
                  <ProgressBar value={p.progress} health={p.health} width={90} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Coluna 2 — aprovações + IA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card title="Aprovações pendentes" action={<Badge tone="warn">3</Badge>} pad={false}>
            {D.approvals.map((a, i) => (
              <div key={a.id} style={{ padding: '11px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Avatar person={a.who} size={22} />
                  <span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{SOGI_DATA.people[a.who].name}</span>
                  <Badge tone="neutral">{a.type}</Badge>
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.4 }}>{a.what}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-2)', fontWeight: 600 }}>{a.amount}</span>
                  <span style={{ flex: 1 }}></span>
                  <ApproveBtns />
                </div>
              </div>
            ))}
          </Card>

          <Card title="Inteligência" action={<span style={{ color: 'var(--accent-text)', display: 'flex' }}><Icon d={ICONS.ai} size={15} /></span>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {D.aiInsights.slice(0, 2).map((ins, i) => (
                <div key={i} style={{ background: 'var(--surface-2)', borderRadius: 9, padding: 11 }}>
                  <div style={{ display: 'flex', gap: 7, alignItems: 'center', marginBottom: 5 }}>
                    <Badge tone={ins.kind === 'risk' ? 'danger' : 'warn'} dot>{ins.kind === 'risk' ? 'Risco' : 'Sugestão'}</Badge>
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 3 }}>{ins.title}</div>
                  <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.45 }}>{ins.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Coluna 3 — chamados + atividade */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card title="Chamados críticos" action={<SmallLink onClick={() => onNavigate('chamados')}>central</SmallLink>} pad={false}>
            {D.tickets.slice(0, 3).map((tk, i) => (
              <div key={tk.id} style={{ padding: '10px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{tk.id}</span>
                  <SLABadge state={tk.slaState} time={tk.sla} />
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 500, margin: '5px 0 3px', lineHeight: 1.35 }}>{tk.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{tk.client}</div>
              </div>
            ))}
          </Card>

          <Card title="Atividade da equipe" pad={false}>
            {D.activity.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '9px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none', alignItems: 'flex-start' }}>
                <Avatar person={a.who} size={24} />
                <div style={{ flex: 1, minWidth: 0, fontSize: 12, lineHeight: 1.45 }}>
                  <span style={{ fontWeight: 600 }}>{SOGI_DATA.people[a.who].name.split(' ')[0]}</span>{' '}
                  <span style={{ color: 'var(--text-2)' }}>{a.what}</span>{' '}
                  <span style={{ fontWeight: 500 }}>{a.target}</span>
                  <span className="mono" style={{ display: 'block', fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{a.when}</span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}

/* ---------- peças do dashboard ---------- */
function KPI({ label, value, trend, tone, icon, onClick }) {
  const t = TONE[tone];
  return (
    <button onClick={onClick} style={{
      background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)',
      padding: 'var(--pad)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2,
      transition: 'transform .12s, box-shadow .12s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-pop)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>{label}</span>
        <span style={{ width: 30, height: 30, borderRadius: 8, background: t.bg, color: t.fg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon d={ICONS[icon]} size={15} />
        </span>
      </div>
      <span style={{ fontSize: 27, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 4 }}>{trend}</span>
    </button>
  );
}

function HealthDot({ health }) {
  const c = { ok: 'var(--ok)', warn: 'var(--warn)', risk: 'var(--danger)' }[health];
  return <span title={{ ok: 'Saudável', warn: 'Atenção', risk: 'Em risco' }[health]}
    style={{ width: 9, height: 9, borderRadius: '50%', background: c, flexShrink: 0 }}></span>;
}

function ProgressBar({ value, health = 'ok', width = 100 }) {
  const c = { ok: 'var(--accent)', warn: 'var(--warn)', risk: 'var(--danger)' }[health];
  return (
    <div style={{ width, flexShrink: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--text-3)', marginBottom: 3 }}>
        <span className="mono">{value}%</span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: 'var(--bg)', overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', borderRadius: 3, background: c, transition: 'width .4s ease' }}></div>
      </div>
    </div>
  );
}

function SLABadge({ state, time }) {
  const tone = { ok: 'ok', warn: 'warn', breach: 'danger' }[state];
  const label = state === 'breach' ? `SLA estourado` : `SLA ${time}`;
  return <Badge tone={tone} dot>{label}</Badge>;
}

function SmallLink({ children, onClick }) {
  return (
    <button onClick={onClick} style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-text)' }}>{children}</button>
  );
}

function ApproveBtns() {
  const [state, setState] = React.useState(null);
  if (state === 'ok') return <Badge tone="ok" dot>Aprovado</Badge>;
  if (state === 'no') return <Badge tone="danger" dot>Recusado</Badge>;
  return (
    <span style={{ display: 'flex', gap: 6 }}>
      <button onClick={() => setState('no')} style={{
        fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)', border: '1px solid var(--border)',
        borderRadius: 7, padding: '4px 10px',
      }}>Recusar</button>
      <button onClick={() => setState('ok')} style={{
        fontSize: 11.5, fontWeight: 600, color: '#fff', background: 'var(--ok)', borderRadius: 7, padding: '4px 10px',
      }}>Aprovar</button>
    </span>
  );
}

Object.assign(window, { DashboardScreen, DashGerencial, DashColaborador, DashExecutivo, KPI, HealthDot, ProgressBar, SLABadge, SmallLink });
