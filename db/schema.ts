import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Better Auth Tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Subscription table for Polar webhook data
export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  createdAt: timestamp("createdAt").notNull(),
  modifiedAt: timestamp("modifiedAt"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  recurringInterval: text("recurringInterval").notNull(),
  status: text("status").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd").notNull(),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").notNull().default(false),
  canceledAt: timestamp("canceledAt"),
  startedAt: timestamp("startedAt").notNull(),
  endsAt: timestamp("endsAt"),
  endedAt: timestamp("endedAt"),
  customerId: text("customerId").notNull(),
  productId: text("productId").notNull(),
  discountId: text("discountId"),
  checkoutId: text("checkoutId").notNull(),
  customerCancellationReason: text("customerCancellationReason"),
  customerCancellationComment: text("customerCancellationComment"),
  metadata: text("metadata"), // JSON string
  customFieldData: text("customFieldData"), // JSON string
  userId: text("userId").references(() => user.id),
});

// User Stories table - stores saved AO3 stories with reading progress tracking
export const userStories = pgTable("user_stories", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  workId: text("workId").notNull(), // AO3 work ID
  title: text("title").notNull(),
  author: text("author").notNull(),
  summary: text("summary"),
  wordCount: integer("wordCount").notNull().default(0),
  currentChapters: integer("currentChapters").notNull().default(1),
  totalChapters: integer("totalChapters"), // null for ongoing stories
  isComplete: boolean("isComplete").notNull().default(false),
  fandom: text("fandom"), // JSON array as string
  relationships: text("relationships"), // JSON array as string
  characters: text("characters"), // JSON array as string
  additionalTags: text("additionalTags"), // JSON array as string
  publishedDate: text("publishedDate"),
  lastUpdatedDate: text("lastUpdatedDate"),
  kudos: integer("kudos").notNull().default(0),
  bookmarks: integer("bookmarks").notNull().default(0),
  hits: integer("hits").notNull().default(0),
  url: text("url").notNull(),
  savedAt: timestamp("savedAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  
  // Reading Progress Tracking Fields
  chaptersReadWhenSaved: integer("chaptersReadWhenSaved").notNull().default(1), // Chapters that existed when first saved
  chaptersReadWhenLastOpened: integer("chaptersReadWhenLastOpened").notNull().default(1), // Chapters read up to last time opened
  lastOpenedAt: timestamp("lastOpenedAt"), // When user last clicked "Read on AO3"
  isUnread: boolean("isUnread").notNull().default(false), // Quick unread flag
});

// Saved Filter Sets table - stores user's saved search filter combinations
export const savedFilterSets = pgTable("saved_filter_sets", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // User-defined name for the filter set
  description: text("description"), // Optional description
  filters: text("filters").notNull(), // JSON string of SearchFilters
  isPinned: boolean("isPinned").notNull().default(false), // For quick access
  useCount: integer("useCount").notNull().default(0), // Track usage
  lastUsed: timestamp("lastUsed"), // When filter was last applied
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});
