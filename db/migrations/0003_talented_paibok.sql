ALTER TABLE "user_stories" ADD COLUMN "chaptersReadWhenSaved" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_stories" ADD COLUMN "chaptersReadWhenLastOpened" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_stories" ADD COLUMN "lastOpenedAt" timestamp;--> statement-breakpoint
ALTER TABLE "user_stories" ADD COLUMN "isUnread" boolean DEFAULT false NOT NULL;