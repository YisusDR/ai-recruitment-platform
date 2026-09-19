/**
 * lib/mock/store.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * In-memory Mock Data Store for development and demo mode.
 * Preserves state in globalThis across dev server reloads.
 * Mirrors the exact Supabase schema and initial seed data.
 */
import type {
  JobRow,
  CandidateRow,
  ApplicationRow,
  InterviewRow,
  RecruiterRow,
  CandidateStage,
  InterviewResult,
} from '@/lib/supabase/types'

export interface MockStoreState {
  recruiters: RecruiterRow[]
  jobs: JobRow[]
  candidates: CandidateRow[]
  applications: ApplicationRow[]
  interviews: InterviewRow[]
}

const initialRecruiters: RecruiterRow[] = [
  {
    id: '55555555-0000-0000-0000-000000000001',
    auth_user_id: 'df2c4632-361a-4e0e-a808-91ee670017e5',
    full_name: 'Admin Dev',
    email: 'admin@ats.local',
    avatar_url: null,
    phone: '+34 600 000 001',
    department: 'Engineering',
    role: 'admin',
    is_active: true,
    deactivated_at: null,
    created_at: new Date('2026-06-01T10:00:00Z').toISOString(),
    updated_at: new Date('2026-06-01T10:00:00Z').toISOString(),
  },
  {
    id: '55555555-0000-0000-0000-000000000002',
    auth_user_id: '00000000-0000-0000-0000-000000000002',
    full_name: 'María Reclutadora',
    email: 'maria@ats.local',
    avatar_url: null,
    phone: '+34 600 000 002',
    department: 'Talent Acquisition',
    role: 'recruiter',
    is_active: true,
    deactivated_at: null,
    created_at: new Date('2026-06-01T10:00:00Z').toISOString(),
    updated_at: new Date('2026-06-01T10:00:00Z').toISOString(),
  },
]

const initialJobs: JobRow[] = [
  {
    id: '44444444-0000-0000-0000-000000000001',
    created_by: '55555555-0000-0000-0000-000000000001',
    title: 'Senior Full-Stack Engineer',
    description:
      'Construir y escalar funcionalidades clave en Next.js 15 y Supabase para la plataforma de reclutamiento ATS. Liderarás la arquitectura de base de datos, APIs seguras y componentes reactivos.',
    department: 'Engineering',
    location: 'Madrid, Spain',
    modality: 'remote',
    status: 'open',
    salary_min: 55000,
    salary_max: 75000,
    salary_currency: 'EUR',
    requirements: {
      skills: ['Next.js', 'TypeScript', 'PostgreSQL', 'Tailwind CSS', 'Docker'],
      experience_years: 4,
      education: 'Grado en Informática o experiencia equivalente',
      languages: ['Español', 'Inglés'],
    },
    embedding: null,
    published_at: new Date('2026-06-10T09:00:00Z').toISOString(),
    closes_at: null,
    created_at: new Date('2026-06-10T09:00:00Z').toISOString(),
    updated_at: new Date('2026-06-10T09:00:00Z').toISOString(),
  },
  {
    id: '44444444-0000-0000-0000-000000000002',
    created_by: '55555555-0000-0000-0000-000000000002',
    title: 'AI/ML Engineer — Recruitment Matching',
    description:
      'Diseñar y desplegar pipelines de embeddings con pgvector y modelos LLM para ranking automático de CVs y matching predictivo de candidatos.',
    department: 'AI Research',
    location: 'Barcelona, Spain',
    modality: 'hybrid',
    status: 'open',
    salary_min: 60000,
    salary_max: 85000,
    salary_currency: 'EUR',
    requirements: {
      skills: ['Python', 'PyTorch', 'OpenAI API', 'PostgreSQL', 'pgvector', 'FastAPI'],
      experience_years: 3,
      education: 'Máster en Inteligencia Artificial o equivalente',
      languages: ['Inglés'],
    },
    embedding: null,
    published_at: new Date('2026-06-12T11:30:00Z').toISOString(),
    closes_at: null,
    created_at: new Date('2026-06-12T11:30:00Z').toISOString(),
    updated_at: new Date('2026-06-12T11:30:00Z').toISOString(),
  },
]

const initialCandidates: CandidateRow[] = [
  {
    id: '33333333-0000-0000-0000-000000000001',
    full_name: 'Carlos Pérez',
    email: 'carlos.perez@email.com',
    phone: '+34 600 111 222',
    linkedin_url: 'https://linkedin.com/in/carlosperez-dev',
    portfolio_url: 'https://carlosperez.dev',
    location: 'Madrid, Spain',
    nationality: 'Española',
    resume_url: 'https://storage.example.com/cvs/carlos-perez.pdf',
    resume_filename: 'carlos-perez-cv.pdf',
    resume_text:
      'Desarrollador Full Stack con 5 años de experiencia en React, Next.js, Node.js y bases de datos relacionales PostgreSQL.',
    embedding: null,
    embedding_status: 'ready',
    embedding_updated_at: new Date('2026-06-14T12:00:00Z').toISOString(),
    metadata: {
      skills: ['Next.js', 'React', 'TypeScript', 'PostgreSQL', 'GraphQL'],
      years_experience: 5,
      languages: ['Español', 'Inglés'],
      certifications: ['AWS Certified Developer'],
    },
    deleted_at: null,
    created_at: new Date('2026-06-14T10:00:00Z').toISOString(),
    updated_at: new Date('2026-06-14T10:00:00Z').toISOString(),
  },
  {
    id: '33333333-0000-0000-0000-000000000002',
    full_name: 'Ana Gómez',
    email: 'ana.gomez@email.com',
    phone: '+34 600 333 444',
    linkedin_url: 'https://linkedin.com/in/anagomez-tech',
    portfolio_url: null,
    location: 'Valencia, Spain',
    nationality: 'Española',
    resume_url: 'https://storage.example.com/cvs/ana-gomez.pdf',
    resume_filename: 'ana-gomez-cv.pdf',
    resume_text:
      'Ingeniera de Software enfocada en TypeScript, arquitectura serverless y optimización de bases de datos.',
    embedding: null,
    embedding_status: 'ready',
    embedding_updated_at: new Date('2026-06-14T13:00:00Z').toISOString(),
    metadata: {
      skills: ['TypeScript', 'React', 'Node.js', 'Supabase', 'Tailwind CSS'],
      years_experience: 4,
      languages: ['Español', 'Inglés', 'Valenciano'],
      certifications: [],
    },
    deleted_at: null,
    created_at: new Date('2026-06-14T11:00:00Z').toISOString(),
    updated_at: new Date('2026-06-14T11:00:00Z').toISOString(),
  },
  {
    id: '33333333-0000-0000-0000-000000000003',
    full_name: 'Sofía Morales',
    email: 'sofia.morales@email.com',
    phone: '+34 600 555 666',
    linkedin_url: 'https://linkedin.com/in/sofiamorales-ai',
    portfolio_url: 'https://sofiamorales.ai',
    location: 'Barcelona, Spain',
    nationality: 'Española',
    resume_url: 'https://storage.example.com/cvs/sofia-morales.pdf',
    resume_filename: 'sofia-morales-cv.pdf',
    resume_text:
      'Investigadora en Inteligencia Artificial y Machine Learning. Especialista en NLP, embeddings vectoriales y LLM fine-tuning.',
    embedding: null,
    embedding_status: 'ready',
    embedding_updated_at: new Date('2026-06-15T09:00:00Z').toISOString(),
    metadata: {
      skills: ['Python', 'PyTorch', 'Hugging Face', 'LangChain', 'pgvector', 'FastAPI'],
      years_experience: 3,
      languages: ['Español', 'Inglés', 'Francés'],
      certifications: ['DeepLearning.AI NLP Specialization'],
    },
    deleted_at: null,
    created_at: new Date('2026-06-15T08:30:00Z').toISOString(),
    updated_at: new Date('2026-06-15T08:30:00Z').toISOString(),
  },
]

const initialApplications: ApplicationRow[] = [
  {
    id: '22222222-0000-0000-0000-000000000001',
    candidate_id: '33333333-0000-0000-0000-000000000001',
    job_id: '44444444-0000-0000-0000-000000000001',
    assigned_to: '55555555-0000-0000-0000-000000000001',
    stage: 'interview',
    score: 0.88,
    notes: 'Excelente perfil técnico. Superó con soltura el screening inicial.',
    is_starred: true,
    rejection_reason: null,
    source: 'linkedin',
    created_at: new Date('2026-06-14T11:15:00Z').toISOString(),
    updated_at: new Date('2026-06-15T10:00:00Z').toISOString(),
  },
  {
    id: '22222222-0000-0000-0000-000000000002',
    candidate_id: '33333333-0000-0000-0000-000000000002',
    job_id: '44444444-0000-0000-0000-000000000001',
    assigned_to: '55555555-0000-0000-0000-000000000002',
    stage: 'technical_test',
    score: 0.74,
    notes: 'En proceso de prueba técnica con ejercicio práctico de Next.js.',
    is_starred: false,
    rejection_reason: null,
    source: 'referral',
    created_at: new Date('2026-06-14T12:30:00Z').toISOString(),
    updated_at: new Date('2026-06-14T12:30:00Z').toISOString(),
  },
  {
    id: '22222222-0000-0000-0000-000000000003',
    candidate_id: '33333333-0000-0000-0000-000000000003',
    job_id: '44444444-0000-0000-0000-000000000002',
    assigned_to: '55555555-0000-0000-0000-000000000002',
    stage: 'offer',
    score: 0.94,
    notes: 'Candidata estrella. Oferta formal enviada pendiente de aceptación.',
    is_starred: true,
    rejection_reason: null,
    source: 'website',
    created_at: new Date('2026-06-15T09:45:00Z').toISOString(),
    updated_at: new Date('2026-06-17T16:00:00Z').toISOString(),
  },
]

const initialInterviews: InterviewRow[] = [
  {
    id: '11111111-0000-0000-0000-000000000001',
    application_id: '22222222-0000-0000-0000-000000000001',
    interviewer_id: '55555555-0000-0000-0000-000000000001',
    interview_type: 'technical',
    scheduled_at: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days ahead
    duration_minutes: 60,
    meeting_url: 'https://meet.google.com/abc-mock-dev',
    location_notes: 'Google Meet online',
    result: 'pending',
    conducted_at: null,
    feedback: [
      { criterion: 'Arquitectura Frontend', score: 5, comment: 'Demuestra dominio absoluto de React Server Components' },
      { criterion: 'TypeScript y Tipado', score: 4, comment: 'Buen uso de genéricos y tipos estrictos' },
    ],
    rating: 4,
    notes: 'Entrevista técnica sobre arquitectura ATS y Server Actions.',
    n8n_notified: true,
    created_at: new Date('2026-06-16T10:00:00Z').toISOString(),
    updated_at: new Date('2026-06-16T10:00:00Z').toISOString(),
  },
  {
    id: '11111111-0000-0000-0000-000000000002',
    application_id: '22222222-0000-0000-0000-000000000003',
    interviewer_id: '55555555-0000-0000-0000-000000000002',
    interview_type: 'final',
    scheduled_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    duration_minutes: 45,
    meeting_url: 'https://meet.google.com/xyz-mock-ai',
    location_notes: null,
    result: 'passed',
    conducted_at: new Date(Date.now() - 86400000).toISOString(),
    feedback: [
      { criterion: 'Match Cultural y Liderazgo', score: 5, comment: 'Alineación perfecta con la visión del equipo' },
      { criterion: 'Resolución de Problemas', score: 5, comment: 'Excelente capacidad de síntesis en modelos de recomendación' },
    ],
    rating: 5,
    notes: 'Entrevista final con la responsable de talento. Recomendación unánime de contratación.',
    n8n_notified: true,
    created_at: new Date('2026-06-16T14:00:00Z').toISOString(),
    updated_at: new Date('2026-06-17T15:00:00Z').toISOString(),
  },
]

// Global singleton state to survive Next.js Fast Refresh
declare global {
  // eslint-disable-next-line no-var
  var __ATS_MOCK_STORE__: MockStoreState | undefined
}

function getStore(): MockStoreState {
  if (!globalThis.__ATS_MOCK_STORE__) {
    globalThis.__ATS_MOCK_STORE__ = {
      recruiters: [...initialRecruiters],
      jobs: [...initialJobs],
      candidates: [...initialCandidates],
      applications: [...initialApplications],
      interviews: [...initialInterviews],
    }
  }
  return globalThis.__ATS_MOCK_STORE__
}

export const mockStore = {
  // ── Recruiters ─────────────────────────────────────────────────────────────
  getRecruiters: () => getStore().recruiters,
  getCurrentRecruiter: () => getStore().recruiters[0],

  // ── Jobs ───────────────────────────────────────────────────────────────────
  getJobs: () => getStore().jobs.filter(j => j.status !== 'archived'),
  getAllJobs: () => getStore().jobs,
  getJobById: (id: string) => getStore().jobs.find(j => j.id === id) || null,
  createJob: (data: Partial<JobRow> & { title: string; description: string }) => {
    const store = getStore()
    const newJob: JobRow = {
      ...data,
      id: crypto.randomUUID(),
      created_by: store.recruiters[0].id,
      title: data.title,
      description: data.description,
      department: data.department || null,
      location: data.location || null,
      modality: data.modality || 'remote',
      status: data.status || 'open',
      salary_min: data.salary_min || null,
      salary_max: data.salary_max || null,
      salary_currency: 'EUR',
      requirements: data.requirements || { skills: [], experience_years: 0, education: '', languages: [] },
      embedding: null,
      published_at: new Date().toISOString(),
      closes_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    store.jobs.unshift(newJob)
    return newJob
  },
  updateJob: (id: string, data: Partial<JobRow>) => {
    const store = getStore()
    const index = store.jobs.findIndex(j => j.id === id)
    if (index === -1) return null
    store.jobs[index] = {
      ...store.jobs[index],
      ...data,
      updated_at: new Date().toISOString(),
    }
    return store.jobs[index]
  },
  deleteJob: (id: string) => {
    const store = getStore()
    store.jobs = store.jobs.filter(j => j.id !== id)
    return true
  },

  // ── Candidates ─────────────────────────────────────────────────────────────
  getCandidates: () => getStore().candidates.filter(c => !c.deleted_at),
  getCandidateById: (id: string) => getStore().candidates.find(c => c.id === id && !c.deleted_at) || null,
  createCandidate: (data: Partial<CandidateRow> & { full_name: string; email: string }) => {
    const store = getStore()
    const newCandidate: CandidateRow = {
      ...data,
      id: crypto.randomUUID(),
      full_name: data.full_name,
      email: data.email,
      phone: data.phone || null,
      linkedin_url: data.linkedin_url || null,
      portfolio_url: data.portfolio_url || null,
      location: data.location || null,
      nationality: data.nationality || null,
      resume_url: data.resume_url || null,
      resume_filename: data.resume_filename || null,
      resume_text: data.resume_text || null,
      embedding: null,
      embedding_status: 'ready',
      embedding_updated_at: new Date().toISOString(),
      metadata: data.metadata || { skills: [], languages: [], certifications: [], years_experience: 0 },
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    store.candidates.unshift(newCandidate)
    return newCandidate
  },
  updateCandidate: (id: string, data: Partial<CandidateRow>) => {
    const store = getStore()
    const index = store.candidates.findIndex(c => c.id === id)
    if (index === -1) return null
    store.candidates[index] = {
      ...store.candidates[index],
      ...data,
      updated_at: new Date().toISOString(),
    }
    return store.candidates[index]
  },
  deleteCandidate: (id: string) => {
    const store = getStore()
    const index = store.candidates.findIndex(c => c.id === id)
    if (index === -1) return false
    store.candidates[index].deleted_at = new Date().toISOString()
    return true
  },

  // ── Applications ───────────────────────────────────────────────────────────
  getApplications: () => getStore().applications,
  getApplicationById: (id: string) => getStore().applications.find(a => a.id === id) || null,
  getApplicationsByJob: (jobId: string) => getStore().applications.filter(a => a.job_id === jobId),
  getApplicationsByCandidate: (candidateId: string) =>
    getStore().applications.filter(a => a.candidate_id === candidateId),
  updateApplicationStage: (id: string, stage: CandidateStage) => {
    const store = getStore()
    const app = store.applications.find(a => a.id === id)
    if (!app) return null
    app.stage = stage
    app.updated_at = new Date().toISOString()
    return app
  },
  toggleStar: (id: string) => {
    const store = getStore()
    const app = store.applications.find(a => a.id === id)
    if (!app) return null
    app.is_starred = !app.is_starred
    app.updated_at = new Date().toISOString()
    return app
  },

  // ── Interviews ─────────────────────────────────────────────────────────────
  getInterviews: () => getStore().interviews,
  getInterviewById: (id: string) => getStore().interviews.find(i => i.id === id) || null,
  createInterview: (data: Partial<InterviewRow> & { application_id: string; interview_type: any; scheduled_at: string }) => {
    const store = getStore()
    const newInterview: InterviewRow = {
      ...data,
      id: crypto.randomUUID(),
      application_id: data.application_id,
      interviewer_id: data.interviewer_id || store.recruiters[0].id,
      interview_type: data.interview_type,
      scheduled_at: data.scheduled_at,
      duration_minutes: data.duration_minutes || 45,
      meeting_url: data.meeting_url || null,
      location_notes: data.location_notes || null,
      result: 'pending',
      conducted_at: null,
      feedback: [],
      rating: null,
      notes: data.notes || null,
      n8n_notified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    store.interviews.unshift(newInterview)
    return newInterview
  },
  updateInterview: (id: string, data: Partial<InterviewRow>) => {
    const store = getStore()
    const index = store.interviews.findIndex(i => i.id === id)
    if (index === -1) return null
    store.interviews[index] = {
      ...store.interviews[index],
      ...data,
      updated_at: new Date().toISOString(),
    }
    return store.interviews[index]
  },
  deleteInterview: (id: string) => {
    const store = getStore()
    store.interviews = store.interviews.filter(i => i.id !== id)
    return true
  },
}
