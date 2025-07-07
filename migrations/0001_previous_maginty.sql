CREATE TABLE "discount_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"threshold" integer NOT NULL,
	"percent" numeric(5, 2) NOT NULL,
	"category_target" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" text NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"contact" text,
	"payment_terms" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "suppliers_supplier_id_unique" UNIQUE("supplier_id")
);
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "category" text DEFAULT 'regular' NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "supplier_id" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "discount_rate" numeric(5, 2) DEFAULT '0.00' NOT NULL;