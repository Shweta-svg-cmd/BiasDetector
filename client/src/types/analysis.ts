export interface BiasedPhrase {
  original: string;
  neutral: string;
}

export interface SourceDistribution {
  leftLeaning: number;
  neutral: number;
  rightLeaning: number;
}

export interface LanguageDistribution {
  neutral: number;
  biased: number;
}

export interface BiasAnalysisDetails {
  biasScore: number;
  politicalLeaning: string;
  emotionalLanguage: string;
  factualReporting: string;
  keyFindings: string[];
  biasedPhrases: BiasedPhrase[];
  sourceDistribution: SourceDistribution;
  languageDistribution: LanguageDistribution;
  topics?: string[];
  mainTopic?: string;
}

export interface Article {
  id: number;
  url?: string;
  title: string;
  content: string;
  source?: string;
  biasScore?: number;
  politicalLeaning?: string;
  emotionalLanguage?: string;
  factualReporting?: string;
  neutralVersion?: string;
  analysisDetails?: BiasAnalysisDetails;
  createdAt: Date;
}

export interface RelatedArticle {
  id: number;
  originalArticleId: number;
  url?: string;
  title: string;
  content: string;
  source: string;
  biasScore?: number;
  keyTerms?: string[];
  publishedDate?: string;
  topics?: string[];
  mainTopic?: string;
  createdAt: Date;
}

export interface AnalysisResult {
  article: Article;
  relatedArticles?: RelatedArticle[];
}

export interface AnalysisRequest {
  url?: string;
  text?: string;
  title?: string;
  findRelatedSources: boolean;
  generateNeutral: boolean;
}
