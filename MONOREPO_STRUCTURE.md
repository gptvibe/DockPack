# DockPack Monorepo Structure

## Recommended Workspace Strategy

- Use `pnpm` workspaces for JavaScript and TypeScript packages.
- Use `turborepo` for task orchestration, caching, and dependency-aware builds.
- Keep Rust code inside each Tauri app's `src-tauri` directory until a real shared Rust crate appears. Do not force a Rust workspace on day one.
- Treat `apps/builder-desktop` as the authoring product and `apps/launcher-template` as the runtime template that gets turned into the generated launcher and installer.

## Recommended Folder Tree

```text
.
|-- apps/
|   |-- builder-desktop/
|   |   |-- package.json
|   |   |-- tsconfig.json
|   |   |-- vite.config.ts
|   |   |-- tailwind.config.ts
|   |   |-- components.json
|   |   |-- src/
|   |   |   |-- main.tsx
|   |   |   |-- app/
|   |   |   |   |-- AppShell.tsx
|   |   |   |   |-- routes.tsx
|   |   |   |-- features/
|   |   |   |   |-- source-intake/
|   |   |   |   |-- compatibility/
|   |   |   |   |-- packaging-config/
|   |   |   |   |-- review-generate/
|   |   |   |   |-- build-jobs/
|   |   |   |-- lib/
|   |   |   |   |-- tauri/
|   |   |   |   |-- state/
|   |   |   |   |-- utils/
|   |   |   |-- styles/
|   |   |   |   |-- globals.css
|   |   |-- src-tauri/
|   |   |   |-- Cargo.toml
|   |   |   |-- tauri.conf.json
|   |   |   |-- src/
|   |   |   |   |-- main.rs
|   |   |   |   |-- commands/
|   |   |   |   |-- packaging/
|   |   |   |   |-- launcher_template/
|   |   |   |   |-- diagnostics/
|   |   |-- tests/
|   |
|   |-- launcher-template/
|   |   |-- package.json
|   |   |-- tsconfig.json
|   |   |-- vite.config.ts
|   |   |-- tailwind.config.ts
|   |   |-- components.json
|   |   |-- src/
|   |   |   |-- main.tsx
|   |   |   |-- app/
|   |   |   |   |-- App.tsx
|   |   |   |-- screens/
|   |   |   |   |-- LaunchingScreen.tsx
|   |   |   |   |-- StatusScreen.tsx
|   |   |   |   |-- ErrorScreen.tsx
|   |   |   |-- lib/
|   |   |   |   |-- manifest.ts
|   |   |   |   |-- runtime-client.ts
|   |   |   |-- styles/
|   |   |   |   |-- globals.css
|   |   |-- src-tauri/
|   |   |   |-- Cargo.toml
|   |   |   |-- tauri.conf.json
|   |   |   |-- src/
|   |   |   |   |-- main.rs
|   |   |   |   |-- commands/
|   |   |   |   |-- runtime/
|   |   |   |   |-- diagnostics/
|   |   |-- template-assets/
|   |   |   |-- icons/
|   |   |   |-- installer/
|
|-- packages/
|   |-- url-parser/
|   |   |-- package.json
|   |   |-- tsconfig.json
|   |   |-- src/
|   |   |   |-- index.ts
|   |   |   |-- parse-docker-hub-url.ts
|   |   |   |-- parse-github-url.ts
|   |   |   |-- normalize-source.ts
|   |   |   |-- errors.ts
|   |   |-- tests/
|   |
|   |-- docker-adapter/
|   |   |-- package.json
|   |   |-- tsconfig.json
|   |   |-- src/
|   |   |   |-- index.ts
|   |   |   |-- contracts.ts
|   |   |   |-- builder-client.ts
|   |   |   |-- image-analysis.ts
|   |   |   |-- repo-analysis.ts
|   |   |   |-- packaging-jobs.ts
|   |   |   |-- mocks.ts
|   |   |-- tests/
|   |
|   |-- manifest-schema/
|   |   |-- package.json
|   |   |-- tsconfig.json
|   |   |-- src/
|   |   |   |-- index.ts
|   |   |   |-- source-descriptor.ts
|   |   |   |-- packaging-manifest.ts
|   |   |   |-- compatibility-report.ts
|   |   |   |-- launcher-config.ts
|   |   |   |-- artifact-manifest.ts
|   |   |-- schemas/
|   |   |   |-- packaging-manifest.schema.json
|   |   |   |-- launcher-config.schema.json
|   |   |-- tests/
|   |
|   |-- ui/
|   |   |-- package.json
|   |   |-- tsconfig.json
|   |   |-- components.json
|   |   |-- src/
|   |   |   |-- index.ts
|   |   |   |-- components/
|   |   |   |-- layout/
|   |   |   |-- forms/
|   |   |   |-- feedback/
|   |   |   |-- hooks/
|   |   |   |-- lib/
|   |   |   |-- styles/
|   |   |   |-- tailwind-preset.ts
|   |   |-- stories/
|
|-- package.json
|-- pnpm-workspace.yaml
|-- turbo.json
|-- tsconfig.base.json
|-- README.md
```

## Module Design

### apps/builder-desktop

**Purpose**

This is the main DockPack product. It is the Windows desktop app that guides a technical user through source intake, compatibility checks, packaging configuration, and generation of a Windows launcher and installer around a containerized app.

**Main Files**

- `src/main.tsx`: React entrypoint.
- `src/app/AppShell.tsx`: top-level desktop shell, layout, navigation, and command wiring.
- `src/features/source-intake/*`: Docker Hub and GitHub source entry UI.
- `src/features/compatibility/*`: support verdicts, warnings, and unsupported states.
- `src/features/packaging-config/*`: form flow for app metadata, ports, environment variables, and runtime options.
- `src/features/review-generate/*`: summary and generation triggers.
- `src/features/build-jobs/*`: build progress, logs, status polling, and completion screens.
- `src-tauri/src/commands/*`: narrow Rust commands exposed to the frontend.
- `src-tauri/src/packaging/*`: packaging orchestration, asset generation, manifest writes, and installer assembly.
- `src-tauri/src/launcher_template/*`: logic for copying, parameterizing, and building the launcher template.

**Ownership of Concerns**

Owns:
- The full builder workflow and wizard UX.
- User project state, recent projects, and local packaging manifests.
- Orchestration of Rust commands for analysis, validation, and artifact generation.
- Progress reporting, logs, and beginner-friendly error recovery.
- Build-time integration with `apps/launcher-template`.

Does not own:
- Shared design-system primitives.
- URL parsing rules for supported sources.
- Shared manifest and schema definitions.
- The end-user launcher runtime after generation.

**Dependencies Between Modules**

- Depends on `packages/url-parser` for canonical link parsing.
- Depends on `packages/docker-adapter` for typed frontend-side access to analysis and packaging operations.
- Depends on `packages/manifest-schema` for stable contracts shared across the builder and generated launcher.
- Depends on `packages/ui` for reusable visual primitives and theme consistency.
- Consumes `apps/launcher-template` as a build-time asset source, not as a normal runtime library dependency.

### apps/launcher-template

**Purpose**

This is the template application used to produce the generated Windows launcher and installer experience. It is the runtime shell that nontechnical end users will interact with after the builder has packaged an app.

**Main Files**

- `src/main.tsx`: React entrypoint for the generated launcher UI.
- `src/app/App.tsx`: top-level launcher shell.
- `src/screens/LaunchingScreen.tsx`: first-run and startup state.
- `src/screens/StatusScreen.tsx`: running, checking, and healthy states.
- `src/screens/ErrorScreen.tsx`: user-readable runtime errors and recovery guidance.
- `src/lib/manifest.ts`: reads generated runtime manifest/config.
- `src/lib/runtime-client.ts`: typed calls to Tauri commands for start, stop, status, and diagnostics.
- `src-tauri/src/runtime/*`: Rust runtime control for container launch, health checks, and lifecycle management.
- `src-tauri/src/diagnostics/*`: end-user diagnostics and support logging.
- `template-assets/*`: icons, installer assets, and template defaults.

**Ownership of Concerns**

Owns:
- End-user launch experience.
- Runtime checks, status polling, and health feedback.
- Starting and managing the packaged container behind the scenes.
- Support-oriented diagnostics for the generated app.

Does not own:
- Source analysis.
- Builder wizard flow.
- Docker Hub or GitHub URL parsing.
- Packaging decisions that belong to the authoring app.

**Dependencies Between Modules**

- Depends on `packages/manifest-schema` for the generated manifest and runtime config shape.
- Depends on `packages/ui` for shared branding, status components, dialogs, and layout primitives.
- Must not depend on `packages/url-parser` or `packages/docker-adapter`, because those are authoring-time concerns rather than runtime concerns.
- Is consumed by `apps/builder-desktop` as a template input during generation.

### packages/url-parser

**Purpose**

This package normalizes and validates incoming Docker Hub image links and GitHub repository links into canonical source descriptors that the rest of the system can understand.

**Main Files**

- `src/index.ts`: public exports.
- `src/parse-docker-hub-url.ts`: Docker Hub URL and image reference parsing.
- `src/parse-github-url.ts`: GitHub repository URL parsing.
- `src/normalize-source.ts`: converts parsed inputs into a canonical source shape.
- `src/errors.ts`: typed parser errors and user-safe failure reasons.

**Ownership of Concerns**

Owns:
- Supported URL pattern matching.
- Canonicalization of source references.
- Input-level validation and parse error codes.

Does not own:
- Network calls.
- Repository or image compatibility analysis.
- Packaging logic.
- Manifest persistence.

**Dependencies Between Modules**

- Depends on `packages/manifest-schema` for the shared source descriptor type.
- Should have no dependency on app code.
- Is consumed primarily by `apps/builder-desktop` before analysis begins.

### packages/docker-adapter

**Purpose**

This package provides the TypeScript-side container orchestration contract for the builder app. It should expose typed client functions that call Tauri Rust commands, plus mocks and test doubles for UI development.

**Main Files**

- `src/index.ts`: public exports.
- `src/contracts.ts`: request and response contracts for analysis, build jobs, and status.
- `src/builder-client.ts`: typed wrapper around Tauri command invocation.
- `src/image-analysis.ts`: image analysis entrypoints and helpers.
- `src/repo-analysis.ts`: GitHub repository analysis entrypoints and helpers.
- `src/packaging-jobs.ts`: long-running job status helpers and progress mapping.
- `src/mocks.ts`: mock adapter implementations for tests and Storybook-like environments.

**Ownership of Concerns**

Owns:
- Frontend-facing abstraction over Rust commands.
- Typed transport shapes and adapter ergonomics.
- Mockable container-analysis client behavior for UI tests.
- Mapping low-level command output into stable frontend models.

Does not own:
- Actual Docker or system process execution logic in TypeScript.
- Shared schema definitions.
- Raw source URL parsing.
- End-user launcher runtime behavior.

**Dependencies Between Modules**

- Depends on `packages/manifest-schema` for source, compatibility, manifest, and artifact types.
- Should not depend on `apps/builder-desktop`; app code depends on the adapter, not the other way around.
- Is consumed by `apps/builder-desktop` only.

### packages/manifest-schema

**Purpose**

This package is the source of truth for JSON-serializable contracts shared across the builder app, the generated launcher, and any supporting tooling. It should define the versioned shapes for source descriptors, packaging manifests, compatibility reports, launcher configuration, and emitted artifacts.

**Main Files**

- `src/index.ts`: public exports.
- `src/source-descriptor.ts`: normalized source reference schema.
- `src/packaging-manifest.ts`: saved builder project manifest schema.
- `src/compatibility-report.ts`: supported, warning, and unsupported verdict schema.
- `src/launcher-config.ts`: runtime launcher configuration schema.
- `src/artifact-manifest.ts`: emitted artifact metadata schema.
- `schemas/*.schema.json`: generated JSON Schema outputs for external validation or Rust-side integration.

**Ownership of Concerns**

Owns:
- Runtime-agnostic data contracts.
- Zod or equivalent validation schemas.
- Versioning strategy for saved manifests.
- Migration helpers when manifest versions change later.

Does not own:
- UI presentation.
- Docker command execution.
- File I/O.
- Tauri command wiring.

**Dependencies Between Modules**

- Should have no dependency on app code.
- Should have no dependency on `packages/ui`.
- Is the foundational package used by `packages/url-parser`, `packages/docker-adapter`, `apps/builder-desktop`, and `apps/launcher-template`.

### packages/ui

**Purpose**

This package is the shared visual layer for DockPack. It should hold reusable shadcn/ui-based primitives, DockPack-specific layout components, Tailwind presets, and feedback patterns used by both apps.

**Main Files**

- `src/index.ts`: package exports.
- `src/components/*`: buttons, cards, dialogs, badges, tables, and reusable primitives.
- `src/layout/*`: app shells, side panels, step headers, and page sections.
- `src/forms/*`: form rows, grouped settings sections, validation summaries.
- `src/feedback/*`: empty states, loading states, warning panels, success states, and log viewers.
- `src/styles/*`: shared CSS tokens and utility styles.
- `src/tailwind-preset.ts`: shared Tailwind theme extension and token mapping.

**Ownership of Concerns**

Owns:
- DockPack design tokens and shared visual language.
- Reusable component composition built on shadcn/ui.
- Consistent wizard and status presentation patterns.

Does not own:
- Product-specific business logic.
- Source parsing.
- Container or packaging orchestration.
- Manifest validation rules.

**Dependencies Between Modules**

- Should stay independent from DockPack domain packages wherever possible.
- Is consumed by both `apps/builder-desktop` and `apps/launcher-template`.
- Can depend on external UI libraries, Tailwind, and shadcn/ui-generated primitives, but should avoid taking dependencies on `packages/manifest-schema` or `packages/docker-adapter`.

## Recommended Dependency Flow

Use this dependency direction consistently:

```text
packages/manifest-schema
  -> packages/url-parser
  -> packages/docker-adapter

packages/ui

packages/url-parser
packages/docker-adapter
packages/manifest-schema
packages/ui
  -> apps/builder-desktop

packages/manifest-schema
packages/ui
  -> apps/launcher-template

apps/launcher-template
  -> apps/builder-desktop  (build-time template consumption only)
```

Interpretation:

- `packages/manifest-schema` is the base contract layer.
- `packages/ui` is the base presentation layer.
- `packages/url-parser` and `packages/docker-adapter` sit above the schema layer and stay builder-focused.
- `apps/builder-desktop` is the top-level authoring app.
- `apps/launcher-template` is a separately buildable app that the builder consumes as a generation template.

## Boundary Rules

- Do not let packages depend on apps.
- Do not put shared UI inside `apps/builder-desktop` if it will also be used by the launcher.
- Do not put packaging or runtime orchestration logic inside `packages/ui`.
- Do not let `apps/launcher-template` import builder-only concerns such as source parsing or package-generation flows.
- Keep Rust command implementations app-local until duplication proves a shared Rust crate is necessary.
- Keep generated artifacts and temporary build output out of the source tree; they should live in ignored output directories rather than inside `apps/launcher-template`.

## Why This Split Fits DockPack

This structure keeps the builder and generated launcher as separate products with different responsibilities. The builder owns authoring-time concerns such as source analysis and artifact generation. The launcher template owns end-user runtime concerns such as startup, health reporting, and support diagnostics. Shared contracts live in `packages/manifest-schema`, and shared presentation lives in `packages/ui`, which keeps both apps consistent without mixing product logic into the wrong layer.