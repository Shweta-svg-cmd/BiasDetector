import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import BiasAnalysisResult from '@/components/BiasAnalysisResult';
import ArticleComparison from '@/components/ArticleComparison';
import SourceComparison from '@/components/SourceComparison';
import MethodologySection from '@/components/MethodologySection';
import { AnalysisResult } from '@/types/analysis';

const Analysis = () => {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  
  const { data, isLoading, error } = useQuery<AnalysisResult>({ 
    queryKey: [`/api/articles/${id}`],
    retry: 1,
  });
  
  // If there's an error or the id is invalid, redirect to home
  useEffect(() => {
    if (error || !id || isNaN(parseInt(id))) {
      navigate('/');
    }
  }, [error, id, navigate]);
  
  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <Skeleton className="h-[400px] w-full rounded-lg" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
          <Skeleton className="h-[500px] w-full rounded-lg" />
        </div>
      </main>
    );
  }
  
  if (!data || !data.article) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load analysis results. Please try again.
          </AlertDescription>
        </Alert>
      </main>
    );
  }
  
  const { article, relatedArticles } = data;
  
  return (
    <>
      <Helmet>
        <title>{`NewsLens | Analysis of "${article.title}"`}</title>
        <meta name="description" content={`Bias analysis results for ${article.title}`} />
      </Helmet>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BiasAnalysisResult article={article} />
        
        {article.neutralVersion && (
          <ArticleComparison article={article} />
        )}
        
        {relatedArticles && relatedArticles.length > 0 && (
          <SourceComparison 
            article={article} 
            relatedArticles={relatedArticles} 
          />
        )}
        
        <MethodologySection />
      </main>
    </>
  );
};

export default Analysis;
