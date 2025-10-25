# Application Architecture

BrickAI is organised as an object-oriented codebase with a layered architecture that clearly separates domain concerns, data access, and presentation logic. This document summarises the key components and the conventions that contributors must follow.

## Core Principles

- **Domain first:** Behavioural rules live inside domain entities (`core/domain`). Entities expose intent-driven methods (`updateTask`, `markCompleted`) rather than leaking plain object mutations.
- **Explicit abstractions:** Repositories implement data access, while services orchestrate domain behaviour. UI code consumes behaviour through service contracts rather than touching persistence or remote APIs directly.
- **Dependency injection:** A lightweight service container (`core/ioc`) centralises dependency wiring. Hooks and components resolve services through tokens, ensuring all new code remains testable and modular.
- **Single responsibility:** Each class focuses on one concern (e.g., `TaskService` handles task workflows, `ProfileService` manages profile completion).

## Directory Layout

```
core/
  domain/          # Domain entities and value objects
  infrastructure/  # Framework/environment adapters (Supabase factory, etc.)
  repositories/    # Persistence implementations
  services/        # Application services and strategies
  ioc/             # Service container, tokens, registration helpers
hooks/             # React hooks that delegate to services
supabase/functions # Edge functions rewritten with internal classes
```

## Service Container

The `ServiceContainer` provides a simple registry for singleton dependencies. Services are registered in `core/ioc/registerServices.ts`. When adding a new service:

1. Define an explicit token in `core/ioc/tokens.ts`.
2. Register a factory in `registerServices.ts`.
3. Resolve the service inside React hooks or other consumers via `ServiceContainer.instance.resolve(...)`.

Avoid constructing services directly in UI code — leverage the container to keep wiring consistent and testable.

## Domain Entities

- Extend `BaseEntity` and encapsulate state mutations via methods.
- When new fields are introduced, expose explicit getters/setters on the entity and update the corresponding repository mapping.
- Use value objects (`core/domain/valueObjects`) for reusable rules (identifiers, etc.).

## Services & Repositories

- Services extend `BaseService` and operate on entities. They may compose multiple repositories or other services.
- Repositories extend `BaseSupabaseRepository` when the generic behaviour fits, or implement custom persistence if needed.
- Keep service methods intention revealing (e.g., `attachImages`, `toggleTaskCompletion`).
- Prefer returning domain entities from services and convert to UI-facing models only at the hook/component boundary.

## React Hooks

Hooks (e.g., `useAuth`, `useTaskManager`, `usePortfolioManager`) are the façade between services and components:

- Resolve dependencies through the container.
- Maintain local UI state but delegate side-effects to services.
- Never call Supabase or other infrastructure APIs directly from hooks.
- Broadcast task mutations through the client-side task event bus (`lib/task-events.ts`) so separate hook instances stay in sync without forcing a page refresh.

## Edge Functions

Supabase edge functions (`supabase/functions/*`) mirror the same OOP discipline. Each function encapsulates:

- **Input parsing/validation** (`TaskCreationRequest`, `TaskPolishRequest`).
- **Infrastructure wiring** (`SupabaseContext`, `CorsPolicy`).
- **Domain behaviour** (`TaskRepository`, `AiLabelService`, `TaskPolisher`).

When creating new functions, follow the existing pattern to keep logic modular and testable.

## Contribution Checklist

1. Prefer adding behaviour to existing entities/services before creating new abstractions.
2. Ensure new services are registered in the container and covered by tests where possible.
3. When touching UI code, confirm you are consuming services rather than replicating business logic locally.
4. Update this document and the README if architectural boundaries change.
