CREATE TABLE IF NOT EXISTS "graveyard" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(30) NOT NULL,
	"starting_class" varchar(20) NOT NULL,
	"final_level" integer NOT NULL,
	"days_survived" real NOT NULL,
	"cause_of_death" varchar(100) NOT NULL,
	"stats_snapshot" jsonb NOT NULL,
	"died_at" timestamp with time zone DEFAULT now() NOT NULL
);
