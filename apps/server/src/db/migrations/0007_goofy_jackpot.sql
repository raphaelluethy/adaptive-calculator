CREATE TABLE `log_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `logs` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`date` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`type` text NOT NULL,
	`data` text NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `log_sessions`(`id`) ON UPDATE no action ON DELETE no action
);
