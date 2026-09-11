# HANDOFF — DeepSeek — Punto Inmobiliario HN

## Contexto

Este repositorio es la Fase 1 de una plataforma inmobiliaria hondureña. Debe evolucionar como producto real, no como demo visual. El objetivo de UX es: búsqueda → ficha → contacto → visita → negociación → cierre.

## Restricciones que NO deben romperse

- Next.js App Router.
- TypeScript strict.
- PostgreSQL/Neon.
- Drizzle ORM.
- Zod para validación de bordes/API.
- Mantener `operation` separado de `propertyType`.
- Mantener los 18 departamentos como catálogo normalizado, no como columnas ni tabs rígidos.
- Mantener ubicación exacta/aproximada.
- No borrar historial de propiedades cerradas; usar estados.
- No exponer secretos en cliente.
- No incorporar pagos/reservas estilo Airbnb sin una decisión de negocio explícita.

## Fase 2 solicitada

1. Instalar dependencias y crear lockfile.
2. Ejecutar `npm run typecheck` y `npm run build` antes de modificar lógica.
3. Configurar Neon y conexión Drizzle.
4. Generar migración inicial desde `src/db/schema.ts`.
5. Crear seed idempotente para los 18 departamentos y tipos de propiedad base.
6. Agregar municipios sin hardcodear filtros en UI.
7. Reemplazar `mock-data.ts` por consultas server-side.
8. Crear repositorio/servicio de búsqueda de propiedades con filtros:
   - operación
   - departamento
   - municipio
   - tipo
   - rango de precio
   - habitaciones
   - baños
   - área
   - ordenamiento
9. Persistir `/api/leads`.
10. Añadir protección anti-spam/rate limiting al formulario de leads.
11. Construir CRUD administrativo de propiedades y agentes.
12. Agregar subida de imágenes a almacenamiento externo; guardar solo metadata/URLs en PostgreSQL.
13. Implementar estados DRAFT → PUBLISHED → RESERVED → SOLD/RENTED → ARCHIVED.
14. Agregar auditoría mínima de cambios de precio y estado.
15. Añadir tests de dominio y de filtros antes de cerrar la fase.

## Fase 3 prevista

- Autenticación y roles ADMIN / AGENT.
- CRM: NEW → CONTACTED → QUALIFIED → VIEWING → NEGOTIATION → CLOSED / LOST.
- Agenda de visitas.
- Favoritos y comparación.
- Mapa interactivo y búsqueda por viewport.
- SEO por departamento/municipio/tipo/operación.

## Criterios de aceptación obligatorios por entrega

- `npm run typecheck` pasa.
- `npm run build` pasa.
- Migraciones reproducibles.
- Ningún secreto en Git.
- Cambios pequeños y auditables.
- Documentar decisiones de esquema que alteren dominio.
- No introducir dependencias grandes sin justificar.

## Primera auditoría recomendada

Antes de seguir, reportar:
- commit base,
- versiones instaladas,
- resultado de typecheck/build,
- migración propuesta,
- SHA del artefacto/ZIP si se intercambia fuera de Git.
