// SOGI — views do projeto: Gantt clicável, Workload com alocação, Dashboard do Projeto v2
const { useState: useStatePV } = React;

/* ============ Gantt ============ */
const GANTT_STATE = {
  done: { bg: 'var(--ok)', soft: 'var(--ok-soft)', label: 'Concluída' },
  doing: { bg: 'var(--accent)', soft: 'var(--accent-soft)', label: 'Em andamento' },
  late: { bg: 'var(--danger)', soft: 'var(--danger-soft)', label: 'Atrasada' },
  todo: { bg: 'var(--border-strong)', soft: 'var(--surface-2)', label: 'Planejada' },
  milestone: { bg: 'var(--violet)', soft: 'var(--violet-soft)', label: 'Marco' },
};

function GanttView({ onOpenTask }) {
  const days = 30;
  const today = 10;
  const [sel, setSel] = useStatePV(SOGI_DATA.gantt[2]); // CNAB selecionada
  const progressOf = (g) => g.state === 'done' ? 100 : g.state === 'milestone' ? 0 : g.state === 'late' ? 85 : g.state === 'doing' ? 55 : 0;

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: '16px 24px 24px', display: 'grid', gridTemplateColumns: '1fr 290px', gap: 14 }}>
      <div style={{ overflow: 'auto', minHeight: 0 }}>
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', overflow: 'hidden', minWidth: 800 }}>
          <div style={{ display: 'grid', gridTemplateColumns: `230px repeat(${days}, 1fr)`, borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
            <div style={{ padding: '8px 14px', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tarefa · Junho</div>
            {Array.from({ length: days }, (_, i) => (
              <div key={i} className="mono" style={{
                padding: '8px 0', textAlign: 'center', fontSize: 9,
                color: i + 1 === today ? 'var(--accent-text)' : 'var(--text-3)',
                fontWeight: i + 1 === today ? 700 : 400,
                background: i + 1 === today ? 'var(--accent-soft)' : 'transparent',
              }}>{i + 1}</div>
            ))}
          </div>
          {SOGI_DATA.gantt.map((g, gi) => {
            const st = GANTT_STATE[g.state];
            const isSel = sel && sel.name === g.name;
            const prog = progressOf(g);
            return (
              <div key={gi} onClick={() => setSel(g)} style={{
                display: 'grid', gridTemplateColumns: `230px repeat(${days}, 1fr)`,
                borderBottom: '1px solid var(--border)', position: 'relative', cursor: 'pointer',
                background: isSel ? 'var(--accent-soft)' : 'transparent', transition: 'background .12s',
              }}
                onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = isSel ? 'var(--accent-soft)' : 'transparent'; }}>
                <div style={{ padding: '9px 14px', fontSize: 12, fontWeight: isSel ? 650 : 500, display: 'flex', alignItems: 'center', gap: 8, borderRight: '1px solid var(--border)' }}>
                  <Avatar person={g.who} size={19} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</span>
                </div>
                <div style={{ gridColumn: `2 / span ${days}`, position: 'relative', minHeight: 38 }}>
                  <div style={{ position: 'absolute', left: `${((today - 0.5) / days) * 100}%`, top: 0, bottom: 0, width: 1.5, background: 'var(--accent)', opacity: 0.45 }}></div>
                  <div style={{
                    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                    left: `${((g.start - 1) / days) * 100}%`, width: `${((g.end - g.start + 1) / days) * 100}%`,
                    height: g.state === 'milestone' ? 14 : 16, borderRadius: 99,
                    background: g.state === 'todo' ? st.soft : st.soft,
                    border: g.state === 'todo' ? `1.5px dashed var(--border-strong)` : `1px solid ${st.bg}`,
                    overflow: 'hidden',
                    boxShadow: isSel ? `0 0 0 2px ${st.bg}` : 'none', transition: 'box-shadow .15s',
                  }}>
                    <div style={{ width: `${prog}%`, height: '100%', background: st.bg, borderRadius: 99 }}></div>
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ display: 'flex', gap: 16, padding: '10px 14px', flexWrap: 'wrap' }}>
            {Object.values(GANTT_STATE).map(s => (
              <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-2)' }}>
                <span style={{ width: 18, height: 7, borderRadius: 99, background: s.bg }}></span>{s.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Painel de mensuração da tarefa */}
      <div style={{ overflowY: 'auto', minHeight: 0 }}>
        {sel ? (
          <Card title="Mensuração da tarefa" action={<Badge tone={{ done: 'ok', doing: 'accent', late: 'danger', todo: 'neutral', milestone: 'violet' }[sel.state]} dot>{GANTT_STATE[sel.state].label}</Badge>}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14.5, fontWeight: 700, lineHeight: 1.4 }}>{sel.name}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 14px', fontSize: 12, alignItems: 'center' }}>
              <GLabel>Responsável</GLabel>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Avatar person={sel.who} size={20} />{SOGI_DATA.people[sel.who].name}</span>
              <GLabel>Início</GLabel><span className="mono" style={{ fontSize: 11.5 }}>{sel.start} jun</span>
              <GLabel>Término</GLabel><span className="mono" style={{ fontSize: 11.5 }}>{sel.end} jun</span>
              <GLabel>Duração</GLabel><span className="mono" style={{ fontSize: 11.5 }}>{sel.end - sel.start + 1} dias</span>
              <GLabel>Progresso</GLabel>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--bg)', overflow: 'hidden' }}>
                  <span style={{ display: 'block', width: `${progressOf(sel)}%`, height: '100%', background: GANTT_STATE[sel.state].bg, borderRadius: 3 }}></span>
                </span>
                <span className="mono" style={{ fontSize: 11, fontWeight: 700 }}>{progressOf(sel)}%</span>
              </span>
              {sel.state === 'late' && <>
                <GLabel>Desvio</GLabel>
                <span style={{ color: 'var(--danger)', fontWeight: 600, fontSize: 12 }}>+1 dia além do planejado</span>
              </>}
            </div>
            {sel.state === 'late' && (
              <div style={{ marginTop: 14, background: 'var(--danger-soft)', borderRadius: 9, padding: 11, fontSize: 11.5, color: 'var(--danger)', lineHeight: 1.5 }}>
                <strong>Impacto:</strong> bloqueia 3 tarefas da virada. Cada dia de atraso consome o buffer de 28/06.
              </div>
            )}
            <button onClick={() => onOpenTask && onOpenTask(sel.name)} style={{
              marginTop: 14, width: '100%', background: 'var(--accent)', color: '#fff', borderRadius: 8,
              padding: '9px 0', fontWeight: 600, fontSize: 12.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              Abrir tarefa completa <Icon d={ICONS.chevR} size={13} />
            </button>
          </Card>
        ) : (
          <Card><p className="mono" style={{ margin: 0, fontSize: 11, color: 'var(--text-3)', textAlign: 'center' }}>clique numa barra para mensurar</p></Card>
        )}
      </div>
    </div>
  );
}

const GLabel = ({ children }) => <span style={{ color: 'var(--text-3)', fontSize: 11.5 }}>{children}</span>;

/* ============ Workload v2 ============ */
function WorkloadView() {
  const totalOver = SOGI_DATA.workload.filter(w => w.capacity > 100).length;
  const avg = Math.round(SOGI_DATA.workload.reduce((s, w) => s + w.capacity, 0) / SOGI_DATA.workload.length);
  const free = SOGI_DATA.workload.filter(w => w.capacity < 75).length;
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 24px' }}>
      <div className="kpi-grid" style={{ maxWidth: 1040 }}>
        <KPI label="Capacidade média" value={`${avg}%`} trend="da equipe do projeto" tone="accent" icon="users" onClick={() => {}} />
        <KPI label="Sobrecarregados" value={String(totalOver)} trend="acima de 100%" tone="danger" icon="alert" onClick={() => {}} />
        <KPI label="Com folga" value={String(free)} trend="abaixo de 75%" tone="ok" icon="check" onClick={() => {}} />
        <KPI label="Horas alocadas" value="612h" trend="nas próximas 2 semanas" tone="violet" icon="clock" onClick={() => {}} />
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', padding: 'var(--pad)', maxWidth: 1040 }}>
        {/* Legenda de projetos */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
          {Object.entries(SOGI_DATA.projColors).map(([p, c]) => (
            <span key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-2)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: c }}></span>
              <span className="mono">{p}</span>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {SOGI_DATA.workloadAlloc.map((w, i) => {
            const total = w.alloc.reduce((s, [, v]) => s + v, 0);
            const over = total > 100;
            const wl = SOGI_DATA.workload.find(x => x.who === w.who);
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 4px', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 9, width: 175, flexShrink: 0 }}>
                  <Avatar person={w.who} size={28} showStatus />
                  <span style={{ lineHeight: 1.25, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600 }}>{SOGI_DATA.people[w.who].name}</span>
                    <span style={{ display: 'block', fontSize: 10.5, color: 'var(--text-3)' }}>{wl.tasks} tarefas · {wl.tickets} chamados</span>
                  </span>
                </span>
                <div style={{ flex: 1, height: 22, borderRadius: 11, background: 'var(--bg)', overflow: 'hidden', display: 'flex', position: 'relative' }}>
                  {/* marca de 100% */}
                  <div style={{ position: 'absolute', left: '71.4%', top: 0, bottom: 0, width: 1.5, background: 'var(--text-3)', opacity: 0.5, zIndex: 2 }}></div>
                  {w.alloc.map(([p, v], j) => (
                    <div key={j} title={`${p}: ${v}%`} style={{
                      width: `${(v / 140) * 100}%`, height: '100%', background: SOGI_DATA.projColors[p] || 'var(--border-strong)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      borderRight: '2px solid var(--surface)', transition: 'opacity .12s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 0.8}
                      onMouseLeave={e => e.currentTarget.style.opacity = 1}>
                      {v >= 18 && <span className="mono" style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>{v}%</span>}
                    </div>
                  ))}
                </div>
                <span className="mono" style={{ fontSize: 12.5, fontWeight: 700, width: 48, textAlign: 'right', color: over ? 'var(--danger)' : total > 85 ? 'var(--warn)' : 'var(--ok)' }}>{total}%</span>
                {over ? (
                  <button onClick={() => window.SOGI_TOAST('Sugestão de redistribuição enviada para aprovação')} style={{
                    fontSize: 11, fontWeight: 600, color: 'var(--accent-text)', background: 'var(--accent-soft)',
                    borderRadius: 7, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
                  }}><Icon d={ICONS.ai} size={11} />redistribuir</button>
                ) : <span style={{ width: 92, flexShrink: 0 }}></span>}
              </div>
            );
          })}
        </div>
        <p className="mono" style={{ margin: '12px 0 0', fontSize: 10, color: 'var(--text-3)' }}>linha vertical = 100% da capacidade · escala até 140%</p>
      </div>
    </div>
  );
}

/* ============ Dashboard do Projeto v2 ============ */
function ProjectDashboard({ project }) {
  const p = project;
  const statusDist = [
    ['Concluído', 2, 'var(--ok)'], ['Validação', 2, 'var(--warn)'], ['Em andamento', 2, 'var(--violet)'],
    ['A fazer', 2, 'var(--accent)'], ['Backlog', 2, 'var(--border-strong)'],
  ];
  const milestones = [
    { name: 'Kickoff e levantamento', when: '12 mai', state: 'done' },
    { name: 'Homologação bancária', when: '10 jun', state: 'late' },
    { name: 'Treinamento usuários-chave', when: '18 jun', state: 'todo' },
    { name: 'Virada para produção', when: '28 jun', state: 'todo' },
  ];
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 24px' }}>
      <div className="kpi-grid" style={{ maxWidth: 1080 }}>
        <KPI label="Progresso" value={`${p.progress}%`} trend={`entrega ${p.dueDate}`} tone="accent" icon="gantt" onClick={() => {}} />
        <KPI label="Tarefas abertas" value={String(p.tasksOpen)} trend={`${p.tasksDone} concluídas`} tone="violet" icon="tasks" onClick={() => {}} />
        <KPI label="Atrasadas" value="2" trend="CNAB 240 é bloqueante" tone="danger" icon="alert" onClick={() => {}} />
        <KPI label="Horas no mês" value="312h" trend="orçado: 340h (92%)" tone="ok" icon="clock" onClick={() => {}} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 14, maxWidth: 1080 }}>
        <Card title="Burndown de tarefas (jun)">
          <BurndownChart />
        </Card>
        <Card title="Distribuição por status">
          <DonutChart data={statusDist} total={10} />
        </Card>
        <Card title="Marcos do projeto" pad={false}>
          {milestones.map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: m.state === 'done' ? 'var(--ok)' : m.state === 'late' ? 'var(--danger)' : 'var(--surface-2)',
                border: m.state === 'todo' ? '1.5px solid var(--border-strong)' : 'none',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {m.state === 'done' && <Icon d={ICONS.check} size={12} sw={2.5} />}
                {m.state === 'late' && <Icon d={ICONS.alert} size={11} sw={2.2} />}
              </span>
              <span style={{ flex: 1, fontSize: 12.5, fontWeight: 550 }}>{m.name}</span>
              <span className="mono" style={{ fontSize: 10.5, color: m.state === 'late' ? 'var(--danger)' : 'var(--text-3)', fontWeight: m.state === 'late' ? 700 : 400 }}>{m.when}</span>
            </div>
          ))}
        </Card>
        <Card title="Saúde do projeto">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <HealthDot health={p.health} />
            <strong style={{ fontSize: 13 }}>{{ ok: 'Saudável', warn: 'Atenção', risk: 'Em risco' }[p.health]}</strong>
            <span style={{ flex: 1 }}></span>
            <Badge tone="accent"><Icon d={ICONS.ai} size={10} /> análise da IA</Badge>
          </div>
          <p style={{ margin: '0 0 12px', fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.55 }}>{p.healthNote}</p>
          <div style={{ background: 'var(--surface-2)', borderRadius: 9, padding: 12, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.55 }}>
            A homologação CNAB bloqueia 3 dependências da virada. Recomendo antecipar o treinamento de usuários-chave e confirmar a assinatura do termo até quinta. Probabilidade de entrega no prazo: <strong>78%</strong>.
          </div>
        </Card>
      </div>
    </div>
  );
}

function DonutChart({ data, total }) {
  const R = 52, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        {data.map(([label, v, color], i) => {
          const frac = v / total;
          const dash = `${frac * C} ${C}`;
          const offset = -acc * C;
          acc += frac;
          return <circle key={i} cx="70" cy="70" r={R} fill="none" stroke={color} strokeWidth="18"
            strokeDasharray={dash} strokeDashoffset={offset} transform="rotate(-90 70 70)" />;
        })}
        <text x="70" y="66" textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--text)">{total}</text>
        <text x="70" y="84" textAnchor="middle" fontSize="9" fill="var(--text-3)" fontFamily="var(--font-mono)">tarefas</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {data.map(([label, v, color], i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: 'var(--text-2)' }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: color }}></span>
            {label} <span className="mono" style={{ color: 'var(--text-3)', fontSize: 10.5 }}>· {v}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function BurndownChart() {
  const ideal = [45, 38, 31, 24, 17, 10, 3];
  const real = [45, 41, 36, 33, 26, 22, null];
  const W = 320, H = 150, max = 48;
  const x = i => 16 + (i / 6) * (W - 32);
  const y = v => H - 18 - (v / max) * (H - 36);
  const path = arr => arr.map((v, i) => v === null ? '' : `${i === 0 || arr[i - 1] === null ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      {[0, 12, 24, 36, 48].map(v => (
        <line key={v} x1="16" x2={W - 16} y1={y(v)} y2={y(v)} stroke="var(--border)" strokeWidth="1" />
      ))}
      <path d={path(ideal)} fill="none" stroke="var(--border-strong)" strokeWidth="2" strokeDasharray="5 4" />
      <path d={path(real)} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
      {real.map((v, i) => v !== null && <circle key={i} cx={x(i)} cy={y(v)} r="3.5" fill="var(--accent)" />)}
      <text x="16" y={H - 4} fontSize="9" fill="var(--text-3)" fontFamily="var(--font-mono)">S18</text>
      <text x={W - 36} y={H - 4} fontSize="9" fill="var(--text-3)" fontFamily="var(--font-mono)">S24</text>
    </svg>
  );
}

Object.assign(window, { GanttView, WorkloadView, ProjectDashboard, BurndownChart, DonutChart });
