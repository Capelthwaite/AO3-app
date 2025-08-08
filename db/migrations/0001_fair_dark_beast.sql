CREATE TABLE "user_stories" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"workId" text NOT NULL,
	"title" text NOT NULL,
	"author" text NOT NULL,
	"summary" text,
	"wordCount" integer DEFAULT 0 NOT NULL,
	"currentChapters" integer DEFAULT 1 NOT NULL,
	"totalChapters" integer,
	"isComplete" boolean DEFAULT false NOT NULL,
	"fandom" text,
	"relationships" text,
	"characters" text,
	"additionalTags" text,
	"publishedDate" text,
	"lastUpdatedDate" text,
	"kudos" integer DEFAULT 0 NOT NULL,
	"bookmarks" integer DEFAULT 0 NOT NULL,
	"hits" integer DEFAULT 0 NOT NULL,
	"url" text NOT NULL,
	"savedAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_stories" ADD CONSTRAINT "user_stories_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;