# World Cup 2026 Site Project Rules

Date: 2026-05-17  
Status: Active project rule

## 1. Project Boundary

This project conversation may directly edit only:

```text
/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026
```

No code, data, test, README, DESIGN, workflow, or generated file outside this directory should be changed from this project conversation.

If another directory needs changes, this project conversation must produce a handoff note for the user to forward to the appropriate project conversation.

## 2. Coordination Context

The site conversation may read these coordination documents:

```text
/Users/chamcham/Documents/AI/CODEX/soccer/football-data-platform/docs/2026-05-17-coordination-and-github-publish-rules.md
/Users/chamcham/Documents/AI/CODEX/soccer/WORKSPACE_STATUS.md
```

These files are read-only from the site conversation. They are maintained by the data-platform/global-coordinator conversation.

## 3. Site-Owned Work

The site owns:

- React UI and pages under `src`
- Site styling and visual QA
- Site route behavior
- Runtime API fetching and fallback behavior
- Local TypeScript fallback compatibility files
- GitHub Pages workflow for this repository
- Supabase client UI integration
- Site tests
- Site documentation

## 4. Out Of Boundary

The site does not own:

- `football-data-platform` schema, data collection, provider adapters, normalized data, public API publishing, reports, or source health
- `world-cup-predictor` model code, feature pipelines, training/evaluation, prediction generation, Kelly/EV logic, or reports
- Workspace-level coordination files under `/Users/chamcham/Documents/AI/CODEX/soccer`

## 5. Data Coordination Rules

The site consumes shared football data from `football-data-platform`.

If the site needs a new field, endpoint, dataset, data coverage item, or schema change:

1. Do not edit the data-platform repository from this project conversation.
2. Write a handoff note to the coordinator.
3. Wait for the data platform to publish the contract.
4. Implement the site-side consumer after the platform contract is available.

Local fallback files in `src/data/*.ts` are compatibility outputs. They are not the production truth source.

While local fallback files remain in use, `sync:shared-data` must stay wired into test/build flows so a direct build cannot publish stale fallback data.

## 6. Handoff Format

Use this format when another project must act:

```text
Project:
Task:
Reason:
Required change:
Files likely affected:
Data/API contract impact:
Validation:
Blockers:
Return report expected:
```

## 7. GitHub Publish Rules

Use normal SSH Git first:

```bash
git fetch
git pull
git push
```

If full `git fetch` starts downloading historical blobs very slowly, use a filtered fetch before treating SSH/Git as failed:

```bash
git fetch --filter=blob:none --no-tags origin main
```

GitHub API publishing is only a fallback when SSH/Git transport fails.

Before publishing:

- Run `git status --short --branch`.
- Confirm the worktree contains only intended changes.
- Prefer normal commits and normal SSH push.

If API fallback is used:

- Verify the remote commit or tree.
- Verify GitHub Actions / Pages deployment.
- Report why Git fallback was needed.

Do not force-push or use destructive reset commands unless the user explicitly approves.

## 8. Documentation Maintenance

The main design baselines are:

```text
DESIGN.md
DESIGN.zh.md
```

Update them when changing:

- page architecture
- route structure
- data source or runtime API contract
- local fallback data strategy
- build/deploy behavior
- project boundary or coordination rules
- external dependencies
- visual system rules

This file and root `AGENTS.md` must stay aligned.
