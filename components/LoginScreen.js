'use client';

import { useState } from 'react';

export default function LoginScreen({ onLoginSuccess }) {
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const ACCESS_PASSWORD = process.env.NEXT_PUBLIC_ACCESS_PASSWORD;

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ACCESS_PASSWORD) {
      onLoginSuccess();
      setLoginError('');
    } else {
      setLoginError("⛔ Contraseña incorrecta");
      setPasswordInput('');
    }
  };

  return (
    <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-dark)', animation: 'fadeIn 0.5s ease-out'}}>
      <div className="card" style={{width: '350px', textAlign: 'center', padding: '40px 30px'}}>
        <h1 style={{marginBottom: '10px', fontSize: '1.8rem'}}>QA VISEO <span style={{fontSize:'0.4em', color:'#3b82f6'}}>ACCESS</span></h1>
        <p style={{color: 'var(--text-muted)', marginBottom: '30px', fontSize: '0.9rem'}}>Panel restringido. Introduce clave.</p>
        <form onSubmit={handleLogin}>
          <div className="input-group" style={{position: 'relative', display: 'flex', alignItems: 'center'}} suppressHydrationWarning={true}>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="****" 
              value={passwordInput} 
              onChange={(e) => setPasswordInput(e.target.value)} 
              style={{textAlign: 'center', fontSize: '1.5rem', letterSpacing: showPassword ? '2px' : '8px', height: '50px', paddingRight: '45px', width: '100%'}} 
              autoFocus 
              suppressHydrationWarning={true}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: '5px', color: '#a1a1aa', display: 'flex', alignItems: 'center'}}>
              {showPassword ? ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> )}
            </button>
          </div>
          {loginError && <div style={{color: 'var(--danger)', marginBottom: '15px', fontWeight:'bold', fontSize: '0.9rem'}}>{loginError}</div>}
          <button type="submit" className="btn-primary" style={{width: '100%', justifyContent: 'center'}}>DESBLOQUEAR 🔓</button>
        </form>
      </div>
    </div>
  );
}
