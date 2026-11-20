> **Status update — 20 Nov 2026.** Parts of this document are replaced by [Document 26](./26_Revised_SaaS_Foundation_and_Unit_Economics.md) and the [Decision Log](./00_Decision_Log.md). Where they disagree, those two win.
>
> **Superseded:** the MVP order (metadata + analytics first, editing later) and the validation gate. New order: the copilot first (it needs no YouTube login), then the free Channel Audit; YouTube publishing after Google's audit.
>
> **Read instead:** Doc 26 §5, §11, §12, ADR-001, ADR-019.

---

# CreatorOS
## MVP, Go-To-Market & Execution Roadmap

**Document:** 05-MVP-GTM-EXECUTION-ROADMAP  
**Version:** 1.0  
**Date:** August 28, 2026  
**Product:** CreatorOS  
**Vision:** AI-powered operating system for YouTube creators  
**Initial Market:** YouTube creators  
**Initial Geography:** Sri Lanka  
**Expansion:** India → Southeast Asia → Global  

---

# 1. Executive Summary

CreatorOS should NOT begin as another:

- AI video editor
- thumbnail generator
- caption generator
- YouTube analytics dashboard
- AI content generator

Those markets already have many products.

Our opportunity is to build an:

# **AI Creator Workflow & Growth Operating System**

that connects the creator's existing tools and YouTube channel, understands their workflow and content, automates repetitive production tasks, and uses channel-performance intelligence to continuously recommend what the creator should improve.

The core loop is:

```text
Creator Idea
     ↓
CreatorOS understands the goal
     ↓
Plans the workflow
     ↓
Selects appropriate tools/models
     ↓
Executes repetitive tasks
     ↓
Creator reviews
     ↓
Approve / Reject / Edit
     ↓
Publish
     ↓
YouTube performance data
     ↓
AI analyzes results
     ↓
Recommendations
     ↓
Next video
```

This is the central product.

---

# 2. The Product We Are Actually Building

The product is NOT:

> "AI makes YouTube videos."

The product is:

> **"CreatorOS manages the creator's production workflow and continuously helps them make better content decisions."**

This distinction is extremely important.

---

# 3. Core Value Proposition

CreatorOS should promise three things:

## 1. Save Time

Reduce repetitive manual work.

## 2. Reduce Tool Complexity

Creators should not need to decide:

> Which AI model?

> Which editor?

> Which caption tool?

> Which thumbnail tool?

> Which analytics tool?

CreatorOS handles orchestration.

## 3. Improve Decisions

Use channel data and content intelligence to answer:

> What should I create next?

> What should I improve?

> Which videos are performing?

> Why?

> What patterns are appearing?

---

# 4. Ideal Customer Profile

Do NOT target:

> Everyone who uses YouTube.

Start with a narrow segment.

## Primary ICP

### Growing YouTube creators

Characteristics:

- already publishing
- approximately 1–10+ videos/month
- trying to grow
- doing most work themselves
- limited budget
- frustrated by repetitive work
- using multiple creator tools
- interested in AI
- willing to experiment

---

# 5. Best Initial Creator Niches

Prioritize creators where workflows are relatively structured.

### Tier 1

- education
- technology
- business
- tutorials
- commentary
- podcasts/interviews

### Tier 2

- gaming
- travel
- lifestyle
- productivity
- finance

### Tier 3

Highly complex production:

- cinematic channels
- professional filmmaking
- advanced animation

Do not target these initially.

---

# 6. Why Start Narrow?

If we build for:

> "Every creator"

the product becomes enormous.

Instead:

```text
One creator type
       ↓
One workflow
       ↓
One strong problem
       ↓
Excellent solution
       ↓
Expand
```

This is much safer.

---

# 7. The MVP

The MVP should NOT include everything in our vision.

The MVP should prove:

# "Creators will connect their channel and use CreatorOS repeatedly because it saves meaningful time and gives useful recommendations."

---

# 8. MVP Core Modules

The first MVP should contain:

```text
1. Creator Workspace
2. YouTube Connection
3. Content/Channel Intelligence
4. AI Workflow Planner
5. Production Automation
6. Caption/Transcript
7. Thumbnail Intelligence
8. Content/SEO Assistance
9. Analytics Intelligence
10. Recommendation Engine
11. Human Approval
12. Workflow History
```

---

# 9. MVP Module 1 — Creator Workspace

The creator gets one dashboard.

Example:

```text
CreatorOS
────────────────────────

Good morning 👋

Your Channel
Subscribers: 24,820
Views: +18%
Watch time: +11%

Today's recommendations
────────────────────────

🔥 Your "AI tools" videos are trending

💡 Suggested next topic:
"5 AI tools for..."

⚠️ Your last 3 videos lost viewers
around 0:42

🎯 Recommended action:
Improve your opening hook

────────────────────────

Active Projects
[Video 21]
[Video 22]
[Shorts]
```

---

# 10. MVP Module 2 — YouTube Connection

Creator connects:

# YouTube channel

Using official authorization.

The system retrieves permitted channel information such as:

- videos
- views
- likes
- comments
- watch metrics where available
- publishing history
- audience information where available

This becomes the foundation of personalization.

---

# 11. MVP Module 3 — Creator Knowledge

CreatorOS creates a:

# Creator Profile

It learns:

- niche
- audience
- language
- preferred tone
- video style
- typical duration
- publishing frequency
- topics
- thumbnail style
- title patterns
- historical performance

---

# 12. Creator Memory

This is one of our most important long-term features.

Example:

```text
Creator prefers:

Language:
English

Tone:
Educational + friendly

Video:
8–12 minutes

Thumbnail:
Minimal text

Audience:
Developers

Strong topics:
AI
Cloud
Programming
```

The creator should not repeatedly explain this.

---

# 13. MVP Module 4 — Idea → Workflow

Creator enters:

> "I want to create a video explaining local AI models for beginners."

CreatorOS generates:

```text
Goal
 ↓
Research
 ↓
Outline
 ↓
Script
 ↓
Visual requirements
 ↓
Recording requirements
 ↓
Editing
 ↓
Captions
 ↓
Thumbnail
 ↓
Title
 ↓
SEO
 ↓
Publish
```

This is the beginning of orchestration.

---

# 14. The Workflow Engine

The core architecture should support:

```text
Workflow
   │
   ├── Step 1
   ├── Step 2
   ├── Step 3
   ├── Step 4
   ├── Step 5
   └── Step N
```

Each step has:

- input
- tool/model
- instruction
- output
- validation
- approval
- retry

---

# 15. AI Orchestrator

The AI orchestrator determines:

> What should happen next?

For example:

```text
User idea
   ↓
Planner Agent
   ↓
Research Agent
   ↓
Script Agent
   ↓
Visual Agent
   ↓
Editing Agent
   ↓
QA Agent
   ↓
Creator Approval
```

The system should not blindly execute everything.

---

# 16. Human-in-the-Loop

This is a critical product principle.

CreatorOS should be:

# Autonomous where safe + human-controlled where creative.

Example:

```text
AI creates
     ↓
Preview
     ↓
Creator
 ┌───────┴────────┐
 ↓                ↓
Approve          Reject
 ↓                ↓
Continue         Revise
```

---

# 17. Why This Is Important

Creators don't necessarily want:

> "AI controls my channel."

They want:

> "AI does the boring work while I remain the creative director."

That should become a core positioning principle.

---

# 18. MVP Production Workflow

Initial workflow:

```text
Idea
 ↓
AI Planning
 ↓
Script
 ↓
Creator Approval
 ↓
Upload Video
 ↓
Transcript
 ↓
Captions
 ↓
Title Suggestions
 ↓
Description
 ↓
Tags/metadata assistance
 ↓
Thumbnail concepts
 ↓
Quality checks
 ↓
Creator Approval
 ↓
Publish
```

---

# 19. Do NOT Build a Full Video Editor Initially

This is one of the strongest recommendations.

Do not initially spend months building:

> Premiere Pro competitor.

Instead integrate with existing video processing/editing technology.

CreatorOS should be:

# The intelligence/orchestration layer.

---

# 20. Editing Strategy

The user can provide:

- video
- images
- audio
- instructions

CreatorOS determines:

```text
What needs editing?
        ↓
Which processing pipeline?
        ↓
Which AI model?
        ↓
Which tool?
        ↓
Generate preview
```

---

# 21. Example

Creator says:

> "Make this educational video more professional and engaging."

CreatorOS analyzes:

- dead air
- pauses
- filler words
- scene changes
- audio quality
- visual gaps
- pacing

Then recommends:

```text
Remove 14 pauses
Remove 7 filler sections
Improve audio
Add captions
Add 6 visual overlays
Add 3 B-roll sections
Create intro
```

Creator reviews before execution.

---

# 22. Thumbnail Intelligence

Don't simply build:

> "Generate thumbnail."

Instead:

# Thumbnail Optimization.

System analyzes historical channel performance.

Example:

```text
Your best thumbnails:

Faces: Medium
Text: 2–4 words
Contrast: High
Subject: Large

Recommendation:
Use stronger visual subject
and reduce text.
```

---

# 23. Title Intelligence

Analyze:

- historical CTR patterns
- topic
- title structure
- length
- curiosity
- search intent

Then produce:

```text
Option A
Option B
Option C
```

with reasoning.

The creator selects.

---

# 24. Analytics Intelligence

Do not build another analytics dashboard.

YouTube already provides analytics.

Our value is:

# Explain the analytics.

Instead of:

> CTR = 5.7%

CreatorOS says:

> "Your CTR dropped 18% compared with your recent videos. The biggest difference is thumbnail structure."

Then:

> "Your first 30 seconds also show higher viewer drop-off."

Then:

> "For your next video, test a shorter opening and a simpler thumbnail."

---

# 25. Recommendation Engine

This is potentially the long-term differentiator.

The system combines:

```text
Channel data
+
Video data
+
Historical performance
+
Creator preferences
+
Topic trends
+
Audience behavior
+
Content patterns
```

and generates:

# Next Best Action.

---

# 26. Example Recommendation

```text
🎯 NEXT BEST ACTION

Create a video about:

"How to run AI locally on a normal laptop"

Why?

• Similar topic performed 42% above average
• Audience interest is increasing
• Your channel has authority in this topic
• Competition appears manageable

Suggested format:
8–10 minute tutorial

Suggested hook:
"Your laptop can run AI without the cloud..."
```

This is far more valuable than generic AI content generation.

---

# 27. Recommendation Feedback Loop

The system should learn:

```text
Recommendation
       ↓
Creator accepts/rejects
       ↓
Video created
       ↓
Published
       ↓
Performance
       ↓
Outcome
       ↓
Recommendation engine improves
```

This creates a continuous loop.

---

# 28. MVP Quality Assurance

Every generated artifact should pass automated checks.

Example:

### Script QA

- factual consistency
- structure
- repetition
- length
- tone

### Caption QA

- timing
- missing words
- formatting

### Thumbnail QA

- readability
- dimensions
- excessive text

### Metadata QA

- title length
- description quality
- keyword relevance

---

# 29. Creator Approval Center

One place:

# "Review & Approve"

Example:

```text
Script       ✓
Captions     ✓
Thumbnail    ⚠ Review
Title        ✓
Description  ✓
Edit         ⚠ Review
```

Creator can:

> Approve all

or:

> Review individually.

---

# 30. MVP Should Feel Like an AI Employee

The interface should feel less like:

> "Here are 50 tools."

and more like:

> "Your production assistant completed these tasks."

Example:

```text
Your video is 82% ready.

Completed:
✓ Transcript
✓ Captions
✓ Title
✓ Description
✓ Thumbnail concepts

Needs your approval:
⚠ Editing
⚠ Thumbnail

Estimated time saved:
2h 35m
```

---

# 31. MVP Architecture

Recommended architecture:

```text
                CreatorOS
                    │
              Next.js Frontend
                    │
                API Layer
                    │
          ┌─────────┴─────────┐
          │                   │
     Workflow Engine      AI Gateway
          │                   │
          │         ┌─────────┼─────────┐
          │         ↓         ↓         ↓
          │       LLM       Vision    Speech
          │
          ↓
       Job Queue
          │
     ┌────┼────┐
     ↓    ↓    ↓
   Worker Worker Worker
     │
     ↓
Video Processing
     │
     ↓
Storage
     │
     ↓
Database
```

---

# 32. Recommended Technology Stack

Based on our earlier direction:

## Frontend

Next.js

## Backend

NestJS

## Database

PostgreSQL

## Cache

Redis

## Queue

BullMQ or equivalent

## AI Service

Python where specialized ML/video processing is required

## Object Storage

S3-compatible storage

## Authentication

Production-grade managed authentication

## AI Gateway

Our own abstraction layer

---

# 33. AI Provider Architecture

Never hard-code the product around one provider.

Use:

```text
CreatorOS AI Gateway
        │
 ┌──────┼────────┐
 ↓      ↓        ↓
LLM A  LLM B    LLM C
 ↓      ↓        ↓
Vision Speech  Image
```

The gateway decides:

- model
- provider
- cost
- latency
- quality
- fallback

---

# 34. AI Router

Example:

```text
Task:
Generate video summary

Complexity:
Low

Budget:
Low

Router:
Select economical model
```

For:

> "Analyze my last 50 videos and determine why retention is falling."

Router:

> stronger reasoning model.

---

# 35. Database Core Entities

Initial schema should include:

```text
User
Workspace
Channel
CreatorProfile
CreatorPreference
Video
VideoPerformance
Project
Workflow
WorkflowStep
Asset
AIJob
AIUsage
Recommendation
RecommendationFeedback
Subscription
UsageCredit
```

---

# 36. Important Database Principle

Store:

# What happened.

Not only:

> final result.

We need workflow history.

Example:

```text
Creator requested
 ↓
AI generated
 ↓
Creator rejected
 ↓
AI revised
 ↓
Creator approved
```

This becomes valuable product intelligence.

---

# 37. Security

Because users connect YouTube accounts and upload private media, security must be designed from day one.

Requirements include:

- encrypted credentials
- secure OAuth
- least-privilege permissions
- tenant isolation
- secure file access
- signed URLs
- audit logs
- rate limiting
- secrets management
- secure deletion
- backup strategy

---

# 38. Privacy

Creators may upload:

- unpublished videos
- scripts
- business information
- personal information

Therefore:

# User data must never be casually exposed to AI providers.

Only send the minimum required information.

---

# 39. MVP Development Phase 0 — Validation

Duration:

# 2–4 weeks

Do NOT code the complete system.

Do:

- interview creators
- prototype workflows
- create clickable UI
- manually perform workflows
- test willingness to pay

Goal:

# Validate the problem.

---

# 40. Phase 1 — Concierge MVP

Before automation, manually simulate CreatorOS.

Example:

Creator sends:

> video + idea.

Behind the scenes we manually use:

- transcription
- LLM
- editing tools
- analytics

Then return:

> completed workflow.

The customer should experience the value before we automate everything.

---

# 41. Why Concierge MVP?

Because we don't know yet:

> Which automation creators value most.

Manual service allows us to discover:

```text
Most requested task
        ↓
Automate
        ↓
Second most requested
        ↓
Automate
```

This prevents building useless features.

---

# 42. Phase 2 — MVP Development

Build only validated workflows.

Target:

# 6–10 weeks

Core:

- authentication
- workspace
- YouTube connection
- project
- workflow
- AI gateway
- transcript/captions
- title/description
- thumbnail intelligence
- analytics
- recommendation
- approval system

---

# 43. Phase 3 — Private Beta

Target:

# 20–50 creators.

Invite users manually.

Observe:

- activation
- usage
- workflow completion
- time saved
- errors
- AI costs
- retention
- willingness to pay

---

# 44. Phase 4 — Paid Beta

Target:

# 50–200 creators.

Introduce payment.

Possible pricing experiments:

```text
$19
$29
$49
```

Test willingness to pay.

---

# 45. Phase 5 — Public Launch

Only after:

- stable workflows
- acceptable AI cost
- reliable YouTube integration
- useful recommendations
- strong creator feedback

Then open public registration.

---

# 46. First 30 Days

## Week 1

Research creators.

## Week 2

Interview.

## Week 3

Prototype.

## Week 4

Concierge workflow.

Success condition:

> Creators repeatedly ask to use it again.

---

# 47. Days 31–60

Build:

- authentication
- workspace
- YouTube connection
- project management
- AI workflow engine
- transcript/captions
- title/description
- approval system

---

# 48. Days 61–90

Add:

- analytics intelligence
- recommendation engine
- thumbnail intelligence
- workflow history
- usage tracking
- billing

Then:

# Private Beta.

---

# 49. 3-Month Goal

Do not target:

> 10,000 users.

Target:

# 20–50 highly engaged creators.

The question is:

> "Would they be disappointed if CreatorOS disappeared?"

---

# 50. 6-Month Goal

Potential targets:

```text
100–300 active creators
25–100 paying customers
strong repeat usage
validated pricing
known best workflow
controlled AI costs
```

The exact numbers are hypotheses.

---

# 51. 12-Month Goal

Potential objective:

```text
1,000+ creators
200+ paying
strong retention
repeatable acquisition channel
positive contribution margin
India expansion preparation
```

Do not treat these as guaranteed forecasts.

---

# 52. Go-To-Market Strategy

Our initial GTM should be:

# Community + Product-Led Growth + Founder-Led Sales

Not expensive advertising.

---

# 53. Sri Lanka Launch

Start with:

- Sri Lankan YouTubers
- universities
- creator communities
- technology creators
- education creators
- Sinhala creators
- Tamil creators
- English creators

Founder should personally onboard early users.

---

# 54. Local Competitive Advantage

Potential local advantage:

### Sinhala support

### Tamil support

### English support

### Local creator understanding

### Local pricing experiments

### Local customer support

But:

# Do not build a "Sri Lanka-only" product.

Build an international product that happens to start in Sri Lanka.

---

# 55. India Expansion

After validating Sri Lanka:

```text
Sri Lanka
 ↓
India
```

Start with English-speaking creators.

Then support major regional languages where economically justified.

India should be treated as a major growth market, not simply a cheaper market.

---

# 56. Global Expansion

Priority:

```text
India
 ↓
Southeast Asia
 ↓
Middle East
 ↓
Europe
 ↓
North America
```

Expansion should follow customer demand and acquisition economics.

---

# 57. Product-Led Growth

The product itself should generate acquisition.

Example:

Creator creates a report:

> "Your Channel Growth Score"

Then:

> Share report

This can create organic awareness.

---

# 58. Free Tools

Build public tools:

```text
YouTube Title Analyzer
Thumbnail Analyzer
Hook Analyzer
Channel Growth Analyzer
Video Performance Analyzer
Creator Workflow Calculator
```

Users discover these through search.

Then:

```text
Free tool
 ↓
Account
 ↓
CreatorOS
 ↓
Paid subscription
```

---

# 59. Creator Referral

Example:

> Invite 3 creators → receive additional AI credits.

Or:

> Invite a creator → both receive one month of additional usage.

Referral should reward genuine adoption, not spam.

---

# 60. Creator Ambassador Program

Find:

```text
10–50 creators
```

Give them:

- free Pro
- early features
- direct founder access
- affiliate commission
- public recognition

In exchange for honest feedback and content.

---

# 61. Affiliate Program

Potential structure:

```text
Creator refers customer
        ↓
Customer subscribes
        ↓
Creator receives commission
```

This creates distributed sales.

---

# 62. Content Marketing

CreatorOS should publish:

### YouTube

### Shorts

### Blog

### LinkedIn

### X

### Reddit/community participation

Content themes:

> Creator productivity

> AI creator workflows

> YouTube growth experiments

> Analytics breakdowns

> Creator automation

---

# 63. Example Marketing Position

Avoid:

> "The world's best AI video editor."

Instead:

# "Your AI operating system for YouTube."

Or:

> "Turn your YouTube workflow into an AI-powered production system."

---

# 64. The Main Differentiator

The strongest positioning should be:

```text
Existing tools:
Individual AI capabilities

CreatorOS:
Coordinates the entire workflow
+
understands the creator
+
learns from channel performance
```

---

# 65. The CreatorOS Flywheel

This is potentially our most important strategic asset:

```text
More creators
       ↓
More workflows
       ↓
More creator preferences
       ↓
More performance history
       ↓
Better recommendations
       ↓
Better automation
       ↓
More creator value
       ↓
Higher retention
       ↓
More creators
```

---

# 66. Product Moat

Potential moat:

## 1. Creator Memory

Understands individual creators.

## 2. Workflow Intelligence

Understands how creators work.

## 3. Performance Intelligence

Understands what actually works.

## 4. AI Orchestration

Chooses appropriate tools/models.

## 5. Feedback Loop

Learns from creator decisions and outcomes.

---

# 67. What We Should NOT Build Initially

Do NOT build:

❌ Full Premiere Pro competitor

❌ Full Canva competitor

❌ Full YouTube Studio replacement

❌ Social network

❌ AI video-generation platform

❌ AI image-generation platform

❌ Every social media integration

❌ Dozens of AI agents

❌ Enterprise platform

❌ Mobile apps

These increase complexity without proving our core hypothesis.

---

# 68. MVP Feature Priority

| Feature | Priority |
|---|---|
| YouTube connection | 🔴 Critical |
| Creator profile | 🔴 Critical |
| Workflow engine | 🔴 Critical |
| AI orchestration | 🔴 Critical |
| Approval system | 🔴 Critical |
| Transcript/captions | 🔴 Critical |
| Analytics intelligence | 🔴 Critical |
| Recommendation engine | 🔴 Critical |
| Title/description | 🟠 High |
| Thumbnail intelligence | 🟠 High |
| Advanced editing | 🟡 Later |
| Shorts automation | 🟡 Later |
| Multi-platform | 🟡 Later |
| Agency | 🟢 Future |
| API | 🟢 Future |

---

# 69. MVP Success Metrics

The most important metrics:

### Activation

Percentage connecting YouTube and creating first project.

### Time-to-value

How quickly the creator receives useful output.

### Workflow completion

Percentage completing workflows.

### Repeat usage

Creators returning to create another video.

### Time saved

Estimated/manual validated hours saved.

### Recommendation acceptance

How often creators accept recommendations.

### Paid conversion

Free → paid.

### Retention

Creators remaining active.

---

# 70. North Star Metric

I recommend:

# **Successful Creator Workflows Completed**

Why?

Because it represents:

```text
User intent
+
Product usage
+
Automation
+
Value
```

Not simply:

> login count.

---

# 71. Secondary North Star

Track:

# Creator Hours Saved

Example:

```text
CreatorOS users

Successful workflows:
1,200

Estimated hours saved:
3,450
```

This is a powerful value metric.

---

# 72. Quality Metric

Track:

# Creator Approval Rate

Example:

```text
AI-generated outputs:
1,000

Approved without major revision:
720

Approval rate:
72%
```

We want this to improve.

---

# 73. AI Cost Metric

Track:

# AI COGS per successful workflow

Example:

```text
Total AI + compute cost
-----------------------
Successful workflows
```

This directly connects engineering decisions to business economics.

---

# 74. Business Health Dashboard

Founders should monitor:

```text
MRR
ARR
Paying creators
Active creators
Churn
CAC
LTV
LTV/CAC
Gross margin
AI COGS
Cost/workflow
Hours saved
Approval rate
Workflow completion
```

---

# 75. Product Development Principle

Every feature must answer:

> Which creator problem does this solve?

If the answer is:

> "It is cool AI technology."

Do not build it.

---

# 76. AI Development Principle

Do not ask:

> "What AI feature can we add?"

Ask:

> "Which repetitive creator task can AI perform reliably?"

This prevents AI feature bloat.

---

# 77. Automation Principle

Automate in this order:

```text
Repetitive
   ↓
High-frequency
   ↓
Low-risk
   ↓
High-value
```

Do not start by automating high-risk creative decisions.

---

# 78. Human-AI Boundary

### AI

- analyze
- recommend
- draft
- organize
- transform
- automate
- monitor

### Human

- final creative direction
- final publishing approval
- brand decisions
- sensitive content decisions
- strategic decisions

---

