-- Create users table first
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"avatar_url" varchar(500),
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");
--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");
--> statement-breakpoint
CREATE INDEX "users_is_active_idx" ON "users" USING btree ("is_active");

-- Add user_id as nullable first
ALTER TABLE "cartridge_logs" ADD COLUMN "user_id" uuid;
ALTER TABLE "liquid_logs" ADD COLUMN "user_id" uuid;

-- Create a default admin user (password: admin123 - will be hashed in app)
INSERT INTO "users" ("id", "email", "password_hash", "name", "role", "is_active", "created_at", "updated_at")
VALUES (
	'00000000-0000-0000-0000-000000000001',
	'admin@vape-monitor.local',
	'$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PZvO.S',
	'Admin',
	'admin',
	true,
	now(),
	now()
);

-- Update existing records to point to default admin user
UPDATE "cartridge_logs" SET "user_id" = '00000000-0000-0000-0000-000000000001' WHERE "user_id" IS NULL;
UPDATE "liquid_logs" SET "user_id" = '00000000-0000-0000-0000-000000000001' WHERE "user_id" IS NULL;

-- Now make user_id non-nullable and add foreign keys
ALTER TABLE "cartridge_logs" ALTER COLUMN "user_id" SET NOT NULL;
ALTER TABLE "liquid_logs" ALTER COLUMN "user_id" SET NOT NULL;

ALTER TABLE "cartridge_logs" ADD CONSTRAINT "cartridge_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "liquid_logs" ADD CONSTRAINT "liquid_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

CREATE INDEX "cartridge_logs_user_id_idx" ON "cartridge_logs" USING btree ("user_id");
CREATE INDEX "liquid_logs_user_id_idx" ON "liquid_logs" USING btree ("user_id");
