CREATE TABLE IF NOT EXISTS `custom_courses` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`hours` integer DEFAULT 20 NOT NULL,
	`category` text DEFAULT 'Hardware & Diagnóstico' NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`modules_json` text DEFAULT '[]' NOT NULL,
	`lessons_json` text DEFAULT '[]' NOT NULL,
	`created` text NOT NULL,
	`updated` text NOT NULL
);
