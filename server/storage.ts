import { 
  users, type User, type InsertUser,
  articles, type Article, type InsertArticle,
  relatedArticles, type RelatedArticle, type InsertRelatedArticle
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Article operations
  createArticle(article: InsertArticle): Promise<Article>;
  getArticle(id: number): Promise<Article | undefined>;
  getArticleByUrl(url: string): Promise<Article | undefined>;
  updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined>;
  getRecentArticles(limit: number): Promise<Article[]>;
  
  // Related articles operations
  createRelatedArticle(relatedArticle: InsertRelatedArticle): Promise<RelatedArticle>;
  getRelatedArticlesByOriginalId(originalArticleId: number): Promise<RelatedArticle[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private articles: Map<number, Article>;
  private relatedArticles: Map<number, RelatedArticle>;
  private currentUserId: number;
  private currentArticleId: number;
  private currentRelatedArticleId: number;

  constructor() {
    this.users = new Map();
    this.articles = new Map();
    this.relatedArticles = new Map();
    this.currentUserId = 1;
    this.currentArticleId = 1;
    this.currentRelatedArticleId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Article methods
  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = this.currentArticleId++;
    const now = new Date();
    const article: Article = { 
      ...insertArticle, 
      id,
      url: insertArticle.url || null,
      source: insertArticle.source || null,
      biasScore: insertArticle.biasScore || null,
      politicalLeaning: insertArticle.politicalLeaning || null,
      emotionalLanguage: insertArticle.emotionalLanguage || null,
      factualReporting: insertArticle.factualReporting || null,
      neutralVersion: insertArticle.neutralVersion || null,
      analysisDetails: insertArticle.analysisDetails || null,
      createdAt: now
    };
    this.articles.set(id, article);
    return article;
  }

  async getArticle(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async getArticleByUrl(url: string): Promise<Article | undefined> {
    return Array.from(this.articles.values()).find(
      (article) => article.url === url,
    );
  }

  async updateArticle(id: number, partialArticle: Partial<InsertArticle>): Promise<Article | undefined> {
    const article = await this.getArticle(id);
    if (!article) return undefined;
    
    const updatedArticle: Article = {
      ...article,
      ...partialArticle,
    };
    
    this.articles.set(id, updatedArticle);
    return updatedArticle;
  }

  // Related articles methods
  async createRelatedArticle(insertRelatedArticle: InsertRelatedArticle): Promise<RelatedArticle> {
    const id = this.currentRelatedArticleId++;
    const now = new Date();
    const relatedArticle: RelatedArticle = {
      ...insertRelatedArticle,
      id,
      url: insertRelatedArticle.url || null,
      biasScore: insertRelatedArticle.biasScore || null,
      keyTerms: insertRelatedArticle.keyTerms || null,
      publishedDate: insertRelatedArticle.publishedDate || null,
      createdAt: now
    };
    this.relatedArticles.set(id, relatedArticle);
    return relatedArticle;
  }

  async getRelatedArticlesByOriginalId(originalArticleId: number): Promise<RelatedArticle[]> {
    return Array.from(this.relatedArticles.values()).filter(
      (relatedArticle) => relatedArticle.originalArticleId === originalArticleId,
    );
  }
  
  async getRecentArticles(limit: number): Promise<Article[]> {
    // Convert Map to array, sort by createdAt (newest first), and limit results
    return Array.from(this.articles.values())
      .sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date();
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date();
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
