// SOGI — Tela de login (e-mail/senha, SSO, 2FA)
const { useState: useStateLG } = React;

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useStateLG('rafael@its.com.br');
  const isClient = !!email.trim() && !email.trim().toLowerCase().endsWith('@its.com.br');
  const profileOf = () => isClient ? 'client' : 'internal';
  const [pass, setPass] = useStateLG('');
  const [step, setStep] = useStateLG('login'); // login | 2fa
  const [code, setCode] = useStateLG('');
  const [busy, setBusy] = useStateLG(false);

  const enter = () => {
    if (!email.trim() || !pass.trim()) { window.SOGI_TOAST('Informe e-mail e senha', 'warn'); return; }
    setBusy(true);
    setTimeout(() => { setBusy(false); setStep('2fa'); window.SOGI_TOAST('Código 2FA enviado por push e WhatsApp', 'info'); }, 700);
  };
  const confirm2fa = () => {
    if (code.trim().length < 6) { window.SOGI_TOAST('Digite o código de 6 dígitos', 'warn'); return; }
    window.SOGI_TOAST(isClient ? 'Bem-vindo ao Portal do Cliente! 👋' : 'Bem-vindo de volta, Rafael! 👋');
    onLogin(profileOf());
  };
  const inputStyle = {
    width: '100%', border: '1.5px solid var(--border)', borderRadius: 8, padding: '11px 13px',
    fontSize: 13.5, outline: 'none', fontFamily: 'var(--font-ui)', background: 'var(--surface)', color: 'var(--text)', boxSizing: 'border-box',
  };

  return (
    <div data-screen-label="Login" style={{ position: 'fixed', inset: 0, display: 'flex', background: 'var(--bg)', zIndex: 90 }}>
      {/* Painel da marca */}
      <div className="login-brand-panel" style={{
        width: '44%', minWidth: 360, background: 'linear-gradient(160deg, #183c5a, #0e2740)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 7%', color: '#fff',
      }}>
        <img src="assets/its-logo-light.png" alt="ITS Customer Service" style={{ width: 200, height: 'auto', marginBottom: 28 }} />
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.01em' }}>
          Toda a operação da ITS<br />em um único lugar.
        </h1>
        <p style={{ margin: '14px 0 0', fontSize: 13.5, lineHeight: 1.7, color: '#9fb3c8', maxWidth: 380 }}>
          Projetos, tarefas, chamados, comunicação e inteligência artificial — o SOGI é o sistema operacional de gestão interna da empresa.
        </p>
        <div style={{ display: 'flex', gap: 16, marginTop: 30 }}>
          {[['11', 'serviços ativos'], ['99,98%', 'uptime'], ['1.247', 'colaboradores']].map(([v, l]) => (
            <div key={l}>
              <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: '#E85928' }}>{v}</div>
              <div style={{ fontSize: 10.5, color: '#9fb3c8', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Formulário */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: 380, maxWidth: '94vw', background: 'var(--surface)', borderRadius: 16, boxShadow: 'var(--shadow-pop)', padding: '34px 32px', animation: 'sogi-pop .25s ease' }}>
          {step === 'login' ? (
            <>
              <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700 }}>Bem-vindo de volta</h2>
              <p style={{ margin: '0 0 22px', fontSize: 12.5, color: 'var(--text-3)' }}>Entre com suas credenciais corporativas</p>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 5 }}>E-mail</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="voce@its.com.br" style={{ ...inputStyle, marginBottom: 6 }}
                onFocus={e => e.target.style.borderColor = '#183c5a'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              {/* perfil detectado pelo e-mail */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: isClient ? 'var(--warn)' : 'var(--ok)', flexShrink: 0 }}></span>
                <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>
                  {isClient ? 'perfil: cliente — você entrará no Portal do Cliente' : 'perfil: colaborador ITS — você entrará no SOGI'}
                </span>
              </div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 5 }}>Senha</label>
              <input value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && enter()} type="password" placeholder="••••••••" style={{ ...inputStyle, marginBottom: 8 }}
                onFocus={e => e.target.style.borderColor = '#183c5a'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
                <button onClick={() => window.SOGI_TOAST('Link de redefinição enviado para ' + email, 'info')} style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--accent-text)' }}>Esqueci minha senha</button>
              </div>
              <button onClick={enter} disabled={busy} style={{
                width: '100%', background: 'var(--accent)', color: '#fff', borderRadius: 9, padding: '12px 0',
                fontWeight: 700, fontSize: 13.5, opacity: busy ? 0.7 : 1, transition: 'opacity .15s',
              }}>{busy ? 'Verificando…' : 'Entrar'}</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
                <span style={{ flex: 1, height: 1, background: 'var(--border)' }}></span>
                <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>ou</span>
                <span style={{ flex: 1, height: 1, background: 'var(--border)' }}></span>
              </div>
              <button onClick={() => { window.SOGI_TOAST('Autenticando via Google Workspace (SSO)…', 'info'); setTimeout(() => onLogin('internal'), 900); }} style={{
                width: '100%', border: '1.5px solid var(--border)', borderRadius: 9, padding: '11px 0',
                fontWeight: 600, fontSize: 13, color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
              }}>
                <span style={{ fontWeight: 800, fontSize: 14, background: 'linear-gradient(90deg,#4285F4,#EA4335,#FBBC05,#34A853)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>G</span>
                Entrar com Google Workspace (SSO)
              </button>
              <p className="mono" style={{ margin: '18px 0 0', fontSize: 9, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.6 }}>
                acesso monitorado · 2FA obrigatório para administradores
              </p>
              <button onClick={() => { setEmail('paulo@valeaco.ind.br'); window.SOGI_TOAST('Perfil de cliente detectado — entre com sua senha para acessar o Portal', 'info'); }} style={{
                marginTop: 14, width: '100%', border: '1.5px dashed var(--border-strong)', borderRadius: 9,
                padding: '10px 0', fontWeight: 600, fontSize: 12.5, color: 'var(--text-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent-text)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-2)'; }}>
                <Icon d={ICONS.building} size={14} /> Sou cliente — usar meu e-mail de cliente
              </button>
            </>
          ) : (
            <>
              <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700 }}>Verificação em 2 fatores</h2>
              <p style={{ margin: '0 0 20px', fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.5 }}>
                Enviamos um código de 6 dígitos por push e WhatsApp para <strong style={{ color: 'var(--text-2)' }}>{isClient ? '+55 47 •••••-8821' : '+55 47 •••••-4567'}</strong>
              </p>
              <input autoFocus value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={e => e.key === 'Enter' && confirm2fa()} placeholder="––––––"
                className="mono" style={{ ...inputStyle, textAlign: 'center', fontSize: 22, letterSpacing: '0.4em', marginBottom: 16 }} />
              <button onClick={confirm2fa} style={{
                width: '100%', background: 'var(--accent)', color: '#fff', borderRadius: 9, padding: '12px 0', fontWeight: 700, fontSize: 13.5,
              }}>Confirmar e entrar</button>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
                <button onClick={() => setStep('login')} style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)' }}>← Voltar</button>
                <button onClick={() => window.SOGI_TOAST('Novo código enviado', 'info')} style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--accent-text)' }}>Reenviar código</button>
              </div>
              <p className="mono" style={{ margin: '16px 0 0', fontSize: 9, color: 'var(--text-3)', textAlign: 'center' }}>dica do protótipo: qualquer código de 6 dígitos funciona</p>
            </>
          )}
        </div>
      </div>
      <style>{`@media (max-width: 860px) { .login-brand-panel { display: none !important; } }`}</style>
    </div>
  );
}

Object.assign(window, { LoginScreen });
