## 1) Decisiones base de la plantilla (opiniones fuertes)

### Stack recomendado (productivo y estándar)

- **React + TypeScript**
- **Vite** (rápido, simple, soporta librerías bien)
- **React Router**
- **TanStack Query** (server state; cache, retry, invalidation)
- **Zustand** (opcional; UI state global, muy ligero)
  Regla: Redux solo si hay motivos organizacionales o necesidades específicas.
- **Zod** (validación de DTOs y formularios; además protege runtime)
- **Axios o fetch** (yo prefiero `fetch` envuelto en `HttpClient` propio para no acoplar)
- **Vitest + Testing Library** (unit/integration)
- **Playwright** (e2e opcional en la plantilla)
- **ESLint + Prettier + EditorConfig**
- **Husky + lint-staged** (gates en commits)
- **pnpm** (rápido, workspace-friendly; npm también sirve)

Esto te da una plantilla “usable en empresa” sin sobre-ingeniería.

---

## 2) Estructura de repo: “vertical slice + capas internas”

Esta es la base más reutilizable:

```
src/
  app/
    composition/
      container.ts            # Composition Root (DI manual)
      providers.tsx           # Providers: QueryClient, Router, etc.
    router/
      routes.tsx
    bootstrap/
      env.ts                  # lectura y tipado de env (solo aquí)
      config.ts               # ConfigPort + implementación
  shared/
    domain/
      errors/
      result/
      ports/
      valueObjects/
    application/
      ports/
      telemetry/
    infra/
      http/
        HttpClient.ts
        fetchHttpClient.ts
      telemetry/
      storage/
    presentation/
      hooks/
      state/
      components/
      mappers/
  features/
    auth/
      domain/
      application/
      adapters/
      infra/
      ui/
    tickets/
      domain/
      application/
      adapters/
      infra/
      ui/
tests/
  unit/
  integration/
  e2e/
```

Notas importantes:

- **UI nunca importa infra directamente**. UI importa `adapters/presentation`.
- Infra implementa puertos (interfaces). Los use cases dependen de interfaces.

---

## 3) Lo que tu plantilla DEBE traer (boilerplate esencial)

### A) Composition Root (DI manual)

- Un archivo que construya el grafo de dependencias:
  - `HttpClient`
  - repositorios (`TicketRepositoryHttp`)
  - casos de uso (`CreateTicketUseCase`)
  - presenters/viewmodels (`TicketsPresenter`)

Y la UI obtiene dependencias vía:

- `AppProviders` + `DependencyContext` (contexto mínimo)
- o factories por feature (más simple y escalable)

### B) Contratos estándar (Result + errores)

Define una forma única de retornar resultados:

- `Result<T, AppError>`
- `AppError` con categorías: `Validation`, `Unauthorized`, `Network`, `Conflict`, `Unknown`
  Esto evita que tu UI esté llena de `try/catch` y errores inconsistentes.

### C) HTTP client “anti-acoplamiento”

- `HttpClient` propio con:
  - baseUrl, headers, auth token provider
  - retries (o delegar a React Query)
  - normalización de errores

- Interceptors/handlers como pipeline (opcional)

### D) Server-state patrón único

- React Query con:
  - `queryKeys` por feature
  - `queries` y `mutations` en adapters (no en UI)
  - invalidation centralizada

### E) Validación de DTOs (runtime)

- `zod` schemas en `infra/http/dto`
- mapeo DTO -> dominio, y dominio -> DTO
  Esto te protege de cambios del backend.

### F) Logging/Telemetry como puerto

- `LoggerPort`, `TelemetryPort`
- Implementación por defecto: console
- Plug fácil: Sentry / OpenTelemetry

### G) Feature flags y config

- `ConfigPort` y lectura de `import.meta.env` solo en `app/bootstrap`.

### H) Testing template listo

- Tests de:
  - domain (puro)
  - use cases (con repo fake)
  - presenter (mapping)
  - UI integration (1 flujo)

- Mocks de HttpClient y repos.

### I) Calidad y “gates”

- ESLint con reglas para **boundary** (muy importante):
  - impedir imports de `infra` desde `ui`
  - impedir imports de `features/*/infra` desde otros features directamente
    Esto se logra con `eslint-plugin-boundaries` o reglas de `no-restricted-imports`.

---

## 4) Convenciones para mantener la Clean Architecture en el tiempo

### Regla de importaciones (la que salva el diseño)

- `features/*/ui` solo puede importar desde:
  - `features/*/adapters`
  - `shared/presentation`
  - `shared/domain` (solo types/VOs muy puntuales)

- `application` solo importa `domain` y puertos
- `domain` no importa nada externo

### Nomenclatura uniforme

- `*UseCase` para casos de uso
- `*Repository` para puertos
- `*HttpRepository` para implementación infra
- `*Presenter` o `*VM` para adaptadores de UI

### “Un feature mínimo” incluido

Tu template debe venir con **un feature real** ya montado. Ejemplo:

- `Auth` (login + sesión en memoria)
- `Tickets` (listado + create)
  Aunque la app sea demo, el patrón se entiende en 5 minutos.

---

## 5) Qué entregar como plantilla (artefactos concretos)

Checklist de entregables del repo template:

1. `README.md` con:
   - diagrama simple de dependencias
   - cómo crear feature nuevo (pasos)
   - convención de imports

2. `docs/architecture.md`:
   - explicación de capas
   - ejemplos de flujo

3. `docs/feature-playbook.md`:
   - “cómo agregar endpoint”
   - “cómo agregar use case”

4. `docs/testing-strategy.md`
5. `docs/decisions/` con ADRs mínimos (opcional, pero valioso)

---

## 6) Opcional: convertirlo en generador (para que sea reutilizable de verdad)

Dos niveles:

### Nivel 1: GitHub Template

- Repo marcado como “Template”
- Copias y renombras proyecto manualmente

### Nivel 2: CLI generator (recomendado si lo vas a usar mucho)

- `plop` o `hygen` para generar:
  - feature completo con carpetas + archivos base
  - use case + tests
  - repository port + implementación http
  - query/mutation + presenter

Esto vuelve tu boilerplate “productivo” en serio.

---

## 7) Recomendación final (para que no sea “arquitectura teórica”)

Haz la plantilla con:

- 1 feature que use **React Query** (server state)
- 1 feature que demuestre **UI state** (Zustand o context local)
- 1 caso con **validación zod** + **mapeo** + **Result**
- 1 integración de **telemetry** (aunque sea console)
- reglas ESLint que **impidan** romper capas

Si tu template no “frena” los malos imports, se degrada en semanas.
