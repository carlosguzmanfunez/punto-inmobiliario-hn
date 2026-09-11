# Manifest — Punto Inmobiliario HN Starter

## UI pública
- `/` Home.
- `/propiedades` resultados + filtros.
- `/propiedades/[slug]` ficha individual.

## Componentes
- Header
- HeroSearch
- CategoryGrid
- PropertyCard
- DepartmentExplorer
- Footer

## Dominio
- 18 departamentos de Honduras.
- Operación SALE / RENT separada del tipo.
- Estados DRAFT / PUBLISHED / RESERVED / SOLD / RENTED / ARCHIVED.
- Ubicación EXACT / APPROXIMATE.
- Agentes y leads.
- Código humano único por propiedad.

## Backend inicial
- `POST /api/leads` con validación Zod.
- `src/db/schema.ts` listo como punto de partida para Neon/Drizzle.

## Nota de validación
La instalación de paquetes no se completó dentro del entorno aislado de generación, por lo que el build completo debe ejecutarse al abrir el proyecto. La versión objetivo de Next.js se fijó en 16.3.3, Active LTS al 25 de agosto de 2026 según la documentación oficial de Next.js.
