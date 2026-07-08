'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';

// TYPES DEFINITIONS
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
}

// DETERMINISTIC COGNITIVE ARCHITECT COMPILER ENGINE
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
        { name: 'rust-core', type: 'ingress', dependencies: [], purpose: 'Encapsulates core domain entities and business operations.', allowedEgress: [] },
        { name: 'actix-server', type: 'logic', dependencies: ['rust-core', 'db-adapter'], purpose: 'Handles HTTP requests and serves REST endpoints.', allowedEgress: ['rust-core', 'db-adapter'] },
        { name: 'db-adapter', type: 'database', dependencies: ['rust-core'], purpose: 'Implements Postgres repository port via SQLx async driver.', allowedEgress: ['rust-core'] },
        { name: 'auth-mw', type: 'auth', dependencies: [], purpose: 'Intercepts requests and verifies JWT authorization claims.', allowedEgress: [] }
      ],
      constitution: [
        { rule: 'AES-RUST-01', severity: 'CRITICAL', description: 'Zero unhandled result.unwrap() or option.unwrap(). Error propagation via Result mapping is mandatory.' },
        { rule: 'AES-RUST-02', severity: 'HIGH', description: 'All database calls must utilize sqlx::query! macros for static query type validation.' },
        { rule: 'AES-RUST-03', severity: 'MEDIUM', description: 'Compiler warnings strictly enforced. Deny standard cargo clippy lints.' }
      ],
      adrs: [
        {
          id: 'ADR-001',
          title: 'Decentralized Domain Models with SQLx repository decoupling',
          status: 'ACCEPTED',
          context: 'Our system requires high-fidelity type safety and runtime resilience.',
          decision: 'Utilize SQLx repository adapters to split raw sql queries from clean domain business definitions.',
          consequence: 'Compile-time checked queries prevent runtime database integration regressions.'
        },
        {
          id: 'ADR-002',
          title: 'Concurrency mapping with Tokio Multi-threaded runtime scheduler',
          status: 'ACCEPTED',
          context: 'High-throughput requests must be handled without blocking main compute threads.',
          decision: 'Implement tokio-async thread scheduler in core microservice modules.',
          consequence: 'Optimizes thread distribution across server execution cores.'
        }
      ],
      backlog: [
        { id: 'US-101', title: 'Scaffold Actix Monorepo & Cargo Workspace bounds', type: 'CHORE', description: 'Set up base workspace configuration, install dependencies, and define module dependency trees.', priority: 'HIGH', estimate: 3 },
        { id: 'US-102', title: 'Implement Auth middleware via JWT and Claims verification', type: 'FEATURE', description: 'Configure secure token decoding and inject actor context metadata in requests.', priority: 'HIGH', estimate: 5 },
        { id: 'US-103', title: 'Setup SQLx Async connection pool adapter', type: 'FEATURE', description: 'Establish Postgres client connections and configure runtime pool boundaries.', priority: 'MEDIUM', estimate: 5 },
        { id: 'US-104', title: 'Implement transactional egress interfaces', type: 'FEATURE', description: 'Create domain adapters to transmit messages securely.', priority: 'MEDIUM', estimate: 8 }
      ],
      roadmap: [
        { id: 'S-1', name: 'Sprint 01: Core Scaffolding', goal: 'Establish Cargo workspace structure and setup JWT validations.', tasks: ['US-101', 'US-102'], risk: 'Low integration risk.' },
        { id: 'S-2', name: 'Sprint 02: Storage Invariants', goal: 'Establish connection pools and deploy initial entities schemas.', tasks: ['US-103'], risk: 'Medium risk: database migrations validation.' },
        { id: 'S-3', name: 'Sprint 03: Integration Gateways', goal: 'Scaffold egress micro-handlers and wire domains.', tasks: ['US-104'], risk: 'Low risk.' }
      ],
      driftFile: 'src/db/user_repo.rs',
      driftContract: `// IUserRepo - Domain Interface Invariant
pub trait UserRepo {
    fn find_by_id(&self, id: &str) -> Result<Option<User>, DbError>;
    fn save(&self, user: &User) -> Result<(), DbError>;
}`,
      driftPhysical: `use std::fmt::format;

// VIOLATION of AES-RUST-02: Direct raw query formatting bypassing parameters binding
pub fn unsafe_find_user(db_url: &str, id: &str) -> String {
    format!("SELECT * FROM users WHERE id = '{}';", id) // Drift Detected!
}`,
      driftResolved: `use sqlx::PgPool;

pub struct PostgresUserRepo {
    pub pool: PgPool,
}

impl UserRepo for PostgresUserRepo {
    async fn find_by_id(&self, id: &str) -> Result<Option<User>, DbError> {
        let user = sqlx::query_as!(User, "SELECT * FROM users WHERE id = $1", id)
            .fetch_optional(&self.pool)
            .await?;
        Ok(user)
    }
    
    async fn save(&self, user: &User) -> Result<(), DbError> {
        sqlx::query!("INSERT INTO users (id, name) VALUES ($1, $2)", user.id, user.name)
            .execute(&self.pool)
            .await?;
        Ok(())
    }
}`,
      rfcProposal: {
        id: 'RFC-303',
        title: 'Integrate tokio-postgres connection pooling parameter tunings',
        status: 'PENDING_APPROVAL',
        impactScore: '+150 Engineering Score',
        risk: 'LOW (Requires dry-run staging)',
        details: 'Configures maximum connection life timers and sets concurrent active statements boundaries.'
      }
    };
  }

  if (stack === 'go-fiber') {
    return {
      projectName: normalizedName,
      stack: 'go-fiber',
      stackLabel: 'Go (Fiber) & Pgx Microservices',
      description,
      idea,
      answers,
      architecture: 'Clean Architecture with Modular Domain Boundaries',
      modules: [
        { name: 'gateway', type: 'ingress', dependencies: ['user-service', 'billing-service'], purpose: 'HTTP proxy routing requests to target microservices.', allowedEgress: ['user-service', 'billing-service'] },
        { name: 'user-service', type: 'logic', dependencies: ['database'], purpose: 'Maintains user accounts profiles and credentials records.', allowedEgress: ['database'] },
        { name: 'billing-service', type: 'logic', dependencies: ['database'], purpose: 'Handles payments validation and stripe integrations.', allowedEgress: ['database'] },
        { name: 'database', type: 'database', dependencies: [], purpose: 'Establishes pgx-based connection pools.', allowedEgress: [] }
      ],
      constitution: [
        { rule: 'AES-GO-01', severity: 'CRITICAL', description: 'Strict context propagation (context.Context) across all DB queries and internal service invocations.' },
        { rule: 'AES-GO-02', severity: 'HIGH', description: 'No unbounded go routine spawn. Goroutines must be monitored via WaitGroups or worker pools.' },
        { rule: 'AES-GO-03', severity: 'MEDIUM', description: 'Packages must satisfy Acyclic Dependencies rules. Circular module imports are prohibited.' }
      ],
      adrs: [
        {
          id: 'ADR-001',
          title: 'Adopt Go Fiber router to enable fast-http memory maps',
          status: 'ACCEPTED',
          context: 'Our gateway needs to resolve routing maps with low allocation rates.',
          decision: 'Deploy Fiber framework due to Express-like simplicity and fasthttp zero-allocation throughput.',
          consequence: 'Gateway CPU usage decreases by 30% compared to default net/http routes.'
        },
        {
          id: 'ADR-002',
          title: 'Implement database connectivity via pgx pool package',
          status: 'ACCEPTED',
          context: 'High database read/write concurrency calls require robust pool allocation.',
          decision: 'Adopt jackc/pgx/v5 driver instead of standard lib/pq due to context tracing integrations.',
          consequence: 'Database spans transmit metrics to standard telemetry outputs.'
        }
      ],
      backlog: [
        { id: 'US-101', title: 'Setup Go Workspaces config and module boundaries', type: 'CHORE', description: 'Initialize go.work, define relative local dependencies, and write Dockerfiles.', priority: 'HIGH', estimate: 3 },
        { id: 'US-102', title: 'Scaffold Fiber HTTP Gateway and router setup', type: 'FEATURE', description: 'Configure global proxy routing, CORS validations, and rate-limiting limits.', priority: 'HIGH', estimate: 5 },
        { id: 'US-103', title: 'Establish pgx connection pools and SQL migrations pipeline', type: 'FEATURE', description: 'Implement database connectivity modules and run initial table schemas.', priority: 'MEDIUM', estimate: 5 },
        { id: 'US-104', title: 'Implement context propagation in repository layers', type: 'FEATURE', description: 'Configure active tracers and append correlation tokens into SQL queries.', priority: 'MEDIUM', estimate: 5 }
      ],
      roadmap: [
        { id: 'S-1', name: 'Sprint 01: Gateway Setup', goal: 'Scaffold workspace structures, gateway routes and request limits.', tasks: ['US-101', 'US-102'], risk: 'Low risk.' },
        { id: 'S-2', name: 'Sprint 02: Storage Mappings', goal: 'Establish postgres connections and execute clean sql files.', tasks: ['US-103'], risk: 'Medium risk: database connection parameters.' },
        { id: 'S-3', name: 'Sprint 03: Telemetry Tracing', goal: 'Wire contexts and trace queries across modules.', tasks: ['US-104'], risk: 'Low risk.' }
      ],
      driftFile: 'services/user/db.go',
      driftContract: `// UserRepository Interface - Strict Context Propagation
type UserRepository interface {
    FindByID(ctx context.Context, id string) (*User, error)
    Save(ctx context.Context, user *User) error
}`,
      driftPhysical: `package user

// VIOLATION of AES-GO-01: Global database state call without context tracer propagation
var DBConn *sql.DB

func GetUserByIDRaw(id string) *User {
    row := DBConn.QueryRow("SELECT name FROM users WHERE id = " + id) // Drift Detected!
    return row
}`,
      driftResolved: `package user

import (
	"context"
	"database/sql"
	"github.com/jmoiron/sqlx"
)

type SqlxUserRepository struct {
    DB *sqlx.DB
}

func (r *SqlxUserRepository) FindByID(ctx context.Context, id string) (*User, error) {
    var user User
    err := r.DB.GetContext(ctx, &user, "SELECT * FROM users WHERE id = $1", id)
    if err != nil {
        return nil, err
    }
    return &user, nil
}

func (r *SqlxUserRepository) Save(ctx context.Context, user *User) error {
    _, err := r.DB.ExecContext(ctx, "INSERT INTO users (id, name) VALUES ($1, $2)", user.ID, user.Name)
    return err
}`,
      rfcProposal: {
        id: 'RFC-702',
        title: 'Adopt gRPC transport layers for communication between internal services',
        status: 'PENDING_APPROVAL',
        impactScore: '+180 Engineering Score',
        risk: 'MEDIUM (Requires proto compiler setup)',
        details: 'Replaces REST-based internal calls with type-safe protobuf definitions and HTTP/2 multiplexing.'
      }
    };
  }

  // DEFAULT: nextjs-fastify
  return {
    projectName: normalizedName,
    stack: 'nextjs-fastify',
    stackLabel: 'Next.js 15 & Fastify Backend',
    description,
    idea,
    answers,
    architecture: 'Layered Hexagonal Architecture (Domain-Driven Design)',
    modules: [
      { name: 'web-portal', type: 'ingress', dependencies: ['api-gateway'], purpose: 'Next.js Frontend UI layout and interactive views.', allowedEgress: ['api-gateway'] },
      { name: 'api-gateway', type: 'logic', dependencies: ['auth-service', 'core-api'], purpose: 'Fastify endpoint router routing active request calls.', allowedEgress: ['auth-service', 'core-api'] },
      { name: 'auth-service', type: 'auth', dependencies: [], purpose: 'Maintains user logins sessions, verify JWT credentials.', allowedEgress: [] },
      { name: 'core-api', type: 'database', dependencies: [], purpose: 'Maintains database records, executes prisma read-writes.', allowedEgress: [] }
    ],
    constitution: [
      { rule: 'AES-GATE-01', severity: 'CRITICAL', description: 'No raw database queries or direct pg pools inside Next.js Server Components. DB calls must use core-api service.' },
      { rule: 'AES-GATE-02', severity: 'HIGH', description: 'All api gateway requests/responses schemas must be strictly validated using Zod models.' },
      { rule: 'AES-GATE-03', severity: 'MEDIUM', description: 'Global error boundaries must be implemented at all route endpoints.' }
    ],
    adrs: [
      {
        id: 'ADR-001',
        title: 'Use Next.js Server Components with Fastify decoupled API engine',
        status: 'ACCEPTED',
        context: 'We require fast client-side hydration alongside complex backend computations.',
        decision: 'Use Next.js for page layouts rendering and Fastify for REST/websocket performance APIs.',
        consequence: 'Separates visual rendering from high-frequency backend operations.'
      },
      {
        id: 'ADR-002',
        title: 'Adopt Prisma ORM with connection pooling limits',
        status: 'ACCEPTED',
        context: 'Multiple client threads accessing databases require connection pooling.',
        decision: 'Deploy Prisma client and handle pooling via pgpool parameters.',
        consequence: 'Type-safe database definitions mapped directly from local schemas.'
      }
    ],
    backlog: [
      { id: 'US-101', title: 'Setup NX Monorepo Workspace and module limits', type: 'CHORE', description: 'Setup monorepo configuration, packages boundaries, and eslint configurations.', priority: 'HIGH', estimate: 3 },
      { id: 'US-102', title: 'Implement Auth authentication controller via JWT tokens', type: 'FEATURE', description: 'Configure token verification and session encryption variables.', priority: 'HIGH', estimate: 5 },
      { id: 'US-103', title: 'Setup Prisma schemas definitions and initial seeds', type: 'FEATURE', description: 'Establish Postgres schemas models and run initial database migrations.', priority: 'MEDIUM', estimate: 5 },
      { id: 'US-104', title: 'Setup Fastify gateway router for user requests mapping', type: 'FEATURE', description: 'Establish API gateway boundaries and schema validators.', priority: 'MEDIUM', estimate: 5 }
    ],
    roadmap: [
      { id: 'S-1', name: 'Sprint 01: Core Scaffolding', goal: 'Setup monorepo structure, package limits, and JWT auth flow.', tasks: ['US-101', 'US-102'], risk: 'Low risk.' },
      { id: 'S-2', name: 'Sprint 02: Storage Setup', goal: 'Establish connection strings and load prisma definitions.', tasks: ['US-103'], risk: 'Medium risk: Prisma migration validations.' },
      { id: 'S-3', name: 'Sprint 03: Fastify Gateway', goal: 'Build routing interfaces and deploy core endpoints.', tasks: ['US-104'], risk: 'Low risk.' }
    ],
    driftFile: 'apps/web/src/repositories/UserRepository.ts',
    driftContract: `// IUserRepository - Core Contract Invariant
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}`,
    driftPhysical: `import { pg } from '../lib/db';

// VIOLATION of AES-GATE-01: Direct raw query bypassing repository patterns
export function executeRawQuery(sql: string) {
  return pg.query(sql); // Drift Detected!
}`,
    driftResolved: `import { supabase } from '../lib/supabase';

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error || !data) return null;
    return data as User;
  }
  
  async save(user: User): Promise<void> {
    await supabase.from('users').upsert(user);
  }
}`,
    rfcProposal: {
      id: 'RFC-202',
      title: 'Migrate DB Access layers to Prisma-Next Integration',
      status: 'PENDING_APPROVAL',
      impactScore: '+120 Engineering Score',
      risk: 'LOW (Tested in Sandbox)',
      details: 'Converts legacy Knex file queries to type-safe Prisma client actions and maps model schemas.'
    }
  };
};

export default function Page() {
  // CONFIG & THEME
  const [isDark, setIsDark] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<'monitor' | 'blueprint' | 'audit' | 'radar' | 'assets'>('monitor');
  const [activeAssetSubTab, setActiveAssetSubTab] = useState<'constitution' | 'adr' | 'backlog' | 'roadmap'>('constitution');

  // INPUTS
  const [projectName, setProjectName] = useState('atlas-monorepo');
  const [projectStack, setProjectStack] = useState('nextjs-fastify');
  const [projectDesc, setProjectDesc] = useState('AI-Powered software development OS');
  const [projectIdea, setProjectIdea] = useState('');

  // STATE MACHINE FLOWS
  const [flowStage, setFlowStage] = useState<'wizard' | 'interview' | 'compiling' | 'dashboard'>('wizard');
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [dirHandle, setDirHandle] = useState<any | null>(null);

  // AUTH STATES
  const [user, setUser] = useState<any | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // INTERVIEW STAGE STATE
  const [chatMessages, setChatMessages] = useState<{ sender: 'ai' | 'user'; text: string }[]>([]);
  const [userAnswerInput, setUserAnswerInput] = useState('');
  const [interviewStep, setInterviewStep] = useState(0);
  const [projectAnswers, setProjectAnswers] = useState<{ [key: string]: string }>({});

  // COMPILING STAGE STATE
  const [compilationProgress, setCompilationProgress] = useState(0);
  const [compilationLogs, setCompilationLogs] = useState<string[]>([]);

  // DYNAMIC ARCHITECTURE INSTANCE DATA
  const [profile, setProfile] = useState<ProjectProfile | null>(null);
  
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
    // Check active session on load
    const checkSession = async () => {
      if (typeof window !== 'undefined' && window.localStorage.getItem('atlas_e2e_mock_user')) {
        setUser({ email: 'test-user@atlas.dev', user_metadata: { name: 'E2E Tester' } });
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
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
    } else {
      root.classList.add('theme-light');
    }
  }, [isDark]);

  // SYSTEM LOG TIMER TICK
  useEffect(() => {
    if (flowStage !== 'dashboard' || !profile) return;

    const addLog = (tag: 'SYS' | 'MAESTRO' | 'AUDIT' | 'EVOLUTION' | 'SUPABASE', text: string, type: 'info' | 'warn' | 'success' | 'err') => {
      const now = new Date().toLocaleTimeString();
      setLogs((prev) => [...prev, { time: now, tag, text, type }]);
    };

    const interval = setInterval(() => {
      const logTemplates: Omit<LogItem, 'time'>[] = [
        { tag: 'MAESTRO', text: `Agent [DevBackend] writing logic components in: ${profile.driftFile}`, type: 'info' },
        { tag: 'AUDIT', text: `AST scan of module boundaries completed. Compliant.`, type: 'success' },
        { tag: 'MAESTRO', text: 'Agent [SecAuditor] running security invariants check...', type: 'info' },
        { tag: 'SUPABASE', text: 'Telemetry metrics reported to Supabase DB registry.', type: 'success' },
      ];

      if (driftStatus === 'drift') {
        logTemplates.push({ tag: 'AUDIT', text: `Warning: Code drift detected in file: ${profile.driftFile}`, type: 'warn' });
      }

      const chosen = logTemplates[Math.floor(Math.random() * logTemplates.length)] || { tag: 'MAESTRO', text: 'Cognitive loop tick.', type: 'info' };
      const now = new Date().toLocaleTimeString();
      setLogs((prev) => [...prev, { time: now, ...chosen }]);

      // Progress active tasks
      setActiveTasks((prevTasks) => 
        prevTasks.map((t) => {
          if (t.status === 'RUNNING') {
            const nextProgress = t.progress + Math.floor(Math.random() * 15);
            return {
              ...t,
              progress: nextProgress >= 100 ? 100 : nextProgress,
              status: nextProgress >= 100 ? 'COMPLETED' : 'RUNNING'
            };
          } else if (t.status === 'COMPLETED' && Math.random() > 0.8) {
            return { ...t, status: 'RUNNING', progress: 0 };
          }
          return t;
        })
      );

    }, 5000);

    return () => clearInterval(interval);
  }, [flowStage, profile, driftStatus]);

  // INTRODUCING QUICK PRE-FILL SUGGESTIONS
  const handlePreFill = (type: 'ai' | 'fintech' | 'game') => {
    if (type === 'ai') {
      setProjectName('ai-prompt-studio');
      setProjectStack('nextjs-fastify');
      setProjectDesc('Interactive platform to design, version, and share custom system prompts.');
      setProjectIdea('Crie um estúdio de prompt para equipes de engenharia de IA, com controle de versão de prompts, templates compartilháveis, injeção de variáveis de contexto e validação de tokens antes do envio ao modelo.');
    } else if (type === 'fintech') {
      setProjectName('ledger-microservice');
      setProjectStack('rust-actix');
      setProjectDesc('High-throughput double-entry accounting ledger API.');
      setProjectIdea('Crie uma API financeira robusta com contabilidade de dupla entrada, transações imutáveis com validações rígidas de saldo, controle de concorrência distribuída e relatórios de fluxo de caixa em tempo real.');
    } else if (type === 'game') {
      setProjectName('multiplayer-lobby');
      setProjectStack('go-fiber');
      setProjectDesc('Lobby coordinator and matchmaker backend.');
      setProjectIdea('Crie um backend de gerenciamento de salas multiplayer com matchmaking por latência de conexão, registro de sessões de jogos ativas, persistência de pontuações no banco e conexões via websockets rápidas.');
    }
  };

  // STEP 1: START COGNITIVE ALIGNMENT (TRANSITION TO INTERVIEW)
  const startAlignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectIdea.trim()) {
      alert('Por favor, descreva a ideia do seu software para que a IA inicie o alinhamento.');
      return;
    }

    setFlowStage('interview');
    
    // Seed initial message based on user stack
    let firstQuestion = '';
    if (projectStack === 'rust-actix') {
      firstQuestion = 'Compreendi a ideia. Para estruturar o backend em Rust, qual driver de acesso ao banco você prefere? SQLx para queries estáticas validadas em tempo de compilação ou Diesel como ORM estruturado? Justifique a escolha para o Blueprint.';
    } else if (projectStack === 'go-fiber') {
      firstQuestion = 'Entendido. Para gerenciar a concorrência dos usuários no servidor Go, como deseja propagar os identificadores de tracing? Passando explicitamente o context.Context em todas as chamadas de banco ou usando uma camada customizada de interceptação?';
    } else {
      firstQuestion = 'Perfeito. Para a arquitetura Next.js & Fastify, como as tarefas demoradas (como geração de relatórios ou processamento pesado) devem ser executadas? De forma síncrona diretamente nas rotas da API ou delegadas para filas de tarefas assíncronas (ex: BullMQ/Redis)?';
    }

    setChatMessages([
      { sender: 'ai', text: `Iniciando Alinhamento Cognitivo com Arquiteto do Atlas. Analisando stack [${projectStack.toUpperCase()}] para a sua ideia: "${projectIdea}"` },
      { sender: 'ai', text: firstQuestion }
    ]);
    setInterviewStep(1);
  };

  // STEP 2: HANDLE CHAT RESPONSE
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswerInput.trim()) return;

    const userText = userAnswerInput.trim();
    const updatedMessages = [...chatMessages, { sender: 'user' as const, text: userText }];
    setChatMessages(updatedMessages);
    setUserAnswerInput('');

    // Format chat messages for NVIDIA LLM API route
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
        const reply = data.reply;
        
        if (reply.includes('CONVERT_TO_COMPILER_NOW')) {
          setChatMessages((prev) => [
            ...prev,
            { sender: 'ai', text: 'Todas as diretrizes foram compiladas. Alinhamento de engenharia concluído com sucesso!' },
            { sender: 'ai', text: 'Iniciando compilador de Blueprints...' }
          ]);
          setTimeout(() => {
            triggerCompilation();
          }, 1500);
        } else {
          setChatMessages((prev) => [
            ...prev,
            { sender: 'ai', text: reply }
          ]);
          // Stash answers locally
          if (interviewStep === 1) {
            setProjectAnswers((prev) => ({ ...prev, q1: userText }));
            setInterviewStep(2);
          } else {
            setProjectAnswers((prev) => ({ ...prev, q2: userText }));
          }
        }
      } else {
        throw new Error('API route failure');
      }
    } catch (e: any) {
      alert('Erro na API da NVIDIA: ' + e.message);
      setFlowStage('wizard');
    }
  };

  // STEP 3: RUN COMPILER PROGRESS SYSTEM
  const triggerCompilation = () => {
    setFlowStage('compiling');
    setCompilationProgress(0);
    setCompilationLogs([]);

    const steps = [
      { text: 'Analyzing user architectural answers...', pct: 10 },
      { text: 'Selecting design patterns: Hexagonal modularity boundaries.', pct: 25 },
      { text: 'Compiling System Blueprint contracts (blueprint.json)...', pct: 40 },
      { text: 'Generating Quality Gates & Constitution rules (constitution.md)...', pct: 55 },
      { text: 'Writing Architecture Decision Records (ADRs)...', pct: 70 },
      { text: 'Translating requirements into Sprints and Backlog stories...', pct: 85 },
      { text: 'Pushing metadata profiles to Supabase remote database...', pct: 95 },
      { text: 'System Blueprint built successfully. Invariants Active.', pct: 100 }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const active = steps[currentStep];
        if (active) {
          setCompilationProgress(active.pct);
          setCompilationLogs((prev) => [...prev, `[COMPILER] ${active.text}`]);
          
          if (active.pct === 95) {
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
            projectDesc,
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
          alert('Erro de Compilação do Blueprint na NVIDIA: ' + err.message);
          setFlowStage('wizard');
        })
        .finally(() => {
          setFlowStage('dashboard');
          setHasInitialized(true);
        });
      }
    }, 600);
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

  // DRIFT RESOLUTION ACTIONS
  const resolveDrift = async () => {
    if (!profile) return;
    const now = new Date().toLocaleTimeString();
    
    // Add logs
    setLogs((prev) => [
      ...prev,
      { time: now, tag: 'AUDIT', text: `Running AST refactor engine on physical file ${profile.driftFile}...`, type: 'info' }
    ]);

    const cleanResolvedCode = `import { supabase } from '../lib/supabase';\n\nexport class UserRepository implements IUserRepository {\n  async findById(id: string): Promise<User | null> {\n    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();\n    if (error || !data) return null;\n    return data as User;\n  }\n  async save(user: User): Promise<void> {\n    await supabase.from('users').upsert(user);\n  }\n}\n`;

    try {
      if (dirHandle) {
        await writeLocalWorkspaceFile(dirHandle, 'packages/core/src/db/raw-query.ts', cleanResolvedCode);
        setProfile((prev) => prev ? { ...prev, driftPhysical: cleanResolvedCode } : null);
      } else {
        const res = await fetch('/api/audit', { method: 'POST' });
        if (res.ok) {
          const auditRes = await fetch('/api/audit');
          if (auditRes.ok) {
            const auditData = await auditRes.json();
            setProfile((prev) => prev ? { ...prev, driftPhysical: auditData.physicalCode } : null);
          }
        }
      }
    } catch (e) {
      console.warn('API bypass for drift resolution:', e);
    }

    setTimeout(() => {
      const now2 = new Date().toLocaleTimeString();
      setLogs((prev) => [
        ...prev,
        { time: now2, tag: 'AUDIT', text: `Refactor Complete. Rewrote physical file to comply with IUserRepository rules.`, type: 'success' },
        { time: now2, tag: 'SYS', text: `Drifts resolved. Integrity Check passes.`, type: 'success' }
      ]);
      setDriftStatus('clean');
      setScore(1000);
    }, 2000);
  };

  // RUN EVOLUTION RFC MIGRATION
  const runRfcMigration = () => {
    if (!profile) return;
    const now = new Date().toLocaleTimeString();
    setEvolutionRfcStatus('EXECUTING');
    
    setLogs((prev) => [
      ...prev,
      { time: now, tag: 'EVOLUTION', text: `Executing migration script for ${profile.rfcProposal.id} (${profile.rfcProposal.title})...`, type: 'info' }
    ]);

    setTimeout(() => {
      const now2 = new Date().toLocaleTimeString();
      setLogs((prev) => [
        ...prev,
        { time: now2, tag: 'EVOLUTION', text: `Migration container compiled successfully. Model schemas updated.`, type: 'success' },
        { time: now2, tag: 'SYS', text: `System Architecture updated to new standard.`, type: 'success' }
      ]);
      setEvolutionRfcStatus('EXECUTED');
      setScore((s) => Math.min(s + 150, 1000));
    }, 3000);
  };

  // RESET WORKSPACE METHOD
  const resetWorkspace = () => {
    setFlowStage('wizard');
    setHasInitialized(false);
    setProjectAnswers({});
    setInterviewStep(0);
    setChatMessages([]);
    setProfile(null);
    setDriftStatus('drift');
    setScore(820);
    setEvolutionRfcStatus('PENDING_APPROVAL');
  };

  // FILE EXPORT UTILITY
  const exportFile = (filename: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // DOWNLOAD ENTIRE PROJECT BLUEPRINT ZIP
  const downloadCompleteProjectZip = async () => {
    if (!profile) return;
    setIsZipping(true);
    try {
      const JSZip = await new Promise<any>((resolve, reject) => {
        if ((window as any).JSZip) {
          resolve((window as any).JSZip);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        script.onload = () => resolve((window as any).JSZip);
        script.onerror = () => reject(new Error('Failed to load JSZip from CDN'));
        document.body.appendChild(script);
      });

      const zip = new JSZip();

      // 1. Documentation
      zip.file('Constitution.md', `# Project Architecture Constitution\n# Workspace: ${profile.projectName}\n\n1. Core Architectural Constraints\n- Modularity Type: ${profile.architecture}\n- Execution Stack: ${profile.stackLabel}\n\n2. Invariant Gates\n` + profile.constitution.map((c, i) => `${i+1}. [${c.rule}] - Severity: ${c.severity}\n   Rule: ${c.description}`).join('\n\n'));
      
      zip.file('ADRs.md', profile.adrs.map(a => `# ${a.id}: ${a.title}\n\n**Status:** ${a.status}\n\n**Context:** ${a.context}\n\n**Decision:** ${a.decision}\n\n**Consequence:** ${a.consequence}`).join('\n\n'));
      
      zip.file('backlog.json', JSON.stringify(profile.backlog, null, 2));
      zip.file('roadmap.json', JSON.stringify(profile.roadmap, null, 2));

      // 2. Source & Stack Specific Boilerplate
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

  return (
    <div className="crt-flicker" style={{ width: '100vw', height: '100vh', position: 'relative' }}>
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

              <div style={{ textAlign: 'center', fontSize: '11px', marginTop: '8px' }}>
                {authMode === 'login' ? (
                  <span>Não tem conta? <button className="tactical-btn" onClick={() => setAuthMode('signup')} style={{ border: 0, padding: 0, color: 'var(--accent-blue)', background: 'transparent', textDecoration: 'underline', cursor: 'pointer' }}>Cadastre-se</button></span>
                ) : (
                  <span>Já tem conta? <button className="tactical-btn" onClick={() => setAuthMode('login')} style={{ border: 0, padding: 0, color: 'var(--accent-blue)', background: 'transparent', textDecoration: 'underline', cursor: 'pointer' }}>Fazer Login</button></span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {user && (
        <>

      {/* 1. INITIAL WIZARD SCREEN */}
      {flowStage === 'wizard' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px'
        }}>
          <div className="console-panel" style={{ width: '100%', maxWidth: '720px', height: 'auto' }}>
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="panel-title">[ BOOTSTRAP: CONNECTED ]</span>
              <button onClick={handleLogout} className="tactical-btn" style={{ padding: '2px 8px', fontSize: '9px', borderColor: 'var(--accent-red)', color: 'var(--accent-red)', cursor: 'pointer', background: 'transparent' }}>
                [ LOGOUT ]
              </button>
            </div>
            
            <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 6px 0', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  // INITIALIZE ARCHITECTURAL COMPILER
                </h1>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                  Insira o conceito de software. O Atlas guiará você em um alinhamento interativo para compilar o Blueprint de governança física e lógica do projeto.
                </p>
              </div>

              {/* PRE-FILL WOW SUGGESTIONS */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '10px' }}>
                <span style={{ color: 'var(--text-muted)', alignSelf: 'center', marginRight: '4px' }}>EXEMPLOS RÁPIDOS:</span>
                <button className="tactical-btn" onClick={() => handlePreFill('ai')}>
                  [ <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px', verticalAlign: 'middle', display: 'inline-block' }}><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg> AI Prompting Studio ]
                </button>
                <button className="tactical-btn" onClick={() => handlePreFill('fintech')}>
                  [ <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px', verticalAlign: 'middle', display: 'inline-block' }}><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="2" y1="12" x2="22" y2="12"/></svg> Ledger API (Rust) ]
                </button>
                <button className="tactical-btn" onClick={() => handlePreFill('game')}>
                  [ <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px', verticalAlign: 'middle', display: 'inline-block' }}><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4M8 10v4M15 11h.01M18 13h.01"/></svg> Game Lobby (Go) ]
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
                  {dirHandle ? `[ 📁 CONECTADO: ${dirHandle.name.toUpperCase()} ]` : '[ 📁 CONECTAR PASTA LOCAL DO PROJETO ]'}
                </button>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', flex: 1 }}>
                  {dirHandle 
                    ? 'Atlas criará a Constituição, Backlog e arquivos de código diretamente nesta pasta.' 
                    : 'Permite que a interface web na Vercel escreva e audite arquivos diretamente no seu disco local.'}
                </span>
              </div>

              <form onSubmit={startAlignment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>PROJECT_DESCRIPTION</label>
                  <input 
                    type="text" 
                    className="tactical-input" 
                    value={projectDesc} 
                    onChange={(e) => setProjectDesc(e.target.value)} 
                    required 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px' }}>
                    DESCRIÇÃO DA IDEIA DO SOFTWARE (LINGUAGEM NATURAL)
                  </label>
                  <textarea 
                    className="tactical-input" 
                    style={{ height: '100px', resize: 'none', padding: '10px', fontSize: '12px' }}
                    placeholder="Descreva o que o sistema deve fazer, integrações necessárias, comportamento esperado e fluxos de dados..."
                    value={projectIdea}
                    onChange={(e) => setProjectIdea(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="tactical-btn primary" style={{ width: '100%', padding: '12px' }}>
                  START COGNITIVE ALIGNMENT INTERVIEW
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. INTERACTIVE ALIGNMENT INTERVIEW */}
      {flowStage === 'interview' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px'
        }}>
          <div className="console-panel" style={{ width: '100%', maxWidth: '720px', height: '560px', display: 'flex', flexDirection: 'column' }}>
            <div className="panel-header">
              <span className="panel-title">[ ALIGNMENT ACTIVE ]</span>
              <span>MAESTRO ARCHITECT INTERVIEW</span>
            </div>

            <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '16px', overflow: 'hidden' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '11px', color: 'var(--accent-blue)', fontWeight: 'bold' }}>// DIALOGUE SESSION</span>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  O Atlas está formulando perguntas táticas para mapear dependências lógicas e físicas e consolidar a Constituição de integridade.
                </p>
              </div>

              {/* CHAT MESSAGES SCROLLER */}
              <div style={{
                flex: 1, backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px'
              }}>
                {chatMessages.map((msg, index) => (
                  <div key={index} style={{
                    alignSelf: msg.sender === 'ai' ? 'flex-start' : 'flex-end',
                    maxWidth: '85%',
                    backgroundColor: msg.sender === 'ai' ? 'var(--bg-secondary)' : 'rgba(0, 216, 246, 0.05)',
                    border: msg.sender === 'ai' ? '1px solid var(--border-color)' : '1px solid var(--accent-blue)',
                    padding: '12px',
                    fontFamily: 'monospace',
                    fontSize: '11px'
                  }}>
                    <span style={{
                      display: 'block', fontWeight: 'bold', marginBottom: '6px',
                      color: msg.sender === 'ai' ? 'var(--accent-orange)' : 'var(--accent-blue)'
                    }}>
                      {msg.sender === 'ai' ? '[ MAESTRO ARCHITECT ]' : '[ USER DEVELOPER ]'}
                    </span>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{msg.text}</div>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>

              {/* CHAT INPUT FORM */}
              <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  className="tactical-input" 
                  style={{ flex: 1 }}
                  placeholder="Digite sua resposta técnica ou justificativa..."
                  value={userAnswerInput}
                  onChange={(e) => setUserAnswerInput(e.target.value)}
                  required
                />
                <button type="submit" className="tactical-btn primary" style={{ width: '120px' }}>
                  SUBMIT
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 3. COMPILING SCREEN */}
      {flowStage === 'compiling' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px'
        }}>
          <div className="console-panel" style={{ width: '100%', maxWidth: '720px', height: '400px' }}>
            <div className="panel-header">
              <span className="panel-title">[ COMPILING BLUEPRINT ]</span>
              <span>ATLAS COMPILER TERMINAL</span>
            </div>

            <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                  BUILDING ARCHITECTURAL CONTRACTS... {compilationProgress}%
                </span>
                {/* PROGRESS BAR */}
                <div style={{ height: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', padding: '2px' }}>
                  <div style={{ height: '100%', background: 'var(--accent-blue)', width: `${compilationProgress}%`, transition: 'width 0.2s ease' }} />
                </div>
              </div>

              {/* COMPILER OUTPUT LOG */}
              <div style={{
                flex: 1, backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                padding: '12px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '11px', maxHeight: '200px'
              }}>
                {compilationLogs.map((l, index) => (
                  <div key={index} style={{ marginBottom: '4px', color: 'var(--text-muted)' }}>{l}</div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MAIN COGNITIVE ENGINE DASHBOARD */}
      {flowStage === 'dashboard' && profile && (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', zIndex: 10, position: 'relative' }}>
          
          {/* HEADER */}
          <header className="tactical-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '14px', height: '14px', backgroundColor: driftStatus === 'drift' ? 'var(--accent-orange)' : 'var(--accent-green)' }} />
              <span style={{ fontWeight: 'bold', fontSize: '15px', letterSpacing: '1px' }}>
                // ATLAS : <span style={{ color: driftStatus === 'drift' ? 'var(--accent-orange)' : 'var(--accent-green)' }}>
                  {driftStatus === 'drift' ? 'DRIFT_DETECTED' : 'INTEGRITY_COMPLIANT'}
                </span>
              </span>
            </div>

            <div className="header-controls" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div className="header-meta-info" style={{ fontSize: '11px', display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-muted)' }}>
                <span>PROJECT: <strong>{profile.projectName.toUpperCase()}</strong></span>
                <span>STACK: <strong>{profile.stackLabel.toUpperCase()}</strong></span>
                <span style={{ color: isSynced ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
                  {isSynced ? '[ SUPABASE_ONLINE ]' : '[ LOCAL_FALLBACK ]'}
                </span>
                <button 
                  className="tactical-btn" 
                  onClick={connectLocalFolder} 
                  style={{ 
                    padding: '2px 8px', 
                    fontSize: '9px', 
                    height: '22px',
                    borderColor: dirHandle ? 'var(--accent-green)' : 'var(--accent-blue)',
                    color: dirHandle ? 'var(--accent-green)' : 'var(--accent-blue)' 
                  }}
                >
                  {dirHandle ? `[ 📁 LOCAL: ${dirHandle.name.toUpperCase()} ]` : '[ 📁 CONECTAR PASTA LOCAL ]'}
                </button>
              </div>

              {/* SCORE */}
              <div className={`tactical-status ${score === 1000 ? 'status-ok' : 'status-warn'}`} style={{ padding: '4px 10px' }}>
                SCORE: {score}/1000
              </div>

              {/* MODE & RESET */}
              <button className="tactical-btn" onClick={() => setIsDark(!isDark)} style={{ padding: '4px 8px' }}>
                {isDark ? 'LIGHT_MODE' : 'DARK_MODE'}
              </button>
              
              <button className="tactical-btn" onClick={resetWorkspace} style={{ padding: '4px 8px' }}>
                RESET
              </button>

              <button className="tactical-btn" onClick={handleLogout} style={{ padding: '4px 8px', borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}>
                LOGOUT
              </button>
            </div>
          </header>

          {/* MAIN GRID */}
          <main className="dashboard-layout">
            
            {/* SIDEBAR NAVIGATION */}
            <aside className="dashboard-sidebar">
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '12px' }}>
                [ CONTROLLERS ]
              </div>

              <button className={`tactical-btn ${activeTab === 'monitor' ? 'primary' : ''}`} onClick={() => setActiveTab('monitor')} style={{ justifyContent: 'flex-start', width: '100%' }}>
                [ 01. RUNTIME MONITOR ]
              </button>
              <button className={`tactical-btn ${activeTab === 'blueprint' ? 'primary' : ''}`} onClick={() => setActiveTab('blueprint')} style={{ justifyContent: 'flex-start', width: '100%' }}>
                [ 02. BLUEPRINT TOPO ]
              </button>
              <button className={`tactical-btn ${activeTab === 'audit' ? 'primary' : ''}`} onClick={() => setActiveTab('audit')} style={{ justifyContent: 'flex-start', width: '100%' }}>
                [ 03. DRIFT AUDITOR ]
              </button>
              <button className={`tactical-btn ${activeTab === 'radar' ? 'primary' : ''}`} onClick={() => setActiveTab('radar')} style={{ justifyContent: 'flex-start', width: '100%' }}>
                [ 04. EVOLUTION RADAR ]
              </button>
              <button className={`tactical-btn ${activeTab === 'assets' ? 'primary' : ''}`} onClick={() => setActiveTab('assets')} style={{ justifyContent: 'flex-start', width: '100%' }}>
                [ 05. ARCHITECTURE ASSETS ]
              </button>

              <div style={{ marginTop: 'auto', border: '1px solid var(--border-color)', padding: '12px', background: 'var(--bg-primary)' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', fontWeight: 'bold' }}>SYSTEM HEALTH</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', display: 'block', margin: '4px 0' }}>100% OPERATIONAL</span>
                <div style={{ height: '4px', background: 'var(--border-color)', width: '100%' }}>
                  <div style={{ height: '100%', background: 'var(--accent-green)', width: '100%' }} />
                </div>
              </div>
            </aside>

            {/* VIEWPORT AREA */}
            <section className="dashboard-viewport">
              
              {/* TAB 1: RUNTIME MONITOR */}
              {activeTab === 'monitor' && (
                <div className="monitor-grid-container">
                  
                  <div className="monitor-top-row">
                    
                    {/* WORKSPACE PROFILE */}
                    <div className="console-panel" style={{ border: 0, borderRight: '1px solid var(--border-color)' }}>
                      <div className="panel-header">COGNITIVE WORKSPACE PROFILE</div>
                      <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
                        <div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>PROJECT NAME</span>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', fontFamily: 'monospace' }}>{profile.projectName}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>STACK SYSTEM</span>
                          <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{profile.stackLabel}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>COGNITIVE BRIEF</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{profile.description}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>AI INTERVIEW ALIGNMENT SUMMARY</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                            <div style={{ background: 'var(--bg-primary)', padding: '6px', borderLeft: '2px solid var(--accent-blue)', fontSize: '10px' }}>
                              <strong>P1:</strong> {profile.answers.q1}
                            </div>
                            <div style={{ background: 'var(--bg-primary)', padding: '6px', borderLeft: '2px solid var(--accent-blue)', fontSize: '10px' }}>
                              <strong>P2:</strong> {profile.answers.q2}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ACTIVE TASKS & CONSTITUTION */}
                    <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', overflow: 'hidden' }}>
                      
                      {/* TASKS */}
                      <div className="console-panel" style={{ border: 0, borderBottom: '1px solid var(--border-color)' }}>
                        <div className="panel-header">MAESTRO ACTIVE AGENTS TASKS</div>
                        <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
                          {activeTasks.map((t) => (
                            <div key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                <span>{t.id}: {t.name}</span>
                                <span style={{ color: t.status === 'COMPLETED' ? 'var(--accent-green)' : 'var(--accent-blue)' }}>{t.status}</span>
                              </div>
                              <div style={{ height: '6px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                                <div style={{ height: '100%', width: `${t.progress}%`, backgroundColor: t.status === 'COMPLETED' ? 'var(--accent-green)' : 'var(--accent-blue)', transition: 'width 0.3s ease' }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* CONSTITUTION INVARIANTS */}
                      <div className="console-panel" style={{ border: 0 }}>
                        <div className="panel-header">ACTIVE CONSTITUTION QUALITY RULES</div>
                        <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                          {profile.constitution.map((rule, idx) => (
                            <div key={idx} style={{ border: '1px solid var(--border-color)', padding: '6px 8px', background: 'var(--bg-tertiary)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'bold' }}>
                                <span style={{ color: 'var(--accent-orange)' }}>{rule.rule}</span>
                                <span style={{
                                  color: rule.severity === 'CRITICAL' ? 'var(--accent-red)' : rule.severity === 'HIGH' ? 'var(--accent-orange)' : 'var(--accent-blue)'
                                }}>
                                  [{rule.severity}]
                                </span>
                              </div>
                              <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: 'var(--text-muted)' }}>{rule.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* BOTTOM ROW SYSTEM CONSOLE LOG */}
                  <div className="console-panel" style={{ border: 0 }}>
                    <div className="panel-header">MAESTRO AGENTS CONSOLE LOG</div>
                    <div className="panel-content" style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', fontFamily: 'monospace' }}>
                      <div className="log-container">
                        {logs.slice(-12).map((l, idx) => (
                          <div key={idx} className="log-line">
                            <span className="log-time">[{l.time}]</span>
                            <span className="log-tag" style={{
                              color: l.type === 'err' ? 'var(--accent-red)' : l.type === 'warn' ? 'var(--accent-orange)' : l.type === 'success' ? 'var(--accent-green)' : 'var(--accent-blue)'
                            }}>
                              [{l.tag}]
                            </span>
                            <span className="log-text">{l.text}</span>
                          </div>
                        ))}
                        <div ref={logEndRef} />
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: BLUEPRINT SCHEMATIC TOPOLOGY */}
              {activeTab === 'blueprint' && (
                <div className="blueprint-grid-container">
                  
                  {/* TOPOLOGY MAP */}
                  <div className="console-panel" style={{ border: 0 }}>
                    <div className="panel-header">BLUEPRINT SCHEMATIC TOPOLOGY</div>
                    <div className="panel-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="480" height="340" viewBox="0 0 480 340" style={{ maxWidth: '100%', height: 'auto' }}>
                        {/* CONNECTOR PATHS */}
                        <line x1="80" y1="170" x2="220" y2="100" stroke="var(--border-color)" strokeWidth="2" strokeDasharray="4" />
                        <line x1="80" y1="170" x2="220" y2="240" stroke="var(--border-color)" strokeWidth="2" strokeDasharray="4" />
                        <line x1="220" y1="100" x2="380" y2="170" stroke={driftStatus === 'drift' ? 'var(--accent-orange)' : 'var(--border-color)'} strokeWidth="2" strokeDasharray={driftStatus === 'drift' ? '1' : '0'} />
                        <line x1="220" y1="240" x2="380" y2="170" stroke="var(--border-color)" strokeWidth="2" />
                        
                        {/* MODULE 1: INGRESS */}
                        <g onClick={() => setSelectedNode('ingress')} style={{ cursor: 'pointer' }}>
                          <rect x="20" y="140" width="120" height="60" fill="var(--bg-secondary)" stroke={selectedNode === 'ingress' ? 'var(--accent-blue)' : 'var(--border-color)'} strokeWidth="2" />
                          <text x="80" y="175" fill="var(--text-primary)" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                            {profile.modules[0]?.name || 'ingress'}
                          </text>
                        </g>

                        {/* MODULE 2: LOGIC */}
                        <g onClick={() => setSelectedNode('logic')} style={{ cursor: 'pointer' }}>
                          <rect x="160" y="70" width="120" height="60" fill="var(--bg-secondary)" stroke={selectedNode === 'logic' ? 'var(--accent-blue)' : 'var(--border-color)'} strokeWidth="2" />
                          <text x="220" y="105" fill="var(--text-primary)" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                            {profile.modules[1]?.name || 'logic'}
                          </text>
                        </g>

                        {/* MODULE 3: AUTH */}
                        <g onClick={() => setSelectedNode('auth')} style={{ cursor: 'pointer' }}>
                          <rect x="160" y="210" width="120" height="60" fill="var(--bg-secondary)" stroke={selectedNode === 'auth' ? 'var(--accent-blue)' : 'var(--border-color)'} strokeWidth="2" />
                          <text x="220" y="245" fill="var(--text-primary)" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                            {profile.modules[2]?.name || 'auth'}
                          </text>
                        </g>

                        {/* MODULE 4: DATABASE */}
                        <g onClick={() => setSelectedNode('database')} style={{ cursor: 'pointer' }}>
                          <rect x="320" y="140" width="120" height="60" fill="var(--bg-secondary)" stroke={selectedNode === 'database' ? 'var(--accent-blue)' : (driftStatus === 'drift' ? 'var(--accent-orange)' : 'var(--border-color)')} strokeWidth="2" />
                          <text x="380" y="175" fill="var(--text-primary)" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                            {profile.modules[3]?.name || 'database'}
                          </text>
                        </g>
                      </svg>
                    </div>
                  </div>

                  {/* INSPECTOR PANEL */}
                  <div className="console-panel" style={{ borderTop: 0, borderRight: 0, borderBottom: 0 }}>
                    <div className="panel-header">BLUEPRINT MODULE INSPECTOR</div>
                    <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {(() => {
                        const activeMod = profile.modules.find(m => m.type === selectedNode) || profile.modules[0];
                        if (!activeMod) return <p>No modules found.</p>;
                        
                        return (
                          <>
                            <div>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>MODULE IDENTIFIER</span>
                              <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-blue)', fontFamily: 'monospace' }}>
                                {activeMod.name}
                              </span>
                            </div>
                            <div>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>PURPOSE SPECIFICATION</span>
                              <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>{activeMod.purpose}</p>
                            </div>
                            <div>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>ALLOWED DEPENDENCIES</span>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                                {activeMod.dependencies.length > 0 ? (
                                  activeMod.dependencies.map((d, i) => (
                                    <span key={i} style={{ border: '1px solid var(--border-color)', background: 'var(--bg-primary)', padding: '2px 6px', fontSize: '10px', fontFamily: 'monospace' }}>
                                      {d}
                                    </span>
                                  ))
                                ) : (
                                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>None (Leaf Module)</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>ALLOWED EGRESS OUTBOUND</span>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                                {activeMod.allowedEgress.length > 0 ? (
                                  activeMod.allowedEgress.map((d, i) => (
                                    <span key={i} style={{ border: '1px solid var(--border-color)', background: 'var(--bg-primary)', padding: '2px 6px', fontSize: '10px', fontFamily: 'monospace' }}>
                                      {d}
                                    </span>
                                  ))
                                ) : (
                                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>None (No outgoing network rules allowed)</span>
                                )}
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: DRIFT AUDITOR */}
              {activeTab === 'audit' && (
                <div className="audit-grid-container">
                  
                  {/* SUMMARY RADAR SCAN */}
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
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                          <span>Aderência à Constituição:</span>
                          <span style={{ color: driftStatus === 'clean' ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
                            {driftStatus === 'clean' ? '100%' : '66.8%'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                          <span>Segurança & Invariants:</span>
                          <span style={{ color: driftStatus === 'clean' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                            {driftStatus === 'clean' ? 'COMPLIANT' : 'CRITICAL DRIFT'}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* DIFF COMPARER */}
                  <div className="console-panel" style={{ borderTop: 0, borderRight: 0, borderBottom: 0 }}>
                    <div className="panel-header">CODE FILE DRIFT COMPARER</div>
                    <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      
                      <div style={{ border: driftStatus === 'drift' ? '1px solid var(--accent-orange)' : '1px solid var(--accent-green)', padding: '12px', background: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: driftStatus === 'drift' ? 'var(--accent-orange)' : 'var(--accent-green)', fontWeight: 'bold' }}>
                            {driftStatus === 'drift' ? '[ DRIFTS DETECTED IN WORKSPACE ]' : '[ WORKSPACE SECURE & VERIFIED ]'}
                          </span>
                          <div style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '4px' }}>{profile.driftFile}</div>
                        </div>
                        {driftStatus === 'drift' && (
                          <button className="tactical-btn warning" onClick={resolveDrift}>
                            RESOLVE DRIFT
                          </button>
                        )}
                      </div>

                      <div className="drift-compare-grid">
                        <div style={{ border: '1px solid var(--border-color)', background: 'var(--bg-primary)', padding: '12px', overflowY: 'auto', maxHeight: '320px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '8px' }}>
                            BLUEPRINT SCHEMATIC CONTRACT
                          </span>
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{profile.driftContract}</pre>
                        </div>
                        <div style={{ border: '1px solid var(--border-color)', background: 'var(--bg-primary)', padding: '12px', overflowY: 'auto', maxHeight: '320px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '8px' }}>
                            WORKSPACE PHYSICAL AST
                          </span>
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: driftStatus === 'drift' ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                            {driftStatus === 'drift' ? profile.driftPhysical : profile.driftResolved}
                          </pre>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              )}

              {/* TAB 4: EVOLUTION RADAR */}
              {activeTab === 'radar' && (
                <div className="radar-grid-container">
                  
                  {/* TECHNOLOGY CONCENTRIC RADAR */}
                  <div className="console-panel" style={{ border: 0 }}>
                    <div className="panel-header">TECHNOLOGY RADAR (AEF)</div>
                    <div className="panel-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{
                        width: '280px', height: '280px', border: '1px solid var(--border-color)', borderRadius: '50% !important',
                        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)'
                      }}>
                        <div style={{ position: 'absolute', width: '210px', height: '210px', border: '1px dashed var(--border-color)', borderRadius: '50% !important' }} />
                        <div style={{ position: 'absolute', width: '140px', height: '140px', border: '1px solid var(--border-color)', borderRadius: '50% !important' }} />
                        <div style={{ position: 'absolute', width: '70px', height: '70px', border: '1px dashed var(--border-color)', borderRadius: '50% !important' }} />
                        
                        <span style={{ position: 'absolute', top: '10px', fontSize: '8px', color: 'var(--text-muted)' }}>HOLD</span>
                        <span style={{ position: 'absolute', top: '45px', fontSize: '8px', color: 'var(--text-muted)' }}>ASSESS</span>
                        <span style={{ position: 'absolute', top: '80px', fontSize: '8px', color: 'var(--text-muted)' }}>TRIAL</span>
                        <span style={{ position: 'absolute', top: '115px', fontSize: '8px', color: 'var(--text-muted)' }}>ADOPT</span>

                        {/* Tech Dots */}
                        <div style={{ position: 'absolute', top: '120px', left: '110px', width: '8px', height: '8px', backgroundColor: 'var(--accent-blue)', borderRadius: '50% !important' }} title="Selected Framework Core" />
                        <div style={{ position: 'absolute', top: '70px', left: '160px', width: '8px', height: '8px', backgroundColor: 'var(--accent-green)', borderRadius: '50% !important' }} title="Primary Driver" />
                        <div style={{ position: 'absolute', top: '30px', left: '80px', width: '8px', height: '8px', backgroundColor: 'var(--accent-orange)', borderRadius: '50% !important' }} title="External Queue Broker" />
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE RFC PROPOSALS */}
                  <div className="console-panel" style={{ borderTop: 0, borderRight: 0, borderBottom: 0 }}>
                    <div className="panel-header">PROPOSED EVOLUTIONS (AEF)</div>
                    <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      
                      <div style={{ border: '1px solid var(--border-color)', padding: '16px', background: 'var(--bg-tertiary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--accent-blue)', fontWeight: 'bold' }}>{profile.rfcProposal.id}</span>
                          <span style={{
                            fontSize: '9px', padding: '2px 6px', border: '1px solid var(--border-color)',
                            color: evolutionRfcStatus === 'EXECUTED' ? 'var(--accent-green)' : 'var(--accent-orange)',
                            background: 'var(--bg-primary)'
                          }}>
                            {evolutionRfcStatus}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{profile.rfcProposal.title}</h4>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>{profile.rfcProposal.details}</p>

                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                          <div>IMPACT: <strong style={{ color: 'var(--accent-green)' }}>{profile.rfcProposal.impactScore}</strong></div>
                          <div>RISK: <strong>{profile.rfcProposal.risk}</strong></div>
                        </div>

                        {evolutionRfcStatus === 'PENDING_APPROVAL' && (
                          <button className="tactical-btn primary" onClick={runRfcMigration} style={{ width: '100%', padding: '10px' }}>
                            APPROVE & EXECUTE MIGRATION
                          </button>
                        )}
                        {evolutionRfcStatus === 'EXECUTING' && (
                          <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--accent-orange)' }}>
                            [ MIGRATING SCHEMAS IN SANDBOX CONTAINER... ]
                          </div>
                        )}
                        {evolutionRfcStatus === 'EXECUTED' && (
                          <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--accent-green)', fontWeight: 'bold' }}>
                            [ MIGRATION SUCCESSFULLY DEPLOYED ]
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                </div>
              )}

              {/* TAB 5: ARCHITECTURE ASSETS */}
              {activeTab === 'assets' && (
                <div style={{ display: 'grid', gridTemplateRows: '40px 1fr', height: '100%', overflow: 'hidden' }}>
                  
                  {/* ASSETS TOGGLE SUB-TABS */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', paddingRight: '8px' }}>
                    <div style={{ display: 'flex' }}>
                      <button className={`tactical-btn`} style={{ border: 0, background: activeAssetSubTab === 'constitution' ? 'var(--bg-primary)' : 'transparent', color: activeAssetSubTab === 'constitution' ? 'var(--accent-blue)' : 'var(--text-muted)' }} onClick={() => setActiveAssetSubTab('constitution')}>
                        [ Constitution.md ]
                      </button>
                      <button className={`tactical-btn`} style={{ border: 0, background: activeAssetSubTab === 'adr' ? 'var(--bg-primary)' : 'transparent', color: activeAssetSubTab === 'adr' ? 'var(--accent-blue)' : 'var(--text-muted)' }} onClick={() => setActiveAssetSubTab('adr')}>
                        [ ADRs (Architectural Decisions) ]
                      </button>
                      <button className={`tactical-btn`} style={{ border: 0, background: activeAssetSubTab === 'backlog' ? 'var(--bg-primary)' : 'transparent', color: activeAssetSubTab === 'backlog' ? 'var(--accent-blue)' : 'var(--text-muted)' }} onClick={() => setActiveAssetSubTab('backlog')}>
                        [ Backlog.json ]
                      </button>
                      <button className={`tactical-btn`} style={{ border: 0, background: activeAssetSubTab === 'roadmap' ? 'var(--bg-primary)' : 'transparent', color: activeAssetSubTab === 'roadmap' ? 'var(--accent-blue)' : 'var(--text-muted)' }} onClick={() => setActiveAssetSubTab('roadmap')}>
                        [ Roadmap.json ]
                      </button>
                    </div>
                    
                    <button className="tactical-btn primary" onClick={downloadCompleteProjectZip} disabled={isZipping} style={{ fontSize: '10px', height: '30px', padding: '0 12px' }}>
                      {isZipping ? '[ CREATING ZIP... ]' : '[ 📦 DOWNLOAD COMPLETE PROJECT ZIP ]'}
                    </button>
                  </div>

                  {/* SUB-TAB CONTENTS */}
                  <div className="console-panel" style={{ border: 0, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                    <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', gap: '16px', padding: '16px' }}>
                      
                      {/* SUB 1: CONSTITUTION */}
                      {activeAssetSubTab === 'constitution' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>PROJECT CONSTITUTION SPECIFICATION</h3>
                            <button className="tactical-btn" onClick={() => exportFile('constitution.md', `# Atlas Project Constitution\n\nProject: ${profile.projectName}\n\n## Core Invariant Rules\n` + profile.constitution.map(c => `### ${c.rule} [${c.severity}]\n${c.description}`).join('\n\n'))}>
                              DOWNLOAD MD
                            </button>
                          </div>
                          <div style={{ border: '1px solid var(--border-color)', background: 'var(--bg-primary)', padding: '16px', fontFamily: 'monospace', fontSize: '11px', whiteSpace: 'pre-wrap', flex: 1 }}>
{`# Project Architecture Constitution
# Workspace: ${profile.projectName}
# Quality Standards Enforcement Guidelines

1. Core Architectural Constraints
---------------------------------
All modular modifications and new integrations must conform strictly to:
- Modularity Type: ${profile.architecture}
- Execution Stack: ${profile.stackLabel}

2. Invariant Gates (Automated Quality Enforcement)
---------------------------------
${profile.constitution.map((c, i) => `${i+1}. [${c.rule}] - Severity: ${c.severity}\n   Rule: ${c.description}`).join('\n\n')}

3. Pre-Commit Verification Gate
---------------------------------
Maestro AST Watcher daemon intercepts staging commits. In the event of a code validation drift, builds are cancelled automatically.`}
                          </div>
                        </div>
                      )}

                      {/* SUB 2: ADR */}
                      {activeAssetSubTab === 'adr' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>ARCHITECTURAL DECISION RECORDS (ADRs)</h3>
                            <button className="tactical-btn" onClick={() => exportFile('adrs.md', profile.adrs.map(a => `# ${a.id}: ${a.title}\n\n**Status:** ${a.status}\n\n**Context:** ${a.context}\n\n**Decision:** ${a.decision}`).join('\n\n'))}>
                              DOWNLOAD ADRs
                            </button>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                            {profile.adrs.map((a) => (
                              <div key={a.id} style={{ border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', padding: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>
                                  <span style={{ color: 'var(--accent-blue)' }}>{a.id}: {a.title}</span>
                                  <span style={{ color: 'var(--accent-green)' }}>{a.status}</span>
                                </div>
                                <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  <div><strong>Context:</strong> {a.context}</div>
                                  <div><strong>Decision:</strong> {a.decision}</div>
                                  <div><strong>Consequence:</strong> {a.consequence}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SUB 3: BACKLOG */}
                      {activeAssetSubTab === 'backlog' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>PRODUCT BACKLOG WORK ITEMS</h3>
                            <button className="tactical-btn" onClick={() => exportFile('backlog.json', JSON.stringify(profile.backlog, null, 2))}>
                              DOWNLOAD BACKLOG.JSON
                            </button>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                            {profile.backlog.map((item) => (
                              <div key={item.id} style={{ border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>{item.id} - {item.type}</span>
                                  <strong style={{ fontSize: '12px' }}>{item.title}</strong>
                                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>{item.description}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <span style={{ fontSize: '10px', border: '1px solid var(--border-color)', padding: '2px 6px', background: 'var(--bg-primary)' }}>
                                    PRIORITY: {item.priority}
                                  </span>
                                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--accent-blue)', fontFamily: 'monospace' }}>
                                    {item.estimate} PTS
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SUB 4: ROADMAP */}
                      {activeAssetSubTab === 'roadmap' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>MILESTONES IMPLEMENTATION ROADMAP</h3>
                            <button className="tactical-btn" onClick={() => exportFile('roadmap.json', JSON.stringify(profile.roadmap, null, 2))}>
                              DOWNLOAD ROADMAP.JSON
                            </button>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                            {profile.roadmap.map((sprint) => (
                              <div key={sprint.id} style={{ border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', padding: '16px' }}>
                                <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 'bold', color: 'var(--accent-blue)' }}>
                                  {sprint.id}: {sprint.name}
                                </h4>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                  <strong>Sprint Goal:</strong> {sprint.goal}
                                </div>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                  {sprint.tasks.map((t, idx) => (
                                    <span key={idx} style={{ fontSize: '9px', border: '1px solid var(--border-color)', padding: '2px 6px', background: 'var(--bg-primary)', fontFamily: 'monospace' }}>
                                      {t}
                                    </span>
                                  ))}
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--accent-orange)' }}>
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px', verticalAlign: 'middle', display: 'inline-block' }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                  Risk Analysis: {sprint.risk}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              )}

            </section>

          </main>

          {/* MOBILE BOTTOM NAVIGATION */}
          <nav className="mobile-bottom-nav">
            <button className={activeTab === 'monitor' ? 'active' : ''} onClick={() => setActiveTab('monitor')}>
              <span>MONITOR</span>
            </button>
            <button className={activeTab === 'blueprint' ? 'active' : ''} onClick={() => setActiveTab('blueprint')}>
              <span>BLUEPRINT</span>
            </button>
            <button className={activeTab === 'audit' ? 'active' : ''} onClick={() => setActiveTab('audit')}>
              <span>AUDIT</span>
            </button>
            <button className={activeTab === 'radar' ? 'active' : ''} onClick={() => setActiveTab('radar')}>
              <span>EVOLUTION</span>
            </button>
            <button className={activeTab === 'assets' ? 'active' : ''} onClick={() => setActiveTab('assets')}>
              <span>ASSETS</span>
            </button>
          </nav>

        </div>
      )}
      </>
      )}
    </div>
  );
}
