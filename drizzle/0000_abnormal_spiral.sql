CREATE TABLE "cartridge_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cartridge_name" varchar(255),
	"replaced_at" timestamp with time zone NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "liquid_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"liquid_name" varchar(255),
	"amount_ml" numeric(10, 2),
	"refilled_at" timestamp with time zone NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "cartridge_logs_replaced_at_idx" ON "cartridge_logs" USING btree ("replaced_at");--> statement-breakpoint
CREATE INDEX "liquid_logs_refilled_at_idx" ON "liquid_logs" USING btree ("refilled_at");