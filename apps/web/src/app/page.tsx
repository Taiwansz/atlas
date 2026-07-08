'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';

// TYPE DEFINITIONS
interface LogItem {
  time: string;
  tag: 'SYS' | 'MAESTRO' | 'AUDIT' | 'EVOLUTION' | 'SUPABASE';
  text: string;
  type: 'info' | 'warn' | 'success' | 'err';
}

interface BlueprintModule {
  name: string;
  type: 'ingress' | 'logic' | 'auth' | 'database';
  dependencies: string[];
  purpose: string;
  allowedEgress: string[];
}

interface Invariant {
  rule: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
}

interface Adr {
  id: string;
  title: string;
  status: string;
  context: string;
  decision: string;
  consequence: string;
}

interface BacklogItem {
  id: string;
  title: string;
  type: 'FEATURE' | 'CHORE' | 'SPIKE';
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimate: number;
}

interface RoadmapSprint {
  id: string;
  name: string;
  goal: string;
  tasks: string[];
  risk: string;
}

interface AiPromptStep {
  step: string;
  tool: string;
  prompt: string;
}

interface ProjectProfile {
  projectName: string;
  stack: string;
  stackLabel: string;
  description: string;
  idea: string;
  answers: { [key: string]: string };
  architecture: string;
  modules: BlueprintModule[];
  constitution: Invariant[];
  adrs: Adr[];
  backlog: BacklogItem[];
  roadmap: RoadmapSprint[];
  driftFile: string;
  driftContract: string;
  driftPhysical: string;
  driftResolved: string;
  rfcProposal: {
    id: string;
    title: string;
    status: 'PENDING_APPROVAL' | 'EXECUTING' | 'EXECUTED';
    impactScore: string;
    risk: string;
    details: string;
  };
  aiPrompts?: AiPromptStep[];
}

// DETERMINISTIC FALLBACK ARCHITECT ENGINE
const generateProjectProfile = (
  name: string,
  stack: string,
  description: string,
  idea: string,
  answers: { [key: string]: string }
): ProjectProfile => {
  const normalizedName = name.trim().toLowerCase().replace(/\s+/g, '-');
  
  if (stack === 'rust-actix') {
    return {
      projectName: normalizedName,
      stack: 'rust-actix',
      stackLabel: 'Rust (Actix-Web) & SQLx Backend',
      description,
      idea,
      answers,
      architecture: 'Clean Architecture with Ports & Adapters',
      modules: [
        { name: 'ingress/api', type: 'ingress', dependencies: ['logic/core'], purpose: 'HTTP API and routes handling', allowedEgress: ['internet'] },
        { name: 'logic/core', type: 'logic', dependencies: ['db/postgres'], purpose: 'Core business logic of the system', allowedEgress: [] },
        { name: 'db/postgres', type: 'database', dependencies: [], purpose: 'Database connectivity and SQLx queries', allowedEgress: ['db'] }
      ],
      constitution: [
        { rule: 'RUST-NO-RAW-UNSAFE-SQL', severity: 'CRITICAL', description: 'Prevent SQL Injection. All database writes must run through SQLx macro-validated queries.' },
        { rule: 'ACTIX-TYPED-APP-STATE', severity: 'HIGH', description: 'App State must be wrapped in web::Data to enforce thread safety across workers.' }
      ],
      adrs: [
        { id: 'ADR-001', title: 'Compile-time Validated SQLx Driver', status: 'APPROVED', context: 'Need type-safe database queries.', decision: 'Adopt SQLx driver over ORMs.', consequence: 'Requires active db connection during build.' }
      ],
      backlog: [
        { id: 'T-101', title: 'Initialize Actix HTTP Server', type: 'FEATURE', description: 'Set up routes and web server', priority: 'HIGH', estimate: 3 },
        { id: 'T-102', title: 'Write SQLx Database connection', type: 'CHORE', description: 'Initialize postgres pool', priority: 'HIGH', estimate: 2 }
      ],
      roadmap: [
        { id: 'SPRINT-1', name: 'Sprint 1: Esqueleto Actix', goal: 'Configurar servidor e conexões', tasks: ['T-101', 'T-102'], risk: 'Baixo risco de infra' }
      ],
      driftFile: 'src/db/user_repository.rs',
      driftContract: '// UserRepository trait definition\npub trait UserRepository {\n    fn get_user(&self, id: i32) -> Result<User, DbError>;\n}',
      driftPhysical: 'pub fn fetch_user_insecure(sql: &str) {\n    // Violation: raw unvalidated SQL bypasses traits\n    let query = sqlx::query(sql);\n}',
      driftResolved: 'impl UserRepository for PostgresRepository {\n    fn get_user(&self, id: i32) -> Result<User, DbError> {\n        // Compliant: query is fully validated and parameterized\n        sqlx::query_as!(User, "SELECT * FROM users WHERE id = $1", id)\n    }\n}',
      rfcProposal: {
        id: 'RFC-202',
        title: 'Migrate DB Access layers to SQLx Database Pool',
        status: 'PENDING_APPROVAL',
        impactScore: '+120 Engineering Score',
        risk: 'LOW (Tested in Sandbox)',
        details: 'Converts legacy Knex file queries to clean repository integration layer.'
      },
      aiPrompts: [
        {
          step: 'Etapa 1: Setup do Workspace e Invariants',
          tool: 'Claude Code / Cursor / Bolt',
          prompt: `Configure um projeto Rust usando Cargo. Adicione actix-web e sqlx no Cargo.toml. Crie uma Constitution.md no root estabelecendo as regras:
- RUST-NO-RAW-UNSAFE-SQL: Proibido SQL cru.
- ACTIX-TYPED-APP-STATE: State deve ser wrapped em web::Data.`
        },
        {
          step: 'Etapa 2: Modelagem e Contratos de Repositório',
          tool: 'Devin / Lovable / Cursor',
          prompt: `Crie a camada de domínio contendo a entidade UserRepository em src/db/user_repository.rs usando traits. Garanta que nenhuma query SQL crua seja exportada.`
        }
      ]
    };
  } else if (stack === 'go-fiber') {
    return {
      projectName: normalizedName,
      stack: 'go-fiber',
      stackLabel: 'Go (Fiber) & Pgx Microservices',
      description,
      idea,
      answers,
      architecture: 'Hexagonal Architecture (Ports and Adapters)',
      modules: [
        { name: 'ingress/http', type: 'ingress', dependencies: ['logic/domain'], purpose: 'Fiber routes mapping and controllers', allowedEgress: ['internet'] },
        { name: 'logic/domain', type: 'logic', dependencies: ['db/pgx'], purpose: 'Domain interface layers and use-cases', allowedEgress: [] },
        { name: 'db/pgx', type: 'database', dependencies: [], purpose: 'PostgreSQL connection handling via Pgx', allowedEgress: ['db'] }
      ],
      constitution: [
        { rule: 'GO-CONTEXT-PROPAGATION', severity: 'CRITICAL', description: 'Always propagate context.Context down to pgx database calls to enable query cancelation.' },
        { rule: 'GO-FIBER-SHUTDOWN-GRACEFUL', severity: 'MEDIUM', description: 'Enforce application channel listening to handle SIGTERM and gracefully shut down Fiber.' }
      ],
      adrs: [
        { id: 'ADR-001', title: 'Pgx Pool connection for database', status: 'APPROVED', context: 'Need connection pool management.', decision: 'Utilize pgxpool instead of database/sql.', consequence: 'Thread-safe and fast postgres connections.' }
      ],
      backlog: [
        { id: 'T-101', title: 'Initialize Fiber Router', type: 'FEATURE', description: 'Set up endpoints mapping', priority: 'HIGH', estimate: 2 },
        { id: 'T-102', title: 'Configure Pgx Pool handler', type: 'CHORE', description: 'Inject database connection pool', priority: 'HIGH', estimate: 3 }
      ],
      roadmap: [
        { id: 'SPRINT-1', name: 'Sprint 1: Base Go Fiber', goal: 'Configurar roteador e pooling', tasks: ['T-101', 'T-102'], risk: 'Nenhum risco detectado' }
      ],
      driftFile: 'repository/user.go',
      driftContract: 'package repository\n\ntype UserRepository interface {\n\tGetByID(ctx context.Context, id string) (*User, error)\n}',
      driftPhysical: 'func FetchUserDirect(conn *pgx.Conn, sql string) {\n\t// Violation: Bypass repository contracts using direct raw queries\n\tconn.Query(context.Background(), sql)\n}',
      driftResolved: 'type PostgresUserRepository struct {\n\tPool *pgxpool.Pool\n}\n\nfunc (r *PostgresUserRepository) GetByID(ctx context.Context, id string) (*User, error) {\n\t// Compliant: Enforces repository interface contract and uses pgxpool\n\tvar u User\n\terr := r.Pool.QueryRow(ctx, "SELECT id, name FROM users WHERE id=$1", id).Scan(&u.ID, &u.Name)\n\treturn &u, err\n}',
      rfcProposal: {
        id: 'RFC-202',
        title: 'Migrate DB Access layers to pgxpool Integration',
        status: 'PENDING_APPROVAL',
        impactScore: '+120 Engineering Score',
        risk: 'LOW (Tested in Sandbox)',
        details: 'Converts legacy SQL file queries to clean repository integration layer.'
      },
      aiPrompts: [
        {
          step: 'Etapa 1: Setup do Workspace e Invariants',
          tool: 'Claude Code / Cursor / Bolt',
          prompt: `Crie um projeto Go (go mod init). Instale gofiber/fiber/v2 e jackc/pgx/v5. Crie a Constitution.md exigindo:
- GO-CONTEXT-PROPAGATION: Sempre passar context.Context nas chamadas pgx.
- GO-FIBER-SHUTDOWN-GRACEFUL: Escutar SIGTERM para shutdown gracioso.`
        },
        {
          step: 'Etapa 2: Modelagem e Contratos de Repositório',
          tool: 'Devin / Lovable / Cursor',
          prompt: `Crie a pasta repository/ e defina a interface UserRepository em user.go. Implemente os contratos respeitando o context.Context.`
        }
      ]
    };
  }

  // Next.js & Fastify default
  return {
    projectName: normalizedName,
    stack: 'nextjs-fastify',
    stackLabel: 'Next.js 15 & Fastify (TypeScript)',
    description,
    idea,
    answers,
    architecture: 'Modular Architecture with API Gateway routing',
    modules: [
      { name: 'ingress/nextjs', type: 'ingress', dependencies: ['logic/fastify'], purpose: 'Frontend rendering and user experience', allowedEgress: ['internet'] },
      { name: 'logic/fastify', type: 'logic', dependencies: ['db/prisma'], purpose: 'Fastify high-performance API server', allowedEgress: [] },
      { name: 'db/prisma', type: 'database', dependencies: [], purpose: 'Prisma ORM relational access layer', allowedEgress: ['db'] }
    ],
    constitution: [
      { rule: 'NEXT-NO-RAW-SQL-QUERIES', severity: 'CRITICAL', description: 'Prevent SQL injection and drifts. Database queries must run through Prisma client handlers.' },
      { rule: 'NEXT-API-ROUTE-ISOLATION', severity: 'HIGH', description: 'NextJS endpoints must act strictly as gateways, delegating business logic to Fastify.' }
    ],
    adrs: [
      { id: 'ADR-001', title: 'Adoption of Prisma ORM Client', status: 'APPROVED', context: 'Need type-safe database queries.', decision: 'Use Prisma ORM for relational schemas.', consequence: 'Easier schema migrations and typing.' }
    ],
    backlog: [
      { id: 'T-101', title: 'Setup NextJS frontend app', type: 'FEATURE', description: 'Build onboarding interface pages', priority: 'HIGH', estimate: 5 },
      { id: 'T-102', title: 'Mount Fastify server routing', type: 'FEATURE', description: 'Create logic gateway controllers', priority: 'HIGH', estimate: 3 }
    ],
    roadmap: [
      { id: 'SPRINT-1', name: 'Sprint 1: Setup & API', goal: 'Iniciar NextJS e servidor Fastify', tasks: ['T-101', 'T-102'], risk: 'Baixo risco' }
    ],
    driftFile: 'packages/core/src/db/raw-query.ts',
    driftContract: '// Database client contract definition\nexport interface DatabaseClient {\n  findUser(id: string): Promise<User | null>;\n}',
    driftPhysical: 'import { pg } from "../lib/db";\n\n// Warning: Raw Database connection bypasses the repository pattern\nexport function executeRawQuery(sql: string) {\n  return pg.query(sql); // Unsanctioned bypass!\n}',
    driftResolved: 'import { prisma } from "../lib/db";\n\n// Compliant: Enforces repository constraints via Prisma type-safe queries\nexport async function findUser(id: string) {\n  return prisma.user.findUnique({\n    where: { id }\n  });\n}',
    rfcProposal: {
      id: 'RFC-202',
      title: 'Migrate DB Access layers to Prisma-Next Integration',
      status: 'PENDING_APPROVAL',
      impactScore: '+120 Engineering Score',
      risk: 'LOW (Tested in Sandbox)',
      details: 'Converts legacy Knex file queries to type-safe Prisma client actions and maps model schemas.'
    },
    aiPrompts: [
      {
        step: 'Etapa 1: Setup do Workspace e Invariants',
        tool: 'Claude Code / Cursor / Bolt',
        prompt: `Crie um monorepo Next.js com Fastify e Prisma. Adicione no root um arquivo Constitution.md com:
- NEXT-NO-RAW-SQL-QUERIES: Toda query deve usar Prisma Client.
- NEXT-API-ROUTE-ISOLATION: Rotas do Next.js devem delegar para Fastify.`
      },
      {
        step: 'Etapa 2: Modelagem e Contratos de Repositório',
        tool: 'Devin / Lovable / Cursor',
        prompt: `Crie o arquivo packages/core/src/db/raw-query.ts definindo uma interface type-safe de acesso a dados usando o Prisma client.`
      }
    ]
  };
};

export default function Page() {
  const [projectName, setProjectName] = useState('meu-projeto');
  const [projectStack, setProjectStack] = useState('nextjs-fastify');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectIdea, setProjectIdea] = useState('');

  // STATE MACHINE STAGES
  const [flowStage, setFlowStage] = useState<'login' | 'landing' | 'discovery' | 'compiling' | 'dashboard'>('landing');
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [dirHandle, setDirHandle] = useState<any | null>(null);

  // AUTH STATE
  const [user, setUser] = useState<any | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // REALTIME DISCOVERY STATE
  const [chatMessages, setChatMessages] = useState<{ sender: 'ai' | 'user'; text: string }[]>([]);
  const [userAnswerInput, setUserAnswerInput] = useState('');
  const [interviewStep, setInterviewStep] = useState(0); // 0: enter, 1: q1, 2: q2, 3: approval recap
  const [projectAnswers, setProjectAnswers] = useState<{ [key: string]: string }>({});
  const [partialProfile, setPartialProfile] = useState<any | null>(null);
  const [activeRightTab, setActiveRightTab] = useState<'domain' | 'topology' | 'governance' | 'drift'>('domain');
  const [isAnalyzingRight, setIsAnalyzingRight] = useState(false);

  // COMPILING STAGE STATE
  const [compilationProgress, setCompilationProgress] = useState(0);
  const [compilationLogs, setCompilationLogs] = useState<string[]>([]);

  // COMPILED WORKSPACE PROFILE
  const [profile, setProfile] = useState<ProjectProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'monitor' | 'blueprint' | 'audit' | 'radar' | 'assets'>('monitor');
  const [activeSubTab, setActiveSubTab] = useState<'backlog' | 'roadmap'>('backlog');
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // RUNTIME ACTIONS STATE
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [selectedNode, setSelectedNode] = useState<string>('ingress');
  const [score, setScore] = useState(820);
  const [driftStatus, setDriftStatus] = useState<'clean' | 'drift'>('drift');
  const [activeTasks, setActiveTasks] = useState([
    { id: 'T-101', name: 'AST Code Audit', status: 'RUNNING', progress: 54 },
    { id: 'T-102', name: 'Maestro Agent Sync', status: 'WAITING', progress: 0 },
    { id: 'T-103', name: 'Supabase Sync', status: 'COMPLETED', progress: 100 }
  ]);
  const [evolutionRfcStatus, setEvolutionRfcStatus] = useState<'PENDING_APPROVAL' | 'EXECUTING' | 'EXECUTED'>('PENDING_APPROVAL');

  const logEndRef = useRef<HTMLDivElement>(null);

  // MONITOR AUTH STATE CHANGES
  useEffect(() => {
    const checkSession = async () => {
      if (typeof window !== 'undefined' && window.localStorage.getItem('atlas_e2e_mock_user')) {
        setUser({ email: 'test-user@atlas.dev', user_metadata: { name: 'E2E Tester' } });
        setFlowStage('landing');
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        setFlowStage('landing');
      } else {
        setUser(null);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        setFlowStage('landing');
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword
      });
      if (error) throw error;
      setUser(data.user);
      setFlowStage('landing');
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao entrar.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: {
          data: {
            name: authName,
            plan: 'free'
          }
        }
      });
      if (error) throw error;
      alert('Cadastro concluído! Verifique seu e-mail para confirmação.');
      setAuthMode('login');
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao cadastrar.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('atlas_e2e_mock_user');
    }
    setUser(null);
    resetWorkspace();
  };

  // DETECT LOCAL WORKSPACE INFORMATION ON STARTUP
  useEffect(() => {
    fetch('/api/workspace')
      .then(res => res.json())
      .then(data => {
        if (data && data.isLocal) {
          setProjectName(data.projectName);
          setProjectDesc(data.description);
        }
      })
      .catch(err => console.log('Local Workspace API offline'));
  }, []);

  // AUTO-SCROLL LOOPS
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, compilationLogs, chatMessages]);

  // THEME MANAGEMENT
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('theme-light');
      root.classList.add('theme-dark');
    } else {
      root.classList.remove('theme-dark');
      root.classList.add('theme-light');
    }
  }, [isDark]);

  // PRE-FILL IDEAS PRESETS
  const handlePreFill = (type: 'ai' | 'fintech' | 'game' | 'frota') => {
    if (type === 'ai') {
      setProjectName('ai-prompt-studio');
      setProjectDesc('Estúdio completo para engenharia e otimização de prompts de IA.');
      setProjectIdea('Quero criar um estúdio de engenharia de prompts de IA onde desenvolvedores possam escrever prompts normais e otimizá-los automaticamente com regras e histórico.');
      setProjectStack('nextjs-fastify');
    } else if (type === 'fintech') {
      setProjectName('ledger-api');
      setProjectDesc('API de alta performance para registros contábeis imutáveis.');
      setProjectIdea('Quero criar um sistema de contabilidade de livro-razão (ledger) que registre transferências financeiras de forma imutável com validações transacionais estritas.');
      setProjectStack('rust-actix');
    } else if (type === 'game') {
      setProjectName('game-lobby');
      setProjectDesc('Serviço de gerenciamento de sessões e matchmaking em tempo real.');
      setProjectIdea('Quero criar um lobby de matchmaking para jogos multiplayer que combine jogadores por nível de habilidade e gerencie as sessões de jogo ativas.');
      setProjectStack('go-fiber');
    } else if (type === 'frota') {
      setProjectName('fleet-management');
      setProjectDesc('Sistema de gestão de frotas comerciais e telemetria.');
      setProjectIdea('Quero criar um sistema de gestão de frotas comerciais que monitore a localização em tempo real, consumo de combustível, manutenções e o perfil de direção dos motoristas.');
      setProjectStack('go-fiber');
    }
  };

  // STEP 1: INITIALIZE COGNITIVE DISCOVERY
  const startDiscovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectIdea.trim()) return;

    setFlowStage('discovery');
    setInterviewStep(1);
    setChatMessages([
      { sender: 'ai', text: `Agente de Discovery do Atlas inicializado. Analisando ideia do software: "${projectIdea}"` },
      { sender: 'ai', text: `Mapeando domínio de negócio e regras iniciais para a stack [${projectStack.toUpperCase()}]...` }
    ]);
    setIsAnalyzingRight(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: projectIdea,
          projectStack,
          messages: []
        })
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [
          ...prev,
          { sender: 'ai', text: data.reply }
        ]);
        if (data.partialProfile) {
          setPartialProfile(data.partialProfile);
        }
      } else {
        throw new Error('API route failed');
      }
    } catch (err: any) {
      console.warn('Discovery API error, using offline mock dialogue:', err);
      // Fallback
      setChatMessages(prev => [
        ...prev,
        { sender: 'ai', text: 'Entendido. Para estruturar o domínio de frotas, quais os perfis de usuários principais que irão acessar a plataforma e o que cada um precisa fazer?' }
      ]);
      setPartialProfile({
        projectName: projectName,
        domainDescription: 'Gestão operacional de frotas comerciais e telemetria básica.',
        personas: ['Gerente de Logística', 'Motorista da Frota', 'Operador de Manutenção'],
        suggestedTechs: ['PostgreSQL', 'Redis', 'WebSockets'],
        entities: ['Veículo', 'Motorista', 'Viagem', 'Alerta'],
        modules: [
          { name: 'ingress/api', purpose: 'Entrada de dados e endpoints REST/WS' },
          { name: 'logic/fleet', purpose: 'Lógica operacional de monitoramento' }
        ],
        features: ['Rastreamento de veículos', 'Gestão de alertas de manutenção'],
        complexity: 'Média',
        risks: ['Alta concorrência em telemetria', 'Latência de GPS']
      });
    } finally {
      setIsAnalyzingRight(false);
    }
  };

  // STEP 2: CHAT RESPONSE & REAL-TIME DISCOVERY EVOLUTION
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswerInput.trim()) return;

    const userText = userAnswerInput.trim();
    const updatedMessages = [...chatMessages, { sender: 'user' as const, text: userText }];
    setChatMessages(updatedMessages);
    setUserAnswerInput('');
    setIsAnalyzingRight(true);

    const mapped = updatedMessages.map(msg => ({
      role: msg.sender === 'user' ? ('user' as const) : ('assistant' as const),
      content: msg.text
    }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: projectIdea,
          projectStack,
          messages: mapped
        })
      });
      if (res.ok) {
        const data = await res.json();
        
        if (data.partialProfile) {
          setPartialProfile((prev: any) => ({
            ...prev,
            ...data.partialProfile
          }));
        }

        if (data.reply.includes('CONVERT_TO_COMPILER_NOW') || interviewStep >= 2) {
          setChatMessages((prev) => [
            ...prev,
            { sender: 'ai', text: 'Todos os requisitos essenciais foram mapeados! Alinhamento cognitivo concluído.' },
            { sender: 'ai', text: 'Favor revisar a arquitetura mapeada nos painéis da direita e aprovar a compilação do Blueprint.' }
          ]);
          setInterviewStep(3); // Recap / Approval state
        } else {
          setChatMessages((prev) => [
            ...prev,
            { sender: 'ai', text: data.reply }
          ]);
          if (interviewStep === 1) {
            setProjectAnswers(prev => ({ ...prev, q1: userText }));
            setInterviewStep(2);
          } else {
            setProjectAnswers(prev => ({ ...prev, q2: userText }));
            setInterviewStep(3);
          }
        }
      } else {
        throw new Error('API route failure');
      }
    } catch (e: any) {
      console.warn('NVIDIA chat API failed, bypassing to recap stage:', e);
      setProjectAnswers(prev => ({ ...prev, q2: userText }));
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Alinhamento concluído com sucesso (modo local offline)!' },
        { sender: 'ai', text: 'Revise o domínio e os módulos mapeados e aprove a compilação final.' }
      ]);
      setInterviewStep(3);
    } finally {
      setIsAnalyzingRight(false);
    }
  };

  // STEP 3: RUN BLUEPRINT COMPILER
  const triggerCompilation = () => {
    setFlowStage('compiling');
    setCompilationProgress(0);
    setCompilationLogs([]);

    const steps = [
      { text: 'Analyzing business discovery answers...', pct: 10 },
      { text: 'Translating business logic requirements to package modulations...', pct: 30 },
      { text: 'Compiling Constitution invariants and quality gates...', pct: 50 },
      { text: 'Generating Architectural Decision Records (ADRs)...', pct: 70 },
      { text: 'Compiling AI Prompts package layers (Claude Code, Cursor)...', pct: 90 },
      { text: 'Writing local workspace contracts (dirHandle)...', pct: 95 },
      { text: 'Blueprint built successfully. Workspace online.', pct: 100 }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const active = steps[currentStep];
        if (active) {
          setCompilationProgress(active.pct);
          setCompilationLogs((prev) => [...prev, `[COMPILER] ${active.text}`]);
          
          if (active.pct === 90) {
            saveProfileToSupabase();
          }
        }
        currentStep++;
      } else {
        clearInterval(interval);
        
        // Compile actual data profile from NVIDIA LLM API!
        fetch('/api/compile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectName,
            projectStack,
            projectDesc: partialProfile?.domainDescription || projectDesc,
            projectIdea,
            answers: projectAnswers
          })
        })
        .then(res => {
          if (!res.ok) throw new Error('Compile API error');
          return res.json();
        })
        .then(async (compiled) => {
          if (dirHandle) {
            const constContent = `# Project Architecture Constitution\n# Workspace: ${compiled.projectName}\n\n1. Core Architectural Constraints\n- Modularity Type: ${compiled.architecture}\n- Execution Stack: ${compiled.stackLabel}\n\n2. Invariant Gates\n` + compiled.constitution.map((c: any, i: number) => `${i+1}. [${c.rule}] - Severity: ${c.severity}\n   Rule: ${c.description}`).join('\n\n');
            await writeLocalWorkspaceFile(dirHandle, 'Constitution.md', constContent);

            const adrsContent = compiled.adrs.map((a: any) => `# ${a.id}: ${a.title}\n\n**Status:** ${a.status}\n\n**Context:** ${a.context}\n\n**Decision:** ${a.decision}`).join('\n\n');
            await writeLocalWorkspaceFile(dirHandle, 'ADRs.md', adrsContent);

            await writeLocalWorkspaceFile(dirHandle, 'backlog.json', JSON.stringify(compiled.backlog, null, 2));
            await writeLocalWorkspaceFile(dirHandle, 'roadmap.json', JSON.stringify(compiled.roadmap, null, 2));

            await writeLocalWorkspaceFile(dirHandle, compiled.driftFile || 'packages/core/src/db/raw-query.ts', compiled.driftPhysical || '');
          }

          setProfile(compiled);
          setDriftStatus(compiled.driftStatus || 'drift');
          setScore(compiled.driftStatus === 'clean' ? 1000 : 820);

          // Feed initial logs in console
          const now = new Date().toLocaleTimeString();
          setLogs([
            { time: now, tag: 'SYS', text: 'Atlas Operating System online.', type: 'success' },
            { time: now, tag: 'MAESTRO', text: `Loaded System Blueprint for ${compiled.projectName}. Stack: ${compiled.stackLabel}`, type: 'info' },
            { time: now, tag: 'AUDIT', text: `AST Watcher daemon attached to modules.`, type: 'info' }
          ]);
        })
        .catch(err => {
          console.warn('Nvidia compiler failed, using local builder template:', err);
          const compiledFallback = generateProjectProfile(projectName, projectStack, projectDesc, projectIdea, projectAnswers);
          setProfile(compiledFallback);
          
          const now = new Date().toLocaleTimeString();
          setLogs([
            { time: now, tag: 'SYS', text: 'Atlas Operating System online.', type: 'success' },
            { time: now, tag: 'MAESTRO', text: `Loaded System Blueprint for ${compiledFallback.projectName}. Stack: ${compiledFallback.stackLabel}`, type: 'info' },
            { time: now, tag: 'AUDIT', text: `AST Watcher daemon attached to ${compiledFallback.modules.length} modules.`, type: 'info' }
          ]);
        })
        .finally(() => {
          setFlowStage('dashboard');
          setHasInitialized(true);
        });
      }
    }, 500);
  };

  // PERSIST PROFILE TO SUPABASE
  const saveProfileToSupabase = async () => {
    setIsSyncingSupabase(true);
    try {
      const payload = generateProjectProfile(projectName, projectStack, projectDesc, projectIdea, projectAnswers);
      const { error } = await supabase.from('atlas_projects').insert({
        name: projectName,
        stack: projectStack,
        description: JSON.stringify({
          description: projectDesc,
          idea: projectIdea,
          blueprint: payload
        }),
        created_at: new Date().toISOString()
      });

      if (error) {
        console.warn('Supabase insert failed (local mode):', error.message);
        setIsSynced(false);
      } else {
        setIsSynced(true);
      }
    } catch (e) {
      console.warn('Network offline or error during Supabase connection:', e);
      setIsSynced(false);
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  // EXPORT ACTION: DOWNLOAD .ZIP BOILERPLATE (JSZip CDN)
  const handleZipDownload = async () => {
    if (!profile) return;
    setIsZipping(true);
    
    // Dynamic JSZip load helper
    const loadJSZip = () => {
      return new Promise<any>((resolve, reject) => {
        if ((window as any).JSZip) {
          resolve((window as any).JSZip);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        script.onload = () => resolve((window as any).JSZip);
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    try {
      const JSZip = await loadJSZip();
      const zip = new JSZip();

      // Write documentation
      const constContent = `# Project Architecture Constitution\n# Workspace: ${profile.projectName}\n\n1. Core Architectural Constraints\n- Modularity Type: ${profile.architecture}\n- Execution Stack: ${profile.stackLabel}\n\n2. Invariant Gates\n` + profile.constitution.map((c, i) => `${i+1}. [${c.rule}] - Severity: ${c.severity}\n   Rule: ${c.description}`).join('\n\n');
      zip.file('Constitution.md', constContent);

      const adrsContent = profile.adrs.map(a => `# ${a.id}: ${a.title}\n\n**Status:** ${a.status}\n\n**Context:** ${a.context}\n\n**Decision:** ${a.decision}`).join('\n\n');
      zip.file('ADRs.md', adrsContent);

      zip.file('backlog.json', JSON.stringify(profile.backlog, null, 2));
      zip.file('roadmap.json', JSON.stringify(profile.roadmap, null, 2));

      // Build specific code boilerplate based on stack
      if (projectStack === 'rust-actix') {
        zip.file('Cargo.toml', `[package]\nname = "${profile.projectName}"\nversion = "0.1.0"\nedition = "2021"\n\n[dependencies]\nactix-web = "4.4.0"\nserde = { version = "1.0", features = ["derive"] }\nserde_json = "1.0"\nsqlx = { version = "0.7", features = [ "runtime-tokio-native-tls", "postgres" ] }\ntokio = { version = "1.0", features = ["full"] }\n`);
        zip.file('src/main.rs', `use actix_web::{get, web, App, HttpServer, Responder, HttpResponse};\n\n#[get("/health")]\nasync fn health() -> impl Responder {\n    HttpResponse::Ok().json(serde_json::json!({ "status": "UP", "engine": "Atlas Cognitive System" }))\n}\n\n#[actix_web::main]\nasync fn main() -> std::io::Result<()> {\n    println!("Starting Rust server at http://127.0.0.1:8080");\n    HttpServer::new(|| {\n        App::new().service(health)\n    })\n    .bind(("127.0.0.1", 8080))?\n    .run()\n    .await\n}\n`);
        zip.file('src/db/user_repository.rs', profile.driftResolved || '');
      } else if (projectStack === 'go-fiber') {
        zip.file('go.mod', `module ${profile.projectName}\n\ngo 1.20\n\nrequire (\n\tgithub.com/gofiber/fiber/v2 v2.48.0\n)\n`);
        zip.file('main.go', `package main\n\nimport (\n\t"fmt"\n\t"github.com/gofiber/fiber/v2"\n)\n\nfunc main() {\n\tapp := fiber.New()\n\n\tapp.Get("/health", func(c *fiber.Ctx) error {\n\t\treturn c.JSON(fiber.Map{"status": "UP", "engine": "Atlas Cognitive System"})\n\t})\n\n\tfmt.Println("Starting Go Fiber server on :8080")\n\tapp.Listen(":8080")\n}\n`);
        zip.file('repository/user.go', `package repository\n\ntype User struct {\n\tID   string \`json:"id"\`\n\tName string \`json:"name"\`\n}\n\ntype UserRepository interface {\n\tFindByID(id string) (*User, error)\n\tSave(user *User) error\n}\n`);
      } else {
        zip.file('package.json', `{\n  "name": "${profile.projectName}",\n  "version": "1.0.0",\n  "main": "server.js",\n  "dependencies": {\n    "fastify": "^4.21.0",\n    "@fastify/cors": "^8.3.0",\n    "@supabase/supabase-js": "^2.33.0"\n  }\n}\n`);
        zip.file('server.js', `const fastify = require('fastify')({ logger: true });\n\nfastify.get('/health', async (request, reply) => {\n  return { status: 'UP', engine: 'Atlas Cognitive System' };\n});\n\nconst start = async () => {\n  try {\n    await fastify.listen({ port: 8080 });\n  } catch (err) {\n    fastify.log.error(err);\n    process.exit(1);\n  }\n};\nstart();\n`);
        zip.file('src/lib/user_repository.ts', profile.driftResolved || '');
      }

      zip.file('README.md', `# ${profile.projectName}\n\nGenerated by Atlas Engineering Operating System.\n\n## Architecture Specs\n- **Modularity:** ${profile.architecture}\n- **Stack:** ${profile.stackLabel}\n\n## Structure\nSee compiled specifications inside \`Constitution.md\` and \`ADRs.md\` files.\n`);

      const blob = await zip.generateAsync({ type: 'blob' });
      const element = document.createElement('a');
      element.href = URL.createObjectURL(blob);
      element.download = `${profile.projectName}-blueprint.zip`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (e: any) {
      alert('Error generating zip: ' + e.message);
    } finally {
      setIsZipping(false);
    }
  };

  // DIRECTORY ACCESS CONTROLLER (FILE SYSTEM ACCESS API)
  const connectLocalFolder = async () => {
    try {
      if (!(window as any).showDirectoryPicker) {
        alert('Seu navegador não suporta a API de Acesso ao Sistema de Arquivos (File System Access API). Use o Google Chrome ou Microsoft Edge para conectar pastas locais diretamente.');
        return;
      }
      const handle = await (window as any).showDirectoryPicker({
        mode: 'readwrite'
      });
      setDirHandle(handle);
      
      try {
        const pkgHandle = await handle.getFileHandle('package.json');
        const pkgFile = await pkgHandle.getFile();
        const pkgText = await pkgFile.text();
        const pkgJson = JSON.parse(pkgText);
        if (pkgJson.name) setProjectName(pkgJson.name);
        if (pkgJson.description) setProjectDesc(pkgJson.description);
      } catch (e) {
        console.log('No package.json found in folder.');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        alert('Erro ao conectar pasta local: ' + err.message);
      }
    }
  };

  const writeLocalWorkspaceFile = async (handle: any, relativePath: string, content: string) => {
    try {
      const parts = relativePath.split('/');
      let currentDir = handle;
      for (let i = 0; i < parts.length - 1; i++) {
        currentDir = await currentDir.getDirectoryHandle(parts[i], { create: true });
      }
      const fileHandle = await currentDir.getFileHandle(parts[parts.length - 1], { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
    } catch (err) {
      console.warn('Error writing local file:', relativePath, err);
    }
  };

  // RESOLVE FILE DRIFT ON AST AUDITOR
  const resolveDrift = async () => {
    if (!profile) return;
    
    // clean resolved code payload
    const cleanResolvedCode = profile.driftResolved;

    try {
      if (dirHandle) {
        await writeLocalWorkspaceFile(dirHandle, profile.driftFile || 'packages/core/src/db/raw-query.ts', cleanResolvedCode);
        setProfile((prev) => prev ? { ...prev, driftPhysical: cleanResolvedCode } : null);
      } else {
        const res = await fetch('/api/audit', { method: 'POST' });
        if (!res.ok) throw new Error('Falha ao refatorar via API.');
        
        const auditRes = await fetch('/api/audit');
        if (!auditRes.ok) throw new Error('Falha ao obter status após refatoração.');
        const auditData = await auditRes.json();
        
        setProfile((prev) => prev ? { ...prev, driftPhysical: auditData.physicalCode } : null);
      }
      setDriftStatus('clean');
      setScore(1000);
      
      const now = new Date().toLocaleTimeString();
      setLogs((prev) => [
        ...prev,
        { time: now, tag: 'AUDIT', text: `Refactored ${profile.driftFile}. Drift resolved successfully.`, type: 'success' },
        { time: now, tag: 'SYS', text: `Quality Gate validated. Workspace compliance score: 1000/1000.`, type: 'success' }
      ]);
    } catch (e: any) {
      alert('Erro na refatoração: ' + e.message);
    }
  };

  // RESET TOTAL WORKSPACE
  const resetWorkspace = () => {
    setProjectName('meu-projeto');
    setProjectDesc('');
    setProjectIdea('');
    setFlowStage('landing');
    setChatMessages([]);
    setProjectAnswers({});
    setPartialProfile(null);
    setProfile(null);
    setHasInitialized(false);
    setLogs([]);
    setCompilationLogs([]);
    setDriftStatus('drift');
    setScore(820);
    setInterviewStep(0);
  };

  return (
    <div className="crt-flicker" style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        .workspace-container {
          display: flex;
          flex: 1;
          overflow: hidden;
          flex-direction: row;
        }
        .left-pane {
          width: 45%;
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
          padding: 20px;
          overflow-y: auto;
        }
        .right-pane {
          width: 55%;
          display: flex;
          flex-direction: column;
          padding: 20px;
          overflow-y: auto;
        }
        @media (max-width: 768px) {
          .workspace-container {
            flex-direction: column;
            overflow-y: auto;
          }
          .left-pane {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid var(--border-color);
            height: auto;
            overflow-y: visible;
          }
          .right-pane {
            width: 100%;
            height: auto;
            overflow-y: visible;
          }
        }
      `}</style>
      <div className="blueprint-grid" />
      <div className="crt-overlay" />

      {/* 0. AUTHENTICATION MODULE (LOGIN / SIGNUP) */}
      {!user && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px'
        }}>
          <div className="console-panel" style={{ width: '100%', maxWidth: '400px', height: 'auto' }}>
            <div className="panel-header">
              <span className="panel-title">[ AUTHENTICATION GATE ]</span>
              <span>ACCESS IDENTITY MODULE</span>
            </div>
            
            <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '11px', color: 'var(--accent-blue)', fontWeight: 'bold' }}>// IDENTITY VERIFICATION</span>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Acesse ou crie sua conta para compilar Blueprints e sincronizar telemetrias no Supabase Cloud.
                </p>
              </div>

              {authError && (
                <div style={{ color: 'var(--accent-red)', fontSize: '11px', border: '1px solid var(--accent-red)', padding: '8px', background: 'rgba(255, 94, 94, 0.05)' }}>
                  ⚠️ {authError}
                </div>
              )}

              <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {authMode === 'signup' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>NOME COMPLETO</label>
                    <input 
                      type="text" 
                      className="tactical-input" 
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>ENDEREÇO DE E-MAIL</label>
                  <input 
                    type="email" 
                    className="tactical-input" 
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>SENHA DE SEGURANÇA</label>
                  <input 
                    type="password" 
                    className="tactical-input" 
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" disabled={authLoading} className="tactical-btn primary" style={{ width: '100%', padding: '10px', marginTop: '8px' }}>
                  {authLoading ? 'PROCESSANDO...' : authMode === 'login' ? 'ENTRAR NO CONSOLE' : 'CRIAR CONTA'}
                </button>
              </form>

              <div style={{ textAlign: 'center', fontSize: '11px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {authMode === 'login' ? (
                  <span>Não tem conta? <button className="tactical-btn" onClick={() => setAuthMode('signup')} style={{ border: 0, padding: 0, color: 'var(--accent-blue)', background: 'transparent', textDecoration: 'underline', cursor: 'pointer' }}>Cadastre-se</button></span>
                ) : (
                  <span>Já tem conta? <button className="tactical-btn" onClick={() => setAuthMode('login')} style={{ border: 0, padding: 0, color: 'var(--accent-blue)', background: 'transparent', textDecoration: 'underline', cursor: 'pointer' }}>Fazer Login</button></span>
                )}
                
                <div style={{ borderTop: '1px dashed var(--border-color)', margin: '8px 0', padding: '8px 0 0 0' }}>
                  <button 
                    type="button" 
                    className="tactical-btn" 
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.localStorage.setItem('atlas_e2e_mock_user', 'true');
                      }
                      setUser({ email: 'vibe-tester@atlas.dev', user_metadata: { name: 'Vibe Developer' } });
                      setFlowStage('landing');
                    }}
                    style={{ width: '100%', padding: '6px', fontSize: '10px', borderColor: 'var(--accent-green)', color: 'var(--accent-green)' }}
                  >
                    [ ENTRAR NO MODO VIBE (IGNORAR LOGIN) ]
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {user && (
        <>
          {/* LANDING / SETUP SCREEN */}
          {flowStage === 'landing' && (
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px'
            }}>
              <div className="console-panel" style={{ width: '100%', maxWidth: '720px', height: 'auto' }}>
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="panel-title">[ ATLAS ENGINEERING SYSTEM : ONLINE ]</span>
                  <button onClick={handleLogout} className="tactical-btn" style={{ padding: '2px 8px', fontSize: '9px', borderColor: 'var(--accent-red)', color: 'var(--accent-red)', cursor: 'pointer', background: 'transparent' }}>
                    [ LOGOUT ]
                  </button>
                </div>
                
                <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 6px 0', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      // DESCREVA SUA IDEIA DE SOFTWARE
                    </h1>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                      Digite o que deseja construir em linguagem natural. A IA de Discovery guiará a estruturação técnica sem jargões.
                    </p>
                  </div>

                  {/* PRE-FILL SUGGESTIONS */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '10px' }}>
                    <span style={{ color: 'var(--text-muted)', alignSelf: 'center', marginRight: '4px' }}>IDEIAS DE EXEMPLO:</span>
                    <button className="tactical-btn" onClick={() => handlePreFill('ai')}>
                      [ AI Prompting Studio ]
                    </button>
                    <button className="tactical-btn" onClick={() => handlePreFill('fintech')}>
                      [ Ledger API (Rust) ]
                    </button>
                    <button className="tactical-btn" onClick={() => handlePreFill('game')}>
                      [ Game matchmaking (Go) ]
                    </button>
                    <button className="tactical-btn" onClick={() => handlePreFill('frota')}>
                      [ Gestão de Frotas ]
                    </button>
                  </div>

                  {/* CONNECT LOCAL DIRECTORY LINK */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', border: '1px solid var(--border-color)', padding: '12px', background: 'var(--bg-tertiary)' }}>
                    <button 
                      type="button" 
                      className="tactical-btn" 
                      onClick={connectLocalFolder} 
                      style={{ 
                        padding: '8px 12px', 
                        fontSize: '11px', 
                        borderColor: dirHandle ? 'var(--accent-green)' : 'var(--accent-blue)',
                        color: dirHandle ? 'var(--accent-green)' : 'var(--accent-blue)',
                        fontWeight: 'bold'
                      }}
                    >
                      {dirHandle ? `[ CONECTADO: ${dirHandle.name.toUpperCase()} ]` : '[ CONECTAR PASTA LOCAL DO PROJETO ]'}
                    </button>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', flex: 1 }}>
                      {dirHandle 
                        ? 'Os arquivos do seu projeto serão gerados diretamente na sua máquina local.' 
                        : 'Permite salvar Constitution.md e ADRs diretamente em seu disco local.'}
                    </span>
                  </div>

                  <form onSubmit={startDiscovery} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>TARGET_STACK</label>
                        <select 
                          className="tactical-input" 
                          value={projectStack} 
                          onChange={(e) => setProjectStack(e.target.value)}
                          style={{ height: '38px', borderRadius: '0px' }}
                        >
                          <option value="nextjs-fastify">Next.js 15 & Fastify Backend (TypeScript)</option>
                          <option value="rust-actix">Rust (Actix-Web) & SQLx (PostgreSQL)</option>
                          <option value="go-fiber">Go (Fiber) & Pgx Microservices</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>IDEIA CENTRAL DO SEU SOFTWARE</label>
                      <textarea 
                        className="tactical-input" 
                        style={{ height: '110px', resize: 'none', padding: '10px', fontSize: '12px' }}
                        placeholder="Ex: Quero criar um aplicativo de frotas para monitorar caminhões, registrar motoristas por rotas e enviar alertas automáticos de velocidade ou manutenção..."
                        value={projectIdea}
                        onChange={(e) => setProjectIdea(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className="tactical-btn primary" style={{ width: '100%', padding: '12px', fontSize: '12px' }}>
                      [ INICIAR COGNITIVE DISCOVERY ]
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE DISCOVERY / CHAT / COMPILING SPLITSCREEN */}
          {(flowStage === 'discovery' || flowStage === 'compiling' || flowStage === 'dashboard') && (
            <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
              
              {/* TOP SYSTEM HEADER */}
              <header className="tactical-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-green)', className: 'pulse' }} />
                  <span style={{ fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    ATLAS EOS // <span style={{ color: 'var(--accent-blue)' }}>{projectName.toUpperCase()}</span>
                  </span>
                  <span style={{ fontSize: '10px', border: '1px solid var(--border-color)', padding: '2px 6px', background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
                    STACK: {projectStack.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="tactical-btn" onClick={() => setIsDark(!isDark)} style={{ padding: '2px 8px', fontSize: '10px' }}>
                    {isDark ? 'LIGHT_MODE' : 'DARK_MODE'}
                  </button>
                  <button className="tactical-btn" onClick={resetWorkspace} style={{ padding: '2px 8px', fontSize: '10px', borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}>
                    RESET
                  </button>
                  <button className="tactical-btn" onClick={handleLogout} style={{ padding: '2px 8px', fontSize: '10px' }}>
                    LOGOUT
                  </button>
                </div>
              </header>

              {/* MAIN CONTENT SPACE */}
              <div className="workspace-container">
                
                {/* LEFT CONTEXT: CHAT AND CONTROL MODULE */}
                <div className="left-pane">
                  
                  {flowStage === 'discovery' && (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
                      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--accent-orange)', fontWeight: 'bold' }}>// DISCOVERY CHAT SESSION</span>
                        <h2 style={{ fontSize: '15px', fontWeight: 'bold', margin: '4px 0 0 0' }}>ALINHAMENTO COGNITIVO COM A IA</h2>
                      </div>

                      {/* CHAT VIEWPORT */}
                      <div style={{ flex: 1, minHeight: '260px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {chatMessages.map((msg, index) => (
                          <div key={index} style={{
                            alignSelf: msg.sender === 'ai' ? 'flex-start' : 'flex-end',
                            maxWidth: '90%',
                            backgroundColor: msg.sender === 'ai' ? 'var(--bg-secondary)' : 'rgba(0, 216, 246, 0.04)',
                            border: msg.sender === 'ai' ? '1px solid var(--border-color)' : '1px solid var(--accent-blue)',
                            padding: '10px',
                            fontSize: '11px',
                            fontFamily: 'monospace'
                          }}>
                            <span style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: msg.sender === 'ai' ? 'var(--accent-orange)' : 'var(--accent-blue)' }}>
                              {msg.sender === 'ai' ? '[ MAESTRO DISCOVERY ]' : '[ VOCÊ ]'}
                            </span>
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{msg.text}</div>
                          </div>
                        ))}
                      </div>

                      {/* INPUT OR RECAP APPROVAL PANEL */}
                      {interviewStep < 3 ? (
                        <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '10px' }}>
                          <input 
                            type="text" 
                            className="tactical-input" 
                            style={{ flex: 1 }}
                            placeholder="Responda à IA sobre as regras do seu negócio..."
                            value={userAnswerInput}
                            onChange={(e) => setUserAnswerInput(e.target.value)}
                            required
                          />
                          <button type="submit" className="tactical-btn primary" style={{ width: '100px' }}>
                            ENVIAR
                          </button>
                        </form>
                      ) : (
                        <div style={{ border: '1px solid var(--accent-green)', padding: '16px', background: 'rgba(0, 255, 136, 0.03)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <h4 style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-green)' }}>
                            [ CONTRATOS PRONTOS ]
                          </h4>
                          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                            A arquitetura foi mapeada com base nas suas respostas. Aprove abaixo para gerar o Blueprint de governança e os contratos físicos.
                          </p>
                          <button onClick={triggerCompilation} className="tactical-btn primary" style={{ padding: '12px', width: '100%', borderColor: 'var(--accent-green)', color: 'var(--accent-green)' }}>
                            [ APROVAR E COMPILAR BLUEPRINT ]
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {flowStage === 'compiling' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
                      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--accent-blue)', fontWeight: 'bold' }}>// COMPILER ACTIVE</span>
                        <h2 style={{ fontSize: '15px', fontWeight: 'bold', margin: '4px 0 0 0' }}>COMPILANDO ARQUITETURA... {compilationProgress}%</h2>
                      </div>
                      
                      <div style={{ height: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', padding: '2px' }}>
                        <div style={{ height: '100%', background: 'var(--accent-blue)', width: `${compilationProgress}%` }} />
                      </div>

                      <div style={{ flex: 1, minHeight: '300px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '12px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '11px' }}>
                        {compilationLogs.map((l, index) => (
                          <div key={index} style={{ marginBottom: '4px', color: 'var(--text-muted)' }}>{l}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {flowStage === 'dashboard' && profile && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
                      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--accent-green)', fontWeight: 'bold' }}>// DEPLOYED & COMPILED</span>
                        <h2 style={{ fontSize: '15px', fontWeight: 'bold', margin: '4px 0 0 0' }}>BLUEPRINT ATIVO</h2>
                      </div>

                      {/* COMPACT SUMMARY CARD */}
                      <div style={{ border: '1px solid var(--border-color)', padding: '12px', background: 'var(--bg-tertiary)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          <strong>Projeto:</strong> {profile.projectName.toUpperCase()}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          <strong>Arquitetura:</strong> {profile.architecture}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          <strong>Complexidade:</strong> {partialProfile?.complexity || 'Média'}
                        </div>
                      </div>

                      {/* PATH A: ZIP BOILERPLATE */}
                      <div className="console-panel" style={{ height: 'auto' }}>
                        <div className="panel-header">
                          <span className="panel-title">[ CAMINHO A: BOILERPLATE LOCAL ]</span>
                        </div>
                        <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            Gere e faça download de um pacote ZIP contendo a Constituição da arquitetura, ADRs e o esqueleto do código da stack configurada.
                          </p>
                          <button onClick={handleZipDownload} disabled={isZipping} className="tactical-btn primary" style={{ width: '100%', padding: '10px' }}>
                            {isZipping ? 'COMPACTANDO...' : '[ DOWNLOAD DO PROJETO COMPLETO (.ZIP) ]'}
                          </button>
                        </div>
                      </div>

                      {/* PATH B: COPILOT PROMPTS */}
                      {profile.aiPrompts && (
                        <div className="console-panel" style={{ height: 'auto' }}>
                          <div className="panel-header">
                            <span className="panel-title">[ CAMINHO B: EXPORTAR SUÍTE DE PROMPTS ]</span>
                          </div>
                          <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              Utilize estes prompts ordenados por etapas em assistentes de IA (como Cursor, Claude Code ou Lovable) para programar seu software mantendo a governança:
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {profile.aiPrompts.map((item, idx) => (
                                <div key={idx} style={{ border: '1px solid var(--border-color)', padding: '10px', background: 'var(--bg-primary)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <strong style={{ fontSize: '10px', color: 'var(--accent-blue)' }}>{item.step}</strong>
                                    <span style={{ fontSize: '8px', color: 'var(--accent-orange)' }}>{item.tool}</span>
                                  </div>
                                  <textarea 
                                    readOnly 
                                    value={item.prompt} 
                                    style={{ width: '100%', height: '55px', fontSize: '9px', fontFamily: 'monospace', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '4px', resize: 'none' }}
                                  />
                                  <button 
                                    className="tactical-btn"
                                    onClick={() => {
                                      navigator.clipboard.writeText(item.prompt);
                                      alert('Prompt copiado para a área de transferência!');
                                    }}
                                    style={{ width: '100%', padding: '3px', fontSize: '9px', marginTop: '4px' }}
                                  >
                                    [ COPIAR PROMPT ]
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* RIGHT CONTEXT: REAL-TIME EVOLVING WORKSPACE PANELS */}
                <div className="right-pane">
                  
                  {/* TAB NAVIGATION */}
                  <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '16px' }}>
                    <button className={`tactical-btn ${activeRightTab === 'domain' ? 'active' : ''}`} onClick={() => setActiveRightTab('domain')}>
                      [ DOMAIN & SPECS ]
                    </button>
                    <button className={`tactical-btn ${activeRightTab === 'topology' ? 'active' : ''}`} onClick={() => setActiveRightTab('topology')}>
                      [ MODULE TOPOLOGY ]
                    </button>
                    <button className={`tactical-btn ${activeRightTab === 'governance' ? 'active' : ''}`} onClick={() => setActiveRightTab('governance')}>
                      [ GOVERNANCE SPECS ]
                    </button>
                    <button className={`tactical-btn ${activeRightTab === 'drift' ? 'active' : ''}`} onClick={() => setActiveRightTab('drift')}>
                      [ DRIFT AUDITOR ]
                    </button>
                  </div>

                  {/* LOADING SCANNING OVERLAY BAR */}
                  {isAnalyzingRight && (
                    <div style={{ marginBottom: '10px', fontSize: '10px', color: 'var(--accent-orange)', fontFamily: 'monospace', animation: 'pulse 1.5s infinite' }}>
                      [ SCANNING ] ANALISANDO RESPOSTAS E ATUALIZANDO ARQUITETURA EM TEMPO REAL...
                    </div>
                  )}

                  {/* TAB 1: DOMAIN & SPECS */}
                  {activeRightTab === 'domain' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="console-panel" style={{ height: 'auto' }}>
                        <div className="panel-header">
                          <span className="panel-title">[ ENTENDIMENTO DO DOMÍNIO DE NEGÓCIO ]</span>
                        </div>
                        <div className="panel-content">
                          <p style={{ fontSize: '12px', lineHeight: '1.4', margin: 0, color: 'var(--text-secondary)' }}>
                            {partialProfile?.domainDescription || 'Descreva a sua ideia de software no chat para iniciar o mapeamento do domínio operacional...'}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        
                        {/* PERSONAS CARD */}
                        <div className="console-panel" style={{ height: 'auto' }}>
                          <div className="panel-header">
                            <span className="panel-title">[ PERSONAS MAPEADAS ]</span>
                          </div>
                          <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {partialProfile?.personas && partialProfile.personas.length > 0 ? (
                              partialProfile.personas.map((p: string, idx: number) => (
                                <div key={idx} style={{ fontSize: '11px', padding: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-blue)' }} />
                                  <span>{p}</span>
                                </div>
                              ))
                            ) : (
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Mapeando perfis de usuários...</span>
                            )}
                          </div>
                        </div>

                        {/* TECH STACK RECOMMENDATION CARD */}
                        <div className="console-panel" style={{ height: 'auto' }}>
                          <div className="panel-header">
                            <span className="panel-title">[ TECNOLOGIAS RECOMENDADAS ]</span>
                          </div>
                          <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {partialProfile?.suggestedTechs && partialProfile.suggestedTechs.length > 0 ? (
                              partialProfile.suggestedTechs.map((t: string, idx: number) => (
                                <div key={idx} style={{ fontSize: '11px', padding: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-orange)' }} />
                                  <span>{t}</span>
                                </div>
                              ))
                            ) : (
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Selecionando componentes ideais...</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* FEATURE CHECKLIST CARD */}
                      <div className="console-panel" style={{ height: 'auto' }}>
                        <div className="panel-header">
                          <span className="panel-title">[ REQUISITOS OPERACIONAIS DESCOBERTOS ]</span>
                        </div>
                        <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {partialProfile?.features && partialProfile.features.length > 0 ? (
                            partialProfile.features.map((f: string, idx: number) => (
                              <div key={idx} style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                <span>{f}</span>
                              </div>
                            ))
                          ) : (
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Extraindo funcionalidades em tempo real...</span>
                          )}
                        </div>
                      </div>

                      {/* COMPLEXITY AND RISKS */}
                      {partialProfile && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px' }}>
                          <div className="console-panel" style={{ height: 'auto' }}>
                            <div className="panel-header">
                              <span className="panel-title">[ ESTIMATIVA ]</span>
                            </div>
                            <div className="panel-content" style={{ textAlign: 'center' }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>COMPLEXIDADE</span>
                              <strong style={{ fontSize: '18px', color: 'var(--accent-orange)', display: 'block', margin: '4px 0' }}>
                                {partialProfile.complexity?.toUpperCase() || 'MÉDIA'}
                              </strong>
                              <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Trabalho estimado: 120-160h</span>
                            </div>
                          </div>

                          <div className="console-panel" style={{ height: 'auto' }}>
                            <div className="panel-header">
                              <span className="panel-title">[ RISCOS ARQUITETURAIS ]</span>
                            </div>
                            <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {partialProfile.risks?.map((r: string, idx: number) => (
                                <div key={idx} style={{ fontSize: '10px', color: 'var(--accent-red)' }}>
                                  [ RISK ] {r}
                                </div>
                              )) || <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Nenhum risco crítico identificado.</span>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: TOPOLOGY MAP */}
                  {activeRightTab === 'topology' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      
                      {/* GRAPH CONTAINER */}
                      <div className="console-panel" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
                        <div className="panel-header">
                          <span className="panel-title">[ TOPOLOGIA FÍSICA DOS MÓDULOS ]</span>
                        </div>
                        <div className="panel-content" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', position: 'relative' }}>
                          <svg width="100%" height="100%" style={{ minHeight: '300px' }}>
                            {(() => {
                              const mods = partialProfile?.modules || [];
                              if (mods.length === 0) {
                                return (
                                  <g>
                                    <circle cx="200" cy="150" r="10" fill="var(--accent-orange)" />
                                    <text x="200" y="180" fill="var(--text-muted)" fontSize="10" textAnchor="middle">AGUARDANDO MAPEAMENTO DE MÓDULOS...</text>
                                  </g>
                                );
                              }
                              return mods.map((m: any, idx: number) => {
                                const x = 80 + (idx % 3) * 160;
                                const y = 80 + Math.floor(idx / 3) * 120;
                                return (
                                  <g key={idx}>
                                    {idx > 0 && (
                                      <line 
                                        x1={80 + ((idx - 1) % 3) * 160} 
                                        y1={80 + Math.floor((idx - 1) / 3) * 120} 
                                        x2={x} 
                                        y2={y} 
                                        stroke="var(--border-color)" 
                                        strokeWidth="1.5" 
                                        strokeDasharray="4"
                                      />
                                    )}
                                    <rect x={x - 60} y={y - 20} width="120" height="40" stroke="var(--accent-blue)" strokeWidth="1.5" fill="var(--bg-secondary)" />
                                    <text x={x} y={y + 4} fill="var(--accent-blue)" fontSize="9" textAnchor="middle" fontWeight="bold">{m.name.toUpperCase()}</text>
                                    <text x={x} y={y + 35} fill="var(--text-muted)" fontSize="8" textAnchor="middle">{m.purpose.substring(0, 24)}...</text>
                                  </g>
                                );
                              });
                            })()}
                          </svg>
                        </div>
                      </div>

                      {/* ENTITIES MAP */}
                      <div className="console-panel" style={{ height: 'auto' }}>
                        <div className="panel-header">
                          <span className="panel-title">[ ENTIDADES & RELACIONAMENTOS ]</span>
                        </div>
                        <div className="panel-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          {partialProfile?.entities && partialProfile.entities.length > 0 ? (
                            partialProfile.entities.map((e: string, idx: number) => (
                              <div key={idx} style={{ padding: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', fontFamily: 'monospace', fontSize: '10px' }}>
                                <strong style={{ color: 'var(--accent-blue)' }}>{e.split(':')[0]}</strong>
                                <span style={{ display: 'block', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                  {e.split(':')[1] || 'Campos associados'}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Mapeando estrutura lógica de entidades...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: GOVERNANCE */}
                  {activeRightTab === 'governance' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {profile ? (
                        <>
                          {/* CONSTITUTION CARD */}
                          <div className="console-panel" style={{ height: 'auto' }}>
                            <div className="panel-header">
                              <span className="panel-title">[ CONSTITUTION: ARCHITECTURAL LAWS ]</span>
                            </div>
                            <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {profile.constitution.map((c, idx) => (
                                <div key={idx} style={{ border: '1px solid var(--border-color)', padding: '12px', background: 'var(--bg-tertiary)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <strong style={{ fontSize: '11px', color: 'var(--accent-orange)' }}>{c.rule}</strong>
                                    <span style={{
                                      fontSize: '8px', padding: '2px 6px', border: '1px solid',
                                      borderColor: c.severity === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-orange)',
                                      color: c.severity === 'CRITICAL' ? 'var(--accent-red)' : 'var(--accent-orange)'
                                    }}>
                                      {c.severity}
                                    </span>
                                  </div>
                                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>{c.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* ADR CARD */}
                          <div className="console-panel" style={{ height: 'auto' }}>
                            <div className="panel-header">
                              <span className="panel-title">[ ARCHITECTURE DECISION RECORDS (ADR) ]</span>
                            </div>
                            <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {profile.adrs.map((a, idx) => (
                                <div key={idx} style={{ border: '1px solid var(--border-color)', padding: '12px', background: 'var(--bg-tertiary)' }}>
                                  <strong style={{ fontSize: '12px', color: 'var(--accent-blue)', display: 'block', marginBottom: '6px' }}>
                                    {a.id}: {a.title}
                                  </strong>
                                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    <span><strong>Contexto:</strong> {a.context}</span>
                                    <span><strong>Decisão:</strong> {a.decision}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>
                          Status: Blueprint não compilado. Aguardando conclusão da entrevista.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: DRIFT AUDITOR */}
                  {activeRightTab === 'drift' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {profile ? (
                        <>
                          <div className="console-panel" style={{ height: 'auto' }}>
                            <div className="panel-header">
                              <span className="panel-title">[ REAL-TIME SOURCE DRIFT DETECTOR ]</span>
                              <span style={{
                                color: driftStatus === 'drift' ? 'var(--accent-orange)' : 'var(--accent-green)',
                                fontWeight: 'bold'
                              }}>
                                {driftStatus === 'drift' ? '[ DRIFT_ACTIVE ]' : '[ SYNC_CLEAN ]'}
                              </span>
                            </div>
                            <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                                O daemon de auditoria detectou desvio de código contra a Constitution em: <strong>{profile.driftFile}</strong>
                              </p>
                              
                              {/* CODE BOX */}
                              <div style={{ border: '1px solid var(--border-color)', background: 'var(--bg-primary)', padding: '12px', fontFamily: 'monospace', fontSize: '10px', color: 'var(--text-secondary)', overflowX: 'auto', whiteSpace: 'pre' }}>
                                {driftStatus === 'drift' ? profile.driftPhysical : profile.driftResolved}
                              </div>

                              {driftStatus === 'drift' && (
                                <button onClick={resolveDrift} className="tactical-btn primary" style={{ width: '100%', padding: '10px', borderColor: 'var(--accent-orange)', color: 'var(--accent-orange)' }}>
                                  [ EXECUTAR REFATORAÇÃO FÍSICA E CORRIGIR DRIFT ]
                                </button>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>
                          Status: Auditor inativo. Aguardando compilação do Blueprint.
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>

            </div>
          )}

        </>
      )}
    </div>
  );
}
