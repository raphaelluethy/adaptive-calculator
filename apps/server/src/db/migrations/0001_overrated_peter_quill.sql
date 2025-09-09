DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
DROP INDEX "feature_flags_flag_unique";--> statement-breakpoint
ALTER TABLE `feature_flag_excludes` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (unixepoch());--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `feature_flags_flag_unique` ON `feature_flags` (`flag`);--> statement-breakpoint
ALTER TABLE `feature_flag_excludes` ALTER COLUMN "updated_at" TO "updated_at" integer NOT NULL DEFAULT (unixepoch());--> statement-breakpoint
ALTER TABLE `feature_flags` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (unixepoch());--> statement-breakpoint
ALTER TABLE `feature_flags` ALTER COLUMN "updated_at" TO "updated_at" integer NOT NULL DEFAULT (unixepoch());--> statement-breakpoint
ALTER TABLE `log_sessions` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (unixepoch());--> statement-breakpoint
ALTER TABLE `log_sessions` ALTER COLUMN "updated_at" TO "updated_at" integer NOT NULL DEFAULT (unixepoch());--> statement-breakpoint
ALTER TABLE `logs` ALTER COLUMN "date" TO "date" integer NOT NULL DEFAULT (unixepoch());