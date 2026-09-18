# antigravity-cli-harness — AI Recruitment Platform

## Plugin: `recruitment-plugin`

Arnés de desarrollo avanzado para el ATS. Orquesta tres sub-agentes especializados con habilidades aisladas, hooks de Git y linters automáticos.

---

## Estructura del directorio

```
.agents/
├── harness.json                          ← Configuración raíz del arnés
└── plugins/
    └── recruitment-plugin/
        ├── plugin.json                   ← Manifiesto del plugin
        ├── skills/
        │   ├── db-skill/
        │   │   ├── skill.json            ← Capacidades y convenciones PostgreSQL+pgvector
        │   │   └── instructions.md       ← Prompt del agente de DB
        │   ├── developer-skill/
        │   │   ├── skill.json            ← Capacidades Next.js + Tailwind
        │   │   └── instructions.md       ← Prompt del agente developer
        │   └── qa-skill/
        │       ├── skill.json            ← Herramientas QA (Husky, ESLint, Vitest)
        │       └── instructions.md       ← Prompt del agente QA
        ├── agents/
        │   ├── db-agent/agent.json       ← Responsabilidades + quality gates DB
        │   ├── developer-agent/agent.json← Responsabilidades + quality gates frontend
        │   └── qa-agent/agent.json       ← Responsabilidades + quality gates QA
        └── hooks/
            ├── pre-commit.sh             ← lint-staged + tsc --noEmit
            ├── pre-push.sh               ← vitest + migration-lint
            ├── migration-lint.mjs        ← Linter completo de migraciones SQL
            └── sql-lint.mjs              ← Linter por fichero para lint-staged
```

---

## Sub-agentes y habilidades

| Agente | Habilidad | Responsabilidad principal |
|---|---|---|
| `db-agent` | `db-skill` | Esquema PostgreSQL, migraciones, RLS, pgvector |
| `developer-agent` | `developer-skill` | Páginas Next.js, Server Actions, API routes, n8n webhooks |
| `qa-agent` | `qa-skill` | Git hooks, ESLint, Prettier, TypeScript strict, Vitest |

---

## Quality Gates globales

- **UUID PKs** en todas las entidades (validado por `migration-lint.mjs` en pre-push)
- **RLS habilitado** en todas las tablas públicas (validado por `migration-lint.mjs`)
- **Zero ESLint errors** (`lint-staged` en pre-commit)
- **TypeScript strict** (`tsc --noEmit` en pre-commit)
- **Conventional Commits** (`commitlint` en commit-msg)
- **Vitest ≥ 70% coverage** (pre-push)

---

## Activación del arnés (primera vez)

```bash
# 1. Instalar dependencias QA
npm install -D husky lint-staged @commitlint/cli @commitlint/config-conventional \
  eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser \
  eslint-config-next prettier vitest @vitejs/plugin-react \
  @testing-library/react @testing-library/jest-dom

# 2. Inicializar Husky
npx husky init

# 3. Copiar hooks gestionados por qa-skill
cp .agents/plugins/recruitment-plugin/hooks/pre-commit.sh .husky/pre-commit
cp .agents/plugins/recruitment-plugin/hooks/pre-push.sh   .husky/pre-push
chmod +x .husky/pre-commit .husky/pre-push

# 4. Generar tipos Supabase (requiere supabase CLI)
npx supabase gen types typescript --local > lib/supabase/types.ts
```

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Estilos | Tailwind CSS + Inter (Google Fonts) |
| Base de datos | Supabase (PostgreSQL 15 + pgvector) |
| Auth | Supabase Auth (JWT + SSR) |
| Automatización | n8n (webhooks en `/api/webhooks/n8n/`) |
| Testing | Vitest + Testing Library |
| Linting | ESLint + Prettier + TypeScript strict |
