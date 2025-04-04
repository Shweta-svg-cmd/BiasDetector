import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { AnalysisRequest } from '@/types/analysis';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const InputSection = () => {
  const [inputType, setInputType] = useState<'url' | 'text'>('url');
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [findRelatedSources, setFindRelatedSources] = useState(true);
  const [generateNeutral, setGenerateNeutral] = useState(true);
  
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleAnalyze = async () => {
    if (inputType === 'url' && !url) {
      toast({
        title: 'URL Required',
        description: 'Please enter a news article URL to analyze.',
        variant: 'destructive',
      });
      return;
    }

    if (inputType === 'text' && (!text || !title)) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both the article title and content.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const requestData: AnalysisRequest = {
        findRelatedSources,
        generateNeutral,
      };
      
      if (inputType === 'url') {
        requestData.url = url;
      } else {
        requestData.text = text;
        requestData.title = title;
      }
      
      const response = await apiRequest('POST', '/api/analyze', requestData);
      const result = await response.json();
      
      if (result.article?.id) {
        navigate(`/analysis/${result.article.id}`);
      } else {
        throw new Error('No article ID returned from analysis');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mb-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Detect Media Bias In News Articles</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Analyze news articles for bias, get a neutrality score, and compare with other major news sources on the same topic.
        </p>
      </div>
      
      <div className="bg-card rounded-lg shadow-lg p-6 max-w-4xl mx-auto border border-border">
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            <Tabs defaultValue="url" onValueChange={(value) => setInputType(value as 'url' | 'text')}>
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="url">Enter URL</TabsTrigger>
                <TabsTrigger value="text">Paste Text</TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="mt-4">
                <div className="flex mb-4">
                  <Input
                    type="text"
                    placeholder="Enter article URL (e.g., https://www.nytimes.com/...)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 rounded-r-none"
                  />
                  <Button 
                    onClick={handleAnalyze} 
                    className="rounded-l-none"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Analyzing...' : 'Analyze'}
                  </Button>
                </div>
                
                <div className="text-muted-foreground text-sm">
                  <p>Popular sources: 
                    <a href="https://www.nytimes.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">NY Times</a>,
                    <a href="https://www.wsj.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">Wall Street Journal</a>,
                    <a href="https://www.washingtonpost.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">Washington Post</a>,
                    <a href="https://www.foxnews.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">Fox News</a>,
                    <a href="https://www.cnn.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">CNN</a>
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="text" className="mt-4">
                <div className="mb-4">
                  <Label htmlFor="article-title" className="block text-sm font-medium mb-1">
                    Article Title
                  </Label>
                  <Input
                    id="article-title"
                    type="text"
                    placeholder="Enter the article title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="article-content" className="block text-sm font-medium mb-1">
                    Article Content
                  </Label>
                  <textarea
                    id="article-content"
                    placeholder="Paste the article content here"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full h-40 p-3 border border-border bg-card rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground"
                  />
                </div>
                <Button 
                  onClick={handleAnalyze} 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Analyzing...' : 'Analyze'}
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <div className="flex flex-wrap -mx-2">
          <div className="px-2 w-full sm:w-1/2 mb-4">
            <div className="flex items-center">
              <Checkbox
                id="find-sources"
                checked={findRelatedSources}
                onCheckedChange={(checked) => setFindRelatedSources(checked as boolean)}
              />
              <Label htmlFor="find-sources" className="ml-2 text-sm">
                Find related articles from other sources
              </Label>
            </div>
          </div>
          
          <div className="px-2 w-full sm:w-1/2 mb-4">
            <div className="flex items-center">
              <Checkbox
                id="generate-neutral"
                checked={generateNeutral}
                onCheckedChange={(checked) => setGenerateNeutral(checked as boolean)}
              />
              <Label htmlFor="generate-neutral" className="ml-2 text-sm">
                Generate neutral version
              </Label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InputSection;
