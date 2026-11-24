# CreatorOS — Documentation Index

**Start here:**

1. [Document 26 — Revised SaaS Foundation & Unit Economics](./26_Revised_SaaS_Foundation_and_Unit_Economics.md): what we build first, pricing, and whether it makes a profit.
2. [Decision Log](./00_Decision_Log.md): the decisions (ADR-001 to 023; ADR-020 sets the worldwide market focus; ADR-021 to 023 the job queue, data layer and sign-in). **It wins over every other document.**
3. [Implementation Plan](./Implementation_Plan.md): the step-by-step build plan, a copy of the live plan doc.
4. [Engineering progress](./engineering/PROGRESS.md): where the build is now; the coding agent keeps it up to date.
5. [Contracts reference](./engineering/CONTRACTS.md): the state machines, error codes, envelopes, pagination and IDs that every layer shares (built in M2).

Coding agents: start with [AGENTS.md](../AGENTS.md) and the [prompt kit](../prompts/README.md).

Documents marked "Partly superseded" have a status note at the top that says which parts changed.

## Strategy and business

| # | Document | Status |
| --- | --- | --- |
| 01 | [Market & Competitor Research](./01_Market_and_Competitor_Research.md) | Current (add Gling, YouTube A/B testing and Ask Studio; see Doc 26 §10). Geography superseded by ADR-020 |
| 02 | [Customer Problem & Validation Research](./02_Customer_Problem_and_Validation_Research.md) | Current |
| 03 | [Product Differentiation & Strategy](./03_Product_Differentiation_and_Strategy.md) | Partly superseded (wedge confirmed and narrowed) |
| 04 | [Business Model & Financial Feasibility](./04_Business_Model_and_Financial_Feasibility.md) | Partly superseded (pricing, cost target, geography: ADR-020) |
| 05 | [MVP, GTM & Execution Roadmap](./05_MVP_GTM_and_Execution_Roadmap.md) | Partly superseded (MVP order, gate, geography: ADR-020) |
| 26 | [Revised SaaS Foundation & Unit Economics](./26_Revised_SaaS_Foundation_and_Unit_Economics.md) | **Current, wins** (market focus, pricing region and the week-4 gate updated by ADR-020) |

## Product

| # | Document | Status |
| --- | --- | --- |
| 06 | [Product Requirements Document (PRD)](./06_Product_Requirements_Document_PRD.md) | Partly superseded (MVP scope) |
| 07 | [UX/UI & User Journey](./07_UX_UI_Complete_User_Journey_Specification.md) | Partly superseded (confidence display, onboarding order) |
| 08 | [Feature Specification & Engineering Requirements](./08_Feature_Specification_and_Engineering_Requirements.md) | Partly superseded (P0 list) |

## Engineering

| # | Document | Status |
| --- | --- | --- |
| 09 | [Data Model & Domain Architecture](./09_Data_Model_and_Domain_Architecture.md) | Partly superseded (tenancy, "Project", reviews) |
| 10 | [System Architecture](./10_System_and_Technical_Architecture_Specification.md) | Current (stack confirmed in ADR-006) |
| 11 | [API Specification & Engineering Contracts](./11_API_Specification_and_Engineering_Contracts.md) | Partly superseded (envelope, auth, routes) |
| 12 | [Security, Privacy & Compliance](./12_Security_Privacy_and_Compliance_Architecture.md) | Partly superseded (tenancy name, scope plan) |
| 13 | [AI / ML / RAG & Creator Intelligence](./13_AI_ML_RAG_Creator_Intelligence_Architecture.md) | Partly superseded (routing, confidence) |
| 14 | [Quality Engineering, Testing & AI Evaluation](./14_Quality_Engineering_Testing_and_AI_Evaluation_Strategy.md) | Current |
| 17 | [Backend Engineering Specification](./17_Backend_Engineering_Specification.md) | Partly superseded (envelope, job types) |
| 18 | [Frontend Engineering Specification](./18_Frontend_Engineering_Specification.md) | Current (use "Content = one video", ADR-003) |
| 19 | [Media Processing & AI Video Pipeline](./19_Media_Processing_and_AI_Video_Production_Pipeline_Specification.md) | Partly superseded (generated-video MVP, full upload) |
| 22 | [Database Architecture & ERD](./22_Database_Architecture_ERD_Specification.md) | Partly superseded (missing tables; see Doc 26 §14) |
| 25 | [AI Intelligence, ML & AI Engineering](./25_AI_Intelligence_ML_and_AI_Engineering_Architecture.md) | Partly superseded (routing, confidence) |

## Tools

- [models/unit_economics.py](./models/unit_economics.py): the cost and margin model behind Doc 26 §8. Edit the prices and run `python3 docs/models/unit_economics.py`.

## Missing (referenced by other docs, not written yet)

- 15: DevOps & Infrastructure
- 16: Data & Analytics
- 20, 21, 23, 24
- Coding standards, repository architecture, workflow architecture

Until they exist, the Decision Log and Doc 26 cover the decisions that matter for the MVP.
