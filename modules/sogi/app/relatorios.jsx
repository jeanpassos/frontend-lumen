// SOGI — Relatórios: Visão 360°, Operação, Executivo (CEO), IA — com atualização em tempo real
const { useState: useStateRP, useEffect: useEffectRP } = React;

const RP_TABS = [
  { id: '360', label: 'Visão 360°', icon: 'dashboard' },
  { id: 'ops', label: 'Operação', icon: 'users' },
  { id: 'exec', label: 'Executivo', icon: 'reports' },
  { id: 'ia', label: 'Visão da IA', icon: 'ai' },
  { id: 'builder', label: 'Meus dashboards', icon: 'plus' },
];

function ReportsScreen() {
  const [tab, setTab] = useStateRP('360');
  const [tick, setTick] = useStateRP(0);
  useEffectRP(() => {
    const id = setInterval(() => setTick(t => t + 1), 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div data-screen-label="Relatórios" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, animation: 'sogi-fade-up .25s ease' }}>
      <div style={{ padding: '24px 24px 0' }}>
        <PageHeader title="Relatórios"
          subtitle={
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              Indicadores consolidados da operação
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--ok-soft)', color: 'var(--ok)', borderRadius: 99, padding: '2px 10px', fontSize: 10.5, fontWeight: 700 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)', animation: 'sogi-rt-pulse 1.6s infinite' }}></span>
                TEMPO REAL
              </span>
            </span>
          }
          actions={<>
            <GhostBtn icon="download" onClick={() => window.SOGI_TOAST('Exportando relatório consolidado (PDF)…')}>Exportar</GhostBtn>
            <PrimaryBtn icon="ai" onClick={() => window.SOGI_TOAST('A IA está montando seu relatório executivo…', 'info')}>Relatório com IA</PrimaryBtn>
          </>} />
        <style>{`@keyframes sogi-rt-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
        <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)' }}>
          {RP_TABS.map(t => (
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
        {tab === '360' && <Report360 tick={tick} />}
        {tab === 'ops' && <ReportOps tick={tick} />}
        {tab === 'exec' && <ReportExec tick={tick} />}
        {tab === 'ia' && <ReportAI />}
        {tab === 'builder' && <ReportBuilder />}
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */
const jit = (tick, base, amp = 1) => base + Math.round(Math.sin(tick * 1.7 + base) * amp);

function RPLineChart({ data, labels, color, unit = '', goal, min: minIn, max: maxIn }) {
  const min = minIn ?? Math.min(...data) - 2, max = maxIn ?? Math.max(...data) + 2;
  const W = 320, H = 150;
  const x = i => 20 + (i / (data.length - 1)) * (W - 40);
  const y = v => H - 24 - ((v - min) / (max - min)) * (H - 48);
  const pts = data.map((d, i) => `${x(i)},${y(d)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      {goal != null && <>
        <line x1="20" x2={W - 20} y1={y(goal)} y2={y(goal)} stroke="var(--danger)" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.5" />
        <text x={W - 20} y={y(goal) - 5} fontSize="8.5" fill="var(--danger)" textAnchor="end" fontFamily="var(--font-mono)">meta {goal}{unit}</text>
      </>}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d)} r="3.5" fill={color} />
          <text x={x(i)} y={y(d) - 9} fontSize="8.5" fill="var(--text-2)" textAnchor="middle" fontFamily="var(--font-mono)">{String(d).replace('.', ',')}{unit}</text>
          <text x={x(i)} y={H - 6} fontSize="9" fill="var(--text-3)" textAnchor="middle" fontFamily="var(--font-mono)">{labels[i]}</text>
        </g>
      ))}
    </svg>
  );
}

function RPBars({ data, labels, color, highlight = -1 }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, paddingTop: 8 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, height: '100%', justifyContent: 'flex-end' }}>
          <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-2)', fontWeight: 600 }}>{v}</span>
          <div style={{
            width: '100%', maxWidth: 34, height: `${(v / max) * 100}%`, minHeight: 5,
            background: i === highlight ? 'var(--warn)' : color, borderRadius: 6,
            transition: 'height .6s cubic-bezier(.4,0,.2,1)', cursor: 'pointer',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.75}
            onMouseLeave={e => e.currentTarget.style.opacity = 1}></div>
          <span className="mono" style={{ fontSize: 9, color: 'var(--text-3)' }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Visão 360° ---------- */
function Report360({ tick }) {
  const tpd = SOGI_DATA.ticketsPerDay.map((v, i) => i === 6 ? jit(tick, v, 1.4) : v);
  return (
    <div>
      <div className="kpi-grid" style={{ maxWidth: 1100 }}>
        <KPI label="Tarefas concluídas (mês)" value={String(93 + (tick % 3 === 0 ? 1 : 0))} trend="+12% vs maio" tone="accent" icon="tasks" onClick={() => {}} />
        <KPI label="SLA do mês" value="96,2%" trend="meta: 95%" tone="ok" icon="clock" onClick={() => {}} />
        <KPI label="Chamados ativos" value={String(jit(tick, 5, 0.6))} trend="1 crítico" tone="danger" icon="tickets" onClick={() => {}} />
        <KPI label="Usuários online" value={String(jit(tick, 5, 1))} trend="de 7 ativos" tone="violet" icon="users" onClick={() => {}} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 14, maxWidth: 1100 }}>
        <Card title="Tarefas concluídas por semana">
          <RPBars data={SOGI_DATA.reportWeekly.map(w => w.done)} labels={SOGI_DATA.reportWeekly.map(w => w.w)} color="var(--accent)" />
        </Card>
        <Card title="SLA de chamados (%)">
          <RPLineChart data={SOGI_DATA.reportSLA.map(d => d.v)} labels={SOGI_DATA.reportSLA.map(d => d.m)} color="var(--ok)" unit="" goal={95} min={90} max={100} />
        </Card>
        <Card title="Chamados por dia (últimos 7)">
          <RPBars data={tpd} labels={['qua', 'qui', 'sex', 'sáb', 'dom', 'seg', 'hoje']} color="var(--violet)" highlight={6} />
        </Card>
        <Card title="Horas por projeto (jun)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 6 }}>
            {SOGI_DATA.reportHours.map((h, i) => {
              const maxH = Math.max(...SOGI_DATA.reportHours.map(x => x.h));
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}>
                    <span className="mono" style={{ fontWeight: 600, color: 'var(--text-2)' }}>{h.p}</span>
                    <span className="mono" style={{ color: 'var(--text-3)' }}>{h.h}h</span>
                  </div>
                  <div style={{ height: 10, borderRadius: 5, background: 'var(--bg)', overflow: 'hidden' }}>
                    <div style={{ width: `${(h.h / maxH) * 100}%`, height: '100%', background: SOGI_DATA.projColors[h.p] || h.color, borderRadius: 5, transition: 'width .5s ease' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------- Operação ---------- */
function ReportOps({ tick }) {
  const maxDone = Math.max(...SOGI_DATA.opsByPerson.map(o => o.done));
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 14, maxWidth: 1100, alignItems: 'start' }}>
      <Card title="Produtividade por pessoa (jun)" pad={false}>
        {SOGI_DATA.opsByPerson.map((o, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
            <Avatar person={o.who} size={28} showStatus />
            <span style={{ width: 110, fontSize: 12.5, fontWeight: 600, flexShrink: 0 }}>{SOGI_DATA.people[o.who].name.split(' ')[0]}</span>
            <div style={{ flex: 1, height: 14, borderRadius: 7, background: 'var(--bg)', overflow: 'hidden' }}>
              <div style={{ width: `${(o.done / maxDone) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6, transition: 'width .5s ease' }}>
                <span className="mono" style={{ fontSize: 8.5, color: '#fff', fontWeight: 700 }}>{o.done}</span>
              </div>
            </div>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)', width: 42, textAlign: 'right', flexShrink: 0 }}>{o.hours}h</span>
          </div>
        ))}
        <p className="mono" style={{ margin: 0, padding: '9px var(--pad)', fontSize: 9.5, color: 'var(--text-3)', borderTop: '1px solid var(--border)' }}>barra = tarefas concluídas · número à direita = horas apontadas</p>
      </Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Card title="Throughput da operação">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, textAlign: 'center' }}>
            {[['Lead time médio', '3,4 dias'], ['Cycle time', '1,8 dias'], ['Retrabalho', '6%'], ['1ª resposta (chamados)', SOGI_DATA.ticketStats.avgFirstResponse], ['Reaberturas', '2'], ['CSAT', SOGI_DATA.ticketStats.csat + ' ★']].map(([l, v]) => (
              <div key={l} style={{ background: 'var(--surface-2)', borderRadius: 9, padding: '12px 6px' }}>
                <div className="mono" style={{ fontSize: 16, fontWeight: 700 }}>{v}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3, lineHeight: 1.3 }}>{l}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="SLA por prioridade">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, paddingTop: 4 }}>
            {[['Crítica', 89, 'var(--danger)'], ['Alta', 95, 'var(--warn)'], ['Média', 99, 'var(--accent)'], ['Baixa', 100, 'var(--ok)']].map(([l, v, c]) => (
              <div key={l}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-2)' }}>{l}</span>
                  <span className="mono" style={{ color: v < 95 ? 'var(--danger)' : 'var(--text-3)', fontWeight: v < 95 ? 700 : 400 }}>{v}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: 'var(--bg)', overflow: 'hidden' }}>
                  <div style={{ width: `${v}%`, height: '100%', background: c, borderRadius: 4 }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------- Executivo ---------- */
function ReportExec({ tick }) {
  const e = SOGI_DATA.exec;
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  return (
    <div>
      <div className="kpi-grid" style={{ maxWidth: 1100 }}>
        <KPI label="MRR (receita recorrente)" value="R$ 49k" trend="+19% no semestre" tone="ok" icon="reports" onClick={() => {}} />
        <KPI label="Margem operacional" value="29%" trend="+7 p.p. vs jan" tone="accent" icon="arrowUp" onClick={() => {}} />
        <KPI label="NPS" value={String(e.nps)} trend="zona de excelência" tone="violet" icon="award" onClick={() => {}} />
        <KPI label="Horas faturáveis" value="68%" trend="meta: 65%" tone="ok" icon="clock" onClick={() => {}} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 14, maxWidth: 1100 }}>
        <Card title="MRR — R$ mil">
          <RPLineChart data={e.mrr} labels={months} color="var(--ok)" />
        </Card>
        <Card title="Margem operacional (%)">
          <RPLineChart data={e.margin} labels={months} color="var(--accent)" />
        </Card>
        <Card title="Alocação de horas">
          <DonutChart total={100} data={[
            ['Faturáveis', e.billableSplit.billable, 'var(--ok)'],
            ['Internas', e.billableSplit.internal, 'var(--accent)'],
            ['Bench', e.billableSplit.bench, 'var(--border-strong)'],
          ]} />
        </Card>
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
            <strong>Atenção:</strong> Vale Aço representa 41% do MRR e está com projeto em risco — priorize a virada do ERP.
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------- Visão da IA ---------- */
function ReportAI() {
  const f = SOGI_DATA.exec.forecast;
  const W = 320, H = 160;
  const x = i => 20 + (i / 5) * (W - 40);
  const y = v => H - 24 - (v / 100) * (H - 48);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 14, maxWidth: 1100, alignItems: 'start' }}>
      <Card title="Previsão de entrega — ERP-MIG" action={<Badge tone="accent"><Icon d={ICONS.ai} size={10} /> forecast</Badge>}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
          {[0, 25, 50, 75, 100].map(v => (
            <line key={v} x1="20" x2={W - 20} y1={y(v)} y2={y(v)} stroke="var(--border)" strokeWidth="1" />
          ))}
          <polyline points={f.projected.slice(0, 2).map((v, i) => `${x(i)},${y(v)}`).join(' ')} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
          <polyline points={f.projected.map((v, i) => `${x(i)},${y(v)}`).join(' ')} fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="5 5" opacity="0.55" />
          {f.projected.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3.2" fill={i < 2 ? 'var(--accent)' : 'var(--surface)'} stroke="var(--accent)" strokeWidth="1.6" />)}
          <text x={x(0)} y={H - 6} fontSize="8.5" fill="var(--text-3)" textAnchor="middle" fontFamily="var(--font-mono)">hoje</text>
          <text x={x(5)} y={H - 6} fontSize="8.5" fill="var(--text-3)" textAnchor="middle" fontFamily="var(--font-mono)">28/06</text>
          <text x={x(5)} y={y(100) - 8} fontSize="9" fill="var(--ok)" textAnchor="end" fontFamily="var(--font-mono)" fontWeight="700">100%</text>
        </svg>
        <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.55 }}>{f.risk}</p>
      </Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Card title="Insights da IA" pad={false}>
          {SOGI_DATA.aiInsights.map((ins, i) => (
            <div key={i} style={{ padding: '12px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <Badge tone={ins.kind === 'risk' ? 'danger' : ins.kind === 'suggest' ? 'warn' : 'accent'} dot>
                {ins.kind === 'risk' ? 'Risco' : ins.kind === 'suggest' ? 'Sugestão' : 'Automático'}
              </Badge>
              <h4 style={{ margin: '7px 0 3px', fontSize: 12.5, fontWeight: 650 }}>{ins.title}</h4>
              <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.5 }}>{ins.text}</p>
            </div>
          ))}
        </Card>
        <Card title="Recomendações da semana">
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.9 }}>
            <li>Garantir assinatura do termo CNAB até <strong>quinta (12/06)</strong>.</li>
            <li>Redistribuir 2 chamados do Carlos para o Diego.</li>
            <li>Antecipar treinamento de usuários-chave para 16/06.</li>
            <li>Agendar revisão de margem do contrato Prisma.</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}

/* ---------- Builder: meus dashboards ---------- */
const BUILDER_SAMPLES = {
  kpi: { title: 'Cartão KPI', render: () => (
    <div>
      <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>96,2%</span>
      <span style={{ fontSize: 11.5, color: 'var(--text-3)', display: 'block', marginTop: 3 }}>SLA do mês · meta 95%</span>
    </div>
  ) },
  bars: { title: 'Barras — tarefas/semana', render: () => (
    <RPBars data={SOGI_DATA.reportWeekly.map(w => w.done)} labels={SOGI_DATA.reportWeekly.map(w => w.w)} color="var(--accent)" />
  ) },
  line: { title: 'Linha — SLA (%)', render: () => (
    <RPLineChart data={SOGI_DATA.reportSLA.map(d => d.v)} labels={SOGI_DATA.reportSLA.map(d => d.m)} color="var(--ok)" goal={95} min={90} max={100} />
  ) },
  donut: { title: 'Donut — horas', render: () => (
    <DonutChart total={100} data={[['Faturáveis', 68, 'var(--ok)'], ['Internas', 22, 'var(--accent)'], ['Bench', 10, 'var(--border-strong)']]} />
  ) },
  table: { title: 'Tabela — top clientes', render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {SOGI_DATA.exec.clients.slice(0, 3).map((c, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
          <span style={{ fontWeight: 600 }}>{c.name}</span>
          <span className="mono">{c.mrr}</span>
        </div>
      ))}
    </div>
  ) },
  tickets: { title: 'Chamados por dia', render: () => (
    <RPBars data={SOGI_DATA.ticketsPerDay} labels={['qua', 'qui', 'sex', 'sáb', 'dom', 'seg', 'hoje']} color="var(--violet)" highlight={6} />
  ) },
  email: { title: 'E-mails — enviados × recebidos', render: () => (
    <div>
      <RPBars data={SOGI_DATA.emailStats.received} labels={['S', 'T', 'Q', 'Q', 'S', 'S', 'D']} color="var(--violet)" />
      <div style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: 10.5, color: 'var(--text-3)' }}>
        <span><strong className="mono" style={{ color: 'var(--text)' }}>441</strong> recebidos</span>
        <span><strong className="mono" style={{ color: 'var(--text)' }}>306</strong> enviados</span>
        <span><strong className="mono" style={{ color: 'var(--text)' }}>1,4h</strong> tempo médio de resposta</span>
      </div>
    </div>
  ) },
  project: { title: 'Saúde do projeto', scoped: true, render: (scope) => {
    if (scope === 'Geral') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {SOGI_DATA.projects.map(p => (
            <div key={p.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                <HealthDot health={p.health} />
                <span className="mono" style={{ fontSize: 10.5, fontWeight: 700, flex: 1 }}>{p.code}</span>
                <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{p.progress}% · {p.dueDate}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--bg)', overflow: 'hidden' }}>
                <div style={{ width: `${p.progress}%`, height: '100%', background: { ok: 'var(--ok)', warn: 'var(--warn)', risk: 'var(--danger)' }[p.health], borderRadius: 3 }}></div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    const p = SOGI_DATA.projects.find(x => x.code === scope) || SOGI_DATA.projects[0];
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
          <HealthDot health={p.health} />
          <strong style={{ fontSize: 13 }}>{p.name}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>
          <span>Progresso</span><span className="mono">{p.progress}% · até {p.dueDate}</span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: 'var(--bg)', overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ width: `${p.progress}%`, height: '100%', background: { ok: 'var(--ok)', warn: 'var(--warn)', risk: 'var(--danger)' }[p.health], borderRadius: 4 }}></div>
        </div>
        <span style={{ fontSize: 11.5, color: 'var(--text-2)' }}>{p.tasksOpen} tarefas abertas · {p.tasksDone} concluídas</span>
      </div>
    );
  } },
  burndown: { title: 'Burndown do projeto', scoped: true, render: () => <BurndownChart /> },
  gamification: { title: 'Top 3 — gamificação', render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {SOGI_DATA.game.ranking.slice(0, 3).map((r, i) => (
        <div key={r.who} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ fontSize: 15 }}>{['🥇', '🥈', '🥉'][i]}</span>
          <Avatar person={r.who} size={22} />
          <span style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{SOGI_DATA.people[r.who].name.split(' ')[0]}</span>
          <span className="mono" style={{ fontSize: 11.5, fontWeight: 700 }}>{r.pts.toLocaleString('pt-BR')}</span>
        </div>
      ))}
    </div>
  ) },
  slaprio: { title: 'SLA por prioridade', render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {[['Crítica', 89, 'var(--danger)'], ['Alta', 95, 'var(--warn)'], ['Média', 99, 'var(--accent)'], ['Baixa', 100, 'var(--ok)']].map(([l, v, c]) => (
        <div key={l}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
            <span style={{ fontWeight: 600, color: 'var(--text-2)' }}>{l}</span>
            <span className="mono" style={{ color: 'var(--text-3)' }}>{v}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'var(--bg)', overflow: 'hidden' }}>
            <div style={{ width: `${v}%`, height: '100%', background: c, borderRadius: 3 }}></div>
          </div>
        </div>
      ))}
    </div>
  ) },
  workload: { title: 'Carga da equipe', render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {SOGI_DATA.workload.slice(0, 4).map((w, i) => {
        const over = w.capacity > 100;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Avatar person={w.who} size={20} />
            <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--bg)', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(w.capacity, 100)}%`, height: '100%', background: over ? 'var(--danger)' : 'var(--accent)', borderRadius: 4 }}></div>
            </div>
            <span className="mono" style={{ fontSize: 10.5, fontWeight: 700, width: 38, textAlign: 'right', color: over ? 'var(--danger)' : 'var(--text-2)' }}>{w.capacity}%</span>
          </div>
        );
      })}
    </div>
  ) },
};

function ReportBuilder() {
  const [widgets, setWidgets] = useStateRP([{ id: 1, type: 'kpi' }, { id: 2, type: 'line' }, { id: 3, type: 'project' }]);
  const [scope, setScope] = useStateRP('Geral');
  const [dragIdx, setDragIdx] = useStateRP(null);
  const [saved, setSaved] = useStateRP([
    { name: 'Visão da diretoria', scope: 'Geral', widgets: [{ id: 901, type: 'kpi' }, { id: 902, type: 'line' }, { id: 903, type: 'donut' }, { id: 904, type: 'table' }] },
    { name: 'Acompanhamento ERP-MIG', scope: 'ERP-MIG', widgets: [{ id: 911, type: 'project' }, { id: 912, type: 'burndown' }, { id: 913, type: 'workload' }] },
  ]);
  const [activeName, setActiveName] = useStateRP(null);
  const [nameOpen, setNameOpen] = useStateRP(false);
  const [dashName, setDashName] = useStateRP('');
  const nextId = React.useRef(10);

  const openSaved = (s) => {
    setWidgets(s.widgets.map(w => ({ ...w })));
    setScope(s.scope || 'Geral');
    setActiveName(s.name);
    window.SOGI_TOAST(`Dashboard "${s.name}" carregado — edite e salve novamente`);
  };

  const add = (type) => { setWidgets(ws => [...ws, { id: nextId.current++, type }]); };
  const remove = (id) => setWidgets(ws => ws.filter(w => w.id !== id));
  const onDropCard = (idx) => {
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); return; }
    setWidgets(ws => {
      const arr = [...ws];
      const [moved] = arr.splice(dragIdx, 1);
      arr.splice(idx, 0, moved);
      return arr;
    });
    setDragIdx(null);
  };
  const save = () => {
    if (!dashName.trim()) { window.SOGI_TOAST('Dê um nome ao dashboard', 'warn'); return; }
    const entry = { name: dashName.trim(), scope, widgets: widgets.map(w => ({ ...w })) };
    setSaved(s => {
      const idx = s.findIndex(x => x.name === entry.name);
      if (idx >= 0) { const copy = [...s]; copy[idx] = entry; return copy; }
      return [...s, entry];
    });
    setActiveName(entry.name);
    window.SOGI_TOAST(`Dashboard "${entry.name}" salvo — disponível em "Dashboards salvos"`);
    setDashName(''); setNameOpen(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr', gap: 14, alignItems: 'start', maxWidth: 1100 }}>
      {/* Paleta + salvos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card title="Adicionar card" pad={false}>
          {SOGI_DATA.builderWidgets.map((w, i) => (
            <button key={w.type} onClick={() => add(w.type)} style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: '10px var(--pad)', width: '100%', textAlign: 'left',
              borderTop: i > 0 ? '1px solid var(--border)' : 'none', fontSize: 12.5, fontWeight: 550, color: 'var(--text-2)',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ color: 'var(--accent-text)', display: 'flex' }}><Icon d={ICONS.plus} size={13} /></span>
              {w.label}
            </button>
          ))}
        </Card>
        <Card title="Dashboards salvos" pad={false}>
          {saved.map((s, i) => {
            const isActive = activeName === s.name;
            return (
            <button key={i} onClick={() => openSaved(s)} style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: '10px var(--pad)', width: '100%', textAlign: 'left',
              borderTop: i > 0 ? '1px solid var(--border)' : 'none', fontSize: 12.5,
              background: isActive ? 'var(--accent-soft)' : 'transparent',
              color: isActive ? 'var(--accent-text)' : 'var(--text)',
            }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-2)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
              <Icon d={ICONS.dashboard} size={13} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</span>
                <span className="mono" style={{ fontSize: 9, color: 'var(--text-3)' }}>{s.widgets.length} cards · {s.scope}</span>
              </span>
              {isActive && <Icon d={ICONS.check} size={13} sw={2.4} />}
            </button>
          );})}
          <p className="mono" style={{ margin: 0, padding: '8px var(--pad)', fontSize: 9, color: 'var(--text-3)', borderTop: '1px solid var(--border)', lineHeight: 1.5 }}>clique para abrir · salvar com o mesmo nome atualiza</p>
        </Card>
      </div>

      {/* Canvas */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          {activeName && <Badge tone="accent" dot>editando: {activeName}</Badge>}
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>arraste para reordenar · salve com nome</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)' }}>
            Escopo:
            <select value={scope} onChange={e => { setScope(e.target.value); window.SOGI_TOAST(e.target.value === 'Geral' ? 'Visão gerencial: todos os projetos' : `Cards de projeto agora mostram ${e.target.value}`); }} style={{
              border: '1px solid var(--border)', borderRadius: 7, padding: '5px 8px', fontSize: 11.5,
              fontFamily: 'var(--font-ui)', background: 'var(--surface)', color: 'var(--text)',
            }}>
              <option value="Geral">Geral (todos os projetos)</option>
              {SOGI_DATA.projects.map(p => <option key={p.code} value={p.code}>{p.code}</option>)}
            </select>
          </span>
          <span style={{ flex: 1 }}></span>
          {nameOpen ? (
            <span style={{ display: 'flex', gap: 7 }}>
              <input autoFocus value={dashName} onChange={e => setDashName(e.target.value)} onKeyDown={e => e.key === 'Enter' && save()}
                placeholder={activeName || 'Nome do dashboard…'}
                style={{ border: '1px solid var(--border)', borderRadius: 7, padding: '7px 10px', fontSize: 12, outline: 'none', width: 190 }} />
              <PrimaryBtn icon="check" onClick={save}>Salvar</PrimaryBtn>
            </span>
          ) : (
            <PrimaryBtn icon="check" onClick={() => { setDashName(activeName || ''); setNameOpen(true); }}>Salvar dashboard</PrimaryBtn>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 12 }}>
          {widgets.map((w, idx) => {
            const sample = BUILDER_SAMPLES[w.type];
            return (
              <div key={w.id} draggable
                onDragStart={() => setDragIdx(idx)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => onDropCard(idx)}
                onDragEnd={() => setDragIdx(null)}
                style={{
                  background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)',
                  padding: 14, cursor: 'grab', opacity: dragIdx === idx ? 0.45 : 1,
                  outline: dragIdx === idx ? '2px dashed var(--accent)' : 'none',
                  transition: 'opacity .12s', animation: 'sogi-pop .18s ease',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Icon d={ICONS.dots} size={13} style={{ color: 'var(--text-3)' }} />
                  <strong style={{ fontSize: 12.5, flex: 1 }}>{sample.title}{sample.scoped ? ` · ${scope}` : ''}</strong>
                  <button onClick={() => remove(w.id)} style={{ color: 'var(--text-3)', display: 'flex', padding: 3 }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                    <Icon d={ICONS.x} size={13} />
                  </button>
                </div>
                {sample.render(scope)}
              </div>
            );
          })}
          {widgets.length === 0 && (
            <div className="mono" style={{ gridColumn: '1 / -1', border: '1.5px dashed var(--border-strong)', borderRadius: 12, padding: '40px 0', textAlign: 'center', fontSize: 11, color: 'var(--text-3)' }}>
              adicione cards pela paleta à esquerda
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ReportsScreen });
