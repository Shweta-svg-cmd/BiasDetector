import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Clock, ArrowRight, BarChart } from 'lucide-react';
import { Article } from '@/types/analysis';

const RecentHistory = () => {
  const { data: recentArticles, isLoading, error } = useQuery<Article[]>({
    queryKey: ['/api/articles/recent'],
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !recentArticles || recentArticles.length === 0) {
    return null; // Don't show any error, just hide the component if there's no history
  }

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
        <Clock className="mr-2 h-5 w-5 text-primary" />
        Recently Analyzed Articles
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentArticles.map((article) => (
          <Link key={article.id} href={`/analysis/${article.id}`}>
            <a className="block h-full">
              <Card className="h-full transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer hover:border-primary/50 border border-border">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base line-clamp-2 text-foreground">{article.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-muted-foreground">
                      {article.source ? article.source : 'Unknown source'}
                    </div>
                    <div className="text-xs text-muted-foreground/70">
                      {article.createdAt ? formatDate(article.createdAt) : ''}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    {article.biasScore !== undefined && article.biasScore !== null ? (
                      <div className="flex items-center">
                        <BarChart className="h-4 w-4 text-primary mr-1" />
                        <span className="text-sm font-medium">
                          Bias: {article.biasScore}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No bias analysis</span>
                    )}
                    
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentHistory;