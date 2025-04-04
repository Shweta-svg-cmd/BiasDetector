import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Article, RelatedArticle } from '@/types/analysis';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, ArrowRight, BarChart2, FileText, Tag } from 'lucide-react';
import BarChart from '@/components/BarChart';
import { TopicList, TopicBadge } from '@/components/TopicBadge';

interface SourceComparisonProps {
  article: Article;
  relatedArticles: RelatedArticle[];
}

const SourceComparison: React.FC<SourceComparisonProps> = ({ 
  article, 
  relatedArticles 
}) => {
  const [selectedSource, setSelectedSource] = useState<string | undefined>(
    article.source
  );
  
  if (!relatedArticles || relatedArticles.length === 0) {
    return null;
  }
  
  // Add the original article to the sources for comparison
  const allSources = [
    {
      id: 0,
      source: article.source || 'Original Source',
      title: article.title,
      content: article.content,
      biasScore: article.biasScore || 50,
      url: article.url,
      publishedDate: new Date(article.createdAt).toLocaleDateString(),
      topics: article.analysisDetails?.topics || [],
      mainTopic: article.analysisDetails?.mainTopic || '',
    },
    ...relatedArticles.map(related => ({
      id: related.id,
      source: related.source,
      title: related.title,
      content: related.content,
      biasScore: related.biasScore || 50,
      url: related.url,
      publishedDate: related.publishedDate || new Date(related.createdAt).toLocaleDateString(),
      topics: related.topics || [],
      mainTopic: related.mainTopic || '',
    }))
  ];
  
  // Find the currently selected article
  const selectedArticle = allSources.find(
    src => src.source === selectedSource
  ) || allSources[0];
  
  // Function to get bias score color
  const getBiasScoreColor = (score: number) => {
    if (score < 40) return 'bg-green-900 text-green-100';
    if (score < 70) return 'bg-amber-900 text-amber-100';
    return 'bg-red-900 text-red-100';
  };
  
  // Function to extract a preview of the content (first 100-150 words)
  const getContentPreview = (content: string) => {
    const words = content.split(' ');
    return words.slice(0, 100).join(' ') + (words.length > 100 ? '...' : '');
  };
  
  // Function to extract key terms from articles
  const getKeyTerms = (articleId: number) => {
    const mockTerms = [
      { term: 'climate crisis', type: 'biased' },
      { term: 'stubborn resistance', type: 'biased' },
      { term: 'progressive', type: 'neutral' },
      { term: 'opposition', type: 'neutral' },
    ];
    
    // Return a different subset of terms for each source to simulate differences
    const startIdx = articleId % mockTerms.length;
    return mockTerms.slice(startIdx).concat(mockTerms.slice(0, startIdx));
  };
  
  // Show all sources (no filtering)
  const filteredSources = allSources;
  
  return (
    <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-border">
      <div className="px-6 py-4 bg-muted/20 border-b border-border">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              Compare Sources
            </h2>
            <p className="text-sm text-muted-foreground mt-1">See how different news outlets cover the same story</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex mb-6 border-b border-border pb-4 overflow-x-auto">
          {/* Show sources */}
          {filteredSources.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-4 text-sm text-muted-foreground">
              No sources available for comparison.
            </div>
          ) : (
            filteredSources.map((source) => (
              <button
                key={`source-${source.id}`}
                className={`flex flex-col items-center mr-6 pb-2 border-b-2 ${
                  selectedSource === source.source 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setSelectedSource(source.source)}
              >
                <div className={`h-12 w-12 bg-card rounded-full ${
                  selectedSource === source.source 
                    ? 'border-2 border-primary' 
                    : 'border border-border'
                } flex items-center justify-center mb-1`}>
                  <span className="text-xs font-semibold">
                    {source.source.substring(0, 3).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs">{source.source}</span>
                <span className={`text-xs mt-1 px-2 py-0.5 ${getBiasScoreColor(source.biasScore)} rounded-full`}>
                  {source.biasScore}
                </span>
              </button>
            ))
          )}
        </div>
        
        {/* Source Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(() => {
            // Find the selected article from the filtered sources
            const selectedArticle = filteredSources.find(src => src.source === selectedSource);
            
            // If the selected source isn't in the filtered list, but there are other sources
            if (!selectedArticle && filteredSources.length > 0) {
              // Auto-select the first source in the filtered list
              if (selectedSource !== filteredSources[0].source) {
                setSelectedSource(filteredSources[0].source);
              }
              return filteredSources.slice(0, 1).map((source) => (
                <Card key={`article-${source.id}`} className="border border-border">
                  <CardHeader className="px-4 py-3 bg-muted/20 border-b border-border">
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-foreground">{source.source}</div>
                      <div className={`text-sm px-2 py-0.5 ${getBiasScoreColor(source.biasScore)} rounded-full`}>
                        Bias: {source.biasScore}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      {getContentPreview(source.content)}
                    </p>
                    
                    {/* Topics */}
                    {source.topics && source.topics.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs text-muted-foreground mb-2 flex items-center">
                          <Tag className="mr-1 h-3 w-3" /> Topics:
                        </div>
                        <TopicList 
                          topics={source.topics} 
                          mainTopic={source.mainTopic}
                          className="mb-1" 
                        />
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground mb-2">Key terms:</div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {getKeyTerms(source.id).map((term, idx) => (
                        <Badge 
                          key={idx} 
                          variant="outline"
                          className={
                            term.type === 'biased' 
                              ? 'bg-red-900/30 text-red-100 hover:bg-red-900/50 border-red-800' 
                              : 'bg-amber-900/30 text-amber-100 hover:bg-amber-900/50 border-amber-800'
                          }
                        >
                          {term.term}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div>Published: {source.publishedDate}</div>
                      {source.url && (
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          View article <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ));
            }
            
            // If no sources are available
            if (filteredSources.length === 0) {
              return (
                <div className="col-span-2 flex items-center justify-center py-8 text-muted-foreground">
                  <div className="text-center">
                    <Tag className="h-8 w-8 text-muted-foreground mb-2" />
                    <p>No sources available for comparison.</p>
                  </div>
                </div>
              );
            }
            
            // Normal case: show the selected article
            return filteredSources.filter(src => src.source === selectedSource).map((source) => (
              <Card key={`article-${source.id}`} className="border border-border">
                <CardHeader className="px-4 py-3 bg-muted/20 border-b border-border">
                  <div className="flex justify-between items-center">
                    <div className="font-medium text-foreground">{source.source}</div>
                    <div className={`text-sm px-2 py-0.5 ${getBiasScoreColor(source.biasScore)} rounded-full`}>
                      Bias: {source.biasScore}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    {getContentPreview(source.content)}
                  </p>
                  
                  {/* Topics */}
                  {source.topics && source.topics.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-muted-foreground mb-2 flex items-center">
                        <Tag className="mr-1 h-3 w-3" /> Topics:
                      </div>
                      <TopicList 
                        topics={source.topics} 
                        mainTopic={source.mainTopic}
                        className="mb-1" 
                      />
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground mb-2">Key terms:</div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {getKeyTerms(source.id).map((term, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline"
                        className={
                          term.type === 'biased' 
                            ? 'bg-red-900/30 text-red-100 hover:bg-red-900/50 border-red-800' 
                            : 'bg-amber-900/30 text-amber-100 hover:bg-amber-900/50 border-amber-800'
                        }
                      >
                        {term.term}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <div>Published: {source.publishedDate}</div>
                    {source.url && (
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        View article <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ));
          })()}
        </div>
        
        {filteredSources.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="text-md font-semibold text-foreground mb-3 flex items-center">
              <BarChart2 className="mr-2 h-5 w-5 text-primary" />
              Coverage Analysis
            </h3>
            
            {/* Visual comparison charts - Only show Bias Score Comparison bar chart */}
            <div className="mb-6">
              <div className="bg-muted/20 p-4 rounded-lg border border-border">
                <h4 className="font-medium text-sm mb-3 text-center text-foreground">Bias Score Comparison</h4>
                <BarChart 
                  data={filteredSources.map(source => ({
                    name: source.source.length > 10 ? source.source.substring(0, 10) + '...' : source.source,
                    value: source.biasScore,
                    color: source.biasScore < 40 ? '#10b981' : source.biasScore < 70 ? '#f59e0b' : '#ef4444'
                  }))}
                  height={220}
                  maxValue={100}
                />
              </div>
            </div>
            
            {/* Text analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="bg-muted/20 p-4 rounded-lg border border-border">
                  <h4 className="font-medium text-sm mb-2 flex items-center text-foreground">
                    <ArrowRight className="mr-2 h-4 w-4 text-primary" />
                    Key Narrative Differences
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start">
                      <span className="h-2 w-2 rounded-full bg-blue-500 inline-block mt-1.5 mr-2 flex-shrink-0"></span>
                      <span><b className="text-foreground">Left-leaning sources</b> emphasize climate urgency and opposition</span>
                    </li>
                    <li className="flex items-start">
                      <span className="h-2 w-2 rounded-full bg-red-500 inline-block mt-1.5 mr-2 flex-shrink-0"></span>
                      <span><b className="text-foreground">Right-leaning sources</b> focus on economic costs and government reach</span>
                    </li>
                    <li className="flex items-start">
                      <span className="h-2 w-2 rounded-full bg-gray-500 inline-block mt-1.5 mr-2 flex-shrink-0"></span>
                      <span><b className="text-foreground">Centrist sources</b> present both benefits and concerns</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div>
                <div className="bg-muted/20 p-4 rounded-lg border border-border">
                  <h4 className="font-medium text-sm mb-2 flex items-center text-foreground">
                    <Tag className="mr-2 h-4 w-4 text-primary" />
                    Topic Distribution
                  </h4>
                  
                  {/* Topic grouping analysis */}
                  <div className="mt-3">
                    {/* Get all unique main topics from filtered sources */}
                    {Array.from(new Set(filteredSources
                      .filter(source => source.mainTopic)
                      .map(source => source.mainTopic)))
                      .map((topic, index) => {
                        // For each main topic, get all sources with that topic
                        const sourcesWithTopic = filteredSources.filter(s => s.mainTopic === topic);
                        return (
                          <div key={index} className="mb-3 pb-2 border-b border-border/30 last:border-0 last:mb-0 last:pb-0">
                            <div className="flex items-center mb-1.5">
                              <span className="text-sm font-medium mr-2 text-foreground">{topic}:</span>
                              <TopicList topics={[topic]} mainTopic={topic} />
                            </div>
                            <ul className="text-xs text-muted-foreground pl-2">
                              {sourcesWithTopic.map((source, idx) => (
                                <li key={idx} className="flex items-center mb-1 last:mb-0">
                                  <span className={`h-2 w-2 rounded-full mr-2 flex-shrink-0 ${
                                    source.biasScore < 40 ? 'bg-green-500' : 
                                    source.biasScore < 70 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}></span>
                                  <span>{source.source} (Bias: {source.biasScore})</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })
                    }
                    
                    {/* If no topics or all sources have the same topic, show a message */}
                    {!filteredSources.some(s => s.mainTopic) && (
                      <p className="text-sm text-muted-foreground">No topic classifications available.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SourceComparison;