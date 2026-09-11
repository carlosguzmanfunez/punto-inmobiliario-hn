# Punto Inmobiliario HN — Starter Fase 1

Base técnica para una plataforma inmobiliaria hondureña enfocada en compra, alquiler, proyectos e inversión.

## Incluido

- Next.js App Router + TypeScript strict.
- Home responsive inspirada en la arquitectura aprobada.
- Buscador por operación, departamento, tipo y precio máximo.
- Los 18 departamentos de Honduras.
- Página `/propiedades` con filtros funcionales sobre datos mock.
- Página individual `/propiedades/[slug]`.
- Tarjetas, categorías, proyectos, captación de propietarios y confianza.
- API inicial `POST /api/leads` validada con Zod.
- Esquema PostgreSQL/Drizzle para departamentos, municipios, tipos, propiedades, medios, agentes y leads.
- Ubicación EXACT / APPROXIMATE desde el modelo de datos.

## Arranque

```bash
npm install
cp .env.example .env.local
npm run dev
```

Después de instalar dependencias, fijar el lockfile en Git antes de cualquier cambio grande.

## Variables

`DATABASE_URL`: conexión PostgreSQL/Neon.

## Estado

Este ZIP es un starter auditable. El frontend usa datos mock para que diseño y arquitectura puedan revisarse antes de conectar la persistencia real.

## Decisiones de dominio ya fijadas

1. `operation` y `propertyType` son dimensiones separadas. Ej.: RENT + Local comercial.
2. Una propiedad no se elimina al cerrarse: cambia a SOLD / RENTED / ARCHIVED.
3. Cada propiedad tiene `code` humano único: HN-000184.
4. La ubicación pública puede ser exacta o aproximada.
5. Departamento → municipio → zona debe ser jerárquico.
6. Los atributos especializados por tipo se ampliarán sin convertir la tabla `properties` en un bloque de campos irrelevantes.

## Próxima fase sugerida

Conectar Neon + Drizzle, sembrar catálogo geográfico, CRUD de propiedades, almacenamiento de imágenes, autenticación administrativa y CRM básico.
