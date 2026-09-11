# Auditoría Base 0 — Punto Inmobiliario HN

## Aprobado conceptualmente

- Next.js App Router.
- TypeScript strict.
- Separación entre operación (SALE/RENT) y tipo de propiedad.
- Catálogo de 18 departamentos.
- Estados de propiedad.
- Ubicación exacta/aproximada.
- Entidades iniciales: departamentos, municipios, tipos, agentes, propiedades, medios y leads.
- Rutas públicas de inicio, resultados y ficha.

## Correcciones realizadas en esta auditoría

1. Se corrigieron los enlaces de categorías para que el valor técnico sea singular (`Casa`, `Apartamento`, etc.) aunque la etiqueta visual sea plural.
2. Se corrigió el filtro por tipo para realizar coincidencia exacta.
3. Se alineó `propertyId` de la API de leads con el `serial/int` del esquema PostgreSQL.
4. Se agregó normalización básica `trim()` en campos del lead.
5. Se creó `START_HERE.md` con el orden operativo de arranque.

## Bloqueos antes de declarar la Base 0 validada

- No existe `package-lock.json` todavía.
- Las dependencias no se pudieron instalar dentro del límite disponible del entorno de construcción; por ello no se afirma que `typecheck` o `build` estén verdes.
- No existe conexión Neon configurada.
- No existe migración Drizzle aplicada.
- La API de leads todavía no persiste.
- Imágenes y datos de propiedades son mock/prototipo.
- WhatsApp y correo de contacto son placeholders y no deben ir a producción así.

## Decisiones que NO deben tomarse todavía

- proveedor de mapas;
- autenticación definitiva;
- pagos;
- publicación abierta para terceros;
- CRM avanzado;
- favoritos/cuentas de usuarios.

Primero debe cerrarse el núcleo de inventario y búsqueda.
