CREATE TABLE `feature_flag_excludes` (
	`id` text PRIMARY KEY NOT NULL,
	`flag` text,
	`excluded_flag` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`flag`) REFERENCES `feature_flags`(`flag`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`excluded_flag`) REFERENCES `feature_flags`(`flag`) ON UPDATE no action ON DELETE no action
);
