# Prompt 02 — Track A: concierge pipeline and validation tools (weeks 1–4)

**Why this exists:** the validation gate at the end of week 4 needs real numbers:
- hours saved;
- the cut acceptance rate;
- speech-to-text quality on Sinhala, Tamil and Hindi mixed with English;
- the cost per footage hour.

These scripts produce those numbers from 10 real creator videos. They also become **pipeline v0** for the product, so the logic must be clean and reusable.

**How to use:**
- Run this in a **separate session** from Prompt 01. The two can run in parallel.
- It lives in `tools/concierge` as its own package, and does not need the monorepo from M1 to be finished.
- Paste everything between the lines.

---

You are the AI/ML and media engineer for CreatorOS (internal code name). Read `AGENTS.md` and follow it: the rules, the work loop in §7, and the report format. Then read:
- `docs/Document26_Revised_SaaS_Foundation_and_Unit_Economics.md`: §5, §8 and §11;
- `docs/Implementation_Plan.md`: the "Track A" and "AI/ML design → Production Copilot pipeline" sections;
- the EDL section of `docs/Document25 AI Intelligence, Machine Learning & AI Engineering Architecture.md` (search for "EDL" or "edit decision").

## Goal

A CLI in `tools/concierge` (TypeScript on Node; FFmpeg is called as a subprocess):

```bash
pnpm concierge run <video-or-audio-file> --lang en|si-en|ta-en|hi-en [--provider deepgram|...]
pnpm concierge bench <clips-folder> --providers deepgram,<others>
```

**`run`** writes `out/<name>/` containing:
- `audio.m4a` (or `.opus`), extracted from the input;
- `transcript.json` (words, start/end ms, speaker, confidence, provider, model);
- `edl.json` (decisions: type silence | filler | retake, start/end ms, reason, status SUGGESTED);
- `timeline.fcpxml` (cuts applied, referencing the ORIGINAL media path);
- `timeline.xml` (Premiere XML);
- `timeline.edl` (CMX3600);
- `captions.srt`;
- `metadata.md` (3 titles with reasons, a description, chapters with timestamps);
- `cost.json` (cost per step and the total, per footage hour).

**`bench`** writes `bench/results.md` and `bench/results.csv`, with:
- word error rate per provider and per language set (against human reference transcripts I provide);
- timestamp error;
- filler and retake detection precision and recall (against my labels, where present);
- cost per hour.

## Design rules (it becomes pipeline v0)

- **Pure functions:**
  - silence detection from the waveform or from word gaps, with a tunable threshold (start at 700 ms);
  - filler detection from per-language word lists;
  - merging and validating the EDL (no overlaps, a minimum clip length, a maximum share of the video cut).

  Each one gets unit tests.
- **Retakes:** detected by an LLM over transcript windows. Use a zod output schema that returns time ranges and a reason, and pass the transcript as data, never as instructions. Keep the prompt in a versioned file.
- **Providers:** speech-to-text and LLM providers sit behind interfaces (`SttProvider`, `LlmProvider`). Each call returns the provider, model, tokens or minutes, cost in USD and latency. Start with Deepgram Nova-3 batch, then add 2–3 more candidates that list Sinhala support (for example AssemblyAI, Gladia, ElevenLabs Scribe, Google). Check each provider's current docs and prices; never guess.
- **Exporters:** a separate module per format, with golden-file tests.
  - Check which FCPXML version current DaVinci Resolve and Final Cut Pro import, and target it.
  - I will open the files in Resolve, Premiere and Final Cut to confirm the cuts survive.
- **Keys:** API keys come from `tools/concierge/.env`. Never print or log them. Ask me for each key.

## Creator data and privacy (strict)

- Creator footage, audio and transcripts stay on this machine, in a git-ignored `data/` and `out/`. Never commit media, transcripts or creator names.
- `data/<creator>/consent.md` must exist before any processing. Refuse to run without it.
- Add `pnpm concierge purge <creator>`, which deletes that creator's data and outputs.

## Milestones (one per session; report after each)

- **C0 — Plan.** Folder layout, interfaces, the EDL JSON schema (aligned with Doc 25), the target FCPXML version, the provider shortlist with current prices, and questions. Stop for my approval.
- **C1 — Audio and transcription.**
  - FFmpeg audio extraction, with timeouts.
  - The Deepgram adapter.
  - The transcript schema.
  - The cost log.

  *Exit:* `run` produces `transcript.json` and `cost.json` for a 10-minute file.
- **C2 — Cut detection.**
  - Silence and filler detection.
  - LLM retake detection.
  - EDL merge and validation.

  *Exit:* `edl.json`, plus unit tests for the pure functions.
- **C3 — Exporters.**
  - FCPXML, Premiere XML, CMX3600 and SRT.

  *Exit:* golden tests pass, and I confirm all three editors import the cuts correctly.
- **C4 — Metadata and cost report.**
  - Titles, description and chapters through the LLM interface, with a zod schema.
  - The cost per footage hour summary.
- **C5 — Benchmark.**
  - Two to three more speech-to-text adapters.
  - The `bench` command and its results table across the 4 language sets.
- **C6 — Browser audio-extraction spike** (ADR-015 risk).
  - A minimal page in `tools/audio-spike` that extracts the audio from a local 1-hour 4K file in the browser, using WebCodecs (with ffmpeg.wasm as the fallback), and reports the time and memory used.

  *Exit:* a short findings note in `docs/engineering/spikes/audio-extraction.md`.

## Start now

Do **C0 only**.

---
