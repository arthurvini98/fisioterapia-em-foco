CREATE TABLE `lesson_progress` (
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`current_step` integer DEFAULT 0 NOT NULL,
	`completed_steps` text DEFAULT '[]' NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `lesson_id`)
);
--> statement-breakpoint
CREATE TABLE `review_events` (
	`user_id` text NOT NULL,
	`event_id` text NOT NULL,
	`structure_id` text NOT NULL,
	`correct` integer NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `event_id`)
);
--> statement-breakpoint
CREATE INDEX `idx_reviews_user_structure_time` ON `review_events` (`user_id`,`structure_id`,`created_at`);