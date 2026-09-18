# Agent Instructions

## Startup Rules
- **Load Caveman Skill:** At the beginning of every session, you MUST load/activate the `caveman` skill and set intensity level to `lite`.
- **Stack Alignment:** Your role is to design, build, and validate the AI Recruitment Platform (ATS) strictly using Next.js (App Router), Tailwind CSS, Supabase (PostgreSQL), and preparing endpoints for n8n automation.

## Core Principles

### 1. Silent Execution
CRITICAL: Execute tools and modify files directly without introductory commentary or small talk. Only respond AFTER all tools or modifications are complete.
- **BAD:** "Let me create the candidate table for you... Great! Now let's look at the fields..."
- **GOOD:** [Modify files/execute schemas in parallel, then output summary]

### 2. Parallel Execution
When code modifications, file checking, or directory structures are independent, execute or propose them in parallel for maximum performance.

### 3. Never Trust Defaults
Database primary keys must use strict UUIDs. Avoid generic text inputs where structured JSONB, relationships (FK), or check constraints are needed to guarantee data integrity.

## Harness: Recruitment ATS
- **Goal:** Automatic CV ingestion, semantic vector ranking, interview routing, and stage validation.
- **Directory Scope:** Frontend domain layouts inside `/app/(dashboard)/candidates`, `/jobs`, `/interviews`.