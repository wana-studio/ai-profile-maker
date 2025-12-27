import { pgTable, text, timestamp, boolean, integer, jsonb, uuid, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'pro']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'canceled', 'past_due', 'incomplete']);
export const categoryEnum = pgEnum('category', ['work', 'dating', 'social', 'anonymous', 'creative', 'travel']);

// Users table - synced with Clerk
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  imageUrl: text('image_url'),
  subscriptionTier: subscriptionTierEnum('subscription_tier').default('free').notNull(),
  generationsThisMonth: integer('generations_this_month').default(0).notNull(),
  generationsResetAt: timestamp('generations_reset_at', { withTimezone: true }),
  stripeCustomerId: text('stripe_customer_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Face profiles - saved selfies for reuse
export const faceProfiles = pgTable('face_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  imageUrl: text('image_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Styles table - available photo generation styles
export const styles = pgTable('styles', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  coverImageUrl: text('cover_image_url').notNull(),
  category: categoryEnum('category').notNull(),
  isPremium: boolean('is_premium').default(false).notNull(),
  prompt: text('prompt').notNull(), // Base prompt for Replicate
  negativePrompt: text('negative_prompt'),
  order: integer('order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Generated photos
export const generatedPhotos = pgTable('generated_photos', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  faceProfileId: uuid('face_profile_id').references(() => faceProfiles.id, { onDelete: 'set null' }),
  styleId: uuid('style_id').references(() => styles.id, { onDelete: 'set null' }),
  imageUrl: text('image_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  title: text('title'),
  category: categoryEnum('category').notNull(),
  // Generation settings
  energyLevel: integer('energy_level').default(50), // 0-100: Soft to Bold
  realismLevel: text('realism_level').default('natural'), // natural, enhanced, hot, glowup
  // Stats (FIFA-style)
  stats: jsonb('stats').$type<{
    formal: number;
    spicy: number;
    cool: number;
    trustworthy: number;
    mysterious: number;
  }>(),
  // AI insights
  insights: jsonb('insights').$type<string[]>(),
  // Status
  isFavorite: boolean('is_favorite').default(false),
  isWatermarked: boolean('is_watermarked').default(true),
  // Replicate metadata
  replicateId: text('replicate_id'),
  generationPrompt: text('generation_prompt'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Subscriptions table - Stripe integration
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  stripeSubscriptionId: text('stripe_subscription_id').notNull().unique(),
  stripePriceId: text('stripe_price_id').notNull(),
  status: subscriptionStatusEnum('status').notNull(),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }).notNull(),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type FaceProfile = typeof faceProfiles.$inferSelect;
export type NewFaceProfile = typeof faceProfiles.$inferInsert;
export type Style = typeof styles.$inferSelect;
export type NewStyle = typeof styles.$inferInsert;
export type GeneratedPhoto = typeof generatedPhotos.$inferSelect;
export type NewGeneratedPhoto = typeof generatedPhotos.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
