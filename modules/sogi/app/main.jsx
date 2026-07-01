// SOGI — App shell + Tweaks (marca ITS)
const { useState: useStateA, useEffect: useEffectA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentName": "Laranja ITS",
  "density": "regular",
  "sidebarLight": false,
  "darkTheme": false
}/*EDITMODE-END*/;

const ITS_ACCENTS = {
  'Laranja ITS': { accent: '#E85928', strong: '#c64516', soft: '#fff3ee', text: '#c64516' },
  'Azul ITS':    { accent: '#0284c7', strong: '#026da6', soft: '#f0f9ff', text: '#026da6' },
  'Verde':       { accent: '#16a34a', strong: '#15803d', soft: '#f0fdf4', text: '#15803d' },
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [logged, setLogged] = useStateA(false);
  const [portal, setPortal] = useStateA(false);
  const [screen, setScreen] = useStateA('dashboard');
  const [projectId, setProjectId] = useStateA(null);
  const [aiOpen, setAiOpen] = useStateA(false);
  const [taskOpen, setTaskOpen] = useStateA(false);
  const [newTaskOpen, setNewTaskOpen] = useStateA(false);
  const [mobileOpen, setMobileOpen] = useStateA(false);
  const [collapsed, setCollapsed] = useStateA(false);
  const [, forceRender] = useStateA(0);

  // Aplicar tweaks como variáveis CSS
  useEffectA(() => {
    const a = ITS_ACCENTS[t.accentName] || ITS_ACCENTS['Laranja ITS'];
    const r = document.documentElement.style;
    r.setProperty('--accent', a.accent);
    r.setProperty('--accent-strong', a.strong);
    r.setProperty('--accent-soft', a.soft);
    r.setProperty('--accent-text', a.text);
    r.setProperty('--nav-active', a.accent);
    document.documentElement.setAttribute('data-density', t.density);
    document.documentElement.setAttribute('data-theme', t.darkTheme ? 'dark' : 'light');
    if (t.sidebarLight) {
      r.setProperty('--nav-bg', '#ffffff');
      r.setProperty('--nav-text', '#475569');
      r.setProperty('--nav-text-active', '#ffffff');
      document.documentElement.setAttribute('data-sidebar', 'light');
    } else {
      r.removeProperty('--nav-bg');
      r.removeProperty('--nav-text');
      r.removeProperty('--nav-text-active');
      document.documentElement.setAttribute('data-sidebar', 'dark');
    }
  }, [t.accentName, t.density, t.sidebarLight, t.darkTheme]);

  const openProject = (id) => { setProjectId(id); setScreen('projeto'); };
  const openNewTask = () => setNewTaskOpen(true);
  const createTask = (task) => {
    SOGI_DATA.myTasks.unshift(task);
    forceRender(x => x + 1);
  };

  // Eventos globais: nova tarefa + alternar tema
  useEffectA(() => {
    window.SOGI_NEW_TASK = openNewTask;
    window.SOGI_OPEN_TASK = () => setTaskOpen(true);
    window.SOGI_OPEN_MOBILE = () => setMobileOpen(true);
    window.SOGI_LOGOUT = () => { setLogged(false); window.SOGI_TOAST('Sessão encerrada com segurança', 'warn'); };
    window.SOGI_TOGGLE_THEME = () => {
      setTweak('darkTheme', document.documentElement.getAttribute('data-theme') !== 'dark');
    };
    return () => { window.SOGI_NEW_TASK = () => {}; window.SOGI_OPEN_TASK = () => {}; window.SOGI_TOGGLE_THEME = () => {}; };
  }, []);

  if (!logged) {
    if (portal) {
      return (
        <>
          <PortalScreen onExit={() => { setPortal(false); window.SOGI_TOAST('Você saiu do Portal do Cliente', 'info'); }} />
          <ToastHost />
        </>
      );
    }
    return (
      <>
        <LoginScreen onLogin={(profile) => { if (profile === 'client') setPortal(true); else setLogged(true); }} />
        <ToastHost />
      </>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar screen={screen} onNavigate={s => setScreen(s)} collapsed={collapsed} onToggleCollapse={() => setCollapsed(c => !c)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar onToggleAI={() => setAiOpen(o => !o)} aiOpen={aiOpen} onNavigate={s => setScreen(s)} />
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
            {screen === 'dashboard' && <DashboardScreen onNavigate={setScreen} onOpenProject={openProject} />}
            {screen === 'projetos' && <ProjectsScreen onOpenProject={openProject} />}
            {screen === 'projeto' && <ProjectWorkspace projectId={projectId} onBack={() => setScreen('projetos')} onOpenTask={() => setTaskOpen(true)} />}
            {screen === 'tarefas' && <MyTasksScreen onOpenTask={() => setTaskOpen(true)} />}
            {screen === 'chamados' && <TicketsScreen />}
            {screen === 'comunicacao' && <ChatScreen onNavigate={s => setScreen(s)} />}
            {screen === 'feed' && <FeedScreen onNavigate={s => setScreen(s)} />}
            {screen === 'calendario' && <CalendarScreen onOpenTask={() => setTaskOpen(true)} />}
            {screen === 'documentos' && <DocumentsScreen />}
            {screen === 'relatorios' && <ReportsScreen />}
            {screen === 'ia' && <AIScreen />}
            {screen === 'gamificacao' && <GamificationScreen />}
            {screen === 'configuracoes' && <SettingsScreen />}
          </main>
          {aiOpen && <AIPanel onClose={() => setAiOpen(false)} />}
        </div>
      </div>

      {taskOpen && <TaskDrawer onClose={() => setTaskOpen(false)} />}
      {newTaskOpen && <NewTaskModal onClose={() => setNewTaskOpen(false)} onCreate={createTask} />}
      {mobileOpen && <MobileOverlay onClose={() => setMobileOpen(false)} />}
      <ToastHost />
      <CtxMenuHost />

      <TweaksPanel>
        <TweakSection label="Marca" />
        <TweakColor label="Cor de ação" value={(ITS_ACCENTS[t.accentName] || ITS_ACCENTS['Laranja ITS']).accent}
          options={Object.values(ITS_ACCENTS).map(a => a.accent)}
          onChange={(v) => {
            const found = Object.entries(ITS_ACCENTS).find(([, a]) => a.accent === v);
            if (found) setTweak('accentName', found[0]);
          }} />
        <TweakToggle label="Sidebar clara" value={t.sidebarLight} onChange={v => setTweak('sidebarLight', v)} />
        <TweakToggle label="Tema escuro" value={t.darkTheme} onChange={v => setTweak('darkTheme', v)} />
        <TweakSection label="Layout" />
        <TweakRadio label="Densidade" value={t.density} options={['regular', 'compact']}
          onChange={v => setTweak('density', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
