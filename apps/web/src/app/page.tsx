'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';

// TYPES
interface LogItem {
  time: string;
  tag: 'SYS' | 'MAESTRO' | 'AUDIT' | 'EVOLUTION' | 'SUPABASE';
  text: string;
  type: 'info' | 'warn' | 'success' | 'err';
}

interface BlueprintNode {
  id: string;
  label: string;
  type: 'core' | 'api' | 'db' | 'auth';
  contracts: string[];
  status: 'compliant' | 'drift';
}

export default function Page() {
  // CORE STATE
  const [isDark, setIsDark] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<'monitor' | 'blueprint' | 'audit' | 'radar'>('monitor');
  const [projectName, setProjectName] = useState('atlas-monorepo');
  const [projectStack, setProjectStack] = useState('nextjs-fastify');
  const [projectDesc, setProjectDesc] = useState('AI-Powered software development OS');
  
  // ONBOARDING FLOW STATES
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [isBooting, setIsBooting] = useState(false);

  // DASHBOARD DYNAMIC STATES
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [selectedNode, setSelectedNode] = useState<string>('core');
  const [score, setScore] = useState(840);
  const [driftStatus, setDriftStatus] = useState<'clean' | 'drift'>('drift');
  const [driftedFile, setDriftedFile] = useState('packages/core/src/db/raw-query.ts');
  const [activeTasks, setActiveTasks] = useState([
    { id: 'T-101', name: 'AST Code Audit', status: 'RUNNING', progress: 68 },
    { id: 'T-102', name: 'Maestro Agent Sync', status: 'WAITING', progress: 0 },
    { id: 'T-103', name: 'Supabase Sync', status: 'COMPLETED', progress: 100 }
  ]);
  
  const [evolutionRfc, setEvolutionRfc] = useState({
    id: 'RFC-015',
    title: 'Migrate DB Access layers to Prisma-Next Integration',
    status: 'PENDING_APPROVAL',
    impactScore: '+120 Engineering Score',
    risk: 'LOW (Tested in Sandbox)'
  });

  const logEndRef = useRef<HTMLDivElement>(null);

  // THEME MANAGEMENT
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('theme-light');
    } else {
      root.classList.add('theme-light');
    }
  }, [isDark]);

  // AUTO-SCROLL LOGS
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, bootLogs]);

  // INITIAL LOAD & CHECK DATABASE CONNECTION
  useEffect(() => {
    // Add default initial logs
    const addLog = (tag: 'SYS' | 'MAESTRO' | 'AUDIT' | 'EVOLUTION' | 'SUPABASE', text: string, type: 'info' | 'warn' | 'success' | 'err') => {
      const now = new Date().toLocaleTimeString();
      setLogs((prev) => [...prev, { time: now, tag, text, type }]);
    };

    addLog('SYS', 'Atlas Cognitive Engine v1.0.0 initialized.', 'info');
    addLog('SUPABASE', 'Verifying connectivity with Supabase cluster...', 'info');

    // Attempt local config read or mock Supabase write to test connection
    supabase
      .from('atlas_projects')
      .select('*')
      .limit(1)
      .then(({ data, error }) => {
        if (error) {
          addLog('SUPABASE', `Connection error: ${error.message} (Using Local Fallback)`, 'warn');
        } else {
          addLog('SUPABASE', `Successfully connected. Active projects found: ${data?.length || 0}`, 'success');
          if (data && data.length > 0) {
            const first = data[0];
            setProjectName(first.name || 'atlas-monorepo');
            setProjectStack(first.stack || 'nextjs-fastify');
            setProjectDesc(first.description || 'AI-Powered software development OS');
            setHasInitialized(true);
          }
        }
      });
  }, []);

  // SYSTEM AGENT LOG SIMULATION
  useEffect(() => {
    if (!hasInitialized) return;

    const interval = setInterval(() => {
      const logTemplates: Omit<LogItem, 'time'>[] = [
        { tag: 'MAESTRO', text: 'Agent [DevBackend] writing: packages/core/src/di/container.ts', type: 'info' },
        { tag: 'AUDIT', text: 'AST scan of packages/core/src/di/container.ts completed. [100% AES Compliant]', type: 'success' },
        { tag: 'MAESTRO', text: 'Agent [SecAuditor] running security audit on network ingress...', type: 'info' },
        { tag: 'AUDIT', text: 'Warning: Unsanctioned database file found at ' + driftedFile, type: 'warn' },
        { tag: 'EVOLUTION', text: 'AI discovered upgraded dependency next@15.0.0. Testing compatibility...', type: 'info' },
      ];

      const chosen: Omit<LogItem, 'time'> = logTemplates[Math.floor(Math.random() * logTemplates.length)] || { tag: 'MAESTRO', text: 'Cognitive loop tick', type: 'info' };
      const now = new Date().toLocaleTimeString();
      setLogs((prev) => [...prev, { time: now, ...chosen }]);

      // Randomize progress values
      setActiveTasks((prevTasks) => 
        prevTasks.map((t) => {
          if (t.status === 'RUNNING') {
            const nextProgress = t.progress + Math.floor(Math.random() * 15);
            return {
              ...t,
              progress: nextProgress >= 100 ? 100 : nextProgress,
              status: nextProgress >= 100 ? 'COMPLETED' : 'RUNNING'
            };
          } else if (t.status === 'COMPLETED' && Math.random() > 0.7) {
            // Respawn task
            return { ...t, status: 'RUNNING', progress: 0 };
          }
          return t;
        })
      );
    }, 4500);

    return () => clearInterval(interval);
  }, [hasInitialized, driftedFile]);

  // RUN ONBOARDING SETUP
  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooting(true);
    
    const logsSteps = [
      'Scanning Workspace Directory structures...',
      'Verifying NX Monorepo architecture config...',
      'Generating blueprint contract files...',
      'Connecting to Supabase metadata registry...',
      'Publishing initial project blueprint schema...',
      'Starting continuous cognitive compiler audit daemon...',
      'Workspace Online. Ready for operation.'
    ];

    for (let i = 0; i < logsSteps.length; i++) {
      setBootLogs((prev) => [...prev, `[INIT] ${logsSteps[i]}`]);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    try {
      // Persist to Supabase
      const { error } = await supabase.from('atlas_projects').insert({
        name: projectName,
        stack: projectStack,
        description: projectDesc,
        created_at: new Date().toISOString()
      });
      
      if (error) {
        setBootLogs((prev) => [...prev, `[WARN] Supabase write failed: ${error.message}. Local profile created.`]);
      } else {
        setBootLogs((prev) => [...prev, `[SUCCESS] Profile synced to Supabase database.`]);
      }
    } catch (err) {
      setBootLogs((prev) => [...prev, `[WARN] Connection skipped. Local profile created.`]);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsBooting(false);
    setHasInitialized(true);
  };

  // DRIFT RESOLUTION SIMULATION
  const handleResolveDrift = () => {
    const now = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { 
      time: now, 
      tag: 'MAESTRO', 
      text: 'Resolving file drift: Refactoring ' + driftedFile + ' into sanctioned modular patterns...', 
      type: 'info' 
    }]);

    setTimeout(() => {
      const now2 = new Date().toLocaleTimeString();
      setLogs((prev) => [
        ...prev,
        { time: now2, tag: 'AUDIT', text: 'Drift resolved. Physical AST matches Blueprint contracts exactly.', type: 'success' }
      ]);
      setScore(1000);
      setDriftStatus('clean');
      setDriftedFile('');
    }, 2500);
  };

  // EVOLUTION MIGRATION SIMULATION
  const handleRunMigration = () => {
    const now = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { 
      time: now, 
      tag: 'EVOLUTION', 
      text: 'Simulating RFC-015 database access layer refactor in dry-run container...', 
      type: 'info' 
    }]);

    setTimeout(() => {
      const now2 = new Date().toLocaleTimeString();
      setLogs((prev) => [
        ...prev,
        { time: now2, tag: 'EVOLUTION', text: 'Simulation success. Generating ADR patch-files.', type: 'success' },
        { time: now2, tag: 'SYS', text: 'Next.js routes and Prisma model schemas updated.', type: 'success' }
      ]);
      setEvolutionRfc((prev) => ({ ...prev, status: 'EXECUTED' }));
      setScore((s) => Math.min(s + 120, 1000));
    }, 3000);
  };

  // BLUEPRINT GRAPH NODES DATA
  const blueprintNodes: BlueprintNode[] = [
    { id: 'core', label: '@atlas/core', type: 'core', contracts: ['ILogger', 'ITelemetry', 'IEventBus'], status: 'compliant' },
    { id: 'gateway', label: 'api-gateway', type: 'api', contracts: ['/api/v1/auth', '/api/v1/projects'], status: 'compliant' },
    { id: 'auth', label: 'auth-service', type: 'auth', contracts: ['validateSession', 'verifyToken'], status: 'compliant' },
    { id: 'db', label: 'postgres-db', type: 'db', contracts: ['atlas_projects_schema', 'audit_logs_schema'], status: driftStatus === 'drift' ? 'drift' : 'compliant' }
  ];

  return (
    <div className="crt-flicker" style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div className="blueprint-grid" />
      <div className="crt-overlay" />

      {/* ONBOARDING INITIAL STATE */}
      {!hasInitialized ? (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '20px'
        }}>
          <div className="console-panel" style={{ width: '100%', maxWidth: '640px', height: 'auto', minHeight: '420px' }}>
            <div className="panel-header">
              <span className="panel-title">
                <span>[ STATUS: DISCONNECTED ]</span>
              </span>
              <span>SYSTEM BOOTSTRAP WIZARD</span>
            </div>
            <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 6px 0', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  // INITIALIZE ATLAS COGNITIVE OPERATING SYSTEM
                </h1>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                  Declare as diretrizes e regras arquiteturais do seu projeto para gerar o Blueprint de governança.
                </p>
              </div>

              {!isBooting ? (
                <form onSubmit={handleOnboarding} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>PROJECT_NAME</label>
                      <input 
                        type="text" 
                        className="tactical-input" 
                        value={projectName} 
                        onChange={(e) => setProjectName(e.target.value)} 
                        required 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>CORE_STACK</label>
                      <select 
                        className="tactical-input" 
                        value={projectStack} 
                        onChange={(e) => setProjectStack(e.target.value)}
                        style={{ height: '38px', borderRadius: '0px' }}
                      >
                        <option value="nextjs-fastify">Next.js 15 & Fastify Backend</option>
                        <option value="rust-actix">Rust (Actix-Web) Backend</option>
                        <option value="go-fiber">Go (Fiber) Microservices</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>PROJECT_DESCRIPTION</label>
                    <input 
                      type="text" 
                      className="tactical-input" 
                      value={projectDesc} 
                      onChange={(e) => setProjectDesc(e.target.value)} 
                      required 
                    />
                  </div>

                  <div style={{ background: 'var(--bg-primary)', padding: '12px', border: '1px solid var(--border-color)', fontSize: '11px' }}>
                    <span style={{ color: 'var(--accent-orange)', fontWeight: 'bold' }}>[ CONSTITUTION RULE ACTIVE ]</span>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)' }}>
                      Strict Invariant Check: O Atlas impedirá que código seja commitado ou integrado se violar os limites definidos no Blueprint de arquitetura.
                    </p>
                  </div>

                  <button type="submit" className="tactical-btn primary" style={{ width: '100%', padding: '12px' }}>
                    BUILD SYSTEM BLUEPRINT & INITIALIZE
                  </button>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      border: '2px solid var(--accent-blue)',
                      borderTopColor: 'transparent',
                      animation: 'sweep 1s linear infinite',
                      borderRadius: '50% !important'
                    }} />
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>COMPILING SYSTEM CONFIGURATIONS...</span>
                  </div>
                  <div style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    padding: '12px',
                    height: '180px',
                    overflowY: 'auto',
                    fontFamily: 'monospace'
                  }}>
                    {bootLogs.map((l, index) => (
                      <div key={index} style={{ fontSize: '11px', marginBottom: '4px' }}>{l}</div>
                    ))}
                    <div ref={logEndRef} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* MAIN DASHBOARD INTERFACE */
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', zIndex: 10, position: 'relative' }}>
          
          {/* HEADER */}
          <header className="tactical-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '14px', height: '14px', backgroundColor: driftStatus === 'drift' ? 'var(--accent-orange)' : 'var(--accent-green)' }} />
              <span style={{ fontWeight: 'bold', fontSize: '15px', letterSpacing: '1px' }}>
                // ATLAS : <span style={{ color: driftStatus === 'drift' ? 'var(--accent-orange)' : 'var(--accent-green)' }}>{driftStatus === 'drift' ? 'DRIFT_DETECTED' : 'INTEGRITY_COMPLIANT'}</span>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ fontSize: '11px', display: 'flex', gap: '12px', color: 'var(--text-muted)' }}>
                <span>PROJECT: <strong>{projectName.toUpperCase()}</strong></span>
                <span>STACK: <strong>{projectStack.toUpperCase()}</strong></span>
              </div>

              {/* ENGINEERING SCORE */}
              <div className={`tactical-status ${score === 1000 ? 'status-ok' : 'status-warn'}`} style={{ padding: '4px 10px' }}>
                SCORE: {score}/1000
              </div>

              {/* CONTROLS */}
              <button className="tactical-btn" onClick={() => setIsDark(!isDark)} style={{ padding: '4px 8px' }}>
                {isDark ? 'LIGHT_MODE' : 'DARK_MODE'}
              </button>
              
              <button className="tactical-btn" onClick={() => setHasInitialized(false)} style={{ padding: '4px 8px', borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}>
                RESET_WORKSPACE
              </button>
            </div>
          </header>

          {/* MAIN BODY AREA */}
          <main style={{ flex: 1, display: 'grid', gridTemplateColumns: '240px 1fr', overflow: 'hidden' }}>
            
            {/* SIDE PANEL NAVIGATION */}
            <aside style={{ borderRight: '2px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '12px' }}>
                [ 00. CONTROLLERS ]
              </div>
              
              <button 
                className={`tactical-btn ${activeTab === 'monitor' ? 'primary' : ''}`} 
                onClick={() => setActiveTab('monitor')}
                style={{ justifyContent: 'flex-start', width: '100%' }}
              >
                [ 01. RUNTIME MONITOR ]
              </button>

              <button 
                className={`tactical-btn ${activeTab === 'blueprint' ? 'primary' : ''}`} 
                onClick={() => setActiveTab('blueprint')}
                style={{ justifyContent: 'flex-start', width: '100%' }}
              >
                [ 02. BLUEPRINT TOPO ]
              </button>

              <button 
                className={`tactical-btn ${activeTab === 'audit' ? 'primary' : ''}`} 
                onClick={() => setActiveTab('audit')}
                style={{ justifyContent: 'flex-start', width: '100%' }}
              >
                [ 03. DRIFT AUDITOR ]
              </button>

              <button 
                className={`tactical-btn ${activeTab === 'radar' ? 'primary' : ''}`} 
                onClick={() => setActiveTab('radar')}
                style={{ justifyContent: 'flex-start', width: '100%' }}
              >
                [ 04. EVOLUTION RADAR ]
              </button>

              <div style={{ marginTop: 'auto', border: '1px solid var(--border-color)', padding: '12px', background: 'var(--bg-primary)' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', fontWeight: 'bold' }}>SYSTEM HEALTH</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', display: 'block', margin: '4px 0' }}>99.8% ONLINE</span>
                <div style={{ height: '4px', background: 'var(--border-color)', width: '100%' }}>
                  <div style={{ height: '100%', background: 'var(--accent-green)', width: '99.8%' }} />
                </div>
              </div>
            </aside>

            {/* SCREEN VIEWPORT */}
            <section style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              
              {/* TAB 01: RUNTIME MONITOR */}
              {activeTab === 'monitor' && (
                <div style={{ display: 'grid', gridTemplateRows: '1fr 220px', height: '100%' }}>
                  
                  {/* TOP ROW: WORKSPACE & TASK QUEUE */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', borderBottom: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    
                    {/* WORKSPACE PROFILE */}
                    <div className="console-panel" style={{ border: 0 }}>
                      <div className="panel-header">WORKSPACE OVERVIEW</div>
                      <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div style={{ border: '1px solid var(--border-color)', padding: '16px', background: 'var(--bg-tertiary)' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PROJECT METADATA</span>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '6px 0 0 0' }}>{projectName}</h2>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>{projectDesc}</p>
                          </div>

                          <div style={{ border: '1px solid var(--border-color)', padding: '16px', background: 'var(--bg-tertiary)' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ACTIVE AGENTS</span>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '6px 0 0 0', color: 'var(--accent-blue)' }}>3 AGENTS ONLINE</h2>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Maestro orchestrator running loops.</p>
                          </div>
                        </div>

                        {/* COGNITIVE FLOW STEPS */}
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>OODA-V ENGINE LOOP STATUS</span>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                            {['OBSERVE', 'ORIENT', 'DECIDE', 'ACT', 'VALIDATE'].map((step, idx) => (
                              <div key={idx} style={{
                                border: '1px solid var(--border-color)',
                                padding: '10px',
                                textAlign: 'center',
                                background: idx === 4 ? 'rgba(57, 255, 20, 0.05)' : 'var(--bg-tertiary)',
                                borderColor: idx === 4 ? 'var(--accent-green)' : 'var(--border-color)'
                              }}>
                                <span style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', color: idx === 4 ? 'var(--accent-green)' : 'var(--text-primary)' }}>{step}</span>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{idx === 4 ? '[ ACTIVE ]' : '[ STANDBY ]'}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* ACTIVE TASK QUEUE */}
                    <div className="console-panel" style={{ borderTop: 0, borderRight: 0, borderBottom: 0 }}>
                      <div className="panel-header">ACTIVE TASKS QUEUE</div>
                      <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {activeTasks.map((t) => (
                          <div key={t.id} style={{ border: '1px solid var(--border-color)', padding: '12px', background: 'var(--bg-primary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>
                              <span>{t.id} : {t.name}</span>
                              <span style={{ color: t.status === 'RUNNING' ? 'var(--accent-blue)' : t.status === 'COMPLETED' ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                                {t.status}
                              </span>
                            </div>
                            <div style={{ height: '6px', background: 'var(--border-color)', width: '100%' }}>
                              <div style={{ height: '100%', background: t.status === 'RUNNING' ? 'var(--accent-blue)' : 'var(--accent-green)', width: `${t.progress}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* BOTTOM ROW: ACTIVE AGENTS SYSTEM CONSOLE */}
                  <div className="console-panel" style={{ border: 0 }}>
                    <div className="panel-header">MAESTRO AGENTS CONSOLE LOG</div>
                    <div className="panel-content" style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', fontFamily: 'monospace' }}>
                      <div className="log-container">
                        {logs.slice(-15).map((l, idx) => (
                          <div key={idx} className="log-line">
                            <span className="log-time">[{l.time}]</span>
                            <span className="log-tag" style={{ color: l.type === 'err' ? 'var(--accent-red)' : l.type === 'warn' ? 'var(--accent-orange)' : l.type === 'success' ? 'var(--accent-green)' : 'var(--accent-blue)' }}>
                              [{l.tag}]
                            </span>
                            <span className="log-text" style={{ color: l.type === 'err' ? 'var(--accent-red)' : l.type === 'warn' ? 'var(--accent-orange)' : 'var(--text-primary)' }}>
                              {l.text}
                            </span>
                          </div>
                        ))}
                        <div ref={logEndRef} />
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 02: BLUEPRINT CONTRACTS */}
              {activeTab === 'blueprint' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', height: '100%' }}>
                  
                  {/* TOPOLOGY GRAPH */}
                  <div className="console-panel" style={{ border: 0 }}>
                    <div className="panel-header">BLUEPRINT SCHEMATIC TOPOLOGY</div>
                    <div className="panel-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      
                      {/* INLINE SVG TO RENDER ARCHITECTURE NODES */}
                      <svg width="480" height="340" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                        {/* Define arrows */}
                        <defs>
                          <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--border-color)" />
                          </marker>
                        </defs>

                        {/* Connections */}
                        <line x1="120" y1="160" x2="240" y2="160" stroke="var(--border-color)" strokeWidth="2" markerEnd="url(#arrow)" />
                        <line x1="240" y1="160" x2="360" y2="160" stroke="var(--border-color)" strokeWidth="2" markerEnd="url(#arrow)" />
                        <line x1="240" y1="160" x2="240" y2="260" stroke={driftStatus === 'drift' ? 'var(--accent-orange)' : 'var(--border-color)'} strokeWidth="2" markerEnd="url(#arrow)" strokeDasharray="4 4" />

                        {/* Nodes */}
                        {blueprintNodes.map((node) => {
                          let cx = 0;
                          let cy = 0;
                          if (node.id === 'core') { cx = 60; cy = 130; }
                          if (node.id === 'gateway') { cx = 180; cy = 130; }
                          if (node.id === 'auth') { cx = 300; cy = 130; }
                          if (node.id === 'db') { cx = 180; cy = 230; }

                          const isSelected = selectedNode === node.id;

                          return (
                            <g key={node.id} onClick={() => setSelectedNode(node.id)} style={{ cursor: 'pointer' }}>
                              <rect 
                                x={cx} 
                                y={cy} 
                                width="120" 
                                height="60" 
                                fill={isSelected ? 'var(--bg-tertiary)' : 'var(--bg-secondary)'} 
                                stroke={node.status === 'drift' ? 'var(--accent-orange)' : isSelected ? 'var(--accent-blue)' : 'var(--border-color)'} 
                                strokeWidth={isSelected ? '2' : '1'}
                              />
                              <text x={cx + 10} y={cy + 25} fill="var(--text-primary)" fontSize="11" fontWeight="bold" fontFamily="monospace">
                                {node.label}
                              </text>
                              <text x={cx + 10} y={cy + 45} fill={node.status === 'drift' ? 'var(--accent-orange)' : 'var(--text-muted)'} fontSize="9" fontFamily="monospace">
                                {node.status === 'drift' ? '[ DRIFT ]' : '[ COMPLIANT ]'}
                              </text>
                            </g>
                          );
                        })}
                      </svg>

                    </div>
                  </div>

                  {/* CONTRACT DETAILS VIEW */}
                  <div className="console-panel" style={{ borderTop: 0, borderRight: 0, borderBottom: 0 }}>
                    <div className="panel-header">CONTRACT INSPECTOR</div>
                    <div className="panel-content">
                      {selectedNode ? (
                        <div>
                          <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 10px 0', color: 'var(--accent-blue)' }}>
                            {blueprintNodes.find(n => n.id === selectedNode)?.label}
                          </h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>GUARANTEED SCHEMAS / INTERFACES:</span>
                            {blueprintNodes.find(n => n.id === selectedNode)?.contracts.map((c, i) => (
                              <div key={i} style={{ border: '1px solid var(--border-color)', padding: '8px', background: 'var(--bg-primary)', fontFamily: 'monospace', fontSize: '11px' }}>
                                interface {c}
                              </div>
                            ))}
                            <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Blueprints Rules:</span>
                              <pre style={{ background: 'var(--bg-primary)', padding: '10px', fontSize: '10px', margin: 0, overflow: 'auto', border: '1px solid var(--border-color)' }}>
{`type: ${selectedNode === 'db' ? 'RelationalDB' : 'Module'}
strictCheck: true
dependencies: []
allowedEgress: []`}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ color: 'var(--text-muted)' }}>Select a node in the schematic map to inspect its validation contract.</div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 03: DRIFT AUDITOR */}
              {activeTab === 'audit' && (
                <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', height: '100%' }}>
                  
                  {/* RADAR CHART PANEL */}
                  <div className="console-panel" style={{ border: 0 }}>
                    <div className="panel-header">QUALITY DIMENSIONS AUDIT</div>
                    <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="radar-display">
                        <div className="radar-sweep" />
                        <div className="radar-axis-h" />
                        <div className="radar-axis-v" />
                        <div className="radar-circle" style={{ width: '60px', height: '60px' }} />
                        <div className="radar-circle" style={{ width: '120px', height: '120px' }} />
                        <div className="radar-circle" style={{ width: '180px', height: '180px' }} />
                        <div style={{ position: 'absolute', color: 'var(--accent-blue)', fontSize: '11px', fontWeight: 'bold' }}>
                          SCANNING CORE...
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                          <span>Aderência à Constituição:</span>
                          <span style={{ color: 'var(--accent-green)' }}>100%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                          <span>Cobertura de Testes (AES):</span>
                          <span style={{ color: 'var(--accent-green)' }}>92%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                          <span>Drifts Arquiteturais:</span>
                          <span style={{ color: driftStatus === 'drift' ? 'var(--accent-orange)' : 'var(--accent-green)' }}>
                            {driftStatus === 'drift' ? '1 DETECTED' : '0 DETECTED'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FILE DRIFT COMPARER */}
                  <div className="console-panel" style={{ borderTop: 0, borderRight: 0, borderBottom: 0 }}>
                    <div className="panel-header">CODE FILE DRIFT COMPARER</div>
                    <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      
                      {driftStatus === 'drift' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                          <div style={{ border: '1px solid var(--accent-orange)', padding: '12px', background: 'rgba(255, 95, 31, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <span style={{ fontSize: '11px', color: 'var(--accent-orange)', fontWeight: 'bold' }}>[ UNSANCTIONED FILES FOUND ]</span>
                              <div style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '4px' }}>{driftedFile}</div>
                            </div>
                            <button className="tactical-btn warning" onClick={handleResolveDrift}>
                              RESOLVE DRIFT
                            </button>
                          </div>

                          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontFamily: 'monospace', fontSize: '11px' }}>
                            <div style={{ border: '1px solid var(--border-color)', background: 'var(--bg-primary)', padding: '12px', overflow: 'auto' }}>
                              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '8px', color: 'var(--text-muted)' }}>CONTRACT SPECIFICATION</div>
                              <div>{`// File must comply with IRepository schema
export interface IUserRepository {
  findById(id: string): Promise<User>;
}`}</div>
                            </div>
                            <div style={{ border: '1px solid var(--accent-orange)', background: 'var(--bg-primary)', padding: '12px', overflow: 'auto' }}>
                              <div style={{ borderBottom: '1px solid var(--accent-orange)', paddingBottom: '6px', marginBottom: '8px', color: 'var(--accent-orange)' }}>PHYSICAL IMPLEMENTATION</div>
                              <div>{`// Warning: Raw Database connection bypasses the repo pattern
export function executeRawQuery(sql: string) {
  return pg.query(sql); // Unsanctioned bypass!
}`}</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, border: '1px dashed var(--border-color)', background: 'var(--bg-tertiary)' }}>
                          <div style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-green)', display: 'block' }}>[ ALL FILES COMPLIANT ]</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AST validator reported no architectural drifts.</span>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              )}

              {/* TAB 04: EVOLUTION RADAR */}
              {activeTab === 'radar' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', height: '100%' }}>
                  
                  {/* TECHNOLOGY RADAR */}
                  <div className="console-panel" style={{ border: 0 }}>
                    <div className="panel-header">TECHNOLOGY RADAR (AEF)</div>
                    <div className="panel-content" style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                      
                      {/* Radar layout graphics */}
                      <div style={{
                        width: '320px',
                        height: '320px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '50% !important',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--bg-primary)'
                      }}>
                        <div style={{ position: 'absolute', width: '240px', height: '240px', border: '1px dashed var(--border-color)', borderRadius: '50% !important' }} />
                        <div style={{ position: 'absolute', width: '160px', height: '160px', border: '1px solid var(--border-color)', borderRadius: '50% !important' }} />
                        <div style={{ position: 'absolute', width: '80px', height: '80px', border: '1px dashed var(--border-color)', borderRadius: '50% !important' }} />
                        
                        {/* Legend rings */}
                        <span style={{ position: 'absolute', top: '15px', fontSize: '9px', color: 'var(--text-muted)' }}>HOLD</span>
                        <span style={{ position: 'absolute', top: '55px', fontSize: '9px', color: 'var(--text-muted)' }}>ASSESS</span>
                        <span style={{ position: 'absolute', top: '95px', fontSize: '9px', color: 'var(--text-muted)' }}>TRIAL</span>
                        <span style={{ position: 'absolute', top: '135px', fontSize: '9px', color: 'var(--text-muted)' }}>ADOPT</span>

                        {/* Tech Dots */}
                        <div style={{ position: 'absolute', top: '140px', left: '130px', width: '8px', height: '8px', backgroundColor: 'var(--accent-blue)', borderRadius: '50% !important' }} title="Next.js 15" />
                        <div style={{ position: 'absolute', top: '80px', left: '190px', width: '8px', height: '8px', backgroundColor: 'var(--accent-green)', borderRadius: '50% !important' }} title="Prisma" />
                        <div style={{ position: 'absolute', top: '40px', left: '100px', width: '8px', height: '8px', backgroundColor: 'var(--accent-orange)', borderRadius: '50% !important' }} title="Kafka" />
                      </div>

                    </div>
                  </div>

                  {/* ACTIVE RFC PROPOSALS */}
                  <div className="console-panel" style={{ borderTop: 0, borderRight: 0, borderBottom: 0 }}>
                    <div className="panel-header">PROPOSED EVOLUTIONS (AEF)</div>
                    <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      
                      <div style={{ border: '1px solid var(--border-color)', padding: '16px', background: 'var(--bg-tertiary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--accent-blue)', fontWeight: 'bold' }}>{evolutionRfc.id}</span>
                          <span style={{
                            fontSize: '9px',
                            padding: '2px 6px',
                            border: '1px solid var(--border-color)',
                            color: evolutionRfc.status === 'EXECUTED' ? 'var(--accent-green)' : 'var(--accent-orange)'
                          }}>
                            {evolutionRfc.status}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{evolutionRfc.title}</h4>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                          <div>IMPACT: <strong style={{ color: 'var(--accent-green)' }}>{evolutionRfc.impactScore}</strong></div>
                          <div>RISK: <strong>{evolutionRfc.risk}</strong></div>
                        </div>

                        {evolutionRfc.status !== 'EXECUTED' && (
                          <button className="tactical-btn primary" onClick={handleRunMigration} style={{ width: '100%' }}>
                            APPROVE & EXECUTE MIGRATION
                          </button>
                        )}
                      </div>

                    </div>
                  </div>

                </div>
              )}

            </section>

          </main>

        </div>
      )}
    </div>
  );
}
