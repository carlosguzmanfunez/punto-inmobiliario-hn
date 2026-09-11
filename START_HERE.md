# START HERE — Punto Inmobiliario HN

## Estado de esta base

Esta carpeta es la Base 0 del proyecto. Contiene frontend prototipo, rutas públicas, modelo Drizzle inicial y API de leads no persistente.

## Orden obligatorio de arranque

1. Crear el repositorio Git de Punto Inmobiliario HN.
2. Copiar esta Base 0 sin agregar funcionalidades nuevas.
3. Instalar dependencias y generar `package-lock.json`.
4. Ejecutar `npm run typecheck`.
5. Ejecutar `npm run build`.
6. Corregir cualquier error de compilación antes de continuar.
7. Crear proyecto Neon/PostgreSQL.
8. Definir `DATABASE_URL` únicamente en `.env.local` y plataforma de despliegue; nunca subirla a Git.
9. Generar y revisar la migración inicial Drizzle.
10. Aplicar la migración.
11. Crear seed idempotente de departamentos y tipos de propiedad.
12. Sustituir progresivamente mock data por consultas reales server-side.

## Regla de trabajo

Una fase activa a la vez. No se agrega CRM, mapas, autenticación, pagos ni marketplace hasta que la base de propiedades y búsqueda esté estable.

## Primera meta técnica

Cerrar una versión funcional con este recorrido:

**Inicio → Buscar → Resultados → Ficha de propiedad → Enviar lead**

Todos esos datos deben provenir de PostgreSQL antes de abrir la siguiente fase.
