CREATE TYPE "public"."lead_status" AS ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'VIEWING', 'NEGOTIATION', 'CLOSED', 'LOST');--> statement-breakpoint
CREATE TYPE "public"."location_precision" AS ENUM('EXACT', 'APPROXIMATE');--> statement-breakpoint
CREATE TYPE "public"."property_operation" AS ENUM('SALE', 'RENT');--> statement-breakpoint
CREATE TYPE "public"."property_status" AS ENUM('DRAFT', 'PUBLISHED', 'RESERVED', 'SOLD', 'RENTED', 'ARCHIVED');--> statement-breakpoint
CREATE TABLE "agents" (
	"id" serial PRIMARY KEY NOT NULL,
	"display_name" varchar(140) NOT NULL,
	"phone" varchar(30),
	"email" varchar(180),
	"city" varchar(120),
	"specialization" varchar(180),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(80) NOT NULL,
	"slug" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer,
	"agent_id" integer,
	"name" varchar(140) NOT NULL,
	"phone" varchar(30) NOT NULL,
	"email" varchar(180),
	"message" text,
	"source" varchar(30) DEFAULT 'WEB' NOT NULL,
	"status" "lead_status" DEFAULT 'NEW' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "municipalities" (
	"id" serial PRIMARY KEY NOT NULL,
	"department_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(120) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(30) NOT NULL,
	"slug" varchar(220) NOT NULL,
	"title" varchar(220) NOT NULL,
	"summary" varchar(500),
	"description" text,
	"operation" "property_operation" NOT NULL,
	"property_type_id" integer NOT NULL,
	"department_id" integer NOT NULL,
	"municipality_id" integer,
	"zone" varchar(140),
	"price" numeric(14, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'HNL' NOT NULL,
	"bedrooms" numeric(4, 1),
	"bathrooms" numeric(4, 1),
	"parking_spaces" integer,
	"construction_area_m2" numeric(12, 2),
	"land_area_m2" numeric(12, 2),
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	"location_precision" "location_precision" DEFAULT 'APPROXIMATE' NOT NULL,
	"status" "property_status" DEFAULT 'DRAFT' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"agent_id" integer,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"kind" varchar(20) DEFAULT 'IMAGE' NOT NULL,
	"url" text NOT NULL,
	"alt_text" varchar(220),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_cover" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(80) NOT NULL,
	"slug" varchar(100) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "municipalities" ADD CONSTRAINT "municipalities_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_property_type_id_property_types_id_fk" FOREIGN KEY ("property_type_id") REFERENCES "public"."property_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_municipality_id_municipalities_id_fk" FOREIGN KEY ("municipality_id") REFERENCES "public"."municipalities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_media" ADD CONSTRAINT "property_media_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "departments_slug_uq" ON "departments" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "municipalities_department_idx" ON "municipalities" USING btree ("department_id");--> statement-breakpoint
CREATE UNIQUE INDEX "properties_code_uq" ON "properties" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "properties_slug_uq" ON "properties" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "properties_search_idx" ON "properties" USING btree ("operation","status","department_id","property_type_id");--> statement-breakpoint
CREATE UNIQUE INDEX "property_types_slug_uq" ON "property_types" USING btree ("slug");