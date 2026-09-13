CREATE TABLE `structure_notes` (
	`user_id` text NOT NULL,
	`structure_id` text NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `structure_id`)
);
