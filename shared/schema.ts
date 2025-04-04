import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  url: text("url"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  source: text("source"),
  biasScore: integer("bias_score"),
  politicalLeaning: text("political_leaning"),
  emotionalLanguage: text("emotional_language"),
  factualReporting: text("factual_reporting"),
  neutralVersion: text("neutral_version"),
  analysisDetails: jsonb("analysis_details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertArticleSchema = createInsertSchema(articles)
  .omit({ id: true, createdAt: true })
  .partial({ 
    url: true, 
    source: true,
    biasScore: true,
    politicalLeaning: true,
    emotionalLanguage: true,
    factualReporting: true,
    neutralVersion: true,
    analysisDetails: true
  });

export const relatedArticles = pgTable("related_articles", {
  id: serial("id").primaryKey(),
  originalArticleId: integer("original_article_id").notNull(),
  url: text("url"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  source: text("source").notNull(),
  biasScore: integer("bias_score"),
  keyTerms: jsonb("key_terms"),
  publishedDate: text("published_date"),
  topics: jsonb("topics"),
  mainTopic: text("main_topic"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRelatedArticleSchema = createInsertSchema(relatedArticles)
  .omit({ id: true, createdAt: true })
  .partial({
    url: true,
    biasScore: true,
    keyTerms: true,
    publishedDate: true,
    topics: true,
    mainTopic: true
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;

export type InsertRelatedArticle = z.infer<typeof insertRelatedArticleSchema>;
export type RelatedArticle = typeof relatedArticles.$inferSelect;
