-- ============================================================================
-- PILOT-01 · SEED IDEMPOTENTE DEL INVENTARIO INICIAL (base de DESARROLLO)
-- ============================================================================
-- Lo aplica PUNTO AI ENGINE con su ejecutor de base de datos gobernado
-- (`DatabaseExecutor.run_seed`): cada sentencia es un INSERT ... ON CONFLICT DO NOTHING, que el
-- clasificador de PUNTO acepta como SAFE_SEED, y todo el script viaja en una sola transacción.
--
-- Idempotencia: se declaran claves primarias explícitas y se usan claves naturales únicas
-- (`departments.slug`, `property_types.slug`, `properties.code`, `properties.slug`). Una segunda
-- ejecución no inserta ni duplica nada.
--
-- Datos: catálogo geográfico de los 18 departamentos de Honduras, los tipos de propiedad que usa
-- el inventario actual, los tres municipios de las propiedades existentes y las CUATRO propiedades
-- que ya existían como datos mock, con su portada. No se inventan propiedades nuevas.
--
-- LIMITACIÓN CONOCIDA (reportada, no corregida): al insertar con identificadores explícitos, las
-- secuencias `serial` no avanzan. Ningún camino del piloto inserta filas nuevas (el inventario se
-- administra por migraciones y seed), pero antes de abrir un alta de propiedades habrá que alinear
-- las secuencias con una operación gobernada.
-- ============================================================================

-- --------------------------------------------------------------------------
-- Catálogo geográfico: 18 departamentos
-- --------------------------------------------------------------------------
INSERT INTO "departments" ("id", "name", "slug") VALUES
  (1, 'Atlántida', 'atlantida'),
  (2, 'Choluteca', 'choluteca'),
  (3, 'Colón', 'colon'),
  (4, 'Comayagua', 'comayagua'),
  (5, 'Copán', 'copan'),
  (6, 'Cortés', 'cortes'),
  (7, 'El Paraíso', 'el-paraiso'),
  (8, 'Francisco Morazán', 'francisco-morazan'),
  (9, 'Gracias a Dios', 'gracias-a-dios'),
  (10, 'Intibucá', 'intibuca'),
  (11, 'Islas de la Bahía', 'islas-de-la-bahia'),
  (12, 'La Paz', 'la-paz'),
  (13, 'Lempira', 'lempira'),
  (14, 'Ocotepeque', 'ocotepeque'),
  (15, 'Olancho', 'olancho'),
  (16, 'Santa Bárbara', 'santa-barbara'),
  (17, 'Valle', 'valle'),
  (18, 'Yoro', 'yoro')
ON CONFLICT DO NOTHING;

-- --------------------------------------------------------------------------
-- Tipos de propiedad usados por el inventario existente
-- --------------------------------------------------------------------------
INSERT INTO "property_types" ("id", "name", "slug") VALUES
  (1, 'Casa', 'casa'),
  (2, 'Apartamento', 'apartamento'),
  (3, 'Terreno', 'terreno'),
  (4, 'Local comercial', 'local-comercial')
ON CONFLICT DO NOTHING;

-- --------------------------------------------------------------------------
-- Municipios de las propiedades existentes
-- --------------------------------------------------------------------------
INSERT INTO "municipalities" ("id", "department_id", "name", "slug") VALUES
  (1, 8, 'Tegucigalpa', 'tegucigalpa'),
  (2, 6, 'San Pedro Sula', 'san-pedro-sula'),
  (3, 8, 'Valle de Ángeles', 'valle-de-angeles')
ON CONFLICT DO NOTHING;

-- --------------------------------------------------------------------------
-- Inventario inicial: las cuatro propiedades que ya existían
-- --------------------------------------------------------------------------
INSERT INTO "properties" (
  "id", "code", "slug", "title", "summary", "operation", "property_type_id", "department_id",
  "municipality_id", "price", "currency", "bedrooms", "bathrooms", "parking_spaces",
  "construction_area_m2", "land_area_m2", "status", "featured", "published_at"
) VALUES
  (1, 'HN-000184', 'casa-moderna-residencial-el-hatillo-hn-184',
   'Casa moderna en Residencial El Hatillo',
   'Residencia contemporánea, amplia y luminosa, ideal para familia o inversión patrimonial.',
   'SALE', 1, 8, 1, 6850000.00, 'HNL', 4.0, 3.5, 2, 320.00, 550.00, 'PUBLISHED', true, now()),
  (2, 'HN-000211', 'apartamento-premium-san-pedro-sula-hn-211',
   'Apartamento premium en Torre Astria',
   'Apartamento urbano con amenidades, seguridad y excelente conectividad.',
   'SALE', 2, 6, 2, 4200000.00, 'HNL', 3.0, 2.0, 2, 180.00, NULL, 'PUBLISHED', true, now()),
  (3, 'HN-000239', 'terreno-valle-de-angeles-hn-239',
   'Terreno en Valle de Ángeles',
   'Terreno con entorno natural, acceso vehicular y potencial residencial.',
   'SALE', 3, 8, 3, 1850000.00, 'HNL', NULL, NULL, NULL, NULL, 1200.00, 'PUBLISHED', true, now()),
  (4, 'HN-000247', 'local-comercial-san-pedro-sula-hn-247',
   'Local comercial en zona estratégica',
   'Local con alta visibilidad, estacionamiento y ubicación comercial consolidada.',
   'RENT', 4, 6, 2, 45000.00, 'HNL', NULL, NULL, 4, 120.00, NULL, 'PUBLISHED', true, now())
ON CONFLICT DO NOTHING;

-- --------------------------------------------------------------------------
-- Portada de cada propiedad (una sola por propiedad)
-- --------------------------------------------------------------------------
INSERT INTO "property_media" ("id", "property_id", "kind", "url", "alt_text", "sort_order", "is_cover") VALUES
  (1, 1, 'IMAGE', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80', 'Casa moderna en Residencial El Hatillo', 0, true),
  (2, 2, 'IMAGE', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80', 'Apartamento premium en Torre Astria', 0, true),
  (3, 3, 'IMAGE', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80', 'Terreno en Valle de Ángeles', 0, true),
  (4, 4, 'IMAGE', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80', 'Local comercial en zona estratégica', 0, true)
ON CONFLICT DO NOTHING;
