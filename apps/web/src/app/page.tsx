import React from 'react';

export default function AtlasLandingPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#fafafa', fontFamily: 'var(--font-sans)' }}>
      {/* HEADER */}
      <header style={{ background: '#121212', borderBottom: '1px solid #27272a', padding: '0.85rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>ATLAS ENGINEERING OS</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#d4af6a', background: 'rgba(212, 175, 106, 0.08)', border: '1px solid rgba(212, 175, 106, 0.25)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>TWN CLI v0.1.0</span>
        </div>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <a href="/dashboard" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>Dashboard Executivo</a>
          <a href="/device" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>Autenticação CLI</a>
        </nav>
      </header>

      {/* HERO SECTION */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.75rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1rem' }}>
          System Governance & Architecture Control Surface
        </h1>
        <p style={{ color: '#a1a1aa', fontSize: '1.05rem', maxWidth: '720px', marginBottom: '2rem' }}>
          Governança de código agent-native, validação constitucional de regras e auditoria contínua de desvio arquitetural.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
          <a href="/dashboard" style={{ background: '#10b981', color: '#09090b', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
            Acessar Dashboard Executivo
          </a>
          <a href="/device" style={{ background: 'transparent', color: '#fafafa', border: '1px solid #27272a', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>
            Autenticar Terminal (twn login)
          </a>
        </div>

        {/* TERMINAL WIDGET */}
        <div style={{ background: '#121212', border: '1px solid #27272a', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ background: '#18181b', padding: '0.6rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#71717a', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between' }}>
            <span>twn cli execution log</span>
            <span>environment: local / Linux x86_64</span>
          </div>
          <div style={{ padding: '1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: '#fafafa', background: '#0d0d0f', lineHeight: 1.7 }}>
            <div><span style={{ color: '#d4af6a' }}>❯</span> twn init meu-sistema-demo --domain fintech --agent cursor</div>
            <div style={{ color: '#10b981' }}>Initialised Atlas workspace "meu-sistema-demo"</div>
            <div>  + Created .atlas/blueprint.yaml</div>
            <div>  + Created .atlas/constitution.md</div>
            <div>  + Installed Cursor skill adapter (.cursor/rules/atlas.mdc)</div>
            <br />
            <div><span style={{ color: '#d4af6a' }}>❯</span> twn audit</div>
            <div style={{ color: '#10b981' }}>Engineering Score: 100 / 100 [STATUS: PASSED]</div>
            <div>Audit completed. Zero architectural drift and zero policy violations detected.</div>
          </div>
        </div>
      </main>
    </div>
  );
}
