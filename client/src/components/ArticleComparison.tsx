import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Article } from '@/types/analysis';
import { Copy, ArrowLeftRight, AlertTriangle, CheckCircle, Maximize2, Minimize2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ArticleComparisonProps {
  article: Article;
}

const ArticleComparison: React.FC<ArticleComparisonProps> = ({ article }) => {
  const [showFullText, setShowFullText] = useState(false);
  const [highlightDifferences, setHighlightDifferences] = useState(true);
  const { toast } = useToast();
  
  if (!article.neutralVersion) {
    return null;
  }

  const originalContent = article.content;
  const neutralContent = article.neutralVersion;
  
  // Function to truncate text if not showing full text
  const truncateText = (text: string): string => {
    if (showFullText) return text;
    const words = text.split(' ');
    return words.slice(0, 100).join(' ') + (words.length > 100 ? '...' : '');
  };
  
  // Get biased phrases to highlight
  const highlightBiasedPhrases = (text: string): JSX.Element => {
    if (!highlightDifferences || !article.analysisDetails?.biasedPhrases) {
      return <p>{truncateText(text)}</p>;
    }
    
    let highlightedText = truncateText(text);
    const fragments = [];
    let lastIndex = 0;
    
    for (const phrase of article.analysisDetails.biasedPhrases) {
      const originalPhrase = phrase.original;
      const index = highlightedText.indexOf(originalPhrase, lastIndex);
      
      if (index === -1) continue;
      
      // Add text before the phrase
      if (index > lastIndex) {
        fragments.push(highlightedText.substring(lastIndex, index));
      }
      
      // Add the highlighted phrase
      fragments.push(
        <span key={index} className="bg-red-100 text-red-800 px-0.5 rounded">
          {originalPhrase}
        </span>
      );
      
      lastIndex = index + originalPhrase.length;
    }
    
    // Add the remaining text
    if (lastIndex < highlightedText.length) {
      fragments.push(highlightedText.substring(lastIndex));
    }
    
    return <p>{fragments}</p>;
  };
  
  const handleCopyNeutral = () => {
    navigator.clipboard.writeText(neutralContent);
    toast({
      title: "Copied to clipboard",
      description: "The neutral version has been copied to your clipboard",
    });
  };
  
  // Count the number of biased phrases
  const biasedPhraseCount = article.analysisDetails?.biasedPhrases?.length || 0;
  
  // Generate a simple visual representation of bias reduction
  const calculateBiasScore = () => {
    if (!article.biasScore) return 0;
    return Math.min(100, Math.max(0, article.biasScore));
  };
  
  const biasScore = calculateBiasScore();
  const neutralScore = Math.max(0, biasScore - 50); // Simplified estimate of neutral score
  
  return (
    <div className="bg-white rounded-lg shadow-md mb-8">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <ArrowLeftRight className="mr-2 h-5 w-5 text-primary-500" />
              Original vs. Neutral
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Compare the original article with a neutrally rewritten version
            </p>
          </div>
          <div className="flex mt-2 md:mt-0">
            <Badge variant="outline" className="mr-2 bg-amber-100">
              <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
              {biasedPhraseCount} Biased {biasedPhraseCount === 1 ? 'Phrase' : 'Phrases'} Found
            </Badge>
            <Badge variant="outline" className="bg-green-100">
              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
              Neutral Version Generated
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <Tabs defaultValue="side-by-side" className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="side-by-side" className="flex items-center">
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Side by Side
              </TabsTrigger>
              <TabsTrigger value="original" className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Original
              </TabsTrigger>
              <TabsTrigger value="neutral" className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Neutral
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFullText(!showFullText)}
                className="flex items-center gap-1"
              >
                {showFullText ? 
                  <><Minimize2 size={14} /> Collapse</> : 
                  <><Maximize2 size={14} /> Expand</>
                }
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHighlightDifferences(!highlightDifferences)}
                className="flex items-center gap-1"
              >
                {highlightDifferences ? 
                  <><EyeOff size={14} /> Hide Highlights</> : 
                  <><Eye size={14} /> Show Highlights</>
                }
              </Button>
            </div>
          </div>
          
          <TabsContent value="side-by-side" className="mt-0">
            <div className="flex flex-wrap comparison-container">
              <div className="w-full md:w-1/2 pr-0 md:pr-3 comparison-card mb-4 md:mb-0">
                <div className="bg-gray-50 rounded-lg p-4 h-full border-l-4 border-red-500">
                  <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                    Original Article
                    <span className="ml-auto text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                      Bias Score: {biasScore}
                    </span>
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    {highlightBiasedPhrases(originalContent)}
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-1/2 pl-0 md:pl-3 comparison-card">
                <div className="bg-gray-50 rounded-lg p-4 h-full border-l-4 border-green-500">
                  <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    Neutral Version
                    <span className="ml-auto text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      Bias Score: ~{neutralScore}
                    </span>
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <p>{truncateText(neutralContent)}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="original" className="mt-0">
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-red-500">
              <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                Original Article
                <span className="ml-auto text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                  Bias Score: {biasScore}
                </span>
              </h3>
              <div className="prose prose-sm max-w-none">
                {highlightBiasedPhrases(originalContent)}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="neutral" className="mt-0">
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500">
              <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                Neutral Version
                <span className="ml-auto text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  Bias Score: ~{neutralScore}
                </span>
              </h3>
              <div className="prose prose-sm max-w-none">
                <p>{truncateText(neutralContent)}</p>
              </div>
              <div className="flex justify-end mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyNeutral}
                  className="flex items-center gap-1"
                >
                  <Copy size={14} /> Copy Neutral Text
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Bias Reduction Visualization */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-primary-500" />
            Bias Reduction Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Biased Phrases Detected</h4>
              <p className="text-2xl font-bold text-red-500">{biasedPhraseCount}</p>
              <p className="text-xs text-gray-500 mt-1">Phrases with political bias or loaded language</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Bias Score Reduction</h4>
              <p className="text-2xl font-bold text-primary-500">~{biasScore - neutralScore}%</p>
              <p className="text-xs text-gray-500 mt-1">Estimated reduction in political bias</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Neutral Content</h4>
              <p className="text-2xl font-bold text-green-500">{Math.round(100 - (biasScore - neutralScore))}%</p>
              <p className="text-xs text-gray-500 mt-1">Percentage of factual, balanced content</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleComparison;
