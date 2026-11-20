# CreatorOS — Documentation Index

**Start here:**

1. [Document 26 — Revised SaaS Foundation & Unit Economics](./Document26_Revised_SaaS_Foundation_and_Unit_Economics.md): what we build first, pricing, and whether it makes a profit.
2. [Decision Log](./00_Decision_Log.md): the 19 accepted decisions. **It wins over every other document.**
3. [Implementation Plan](./Implementation_Plan.md): the step-by-step build plan, a copy of the live plan doc.
4. [Engineering progress](./engineering/PROGRESS.md): where the build is now; the coding agent keeps it up to date.

Coding agents: start with [AGENTS.md](../AGENTS.md) and the [prompt kit](../prompts/README.md).

Documents marked "Partly superseded" have a status note at the top that says which parts changed.

## Strategy and business

| # | Document | Status |
| --- | --- | --- |
| 01 | [Market & Competitor Research](<./Document01_CreatorOS Market and  Competitor Research.md>) | Current (add Gling, YouTube A/B testing and Ask Studio; see Doc 26 §10) |
| 02 | [Customer Problem & Validation Research](<./Document2_CreatorOS — Customer Problem & Validation Research.md>) | Current |
| 03 | [Product Differentiation & Strategy](<./Document3_CreatorOS — Product Differentiation & Strategy.md>) | Partly superseded (wedge confirmed and narrowed) |
| 04 | [Business Model & Financial Feasibility](<./Document4_CreatorOS — Business Model & Financial Feasibility.md>) | Partly superseded (pricing, cost target) |
| 05 | [MVP, GTM & Execution Roadmap](<./Document5_CreatorOS — MVP, GTM & Execution Roadmap.md>) | Partly superseded (MVP order, gate) |
| 26 | [Revised SaaS Foundation & Unit Economics](./Document26_Revised_SaaS_Foundation_and_Unit_Economics.md) | **Current, wins** |

## Product

| # | Document | Status |
| --- | --- | --- |
| 06 | [Product Requirements Document (PRD)](<./Document6_Product Requirements Document (PRD).md>) | Partly superseded (MVP scope) |
| 07 | [UX/UI & User Journey](<./Document7_UXUI Complete User Journey Specification.md>) | Partly superseded (confidence display, onboarding order) |
| 08 | [Feature Specification & Engineering Requirements](<./Document8_Feature Specification and Engineering Requirements.md>) | Partly superseded (P0 list) |

## Engineering

| # | Document | Status |
| --- | --- | --- |
| 09 | [Data Model & Domain Architecture](<./Document09_Data Model and Domain Architecture.md>) | Partly superseded (tenancy, "Project", reviews) |
| 10 | [System Architecture](<./Document10_System Architecture  Technical Architecture Specification.md>) | Current (stack confirmed in ADR-006) |
| 11 | [API Specification & Engineering Contracts](<./Document11 API Specification & Engineering Contracts.md>) | Partly superseded (envelope, auth, routes) |
| 12 | [Security, Privacy & Compliance](<./Document12 Security, Privacy & Compliance Architecture.md>) | Partly superseded (tenancy name, scope plan) |
| 13 | [AI / ML / RAG & Creator Intelligence](<./Document13 AI  ML  RAG  Creator Intelligence Architecture.md>) | Partly superseded (routing, confidence) |
| 14 | [Quality Engineering, Testing & AI Evaluation](<./Document14Quality Engineering, Testing & AI Evaluation Strategy.md>) | Current |
| 17 | [Backend Engineering Specification](<./Document17 Backend Engineering Specification.md>) | Partly superseded (envelope, job types) |
| 18 | [Frontend Engineering Specification](<./Document18 Frontend Engineering Specification.md>) | Current (use "Content = one video", ADR-003) |
| 19 | [Media Processing & AI Video Pipeline](<./Document19 Media Processing & AI Video Production Pipeline Specification.md>) | Partly superseded (generated-video MVP, full upload) |
| 22 | [Database Architecture & ERD](<./Document22_ Database Architecture ERD Specification.md>) | Partly superseded (missing tables; see Doc 26 §14) |
| 25 | [AI Intelligence, ML & AI Engineering](<./Document25 AI Intelligence, Machine Learning & AI Engineering Architecture.md>) | Partly superseded (routing, confidence) |

## Tools

- [models/unit_economics.py](./models/unit_economics.py): the cost and margin model behind Doc 26 §8. Edit the prices and run `python3 docs/models/unit_economics.py`.

## Missing (referenced by other docs, not written yet)

- 15: DevOps & Infrastructure
- 16: Data & Analytics
- 20, 21, 23, 24
- Coding standards, repository architecture, workflow architecture

Until they exist, the Decision Log and Doc 26 cover the decisions that matter for the MVP.
