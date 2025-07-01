PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_feature_flags` (
	`id` text PRIMARY KEY NOT NULL,
	`flag` text NOT NULL,
	`value` integer NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_feature_flags`("id", "flag", "value", "created_at", "updated_at") SELECT "id", "flag", "value", "created_at", "updated_at" FROM `feature_flags`;--> statement-breakpoint
DROP TABLE `feature_flags`;--> statement-breakpoint
ALTER TABLE `__new_feature_flags` RENAME TO `feature_flags`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `feature_flags_flag_unique` ON `feature_flags` (`flag`);