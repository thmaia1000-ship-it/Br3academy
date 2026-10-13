CREATE TABLE `journeys` (
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`version` text NOT NULL,
	`step` integer DEFAULT 0 NOT NULL,
	`completed` integer DEFAULT 0 NOT NULL,
	`responses` text DEFAULT '[]' NOT NULL,
	`updated` text NOT NULL,
	PRIMARY KEY(`user_id`, `lesson_id`)
);
