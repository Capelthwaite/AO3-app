CREATE TABLE "saved_filter_sets" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"filters" text NOT NULL,
	"isPinned" boolean DEFAULT false NOT NULL,
	"useCount" integer DEFAULT 0 NOT NULL,
	"lastUsed" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "saved_filter_sets" ADD CONSTRAINT "saved_filter_sets_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;