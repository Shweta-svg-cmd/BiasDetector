import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { analyzeArticle } from "./services/articleAnalyzer";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const apiRouter = app.route('/api');
  
  /**
   * Health check endpoint
   */
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });
  
  /**
   * Analyze article for bias
   * Takes either URL or text+title
   */
  app.post('/api/analyze', async (req: Request, res: Response) => {
    try {
      const requestSchema = z.object({
        url: z.string().url().optional(),
        text: z.string().optional(),
        title: z.string().optional(),
        findRelatedSources: z.boolean().default(true),
        generateNeutral: z.boolean().default(true),
      }).refine(data => data.url || (data.text && data.title), {
        message: "Either URL or both text and title must be provided",
      });
      
      const validatedData = requestSchema.parse(req.body);
      
      const result = await analyzeArticle(validatedData);
      
      res.json(result);
    } catch (error) {
      console.error("Error analyzing article:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: error.errors,
        });
      }
      
      res.status(500).json({
        message: `Error analyzing article: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  });
  
  /**
   * Get recent articles
   * Returns the most recent 5 articles analyzed
   * This route must be defined BEFORE the /api/articles/:id route to avoid conflicts
   */
  app.get('/api/articles/recent', async (_req: Request, res: Response) => {
    try {
      const recentArticles = await storage.getRecentArticles(5);
      
      res.json(recentArticles);
    } catch (error) {
      console.error("Error fetching recent articles:", error);
      res.status(500).json({
        message: `Error fetching recent articles: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  });

  /**
   * Get related articles by original article ID
   * This specific route must be defined BEFORE the generic /api/articles/:id route
   */
  app.get('/api/articles/:id/related', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid article ID" });
      }
      
      const article = await storage.getArticle(id);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      const relatedArticles = await storage.getRelatedArticlesByOriginalId(id);
      
      res.json(relatedArticles);
    } catch (error) {
      console.error("Error fetching related articles:", error);
      res.status(500).json({
        message: `Error fetching related articles: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  });
  
  /**
   * Get article by ID
   * This generic route must be defined AFTER any specific /api/articles/... routes
   */
  app.get('/api/articles/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid article ID" });
      }
      
      const article = await storage.getArticle(id);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      const relatedArticles = await storage.getRelatedArticlesByOriginalId(id);
      
      res.json({ article, relatedArticles });
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({
        message: `Error fetching article: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
