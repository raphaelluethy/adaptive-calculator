PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_feature_flag_excludes` (
	`id` text PRIMARY KEY NOT NULL,
	`flag` text NOT NULL,
	`excluded_flag` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`flag`) REFERENCES `feature_flags`(`flag`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`excluded_flag`) REFERENCES `feature_flags`(`flag`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_feature_flag_excludes`("id", "flag", "excluded_flag", "created_at", "updated_at") SELECT "id", "flag", "excluded_flag", "created_at", "updated_at" FROM `feature_flag_excludes`;--> statement-breakpoint
DROP TABLE `feature_flag_excludes`;--> statement-breakpoint
ALTER TABLE `__new_feature_flag_excludes` RENAME TO `feature_flag_excludes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;