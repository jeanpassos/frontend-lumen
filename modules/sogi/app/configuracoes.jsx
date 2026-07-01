// SOGI — Configurações: geral, empresas, usuários, permissões, módulos, integrações,
// notificações, IA, segurança, saúde da stack, auditoria, aparência
const { useState: useStateCF } = React;

const SETTINGS_SECTIONS = [
  { id: 'geral', label: 'Geral' },
  { id: 'empresas', label: 'Empresas' },
  { id: 'usuarios', label: 'Usuários & RH' },
  { id: 'permissoes', label: 'Permissões' },
  { id: 'dashboards', label: 'Dashboards' },
  { id: 'feedcfg', label: 'Feed' },
  { id: 'modulos', label: 'Módulos' },
  { id: 'chamadoscfg', label: 'Chamados' },
  { id: 'emailcfg', label: 'E-mail' },
  { id: 'integracoes', label: 'Integrações' },
  { id: 'notificacoes', label: 'Notificações' },
  { id: 'iacfg', label: 'IA' },
  { id: 'seguranca', label: 'Segurança' },
  { id: 'saude', label: 'Saúde da Stack' },
  { id: 'auditoria', label: 'Auditoria & Logs' },
  { id: 'aparencia', label: 'Aparência' },
];

function CfSwitch({ on, onClick }) {
  return (
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
}

function SettingsScreen() {
  const [section, setSection] = useStateCF('geral');
  return (
    <div data-screen-label="Configurações" style={{ padding: 24, overflowY: 'auto', flex: 1, animation: 'sogi-fade-up .25s ease' }}>
      <PageHeader title="Configurações" subtitle="Administração da plataforma · ITS Tecnologia" />
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 14, alignItems: 'start' }}>
        <Card pad={false}>
          {SETTINGS_SECTIONS.map((s, i) => (
            <button key={s.id} onClick={() => setSection(s.id)} style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '9.5px var(--pad)', fontSize: 12.5,
              borderTop: i > 0 ? '1px solid var(--border)' : 'none',
              background: section === s.id ? 'var(--accent-soft)' : 'transparent',
              fontWeight: section === s.id ? 650 : 500,
              color: section === s.id ? 'var(--accent-text)' : 'var(--text-2)',
            }}
              onMouseEnter={e => { if (section !== s.id) e.currentTarget.style.background = 'var(--surface-2)'; }}
              onMouseLeave={e => { if (section !== s.id) e.currentTarget.style.background = 'transparent'; }}>
              {s.label}
            </button>
          ))}
        </Card>
        <div style={{ minWidth: 0 }}>
          {section === 'geral' && <GeneralSettings />}
          {section === 'empresas' && <CompaniesSettings />}
          {section === 'usuarios' && <UsersSettings />}
          {section === 'permissoes' && <PermissionsSettings />}
          {section === 'dashboards' && <DashboardsSettings />}
          {section === 'feedcfg' && <FeedSettings />}
          {section === 'modulos' && <ModulesSettings />}
          {section === 'chamadoscfg' && <TicketsConfig />}
          {section === 'emailcfg' && <EmailConfig />}
          {section === 'integracoes' && <IntegrationsSettings />}
          {section === 'notificacoes' && <NotificationsSettings />}
          {section === 'iacfg' && <AISettings />}
          {section === 'seguranca' && <SecuritySettings />}
          {section === 'saude' && <StackHealth />}
          {section === 'auditoria' && <AuditLog />}
          {section === 'aparencia' && <AppearanceSettings />}
        </div>
      </div>
    </div>
  );
}

/* ---------- Geral ---------- */
function GeneralSettings() {
  const Field = ({ label, value, half }) => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, gridColumn: half ? 'auto' : '1 / -1' }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>{label}</span>
      <input defaultValue={value} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none' }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
    </label>
  );
  return (
    <Card title="Dados da organização">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, maxWidth: 620 }}>
        <Field label="Nome fantasia" value="ITS Tecnologia" half />
        <Field label="Razão social" value="ITS Customer Service LTDA" half />
        <Field label="CNPJ" value="12.345.678/0001-90" half />
        <Field label="Fuso horário" value="America/Sao_Paulo (GMT-3)" half />
        <Field label="E-mail de contato" value="contato@its.com.br" half />
        <Field label="Telefone" value="+55 47 3333-0000" half />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, gap: 8 }}>
        <GhostBtn onClick={() => window.SOGI_TOAST('Alterações descartadas', 'warn')}>Descartar</GhostBtn>
        <PrimaryBtn icon="check" onClick={() => window.SOGI_TOAST('Dados da organização salvos')}>Salvar alterações</PrimaryBtn>
      </div>
    </Card>
  );
}

/* ---------- Empresas ---------- */
function CompaniesSettings() {
  const [companies, setCompanies] = useStateCF(SOGI_DATA.companies);
  const [modal, setModal] = useStateCF(false);
  const [name, setName] = useStateCF('');
  const [cnpj, setCnpj] = useStateCF('');
  const create = () => {
    if (!name.trim()) { window.SOGI_TOAST('Informe o nome da empresa', 'warn'); return; }
    setCompanies(cs => [...cs, { id: 'c' + Date.now(), name: name.trim(), cnpj: cnpj || '—', users: 0, modules: 0, active: true, current: false }]);
    window.SOGI_TOAST(`Empresa "${name.trim()}" criada — configure módulos e usuários`);
    setName(''); setCnpj(''); setModal(false);
  };
  return (
    <div>
      <Card title="Empresas do grupo" action={<PrimaryBtn icon="plus" onClick={() => setModal(true)}>Nova empresa</PrimaryBtn>} pad={false}>
        {companies.map((c, i) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
            <span style={{
              width: 34, height: 34, borderRadius: 9, background: c.current ? 'var(--accent)' : 'var(--nav-bg)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 10.5, flexShrink: 0,
            }}>{c.name.slice(0, 3).toUpperCase()}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong style={{ fontSize: 13 }}>{c.name}</strong>
                {c.current && <Badge tone="accent" dot>atual</Badge>}
                {!c.active && <Badge tone="neutral">inativa</Badge>}
              </span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{c.cnpj} · {c.users} usuários · {c.modules} módulos ativos</span>
            </span>
            <GhostBtn icon="settings" onClick={() => window.SOGI_TOAST(`Configurações de "${c.name}"`, 'info')}>Gerenciar</GhostBtn>
          </div>
        ))}
      </Card>

      {modal && (
        <div onClick={() => setModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(24,60,90,0.4)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'sogi-pop .15s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 420, maxWidth: '92vw', background: 'var(--surface)', borderRadius: 14, boxShadow: 'var(--shadow-pop)', animation: 'sogi-pop .2s cubic-bezier(.3,1.3,.6,1)' }}>
            <header style={{ display: 'flex', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid var(--border)' }}>
              <strong style={{ fontSize: 14 }}>Nova empresa</strong>
              <span style={{ flex: 1 }}></span>
              <button onClick={() => setModal(false)} style={{ color: 'var(--text-3)', display: 'flex', padding: 4 }}><Icon d={ICONS.x} size={15} /></button>
            </header>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 13 }}>
              <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Nome da empresa"
                style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none' }} />
              <input value={cnpj} onChange={e => setCnpj(e.target.value)} placeholder="CNPJ (opcional)"
                style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none' }} />
              <p className="mono" style={{ margin: 0, fontSize: 10, color: 'var(--text-3)', lineHeight: 1.6 }}>a nova empresa nasce sem módulos ativos — ative-os na aba Módulos</p>
            </div>
            <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '13px 20px', borderTop: '1px solid var(--border)' }}>
              <GhostBtn onClick={() => setModal(false)}>Cancelar</GhostBtn>
              <PrimaryBtn icon="plus" onClick={create}>Criar empresa</PrimaryBtn>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Usuários & RH ---------- */
function UsersSettings() {
  const [users, setUsers] = useStateCF(SOGI_DATA.usersAdmin.map(u => ({ ...u })));
  const [confirmOff, setConfirmOff] = useStateCF(null);
  const [createOpen, setCreateOpen] = useStateCF(false);

  const desligar = (u) => {
    setUsers(us => us.map(x => x.who === u.who ? { ...x, active: false } : x));
    setConfirmOff(null);
    const nome = u.personObj ? u.personObj.name : SOGI_DATA.people[u.who].name;
    const email = `${u.who}@its.com.br`;
    window.SOGI_TOAST(`${nome} marcado(a) como desligado(a) — acesso bloqueado`, 'warn');
    setTimeout(() => window.SOGI_TOAST(`Chamado #4830 aberto para TI: cancelar e-mail ${email}`, 'info'), 1300);
    setTimeout(() => window.SOGI_TOAST('Ação registrada na auditoria (RH → desligamento)', 'ok'), 2600);
  };

  const createUser = (nu) => {
    setUsers(us => [...us, nu]);
    window.SOGI_TOAST(`Usuário ${nu.personObj.name} criado — convite enviado por e-mail`);
    setTimeout(() => window.SOGI_TOAST(`Conta de e-mail ${nu.who}@its.com.br provisionada no cPanel`, 'info'), 1300);
    setCreateOpen(false);
  };

  const personOf = (u) => u.personObj || SOGI_DATA.people[u.who];
  const ActionIcon = ({ title, icon, danger, onClick }) => (
    <button title={title} onClick={onClick} style={{ color: 'var(--text-3)', display: 'flex', padding: 6, borderRadius: 7, border: '1px solid var(--border)' }}
      onMouseEnter={e => e.currentTarget.style.color = danger ? 'var(--danger)' : 'var(--accent-text)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
      <Icon d={ICONS[icon]} size={14} />
    </button>
  );

  return (
    <div>
      <Card title="Usuários & gestão de RH" action={<PrimaryBtn icon="plus" onClick={() => setCreateOpen(true)}>Criar usuário</PrimaryBtn>} pad={false}>
        {users.map((u, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none', opacity: u.active ? 1 : 0.55 }}>
            <Avatar person={personOf(u)} size={30} showStatus={u.active} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ fontSize: 12.5, display: 'block', textDecoration: u.active ? 'none' : 'line-through' }}>{personOf(u).name}</strong>
              <span style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{u.sector} · {u.who}@its.com.br</span>
            </span>
            <Badge tone={u.role === 'Administrador' ? 'violet' : u.role.includes('Gestor') || u.role.includes('Supervisor') ? 'accent' : 'neutral'}>{u.role}</Badge>
            {u.active ? <Badge tone="ok" dot>ativo</Badge> : <Badge tone="danger" dot>desligado</Badge>}
            <ActionIcon title="Editar acesso" icon="settings" onClick={() => window.SOGI_TOAST(`Editando acesso de ${personOf(u).name.split(' ')[0]} — papel, setor e módulos`, 'info')} />
            <ActionIcon title="Redefinir senha" icon="shield" onClick={() => window.SOGI_TOAST(`Link de redefinição enviado para ${u.who}@its.com.br`)} />
            {u.active
              ? <ActionIcon title="Desligar colaborador (RH)" icon="power" danger onClick={() => setConfirmOff(u)} />
              : <ActionIcon title="Reativar colaborador" icon="check" onClick={() => { setUsers(us => us.map(x => x.who === u.who ? { ...x, active: true } : x)); window.SOGI_TOAST('Colaborador reativado'); }} />}
            <button onClick={(e) => window.SOGI_CTX(e, [
              { label: 'Ver atividade (auditoria)', icon: 'list', onClick: () => window.SOGI_TOAST('Filtrando auditoria pelo usuário…', 'info') },
              { label: 'Transferir tarefas', icon: 'tasks', onClick: () => window.SOGI_TOAST('Selecione o novo responsável', 'info') },
              '-',
              u.active
                ? { label: 'Desligar colaborador (RH)', icon: 'power', danger: true, onClick: () => setConfirmOff(u) }
                : { label: 'Reativar colaborador', icon: 'check', onClick: () => { setUsers(us => us.map(x => x.who === u.who ? { ...x, active: true } : x)); window.SOGI_TOAST('Colaborador reativado'); } },
            ])} style={{ color: 'var(--text-3)', display: 'flex', padding: 5 }}>
              <Icon d={ICONS.dots} size={15} />
            </button>
          </div>
        ))}
        <p className="mono" style={{ margin: 0, padding: '9px var(--pad)', fontSize: 9.5, color: 'var(--text-3)', borderTop: '1px solid var(--border)' }}>
          desligamento automático: bloqueia acesso + abre chamado para TI cancelar o e-mail + registra na auditoria
        </p>
      </Card>

      {confirmOff && (
        <div onClick={() => setConfirmOff(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(24,60,90,0.4)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'sogi-pop .15s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 430, maxWidth: '92vw', background: 'var(--surface)', borderRadius: 14, boxShadow: 'var(--shadow-pop)', padding: 22, animation: 'sogi-pop .2s cubic-bezier(.3,1.3,.6,1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--danger-soft)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon d={ICONS.power} size={18} />
              </span>
              <strong style={{ fontSize: 14.5 }}>Desligar {(confirmOff.personObj || SOGI_DATA.people[confirmOff.who]).name}?</strong>
            </div>
            <p style={{ margin: '0 0 14px', fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
              Esta ação de RH executa automaticamente:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 18 }}>
              {['Bloqueia o acesso ao SOGI imediatamente', `Abre chamado para a TI cancelar o e-mail ${confirmOff.who}@its.com.br`, 'Transfere tarefas abertas para o gestor', 'Registra tudo na auditoria'].map((s, i) => (
                <span key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-2)', alignItems: 'center' }}>
                  <span style={{ color: 'var(--warn)', display: 'flex' }}><Icon d={ICONS.zap} size={12} /></span>{s}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <GhostBtn onClick={() => setConfirmOff(null)}>Cancelar</GhostBtn>
              <button onClick={() => desligar(confirmOff)} style={{
                display: 'flex', alignItems: 'center', gap: 7, background: 'var(--danger)', color: '#fff',
                borderRadius: 8, padding: '8px 14px', fontWeight: 600, fontSize: 12.5,
              }}>
                <Icon d={ICONS.power} size={14} /> Confirmar desligamento
              </button>
            </div>
          </div>
        </div>
      )}

      {createOpen && <CreateUserModal onClose={() => setCreateOpen(false)} onCreate={createUser} />}
    </div>
  );
}

/* ---------- Modal: criar usuário ---------- */
function CreateUserModal({ onClose, onCreate }) {
  const [name, setName] = useStateCF('');
  const [role, setRole] = useStateCF('Colaborador');
  const [sector, setSector] = useStateCF('Desenvolvimento');
  const [withEmail, setWithEmail] = useStateCF(true);
  const colors = ['#0e7490', '#b45309', '#4338ca', '#be185d', '#15803d'];
  const create = () => {
    if (!name.trim()) { window.SOGI_TOAST('Informe o nome do colaborador', 'warn'); return; }
    const parts = name.trim().split(' ');
    const who = parts[0].toLowerCase().normalize('NFD').replace(/[^a-z]/g, '') || 'novo';
    onCreate({
      who, role, sector, active: true,
      personObj: {
        id: who, name: name.trim(),
        initials: (parts[0][0] + (parts[1] ? parts[1][0] : parts[0][1] || 'X')).toUpperCase(),
        color: colors[name.length % colors.length], status: 'offline', role,
      },
    });
  };
  const inputStyle = { border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', fontFamily: 'var(--font-ui)', background: 'var(--surface)', color: 'var(--text)' };
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(24,60,90,0.4)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'sogi-pop .15s ease' }}>
      <div data-screen-label="Criar usuário" onClick={e => e.stopPropagation()} style={{ width: 440, maxWidth: '94vw', background: 'var(--surface)', borderRadius: 14, boxShadow: 'var(--shadow-pop)', animation: 'sogi-pop .2s cubic-bezier(.3,1.3,.6,1)' }}>
        <header style={{ display: 'flex', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid var(--border)' }}>
          <strong style={{ fontSize: 14 }}>Criar usuário</strong>
          <span style={{ flex: 1 }}></span>
          <button onClick={onClose} style={{ color: 'var(--text-3)', display: 'flex', padding: 4 }}><Icon d={ICONS.x} size={15} /></button>
        </header>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 13 }}>
          <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Nome completo" style={inputStyle} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
              Papel
              <select value={role} onChange={e => setRole(e.target.value)} style={inputStyle}>
                {SOGI_DATA.roles.map(r => <option key={r}>{r}</option>)}
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
              Setor
              <select value={sector} onChange={e => setSector(e.target.value)} style={inputStyle}>
                {['Desenvolvimento', 'Infraestrutura', 'Projetos & Gestão', 'Comercial', 'Administrativo'].map(s => <option key={s}>{s}</option>)}
              </select>
            </label>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, cursor: 'pointer' }}>
            <CfSwitch on={withEmail} onClick={() => setWithEmail(v => !v)} />
            Provisionar conta de e-mail no cPanel automaticamente
          </label>
          <p className="mono" style={{ margin: 0, fontSize: 9.5, color: 'var(--text-3)', lineHeight: 1.6 }}>o usuário recebe convite por e-mail com senha temporária · permissões do papel selecionado</p>
        </div>
        <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '13px 20px', borderTop: '1px solid var(--border)' }}>
          <GhostBtn onClick={onClose}>Cancelar</GhostBtn>
          <PrimaryBtn icon="plus" onClick={create}>Criar usuário</PrimaryBtn>
        </footer>
      </div>
    </div>
  );
}

/* ---------- Permissões ---------- */
function PermissionsSettings() {
  const [matrix, setMatrix] = useStateCF(SOGI_DATA.permMatrix);
  const cycle = (role, mi) => {
    setMatrix(m => {
      const next = { ...m, [role]: m[role].map((v, i) => i === mi ? (v + 1) % 3 : v) };
      const labels = ['sem acesso', 'leitura', 'acesso total'];
      window.SOGI_TOAST(`${role} · ${SOGI_DATA.permModules[mi]}: ${labels[next[role][mi]]}`);
      return next;
    });
  };
  const cell = (v) => v === 2
    ? { bg: 'var(--ok-soft)', fg: 'var(--ok)', label: 'total' }
    : v === 1
      ? { bg: 'var(--warn-soft)', fg: 'var(--warn)', label: 'leitura' }
      : { bg: 'var(--surface-2)', fg: 'var(--text-3)', label: '—' };
  return (
    <Card title="Matriz de permissões por papel" pad={false}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              <th style={{ textAlign: 'left', padding: '9px 14px', fontSize: 10.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Papel</th>
              {SOGI_DATA.permModules.map(m => (
                <th key={m} style={{ textAlign: 'center', padding: '9px 6px', fontSize: 9.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SOGI_DATA.roles.map(role => (
              <tr key={role} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '9px 14px', fontWeight: 650, whiteSpace: 'nowrap' }}>{role}</td>
                {matrix[role].map((v, mi) => {
                  const c = cell(v);
                  return (
                    <td key={mi} style={{ padding: 4, textAlign: 'center' }}>
                      <button onClick={() => cycle(role, mi)} className="mono" style={{
                        width: '100%', minWidth: 52, padding: '6px 4px', borderRadius: 7, fontSize: 9.5, fontWeight: 700,
                        background: c.bg, color: c.fg, transition: 'transform .1s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'none'}>{c.label}</button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mono" style={{ margin: 0, padding: '9px 14px', fontSize: 9.5, color: 'var(--text-3)' }}>clique numa célula para alternar: sem acesso → leitura → total</p>
    </Card>
  );
}

/* ---------- Módulos ---------- */
function ModulesSettings() {
  const [mods, setMods] = useStateCF(SOGI_DATA.modules);
  const toggle = (id) => {
    setMods(ms => ms.map(m => {
      if (m.id !== id) return m;
      const next = m.status === 'active' ? 'inactive' : 'active';
      window.SOGI_TOAST(`Módulo "${m.name}" ${next === 'active' ? 'ativado' : 'desativado'}`);
      return { ...m, status: next };
    }));
  };
  return (
    <Card title="Gestão de Módulos" action={<Badge tone="accent">{mods.filter(m => m.status === 'active').length} ativos</Badge>} pad={false}>
      {mods.map((m, i) => (
        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: m.status === 'active' ? 'var(--ok)' : 'var(--border-strong)' }}></span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong style={{ fontSize: 12.5 }}>{m.name}</strong>
              <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>v{m.version}</span>
            </span>
            <span style={{ display: 'block', fontSize: 10.5, color: 'var(--text-3)', marginTop: 2 }}>
              CPU {m.cpu}{m.deps.length > 0 ? ` · depende de: ${m.deps.join(', ')}` : ''}
            </span>
          </span>
          {m.status === 'active' && (
            <button title="Reiniciar módulo" onClick={() => window.SOGI_TOAST(`Módulo "${m.name}" reiniciado`)}
              style={{ color: 'var(--text-3)', display: 'flex', padding: 6, borderRadius: 7 }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
              <Icon d={ICONS.refresh} size={14} />
            </button>
          )}
          <CfSwitch on={m.status === 'active'} onClick={() => toggle(m.id)} />
        </div>
      ))}
    </Card>
  );
}

/* ---------- Integrações ---------- */
function IntegrationsSettings() {
  const [ints, setInts] = useStateCF(() => [
    ...SOGI_DATA.integrations.map((x, i) => ({ ...x, owner: ['carlos', 'rafael', 'diego'][i % 3], sync: ['há 2 min', 'há 12 min', '—', '—', '—', 'há 1 min', 'há 5 min', 'há 30 min'][i] || 'há 1 h', events: [1240, 3800, 0, 0, 0, 420, 96, 210][i] || 50 })),
    { name: 'Anthropic Claude API', kind: 'IA', status: 'connected', detail: 'assistente, atas, análise de riscos e base de conhecimento', owner: 'rafael', sync: 'há 1 min', events: 5210 },
    { name: 'OpenAI', kind: 'IA', status: 'disconnected', detail: 'provedor alternativo de IA (roteamento automático)', owner: 'rafael', sync: '—', events: 0 },
  ]);
  const [flowFor, setFlowFor] = useStateCF(null);
  const [view, setView] = useStateCF('lista');
  const [createOpen, setCreateOpen] = useStateCF(false);
  const toggle = (name) => {
    setInts(is => is.map(x => {
      if (x.name !== name) return x;
      const next = x.status === 'connected' ? 'disconnected' : 'connected';
      window.SOGI_TOAST(next === 'connected' ? `${x.name} conectado` : `${x.name} desconectado`, next === 'connected' ? 'ok' : 'warn');
      return { ...x, status: next, sync: next === 'connected' ? 'agora' : '—' };
    }));
  };
  const brandColor = { 'Mensageria': '#16a34a', 'E-mail': '#0284c7', 'SMS': '#7c3aed', 'Automação': '#E85928', 'Monitoramento': '#dc2626', 'Agenda': '#d97706', 'IA': '#E85928', 'ERP': '#183c5a' };
  const connected = ints.filter(x => x.status === 'connected').length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <Badge tone="ok" dot>{connected} conectadas</Badge>
        <Badge tone="neutral">{ints.length - connected} inativas</Badge>
        <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>· automações se/então/senão em "Automatizar"</span>
        <span style={{ flex: 1 }}></span>
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', borderRadius: 8, padding: 3, boxShadow: 'var(--shadow-card)' }}>
          {[['lista', 'Lista', 'list'], ['cards', 'Cards', 'dashboard']].map(([id, label, icon]) => (
            <button key={id} onClick={() => setView(id)} style={{
              display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, borderRadius: 6, padding: '5px 12px',
              background: view === id ? 'var(--accent)' : 'transparent', color: view === id ? '#fff' : 'var(--text-2)', transition: 'all .15s',
            }}><Icon d={ICONS[icon]} size={12} />{label}</button>
          ))}
        </div>
        <PrimaryBtn icon="plus" onClick={() => setCreateOpen(true)}>Criar integração</PrimaryBtn>
      </div>

      {view === 'lista' ? (
        <Card pad={false}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                  {['Integração', 'Status', 'Eventos (30d)', 'Última sync', 'Responsável', 'Ações'].map((h, i) => (
                    <th key={i} style={{ textAlign: i >= 5 ? 'right' : 'left', padding: '9px 14px', fontSize: 10.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ints.map(x => (
                  <tr key={x.name} style={{ borderBottom: '1px solid var(--border)', opacity: x.status === 'connected' ? 1 : 0.65 }}
                    onContextMenu={e => window.SOGI_CTX(e, [
                      { label: x.status === 'connected' ? 'Desconectar' : 'Conectar', icon: 'power', onClick: () => toggle(x.name) },
                      { label: 'Automatizar (se/então)', icon: 'zap', onClick: () => setFlowFor(x) },
                      { label: 'Ver logs da integração', icon: 'list', onClick: () => window.SOGI_TOAST('Abrindo logs — últimos 200 eventos', 'info') },
                      '-',
                      { label: 'Excluir integração', icon: 'trash', danger: true, onClick: () => { setInts(is => is.filter(y => y.name !== x.name)); window.SOGI_TOAST(`${x.name} excluída`, 'warn'); } },
                    ])}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '9px 14px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <span style={{ width: 26, height: 26, borderRadius: 7, background: brandColor[x.kind] || 'var(--accent)', color: '#fff', fontWeight: 800, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: x.status === 'connected' ? 1 : 0.5 }}>{x.name.slice(0, 1)}</span>
                        <span style={{ minWidth: 0 }}>
                          <strong style={{ fontSize: 12, display: 'block' }}>{x.name}</strong>
                          <span className="mono" style={{ fontSize: 9, color: 'var(--text-3)' }}>{x.kind} · {x.detail.length > 46 ? x.detail.slice(0, 46) + '…' : x.detail}</span>
                        </span>
                      </span>
                    </td>
                    <td style={{ padding: '9px 14px' }}><Badge tone={x.status === 'connected' ? 'ok' : 'neutral'} dot>{x.status === 'connected' ? 'conectada' : 'inativa'}</Badge></td>
                    <td className="mono" style={{ padding: '9px 14px', fontSize: 11.5, fontWeight: 600 }}>{x.events.toLocaleString('pt-BR')}</td>
                    <td className="mono" style={{ padding: '9px 14px', fontSize: 10.5, color: 'var(--text-3)' }}>{x.sync}</td>
                    <td style={{ padding: '9px 14px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Avatar person={x.owner} size={19} />
                        <span style={{ fontSize: 11.5 }}>{SOGI_DATA.people[x.owner].name.split(' ')[0]}</span>
                      </span>
                    </td>
                    <td style={{ padding: '9px 14px' }}>
                      <span style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
                        <button onClick={() => toggle(x.name)} style={{
                          fontSize: 10.5, fontWeight: 600, borderRadius: 7, padding: '4px 10px',
                          background: x.status === 'connected' ? 'var(--surface-2)' : 'var(--accent)',
                          color: x.status === 'connected' ? 'var(--text-2)' : '#fff',
                          border: x.status === 'connected' ? '1px solid var(--border)' : 'none',
                        }}>{x.status === 'connected' ? 'Desconectar' : 'Conectar'}</button>
                        <button onClick={() => setFlowFor(x)} style={{ fontSize: 10.5, fontWeight: 600, borderRadius: 7, padding: '4px 10px', border: '1px solid var(--border)', color: 'var(--accent-text)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Icon d={ICONS.zap} size={10} /> Automatizar
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mono" style={{ margin: 0, padding: '8px 14px', fontSize: 9, color: 'var(--text-3)' }}>botão direito numa linha: conectar, automatizar, logs, excluir</p>
        </Card>
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {ints.map(x => (
          <div key={x.name} style={{
            background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)',
            padding: 14, display: 'flex', flexDirection: 'column', gap: 9, position: 'relative', overflow: 'hidden',
            transition: 'transform .12s, box-shadow .12s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-pop)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}>
            <span style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: brandColor[x.kind] || 'var(--accent)', opacity: x.status === 'connected' ? 1 : 0.25 }}></span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: brandColor[x.kind] || 'var(--accent)', color: '#fff', fontWeight: 800, fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: x.status === 'connected' ? 1 : 0.4,
              }}>{x.name.slice(0, 1)}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: 12.5, display: 'block' }}>{x.name}</strong>
                <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>{x.kind}</span>
              </span>
              <Badge tone={x.status === 'connected' ? 'ok' : 'neutral'} dot>{x.status === 'connected' ? 'conectado' : 'inativo'}</Badge>
            </div>
            <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.45, flex: 1 }}>{x.detail}</p>
            <div style={{ display: 'flex', gap: 7 }}>
              <button onClick={() => toggle(x.name)} style={{
                flex: 1, fontSize: 11.5, fontWeight: 600, borderRadius: 7, padding: '6px 0',
                background: x.status === 'connected' ? 'var(--surface-2)' : 'var(--accent)',
                color: x.status === 'connected' ? 'var(--text-2)' : '#fff',
                border: x.status === 'connected' ? '1px solid var(--border)' : 'none',
              }}>{x.status === 'connected' ? 'Desconectar' : 'Conectar'}</button>
              <button onClick={() => setFlowFor(x)} style={{
                flex: 1, fontSize: 11.5, fontWeight: 600, borderRadius: 7, padding: '6px 0',
                border: '1px solid var(--border)', color: 'var(--accent-text)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}><Icon d={ICONS.zap} size={11} /> Automatizar</button>
            </div>
          </div>
        ))}
      </div>
      )}
      {flowFor && <IntegrationFlowModal integration={flowFor} onClose={() => setFlowFor(null)} />}
      {createOpen && <CreateIntegrationModal onClose={() => setCreateOpen(false)} onCreate={(ni) => {
        setInts(is => [...is, ni]);
        setCreateOpen(false);
        window.SOGI_TOAST(`Integração "${ni.name}" criada — teste a conexão e configure automações`);
      }} />}
    </div>
  );
}

/* ---------- Modal: criar integração ---------- */
function CreateIntegrationModal({ onClose, onCreate }) {
  const [name, setName] = useStateCF('');
  const [kind, setKind] = useStateCF('IA');
  const [endpoint, setEndpoint] = useStateCF('');
  const [apiKey, setApiKey] = useStateCF('');
  const [owner, setOwner] = useStateCF('rafael');
  const inputStyle = { width: '100%', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', fontFamily: 'var(--font-ui)', background: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' };
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(24,60,90,0.4)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'sogi-pop .15s ease' }}>
      <div data-screen-label="Criar integração" onClick={e => e.stopPropagation()} style={{ width: 460, maxWidth: '94vw', background: 'var(--surface)', borderRadius: 14, boxShadow: 'var(--shadow-pop)', animation: 'sogi-pop .2s cubic-bezier(.3,1.3,.6,1)' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '15px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--accent-text)', display: 'flex' }}><Icon d={ICONS.link} size={16} /></span>
          <strong style={{ fontSize: 14 }}>Criar integração</strong>
          <span style={{ flex: 1 }}></span>
          <button onClick={onClose} style={{ color: 'var(--text-3)', display: 'flex', padding: 4 }}><Icon d={ICONS.x} size={15} /></button>
        </header>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 13 }}>
          <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Nome (ex.: ERP Senior, Telegram, Slack…)" style={inputStyle} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
              Tipo
              <select value={kind} onChange={e => setKind(e.target.value)} style={inputStyle}>
                {['IA', 'Mensageria', 'E-mail', 'SMS', 'Automação', 'Monitoramento', 'Agenda', 'ERP'].map(k => <option key={k}>{k}</option>)}
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
              Responsável
              <select value={owner} onChange={e => setOwner(e.target.value)} style={inputStyle}>
                {Object.values(SOGI_DATA.people).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
          </div>
          <input value={endpoint} onChange={e => setEndpoint(e.target.value)} placeholder="Endpoint / URL base (https://…)" style={inputStyle} />
          <input value={apiKey} onChange={e => setApiKey(e.target.value)} type="password" placeholder="Chave de API / token (criptografada no cofre)" style={inputStyle} />
          <div style={{ background: 'var(--accent-soft)', borderRadius: 8, padding: 10, fontSize: 11.5, color: 'var(--accent-text)', lineHeight: 1.5 }}>
            A IA valida a conexão, sugere os gatilhos mais usados para este tipo e já deixa uma automação de exemplo pronta.
          </div>
        </div>
        <footer style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '13px 20px', borderTop: '1px solid var(--border)' }}>
          <GhostBtn icon="refresh" onClick={() => window.SOGI_TOAST('Conexão testada com sucesso · latência 38 ms')}>Testar conexão</GhostBtn>
          <div style={{ display: 'flex', gap: 8 }}>
            <GhostBtn onClick={onClose}>Cancelar</GhostBtn>
            <PrimaryBtn icon="plus" onClick={() => {
              if (!name.trim()) { window.SOGI_TOAST('Informe o nome da integração', 'warn'); return; }
              onCreate({ name: name.trim(), kind, status: 'connected', detail: endpoint.trim() || 'configuração manual pendente', owner, sync: 'agora', events: 0 });
            }}>Criar integração</PrimaryBtn>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ---------- Modal: automação se/então/senão ---------- */
function IntegrationFlowModal({ integration, onClose }) {
  const [trigger, setTrigger] = useStateCF('Chamado criado');
  const [cond, setCond] = useStateCF('prioridade = crítica');
  const [thenAct, setThenAct] = useStateCF('Enviar WhatsApp ao gestor');
  const [elseAct, setElseAct] = useStateCF('Apenas notificar no SOGI');

  const FlowBlock = ({ color, label, children }) => (
    <div style={{ borderLeft: `3px solid ${color}`, background: 'var(--surface-2)', borderRadius: 10, padding: '10px 13px' }}>
      <span className="mono" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color, display: 'block', marginBottom: 6 }}>{label}</span>
      {children}
    </div>
  );
  const Connector = ({ label, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0 2px 20px' }}>
      <span style={{ width: 2, height: 18, background: color || 'var(--border-strong)' }}></span>
      {label && <span className="mono" style={{ fontSize: 9.5, fontWeight: 700, color: color || 'var(--text-3)' }}>{label}</span>}
    </div>
  );
  const selStyle = { width: '100%', border: '1px solid var(--border)', borderRadius: 7, padding: '8px 10px', fontSize: 12.5, fontFamily: 'var(--font-ui)', background: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(24,60,90,0.45)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'sogi-pop .15s ease' }}>
      <div data-screen-label="Automação da integração" onClick={e => e.stopPropagation()} style={{ width: 520, maxWidth: '94vw', maxHeight: '92vh', overflowY: 'auto', background: 'var(--surface)', borderRadius: 14, boxShadow: 'var(--shadow-pop)', animation: 'sogi-pop .2s cubic-bezier(.3,1.3,.6,1)' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '15px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--warn)', display: 'flex' }}><Icon d={ICONS.zap} size={16} /></span>
          <strong style={{ fontSize: 14 }}>Automação — {integration.name}</strong>
          <span style={{ flex: 1 }}></span>
          <button onClick={onClose} style={{ color: 'var(--text-3)', display: 'flex', padding: 4 }}><Icon d={ICONS.x} size={15} /></button>
        </header>
        <div style={{ padding: 20 }}>
          <FlowBlock color="var(--accent)" label="QUANDO · GATILHO">
            <select value={trigger} onChange={e => setTrigger(e.target.value)} style={selStyle}>
              {['Chamado criado', 'Tarefa atrasada', 'SLA 80% consumido', 'Projeto entrou em risco', 'Aprovação pendente há 24h', 'Backup falhou'].map(t => <option key={t}>{t}</option>)}
            </select>
          </FlowBlock>
          <Connector />
          <FlowBlock color="var(--violet)" label="SE · CONDIÇÃO">
            <select value={cond} onChange={e => setCond(e.target.value)} style={selStyle}>
              {['prioridade = crítica', 'cliente = Vale Aço', 'fora do horário comercial', 'responsável sem resposta em 1h', 'sempre (sem condição)'].map(c => <option key={c}>{c}</option>)}
            </select>
          </FlowBlock>
          <Connector label="SIM →" color="var(--ok)" />
          <FlowBlock color="var(--ok)" label="ENTÃO · AÇÃO">
            <select value={thenAct} onChange={e => setThenAct(e.target.value)} style={selStyle}>
              {['Enviar WhatsApp ao gestor', 'Enviar e-mail ao cliente', 'Criar tarefa automática', 'Escalar para N3', 'Abrir chamado no fornecedor', 'Disparar webhook'].map(a => <option key={a}>{a}</option>)}
            </select>
          </FlowBlock>
          <Connector label="NÃO →" color="var(--danger)" />
          <FlowBlock color="var(--danger)" label="SENÃO · AÇÃO ALTERNATIVA">
            <select value={elseAct} onChange={e => setElseAct(e.target.value)} style={selStyle}>
              {['Apenas notificar no SOGI', 'Registrar no log e seguir', 'Aguardar próxima verificação', 'Nenhuma ação'].map(a => <option key={a}>{a}</option>)}
            </select>
          </FlowBlock>
          {/* resumo */}
          <div style={{ marginTop: 14, background: 'var(--warn-soft)', borderRadius: 9, padding: 11, fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--warn)' }}>Resumo:</strong> quando <strong>{trigger.toLowerCase()}</strong>, se <strong>{cond}</strong>, então <strong>{thenAct.toLowerCase()}</strong> via {integration.name}; senão, <strong>{elseAct.toLowerCase()}</strong>.
          </div>
        </div>
        <footer style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '13px 20px', borderTop: '1px solid var(--border)' }}>
          <GhostBtn icon="play" onClick={() => window.SOGI_TOAST('Teste executado — ação simulada com sucesso', 'info')}>Testar</GhostBtn>
          <div style={{ display: 'flex', gap: 8 }}>
            <GhostBtn onClick={onClose}>Cancelar</GhostBtn>
            <PrimaryBtn icon="check" onClick={() => { window.SOGI_TOAST(`Automação salva em ${integration.name} — ativa imediatamente`); onClose(); }}>Salvar automação</PrimaryBtn>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ---------- Notificações ---------- */
function NotificationsSettings() {
  const events = ['Tarefa atribuída a mim', 'Menção em comentário ou chat', 'Aprovação pendente', 'SLA em risco', 'Conquista desbloqueada', 'Resumo diário'];
  const channels = ['Interno', 'E-mail', 'WhatsApp', 'Push'];
  const [grid, setGrid] = useStateCF(() => events.map((_, i) => channels.map((_, j) => (i + j) % 3 !== 2)));
  const toggle = (i, j) => {
    setGrid(g => {
      const next = g.map((row, ri) => ri === i ? row.map((v, ci) => ci === j ? !v : v) : row);
      window.SOGI_TOAST(`${events[i]} · ${channels[j]}: ${next[i][j] ? 'ativado' : 'desativado'}`);
      return next;
    });
  };
  return (
    <Card title="Canais de notificação por evento" pad={false}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
            <th style={{ textAlign: 'left', padding: '9px 14px', fontSize: 10.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Evento</th>
            {channels.map(c => <th key={c} style={{ textAlign: 'center', padding: '9px 8px', fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase' }}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => (
            <tr key={e} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '10px 14px', fontWeight: 550 }}>{e}</td>
              {channels.map((c, j) => (
                <td key={c} style={{ textAlign: 'center', padding: '6px 8px' }}>
                  <button onClick={() => toggle(i, j)} style={{
                    width: 22, height: 22, borderRadius: 6,
                    background: grid[i][j] ? 'var(--ok)' : 'var(--surface-2)',
                    border: grid[i][j] ? 'none' : '1.5px solid var(--border-strong)',
                    color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .12s',
                  }}>{grid[i][j] && <Icon d={ICONS.check} size={12} sw={2.6} />}</button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/* ---------- IA ---------- */
function AISettings() {
  const [cfg, setCfg] = useStateCF({ assist: true, autoAta: true, riscos: true, kb: true });
  const [gov, setGov] = useStateCF({ anon: true, noTrain: true, human: true, logs: true });
  const [agents, setAgents] = useStateCF({ projetos: 'avançado', chamados: 'rápido', comunicacao: 'rápido', relatorios: 'avançado' });
  const [tone, setTone] = useStateCF('Neutro profissional');
  const t = (set) => (k, label) => set(c => { const v = !c[k]; window.SOGI_TOAST(`${label}: ${v ? 'ativado' : 'desativado'}`, v ? 'ok' : 'warn'); return { ...c, [k]: v }; });
  const selStyle = { border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', fontSize: 12.5, fontFamily: 'var(--font-ui)', color: 'var(--text)', background: 'var(--surface)' };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: 14, maxWidth: 1000, alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Card title="Provedor e consumo">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
              Provedor
              <select style={selStyle}>
                <option>Anthropic (Claude)</option><option>OpenAI</option><option>Auto (roteamento)</option>
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
              Limite mensal
              <select style={selStyle}>
                <option>R$ 500 / mês</option><option>R$ 1.000 / mês</option><option>Sem limite</option>
              </select>
            </label>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}>
              <span style={{ color: 'var(--text-2)' }}>Consumo em junho</span>
              <span className="mono" style={{ fontWeight: 700 }}>R$ 184,20 · 36,8%</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: 'var(--bg)', overflow: 'hidden' }}>
              <div style={{ width: '36.8%', height: '100%', background: 'var(--accent)', borderRadius: 4 }}></div>
            </div>
          </div>
        </Card>

        <Card title="Agentes de IA por módulo" pad={false}>
          {[['projetos', 'Projetos', 'resumos, etapas e detecção de riscos'], ['chamados', 'Chamados', 'sugestão de resposta e busca na base'], ['comunicacao', 'Comunicação', 'atas e resumos de conversas'], ['relatorios', 'Relatórios', 'análises e previsões']].map(([k, label, desc], i) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ color: 'var(--accent-text)', display: 'flex' }}><Icon d={ICONS.ai} size={14} /></span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600 }}>{label}</span>
                <span style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{desc}</span>
              </span>
              <select value={agents[k]} onChange={e => { setAgents(a => ({ ...a, [k]: e.target.value })); window.SOGI_TOAST(`${label}: modelo ${e.target.value}`); }} style={{ ...selStyle, fontSize: 11.5, padding: '5px 8px' }}>
                <option value="rápido">rápido (econômico)</option>
                <option value="avançado">avançado</option>
                <option value="off">desligado</option>
              </select>
            </div>
          ))}
        </Card>

        <Card title="Tom de voz e idioma">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
              Tom das respostas
              <select value={tone} onChange={e => { setTone(e.target.value); window.SOGI_TOAST(`Tom de voz: ${e.target.value}`); }} style={selStyle}>
                {['Neutro profissional', 'Formal corporativo', 'Descontraído'].map(x => <option key={x}>{x}</option>)}
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
              Idioma
              <select style={selStyle}>
                <option>Português (Brasil)</option><option>Inglês</option><option>Espanhol</option>
              </select>
            </label>
          </div>
        </Card>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Card title="Recursos de IA" pad={false}>
          {[
            ['assist', 'Assistente global', 'disponível em todas as telas'],
            ['autoAta', 'Atas automáticas de reunião', 'gera ata a partir de gravações'],
            ['riscos', 'Detecção de riscos em projetos', 'varredura diária às 06h'],
            ['kb', 'Base de conhecimento (RAG)', 'indexa documentos dos projetos'],
          ].map(([k, label, desc], i) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600 }}>{label}</span>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{desc}</span>
              </span>
              <CfSwitch on={cfg[k]} onClick={() => t(setCfg)(k, label)} />
            </div>
          ))}
          <div style={{ padding: '10px var(--pad)', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', flex: 1 }}>Re-indexação da base</span>
            <select onChange={e => window.SOGI_TOAST(`Re-indexação: ${e.target.value}`)} style={{ ...selStyle, fontSize: 11.5, padding: '5px 8px' }}>
              {['a cada 6h', 'diária (madrugada)', 'manual'].map(x => <option key={x}>{x}</option>)}
            </select>
          </div>
        </Card>

        <Card title="Privacidade & governança" pad={false}>
          {[
            ['anon', 'Anonimizar dados pessoais', 'CPF, salários e dados de RH são mascarados antes da IA'],
            ['noTrain', 'Não treinar com dados da empresa', 'cláusula de zero-retention com o provedor'],
            ['human', 'Aprovação humana para ações', 'IA sugere, pessoa confirma (criar tarefa, enviar msg)'],
            ['logs', 'Registrar prompts na auditoria', 'todo uso de IA fica rastreável por 90 dias'],
          ].map(([k, label, desc], i) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ color: 'var(--violet)', display: 'flex' }}><Icon d={ICONS.shield} size={14} /></span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600 }}>{label}</span>
                <span style={{ fontSize: 10.5, color: 'var(--text-3)', lineHeight: 1.4 }}>{desc}</span>
              </span>
              <CfSwitch on={gov[k]} onClick={() => t(setGov)(k, label)} />
            </div>
          ))}
        </Card>

        <Card title="Uso por usuário (30 dias)" pad={false}>
          {[['ana', 'R$ 52,10', 38], ['rafael', 'R$ 48,70', 35], ['diego', 'R$ 41,30', 30], ['marina', 'R$ 22,40', 16]].map(([who, cost, pct], i) => (
            <div key={who} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <Avatar person={who} size={24} />
              <span style={{ width: 64, fontSize: 12, fontWeight: 600 }}>{SOGI_DATA.people[who].name.split(' ')[0]}</span>
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--bg)', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', borderRadius: 4 }}></div>
              </div>
              <span className="mono" style={{ fontSize: 11, fontWeight: 700, width: 58, textAlign: 'right' }}>{cost}</span>
            </div>
          ))}
          <div style={{ padding: '9px var(--pad)', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', flex: 1 }}>Limite por usuário</span>
            <select onChange={e => window.SOGI_TOAST(`Limite por usuário: ${e.target.value}`)} style={{ ...selStyle, fontSize: 11.5, padding: '5px 8px' }}>
              {['R$ 60 / mês', 'R$ 100 / mês', 'sem limite'].map(x => <option key={x}>{x}</option>)}
            </select>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------- Segurança ---------- */
function SecuritySettings() {
  const [cfg, setCfg] = useStateCF({ mfa: true, sso: true, ip: false, session: true });
  const t = (k, label) => setCfg(c => { const v = !c[k]; window.SOGI_TOAST(`${label}: ${v ? 'ativado' : 'desativado'}`, v ? 'ok' : 'warn'); return { ...c, [k]: v }; });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 620 }}>
      <Card title="Autenticação" pad={false}>
        {[
          ['mfa', 'Autenticação em 2 fatores (2FA)', 'obrigatória para administradores'],
          ['sso', 'SSO — Google Workspace', 'login corporativo unificado'],
          ['ip', 'Restrição por IP', 'permite acesso apenas da rede da empresa'],
          ['session', 'Expirar sessões em 8h', 'exige novo login diariamente'],
        ].map(([k, label, desc], i) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600 }}>{label}</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{desc}</span>
            </span>
            <CfSwitch on={cfg[k]} onClick={() => t(k, label)} />
          </div>
        ))}
      </Card>
      <Card title="Política de senhas">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['mínimo 12 caracteres', 'letras + números + símbolo', 'troca a cada 90 dias', 'bloqueio após 5 tentativas'].map(p => (
            <Badge key={p} tone="accent" dot>{p}</Badge>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
          <GhostBtn icon="settings" onClick={() => window.SOGI_TOAST('Editor de política de senhas', 'info')}>Editar política</GhostBtn>
        </div>
      </Card>
    </div>
  );
}

/* ---------- Configuração de Chamados ---------- */
function TicketsConfig() {
  const [auto, setAuto] = useStateCF({ assign: true, csat: true, escalate: true, zabbix: true });
  const [queues, setQueues] = useStateCF(() => SOGI_DATA.serviceQueues.map((q, i) => ({
    name: q, agents: [3, 2, 4, 2, 1][i] || 2, hours: i <= 1 ? '24/7' : 'comercial', routing: i === 0 ? 'round-robin' : 'por categoria',
  })));
  const [newQueue, setNewQueue] = useStateCF('');
  const [macros, setMacros] = useStateCF(SOGI_DATA.ticketMacros);
  const [newMacro, setNewMacro] = useStateCF('');
  const [statuses, setStatuses] = useStateCF(['Na fila', 'Em atendimento', 'Aguardando cliente', 'Aguardando fornecedor', 'Resolvido', 'Cancelado']);
  const [hours, setHours] = useStateCF('Seg–Sex 08h–18h');
  const [plantao, setPlantao] = useStateCF(true);
  const [queueCfg, setQueueCfg] = useStateCF(null); // fila em configuração (duplo clique)
  const t = (k, label) => setAuto(c => { const v = !c[k]; window.SOGI_TOAST(`${label}: ${v ? 'ativado' : 'desativado'}`); return { ...c, [k]: v }; });

  const addQueue = () => {
    if (!newQueue.trim()) { window.SOGI_TOAST('Informe o nome da fila', 'warn'); return; }
    setQueues(qs => [...qs, { name: newQueue.trim(), agents: 0, hours: 'comercial', routing: 'manual' }]);
    SOGI_DATA.serviceQueues.push(newQueue.trim());
    window.SOGI_TOAST(`Fila "${newQueue.trim()}" criada — disponível na transferência de chamados`);
    setNewQueue('');
  };
  const removeQueue = (name) => {
    setQueues(qs => qs.filter(q => q.name !== name));
    const i = SOGI_DATA.serviceQueues.indexOf(name);
    if (i >= 0) SOGI_DATA.serviceQueues.splice(i, 1);
    window.SOGI_TOAST(`Fila "${name}" removida — chamados realocados para Suporte N1`, 'warn');
  };
  const cycleQueue = (name, field, options) => {
    setQueues(qs => qs.map(q => {
      if (q.name !== name) return q;
      const next = options[(options.indexOf(q[field]) + 1) % options.length];
      window.SOGI_TOAST(`Fila "${name}" · ${field === 'hours' ? 'horário' : 'roteamento'}: ${next}`);
      return { ...q, [field]: next };
    }));
  };
  const inputStyle = { border: '1px solid var(--border)', borderRadius: 8, padding: '8px 11px', fontSize: 12.5, outline: 'none', fontFamily: 'var(--font-ui)', background: 'var(--surface)', color: 'var(--text)' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: 14, maxWidth: 1000, alignItems: 'start' }}>
      {/* Filas de atendimento */}
      <Card title="Filas de atendimento" action={<Badge tone="accent">{queues.length} filas</Badge>} pad={false}>
        {queues.map((q, i) => (
          <div key={q.name} onDoubleClick={() => setQueueCfg(q)} title="duplo clique configura a fila" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent-soft)', color: 'var(--accent-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon d={ICONS.inbox} size={13} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ fontSize: 12.5, display: 'block' }}>{q.name}</strong>
              <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>{q.agents} agentes</span>
            </span>
            <button onClick={() => cycleQueue(q.name, 'hours', ['comercial', '24/7', 'plantão'])} className="mono" title="alternar horário" style={{
              fontSize: 9.5, fontWeight: 700, borderRadius: 99, padding: '3px 9px',
              background: q.hours === '24/7' ? 'var(--ok-soft)' : 'var(--surface-2)',
              color: q.hours === '24/7' ? 'var(--ok)' : 'var(--text-2)', border: '1px solid var(--border)',
            }}>{q.hours}</button>
            <button onClick={() => cycleQueue(q.name, 'routing', ['round-robin', 'por categoria', 'manual'])} className="mono" title="alternar roteamento" style={{
              fontSize: 9.5, fontWeight: 700, borderRadius: 99, padding: '3px 9px',
              background: 'var(--violet-soft)', color: 'var(--violet)', border: '1px solid var(--border)',
            }}>{q.routing}</button>
            <button onClick={() => removeQueue(q.name)} title="Remover fila" style={{ color: 'var(--text-3)', display: 'flex', padding: 4 }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
              <Icon d={ICONS.trash} size={13} />
            </button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 7, padding: '10px var(--pad)', borderTop: '1px solid var(--border)' }}>
          <input value={newQueue} onChange={e => setNewQueue(e.target.value)} onKeyDown={e => e.key === 'Enter' && addQueue()}
            placeholder="Nova fila (ex.: Telefonia, NOC…)" style={{ ...inputStyle, flex: 1, minWidth: 0 }} />
          <button onClick={addQueue} style={{ background: 'var(--accent)', color: '#fff', borderRadius: 8, padding: '0 14px', fontWeight: 600, fontSize: 12.5 }}>Criar</button>
        </div>
        <p className="mono" style={{ margin: 0, padding: '8px var(--pad)', fontSize: 9, color: 'var(--text-3)', borderTop: '1px solid var(--border)', lineHeight: 1.5 }}>duplo clique abre a configuração completa da fila · chips alternam horario/roteamento · filas aparecem na transferência</p>
      </Card>

      {queueCfg && <QueueConfigModal queue={queueCfg} onClose={() => setQueueCfg(null)}
        onSave={(updated) => {
          setQueues(qs => qs.map(q => q.name === queueCfg.name ? { ...q, ...updated } : q));
          const i = SOGI_DATA.serviceQueues.indexOf(queueCfg.name);
          if (i >= 0 && updated.name) SOGI_DATA.serviceQueues[i] = updated.name;
          setQueueCfg(null);
          window.SOGI_TOAST(`Fila "${updated.name}" configurada — registrado na auditoria`);
        }} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Horário de atendimento */}
        <Card title="Horário de atendimento (SLA)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <select value={hours} onChange={e => { setHours(e.target.value); window.SOGI_TOAST('Horário de atendimento atualizado — SLAs recalculados'); }} style={inputStyle}>
              {['Seg–Sex 08h–18h', 'Seg–Sex 07h–19h', 'Seg–Sáb 08h–18h', '24/7 (sempre)'].map(h => <option key={h}>{h}</option>)}
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5 }}>
              <CfSwitch on={plantao} onClick={() => { setPlantao(p => !p); window.SOGI_TOAST(`Plantão fora do horário: ${!plantao ? 'ativado' : 'desativado'}`); }} />
              Plantão para chamados críticos fora do horário
            </label>
            <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>o relógio de SLA pausa fora do horário (exceto críticos com plantão)</span>
          </div>
        </Card>

        {/* Status personalizados */}
        <Card title="Status do chamado">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {statuses.map(s => (
              <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Badge tone={s === 'Resolvido' ? 'ok' : s === 'Cancelado' ? 'neutral' : 'accent'} dot>{s}</Badge>
              </span>
            ))}
            <button onClick={() => { setStatuses(ss => [...ss, 'Em homologação']); window.SOGI_TOAST('Status "Em homologação" criado'); }} style={{
              fontSize: 11, fontWeight: 600, color: 'var(--text-3)', border: '1.5px dashed var(--border-strong)',
              borderRadius: 99, padding: '3px 11px', display: 'flex', alignItems: 'center', gap: 4,
            }}><Icon d={ICONS.plus} size={10} /> status</button>
          </div>
        </Card>

        {/* Macros */}
        <Card title="Macros · respostas prontas" pad={false}>
          {macros.map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <Icon d={ICONS.zap} size={12} style={{ color: 'var(--warn)' }} />
              <span style={{ flex: 1, fontSize: 12 }}>{m}</span>
              <button onClick={() => { setMacros(ms => ms.filter((_, j) => j !== i)); window.SOGI_TOAST('Macro removida', 'warn'); }} style={{ color: 'var(--text-3)', display: 'flex', padding: 3 }}>
                <Icon d={ICONS.x} size={11} />
              </button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 7, padding: '9px var(--pad)', borderTop: '1px solid var(--border)' }}>
            <input value={newMacro} onChange={e => setNewMacro(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && newMacro.trim()) { setMacros(ms => [...ms, newMacro.trim()]); setNewMacro(''); window.SOGI_TOAST('Macro criada — disponível no composer do chamado'); } }}
              placeholder="Nova macro…" style={{ ...inputStyle, flex: 1, minWidth: 0 }} />
          </div>
        </Card>
      </div>

      {/* SLA */}
      <Card title="Matriz de SLA por prioridade" pad={false}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              {['Prioridade', '1ª resposta', 'Resolução', ''].map((h, i) => (
                <th key={i} style={{ textAlign: 'left', padding: '9px 14px', fontSize: 10.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SOGI_DATA.ticketSLAConfig.map((s, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '9px 14px' }}><PriorityBadge p={s.prio} /></td>
                <td className="mono" style={{ padding: '9px 14px', fontSize: 11.5 }}>{s.first}</td>
                <td className="mono" style={{ padding: '9px 14px', fontSize: 11.5 }}>{s.resolve}</td>
                <td style={{ padding: '9px 14px', textAlign: 'right' }}>
                  <button onClick={() => window.SOGI_TOAST(`Editando SLA de prioridade ${s.prio}`, 'info')} style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-text)' }}>editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '10px var(--pad)', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 7 }}>Categorias</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {SOGI_DATA.ticketCategories.map(c => <Badge key={c} tone="accent" dot>{c}</Badge>)}
            <button onClick={() => window.SOGI_TOAST('Nova categoria de chamado criada')} style={{
              fontSize: 11, fontWeight: 600, color: 'var(--text-3)', border: '1.5px dashed var(--border-strong)',
              borderRadius: 99, padding: '2px 10px', display: 'flex', alignItems: 'center', gap: 4,
            }}><Icon d={ICONS.plus} size={10} /> categoria</button>
          </div>
        </div>
      </Card>

      {/* Automações */}
      <Card title="Automações de chamados" pad={false}>
        {[
          ['assign', 'Auto-atribuição por categoria', 'infra → Carlos · sistemas → Diego'],
          ['csat', 'Pesquisa de satisfação ao resolver', 'CSAT enviado por e-mail/WhatsApp'],
          ['escalate', 'Escalonamento automático', 'SLA 80% consumido → notifica gestor'],
          ['zabbix', 'Abertura via monitoramento (Zabbix)', 'alertas críticos viram chamados'],
        ].map(([k, label, desc], i) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ color: 'var(--warn)', display: 'flex' }}><Icon d={ICONS.zap} size={14} /></span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600 }}>{label}</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{desc}</span>
            </span>
            <CfSwitch on={auto[k]} onClick={() => t(k, label)} />
          </div>
        ))}
        <p className="mono" style={{ margin: 0, padding: '9px var(--pad)', fontSize: 9, color: 'var(--text-3)', borderTop: '1px solid var(--border)', lineHeight: 1.5 }}>automações avançadas com se/então/senão: Configurações → Integrações → Automatizar</p>
      </Card>
    </div>
  );
}

/* ---------- Modal: configuração da fila ---------- */
function QueueConfigModal({ queue, onClose, onSave }) {
  const [name, setName] = useStateCF(queue.name);
  const [hours, setHours] = useStateCF(queue.hours);
  const [routing, setRouting] = useStateCF(queue.routing);
  const [agents, setAgents] = useStateCF(['diego', 'carlos']);
  const [cats, setCats] = useStateCF(['Infraestrutura', 'Sistemas']);
  const [slaPolicy, setSlaPolicy] = useStateCF('Padrão da empresa');
  const toggleIn = (set) => (v) => set(arr => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
  const inputStyle = { width: '100%', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', fontFamily: 'var(--font-ui)', background: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' };
  const FieldLabel = ({ children }) => <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>{children}</span>;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(24,60,90,0.45)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'sogi-pop .15s ease' }}>
      <div data-screen-label="Configuração da fila" onClick={e => e.stopPropagation()} style={{ width: 540, maxWidth: '94vw', maxHeight: '92vh', overflowY: 'auto', background: 'var(--surface)', borderRadius: 14, boxShadow: 'var(--shadow-pop)', animation: 'sogi-pop .2s cubic-bezier(.3,1.3,.6,1)' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '15px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--accent-text)', display: 'flex' }}><Icon d={ICONS.inbox} size={16} /></span>
          <strong style={{ fontSize: 14 }}>Configuração da fila — {queue.name}</strong>
          <span style={{ flex: 1 }}></span>
          <button onClick={onClose} style={{ color: 'var(--text-3)', display: 'flex', padding: 4 }}><Icon d={ICONS.x} size={15} /></button>
        </header>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div>
            <FieldLabel>Nome da fila</FieldLabel>
            <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <FieldLabel>Horário</FieldLabel>
              <select value={hours} onChange={e => setHours(e.target.value)} style={inputStyle}>
                {['comercial', '24/7', 'plantão'].map(h => <option key={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>Roteamento</FieldLabel>
              <select value={routing} onChange={e => setRouting(e.target.value)} style={inputStyle}>
                {['round-robin', 'por categoria', 'manual'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>Política de SLA</FieldLabel>
              <select value={slaPolicy} onChange={e => setSlaPolicy(e.target.value)} style={inputStyle}>
                {['Padrão da empresa', 'SLA premium (½ tempo)', 'Sem SLA (interno)'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <FieldLabel>Agentes da fila · {agents.length}</FieldLabel>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Object.values(SOGI_DATA.people).map(p => {
                const on = agents.includes(p.id);
                return (
                  <button key={p.id} onClick={() => toggleIn(setAgents)(p.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600,
                    borderRadius: 99, padding: '3px 10px 3px 4px',
                    border: on ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                    background: on ? 'var(--accent-soft)' : 'transparent',
                    color: on ? 'var(--accent-text)' : 'var(--text-3)',
                  }}>
                    <Avatar person={p.id} size={18} />
                    {p.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <FieldLabel>Categorias atendidas pela fila</FieldLabel>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {SOGI_DATA.ticketCategories.map(c => {
                const on = cats.includes(c);
                return (
                  <button key={c} onClick={() => toggleIn(setCats)(c)} style={{
                    fontSize: 11, fontWeight: 600, borderRadius: 99, padding: '4px 12px',
                    border: on ? '1.5px solid var(--violet)' : '1px solid var(--border)',
                    background: on ? 'var(--violet-soft)' : 'transparent',
                    color: on ? 'var(--violet)' : 'var(--text-3)',
                  }}>{c}</button>
                );
              })}
            </div>
            <span className="mono" style={{ fontSize: 9, color: 'var(--text-3)', display: 'block', marginTop: 5 }}>chamados destas categorias caem automaticamente nesta fila</span>
          </div>
        </div>
        <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '13px 20px', borderTop: '1px solid var(--border)' }}>
          <GhostBtn onClick={onClose}>Cancelar</GhostBtn>
          <PrimaryBtn icon="check" onClick={() => onSave({ name: name.trim() || queue.name, hours, routing, agents: agents.length })}>Salvar fila</PrimaryBtn>
        </footer>
      </div>
    </div>
  );
}

/* ---------- Configuração de E-mail ---------- */
const genEmailAccounts = () => {
  const first = ['lucas', 'mariana', 'felipe', 'camila', 'bruno', 'patricia', 'rodrigo', 'aline', 'gustavo', 'renata', 'thiago', 'vanessa', 'eduardo', 'simone', 'marcelo', 'leticia', 'andre', 'carolina', 'fabio', 'paula'];
  const last = ['silva', 'souza', 'oliveira', 'santos', 'pereira', 'costa', 'almeida', 'ferreira', 'gomes', 'martins', 'rocha', 'ribeiro', 'carvalho', 'barbosa', 'araujo'];
  const colors = ['#0e7490', '#b45309', '#4338ca', '#be185d', '#15803d', '#7c3aed', '#dc2626'];
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const arr = [];
  for (let i = 0; i < 1244; i++) {
    const f = first[i % first.length], l = last[Math.floor(i / first.length) % last.length];
    const suffix = i >= 300 ? Math.floor(i / 300) : '';
    arr.push({
      user: null, name: cap(f) + ' ' + cap(l),
      gen: { initials: (f[0] + l[0]).toUpperCase(), color: colors[i % colors.length] },
      email: `${f}.${l}${suffix}@its.com.br`,
      quota: `${(i % 9) + 1},${(i * 3) % 10} GB / 10 GB`,
      status: i % 37 === 0 ? 'suspensa' : 'ativo', signature: i % 3 !== 0,
    });
  }
  return arr;
};

function EmailConfig() {
  const [sig, setSig] = useStateCF('Rafael Souza\nGerente de Projetos · ITS Tecnologia\n+55 47 3333-0000 · its.com.br');
  const [accounts, setAccounts] = useStateCF(() => [...SOGI_DATA.emailAccounts.map(a => ({ ...a })), ...genEmailAccounts()]);
  const [q, setQ] = useStateCF('');
  const [page, setPage] = useStateCF(0);
  const [editAcc, setEditAcc] = useStateCF(null);
  const [signImg, setSignImg] = useStateCF(true);
  const [servers, setServers] = useStateCF([
    { name: 'mail.its.com.br', kind: 'principal', smtp: '587 (STARTTLS)', imap: '993 (SSL)', status: 'ativo', sync: 'há 2 min' },
    { name: 'mail2.its.com.br', kind: 'backup / MX2', smtp: '587 (STARTTLS)', imap: '993 (SSL)', status: 'ativo', sync: 'há 8 min' },
    { name: 'relay.legado.its.com.br', kind: 'legado', smtp: '25 (sem TLS)', imap: '—', status: 'bloqueado', sync: 'há 40 dias' },
  ]);
  const [serverModal, setServerModal] = useStateCF(null); // null | 'novo' | server
  const [aiFilters, setAiFilters] = useStateCF({ spam: true, virus: true, phishing: true, quarentena: true });
  const PER_PAGE = 8;
  const [createOpen, setCreateOpen] = useStateCF(false);
  const [addr, setAddr] = useStateCF('');
  const [linkUser, setLinkUser] = useStateCF('marina');
  const [quota, setQuota] = useStateCF('10 GB');

  const createAccount = () => {
    const email = addr.trim() ? (addr.includes('@') ? addr.trim() : addr.trim() + '@its.com.br') : '';
    if (!email) { window.SOGI_TOAST('Informe o endereço da conta', 'warn'); return; }
    setAccounts(as => [...as, { user: linkUser, email, quota: `0 GB / ${quota}`, status: 'ativo', signature: false }]);
    setCreateOpen(false); setAddr('');
    window.SOGI_TOAST('Conta criada no cPanel via API…', 'info');
    setTimeout(() => window.SOGI_TOAST(`${email} vinculada a ${SOGI_DATA.people[linkUser].name.split(' ')[0]} — webmail disponível`), 1400);
  };

  const filtered = accounts.filter(a => {
    if (!q.trim()) return true;
    const ln = a.user ? SOGI_DATA.people[a.user].name : a.name;
    return (a.email + ' ' + ln).toLowerCase().includes(q.toLowerCase());
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);
  const linkedName = (a) => a.user ? SOGI_DATA.people[a.user].name.split(' ')[0] : a.name.split(' ')[0];

  const saveEdit = (orig, updated) => {
    setAccounts(as => as.map(a => a.email === orig.email ? { ...a, ...updated } : a));
    setEditAcc(null);
    window.SOGI_TOAST(`Conta ${updated.email} atualizada no cPanel — registrado na auditoria`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 680 }}>
      <Card title={`Contas de e-mail (cPanel) · ${accounts.length.toLocaleString('pt-BR')}`} action={<PrimaryBtn icon="plus" onClick={() => setCreateOpen(true)}>Criar conta</PrimaryBtn>} pad={false}>
        {/* Busca */}
        <div style={{ padding: '10px var(--pad)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', borderRadius: 8, padding: '7px 11px' }}>
            <Icon d={ICONS.search} size={14} style={{ color: 'var(--text-3)' }} />
            <input value={q} onChange={e => { setQ(e.target.value); setPage(0); }} placeholder="Buscar por e-mail ou colaborador…"
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 12.5, minWidth: 0 }} />
          </div>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)', flexShrink: 0 }}>{filtered.length.toLocaleString('pt-BR')} resultado(s)</span>
        </div>
        {pageRows.map((a, i) => (
          <div key={a.email} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
            {a.user
              ? <Avatar person={a.user} size={28} />
              : <span style={{ width: 28, height: 28, borderRadius: '50%', background: a.gen.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0 }}>{a.gen.initials}</span>}
            <span style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ fontSize: 12.5, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.email}</strong>
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{a.quota} · vinculada a {linkedName(a)}</span>
            </span>
            {a.signature ? <Badge tone="ok" dot>assinatura ok</Badge> : <Badge tone="warn" dot>sem assinatura</Badge>}
            <Badge tone={a.status === 'ativo' ? 'accent' : 'danger'}>{a.status}</Badge>
            <button title="Editar conta" onClick={() => setEditAcc(a)} style={{ color: 'var(--text-3)', display: 'flex', padding: 6, borderRadius: 7, border: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
              <Icon d={ICONS.settings} size={13} />
            </button>
            <button onClick={(e) => window.SOGI_CTX(e, [
              { label: 'Editar conta', icon: 'settings', onClick: () => setEditAcc(a) },
              { label: 'Redefinir senha da conta', icon: 'shield', onClick: () => window.SOGI_TOAST('Senha redefinida no cPanel') },
              { label: 'Aumentar cota', icon: 'arrowUp', onClick: () => window.SOGI_TOAST('Cota aumentada para 20 GB') },
              '-',
              { label: 'Cancelar conta', icon: 'trash', danger: true, onClick: () => window.SOGI_TOAST('Conta cancelada no cPanel', 'warn') },
            ])} style={{ color: 'var(--text-3)', display: 'flex', padding: 5 }}>
              <Icon d={ICONS.dots} size={15} />
            </button>
          </div>
        ))}
        {pageRows.length === 0 && <p className="mono" style={{ padding: 18, fontSize: 11, color: 'var(--text-3)', textAlign: 'center', margin: 0 }}>nenhuma conta para "{q}"</p>}
        {/* Paginação */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px var(--pad)', borderTop: '1px solid var(--border)' }}>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)', flex: 1 }}>
            {filtered.length === 0 ? 0 : (safePage * PER_PAGE + 1).toLocaleString('pt-BR')}–{Math.min((safePage + 1) * PER_PAGE, filtered.length).toLocaleString('pt-BR')} de {filtered.length.toLocaleString('pt-BR')}
          </span>
          <button onClick={() => setPage(0)} disabled={safePage === 0} style={{ border: '1px solid var(--border)', borderRadius: 7, width: 28, height: 28, color: 'var(--text-2)', opacity: safePage === 0 ? 0.4 : 1, fontWeight: 700 }}>«</button>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePage === 0} style={{ border: '1px solid var(--border)', borderRadius: 7, width: 28, height: 28, color: 'var(--text-2)', opacity: safePage === 0 ? 0.4 : 1, fontWeight: 700 }}>‹</button>
          <span className="mono" style={{ fontSize: 11, fontWeight: 700, padding: '0 8px' }}>pág. {safePage + 1} / {pageCount.toLocaleString('pt-BR')}</span>
          <button onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))} disabled={safePage >= pageCount - 1} style={{ border: '1px solid var(--border)', borderRadius: 7, width: 28, height: 28, color: 'var(--text-2)', opacity: safePage >= pageCount - 1 ? 0.4 : 1, fontWeight: 700 }}>›</button>
          <button onClick={() => setPage(pageCount - 1)} disabled={safePage >= pageCount - 1} style={{ border: '1px solid var(--border)', borderRadius: 7, width: 28, height: 28, color: 'var(--text-2)', opacity: safePage >= pageCount - 1 ? 0.4 : 1, fontWeight: 700 }}>»</button>
        </div>
        <p className="mono" style={{ margin: 0, padding: '8px var(--pad)', fontSize: 9, color: 'var(--text-3)', borderTop: '1px solid var(--border)', lineHeight: 1.5 }}>
          integração cPanel: criar conta já provisiona a caixa e vincula ao usuário · paginação pensada para 1.200+ colaboradores
        </p>
      </Card>

      {editAcc && <EditEmailModal account={editAcc} onClose={() => setEditAcc(null)} onSave={(u) => saveEdit(editAcc, u)} />}

      {createOpen && (
        <div onClick={() => setCreateOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(24,60,90,0.4)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'sogi-pop .15s ease' }}>
          <div data-screen-label="Criar conta de e-mail" onClick={e => e.stopPropagation()} style={{ width: 440, maxWidth: '94vw', background: 'var(--surface)', borderRadius: 14, boxShadow: 'var(--shadow-pop)', animation: 'sogi-pop .2s cubic-bezier(.3,1.3,.6,1)' }}>
            <header style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '15px 20px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--violet)', display: 'flex' }}><Icon d={ICONS.mail} size={16} /></span>
              <strong style={{ fontSize: 14 }}>Criar conta de e-mail</strong>
              <Badge tone="violet">cPanel API</Badge>
              <span style={{ flex: 1 }}></span>
              <button onClick={() => setCreateOpen(false)} style={{ color: 'var(--text-3)', display: 'flex', padding: 4 }}><Icon d={ICONS.x} size={15} /></button>
            </header>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <input autoFocus value={addr} onChange={e => setAddr(e.target.value)} onKeyDown={e => e.key === 'Enter' && createAccount()} placeholder="nome.sobrenome"
                  style={{ flex: 1, border: '1px solid var(--border)', borderRadius: '8px 0 0 8px', padding: '9px 12px', fontSize: 13, outline: 'none', minWidth: 0 }} />
                <span className="mono" style={{ border: '1px solid var(--border)', borderLeft: 'none', borderRadius: '0 8px 8px 0', padding: '9px 12px', fontSize: 12, background: 'var(--surface-2)', color: 'var(--text-3)' }}>@its.com.br</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
                  Vincular ao usuário
                  <select value={linkUser} onChange={e => setLinkUser(e.target.value)} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '9px 10px', fontSize: 13, fontFamily: 'var(--font-ui)', background: 'var(--surface)', color: 'var(--text)' }}>
                    {Object.values(SOGI_DATA.people).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
                  Cota
                  <select value={quota} onChange={e => setQuota(e.target.value)} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '9px 10px', fontSize: 13, fontFamily: 'var(--font-ui)', background: 'var(--surface)', color: 'var(--text)' }}>
                    {['5 GB', '10 GB', '20 GB', '50 GB'].map(q => <option key={q}>{q}</option>)}
                  </select>
                </label>
              </div>
              <div style={{ background: 'var(--violet-soft)', borderRadius: 8, padding: 10, fontSize: 11.5, color: 'var(--violet)', lineHeight: 1.55 }}>
                A conta é criada no cPanel, vinculada ao usuário no SOGI (webmail integrado) e a senha temporária é enviada com instruções de assinatura.
              </div>
            </div>
            <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '13px 20px', borderTop: '1px solid var(--border)' }}>
              <GhostBtn onClick={() => setCreateOpen(false)}>Cancelar</GhostBtn>
              <PrimaryBtn icon="plus" onClick={createAccount}>Criar conta</PrimaryBtn>
            </footer>
          </div>
        </div>
      )}
      <Card title="Assinatura padrão (minha conta)">
        {/* Imagem da assinatura */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          {signImg ? (
            <span style={{ background: '#fff', borderRadius: 9, padding: '8px 14px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center' }}>
              <img src="assets/its-logo.png" alt="logo na assinatura" style={{ height: 30, width: 'auto', display: 'block' }} />
            </span>
          ) : (
            <span className="mono" style={{ border: '1.5px dashed var(--border-strong)', borderRadius: 9, padding: '14px 18px', fontSize: 10, color: 'var(--text-3)' }}>sem imagem</span>
          )}
          <span style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button onClick={() => { setSignImg(true); window.SOGI_TOAST('Imagem enviada — aplicada à assinatura (logo ITS)'); }} style={{
              fontSize: 11.5, fontWeight: 600, color: 'var(--accent-text)', background: 'var(--accent-soft)', borderRadius: 7, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 5,
            }}><Icon d={ICONS.arrowUp} size={11} /> {signImg ? 'Trocar imagem' : 'Enviar imagem'}</button>
            {signImg && <button onClick={() => { setSignImg(false); window.SOGI_TOAST('Imagem removida da assinatura', 'warn'); }} style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--danger)' }}>Remover imagem</button>}
          </span>
          <span className="mono" style={{ fontSize: 9, color: 'var(--text-3)', marginLeft: 'auto', maxWidth: 160, lineHeight: 1.5 }}>PNG/JPG até 200 KB · exibida abaixo do texto da assinatura</span>
        </div>
        <textarea value={sig} onChange={e => setSig(e.target.value)} rows={4} style={{
          width: '100%', border: '1px solid var(--border)', borderRadius: 9, padding: '10px 12px',
          fontSize: 12.5, lineHeight: 1.6, fontFamily: 'var(--font-ui)', resize: 'vertical', outline: 'none',
          background: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box',
        }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
          <GhostBtn icon="mail" onClick={() => window.SOGI_TOAST('Prévia enviada para sua caixa de entrada', 'info')}>Testar</GhostBtn>
          <PrimaryBtn icon="check" onClick={() => window.SOGI_TOAST('Assinatura salva — aplicada a todos os envios')}>Salvar assinatura</PrimaryBtn>
        </div>
      </Card>
      {/* Servidores de e-mail */}
      <Card title="Servidores de e-mail" action={<PrimaryBtn icon="plus" onClick={() => setServerModal('novo')}>Novo servidor</PrimaryBtn>} pad={false}>
        {servers.map((s, i) => (
          <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none', opacity: s.status === 'bloqueado' ? 0.6 : 1 }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: s.status === 'ativo' ? 'var(--ok-soft)' : 'var(--danger-soft)', color: s.status === 'ativo' ? 'var(--ok)' : 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon d={ICONS.server} size={14} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <strong className="mono" style={{ fontSize: 12 }}>{s.name}</strong>
                <Badge tone="neutral">{s.kind}</Badge>
              </span>
              <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>SMTP {s.smtp} · IMAP {s.imap} · sync {s.sync}</span>
            </span>
            <Badge tone={s.status === 'ativo' ? 'ok' : 'danger'} dot>{s.status}</Badge>
            <button title="Editar servidor" onClick={() => setServerModal(s)} style={{ color: 'var(--text-3)', display: 'flex', padding: 6, borderRadius: 7, border: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
              <Icon d={ICONS.settings} size={13} />
            </button>
            <button title={s.status === 'ativo' ? 'Bloquear servidor' : 'Desbloquear servidor'} onClick={() => {
              setServers(sv => sv.map(x => x.name === s.name ? { ...x, status: x.status === 'ativo' ? 'bloqueado' : 'ativo' } : x));
              window.SOGI_TOAST(`Servidor ${s.name} ${s.status === 'ativo' ? 'bloqueado — tráfego suspenso' : 'reativado'}`, s.status === 'ativo' ? 'warn' : 'ok');
            }} style={{ color: 'var(--text-3)', display: 'flex', padding: 6, borderRadius: 7, border: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--warn)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
              <Icon d={ICONS.power} size={13} />
            </button>
            <button title="Excluir servidor" onClick={() => {
              if (s.kind === 'principal') { window.SOGI_TOAST('O servidor principal não pode ser excluído — promova outro antes', 'warn'); return; }
              setServers(sv => sv.filter(x => x.name !== s.name));
              window.SOGI_TOAST(`Servidor ${s.name} excluído — registrado na auditoria`, 'warn');
            }} style={{ color: 'var(--text-3)', display: 'flex', padding: 6, borderRadius: 7, border: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
              <Icon d={ICONS.trash} size={13} />
            </button>
          </div>
        ))}
      </Card>

      {/* Regras, spam e vírus com IA */}
      <Card title="Regras e filtros · proteção com IA" action={<Badge tone="accent"><Icon d={ICONS.ai} size={10} /> IA ativa</Badge>} pad={false}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '12px var(--pad)', textAlign: 'center' }}>
          {[['342', 'spams bloqueados (7d)'], ['3', 'vírus em quarentena'], ['12', 'phishing detectados']].map(([v, l]) => (
            <div key={l} style={{ background: 'var(--surface-2)', borderRadius: 9, padding: '10px 6px' }}>
              <div className="mono" style={{ fontSize: 17, fontWeight: 700 }}>{v}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2, lineHeight: 1.3 }}>{l}</div>
            </div>
          ))}
        </div>
        {[
          ['spam', 'Anti-spam com IA', 'classificação por conteúdo e reputação, aprende com os "não é spam"'],
          ['virus', 'Antivírus em anexos', 'análise de anexos antes da entrega (sandbox)'],
          ['phishing', 'Detecção de phishing com IA', 'links falsos, remetente falsificado e urgência suspeita'],
          ['quarentena', 'Quarentena automática', 'suspeitos ficam retidos 7 dias para revisão'],
        ].map(([k, label, desc], i) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px var(--pad)', borderTop: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--accent-text)', display: 'flex' }}><Icon d={ICONS.shield} size={14} /></span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600 }}>{label}</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{desc}</span>
            </span>
            <CfSwitch on={aiFilters[k]} onClick={() => setAiFilters(c => { const v = !c[k]; window.SOGI_TOAST(`${label}: ${v ? 'ativado' : 'desativado'}`, v ? 'ok' : 'warn'); return { ...c, [k]: v }; })} />
          </div>
        ))}
        <div style={{ padding: '10px var(--pad)', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <GhostBtn icon="ai" onClick={() => window.SOGI_TOAST('IA analisou a quarentena: 2 falsos positivos liberados, 1 vírus confirmado e excluído', 'info')}>Analisar quarentena com IA</GhostBtn>
          <GhostBtn icon="plus" onClick={() => window.SOGI_TOAST('Nova regra criada: "assunto contém [URGENTE]" → marcar como suspeito')}>Nova regra de filtro</GhostBtn>
          <GhostBtn icon="list" onClick={() => window.SOGI_TOAST('Abrindo quarentena — 3 itens retidos', 'info')}>Ver quarentena</GhostBtn>
        </div>
      </Card>

      {serverModal && <EmailServerModal server={serverModal === 'novo' ? null : serverModal} onClose={() => setServerModal(null)}
        onSave={(srv, isNew) => {
          if (isNew) setServers(sv => [...sv, srv]);
          else setServers(sv => sv.map(x => x.name === serverModal.name ? { ...x, ...srv } : x));
          setServerModal(null);
          window.SOGI_TOAST(`Servidor ${srv.name} ${isNew ? 'criado' : 'atualizado'} — registrado na auditoria`);
        }} />}
    </div>
  );
}

/* ---------- Modal: servidor de e-mail ---------- */
function EmailServerModal({ server, onClose, onSave }) {
  const [name, setName] = useStateCF(server ? server.name : '');
  const [kind, setKind] = useStateCF(server ? server.kind : 'backup / MX2');
  const [smtp, setSmtp] = useStateCF(server ? server.smtp : '587 (STARTTLS)');
  const [imap, setImap] = useStateCF(server ? server.imap : '993 (SSL)');
  const inputStyle = { width: '100%', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', fontFamily: 'var(--font-ui)', background: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' };
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(24,60,90,0.4)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'sogi-pop .15s ease' }}>
      <div data-screen-label="Servidor de e-mail" onClick={e => e.stopPropagation()} style={{ width: 440, maxWidth: '94vw', background: 'var(--surface)', borderRadius: 14, boxShadow: 'var(--shadow-pop)', animation: 'sogi-pop .2s cubic-bezier(.3,1.3,.6,1)' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '15px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--ok)', display: 'flex' }}><Icon d={ICONS.server} size={16} /></span>
          <strong style={{ fontSize: 14 }}>{server ? `Editar ${server.name}` : 'Novo servidor de e-mail'}</strong>
          <span style={{ flex: 1 }}></span>
          <button onClick={onClose} style={{ color: 'var(--text-3)', display: 'flex', padding: 4 }}><Icon d={ICONS.x} size={15} /></button>
        </header>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 13 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
            Hostname
            <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="mail3.its.com.br" style={inputStyle} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
            Função
            <select value={kind} onChange={e => setKind(e.target.value)} style={inputStyle}>
              {['principal', 'backup / MX2', 'relay de saída', 'legado'].map(k => <option key={k}>{k}</option>)}
            </select>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
              SMTP
              <select value={smtp} onChange={e => setSmtp(e.target.value)} style={inputStyle}>
                {['587 (STARTTLS)', '465 (SSL)', '25 (sem TLS)'].map(p => <option key={p}>{p}</option>)}
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
              IMAP
              <select value={imap} onChange={e => setImap(e.target.value)} style={inputStyle}>
                {['993 (SSL)', '143 (STARTTLS)', '—'].map(p => <option key={p}>{p}</option>)}
              </select>
            </label>
          </div>
          <GhostBtn icon="refresh" onClick={() => window.SOGI_TOAST('Conexão testada: SMTP ok · IMAP ok · latência 14 ms')}>Testar conexão</GhostBtn>
        </div>
        <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '13px 20px', borderTop: '1px solid var(--border)' }}>
          <GhostBtn onClick={onClose}>Cancelar</GhostBtn>
          <PrimaryBtn icon="check" onClick={() => {
            if (!name.trim()) { window.SOGI_TOAST('Informe o hostname do servidor', 'warn'); return; }
            onSave({ name: name.trim(), kind, smtp, imap, status: server ? server.status : 'ativo', sync: server ? server.sync : 'agora' }, !server);
          }}>{server ? 'Salvar servidor' : 'Criar servidor'}</PrimaryBtn>
        </footer>
      </div>
    </div>
  );
}

/* ---------- Modal: editar conta de e-mail ---------- */
function EditEmailModal({ account, onClose, onSave }) {
  const [email, setEmail] = useStateCF(account.email);
  const [linkUser, setLinkUser] = useStateCF(account.user || 'externo');
  const [quota, setQuota] = useStateCF((account.quota.split('/ ')[1] || '10 GB').trim());
  const [status, setStatus] = useStateCF(account.status);
  const [signature, setSignature] = useStateCF(account.signature);
  const inputStyle = { width: '100%', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', fontFamily: 'var(--font-ui)', background: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box' };
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(24,60,90,0.4)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'sogi-pop .15s ease' }}>
      <div data-screen-label="Editar conta de e-mail" onClick={e => e.stopPropagation()} style={{ width: 460, maxWidth: '94vw', background: 'var(--surface)', borderRadius: 14, boxShadow: 'var(--shadow-pop)', animation: 'sogi-pop .2s cubic-bezier(.3,1.3,.6,1)' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '15px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--violet)', display: 'flex' }}><Icon d={ICONS.mail} size={16} /></span>
          <strong style={{ fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Editar conta — {account.email}</strong>
          <span style={{ flex: 1 }}></span>
          <button onClick={onClose} style={{ color: 'var(--text-3)', display: 'flex', padding: 4 }}><Icon d={ICONS.x} size={15} /></button>
        </header>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 13 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
            Endereço
            <input value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
              Vincular ao usuário
              <select value={linkUser} onChange={e => setLinkUser(e.target.value)} style={inputStyle}>
                {Object.values(SOGI_DATA.people).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                <option value="externo">{account.name || 'Colaborador (RH)'}</option>
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
              Cota
              <select value={quota} onChange={e => setQuota(e.target.value)} style={inputStyle}>
                {['5 GB', '10 GB', '20 GB', '50 GB'].map(qt => <option key={qt}>{qt}</option>)}
              </select>
            </label>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, cursor: 'pointer' }}>
              <CfSwitch on={status === 'ativo'} onClick={() => setStatus(s => s === 'ativo' ? 'suspensa' : 'ativo')} />
              {status === 'ativo' ? 'Conta ativa' : 'Conta suspensa'}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, cursor: 'pointer' }}>
              <CfSwitch on={signature} onClick={() => setSignature(s => !s)} />
              Assinatura padrão
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <GhostBtn icon="shield" onClick={() => window.SOGI_TOAST('Senha redefinida — instruções enviadas ao colaborador')}>Redefinir senha</GhostBtn>
            <GhostBtn icon="refresh" onClick={() => window.SOGI_TOAST('Caixa re-sincronizada com o cPanel')}>Re-sincronizar</GhostBtn>
          </div>
        </div>
        <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '13px 20px', borderTop: '1px solid var(--border)' }}>
          <GhostBtn onClick={onClose}>Cancelar</GhostBtn>
          <PrimaryBtn icon="check" onClick={() => onSave({ email: email.trim() || account.email, user: linkUser === 'externo' ? account.user : linkUser, quota: account.quota.split(' / ')[0] + ' / ' + quota, status, signature })}>Salvar conta</PrimaryBtn>
        </footer>
      </div>
    </div>
  );
}

/* ---------- Saúde da Stack ---------- */
function StackHealth() {
  const [analysis, setAnalysis] = useStateCF(false);
  const warn = SOGI_DATA.services.filter(s => s.status !== 'ok').length;
  const overall = warn === 0 ? 'ok' : warn <= 1 ? 'warn' : 'danger';
  const overallColor = { ok: 'var(--ok)', warn: 'var(--warn)', danger: 'var(--danger)' }[overall];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Semáforo geral + análise */}
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', padding: 'var(--pad)', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <button onClick={() => setAnalysis(a => !a)} title="Analisar saúde da stack" style={{
          width: 54, height: 54, borderRadius: '50%', background: overallColor, color: '#fff', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 0 6px color-mix(in srgb, ${overallColor} 18%, transparent), 0 4px 14px rgba(0,0,0,0.2)`,
          animation: overall !== 'ok' ? 'sogi-rt-pulse 1.6s infinite' : 'none',
        }}>
          <Icon d={overall === 'ok' ? ICONS.check : ICONS.alert} size={24} sw={2.2} />
        </button>
        <span style={{ flex: 1, minWidth: 180 }}>
          <strong style={{ fontSize: 14, display: 'block' }}>{overall === 'ok' ? 'Stack saudável' : `Atenção: ${warn} serviço(s) em alerta`}</strong>
          <span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>clique no botão de cor para análise da IA · atualizado há 30 s</span>
        </span>
        <PrimaryBtn icon="ai" onClick={() => setAnalysis(a => !a)}>{analysis ? 'Fechar análise' : 'Analisar saúde'}</PrimaryBtn>
      </div>
      {analysis && (
        <div style={{ background: 'var(--accent-soft)', borderRadius: 'var(--radius)', padding: 'var(--pad)', animation: 'sogi-fade-up .25s ease' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, color: 'var(--accent-text)', marginBottom: 7, fontSize: 12.5 }}>
            <Icon d={ICONS.ai} size={14} /> Análise da IA — agora
          </span>
          <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
            O <strong>RabbitMQ</strong> está com a fila de notificações 3× acima do normal (pico às 08h, horário dos disparos de SLA). RAM em 71% — tendência de estabilização até as 11h. O <strong>AI Service</strong> opera com latência alta (180 ms) por causa da reindexação da base de conhecimento. Recomendações: (1) aumentar consumidores da fila de notificações; (2) agendar reindexações para fora do horário comercial. Nenhuma ação crítica imediata.
          </p>
        </div>
      )}
      <Card title="Serviços" action={<Badge tone={overall === 'ok' ? 'ok' : 'warn'} dot>{overall === 'ok' ? 'operacional' : 'alerta'}</Badge>} pad={false}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              {['Serviço', 'CPU', 'RAM', 'Latência', 'Uptime', ''].map((h, i) => (
                <th key={i} style={{ textAlign: 'left', padding: '8px 14px', fontSize: 10.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SOGI_DATA.services.map((s, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '9px 14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.status === 'ok' ? 'var(--ok)' : 'var(--warn)', boxShadow: s.status !== 'ok' ? '0 0 6px var(--warn)' : 'none' }}></span>
                    <strong style={{ fontSize: 12 }}>{s.name}</strong>
                    {s.note && <Badge tone="warn">{s.note}</Badge>}
                  </span>
                </td>
                <td style={{ padding: '9px 14px', width: 110 }}><MiniMeter v={s.cpu} /></td>
                <td style={{ padding: '9px 14px', width: 110 }}><MiniMeter v={s.ram} /></td>
                <td className="mono" style={{ padding: '9px 14px', fontSize: 11, color: 'var(--text-2)' }}>{s.latency}</td>
                <td className="mono" style={{ padding: '9px 14px', fontSize: 11, color: 'var(--text-2)' }}>{s.uptime}</td>
                <td style={{ padding: '9px 14px', textAlign: 'right' }}>
                  <button title="Reiniciar serviço" onClick={() => window.SOGI_TOAST(`Serviço "${s.name}" reiniciado — ação registrada na auditoria`, 'warn')}
                    style={{ color: 'var(--text-3)', display: 'inline-flex', padding: 5, borderRadius: 6 }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                    <Icon d={ICONS.power} size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </Card>
    </div>
  );
}

function MiniMeter({ v }) {
  const color = v > 70 ? 'var(--danger)' : v > 45 ? 'var(--warn)' : 'var(--ok)';
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <span style={{ flex: 1, height: 5, borderRadius: 3, background: 'var(--bg)', overflow: 'hidden' }}>
        <span style={{ display: 'block', width: `${v}%`, height: '100%', background: color, borderRadius: 3 }}></span>
      </span>
      <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)', width: 28, textAlign: 'right' }}>{v}%</span>
    </span>
  );
}

/* ---------- Auditoria & Logs ---------- */
function AuditLog() {
  const [q, setQ] = useStateCF('');
  const [kindF, setKindF] = useStateCF(null);
  const [aiOpen, setAiOpen] = useStateCF(false);
  const kindTone = { approval: 'ok', service: 'warn', change: 'accent', supervision: 'violet', login: 'neutral', delete: 'danger', system: 'violet' };
  const kindLabel = { approval: 'Aprovação', service: 'Serviço', change: 'Alteração', supervision: 'Supervisão', login: 'Login', delete: 'Exclusão', system: 'Sistema' };
  const logs = SOGI_DATA.syslog.filter(l =>
    (!kindF || l.kind === kindF) &&
    (!q.trim() || (l.what + ' ' + l.mod + ' ' + SOGI_DATA.people[l.who].name).toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card title="Log completo do sistema" action={
        <div style={{ display: 'flex', gap: 8 }}>
          <GhostBtn icon="ai" onClick={() => setAiOpen(a => !a)}>{aiOpen ? 'Fechar análise' : 'Analisar com IA'}</GhostBtn>
          <GhostBtn icon="download" onClick={() => window.SOGI_TOAST('Exportando log completo (CSV)…')}>Exportar</GhostBtn>
        </div>
      } pad={false}>
        {/* Busca + filtros */}
        <div style={{ padding: '10px var(--pad)', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 240px', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', borderRadius: 8, padding: '7px 11px' }}>
            <Icon d={ICONS.search} size={14} style={{ color: 'var(--text-3)' }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Pesquisar no log: usuário, módulo, ação…"
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 12.5, minWidth: 0 }} />
          </div>
          <button onClick={() => setKindF(null)} style={{
            fontSize: 11, fontWeight: 600, borderRadius: 99, padding: '4px 11px',
            background: !kindF ? 'var(--nav-bg)' : 'transparent', color: !kindF ? '#fff' : 'var(--text-3)',
            border: '1px solid ' + (!kindF ? 'var(--nav-bg)' : 'var(--border)'),
          }}>Tudo</button>
          {Object.entries(kindLabel).map(([k, label]) => (
            <button key={k} onClick={() => setKindF(f => f === k ? null : k)} style={{
              fontSize: 11, fontWeight: 600, borderRadius: 99, padding: '4px 11px',
              background: kindF === k ? 'var(--nav-bg)' : 'transparent', color: kindF === k ? '#fff' : 'var(--text-3)',
              border: '1px solid ' + (kindF === k ? 'var(--nav-bg)' : 'var(--border)'),
            }}>{label}</button>
          ))}
        </div>
        {aiOpen && (
          <div style={{ padding: '12px var(--pad)', borderBottom: '1px solid var(--border)', background: 'var(--accent-soft)', animation: 'sogi-fade-up .2s ease' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, color: 'var(--accent-text)', marginBottom: 6, fontSize: 12 }}>
              <Icon d={ICONS.ai} size={13} /> Análise da IA — últimas 48h
            </span>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
              Padrão normal de uso. <strong>2 pontos de atenção</strong>: (1) falha de login do Pedro a partir de IP externo não usual (189.4.20.77) — sem sucesso, mas recomendo confirmar com o usuário; (2) backup noturno falhou 2 noites seguidas antes da correção de hoje — monitorar a próxima janela. O acesso de supervisão do Diego está dentro da política (chamado #4821).
            </p>
          </div>
        )}
        <div style={{ maxHeight: 420, overflowY: 'auto' }}>
          {logs.map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px var(--pad)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <Avatar person={l.who} size={24} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 12 }}>
                  <strong>{SOGI_DATA.people[l.who].name}</strong> <span style={{ color: 'var(--text-2)' }}>{l.what}</span>
                </span>
                <span className="mono" style={{ display: 'block', fontSize: 9.5, color: 'var(--text-3)', marginTop: 2 }}>{l.when} · {l.mod} · IP {l.ip}</span>
              </span>
              <Badge tone={kindTone[l.kind]}>{kindLabel[l.kind]}</Badge>
            </div>
          ))}
          {logs.length === 0 && <p className="mono" style={{ padding: 18, fontSize: 11, color: 'var(--text-3)', textAlign: 'center', margin: 0 }}>nenhum registro encontrado para "{q}"</p>}
        </div>
      </Card>
    </div>
  );
}

/* ---------- Aparência ---------- */
function AppearanceSettings() {
  const [mode, setMode] = useStateCF('light');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 620 }}>
      <Card title="Tema">
        <div style={{ display: 'flex', gap: 10 }}>
          {[['light', 'Claro'], ['dark', 'Escuro'], ['auto', 'Automático']].map(([id, label]) => (
            <button key={id} onClick={() => { setMode(id); window.SOGI_TOAST(id === 'light' ? 'Tema claro aplicado' : `Tema "${label}" — em desenvolvimento`, id === 'light' ? 'ok' : 'info'); }} style={{
              flex: 1, padding: '14px 0', borderRadius: 10, fontSize: 12.5, fontWeight: 600,
              border: mode === id ? '2px solid var(--accent)' : '1px solid var(--border)',
              background: id === 'dark' ? 'var(--nav-bg)' : id === 'auto' ? 'linear-gradient(90deg, var(--surface) 50%, var(--nav-bg) 50%)' : 'var(--surface)',
              color: id === 'dark' ? '#fff' : 'var(--text-2)',
            }}>{label}</button>
          ))}
        </div>
      </Card>
      <Card title="Marca e cor de ação">
        <p style={{ margin: '0 0 12px', fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.55 }}>
          A cor de ação e a densidade da interface podem ser ajustadas pelo painel <strong>Tweaks</strong> (barra superior do editor). O logo da empresa é gerenciado na seção Empresas.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          {['#E85928', '#0284c7', '#16a34a'].map(c => (
            <span key={c} style={{ width: 34, height: 34, borderRadius: 9, background: c, boxShadow: 'var(--shadow-card)' }}></span>
          ))}
        </div>
      </Card>
    </div>
  );
}

Object.assign(window, { SettingsScreen, StackHealth, AuditLog, UsersSettings, ModulesSettings });
