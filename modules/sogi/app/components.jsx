// SOGI — componentes compartilhados (shell, avatares, badges, painel IA)
const { useState, useEffect, useRef } = React;

/* ---------- Ícones (traço simples, 24x24) ---------- */
const Icon = ({ d, size = 18, sw = 1.7, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {d.split('|').map((p, i) => <path key={i} d={p} />)}
  </svg>
);

const ICONS = {
  dashboard: 'M3 3h8v10H3z M13 3h8v6h-8z M13 11h8v10h-8z M3 15h8v6H3z',
  projects: 'M3 7h18 M3 7l2-3h6l2 3 M3 7v13h18V7',
  tasks: 'M9 6h11 M9 12h11 M9 18h11 M4 6l1 1 2-2 M4 12l1 1 2-2 M4 18l1 1 2-2',
  tickets: 'M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z M13 6v2 M13 11v2 M13 16v2',
  calendar: 'M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z M16 3v4 M8 3v4 M4 11h16',
  chat: 'M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z',
  docs: 'M6 3h9l4 4v14H6z M15 3v4h4 M9 12h7 M9 16h7',
  reports: 'M4 20V10 M10 20V4 M16 20v-7 M21 20H3',
  ai: 'M12 3l1.7 4.8L18.5 9.5l-4.8 1.7L12 16l-1.7-4.8L5.5 9.5l4.8-1.7z M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z',
  trophy: 'M8 4h8v6a4 4 0 0 1-8 0z M8 5H5a3 3 0 0 0 3 4 M16 5h3a3 3 0 0 1-3 4 M12 14v3 M8 20h8 M10 17h4v3h-4z',
  settings: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L14.2 3h-4l-.4 2.6a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2l.4 2.7h4l.4-2.7a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M16 16l5 5',
  bell: 'M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6 M10 19a2 2 0 0 0 4 0',
  mail: 'M4 6h16v12H4z M4 7l8 6 8-6',
  plus: 'M12 5v14 M5 12h14',
  x: 'M6 6l12 12 M18 6L6 18',
  chevR: 'M9 6l6 6-6 6',
  chevD: 'M6 9l6 6 6-6',
  clock: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z M12 8v4l3 2',
  check: 'M5 13l4 4L19 7',
  alert: 'M12 4l9 16H3z M12 10v4 M12 17.5v.5',
  file: 'M6 3h9l4 4v14H6z M15 3v4h4',
  server: 'M4 5h16v6H4z M4 13h16v6H4z M8 8h.01 M8 16h.01',
  award: 'M12 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10z M9 12l-2 9 5-3 5 3-2-9',
  send: 'M21 3L10 14 M21 3l-7 18-4-7-7-4z',
  flag: 'M5 21V4 M5 5h13l-3 4 3 4H5',
  link: 'M9 15l6-6 M8 12l-2.5 2.5a3.5 3.5 0 0 0 5 5L13 17 M16 12l2.5-2.5a3.5 3.5 0 0 0-5-5L11 7',
  paperclip: 'M8 12l6.5-6.5a3.5 3.5 0 0 1 5 5L11 19a5.5 5.5 0 0 1-7.8-7.8L11 3.5',
  building: 'M5 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16 M15 9h3a1 1 0 0 1 1 1v11 M3 21h18 M8 8h2 M8 12h2 M8 16h2',
  kanban: 'M4 4h4v16H4z M10 4h4v10h-4z M16 4h4v7h-4z',
  list: 'M8 6h13 M8 12h13 M8 18h13 M4 6h.01 M4 12h.01 M4 18h.01',
  gantt: 'M3 5h8 M7 10h10 M11 15h8 M3 20h18',
  flow: 'M5 3h4v4H5z M15 10h4v4h-4z M5 17h4v4H5z M9 5h8a2 2 0 0 1 2 2v3 M9 19h8a2 2 0 0 0 2-2v-3 M7 7v10',
  users: 'M9 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M3 20a6 6 0 0 1 12 0 M16 8a3 3 0 0 1 0 6 M17 14a6 6 0 0 1 4.5 6',
  arrowUp: 'M12 19V5 M5 12l7-7 7 7',
  dots: 'M5 12h.01 M12 12h.01 M19 12h.01',
  chevL: 'M15 6l-6 6 6 6',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M9 12l2 2 4-4',
  zap: 'M13 2L4 14h6l-1 8 9-12h-6z',
  folder: 'M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z',
  download: 'M12 4v12 M6 11l6 6 6-6 M4 21h16',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
  refresh: 'M20 11a8 8 0 1 0-2.3 6.3 M20 4v7h-7',
  power: 'M12 3v8 M6.3 6.3a8 8 0 1 0 11.4 0',
  play: 'M7 5l12 7-12 7z',
  moon: 'M20 13A8 8 0 1 1 11 4a6.5 6.5 0 0 0 9 9z',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4',
  mic: 'M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z M5 11a7 7 0 0 0 14 0 M12 18v3 M9 21h6',
  megaphone: 'M3 11v2a2 2 0 0 0 2 2h1l2 5h2l-1.5-5H11l8 3V4l-8 3H5a2 2 0 0 0-2 2v2z M19 9a3 3 0 0 1 0 6',
  smile: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M9 10h.01 M15 10h.01 M8.5 14.5a4.5 4.5 0 0 0 7 0',
  whatsapp: 'M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z M8.8 9.5c.3 2.5 3.2 5.2 5.7 5.7l1.3-1.3-2-1.2-1 .7c-.8-.4-1.7-1.3-2.2-2.2l.7-1-1.2-2z',
  inbox: 'M4 13l3-9h10l3 9 M4 13v6h16v-6 M4 13h5a3 3 0 0 0 6 0h5',
  trash: 'M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13 M10 11v5 M14 11v5',
  draft: 'M5 4h14v16H5z M9 8h6 M9 12h6 M9 16h3',
};

/* ---------- Avatar ---------- */
function Avatar({ person, size = 28, showStatus = false }) {
  const p = typeof person === 'string' ? SOGI_DATA.people[person] : person;
  if (!p) return null;
  const statusColor = { online: 'var(--ok)', busy: 'var(--danger)', away: 'var(--warn)', invisible: 'var(--border-strong)', offline: 'var(--border-strong)' }[p.status];
  return (
    <span title={p.name} style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <span style={{
        width: size, height: size, borderRadius: '50%', background: p.color, color: '#fff',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.36, fontWeight: 600, letterSpacing: '0.02em',
      }}>{p.initials}</span>
      {showStatus && (
        <span style={{
          position: 'absolute', right: -1, bottom: -1, width: size * 0.32, height: size * 0.32,
          borderRadius: '50%', background: statusColor, border: '2px solid var(--surface)',
        }}></span>
      )}
    </span>
  );
}

function AvatarStack({ ids, size = 24, max = 4 }) {
  const shown = ids.slice(0, max);
  return (
    <span style={{ display: 'inline-flex' }}>
      {shown.map((id, i) => (
        <span key={id} style={{ marginLeft: i === 0 ? 0 : -size * 0.3, border: '2px solid var(--surface)', borderRadius: '50%', display: 'inline-flex' }}>
          <Avatar person={id} size={size} />
        </span>
      ))}
      {ids.length > max && (
        <span style={{
          marginLeft: -size * 0.3, width: size + 4, height: size + 4, borderRadius: '50%',
          background: 'var(--surface-2)', border: '2px solid var(--surface)', color: 'var(--text-2)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600,
        }}>+{ids.length - max}</span>
      )}
    </span>
  );
}

/* ---------- Badges ---------- */
const TONE = {
  accent: { bg: 'var(--accent-soft)', fg: 'var(--accent-text)' },
  ok: { bg: 'var(--ok-soft)', fg: 'var(--ok)' },
  warn: { bg: 'var(--warn-soft)', fg: 'var(--warn)' },
  danger: { bg: 'var(--danger-soft)', fg: 'var(--danger)' },
  violet: { bg: 'var(--violet-soft)', fg: 'var(--violet)' },
  neutral: { bg: 'var(--surface-2)', fg: 'var(--text-2)' },
};

function Badge({ tone = 'neutral', children, dot = false }) {
  const t = TONE[tone] || TONE.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, background: t.bg, color: t.fg,
      borderRadius: 999, padding: '2.5px 9px', fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></span>}
      {children}
    </span>
  );
}

const PRIORITY_TONE = { 'crítica': 'danger', 'alta': 'warn', 'média': 'accent', 'baixa': 'neutral' };

function PriorityBadge({ p }) {
  return <Badge tone={PRIORITY_TONE[p] || 'neutral'} dot>{p}</Badge>;
}

/* ---------- Card ---------- */
function Card({ title, action, children, style, pad = true }) {
  return (
    <section style={{
      background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)',
      display: 'flex', flexDirection: 'column', minWidth: 0, ...style,
    }}>
      {title && (
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 'var(--pad)', paddingBottom: 10,
        }}>
          <h3 style={{ margin: 0, fontSize: 13.5, fontWeight: 600, letterSpacing: '0.01em' }}>{title}</h3>
          {action}
        </header>
      )}
      <div style={{ padding: pad ? 'var(--pad)' : 0, paddingTop: title ? 0 : undefined, flex: 1, minHeight: 0 }}>{children}</div>
    </section>
  );
}

/* ---------- Topbar ---------- */
function Topbar({ onToggleAI, aiOpen, onNavigate }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [myStatus, setMyStatus] = useState('online');
  const closeAll = () => { setNotifOpen(false); setCompanyOpen(false); setUserOpen(false); };
  return (
    <header data-screen-label="Topbar" style={{
      height: 'var(--topbar-h)', background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', flexShrink: 0, position: 'relative', zIndex: 30,
    }}>
      {/* Busca global */}
      <div className="topbar-search" style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--bg)', borderRadius: 8, padding: '7px 12px', color: 'var(--text-3)',
        border: '1px solid transparent',
      }}>
        <Icon d={ICONS.search} size={15} />
        <span style={{ fontSize: 13 }}>Buscar projetos, tarefas, pessoas…</span>
        <span className="mono kbd-hint" style={{ marginLeft: 'auto', fontSize: 10.5, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 5, padding: '1px 6px' }}>⌘K</span>
      </div>

      <div style={{ flex: 1 }}></div>

      {/* Empresa */}
      <div style={{ position: 'relative' }}>
        <button onClick={() => { const o = companyOpen; closeAll(); setCompanyOpen(!o); }} style={{
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)',
          border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px',
          background: companyOpen ? 'var(--surface-2)' : 'transparent',
        }}>
          <Icon d={ICONS.building} size={14} />
          <span className="topbar-company-name">ITS Tecnologia</span>
          <span style={{ display: 'flex', transition: 'transform .15s', transform: companyOpen ? 'rotate(180deg)' : 'none' }}><Icon d={ICONS.chevD} size={12} /></span>
        </button>
        {companyOpen && <CompanyDropdown onClose={() => setCompanyOpen(false)} onNavigate={onNavigate} />}
      </div>

      {/* Mobile / PWA */}
      <button onClick={() => window.SOGI_OPEN_MOBILE && window.SOGI_OPEN_MOBILE()} title="Ver app mobile (PWA)" style={{
        color: 'var(--text-2)', padding: 7, borderRadius: 8, display: 'flex', border: '1px solid var(--border)',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <Icon d={'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z M11 19h2'} size={16} />
      </button>

      {/* Tema claro/escuro */}
      <button onClick={() => window.SOGI_TOGGLE_THEME && window.SOGI_TOGGLE_THEME()} title="Alternar tema claro/escuro" style={{
        color: 'var(--text-2)', padding: 7, borderRadius: 8, display: 'flex', border: '1px solid var(--border)',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <Icon d={document.documentElement.getAttribute('data-theme') === 'dark' ? ICONS.sun : ICONS.moon} size={16} />
      </button>

      {/* IA */}
      <button onClick={onToggleAI} title="Assistente IA" style={{
        display: 'flex', alignItems: 'center', gap: 7, borderRadius: 8, padding: '7px 12px',
        background: aiOpen ? 'var(--accent)' : 'var(--accent-soft)', color: aiOpen ? '#fff' : 'var(--accent-text)',
        fontWeight: 600, fontSize: 12.5, transition: 'background .15s',
      }}>
        <Icon d={ICONS.ai} size={15} />
        Assistente
      </button>

      <div style={{ position: 'relative' }}>
        <IconBtn icon="bell" count={4} onClick={() => { const o = notifOpen; closeAll(); setNotifOpen(!o); }} active={notifOpen} />
        {notifOpen && <NotifDropdown onClose={() => setNotifOpen(false)} onNavigate={onNavigate} />}
      </div>
      <IconBtn icon="mail" count={2} onClick={() => onNavigate('comunicacao')} />

      <span style={{ width: 1, height: 24, background: 'var(--border)' }}></span>
      <div style={{ position: 'relative' }}>
        <button onClick={() => { const o = userOpen; closeAll(); setUserOpen(!o); }} style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0, borderRadius: 8, padding: '3px 6px', background: userOpen ? 'var(--surface-2)' : 'transparent' }}>
          <Avatar person={{ ...SOGI_DATA.people.rafael, status: myStatus }} size={32} showStatus />
          <span className="topbar-profile-text" style={{ textAlign: 'left', lineHeight: 1.25, whiteSpace: 'nowrap' }}>
            <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600 }}>Rafael Souza</span>
            <span style={{ display: 'block', fontSize: 11, color: 'var(--text-3)' }}>Gerente de Projetos</span>
          </span>
          <span style={{ display: 'flex', color: 'var(--text-3)', transition: 'transform .15s', transform: userOpen ? 'rotate(180deg)' : 'none' }}><Icon d={ICONS.chevD} size={12} /></span>
        </button>
        {userOpen && <UserDropdown onClose={() => setUserOpen(false)} myStatus={myStatus} setMyStatus={setMyStatus} />}
      </div>
    </header>
  );
}

function IconBtn({ icon, count, onClick, active }) {
  return (
    <button onClick={onClick} style={{
      position: 'relative', color: active ? 'var(--accent-text)' : 'var(--text-2)', padding: 7,
      borderRadius: 8, display: 'flex', background: active ? 'var(--accent-soft)' : 'transparent',
      transition: 'background .15s, color .15s',
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
      <Icon d={ICONS[icon]} size={18} />
      {count > 0 && (
        <span style={{
          position: 'absolute', top: 1, right: 0, minWidth: 15, height: 15, borderRadius: 8,
          background: 'var(--danger)', color: '#fff', fontSize: 9.5, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
        }}>{count}</span>
      )}
    </button>
  );
}

/* ---------- Sidebar ---------- */
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'projetos', label: 'Projetos', icon: 'projects' },
  { id: 'tarefas', label: 'Tarefas', icon: 'tasks', count: 5 },
  { id: 'chamados', label: 'Chamados', icon: 'tickets', count: 5 },
  { id: 'calendario', label: 'Calendário', icon: 'calendar' },
  { id: 'comunicacao', label: 'Comunicação', icon: 'chat', count: 4 },
  { id: 'feed', label: 'Feed', icon: 'megaphone' },
  { id: 'documentos', label: 'Documentos', icon: 'docs' },
  { id: 'relatorios', label: 'Relatórios', icon: 'reports' },
  { id: 'ia', label: 'IA', icon: 'ai' },
  { id: 'gamificacao', label: 'Gamificação', icon: 'trophy' },
  { id: 'configuracoes', label: 'Configurações', icon: 'settings' },
];

function Sidebar({ screen, onNavigate, collapsed, onToggleCollapse }) {
  return (
    <nav data-screen-label="Sidebar" style={{
      width: collapsed ? 64 : 'var(--sidebar-w)', background: 'var(--nav-bg)', display: 'flex', flexDirection: 'column',
      flexShrink: 0, color: 'var(--nav-text)', transition: 'width .25s cubic-bezier(.4,0,.2,1)', overflow: 'hidden',
    }}>
      {/* Logo ITS */}
      <div style={{ display: 'flex', alignItems: 'center', padding: collapsed ? '14px 12px' : '16px 18px', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {collapsed ? (
          <span style={{
            width: 34, height: 34, borderRadius: 8, background: 'var(--accent)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11,
            letterSpacing: '0.02em', flexShrink: 0,
          }}>ITS</span>
        ) : (
          <>
            <img className="its-logo-on-dark" src="assets/its-logo-light.png" alt="ITS Customer Service" style={{ height: 44, width: 'auto', display: 'block' }} />
            <img className="its-logo-on-light" src="assets/its-logo.png" alt="ITS Customer Service" style={{ height: 44, width: 'auto', display: 'none' }} />
          </>
        )}
      </div>
      {!collapsed && (
        <div style={{ textAlign: 'center', padding: '8px 12px 2px' }}>
          <div className="mono" style={{ fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.55 }}>SOGI · Gestão Interna</div>
          <div style={{ fontSize: 9, opacity: 0.45, marginTop: 2, letterSpacing: '0.02em' }}>Sistema Operacional de Gestão Interna</div>
        </div>
      )}

      <div style={{ padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto', overflowX: 'hidden', flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const active = screen === item.id || (item.id === 'projetos' && screen === 'projeto');
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)} title={collapsed ? item.label : undefined} style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: collapsed ? '10px 0' : '8.5px 11px', borderRadius: 8,
              justifyContent: collapsed ? 'center' : 'flex-start',
              background: active ? 'var(--nav-active)' : 'transparent',
              color: active ? 'var(--nav-text-active)' : 'var(--nav-text)',
              fontWeight: active ? 600 : 500, fontSize: 13, textAlign: 'left',
              transition: 'background .12s, color .12s', position: 'relative',
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ position: 'relative', display: 'flex', flexShrink: 0 }}>
                <Icon d={ICONS[item.icon]} size={16.5} sw={1.6} />
                {collapsed && item.count > 0 && (
                  <span style={{ position: 'absolute', top: -3, right: -5, width: 7, height: 7, borderRadius: '50%', background: 'var(--danger)' }}></span>
                )}
              </span>
              {!collapsed && <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{item.label}</span>}
              {!collapsed && item.count > 0 && (
                <span style={{
                  fontSize: 10.5, fontWeight: 700, background: 'rgba(255,255,255,0.1)', borderRadius: 99,
                  padding: '1px 7px', color: active ? '#fff' : 'var(--nav-text)',
                }}>{item.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Recolher */}
      <button onClick={onToggleCollapse} title={collapsed ? 'Expandir menu' : 'Recolher menu'} style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '11px 0' : '10px 21px',
        justifyContent: collapsed ? 'center' : 'flex-start', color: 'var(--nav-text)', fontSize: 12,
        borderTop: '1px solid rgba(255,255,255,0.07)', transition: 'background .12s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <span style={{ display: 'flex', transition: 'transform .25s', transform: collapsed ? 'rotate(180deg)' : 'none' }}>
          <Icon d={ICONS.chevL} size={15} />
        </span>
        {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>Recolher menu</span>}
      </button>

      {/* Rodapé: saúde da stack */}
      <div style={{ padding: collapsed ? '12px 0' : '12px 18px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: collapsed ? 'center' : 'flex-start' }}>
        {collapsed ? (
          <span title="Todos os serviços operacionais" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ok)', boxShadow: '0 0 6px var(--ok)' }}></span>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, whiteSpace: 'nowrap' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok)', boxShadow: '0 0 6px var(--ok)', flexShrink: 0 }}></span>
              Todos os serviços operacionais
            </div>
            <div className="mono" style={{ fontSize: 9.5, opacity: 0.55, marginTop: 3 }}>uptime 99.98% · 11 serviços</div>
          </div>
        )}
      </div>
    </nav>
  );
}

/* ---------- Painel IA (contextual, direita) ---------- */
function AIPanel({ onClose }) {
  const [input, setInput] = useState('');
  return (
    <aside data-screen-label="Painel IA" style={{
      width: 320, flexShrink: 0, background: 'var(--surface)', borderLeft: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', animation: 'sogi-fade-up .2s ease',
    }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--accent-text)', display: 'flex' }}><Icon d={ICONS.ai} size={17} /></span>
        <strong style={{ fontSize: 13.5 }}>Assistente SOGI</strong>
        <button onClick={onClose} style={{ marginLeft: 'auto', color: 'var(--text-3)', display: 'flex', padding: 4 }}>
          <Icon d={ICONS.x} size={15} />
        </button>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.55 }}>
          Bom dia, Rafael! Analisei sua operação. Aqui está o que merece atenção agora:
        </p>
        {SOGI_DATA.aiInsights.map((ins, i) => <AIInsightCard key={i} insight={ins} />)}
      </div>

      <footer style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 9, flexWrap: 'wrap' }}>
          {['Resumir meu dia', 'Criar tarefa', 'Gerar ata'].map(s => (
            <button key={s} style={{
              fontSize: 11.5, fontWeight: 600, color: 'var(--accent-text)', background: 'var(--accent-soft)',
              borderRadius: 99, padding: '4px 11px',
            }}>{s}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg)', borderRadius: 9, padding: '4px 4px 4px 12px' }}>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Pergunte qualquer coisa…"
                 style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 12.5, minWidth: 0 }} />
          <button style={{
            width: 30, height: 30, borderRadius: 7, background: 'var(--accent)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}><Icon d={ICONS.send} size={14} /></button>
        </div>
      </footer>
    </aside>
  );
}

function AIInsightCard({ insight }) {
  const tone = { risk: 'danger', suggest: 'warn', info: 'accent' }[insight.kind];
  const t = TONE[tone];
  const label = { risk: 'Risco detectado', suggest: 'Sugestão', info: 'Automático' }[insight.kind];
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
      <Badge tone={tone} dot>{label}</Badge>
      <h4 style={{ margin: '8px 0 4px', fontSize: 12.5, fontWeight: 600 }}>{insight.title}</h4>
      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>{insight.text}</p>
      <button style={{ marginTop: 9, fontSize: 12, fontWeight: 600, color: 'var(--accent-text)', display: 'flex', alignItems: 'center', gap: 4 }}>
        {insight.action} <Icon d={ICONS.chevR} size={12} />
      </button>
    </div>
  );
}

/* ---------- Tela placeholder (módulos não construídos) ---------- */
function PlaceholderScreen({ label, icon }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 14, color: 'var(--text-3)', animation: 'sogi-fade-up .25s ease',
    }}>
      <span style={{
        width: 64, height: 64, borderRadius: 18, background: 'var(--surface)', boxShadow: 'var(--shadow-card)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)',
      }}><Icon d={ICONS[icon] || ICONS.docs} size={26} sw={1.4} /></span>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 16, color: 'var(--text-2)' }}>{label}</h2>
        <p className="mono" style={{ margin: '6px 0 0', fontSize: 11, letterSpacing: '0.04em' }}>módulo planejado — próxima fase do protótipo</p>
      </div>
    </div>
  );
}

/* ---------- Cabeçalho de página ---------- */
function PageHeader({ title, subtitle, crumbs, actions }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
      <div>
        {crumbs && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-3)', marginBottom: 5 }}>
            {crumbs.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <Icon d={ICONS.chevR} size={11} />}
                {c.onClick
                  ? <button onClick={c.onClick} style={{ color: 'var(--text-3)', fontSize: 12 }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-text)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>{c.label}</button>
                  : <span>{c.label}</span>}
              </React.Fragment>
            ))}
          </div>
        )}
        <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</h1>
        {subtitle && <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-2)' }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>{actions}</div>}
    </div>
  );
}

function PrimaryBtn({ children, icon, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 7, background: 'var(--accent)', color: '#fff',
      borderRadius: 8, padding: '8px 14px', fontWeight: 600, fontSize: 12.5,
    }}>
      {icon && <Icon d={ICONS[icon]} size={14} />}
      {children}
    </button>
  );
}

function GhostBtn({ children, icon, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 7, background: 'var(--surface)', color: 'var(--text-2)',
      border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', fontWeight: 600, fontSize: 12.5,
    }}>
      {icon && <Icon d={ICONS[icon]} size={14} />}
      {children}
    </button>
  );
}

/* ---------- Dropdown de empresa ---------- */
function CompanyDropdown({ onClose, onNavigate }) {
  useEffect(() => {
    const h = () => onClose();
    setTimeout(() => document.addEventListener('click', h), 0);
    return () => document.removeEventListener('click', h);
  }, []);
  return (
    <div onClick={e => e.stopPropagation()} style={{
      position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 290, background: 'var(--surface)',
      borderRadius: 12, boxShadow: 'var(--shadow-pop)', zIndex: 60, animation: 'sogi-pop .15s ease', overflow: 'hidden',
    }}>
      <header style={{ padding: '11px 14px 8px', fontSize: 10.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Alternar empresa</header>
      {SOGI_DATA.companies.map((c, i) => (
        <button key={c.id} onClick={() => { window.SOGI_TOAST(c.current ? 'Você já está na ' + c.name : 'Empresa alterada para ' + c.name); onClose(); }} style={{
          display: 'flex', alignItems: 'center', gap: 11, padding: '10px 14px', width: '100%', textAlign: 'left',
          borderTop: '1px solid var(--border)', background: c.current ? 'var(--accent-soft)' : 'transparent',
          opacity: c.active ? 1 : 0.5,
        }}
          onMouseEnter={e => { if (!c.current) e.currentTarget.style.background = 'var(--surface-2)'; }}
          onMouseLeave={e => { if (!c.current) e.currentTarget.style.background = 'transparent'; }}>
          <span style={{
            width: 30, height: 30, borderRadius: 8, background: c.current ? 'var(--accent)' : 'var(--nav-bg)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 10, flexShrink: 0,
          }}>{c.name.slice(0, 3).toUpperCase()}</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ fontSize: 12.5, display: 'block' }}>{c.name}</strong>
            <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>{c.cnpj} · {c.users} usuários</span>
          </span>
          {c.current && <span style={{ color: 'var(--accent-text)', display: 'flex' }}><Icon d={ICONS.check} size={15} sw={2.4} /></span>}
        </button>
      ))}
      <button onClick={() => { onNavigate('configuracoes'); window.SOGI_TOAST('Abra a seção "Empresas" para criar uma nova', 'info'); onClose(); }} style={{
        display: 'flex', alignItems: 'center', gap: 9, padding: '11px 14px', width: '100%',
        borderTop: '1px solid var(--border)', color: 'var(--accent-text)', fontWeight: 600, fontSize: 12.5,
      }}>
        <Icon d={ICONS.plus} size={14} /> Criar nova empresa
      </button>
    </div>
  );
}

/* ---------- Dropdown do usuário ---------- */
function UserDropdown({ onClose, myStatus, setMyStatus }) {
  useEffect(() => {
    const h = () => onClose();
    setTimeout(() => document.addEventListener('click', h), 0);
    return () => document.removeEventListener('click', h);
  }, []);
  const statuses = [
    ['online', 'Disponível', 'var(--ok)'],
    ['busy', 'Ocupado', 'var(--danger)'],
    ['away', 'Ausente', 'var(--warn)'],
    ['invisible', 'Invisível', 'var(--border-strong)'],
  ];
  return (
    <div onClick={e => e.stopPropagation()} style={{
      position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 250, background: 'var(--surface)',
      borderRadius: 12, boxShadow: 'var(--shadow-pop)', zIndex: 60, animation: 'sogi-pop .15s ease', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '13px 14px', borderBottom: '1px solid var(--border)' }}>
        <Avatar person={{ ...SOGI_DATA.people.rafael, status: myStatus }} size={38} showStatus />
        <span>
          <strong style={{ fontSize: 13, display: 'block' }}>Rafael Souza</strong>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>rafael@its.com.br</span>
        </span>
      </div>
      <div style={{ padding: '9px 14px 5px', fontSize: 10.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Status</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, padding: '0 14px 10px' }}>
        {statuses.map(([id, label, color]) => (
          <button key={id} onClick={() => { setMyStatus(id); window.SOGI_TOAST(id === 'invisible' ? 'Você está invisível — aparece offline para os colegas' : `Status: ${label}`); }} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            fontSize: 10.5, fontWeight: 600, borderRadius: 7, padding: '6px 0',
            border: myStatus === id ? '1.5px solid var(--accent)' : '1px solid var(--border)',
            background: myStatus === id ? 'var(--accent-soft)' : 'transparent',
            color: myStatus === id ? 'var(--accent-text)' : 'var(--text-2)',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: color }}></span>{label}
          </button>
        ))}
      </div>
      {[['Meu perfil', 'users'], ['Minhas conquistas', 'award'], ['Preferências', 'settings']].map(([label, icon]) => (
        <button key={label} onClick={() => { window.SOGI_TOAST(`"${label}" — em breve`, 'info'); onClose(); }} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', width: '100%', textAlign: 'left',
          fontSize: 12.5, fontWeight: 500, color: 'var(--text-2)', borderTop: '1px solid var(--border)',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <Icon d={ICONS[icon]} size={14} /> {label}
        </button>
      ))}
      <button onClick={() => { onClose(); window.SOGI_LOGOUT && window.SOGI_LOGOUT(); }} style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', width: '100%', textAlign: 'left',
        fontSize: 12.5, fontWeight: 600, color: 'var(--danger)', borderTop: '1px solid var(--border)',
      }}>
        <Icon d={ICONS.power} size={14} /> Sair
      </button>
    </div>
  );
}

/* ---------- Dropdown de notificações ---------- */
function NotifDropdown({ onClose, onNavigate }) {
  useEffect(() => {
    const h = () => onClose();
    setTimeout(() => document.addEventListener('click', h), 0);
    return () => document.removeEventListener('click', h);
  }, []);
  return (
    <div onClick={e => e.stopPropagation()} style={{
      position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 340, background: 'var(--surface)',
      borderRadius: 12, boxShadow: 'var(--shadow-pop)', zIndex: 60, animation: 'sogi-pop .15s ease', overflow: 'hidden',
    }}>
      <header style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
        <strong style={{ fontSize: 13 }}>Notificações</strong>
        <span style={{ flex: 1 }}></span>
        <button onClick={() => { window.SOGI_TOAST('Todas as notificações marcadas como lidas'); onClose(); }}
          style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--accent-text)' }}>marcar lidas</button>
      </header>
      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
        {SOGI_DATA.notifications.map((n, i) => (
          <button key={i} onClick={() => { onNavigate('dashboard'); onClose(); }} style={{
            display: 'flex', gap: 10, padding: '11px 14px', width: '100%', textAlign: 'left',
            borderTop: i > 0 ? '1px solid var(--border)' : 'none',
            background: n.unread ? 'var(--accent-soft)' : 'transparent', alignItems: 'flex-start',
          }}>
            <Avatar person={n.who} size={28} />
            <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, lineHeight: 1.45 }}>
              <strong>{SOGI_DATA.people[n.who].name.split(' ')[0]}</strong> {n.text}
              <span className="mono" style={{ display: 'block', fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{n.when}</span>
            </span>
            {n.unread && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', marginTop: 5, flexShrink: 0 }}></span>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Toasts ---------- */
function ToastHost() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    window.SOGI_TOAST = (msg, tone = 'ok') => {
      const id = Date.now() + Math.random();
      setToasts(ts => [...ts, { id, msg, tone }]);
      setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3400);
    };
    return () => { window.SOGI_TOAST = () => {}; };
  }, []);
  return (
    <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 100, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: 'var(--nav-bg)', color: '#fff', borderRadius: 10, padding: '10px 16px',
          fontSize: 12.5, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 9,
          boxShadow: '0 8px 30px rgba(14,28,48,0.3)', animation: 'sogi-toast-in .25s cubic-bezier(.3,1.4,.6,1)',
        }}>
          <span style={{ color: t.tone === 'ok' ? 'var(--ok)' : t.tone === 'warn' ? 'var(--warn)' : 'var(--accent)', display: 'flex' }}>
            <Icon d={t.tone === 'ok' ? ICONS.check : ICONS.alert} size={14} sw={2.2} />
          </span>
          {t.msg}
        </div>
      ))}
      <style>{`@keyframes sogi-toast-in { from { opacity: 0; transform: translateY(14px) scale(.95); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
}

/* ---------- Modal: nova tarefa ---------- */
function NewTaskModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [project, setProject] = useState('ERP-MIG');
  const [priority, setPriority] = useState('média');
  const [due, setDue] = useState('Amanhã');
  const create = () => {
    if (!name.trim()) { window.SOGI_TOAST('Dê um nome à tarefa', 'warn'); return; }
    onCreate({ id: 'new' + Date.now(), title: name.trim(), project, due, late: false, priority });
    window.SOGI_TOAST('Tarefa criada com sucesso');
    onClose();
  };
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(14,28,48,0.4)', zIndex: 70,
      display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'sogi-pop .15s ease',
    }}>
      <div data-screen-label="Nova tarefa" onClick={e => e.stopPropagation()} style={{
        width: 460, maxWidth: '92vw', background: 'var(--surface)', borderRadius: 14,
        boxShadow: 'var(--shadow-pop)', animation: 'sogi-pop .2s cubic-bezier(.3,1.3,.6,1)',
      }}>
        <header style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <strong style={{ fontSize: 14.5 }}>Nova tarefa</strong>
          <span style={{ flex: 1 }}></span>
          <button onClick={onClose} style={{ color: 'var(--text-3)', display: 'flex', padding: 4 }}><Icon d={ICONS.x} size={15} /></button>
        </header>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>Nome da tarefa</span>
            <input autoFocus value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && create()}
              placeholder="Ex.: Revisar plano de corte da migração"
              style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', background: 'var(--surface)' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>Projeto</span>
              <select value={project} onChange={e => setProject(e.target.value)}
                style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '9px 10px', fontSize: 13, fontFamily: 'var(--font-ui)', background: 'var(--surface)', color: 'var(--text)' }}>
                {SOGI_DATA.projects.map(p => <option key={p.id} value={p.code}>{p.code} — {p.name}</option>)}
                <option value="Gestão">Gestão (sem projeto)</option>
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>Prazo</span>
              <select value={due} onChange={e => setDue(e.target.value)}
                style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '9px 10px', fontSize: 13, fontFamily: 'var(--font-ui)', background: 'var(--surface)', color: 'var(--text)' }}>
                {['Hoje', 'Amanhã', '13 Jun', '16 Jun', '20 Jun', '28 Jun'].map(d => <option key={d}>{d}</option>)}
              </select>
            </label>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>Prioridade</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {['baixa', 'média', 'alta', 'crítica'].map(p => (
                <button key={p} onClick={() => setPriority(p)} style={{
                  flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  border: priority === p ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                  background: priority === p ? 'var(--accent-soft)' : 'var(--surface)',
                  color: priority === p ? 'var(--accent-text)' : 'var(--text-2)', transition: 'all .12s',
                }}>{p}</button>
              ))}
            </div>
          </div>
        </div>
        <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
          <GhostBtn onClick={onClose}>Cancelar</GhostBtn>
          <PrimaryBtn icon="plus" onClick={create}>Criar tarefa</PrimaryBtn>
        </footer>
      </div>
    </div>
  );
}

/* ---------- Menu de contexto global (botão direito) ---------- */
function CtxMenuHost() {
  const [menu, setMenu] = useState(null); // {x, y, items}
  useEffect(() => {
    window.SOGI_CTX = (e, items) => {
      e.preventDefault();
      e.stopPropagation();
      const W = 230, H = items.length * 38 + 12;
      const x = Math.min(e.clientX, window.innerWidth - W - 8);
      const y = Math.min(e.clientY, window.innerHeight - H - 8);
      setMenu({ x, y, items });
    };
    const close = () => setMenu(null);
    document.addEventListener('click', close);
    document.addEventListener('contextmenu', close, true);
    window.addEventListener('blur', close);
    return () => {
      window.SOGI_CTX = () => {};
      document.removeEventListener('click', close);
      document.removeEventListener('contextmenu', close, true);
      window.removeEventListener('blur', close);
    };
  }, []);
  if (!menu) return null;
  return (
    <div onContextMenu={e => e.preventDefault()} style={{
      position: 'fixed', left: menu.x, top: menu.y, width: 230, zIndex: 120,
      background: 'var(--surface)', borderRadius: 11, boxShadow: 'var(--shadow-pop)',
      padding: 5, animation: 'sogi-pop .12s ease',
    }}>
      {menu.items.map((it, i) => it === '-' ? (
        <div key={i} style={{ height: 1, background: 'var(--border)', margin: '4px 6px' }}></div>
      ) : (
        <button key={i} onClick={() => { setMenu(null); it.onClick && it.onClick(); }} style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
          padding: '8px 11px', borderRadius: 7, fontSize: 12.5, fontWeight: 500,
          color: it.danger ? 'var(--danger)' : 'var(--text-2)',
        }}
          onMouseEnter={e => e.currentTarget.style.background = it.danger ? 'var(--danger-soft)' : 'var(--surface-2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          {it.icon && <Icon d={ICONS[it.icon]} size={14} />}
          {it.label}
          {it.hint && <span className="mono" style={{ marginLeft: 'auto', fontSize: 9.5, color: 'var(--text-3)' }}>{it.hint}</span>}
        </button>
      ))}
    </div>
  );
}

Object.assign(window, {
  Icon, ICONS, Avatar, AvatarStack, Badge, PriorityBadge, PRIORITY_TONE, TONE,
  Card, Topbar, Sidebar, AIPanel, PlaceholderScreen, PageHeader, PrimaryBtn, GhostBtn, NAV_ITEMS,
  NotifDropdown, ToastHost, NewTaskModal, CompanyDropdown, UserDropdown, CtxMenuHost,
});
