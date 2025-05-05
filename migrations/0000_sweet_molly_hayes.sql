CREATE TABLE "completed_workouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"workout_id" integer NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"workout_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "progress_tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"result" text,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" json NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text,
	"first_name" text,
	"last_name" text,
	"gender" text,
	"age" integer,
	"fitness_level" text,
	"fitness_goals" text,
	"preferred_workout_days" text,
	"workout_reminders" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"image_url" text,
	"duration" integer NOT NULL,
	"difficulty" text NOT NULL,
	"type" text NOT NULL,
	"day" integer,
	"total_days" integer,
	"subtitle" text,
	"date" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "completed_workouts" ADD CONSTRAINT "completed_workouts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "completed_workouts" ADD CONSTRAINT "completed_workouts_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_tests" ADD CONSTRAINT "progress_tests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;