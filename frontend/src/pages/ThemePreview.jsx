import { useState } from 'react';
import ReactorBackdrop from '../components/ReactorBackdrop';

// Development-only design preview. No API calls, sessions or real records.
export default function ThemePreview() {
  const [admin, setAdmin] = useState(false);
  const [dark, setDark] = useState(false);
  return <div className={dark ? 'dark-mode' : ''}>
    <main className="reactor-dashboard" style={{ minHeight:'100vh', paddingBottom:60, color:dark ? '#d4e0e6' : '#163646' }}>
      <nav className="main-navbar"><h2>SmartLoan <small>{admin ? 'Operations' : ''}</small></h2><div className="nav-links">
        <button onClick={() => setAdmin(value => !value)}>{admin ? 'Preview applicant' : 'Preview admin'}</button>
        <button onClick={() => setDark(value => !value)}>{dark ? 'Light theme' : 'Dark theme'}</button>
      </div></nav>
      <ReactorBackdrop />
      <section style={{ maxWidth:1100, margin:'32px auto', padding:'0 24px' }}>
        <p style={{ fontSize:12, letterSpacing:2 }}>DESIGN PREVIEW · FICTIONAL DATA ONLY</p>
        <h1>{admin ? 'Lending operations' : 'Welcome back, Demo Applicant'}</h1>
        <p>{admin ? 'Review applications and keep final decisions in human hands.' : 'Manage your applications, documents and repayment planning.'}</p>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:20,margin:'30px 0' }}>
          {['Applications','Approved','Pending','Rejected'].map((label,index) => <article key={label} style={{ background:dark ? '#203744' : '#fff',padding:24,border:'1px solid #8aa9b444',borderTop:'3px solid #bda46b',borderRadius:6 }}><p>{label}</p><h2>{[6,3,2,1][index]}</h2></article>)}
        </div>
        <article style={{ background:dark ? '#203744' : '#fff',padding:28,border:'1px solid #8aa9b444',borderRadius:6 }}>
          <h2>{admin ? 'Application queue' : 'Recent applications'}</h2>
          <p>Sample education loan · ₹4,50,000</p><p>Status: Pending review</p>
          <p>Existing application information and actions stay on readable, opaque cards.</p>
        </article>
      </section>
    </main>
  </div>;
}
