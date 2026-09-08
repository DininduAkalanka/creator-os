# CreatorOS
## Document 22 — Database Architecture & ERD Specification

**Product:** CreatorOS  
**Document:** 22  
**Version:** 1.0  
**Status:** Production Architecture Foundation  
**Date:** August 29, 2026

---

# 1. DOCUMENT PURPOSE

This document defines the database architecture for CreatorOS.

It establishes:

- Core entities
- Relationships
- Primary keys
- Foreign keys
- Multi-tenant isolation
- Content structure
- Workflow persistence
- AI generation history
- Media/assets
- YouTube integrations
- Publishing
- Analytics
- Recommendations
- Usage and billing
- Auditability
- Scalability
- Data retention

The objective is to create a database architecture that can support CreatorOS from:

```text
MVP
 ↓
Early customers
 ↓
Thousands of creators
 ↓
Large-scale SaaS
```

without unnecessarily over-engineering the first version.

---

# 2. OUR MAJOR GOAL — ALWAYS CONFIRMED

CreatorOS is NOT simply:

> "An AI video generator."

Our major goal is:

> **Build an AI-powered Creator Operating System that understands the creator, automates repetitive content workflows, intelligently orchestrates AI/media tools, helps creators produce professional content, connects publishing with analytics, and continuously turns performance data into recommendations that help creators grow.**

Our core loop:

```text
IDEA
 ↓
PLAN
 ↓
CREATE
 ↓
EDIT
 ↓
REVIEW
 ↓
PUBLISH
 ↓
MEASURE
 ↓
LEARN
 ↓
RECOMMEND
 ↓
CREATE AGAIN
```

The database must preserve the information required to make this loop possible.

---

# 3. DATABASE IS THE MEMORY OF CREATOROS

CreatorOS needs persistent memory.

Without a database:

```text
Creator enters idea
 ↓
AI generates video
 ↓
Finished
```

The system forgets important context.

With the database:

```text
Creator
 ↓
Channel
 ↓
Content history
 ↓
Workflow history
 ↓
Performance
 ↓
AI generations
 ↓
Recommendations
 ↓
Creator decisions
 ↓
Future content
```

Therefore:

> **The database is not merely storage. It is the persistent memory and operational backbone of CreatorOS.**

---

# 4. DATABASE TECHNOLOGY RECOMMENDATION

## Primary Database

Recommended:

> **PostgreSQL**

Why:

```text
Strong relational model
ACID transactions
Foreign keys
JSONB
Indexes
Full-text search
Extensions
Mature ecosystem
Excellent tooling
Cloud availability
```

PostgreSQL should be the **system of record**.

---

# 5. IMPORTANT ARCHITECTURAL PRINCIPLE

Do NOT put everything into PostgreSQL.

Use specialized infrastructure when appropriate.

```text
                 CreatorOS
                    │
       ┌────────────┼─────────────┐
       ▼            ▼             ▼
 PostgreSQL       Object         Cache
                  Storage        / Queue
       │
       ├── Business data
       ├── Metadata
       ├── Workflow state
       ├── Analytics aggregates
       └── AI history
```

---

# 6. WHAT POSTGRESQL STORES

PostgreSQL should store:

```text
Users
Organizations
Memberships
Creator profiles
Channels
Projects
Content
Scripts
Scenes
Assets metadata
Workflows
Workflow steps
Jobs
AI generations
Provider records
Publishing records
Analytics aggregates
Recommendations
Subscriptions
Usage
Notifications
Audit logs
```

---

# 7. WHAT OBJECT STORAGE STORES

Large media should NOT normally be stored directly inside PostgreSQL.

Use object storage for:

```text
Raw videos
Rendered videos
Audio
Images
Thumbnails
Subtitle files
Project exports
Temporary media
```

PostgreSQL stores references:

```text
asset_id
storage_key
mime_type
size
duration
metadata
```

---

# 8. REDIS / QUEUE LAYER

Redis or an equivalent infrastructure can support:

```text
Caching
Job queues
Temporary state
Rate limiting
Distributed locks
Workflow coordination
```

However:

> Redis is NOT the source of truth.

PostgreSQL remains authoritative for persistent business state.

---

# 9. HIGH-LEVEL DATABASE ARCHITECTURE

```text
                       CreatorOS
                          │
                          ▼
                    PostgreSQL
                          │
       ┌──────────────────┼──────────────────┐
       │                  │                  │
       ▼                  ▼                  ▼
   Identity            Content           Operations
       │                  │                  │
       │                  ├── Projects       ├── Workflows
       │                  ├── Content        ├── Jobs
       │                  ├── Scripts        └── Publishing
       │                  ├── Scenes
       │                  └── Assets
       │
       ├── Users
       ├── Organizations
       └── Memberships

       ┌──────────────────┼──────────────────┐
       ▼                  ▼                  ▼
   Intelligence       Analytics           Business
       │                  │                  │
       ├── AI Runs        ├── Videos         ├── Plans
       ├── Recommendations├── Metrics        ├── Subscriptions
       └── Providers      └── Snapshots      └── Usage
```

---

# 10. CORE DOMAIN GROUPS

The database is divided conceptually into:

```text
1. Identity
2. Organization / Tenant
3. Creator / Channel
4. Content
5. Media
6. Workflow
7. AI
8. Publishing
9. Analytics
10. Recommendations
11. Billing
12. Usage
13. Notifications
14. Audit / Security
```

---

# 11. MASTER ENTITY MAP

Core entities:

```text
users
organizations
memberships
creator_profiles

channels
channel_connections

projects
content
content_versions

scripts
scenes

assets
asset_versions

workflows
workflow_steps
jobs

ai_providers
ai_models
ai_generations

publishing_jobs

analytics_snapshots
video_metrics
channel_metrics

recommendations
recommendation_actions

plans
subscriptions
usage_records

notifications
audit_logs
```

---

# 12. ENTITY RELATIONSHIP OVERVIEW

The central relationship:

```text
Organization
     │
     ├── Users / Memberships
     │
     ├── Channels
     │
     ├── Projects
     │       │
     │       └── Content
     │              │
     │              ├── Versions
     │              ├── Scripts
     │              ├── Scenes
     │              ├── Assets
     │              └── Workflows
     │
     └── Subscription
```

---

# 13. USER

Table:

```text
users
```

Purpose:

Stores authentication-independent application-level user information.

Suggested fields:

```text
id
email
display_name
avatar_url
locale
timezone
status
created_at
updated_at
last_login_at
```

---

# 14. USER ID

Recommended:

```text
UUID
```

Example:

```text
user_id = UUID
```

Avoid exposing sequential IDs where possible.

---

# 15. ORGANIZATION

Table:

```text
organizations
```

Purpose:

Defines the tenant/account boundary.

Fields:

```text
id
name
slug
owner_user_id
status
created_at
updated_at
```

---

# 16. WHY ORGANIZATIONS MATTER

Even if MVP has one creator per account, designing around organizations gives us future support for:

```text
Solo creators
Creator teams
Agencies
Content studios
Businesses
Enterprise customers
```

---

# 17. MEMBERSHIP

Table:

```text
organization_memberships
```

Fields:

```text
id
organization_id
user_id
role
status
created_at
updated_at
```

Roles may eventually include:

```text
OWNER
ADMIN
EDITOR
ANALYST
VIEWER
```

---

# 18. MULTI-TENANCY

Every tenant-owned record should be traceable to an organization.

Example:

```text
organization
    │
    ├── projects
    ├── channels
    ├── content
    ├── assets
    ├── workflows
    └── analytics
```

This is critical for SaaS isolation.

---

# 19. CREATOR PROFILE

Table:

```text
creator_profiles
```

Purpose:

Stores creator-specific preferences and long-term context.

Fields:

```text
id
organization_id
user_id
display_name
bio
niche
primary_language
content_style
brand_preferences
default_content_settings
created_at
updated_at
```

Some flexible preferences can use:

```text
JSONB
```

but important queryable fields should remain relational.

---

# 20. CREATOR MEMORY

Eventually CreatorOS can maintain structured creator context:

```text
Preferred tone
Preferred video duration
Brand style
Audience
Content categories
Preferred voice
Preferred visual style
Typical CTA
```

This information powers personalization.

---

# 21. CHANNEL

Table:

```text
channels
```

Fields:

```text
id
organization_id
platform
external_channel_id
name
handle
description
thumbnail_url
status
created_at
updated_at
last_synced_at
```

Initially:

```text
platform = YOUTUBE
```

Future:

```text
TikTok
Instagram
Facebook
```

---

# 22. CHANNEL CONNECTION

Table:

```text
channel_connections
```

Purpose:

Stores integration metadata.

Fields:

```text
id
organization_id
channel_id
provider
external_account_id
connection_status
scopes
token_reference
expires_at
created_at
updated_at
```

IMPORTANT:

> OAuth access tokens and refresh tokens should be stored securely, preferably using encrypted secret storage rather than plain database columns.

---

# 23. PROJECT

Table:

```text
projects
```

Purpose:

Groups related content work.

Example:

```text
"RAG Tutorial Series"
```

Fields:

```text
id
organization_id
channel_id
name
description
status
created_by
created_at
updated_at
```

---

# 24. CONTENT

Table:

```text
contents
```

This is one of the most important tables.

Fields:

```text
id
organization_id
project_id
channel_id

content_type
title
description
status

current_version_id

created_by
created_at
updated_at
published_at
```

Content types:

```text
LONG_FORM_VIDEO
SHORT
THUMBNAIL
SCRIPT
AUDIO
```

---

# 25. CONTENT LIFECYCLE

Content states:

```text
IDEA
PLANNING
SCRIPTING
PRODUCING
EDITING
REVIEW
APPROVED
SCHEDULED
PUBLISHED
ARCHIVED
FAILED
```

Avoid excessive states.

Every state must have a clear business meaning.

---

# 26. CONTENT VERSION

Table:

```text
content_versions
```

Why?

Creators need:

```text
Version 1
Version 2
Version 3
Final
```

Fields:

```text
id
content_id
version_number
title
description
status
created_by
created_at
```

---

# 27. VERSIONING PRINCIPLE

Never destroy creator work unnecessarily.

Instead:

```text
v1
 ↓
v2
 ↓
v3
 ↓
approved
```

This supports:

```text
Undo
Restore
Comparison
Audit
Experimentation
```

---

# 28. SCRIPT

Table:

```text
scripts
```

Fields:

```text
id
content_id
version_id
body
structured_data
word_count
language
status
created_by
created_at
updated_at
```

The script can contain structured scene information.

---

# 29. SCENE

Table:

```text
scenes
```

Fields:

```text
id
content_id
script_id
scene_number
narration
visual_description
duration_ms
transition_type
status
created_at
updated_at
```

---

# 30. WHY SCENES ARE IMPORTANT

CreatorOS is not just storing a script.

It needs to connect:

```text
Narration
 ↓
Visual
 ↓
Audio
 ↓
Caption
 ↓
Timing
 ↓
Video
```

The scene entity enables this.

---

# 31. ASSET

Table:

```text
assets
```

Assets include:

```text
Video
Image
Audio
Music
Logo
Thumbnail
Subtitle
```

Fields:

```text
id
organization_id
project_id
content_id

asset_type
storage_key
mime_type
file_size
duration_ms
width
height

source_type
provider
status

created_by
created_at
updated_at
```

---

# 32. ASSET SOURCE TYPE

Examples:

```text
UPLOADED
AI_GENERATED
STOCK
IMPORTED
SCREEN_RECORDING
EXTRACTED
```

---

# 33. ASSET VERSION

Table:

```text
asset_versions
```

Useful when an asset is regenerated.

Example:

```text
Thumbnail v1
Thumbnail v2
Thumbnail v3
```

---

# 34. WORKFLOW

Table:

```text
workflows
```

This is another **core CreatorOS table**.

Fields:

```text
id
organization_id
project_id
content_id

workflow_type
status
progress

created_by
started_at
completed_at
failed_at

created_at
updated_at
```

---

# 35. WORKFLOW TYPES

Examples:

```text
YOUTUBE_VIDEO
SHORT_CREATION
CONTENT_REPURPOSING
THUMBNAIL_GENERATION
SCRIPT_GENERATION
PUBLISHING
ANALYTICS_SYNC
```

---

# 36. WORKFLOW STEP

Table:

```text
workflow_steps
```

Fields:

```text
id
workflow_id
step_key
step_type
sequence
status
input_data
output_data
depends_on
started_at
completed_at
error_code
created_at
updated_at
```

---

# 37. WORKFLOW DEPENDENCIES

Example:

```text
SCRIPT
  │
  ├── VOICE
  │     │
  │     └── CAPTIONS
  │
  └── SCENES
         │
         └── VIDEO
```

The database needs to preserve this dependency graph.

---

# 38. JOB

Table:

```text
jobs
```

Purpose:

Tracks asynchronous processing.

Fields:

```text
id
organization_id
workflow_id
workflow_step_id

job_type
status
priority
attempt_count
max_attempts

input_reference
output_reference

started_at
completed_at
failed_at
error_code
error_message

created_at
updated_at
```

---

# 39. JOB STATES

```text
QUEUED
RUNNING
COMPLETED
FAILED
RETRYING
CANCELLED
```

---

# 40. AI PROVIDER

Table:

```text
ai_providers
```

Example conceptual records:

```text
Provider A
Provider B
Provider C
```

Fields:

```text
id
name
provider_type
status
configuration
created_at
updated_at
```

Provider credentials should NOT be stored as ordinary plaintext database values.

---

# 41. AI MODEL

Table:

```text
ai_models
```

Fields:

```text
id
provider_id
model_name
capability
version
status
cost_configuration
quality_metadata
created_at
updated_at
```

Capabilities:

```text
TEXT
IMAGE
VIDEO
TTS
STT
EMBEDDING
```

---

# 42. AI GENERATION

Table:

```text
ai_generations
```

This records AI activity.

Fields:

```text
id
organization_id
content_id
workflow_id
job_id

provider_id
model_id

task_type
input_reference
output_reference

status
latency_ms
input_units
output_units
estimated_cost

created_at
completed_at
```

---

# 43. WHY AI GENERATION HISTORY MATTERS

We need to know:

```text
Which model?
Which provider?
What task?
How much did it cost?
How long did it take?
Did it succeed?
```

This enables intelligent routing later.

---

# 44. AI ROUTING DATA

Eventually CreatorOS can analyze:

```text
Provider quality
Provider cost
Provider latency
Provider failure rate
Creator preferences
```

and improve tool selection.

This supports one of our strongest differentiators.

---

# 45. MEDIA RENDER

A dedicated table may be useful:

```text
media_renders
```

Fields:

```text
id
content_id
workflow_id
job_id
source_version_id
output_asset_id

render_type
resolution
format
duration_ms

status
render_engine
created_at
completed_at
```

---

# 46. PUBLISHING JOB

Table:

```text
publishing_jobs
```

Fields:

```text
id
organization_id
channel_id
content_id
content_version_id

platform
external_video_id

title
description
visibility

scheduled_at
published_at

status
error_code
error_message

created_at
updated_at
```

---

# 47. PUBLISHING STATES

```text
DRAFT
READY
QUEUED
UPLOADING
PROCESSING
SCHEDULED
PUBLISHED
FAILED
CANCELLED
```

---

# 48. IMPORTANT PUBLISHING RULE

Publishing must always be connected to:

```text
Content version
```

not merely:

```text Content
```

because creators may have approved a specific version.

---

# 49. ANALYTICS ARCHITECTURE

Analytics data can become extremely large.

Therefore:

> Do not blindly store every raw platform response forever in relational tables.

Use different layers.

```text
YouTube API
 ↓
Raw ingestion
 ↓
Normalized analytics
 ↓
Aggregated metrics
 ↓
Recommendation engine
```

---

# 50. VIDEO METRICS

Table:

```text
video_metrics
```

Potential fields:

```text
id
channel_id
content_id
external_video_id

captured_at

views
likes
comments
shares
watch_time
average_view_duration
average_percentage_viewed
impressions
click_through_rate
subscribers_gained
```

Only store metrics actually available and permitted through the platform APIs.

---

# 51. CHANNEL METRICS

Table:

```text
channel_metrics
```

Potential fields:

```text
id
channel_id
captured_at

subscriber_count
video_count
view_count
watch_time
```

---

# 52. ANALYTICS SNAPSHOT

Table:

```text
analytics_snapshots
```

Purpose:

Stores normalized periodic snapshots.

Example:

```text
Channel performance
2026-08-01
2026-08-02
2026-08-03
```

This enables trend analysis.

---

# 53. RAW ANALYTICS

If raw provider payloads are required for debugging:

```text
analytics_ingestion_events
```

Store them with retention policies.

Do not allow an unlimited database-growth strategy.

---

# 54. RECOMMENDATION

Table:

```text
recommendations
```

This is central to the CreatorOS growth engine.

Fields:

```text
id
organization_id
channel_id
content_id

recommendation_type
title
description

priority
confidence

reasoning_reference

status

created_at
expires_at
```

---

# 55. RECOMMENDATION TYPES

Examples:

```text
CONTENT_IDEA
TITLE_IMPROVEMENT
THUMBNAIL_IMPROVEMENT
PUBLISHING_TIME
CONTENT_FORMAT
TOPIC_OPPORTUNITY
RETENTION_IMPROVEMENT
REPURPOSING
FOLLOW_UP_CONTENT
```

---

# 56. RECOMMENDATION ACTION

Table:

```text
recommendation_actions
```

Tracks:

```text
accepted
dismissed
executed
ignored
```

Fields:

```text
id
recommendation_id
user_id
action
created_at
```

---

# 57. CRITICAL RECOMMENDATION LOOP

```text
Analytics
    ↓
AI Analysis
    ↓
Recommendation
    ↓
Creator accepts
    ↓
Workflow created
    ↓
Content produced
    ↓
Published
    ↓
New analytics
```

The database connects this entire loop.

---

# 58. BILLING PLAN

Table:

```text
plans
```

Fields:

```text
id
name
description
price
billing_interval
status
limits
features
created_at
updated_at
```

---

# 59. SUBSCRIPTION

Table:

```text
subscriptions
```

Fields:

```text
id
organization_id
plan_id

external_subscription_id
status

current_period_start
current_period_end

created_at
updated_at
cancelled_at
```

---

# 60. USAGE

Table:

```text
usage_records
```

Track:

```text
AI generation
Video rendering
Storage
Publishing
Analytics processing
```

Fields:

```text
id
organization_id
usage_type
quantity
unit
reference_type
reference_id
period_start
period_end
created_at
```

---

# 61. WHY USAGE IS CRITICAL

CreatorOS has potentially expensive operations.

We must know:

```text
How much a creator consumes
How much the creator pays
How much infrastructure costs
```

This is required for SaaS unit economics.

---

# 62. NOTIFICATION

Table:

```text
notifications
```

Fields:

```text
id
organization_id
user_id

type
title
message

reference_type
reference_id

read_at
created_at
```

Examples:

```text
Video ready
Workflow failed
Publishing completed
Recommendation available
Subscription warning
```

---

# 63. AUDIT LOG

Table:

```text
audit_logs
```

Fields:

```text
id
organization_id
user_id

action
entity_type
entity_id

metadata
ip_reference
created_at
```

Examples:

```text
CONTENT_CREATED
CONTENT_APPROVED
CONTENT_DELETED
WORKFLOW_STARTED
VIDEO_PUBLISHED
CHANNEL_CONNECTED
SUBSCRIPTION_CHANGED
```

---

# 64. WHY AUDIT LOGS MATTER

CreatorOS handles:

```text
Creator content
External accounts
Publishing
Payments
AI operations
```

We need traceability.

---

# 65. HIGH-LEVEL ERD

```text
                         ┌──────────────┐
                         │    USERS     │
                         └──────┬───────┘
                                │
                                ▼
                    ┌──────────────────────┐
                    │ ORGANIZATION_MEMBERS │
                    └──────────┬───────────┘
                               │
                               ▼
                      ┌────────────────┐
                      │ ORGANIZATIONS   │
                      └───────┬────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ▼                 ▼                 ▼
       CHANNELS           PROJECTS         SUBSCRIPTIONS
            │                 │
            │                 ▼
            │             CONTENT
            │                 │
            │        ┌────────┼─────────┐
            │        │        │         │
            │        ▼        ▼         ▼
            │     SCRIPTS   SCENES   CONTENT_VERSIONS
            │        │
            │        │
            │        ▼
            │      ASSETS
            │
            ▼
      CHANNEL_METRICS
            │
            ▼
      VIDEO_METRICS
            │
            ▼
    RECOMMENDATIONS
```

---

# 66. WORKFLOW ERD

```text
CONTENT
   │
   ▼
WORKFLOW
   │
   ▼
WORKFLOW_STEPS
   │
   ▼
JOBS
   │
   ├───────────────┐
   ▼               ▼
AI_GENERATIONS   MEDIA_RENDERS
   │               │
   ▼               ▼
AI_MODELS        ASSETS
   │
   ▼
AI_PROVIDERS
```

---

# 67. PUBLISHING ERD

```text
CHANNEL
   │
   ▼
CONTENT
   │
   ▼
CONTENT_VERSION
   │
   ▼
PUBLISHING_JOB
   │
   ▼
YOUTUBE
   │
   ▼
VIDEO_METRICS
```

---

# 68. GROWTH LOOP ERD

```text
CHANNEL
   │
   ▼
VIDEO_METRICS
   │
   ▼
RECOMMENDATIONS
   │
   ▼
RECOMMENDATION_ACTIONS
   │
   ▼
CONTENT
   │
   ▼
WORKFLOW
   │
   ▼
PUBLISHING_JOB
   │
   ▼
VIDEO_METRICS
```

This is one of the most important relationships in the entire database.

---

# 69. COMPLETE CORE ERD

```text
USERS
 │
 ├───────────────┐
 ▼               ▼
MEMBERSHIPS   CREATOR_PROFILES
 │
 ▼
ORGANIZATIONS
 │
 ├──────────────┬──────────────┬──────────────┐
 ▼              ▼              ▼              ▼
CHANNELS      PROJECTS     SUBSCRIPTIONS   USAGE_RECORDS
 │              │
 │              ▼
 │           CONTENT
 │              │
 │      ┌───────┼────────┬──────────┐
 │      ▼       ▼        ▼          ▼
 │   VERSIONS SCRIPTS  SCENES     WORKFLOWS
 │                              │
 │                              ▼
 │                       WORKFLOW_STEPS
 │                              │
 │                              ▼
 │                            JOBS
 │                         ┌────┴─────┐
 │                         ▼          ▼
 │                 AI_GENERATIONS  MEDIA_RENDERS
 │                         │          │
 │                         ▼          ▼
 │                   AI_MODELS     ASSETS
 │                         │
 │                         ▼
 │                   AI_PROVIDERS
 │
 ▼
CHANNEL_METRICS
 │
 ▼
VIDEO_METRICS
 │
 ▼
RECOMMENDATIONS
 │
 ▼
RECOMMENDATION_ACTIONS
 │
 ▼
CONTENT
```

---

# 70. RELATIONSHIP RULES

Core relationships:

```text
Organization 1 → N Users through Memberships

Organization 1 → N Channels

Organization 1 → N Projects

Project 1 → N Contents

Channel 1 → N Contents

Content 1 → N Versions

Content 1 → N Scripts

Script 1 → N Scenes

Content 1 → N Assets

Content 1 → N Workflows

Workflow 1 → N Workflow Steps

Workflow Step 1 → N Jobs

Job 1 → N AI Generations

AI Provider 1 → N AI Models

AI Model 1 → N AI Generations

Content Version 1 → N Publishing Jobs

Channel 1 → N Metrics

Recommendation 1 → N Recommendation Actions
```

---

# 71. PRIMARY KEY STRATEGY

Recommended:

```text
UUID
```

for public/application entities.

Benefits:

```text
Distributed generation
No predictable IDs
Better service boundaries
Safer public identifiers
```

---

# 72. FOREIGN KEY STRATEGY

Use foreign keys for important relational integrity.

Example:

```text
contents.project_id
        ↓
projects.id
```

Do not rely entirely on application code to maintain relationships.

---

# 73. CASCADE DELETE POLICY

Be careful with:

```text
ON DELETE CASCADE
```

Do not blindly cascade large business datasets.

For important content:

```text
Soft delete
```

may be preferable.

---

# 74. SOFT DELETE

Entities such as:

```text
Projects
Content
Assets
Channels
```

may use:

```text
deleted_at
```

instead of immediate physical deletion.

---

# 75. HARD DELETE

Permanent deletion may be required for:

```text
Privacy requests
Account deletion
Expired temporary records
Compliance
```

This must be handled deliberately.

---

# 76. TIMESTAMP STANDARD

Use:

```text
TIMESTAMPTZ
```

and store timestamps in UTC.

The user's timezone belongs to the creator/profile/account configuration.

---

# 77. JSONB STRATEGY

Use JSONB for genuinely flexible information.

Good candidates:

```text
AI provider metadata
Creator preferences
Workflow configuration
AI model parameters
Raw provider metadata
Brand settings
```

Do NOT put the entire relational model into one giant JSONB field.

---

# 78. NORMALIZATION PRINCIPLE

Keep important business entities normalized.

Bad:

```text
contents
 └── giant JSON document containing everything
```

Better:

```text
Content
 ├── Versions
 ├── Scripts
 ├── Scenes
 ├── Assets
 ├── Workflows
 └── Publishing
```

---

# 79. DENORMALIZATION

Denormalize only when measurement proves it is necessary.

Potential examples:

```text
Analytics aggregates
Dashboard summaries
Search indexes
Cached counters
```

---

# 80. INDEXING STRATEGY

Important indexes should include:

```text
organization_id
user_id
channel_id
project_id
content_id
workflow_id
status
created_at
updated_at
external IDs
```

---

# 81. COMPOSITE INDEXES

Common queries may need composite indexes.

Example:

```text
organization_id + created_at
```

or:

```text
channel_id + published_at
```

Do not create every possible index.

Indexes have write/storage costs.

---

# 82. UNIQUE CONSTRAINTS

Examples:

```text
users.email
organizations.slug

organization_id + external_channel_id
organization_id + project name where appropriate
```

Exact uniqueness rules should be finalized during implementation.

---

# 83. EXTERNAL IDs

YouTube identifiers should not replace our internal IDs.

Use:

```text
channels.id
```

for CreatorOS identity.

Store:

```text
channels.external_channel_id
```

for YouTube identity.

This allows future multi-platform support.

---

# 84. MULTI-PLATFORM FUTURE

Instead of:

```text
youtube_channel_id
```

everywhere, use:

```text
platform
external_id
```

This allows:

```text
YOUTUBE
TIKTOK
INSTAGRAM
FACEBOOK
```

later without redesigning the entire database.

---

# 85. ANALYTICS SCALABILITY

Analytics may eventually become much larger than operational data.

Recommended architecture:

```text
PostgreSQL
     │
     ├── operational analytics
     │
     ▼
Analytics processing
     │
     ▼
Aggregations
     │
     ▼
Analytics warehouse / specialized store
```

Do not prematurely introduce a warehouse for MVP.

---

# 86. DATABASE PARTITIONING

Do not partition every table.

Potential future candidates:

```text
video_metrics
channel_metrics
analytics_ingestion_events
audit_logs
usage_records
```

Partition only after data volume justifies it.

---

# 87. ARCHIVAL

Old analytics or event data may eventually move to cheaper storage.

Example:

```text
Hot data
 ↓
Recent analytics

Cold data
 ↓
Historical analytics
```

---

# 88. DATA RETENTION

Define retention policies for:

```text
Temporary jobs
Temporary media
Raw provider payloads
Logs
Audit records
Analytics
Usage records
```

Retention should consider:

```text
Cost
Product value
Legal requirements
Privacy requirements
Debugging needs
```

---

# 89. DATABASE SECURITY

Required:

```text
Encrypted connections
Encryption at rest
Least-privilege database users
Secret management
Backups
Audit logging
Access monitoring
```

---

# 90. APPLICATION DATABASE USERS

Do not let every service have unrestricted database access.

Conceptually:

```text
API service
Worker service
Analytics service
Migration service
```

Use appropriate permissions.

For early architecture, this can remain simpler, but the principle must be preserved.

---

# 91. ROW-LEVEL SECURITY

PostgreSQL Row-Level Security may be considered for strong tenant isolation.

Conceptually:

```text
organization_id = current_organization
```

This creates an additional security boundary.

It should be evaluated alongside application-level authorization rather than treated as the only security mechanism.

---

# 92. BACKUPS

Production PostgreSQL requires:

```text
Automated backups
Point-in-time recovery
Backup monitoring
Restore testing
```

A backup that has never been restored/tested is not a proven backup strategy.

---

# 93. DISASTER RECOVERY

Define:

```text
RPO
RTO
```

RPO:

> How much data can we afford to lose?

RTO:

> How quickly must the service recover?

Exact targets should be chosen based on business stage.

---

# 94. MIGRATIONS

All schema changes must be version-controlled.

Example:

```text
migration_001
migration_002
migration_003
```

Never manually modify production schemas without migration tracking.

---

# 95. DATABASE ENVIRONMENTS

Maintain:

```text
Development
Testing
Staging
Production
```

Each environment must have isolated databases.

---

# 96. PRODUCTION DATA RULE

Never use real production creator data casually in development.

Use:

```text
Synthetic data
Anonymized data
Test fixtures
```

---

# 97. SEED DATA

Development environments should have deterministic seed data.

Example:

```text
Demo organization
Demo creator
Demo YouTube channel
Demo projects
Demo videos
Demo analytics
Demo recommendations
```

---

# 98. TRANSACTION PRINCIPLES

Use database transactions for operations that must remain atomic.

Example:

```text
Create content
+
Create initial version
+
Create workflow
```

should either succeed together or fail safely.

---

# 99. IDEMPOTENCY

Critical operations must avoid duplicate records.

Especially:

```text
Publishing
Payments
Webhook processing
AI jobs
Workflow creation
Analytics ingestion
```

---

# 100. CONCURRENCY

CreatorOS will have many asynchronous workers.

Therefore protect against:

```text
Two workers processing same job
Two publishing jobs
Duplicate analytics sync
Concurrent content updates
```

Use appropriate:

```text
Locks
Unique constraints
Transactions
Idempotency keys
State transitions
```

---

# 101. STATE TRANSITION PROTECTION

Example:

```text
APPROVED
 ↓
PUBLISHING
```

Another worker should not simultaneously change:

```text
APPROVED
 ↓
CANCELLED
```

without a valid business transition.

---

# 102. DATABASE AND AI ARCHITECTURE

Important distinction:

The database stores:

```text
AI generation metadata
AI outputs/references
AI decisions
AI costs
AI provider/model
```

It does NOT mean PostgreSQL itself becomes the AI system.

AI computation remains outside the database.

---

# 103. VECTOR SEARCH

CreatorOS may eventually need semantic search.

Potential use cases:

```text
Past scripts
Past videos
Creator knowledge
Content ideas
Brand information
Successful content
```

PostgreSQL can potentially support vector search through a vector extension such as pgvector.

But:

> Do not introduce a separate vector database unless scale/use cases actually justify it.

---

# 104. CREATOR KNOWLEDGE

Future structure:

```text
creator_knowledge
```

Possible fields:

```text
id
organization_id
source_type
source_reference
content
embedding
metadata
created_at
updated_at
```

This can support creator-specific AI context.

---

# 105. AI MEMORY PRINCIPLE

CreatorOS should distinguish:

```text
Operational data
```

from:

```text
AI memory/context
```

Not every piece of application data should automatically become AI memory.

---

# 106. DATA LINEAGE

For important generated content, we should eventually know:

```text
Idea
 ↓
Script version
 ↓
AI generation
 ↓
Assets
 ↓
Render
 ↓
Content version
 ↓
Publishing job
 ↓
YouTube video
 ↓
Analytics
 ↓
Recommendation
```

This creates **content lineage**.

---

# 107. WHY CONTENT LINEAGE IS POWERFUL

Suppose a video performs extremely well.

CreatorOS can ask:

```text
Which topic?
Which hook?
Which script structure?
Which duration?
Which thumbnail?
Which title?
Which workflow?
```

and compare those characteristics against previous content.

That is much more valuable than simply showing:

> "This video got 100,000 views."

---

# 108. DATABASE AS THE GROWTH ENGINE

Our database should enable:

```text
Historical content
        ↓
Historical performance
        ↓
Pattern detection
        ↓
Recommendation
        ↓
New content
        ↓
New performance
        ↓
Improved recommendations
```

This directly supports our major goal.

---

# 109. DATA FLOW

```text
Creator
 ↓
Idea
 ↓
CONTENT
 ↓
WORKFLOW
 ↓
JOBS
 ↓
AI_GENERATIONS
 ↓
ASSETS
 ↓
CONTENT_VERSION
 ↓
PUBLISHING_JOB
 ↓
CHANNEL
 ↓
VIDEO_METRICS
 ↓
RECOMMENDATIONS
 ↓
CONTENT
```

This is the CreatorOS data flywheel.

---

# 110. CORE MVP TABLES

Do NOT build every theoretical table immediately.

MVP should prioritize:

```text
users
organizations
organization_memberships

creator_profiles

channels
channel_connections

projects
contents
content_versions

scripts
scenes
assets

workflows
workflow_steps
jobs

ai_providers
ai_models
ai_generations

publishing_jobs

video_metrics
channel_metrics

recommendations
recommendation_actions

plans
subscriptions
usage_records

notifications
audit_logs
```

---

# 111. TABLES TO DEFER

Potentially defer:

```text
Advanced team permissions
Complex experiments
Advanced knowledge graphs
Large analytics warehouse
Advanced vector infrastructure
Multi-platform social scheduling
Enterprise audit architecture
Complex collaboration system
```

until actual requirements appear.

---

# 112. MVP DATABASE PRIORITY

Priority 1:

```text
Identity
Tenant
Channel
Content
Workflow
Jobs
Assets
Publishing
```

Priority 2:

```text
AI generations
Analytics
Recommendations
Usage
```

Priority 3:

```text
Advanced intelligence
Vector search
Teams
Experiments
Multi-platform
```

---

# 113. DATABASE PERFORMANCE PRINCIPLE

Optimize based on actual queries.

Process:

```text
Build
 ↓
Measure
 ↓
Find slow query
 ↓
EXPLAIN
 ↓
Optimize
 ↓
Measure again
```

Do not prematurely optimize everything.

---

# 114. DATABASE OBSERVABILITY

Monitor:

```text
CPU
Memory
Connections
Query latency
Slow queries
Locks
Deadlocks
Storage
Replication
Backup status
```

---

# 115. CONNECTION POOLING

Production applications should use controlled connection pooling.

Without it:

```text
Many API requests
 ↓
Too many database connections
 ↓
Database instability
```

---

# 116. READ REPLICAS

Eventually, if analytics/read traffic becomes significant:

```text
Primary
  │
  ├── Writes
  │
  └── Replica
       │
       └── Read-heavy queries
```

Do not introduce replicas before they are needed.

---

# 117. DATABASE SCALING PATH

```text
Stage 1
Single managed PostgreSQL

        ↓

Stage 2
Larger PostgreSQL instance
+ optimization

        ↓

Stage 3
Read replicas
+ caching

        ↓

Stage 4
Partitioning
+ analytics infrastructure

        ↓

Stage 5
Specialized data systems
where justified
```

---

# 118. THE DATABASE SHOULD NOT BECOME A MICROSERVICE PROBLEM

Even if CreatorOS eventually has:

```text
AI service
Media service
Analytics service
Workflow service
```

do not automatically create:

```text
5 separate databases
```

from day one.

For MVP:

> **A well-designed PostgreSQL system of record is simpler and safer.**

---

# 119. RECOMMENDED INITIAL ARCHITECTURE

```text
                 CreatorOS API
                      │
                      ▼
                PostgreSQL
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
     Redis          Object         AI/Media
     Queue          Storage        Providers
       │
       ▼
    Workers
```

Simple.

Powerful.

Scalable.

---

# 120. DATA OWNERSHIP

Every entity must have a clear owner.

Example:

```text
Content
→ Organization

Workflow
→ Organization + Content

Asset
→ Organization + Project/Content

Recommendation
→ Organization + Channel

Analytics
→ Channel
```

This makes authorization easier.

---

# 121. DATA ACCESS RULE

A user may access a record only when:

```text
Authenticated
+
Organization membership valid
+
Resource belongs to organization
+
Role permits requested action
```

---

# 122. DELETION FLOW

When creator deletes a project:

```text
Project deletion request
        ↓
Check dependencies
        ↓
Soft delete
        ↓
Queue media cleanup
        ↓
Delete/expire object storage
        ↓
Retain required audit information
```

Do not synchronously delete massive media trees during a web request.

---

# 123. MEDIA DELETION

Database deletion and object-storage deletion are separate operations.

```text
Database
 ↓
Asset marked deleted
 ↓
Cleanup job
 ↓
Object storage
 ↓
Physical deletion
```

This prevents long-running API requests.

---

# 124. DATA CONSISTENCY

CreatorOS has two major data categories:

### Strongly consistent

```text
Users
Subscriptions
Content states
Publishing
Workflow states
Permissions
```

### Eventually consistent

```text
Analytics
AI processing status
Search indexes
Some recommendations
External platform synchronization
```

This distinction is important.

---

# 125. EXTERNAL PLATFORM DATA

YouTube is external.

Therefore:

```text
CreatorOS database
        ↕
YouTube API
```

CreatorOS should maintain its own normalized representation rather than treating YouTube as the application's primary database.

---

# 126. SYNCHRONIZATION

Example:

```text
YouTube
 ↓
Sync job
 ↓
Normalize
 ↓
PostgreSQL
 ↓
Analytics engine
```

Record:

```text
last_synced_at
sync status
sync errors
```

---

# 127. FAILED SYNCHRONIZATION

If YouTube synchronization fails:

```text
Sync
 ↓
Failure
 ↓
Retry
 ↓
Backoff
 ↓
Retry
```

Do not destroy existing analytics.

---

# 128. DATABASE ERROR HANDLING

Never expose:

```text
PostgreSQL error
SQL query
Internal table name
Stack trace
```

to the user.

Translate errors into safe application-level errors.

---

# 129. DATA VALIDATION

Validation should happen at multiple levels:

```text
Frontend
 ↓
API validation
 ↓
Business validation
 ↓
Database constraints
```

Database constraints are the final safety boundary.

---

# 130. IMPORTANT DATABASE CONSTRAINTS

Examples:

```text
NOT NULL
UNIQUE
CHECK
FOREIGN KEY
DEFAULT
```

Use them deliberately.

---

# 131. ENUM STRATEGY

For frequently changing product states, consider whether database enums or lookup tables are more appropriate.

Avoid creating rigid database enums for values that product teams will change constantly.

---

# 132. SCHEMA NAMING

Recommended:

```text
snake_case
```

Examples:

```text
organization_id
created_at
content_version_id
workflow_step_id
```

Keep naming consistent.

---

# 133. TABLE NAMING

Use plural nouns consistently:

```text
users
organizations
channels
projects
contents
assets
workflows
jobs
```

---

# 134. PRIMARY DATABASE SCHEMA

For MVP:

```text
public
```

may be sufficient.

As complexity grows, schema separation can be evaluated.

Do not create unnecessary PostgreSQL schemas simply for appearance.

---

# 135. MIGRATION OWNERSHIP

Database migrations should be reviewed by:

```text
Backend Engineer
+
Senior/Lead Engineer or CTO
```

before production deployment.

---

# 136. QA REQUIREMENTS

Database tests must verify:

```text
Foreign keys
Unique constraints
Tenant isolation
Transactions
State transitions
Deletion behavior
Migration correctness
Seed data
Backup restoration
```

---

# 137. DATABASE TEST DATA

Create realistic scenarios:

```text
Creator A
 ├── Channel A
 ├── 50 videos
 ├── Analytics
 └── Recommendations

Creator B
 └── Channel B
```

Then test:

> Can Creator A ever retrieve Creator B's records?

The answer must always be:

**NO.**

---

# 138. SECURITY TEST

Attempt:

```text
GET /content/{CreatorBContentId}
```

while authenticated as Creator A.

Expected:

```text
403
```

or an appropriately non-disclosing response.

---

# 139. DATABASE ACCEPTANCE CRITERIA

The architecture is acceptable when:

```text
✓ Multi-tenant isolation works
✓ Core entities are normalized
✓ Relationships are enforced
✓ Workflow state is persistent
✓ AI generation history is traceable
✓ Content versions are recoverable
✓ Assets are linked to content
✓ Publishing is traceable
✓ Analytics can be stored efficiently
✓ Recommendations connect to content
✓ Usage can be measured
✓ Audit trails exist
✓ Backups exist
✓ Migrations are version-controlled
```

---

# 140. FINAL PRODUCTION ERD

```text
                              USERS
                                │
                                ▼
                     ORGANIZATION_MEMBERSHIPS
                                │
                                ▼
                         ORGANIZATIONS
                         │     │      │
             ┌───────────┘     │      └─────────────┐
             ▼                 ▼                    ▼
      CREATOR_PROFILES      CHANNELS          SUBSCRIPTIONS
                               │                    │
                               │                    ▼
                               │              USAGE_RECORDS
                               │
                               ▼
                         CHANNEL_METRICS
                               │
                               ▼
                         VIDEO_METRICS
                               │
                               ▼
                       RECOMMENDATIONS
                               │
                               ▼
                    RECOMMENDATION_ACTIONS


ORGANIZATIONS
      │
      ▼
   PROJECTS
      │
      ▼
   CONTENTS
      │
      ├──────────────► CONTENT_VERSIONS
      │
      ├──────────────► SCRIPTS
      │                   │
      │                   ▼
      │                 SCENES
      │
      ├──────────────► ASSETS
      │                   │
      │                   ▼
      │              ASSET_VERSIONS
      │
      └──────────────► WORKFLOWS
                          │
                          ▼
                    WORKFLOW_STEPS
                          │
                          ▼
                         JOBS
                       ┌───┴────┐
                       ▼        ▼
                AI_GENERATIONS  MEDIA_RENDERS
                       │             │
                       ▼             ▼
                  AI_MODELS        ASSETS
                       │
                       ▼
                  AI_PROVIDERS


CONTENT
   │
   ▼
CONTENT_VERSIONS
   │
   ▼
PUBLISHING_JOBS
   │
   ▼
CHANNEL
   │
   ▼
VIDEO_METRICS
   │
   ▼
RECOMMENDATIONS
   │
   ▼
NEW CONTENT
```

---

# 141. THE MOST IMPORTANT RELATIONSHIP

The heart of CreatorOS is:

```text
                    ┌───────────────┐
                    │    CONTENT    │
                    └───────┬───────┘
                            │
                            ▼
                       WORKFLOW
                            │
                            ▼
                         JOBS
                            │
                            ▼
                      AI + MEDIA
                            │
                            ▼
                     FINAL CONTENT
                            │
                            ▼
                        YOUTUBE
                            │
                            ▼
                        ANALYTICS
                            │
                            ▼
                   RECOMMENDATIONS
                            │
                            ▼
                      NEW CONTENT
                            │
                            └───────────────┐
                                            │
                                            ▼
                                      BETTER DATA
                                            │
                                            ▼
                                  BETTER INTELLIGENCE
```

This is the **CreatorOS data flywheel**.

---

# 142. CEO/CTO FINAL DECISION

We should NOT design the database around individual features.

We should design it around the **CreatorOS lifecycle**:

```text
CREATOR
   ↓
CHANNEL
   ↓
IDEA
   ↓
CONTENT
   ↓
WORKFLOW
   ↓
AI/MEDIA PRODUCTION
   ↓
REVIEW
   ↓
PUBLISH
   ↓
ANALYTICS
   ↓
INTELLIGENCE
   ↓
RECOMMENDATION
   ↓
NEXT CONTENT
```

That is the database architecture that supports our actual business vision.

---

# 143. OUR MAJOR GOALS — FINAL REMINDER

Every database decision must support these six goals:

## 1. SAVE CREATOR TIME

Store workflow state and automation history so repetitive work can be automated.

## 2. IMPROVE CONTENT QUALITY

Store versions, scenes, assets, AI generations, and production history.

## 3. REMOVE TOOL COMPLEXITY

Store provider/model information behind CreatorOS's orchestration layer.

## 4. CREATE PERSONALIZED INTELLIGENCE

Remember creator preferences, channel context, content history, and performance.

## 5. HELP CREATORS GROW

Connect:

```text
Content
→ Publishing
→ Analytics
→ Recommendations
→ New Content
```

## 6. BUILD A GLOBAL SaaS

The database must support:

```text
One creator
        ↓
Creator teams
        ↓
Agencies
        ↓
International creators
        ↓
Large-scale SaaS
```

without rebuilding the foundation.

---

# 144. FINAL DATABASE PRINCIPLE

> **The database is not merely where CreatorOS stores data. It is the persistent memory that connects creator identity, content production, AI decisions, publishing, performance, and growth.**

If we design this foundation correctly, the rest of CreatorOS can evolve without repeatedly redesigning its core data model.

---

# END OF DOCUMENT 22