CREATE TABLE `cities` (
	`slug` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`state_slug` text NOT NULL,
	FOREIGN KEY (`state_slug`) REFERENCES `states`(`slug`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `credit_ledger` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_slug` text NOT NULL,
	`delta` integer NOT NULL,
	`reason` text NOT NULL,
	`lead_offer_id` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`provider_slug`) REFERENCES `providers`(`slug`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lead_offer_id`) REFERENCES `lead_offers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_credit_ledger_provider` ON `credit_ledger` (`provider_slug`);--> statement-breakpoint
CREATE TABLE `facts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`city_slug` text NOT NULL,
	`metric` text NOT NULL,
	`value_min` real NOT NULL,
	`value_max` real NOT NULL,
	`unit` text NOT NULL,
	`source_name` text NOT NULL,
	`source_url` text NOT NULL,
	`as_of` text NOT NULL,
	`confidence` text NOT NULL,
	`note` text,
	FOREIGN KEY (`city_slug`) REFERENCES `cities`(`slug`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_facts_city_metric` ON `facts` (`city_slug`,`metric`);--> statement-breakpoint
CREATE TABLE `gccs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`parent_company` text NOT NULL,
	`parent_hq_country` text NOT NULL,
	`city_slug` text NOT NULL,
	`functions` text NOT NULL,
	`status` text NOT NULL,
	`announced_on` text,
	`source_name` text NOT NULL,
	`source_url` text NOT NULL,
	`as_of` text NOT NULL,
	FOREIGN KEY (`city_slug`) REFERENCES `cities`(`slug`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_gccs_city` ON `gccs` (`city_slug`);--> statement-breakpoint
CREATE TABLE `incentives` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`state_slug` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`summary` text NOT NULL,
	`min_headcount` integer,
	`max_headcount` integer,
	`functions` text,
	`valid_from` text,
	`valid_to` text,
	`source_name` text NOT NULL,
	`source_url` text NOT NULL,
	`as_of` text NOT NULL,
	FOREIGN KEY (`state_slug`) REFERENCES `states`(`slug`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `lead_offers` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_id` text NOT NULL,
	`provider_slug` text NOT NULL,
	`status` text NOT NULL,
	`offered_at` text NOT NULL,
	`resolved_at` text,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`provider_slug`) REFERENCES `providers`(`slug`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_lead_provider` ON `lead_offers` (`lead_id`,`provider_slug`);--> statement-breakpoint
CREATE INDEX `idx_lead_offers_provider` ON `lead_offers` (`provider_slug`);--> statement-breakpoint
CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`buyer_name` text NOT NULL,
	`buyer_company` text NOT NULL,
	`buyer_email` text NOT NULL,
	`city_slug` text NOT NULL,
	`headcount` integer NOT NULL,
	`function` text NOT NULL,
	`category` text NOT NULL,
	`timeline` text NOT NULL,
	`note` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`city_slug`) REFERENCES `cities`(`slug`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `providers` (
	`slug` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`cities_served` text NOT NULL,
	`website` text NOT NULL,
	`description` text NOT NULL,
	`source_name` text NOT NULL,
	`source_url` text NOT NULL,
	`as_of` text NOT NULL,
	`claimed_at` text
);
--> statement-breakpoint
CREATE TABLE `states` (
	`slug` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
