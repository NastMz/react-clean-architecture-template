# Plan Maestro - Template Finalizada a CLI Foundry

Objetivo general: cerrar primero una template estable, modular y lista para ser consumida por un CLI industrial (Foundry), evitando deuda tecnica que complique el generador.

## Fase A - Cierre de la Template (prioridad inmediata)

### A1. Inventario y estabilidad

- Confirmar el core fijo: `src/app/composition`, `src/app/router`, `shared`, estructura de capas.
- Revisar README y docs para asegurar que reflejan el estado real del template.
- Garantizar que el template pasa `lint`, `test` y `typecheck` sin cambios adicionales.

### A2. Preparar puntos de inyeccion (anchors)

- Introducir anchors en wiring principal:
  - `src/app/composition/container.ts`
  - `src/app/router/routes.tsx`
- Documentar que el patcher no reordena bloques; solo inserta dentro de anchors.

### A3. Modularizar contenido opcional

- Definir que pertenece a:
  - Core: estructura, reglas, config base, router, composition.
  - Opcionales: Storybook, OTEL, demo auth, e2e, husky/lint-staged.
- Establecer un mapa claro de archivos incluidos/excluidos por preset.

### A4. Limpieza para consumo externo

- Eliminar o aislar assets de proyecto que no deben ir a nuevos repos.
- Confirmar que no hay rutas duras ni referencias a nombres de proyecto.

Salida esperada Fase A:

- Template completa, estable, con anchors definidos y documentados.
- Lista precisa de archivos por preset.

## Fase B - Especificacion del CLI (paralela a la estabilizacion)

### B1. Contrato CLI v1 (cerrado)

- Comandos: `init`, `generate`, `check`, `upgrade`.
- Flags estandar: `--dry-run`, `--force`, `--cwd`, `--json`.
- Politica de conflictos e idempotencia definida.

### B2. Matriz de presets v1

- `minimo`, `estandar`, `completo` con definiciones exactas de deps, archivos y scripts.
- Referencia directa a la estructura de la template final.

### B3. Anchors y convenciones

- Documento con anchors y reglas de insercion (sin reordenar bloques).

Salida esperada Fase B:

- Documento de contrato, tabla de presets y definicion de anchors.

## Fase C - CLI Foundry (post-template)

### C1. Bootstrap del repo `foundry-cli`

- Estructura inicial: `src/`, `templates/`, `docs/`, `tests/`.
- Config base: TS, build, lint, test.

### C2. Motor custom

- Render de templates (EJS/Handlebars).
- Write-if-absent.
- Logging estandar y opcion `--json`.

### C3. Patcher por anchors

- Inserciones controladas en `container.ts` y `routes.tsx`.
- Politica de conflictos: noop si igual, error si distinto.

### C4. Generadores MVP

- `feature`, `use-case`, `route`.
- Wiring automatico.

### C5. Guardrails

- Check: lint + reglas de arquitectura + estructura.
- Integracion en CI.

### C6. Upgrade

- Metadata de version en proyecto.
- Migraciones incrementales (dry-run por defecto).

## Dependencias de arranque (antes de CLI)

1. Anchors definidos en template.
2. Lista final de archivos por preset.
3. Template validada y estable.

## Riesgos y mitigaciones

- Riesgo: cambios tardios en container/router rompen inyecciones.
  Mitigacion: anchors estables y documentacion estricta.
- Riesgo: presets mal definidos generan builds inconsistentes.
  Mitigacion: matriz de presets testable con fixtures.

## Proximos pasos sugeridos

1. Cerrar Fase A (template final con anchors).
2. Congelar matriz de presets.
3. Iniciar `foundry-cli`.
