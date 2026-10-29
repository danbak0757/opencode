# Custom Version Overview

## About This Fork

This is a **fan-made, independent fork of OpenCode**, built on the official open-source project. It is not an official OpenCode release, is not maintained by the OpenCode team, and is not affiliated with or endorsed by them. OpenCode's name and marks belong to their respective owners.

The fork adds a custom **terminal UI (TUI)** and an agent-workflow layer for coordinating software-development tasks. It continues to incorporate upstream OpenCode changes while keeping these fork-specific features. The desktop application is not customized by this project.

> **Distribution note:** The official OpenCode installers and releases do not include this fork's custom features. Use a build produced from this repository, or a release explicitly published for this fork.

## What This Fork Adds

- **Custom terminal sidebar** with agent activity indicators, session/context usage, and English labels.
- **Three persistent work modes:** Planning, Diagnostics, and Automation.
- **67 specialist agents** with concise English display names and distinct responsibilities.
- **Built-in `team_run` workflow tool** for coordinating independent subagent tasks concurrently and collecting their reports.
- **Bundled defaults:** the custom agents, mode instructions, and agent-work plugins are included in the CLI/Core build. No manual copying into the global OpenCode configuration is needed.
- **Upstream OpenCode capabilities** remain part of the fork; see the [official OpenCode documentation](https://opencode.ai/v2/docs/) for upstream features.

The fork-specific layer does not replace OpenCode's server API, authentication, or provider integrations. User and project configuration can still override bundled agent settings.

## Work Modes

| Mode | Intended use | Permission behavior |
| --- | --- | --- |
| **Planning** | Explore the task, clarify requirements, and prepare a complete implementation plan without carrying it out. | Applies restrictive session permissions; write actions require permission. |
| **Diagnostics** | Investigate a problem and report evidence without intentionally changing project files. | Applies restrictive session permissions. Review tool permissions and prompts for the active configuration. |
| **Automation** | Implement a clearly requested task within its stated scope, then verify the result. | Uses the session's normal configured permissions. Risky or destructive actions remain subject to permission checks. |

The selected mode is saved with the session and propagated to `team_run` child sessions. Legacy Polish mode values in existing session metadata and local preferences are normalized for compatibility.

### Permission and Safety Limitations

Modes are workflow guidance plus OpenCode session permissions; they are **not operating-system sandboxes**. A mode label alone cannot guarantee that every tool or external process is read-only. Review permission prompts and configuration, especially for shell/execute tools and third-party plugins.

`team_run` checks task definitions and rejects overlapping declared write scopes. A `writeScope` is a coordination contract between agents, **not filesystem isolation**: it cannot prevent an agent or tool from writing outside that path. Child sessions inherit the parent's permissions.

## Agent Catalog

The 67 agents below are the fork's specialist catalog. The coordinator selects relevant roles for a task; having an agent in the catalog does not mean it runs on every request. The names below are English display names. Existing internal agent identifiers are retained for compatibility with sessions and configuration.

### Coordination and Product Discovery

| # | Agent | Responsibility |
| ---: | --- | --- |
| 01 | Lead Coordinator | Understands the request, assigns owners, coordinates work, and integrates verified results. |
| 02 | Planning Lead | Leads read-only discovery, requirement clarification, and delivery planning. |
| 03 | Diagnostics Lead | Coordinates evidence-based, read-only investigation. |
| 04 | Delivery Lead | Drives implementation of an explicitly authorized scope through verification. |
| 05 | Stream Coordinator | Tracks dependencies, handoffs, and progress across workstreams. |
| 06 | Scope & Risk | Reviews boundaries, approvals, risks, and safe execution conditions. |
| 07 | Critical Reviewer | Challenges assumptions and independently reviews proposed or completed work. |
| 08 | Product Strategist | Connects user value, product direction, and measurable outcomes. |
| 09 | User Research | Identifies user segments, needs, and evidence about the problem. |
| 10 | Business Analyst | Analyzes business goals, processes, and expected value. |
| 11 | Domain Analyst | Examines domain concepts, rules, and constraints. |
| 12 | Requirements Analyst | Converts goals into testable functional and non-functional requirements. |
| 13 | Portfolio Analyst | Assesses priorities, dependencies, and portfolio trade-offs. |
| 14 | Stakeholder Analyst | Maps stakeholders, responsibilities, and competing needs. |

### Research, Design, and Architecture

| # | Agent | Responsibility |
| ---: | --- | --- |
| 15 | Repository Researcher | Maps repository structure, conventions, and existing implementation. |
| 16 | Docs Researcher | Finds and evaluates relevant product and technical documentation. |
| 17 | API Researcher | Investigates API and platform capabilities and constraints. |
| 18 | Dependency Researcher | Evaluates packages, versions, maintenance, and dependency risks. |
| 19 | Solutions Researcher | Finds existing approaches and compares alternatives. |
| 20 | Source Verifier | Checks factual claims and traces them to reliable sources. |
| 21 | Benchmark Analyst | Defines comparisons and interprets benchmark evidence. |
| 22 | UX Designer | Designs user flows and interaction behavior. |
| 23 | UI Designer | Defines interface presentation and design-system patterns. |
| 24 | IA Designer | Structures information, navigation, and content hierarchy. |
| 25 | Accessibility Specialist | Reviews inclusive interaction and accessibility requirements. |
| 26 | Prototype Designer | Builds prototypes to make proposed interactions testable. |
| 27 | Usability Researcher | Evaluates usability and identifies interaction problems. |
| 28 | Systems Architect | Designs system boundaries, components, and cross-system behavior. |
| 29 | App Architect | Defines application-level structure and implementation approach. |

### Engineering and Integration

| # | Agent | Responsibility |
| ---: | --- | --- |
| 30 | Frontend Engineer | Implements web user interfaces and client-side behavior. |
| 31 | Backend Engineer | Implements server-side services and business logic. |
| 32 | API Engineer | Designs and implements API contracts and integrations. |
| 33 | Database Specialist | Designs data models, queries, and database behavior. |
| 34 | Mobile Engineer | Implements and evaluates mobile application behavior. |
| 35 | Desktop Engineer | Works on desktop applications and terminal UI behavior. |
| 36 | Integration Engineer | Connects components and external systems. |
| 37 | AI Engineer | Implements and evaluates AI/LLM features and workflows. |
| 38 | Performance Engineer | Measures and improves runtime and resource performance. |
| 39 | Refactoring Engineer | Improves existing code structure while preserving behavior. |

### Quality, Security, and Compliance

| # | Agent | Responsibility |
| ---: | --- | --- |
| 40 | QA Architect | Defines quality strategy, coverage, and acceptance evidence. |
| 41 | Unit Test Engineer | Adds focused tests for individual units and edge cases. |
| 42 | Integration Test Engineer | Verifies interactions between components and services. |
| 43 | E2E Test Engineer | Tests complete user and system workflows. |
| 44 | Regression Analyst | Identifies and verifies regressions against existing behavior. |
| 45 | Reliability Engineer | Evaluates failure handling, resilience, and recovery. |
| 46 | Implementation Reviewer | Checks an implementation against requirements and code conventions. |
| 47 | Threat Analyst | Models threats and identifies security risks. |
| 48 | App Security Auditor | Reviews application code and controls for security weaknesses. |
| 49 | Privacy Specialist | Evaluates personal-data handling and privacy risks. |
| 50 | License Analyst | Checks code and content provenance and license obligations. |
| 51 | Supply Chain Auditor | Reviews dependency and build-chain integrity risks. |
| 52 | Compliance Analyst | Maps applicable requirements and evidence needs. |

### Operations, Documentation, and Support

| # | Agent | Responsibility |
| ---: | --- | --- |
| 53 | DevOps Engineer | Improves development, deployment, and operational workflows. |
| 54 | CI Engineer | Designs and maintains continuous integration and automation. |
| 55 | Infrastructure Engineer | Designs and maintains runtime and deployment infrastructure. |
| 56 | Observability Engineer | Improves logs, metrics, traces, and diagnostic visibility. |
| 57 | SRE | Applies service reliability, availability, and incident practices. |
| 58 | Release Coordinator | Coordinates release readiness, sequencing, and release checks. |
| 59 | Migration Specialist | Plans and validates data, configuration, or platform migrations. |
| 60 | Technical Writer | Produces technical and developer-facing documentation. |
| 61 | User Docs Writer | Produces end-user guidance and help content. |
| 62 | Localization Specialist | Adapts product content for language and locale. |
| 63 | Technical Editor | Improves clarity, consistency, and correctness of technical text. |
| 64 | Cost Analyst | Estimates and evaluates implementation and operating costs. |
| 65 | Model Routing Specialist | Selects and routes work to suitable models. |
| 66 | Support Analyst | Reproduces user reports and organizes support evidence. |
| 67 | Incident Analyst | Reconstructs incidents, impact, contributing factors, and follow-up actions. |

## `team_run` Workflow

`team_run` lets the coordinator submit a batch of independent subagent tasks. Each task specifies an owner, a concrete goal, a prompt, and declared write scopes. The tool checks task definitions and scope overlap, starts child sessions concurrently, waits for their completion, and returns their reports to the coordinator.

Use separate batches for dependent work: a later batch should start only after the coordinator has reviewed the earlier results. The tool's validation and write-scope checks help coordinate work but do not replace permission enforcement or sandboxing.

## Configuration and Compatibility

- Custom agents, shared workflow instructions, work-mode behavior, and `team_run` are bundled into builds from this repository.
- The build does not copy files into or replace a user's global OpenCode configuration.
- User and project configuration may override or disable bundled agent defaults.
- Existing technical agent identifiers are preserved; visible sidebar labels use concise English descriptions.
- The Desktop application is not customized by this fork; the custom interface changes apply to the terminal CLI/TUI.
- The portable configuration files are documented in [`custom-config/README.md`](./custom-config/README.md).

## Build and Run

Use the repository's pinned Bun version (`bun@1.4.4`) and the setup instructions in the upstream [contributing guide](./CONTRIBUTING.md).

```sh
# Install workspace dependencies from the repository root
bun install

# Verify that bundled agent and instruction assets match their source files
bun run custom-config:check

# Run the development CLI from the repository root
bun run dev
```

To build the CLI distribution, run the CLI package build script:

```sh
cd packages/cli
bun run build
```

The default output directory is `packages/cli/dist/`. The platform-specific executable is written under `packages/cli/dist/<targetName>/bin/`; target names normally follow `cli-<os>-<arch>` and may include build variants. For example, a Windows x64 build produces `packages/cli/dist/cli-windows-x64/bin/opencode.exe`. Run that executable directly to use the built fork.

The standard upstream installers and package-manager commands in [README.md](./README.md) install upstream OpenCode, not this fork. A custom-fork binary or release must be built or published from this repository.

## Upstream and Project Status

This fork follows the official OpenCode repository and may periodically merge upstream changes. Upstream features, APIs, dependencies, and compatibility can change between syncs. The custom layer is community-maintained and provided as-is; review permissions and back up important work before using it on sensitive projects.

For upstream OpenCode documentation and project governance, see the [official documentation](https://opencode.ai/v2/docs/) and the [upstream repository](https://github.com/anomalyco/opencode). For this fork's source, issues, or contributions, use the repository where this fork is hosted.
