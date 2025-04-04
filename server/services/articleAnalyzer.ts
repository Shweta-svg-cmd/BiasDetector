import { analyzeArticleBias, generateNeutralVersion, BiasAnalysisResponse } from "./openai";
import { scrapeArticle } from "./articleScraper";
import { findRelatedArticles } from "./newsApi";
import { Article, InsertArticle, InsertRelatedArticle, RelatedArticle } from "@shared/schema";
import { storage } from "../storage";

export interface ArticleAnalysisRequest {
  url?: string;
  text?: string;
  title?: string;
  findRelatedSources: boolean;
  generateNeutral: boolean;
}

export interface ArticleAnalysisResponse {
  article: Article;
  relatedArticles?: RelatedArticle[];
}

export async function analyzeArticle(request: ArticleAnalysisRequest): Promise<ArticleAnalysisResponse> {
  try {
    let title: string;
    let content: string;
    let source: string | undefined;
    
    // Get article content either from URL or provided text
    if (request.url) {
      // Check if we've already analyzed this URL
      const existingArticle = await storage.getArticleByUrl(request.url);
      if (existingArticle) {
        const relatedArticles = await storage.getRelatedArticlesByOriginalId(existingArticle.id);
        return { article: existingArticle, relatedArticles };
      }
      
      // Scrape article if it doesn't exist
      const scrapedArticle = await scrapeArticle(request.url);
      title = scrapedArticle.title;
      content = scrapedArticle.content;
      source = scrapedArticle.source;
    } else if (request.text && request.title) {
      // Use provided text and title
      title = request.title;
      content = request.text;
    } else {
      throw new Error("Either URL or both text and title must be provided");
    }
    
    // Analyze article for bias
    const biasAnalysis = await analyzeArticleBias(content, title);
    
    // Create article in storage
    const articleData: InsertArticle = {
      title,
      content,
      url: request.url,
      source,
      biasScore: biasAnalysis.biasScore,
      politicalLeaning: biasAnalysis.politicalLeaning,
      emotionalLanguage: biasAnalysis.emotionalLanguage,
      factualReporting: biasAnalysis.factualReporting,
      analysisDetails: biasAnalysis,
    };
    
    const article = await storage.createArticle(articleData);
    
    // Generate neutral version if requested
    if (request.generateNeutral) {
      const neutralVersion = await generateNeutralVersion(content, biasAnalysis.biasedPhrases);
      await storage.updateArticle(article.id, { neutralVersion });
      article.neutralVersion = neutralVersion;
    }
    
    // Find related articles if requested
    let relatedArticles: RelatedArticle[] = [];
    if (request.findRelatedSources && source) {
      const relatedNewsArticles = await findRelatedArticles(title, source);
      
      // Process and store related articles
      for (const relatedArticle of relatedNewsArticles) {
        // Analyze bias for related article
        const relatedBiasAnalysis = await analyzeArticleBias(
          relatedArticle.content,
          relatedArticle.title
        );
        
        // Create related article in storage
        const relatedArticleData: InsertRelatedArticle = {
          originalArticleId: article.id,
          title: relatedArticle.title,
          content: relatedArticle.content,
          source: relatedArticle.source,
          url: relatedArticle.url,
          biasScore: relatedBiasAnalysis.biasScore,
          keyTerms: biasAnalysis.biasedPhrases && Array.isArray(biasAnalysis.biasedPhrases) 
            ? biasAnalysis.biasedPhrases.map(p => p.original) 
            : [],
          publishedDate: relatedArticle.publishedDate,
          topics: relatedBiasAnalysis.topics || [],
          mainTopic: relatedBiasAnalysis.mainTopic || ''
        };
        
        const storedRelatedArticle = await storage.createRelatedArticle(relatedArticleData);
        relatedArticles.push(storedRelatedArticle);
      }
    }
    
    return { article, relatedArticles };
  } catch (error) {
    console.error("Error analyzing article:", error);
    throw new Error(`Failed to analyze article: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
