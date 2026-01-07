CREATE TABLE `flappybird_scores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`score` integer NOT NULL,
	`time` integer NOT NULL,
	`pipesPassed` integer DEFAULT 0 NOT NULL,
	`duration` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `game2048_scores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`score` integer NOT NULL,
	`bestTile` integer DEFAULT 2 NOT NULL,
	`time` integer NOT NULL,
	`moves` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` integer PRIMARY KEY NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	`dead` integer DEFAULT false NOT NULL,
	`type` text NOT NULL,
	`by` text NOT NULL,
	`time` integer NOT NULL,
	`text` text,
	`parent` integer,
	`url` text,
	`score` integer DEFAULT 0 NOT NULL,
	`title` text,
	FOREIGN KEY (`by`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`parent`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `snake_scores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`score` integer NOT NULL,
	`time` integer NOT NULL,
	`duration` integer NOT NULL,
	`foodEaten` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`created` integer NOT NULL,
	`karma` integer DEFAULT 0 NOT NULL,
	`about` text
);
