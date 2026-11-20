> **Status update — 20 Nov 2026.** Parts of this document are replaced by [Document 26](./Document26_Revised_SaaS_Foundation_and_Unit_Economics.md) and the [Decision Log](./00_Decision_Log.md). Where they disagree, those two win.
>
> **Superseded:** `creator_id` tenancy (use `organization_id` + RLS), "Project = one video" (Content = one video; Project = optional series), and the reviews entity (use approvals). New entities: media_assets, transcripts, edit_decision_lists, review_comments, export_jobs, usage_ledger.
>
> **Read instead:** ADR-002, ADR-003, Doc 26 §14.

---

# CreatorOS
## Data Model & Domain Architecture

**Document:** 09 — Data Model & Domain Architecture  
**Product:** CreatorOS  
**Version:** 1.0  
**Status:** Architecture Foundation  
**Date:** August 29, 2026  

### Related Documents

- 01 — Market & Competitor Research
- 02 — Customer Problem & Validation
- 03 — Product Differentiation & Strategy
- 04 — Business Model & Financial Feasibility
- 05 — MVP, GTM & Execution Roadmap
- 06 — Product Requirements Document
- 07 — UX/UI & Complete User Journey
- 08 — Feature Specification, User Stories & Acceptance Criteria

---

# 1. Purpose

This document defines the **data architecture and domain model** of CreatorOS.

It answers:

> What data does CreatorOS need to store, how is that data related, who owns it, how does it move through the system, and how can the architecture scale?

This document becomes the foundation for:

- PostgreSQL schema
- backend entities
- API contracts
- AI workflow engine
- analytics system
- recommendation engine
- billing
- authorization
- audit logging
- storage architecture

---

# 2. Core Architecture Principle

CreatorOS should be designed around the concept:

> **Creator → Channel → Content → Workflow → Performance → Intelligence**

The central relationship is:

```text
Creator
   ↓
Channel
   ↓
Content
   ↓
Workflow
   ↓
Production
   ↓
Publication
   ↓
Performance
   ↓
Recommendation
   ↓
Next Content
```

---

# 3. Domain Architecture

The CreatorOS domain can be divided into:

```text
CreatorOS
│
├── Identity Domain
│
├── Creator Domain
│
├── Channel Domain
│
├── Content Domain
│
├── Asset Domain
│
├── Workflow Domain
│
├── AI Execution Domain
│
├── Review Domain
│
├── Publishing Domain
│
├── Analytics Domain
│
├── Recommendation Domain
│
├── Billing Domain
│
├── Notification Domain
│
└── Platform/Admin Domain
```

---

# 4. High-Level Entity Model

```text
User
 │
 └── Creator
       │
       ├── CreatorPreferences
       │
       ├── Channel
       │     │
       │     ├── ChannelVideo
       │     │
       │     ├── ChannelAnalytics
       │     │
       │     └── AudienceInsights
       │
       ├── Project
       │     │
       │     ├── Workflow
       │     │     └── WorkflowTask
       │     │
       │     ├── Asset
       │     │
       │     ├── AIExecution
       │     │
       │     ├── Review
       │     │
       │     └── Publication
       │
       ├── Recommendation
       │
       └── Subscription
```

---

# 5. Core Entities

The initial architecture contains these major entities:

| Entity | Purpose | Priority |
|---|---|---:|
| User | Authentication identity | P0 |
| Creator | Creator profile | P0 |
| CreatorPreference | Creator configuration | P1 |
| Channel | Connected YouTube channel | P0 |
| ChannelVideo | Historical/external video data | P0 |
| Project | A creator's content production project | P0 |
| Workflow | AI-generated production plan | P0 |
| WorkflowTask | Individual workflow operation | P0 |
| Asset | Video/image/audio/script/etc. | P0 |
| AIExecution | AI operation record | P0 |
| Review | Human approval/rejection | P0 |
| Publication | Publishing operation | P0 |
| AnalyticsSnapshot | Performance data | P0 |
| Recommendation | AI growth recommendation | P0 |
| RecommendationFeedback | Creator feedback | P1 |
| Subscription | Billing plan | P1 |
| UsageRecord | Resource consumption | P1 |
| Notification | User notification | P1 |
| AuditLog | Security/action history | P0 |

---

# 6. USER

## Entity

`User`

Represents the application's authenticated identity.

---

## Main Attributes

```text
User
├── id
├── email
├── password_hash
├── email_verified
├── status
├── created_at
├── updated_at
└── last_login_at
```

---

## Rules

- Email must be unique.
- Password must never be stored as plaintext.
- User authentication data must be separated from creator business data.
- Deleted users must follow the platform's data-retention policy.

---

# 7. CREATOR

## Entity

`Creator`

Represents the creator's CreatorOS identity/profile.

---

## Relationship

```text
User 1 ───── 1 Creator
```

---

## Attributes

```text
Creator
├── id
├── user_id
├── display_name
├── bio
├── primary_language
├── timezone
├── content_category
├── creator_status
├── created_at
└── updated_at
```

---

# 8. CREATOR PREFERENCES

## Entity

`CreatorPreference`

Stores creator-specific AI and workflow preferences.

---

## Example

```text
CreatorPreference
├── creator_id
├── preferred_language
├── preferred_tone
├── preferred_video_duration
├── content_style
├── thumbnail_style
├── automation_level
├── notification_preferences
└── updated_at
```

---

## Why This Matters

Two creators can give the same prompt but expect different outputs.

Example:

```text
Creator A
→ Professional educational style

Creator B
→ Fast entertaining style
```

CreatorOS should personalize the workflow.

---

# 9. CHANNEL

## Entity

`Channel`

Represents a connected YouTube channel.

---

## Relationship

```text
Creator 1 ───── N Channel
```

A creator may eventually manage multiple channels.

---

## Attributes

```text
Channel
├── id
├── creator_id
├── platform
├── external_channel_id
├── channel_name
├── channel_url
├── description
├── subscriber_count
├── total_views
├── video_count
├── channel_status
├── connected_at
├── last_synced_at
├── created_at
└── updated_at
```

---

# 10. External Platform Identity

CreatorOS should not assume YouTube is the only future platform.

Instead:

```text
Channel
   │
   ├── platform = youtube
   ├── platform = instagram
   ├── platform = tiktok
   └── platform = facebook
```

The MVP can support only YouTube.

The data model should remain extensible.

---

# 11. CHANNEL VIDEO

## Entity

`ChannelVideo`

Represents a video known to CreatorOS.

It may originate from an external platform or CreatorOS production.

---

## Attributes

```text
ChannelVideo
├── id
├── channel_id
├── external_video_id
├── title
├── description
├── published_at
├── duration_seconds
├── thumbnail_url
├── language
├── category
├── status
├── created_at
└── updated_at
```

---

# 12. PROJECT

## Entity

`Project`

This is one of the most important entities.

A project represents:

> One piece of content the creator is planning, producing, reviewing, and potentially publishing.

---

## Relationship

```text
Creator
   │
   └── N Projects
```

---

## Example

```text
Project
Title:
"RAG Explained for Beginners"

Status:
READY_FOR_REVIEW
```

---

## Attributes

```text
Project
├── id
├── creator_id
├── channel_id
├── title
├── idea
├── content_type
├── target_audience
├── target_duration
├── language
├── status
├── created_at
├── updated_at
└── completed_at
```

---

# 13. PROJECT STATUS

```text
DRAFT
PLANNING
WORKFLOW_APPROVED
PROCESSING
READY_FOR_REVIEW
REVISION
READY_TO_PUBLISH
PUBLISHING
PUBLISHED
ANALYZING
COMPLETED
FAILED
ARCHIVED
```

---

# 14. CONTENT REQUIREMENT

A project should store structured requirements extracted from the creator's idea.

Example:

```text
ContentRequirement
├── project_id
├── topic
├── audience
├── content_goal
├── format
├── duration
├── tone
├── language
├── key_points
└── constraints
```

---

# 15. Why Separate Project and Content?

A project is the **production process**.

A published video is the **result**.

Therefore:

```text
Project
   ↓
Production
   ↓
Publication
   ↓
ChannelVideo
```

This separation allows CreatorOS to manage:

- drafts
- failed projects
- revisions
- unpublished projects
- multiple versions

---

# 16. WORKFLOW

## Entity

`Workflow`

Represents the AI-generated execution plan for a project.

---

## Relationship

```text
Project 1 ───── N Workflow
```

A project may have multiple workflow versions.

---

## Example

```text
Workflow v1

Research
 ↓
Script
 ↓
Captions
 ↓
Thumbnail
 ↓
Metadata
 ↓
QA
 ↓
Review
 ↓
Publish
```

---

## Attributes

```text
Workflow
├── id
├── project_id
├── version
├── status
├── workflow_type
├── generated_by
├── approved_at
├── started_at
├── completed_at
├── created_at
└── updated_at
```

---

# 17. WORKFLOW TASK

## Entity

`WorkflowTask`

Represents one executable operation.

---

## Example

```text
WorkflowTask
├── Generate Script
├── Generate Captions
├── Generate Thumbnail
├── Run QA
└── Publish
```

---

## Attributes

```text
WorkflowTask
├── id
├── workflow_id
├── parent_task_id
├── task_type
├── name
├── description
├── status
├── execution_order
├── retry_count
├── max_retries
├── input_data
├── output_data
├── error_code
├── error_message
├── started_at
├── completed_at
├── created_at
└── updated_at
```

---

# 18. TASK DEPENDENCIES

Tasks should support dependencies.

Example:

```text
Research
   ↓
Script
   ↓
Video
   ↓
Captions
   ↓
QA
   ↓
Publish
```

Database representation can use:

```text
parent_task_id
```

or a dedicated dependency table for complex graphs.

---

# 19. ASSET

## Entity

`Asset`

Represents generated or uploaded content.

---

## Asset Types

```text
VIDEO
IMAGE
AUDIO
SCRIPT
CAPTION
THUMBNAIL
DESCRIPTION
TITLE
METADATA
DOCUMENT
```

---

## Attributes

```text
Asset
├── id
├── project_id
├── creator_id
├── asset_type
├── name
├── storage_key
├── mime_type
├── size_bytes
├── duration_seconds
├── version
├── status
├── created_by
├── created_at
└── updated_at
```

---

# 20. ASSET VERSIONING

Never overwrite important creator work blindly.

Example:

```text
script_v1
script_v2
script_v3
```

The creator should be able to identify the current approved version.

---

# 21. ASSET RELATIONSHIP

```text
Project
  │
  ├── Script
  ├── Video
  ├── Thumbnail
  ├── Captions
  ├── Audio
  └── Metadata
```

---

# 22. AI EXECUTION

## Entity

`AIExecution`

Records an AI operation.

---

## Why It Matters

We need to know:

- what model was used
- what provider was used
- what operation occurred
- how much it cost
- whether it succeeded
- how long it took

---

## Attributes

```text
AIExecution
├── id
├── creator_id
├── project_id
├── workflow_task_id
├── provider
├── model
├── operation
├── input_reference
├── output_reference
├── token_usage
├── estimated_cost
├── latency_ms
├── status
├── error_code
├── started_at
└── completed_at
```

---

# 23. AI PROVIDER ABSTRACTION

Do not design the database around one AI provider.

Instead:

```text
provider
model
operation
```

Example:

```text
provider = ProviderA
model = ModelX
operation = SCRIPT_GENERATION
```

Later:

```text
provider = ProviderB
model = ModelY
```

The rest of CreatorOS does not need to change.

---

# 24. REVIEW

## Entity

`Review`

Represents human approval.

---

## Attributes

```text
Review
├── id
├── project_id
├── asset_id
├── reviewer_id
├── status
├── feedback
├── created_at
└── updated_at
```

---

# 25. REVIEW STATUS

```text
PENDING
APPROVED
REJECTED
REVISION_REQUESTED
```

---

# 26. PUBLICATION

## Entity

`Publication`

Represents an attempt to publish content to an external platform.

---

## Attributes

```text
Publication
├── id
├── project_id
├── channel_id
├── platform
├── external_video_id
├── title
├── description
├── visibility
├── scheduled_at
├── status
├── published_at
├── failure_reason
├── created_at
└── updated_at
```

---

# 27. PUBLICATION STATUS

```text
DRAFT
READY
QUEUED
UPLOADING
PUBLISHED
FAILED
CANCELLED
```

---

# 28. ANALYTICS SNAPSHOT

## Entity

`AnalyticsSnapshot`

Stores channel/video performance at a point in time.

---

## Why Snapshot Data?

Analytics change over time.

We need historical information.

Example:

```text
Video
Day 1
Views: 1,000

Day 7
Views: 8,000

Day 30
Views: 25,000
```

---

## Attributes

```text
AnalyticsSnapshot
├── id
├── channel_id
├── channel_video_id
├── snapshot_date
├── views
├── watch_time
├── subscribers_gained
├── likes
├── comments
├── shares
├── impressions
├── ctr
├── average_view_duration
├── retention
└── created_at
```

Actual fields should match data legally and technically available from the platform APIs.

---

# 29. ANALYTICS GRANULARITY

Initially:

```text
Channel
Video
Daily Snapshot
```

Future:

```text
Hourly
Daily
Weekly
Monthly
```

Do not store unnecessary high-frequency data during MVP.

---

# 30. RECOMMENDATION

## Entity

`Recommendation`

This represents CreatorOS's suggested next action.

---

## Example

```text
Recommendation

Type:
CONTENT_OPPORTUNITY

Suggestion:
Create a video about RAG vs Fine-Tuning.

Reason:
Related topics have performed strongly.

Confidence:
0.84
```

---

## Attributes

```text
Recommendation
├── id
├── creator_id
├── channel_id
├── recommendation_type
├── title
├── explanation
├── priority
├── confidence_score
├── supporting_data
├── status
├── created_at
├── expires_at
└── acted_at
```

---

# 31. RECOMMENDATION STATUS

```text
NEW
VIEWED
ACCEPTED
REJECTED
DISMISSED
EXPIRED
COMPLETED
```

---

# 32. RECOMMENDATION FEEDBACK

## Entity

`RecommendationFeedback`

Stores creator response.

```text
RecommendationFeedback
├── id
├── recommendation_id
├── creator_id
├── feedback_type
├── comment
└── created_at
```

---

# 33. RECOMMENDATION LEARNING LOOP

```text
Historical Data
      ↓
Recommendation
      ↓
Creator Decision
      ↓
Project
      ↓
Publication
      ↓
Performance
      ↓
Outcome
      ↓
Future Recommendation
```

This is a critical long-term intelligence loop.

---

# 34. SUBSCRIPTION

## Entity

`Subscription`

Represents creator billing status.

---

## Attributes

```text
Subscription
├── id
├── creator_id
├── plan_id
├── provider
├── external_subscription_id
├── status
├── current_period_start
├── current_period_end
├── cancel_at_period_end
├── created_at
└── updated_at
```

---

# 35. PLAN

## Entity

`Plan`

Example:

```text
FREE
CREATOR
PRO
BUSINESS
```

Actual pricing is defined in Document 04.

---

# 36. USAGE RECORD

## Entity

`UsageRecord`

Tracks resource consumption.

---

## Example

```text
UsageRecord

Creator:
123

Resource:
VIDEO_PROCESSING_MINUTES

Amount:
35

Period:
August 2026
```

---

## Possible Usage Types

```text
AI_REQUEST
VIDEO_MINUTE
STORAGE_GB
WORKFLOW_EXECUTION
TRANSCRIPTION_MINUTE
IMAGE_GENERATION
```

---

# 37. NOTIFICATION

## Entity

`Notification`

Stores user-facing notifications.

```text
Notification
├── id
├── creator_id
├── type
├── title
├── message
├── severity
├── read_at
├── created_at
└── expires_at
```

---

# 38. AUDIT LOG

## Entity

`AuditLog`

Records important system actions.

---

## Example

```text
Creator approved workflow
Creator rejected thumbnail
Video published
Channel connected
Subscription changed
```

---

## Attributes

```text
AuditLog
├── id
├── user_id
├── creator_id
├── action
├── resource_type
├── resource_id
├── metadata
├── ip_reference
├── created_at
```

Sensitive information should not be unnecessarily stored in logs.

---

# 39. ENTITY RELATIONSHIP OVERVIEW

```text
USER
 │
 │ 1:1
 ↓
CREATOR
 │
 ├───────────────┐
 │               │
 ↓               ↓
CHANNEL       PROJECT
 │               │
 │               ├──── WORKFLOW
 │               │          │
 │               │          └──── WORKFLOW_TASK
 │               │
 │               ├──── ASSET
 │               │
 │               ├──── AI_EXECUTION
 │               │
 │               ├──── REVIEW
 │               │
 │               └──── PUBLICATION
 │
 ├──── ANALYTICS
 │
 ├──── RECOMMENDATION
 │          │
 │          └──── FEEDBACK
 │
 └──── SUBSCRIPTION
```

---

# 40. Complete Data Flow

A typical creator workflow:

```text
USER
 ↓
CREATOR
 ↓
CHANNEL
 ↓
IDEA
 ↓
PROJECT
 ↓
CONTENT REQUIREMENT
 ↓
WORKFLOW
 ↓
WORKFLOW TASKS
 ↓
AI EXECUTIONS
 ↓
ASSETS
 ↓
REVIEWS
 ↓
PUBLICATION
 ↓
CHANNEL VIDEO
 ↓
ANALYTICS SNAPSHOTS
 ↓
RECOMMENDATION
 ↓
NEXT PROJECT
```

---

# 41. Data Ownership

CreatorOS must clearly identify who owns each data category.

### Creator-Owned

- creator profile
- projects
- scripts
- uploaded media
- generated assets
- preferences
- workflow history

### Platform-Derived

- analytics
- channel metadata
- recommendations

### External Platform References

- external channel ID
- external video ID
- publishing identifiers

---

# 42. Multi-Tenant Architecture

CreatorOS is a SaaS platform.

Therefore:

```text
Creator A
 ├── Projects
 ├── Assets
 └── Analytics

Creator B
 ├── Projects
 ├── Assets
 └── Analytics
```

Creator A must NEVER access Creator B's private data.

---

# 43. Tenant Isolation Rule

Every creator-owned entity must be traceable to its creator/tenant.

For example:

```text
project.creator_id
asset.creator_id
recommendation.creator_id
```

Where appropriate, ownership should also be derivable through relationships.

---

# 44. Authorization Model

Initial roles:

```text
CREATOR
ADMIN
```

Future:

```text
CREATOR
EDITOR
MANAGER
ANALYST
ADMIN
OWNER
```

Do not build complex team permissions in MVP unless required by validation.

---

# 45. Database Choice

Recommended primary database:

> **PostgreSQL**

Why:

- relational integrity
- transactions
- mature ecosystem
- strong indexing
- JSON support
- analytics-friendly
- suitable for SaaS
- supports future scale

---

# 46. Why Not Use Only a NoSQL Database?

CreatorOS contains many strongly related entities:

```text
Creator
Project
Workflow
Task
Asset
Publication
Analytics
Recommendation
Billing
```

Relational consistency is valuable.

Therefore PostgreSQL should be the system of record.

---

# 47. JSON Data

PostgreSQL JSON/JSONB can be used selectively for flexible data.

Good examples:

```text
AI configuration
Workflow metadata
Provider response metadata
Recommendation supporting data
```

Do NOT put the entire application database into giant JSON fields.

---

# 48. Object Storage

Large files should NOT be stored directly inside PostgreSQL.

Use object storage for:

- videos
- audio
- images
- thumbnails
- exported files

Database stores:

```text
storage_key
mime_type
size
metadata
```

---

# 49. Recommended Storage Architecture

```text
Application
     ↓
PostgreSQL
     │
     ├── Metadata
     ├── Relationships
     └── State
     
Object Storage
     │
     ├── Videos
     ├── Images
     ├── Audio
     └── Exports
```

---

# 50. Asset Storage Key

Recommended logical structure:

```text
/{creator_id}/{project_id}/{asset_type}/{asset_id}/version
```

Example:

```text
creator-123/
project-456/
video/
asset-789/
v3
```

Never expose predictable private storage paths without proper authorization.

---

# 51. Database Indexing Strategy

Important indexes should eventually exist on:

```text
User.email

Channel.creator_id

Channel.external_channel_id

Project.creator_id

Project.channel_id

Project.status

Workflow.project_id

WorkflowTask.workflow_id

WorkflowTask.status

Asset.project_id

Asset.creator_id

AIExecution.project_id

Publication.project_id

AnalyticsSnapshot.channel_video_id

AnalyticsSnapshot.snapshot_date

Recommendation.creator_id

Recommendation.status

Notification.creator_id
```

Exact indexes should be confirmed using real query patterns.

---

# 52. Unique Constraints

Examples:

```text
User.email
Channel(platform, external_channel_id)
Publication(platform, external_video_id)
```

Only where business rules require uniqueness.

---

# 53. Soft Delete

For important business entities, consider:

```text
deleted_at
```

instead of immediately physically deleting data.

Useful for:

- projects
- assets
- creator data

However, deletion and privacy requests must follow the platform's legal/data-retention requirements.

---

# 54. Timestamps

Major entities should use:

```text
created_at
updated_at
```

Time-sensitive entities may additionally use:

```text
started_at
completed_at
published_at
deleted_at
```

Store timestamps consistently in UTC.

Display them using the creator's timezone.

---

# 55. Data Lifecycle

Example project lifecycle:

```text
Created
 ↓
Active
 ↓
Published
 ↓
Analytics Collected
 ↓
Recommendation Generated
 ↓
Archived
```

---

# 56. Data Retention

Not all data needs to be stored forever.

Define retention policies for:

- temporary video processing files
- failed AI outputs
- provider responses
- logs
- analytics snapshots
- deleted accounts

Retention should balance:

```text
Cost
+
Performance
+
User Value
+
Privacy
+
Legal Requirements
```

---

# 57. Sensitive Data

Potentially sensitive:

- authentication credentials
- provider tokens
- billing identifiers
- private creator assets

These require stronger protection.

Provider access tokens should be:

- encrypted where appropriate
- server-side only
- never exposed to frontend clients
- excluded from logs

---

# 58. AI Data Governance

CreatorOS must define what AI providers receive.

Example:

```text
Creator
   ↓
CreatorOS
   ↓
Data Minimization
   ↓
AI Provider
```

Only necessary information should be sent.

The platform should document applicable provider data-retention/training policies.

---

# 59. Analytics Architecture

Initially:

```text
YouTube API
     ↓
Sync Worker
     ↓
AnalyticsSnapshot
     ↓
Analytics Service
     ↓
Recommendation Engine
```

Future:

```text
Analytics Events
      ↓
Data Warehouse
      ↓
Feature Engineering
      ↓
ML / Recommendation System
```

---

# 60. Recommendation Data Architecture

The recommendation engine should eventually use:

```text
Creator Profile
+
Historical Videos
+
Performance
+
Content Topics
+
Recent Performance
+
Creator Preferences
+
Previous Recommendations
+
Recommendation Outcomes
```

---

# 61. Do Not Build a Complex ML System Initially

MVP recommendation engine can start with:

```text
Rules
+
Analytics
+
LLM reasoning
+
Simple scoring
```

Example:

```text
Opportunity Score =
Topic Performance
+
Audience Interest
+
Content Gap
+
Creator Fit
```

Later:

```text
Machine Learning
+
Embeddings
+
Ranking Models
+
Behavioral Signals
```

---

# 62. Workflow Data Architecture

Workflow execution should be persistent.

Do not depend on frontend state.

Bad:

```text
Browser
 ↓
AI
 ↓
Frontend remembers progress
```

Good:

```text
Frontend
 ↓
Backend
 ↓
Workflow Database
 ↓
Queue
 ↓
Worker
 ↓
Database
```

---

# 63. Job Idempotency

Long-running tasks must support idempotency.

Example:

If a thumbnail generation task runs twice accidentally, the system should not unintentionally charge or create uncontrolled duplicate production results.

Use:

```text
idempotency_key
```

where appropriate.

---

# 64. Transaction Boundaries

Important operations should use database transactions.

Examples:

```text
Create Project
+
Create Workflow
```

or:

```text
Approve Asset
+
Update Project State
```

The exact transaction boundaries belong in implementation design.

---

# 65. Event Architecture

Future CreatorOS may use domain events.

Example:

```text
ProjectPublished
      ↓
AnalyticsSyncRequested
      ↓
AnalyticsUpdated
      ↓
RecommendationRequested
      ↓
RecommendationCreated
```

MVP can implement these using a simpler job/queue architecture.

---

# 66. Event Examples

Potential events:

```text
CreatorConnected
ProjectCreated
WorkflowApproved
WorkflowStarted
TaskCompleted
TaskFailed
AssetGenerated
AssetApproved
PublicationStarted
PublicationCompleted
AnalyticsUpdated
RecommendationCreated
RecommendationAccepted
```

---

# 67. API Boundary

The database must not be directly exposed to frontend clients.

Architecture:

```text
Frontend
   ↓
API
   ↓
Service Layer
   ↓
Database
```

For complex operations:

```text
API
 ↓
Application Service
 ↓
Queue
 ↓
Worker
 ↓
Database
```

---

# 68. Domain Service Boundaries

Recommended services/modules:

```text
AuthService
CreatorService
ChannelService
ProjectService
WorkflowService
AssetService
AIService
ReviewService
PublishingService
AnalyticsService
RecommendationService
BillingService
NotificationService
```

These can initially exist as modules inside one backend application.

They do NOT need to be separate microservices.

---

# 69. Important Architecture Decision

### MVP

Use a **modular monolith**.

```text
CreatorOS Backend
│
├── Auth Module
├── Creator Module
├── Channel Module
├── Project Module
├── Workflow Module
├── AI Module
├── Asset Module
├── Publishing Module
├── Analytics Module
├── Recommendation Module
└── Billing Module
```

### Later

Extract services only when scale or operational requirements justify it.

---

# 70. Why Modular Monolith?

For a startup:

- faster development
- easier debugging
- lower infrastructure cost
- simpler deployment
- easier transactions
- less DevOps complexity

Do not start with 20 microservices.

---

# 71. Core Data Flow Example

Creator enters:

> "Create a beginner video explaining RAG."

System:

```text
1. Create Project
        ↓
2. Create ContentRequirement
        ↓
3. AI understands idea
        ↓
4. Generate Workflow
        ↓
5. Save Workflow
        ↓
6. Create Tasks
        ↓
7. Execute Tasks
        ↓
8. Generate Assets
        ↓
9. Review
        ↓
10. Publish
        ↓
11. Collect Analytics
        ↓
12. Generate Recommendation
```

---

# 72. Data Integrity Rules

### Rule 1

A project must belong to a creator.

### Rule 2

A workflow must belong to a project.

### Rule 3

A workflow task must belong to a workflow.

### Rule 4

An asset must have an owner/project relationship.

### Rule 5

A publication must reference a project/channel.

### Rule 6

Analytics must identify their source platform.

### Rule 7

Recommendation must identify the creator/channel context.

---

# 73. Example Relational Structure

Conceptually:

```text
users
  ↓
creators
  ↓
channels
  ↓
projects
  ↓
workflows
  ↓
workflow_tasks
```

Additional:

```text
projects
  ├── assets
  ├── ai_executions
  ├── reviews
  └── publications
```

And:

```text
channels
  ├── channel_videos
  └── analytics_snapshots

creators
  ├── recommendations
  ├── subscriptions
  └── notifications
```

---

# 74. Future Team Architecture

Later, CreatorOS may support:

```text
Organization
   ↓
Workspace
   ↓
Members
   ↓
Roles
   ↓
Channels
   ↓
Projects
```

Do not make this mandatory for the initial single-creator MVP.

---

# 75. Future Multi-Platform Architecture

The model should eventually support:

```text
Creator
   │
   └── Channel
        │
        ├── YouTube
        ├── TikTok
        ├── Instagram
        └── Facebook
```

But platform-specific behavior should remain behind integration modules.

---

# 76. Future AI Memory

CreatorOS may eventually maintain:

```text
Creator Memory
│
├── Preferences
├── Content Style
├── Historical Topics
├── Successful Patterns
├── Rejected Suggestions
├── Brand Rules
└── Workflow Preferences
```

This should be built carefully and transparently.

---

# 77. Data Model Golden Rule

Do not store data simply because:

> "Maybe we need it later."

Every important field should have a reason.

Ask:

> What product capability requires this data?

This prevents database bloat and unnecessary privacy risk.

---

# 78. MVP Database Priority

### P0 Tables

```text
users
creators
creator_preferences
channels
channel_videos
projects
content_requirements
workflows
workflow_tasks
assets
ai_executions
reviews
publications
analytics_snapshots
recommendations
audit_logs
```

### P1 Tables

```text
recommendation_feedback
subscriptions
plans
usage_records
notifications
```

### P2

```text
organizations
workspaces
team_members
advanced_events
ML_features
```

---

# 79. Database Migration Strategy

Never manually modify production tables without migrations.

Use versioned migrations:

```text
001_initial_schema
002_add_projects
003_add_workflows
004_add_assets
005_add_analytics
...
```

Every schema change must be reproducible.

---

# 80. Backup Strategy

Production database should eventually have:

- automated backups
- point-in-time recovery where supported
- tested restore procedures
- backup monitoring

A backup that has never been restored/tested should not be considered reliable.

---

# 81. Disaster Recovery

Critical systems should define:

### RPO

How much data can potentially be lost?

### RTO

How quickly must the service recover?

Exact production targets should be defined before commercial launch.

---

# 82. Data Security Checklist

```text
✓ Password hashing
✓ Encryption in transit
✓ Encryption at rest where appropriate
✓ Secure secrets management
✓ Provider token protection
✓ Tenant isolation
✓ Authorization checks
✓ Audit logs
✓ Database backups
✓ Storage access controls
✓ Input validation
✓ Rate limiting
✓ Secure deletion process
```

---

# 83. Data Architecture Principle

CreatorOS should treat the database as:

> **The system of record.**

External platforms are:

> **External sources and destinations.**

AI providers are:

> **Processing services.**

Object storage is:

> **Media storage.**

The workflow engine is:

> **The orchestration layer.**

---

# 84. Complete Architecture

```text
                         CREATOROS
                            │
              ┌─────────────┴─────────────┐
              │                           │
          Frontend                    Backend API
                                          │
                              ┌───────────┴───────────┐
                              │                       │
                         Domain Modules           Workflow
                              │                    Engine
                              │                       │
                              ↓                       ↓
                         PostgreSQL                Queue
                              │                       │
                              │                    Workers
                              │                       │
                ┌─────────────┴───────┐       ┌──────┴──────┐
                │                     │       │             │
          Application Data      Analytics   AI Providers  Video Tools
                                     
                             
Object Storage
      │
      ├── Videos
      ├── Audio
      ├── Images
      └── Generated Assets

External Platforms
      │
      └── YouTube
```

---

# 85. Most Important Architectural Decision

The system should not be built around:

> "Which AI model are we using?"

It should be built around:

> **What creator outcome are we trying to accomplish?**

For example:

```text
Creator wants:
"Publish a professional educational video."

CreatorOS decides:
      ↓
What tasks?
      ↓
What tools?
      ↓
What AI?
      ↓
What processing?
      ↓
What validation?
      ↓
What approval?
      ↓
What publishing?
```

That is the foundation of the CreatorOS orchestration architecture.

---

# 86. Data Architecture Success Criteria

Document 09 is successful if engineering can use it to answer:

- Where does creator data live?
- Where does project data live?
- How are workflows represented?
- How are workflow tasks represented?
- How are assets stored?
- How are AI operations tracked?
- How are approvals stored?
- How is publishing tracked?
- How is analytics stored?
- How are recommendations connected to outcomes?
- How are tenants isolated?
- How can the system scale?

---

# 87. Final Domain Model

The most important relationship in CreatorOS is:

```text
                    CREATOR
                       │
                       ↓
                    CHANNEL
                       │
                       ↓
                    PROJECT
                       │
                       ↓
                   WORKFLOW
                       │
                       ↓
                 WORKFLOW TASKS
                       │
                       ↓
                  AI / TOOLS
                       │
                       ↓
                    ASSETS
                       │
                       ↓
                    REVIEW
                       │
                       ↓
                  PUBLICATION
                       │
                       ↓
                  PERFORMANCE
                       │
                       ↓
                RECOMMENDATION
                       │
                       ↓
                  NEXT PROJECT
```

This creates the central CreatorOS loop:

> **Create → Produce → Review → Publish → Measure → Learn → Recommend → Create Better**

---

# 88. Final Recommendation

Do not immediately create the production database from this document.

Before implementation, the CTO/engineering stage should convert this domain model into:

1. **Database ERD**
2. **PostgreSQL schema**
3. **Entity relationships**
4. **Indexes**
5. **Constraints**
6. **Migration plan**
7. **API contracts**
8. **Authorization model**

These belong to the next technical architecture stage.

---

# END OF DOCUMENT 09