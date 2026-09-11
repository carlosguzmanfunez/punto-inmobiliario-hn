import { boolean, decimal, index, integer, pgEnum, pgTable, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

export const operationEnum = pgEnum("property_operation", ["SALE", "RENT"]);
export const propertyStatusEnum = pgEnum("property_status", ["DRAFT", "PUBLISHED", "RESERVED", "SOLD", "RENTED", "ARCHIVED"]);
export const locationPrecisionEnum = pgEnum("location_precision", ["EXACT", "APPROXIMATE"]);
export const leadStatusEnum = pgEnum("lead_status", ["NEW", "CONTACTED", "QUALIFIED", "VIEWING", "NEGOTIATION", "CLOSED", "LOST"]);

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
}, (table) => [uniqueIndex("departments_slug_uq").on(table.slug)]);

export const municipalities = pgTable("municipalities", {
  id: serial("id").primaryKey(),
  departmentId: integer("department_id").notNull().references(() => departments.id),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull(),
}, (table) => [index("municipalities_department_idx").on(table.departmentId)]);

export const propertyTypes = pgTable("property_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
}, (table) => [uniqueIndex("property_types_slug_uq").on(table.slug)]);

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  displayName: varchar("display_name", { length: 140 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  email: varchar("email", { length: 180 }),
  city: varchar("city", { length: 120 }),
  specialization: varchar("specialization", { length: 180 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 30 }).notNull(),
  slug: varchar("slug", { length: 220 }).notNull(),
  title: varchar("title", { length: 220 }).notNull(),
  summary: varchar("summary", { length: 500 }),
  description: text("description"),
  operation: operationEnum("operation").notNull(),
  propertyTypeId: integer("property_type_id").notNull().references(() => propertyTypes.id),
  departmentId: integer("department_id").notNull().references(() => departments.id),
  municipalityId: integer("municipality_id").references(() => municipalities.id),
  zone: varchar("zone", { length: 140 }),
  price: decimal("price", { precision: 14, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("HNL").notNull(),
  bedrooms: decimal("bedrooms", { precision: 4, scale: 1 }),
  bathrooms: decimal("bathrooms", { precision: 4, scale: 1 }),
  parkingSpaces: integer("parking_spaces"),
  constructionAreaM2: decimal("construction_area_m2", { precision: 12, scale: 2 }),
  landAreaM2: decimal("land_area_m2", { precision: 12, scale: 2 }),
  latitude: decimal("latitude", { precision: 9, scale: 6 }),
  longitude: decimal("longitude", { precision: 9, scale: 6 }),
  locationPrecision: locationPrecisionEnum("location_precision").default("APPROXIMATE").notNull(),
  status: propertyStatusEnum("status").default("DRAFT").notNull(),
  featured: boolean("featured").default(false).notNull(),
  agentId: integer("agent_id").references(() => agents.id),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("properties_code_uq").on(table.code),
  uniqueIndex("properties_slug_uq").on(table.slug),
  index("properties_search_idx").on(table.operation, table.status, table.departmentId, table.propertyTypeId),
]);

export const propertyMedia = pgTable("property_media", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  kind: varchar("kind", { length: 20 }).default("IMAGE").notNull(),
  url: text("url").notNull(),
  altText: varchar("alt_text", { length: 220 }),
  sortOrder: integer("sort_order").default(0).notNull(),
  isCover: boolean("is_cover").default(false).notNull(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id),
  agentId: integer("agent_id").references(() => agents.id),
  name: varchar("name", { length: 140 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(),
  email: varchar("email", { length: 180 }),
  message: text("message"),
  source: varchar("source", { length: 30 }).default("WEB").notNull(),
  status: leadStatusEnum("status").default("NEW").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
