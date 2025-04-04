import { Card, CardContent } from '@/components/ui/card';
import BiasGauge from '@/components/BiasGauge';
import RadarChart from '@/components/RadarChart';
import { Article } from '@/types/analysis';
import { Progress } from '@/components/ui/progress';
import { TopicList } from '@/components/TopicBadge';
import { 
  BarChart2, 
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  XCircle,
  Tag
} from 'lucide-react';

interface BiasAnalysisResultProps {
  article: Article;
}

const BiasAnalysisResult: React.FC<BiasAnalysisResultProps> = ({ article }) => {
  if (!article.analysisDetails) {
    return null;
  }
  
  const { 
    biasScore, 
    politicalLeaning, 
    emotionalLanguage, 
    factualReporting,
    keyFindings,
    languageDistribution,
    sourceDistribution,
    biasedPhrases,
    topics,
    mainTopic
  } = article.analysisDetails;

  // Format data for radar chart
  const radarData = [
    { subject: 'Bias', value: biasScore || 0, fullMark: 100 },
    { 
      subject: 'Emotional', 
      value: emotionalLanguage === 'High' ? 80 : emotionalLanguage === 'Moderate' ? 50 : 20, 
      fullMark: 100 
    },
    { 
      subject: 'Factual', 
      value: factualReporting === 'High' ? 80 : factualReporting === 'Moderate' ? 50 : 20, 
      fullMark: 100 
    },
    { 
      subject: 'Political', 
      value: politicalLeaning && typeof politicalLeaning === 'string' ? 
             (politicalLeaning.includes('Far') ? 90 : 
             politicalLeaning.includes('leaning') ? 70 : 
             politicalLeaning.includes('Lean') ? 50 : 30) : 30, 
      fullMark: 100 
    },
    { 
      subject: 'Neutral Language', 
      value: languageDistribution?.neutral || 0, 
      fullMark: 100 
    }
  ];

  const getBiasColor = (score: number) => {
    if (score < 40) return '#10b981'; // green
    if (score < 70) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };
  
  return (
    <div className="bg-card rounded-lg shadow-lg overflow-hidden mb-8 border border-border">
      <div className="px-6 py-4 bg-muted/20 border-b border-border">
        <div className="flex flex-wrap items-center justify-between">
          <div className="mb-2 md:mb-0">
            <h2 className="text-xl font-semibold text-foreground">Analysis Results</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {article.source ? `${article.source} Article: ` : ''}
              "{article.title}"
            </p>
          </div>
          <div className="flex space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              politicalLeaning && typeof politicalLeaning === 'string' && politicalLeaning.includes('Left') ? 'bg-blue-900 text-blue-100' :
              politicalLeaning && typeof politicalLeaning === 'string' && politicalLeaning.includes('Right') ? 'bg-red-900 text-red-100' :
              'bg-slate-800 text-slate-100'
            }`}>
              {politicalLeaning || 'Neutral'}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              (biasScore || 0) < 40 ? 'bg-green-900 text-green-100' :
              (biasScore || 0) < 70 ? 'bg-amber-900 text-amber-100' :
              'bg-red-900 text-red-100'
            }`}>
              Bias: {biasScore || 0}/100
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* First row - Bias gauge and radar chart */}
        <div className="flex flex-wrap -mx-4 mb-8">
          {/* Bias Score Card */}
          <div className="w-full md:w-1/3 px-4 mb-6">
            <div className="bg-muted/20 rounded-lg p-4 h-full flex flex-col border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Activity className="mr-2 h-5 w-5 text-primary" />
                Overall Bias Score
              </h3>
              
              <div className="flex flex-col items-center justify-center mb-4 flex-grow">
                <BiasGauge score={biasScore} />
              </div>
              
              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Political Leaning:</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    politicalLeaning && typeof politicalLeaning === 'string' && politicalLeaning.includes('Left') ? 'bg-blue-900 text-blue-100' :
                    politicalLeaning && typeof politicalLeaning === 'string' && politicalLeaning.includes('Right') ? 'bg-red-900 text-red-100' :
                    'bg-slate-800 text-slate-100'
                  }`}>
                    {politicalLeaning || 'Neutral'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Emotional Language:</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    emotionalLanguage === 'High' ? 'bg-red-900 text-red-100' :
                    emotionalLanguage === 'Moderate' ? 'bg-amber-900 text-amber-100' :
                    'bg-green-900 text-green-100'
                  }`}>
                    {emotionalLanguage || 'Low'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Factual Reporting:</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    factualReporting === 'Low' ? 'bg-red-900 text-red-100' :
                    factualReporting === 'Moderate' ? 'bg-amber-900 text-amber-100' :
                    'bg-green-900 text-green-100'
                  }`}>
                    {factualReporting || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Radar Chart */}
          <div className="w-full md:w-2/3 px-4 mb-6">
            <div className="bg-muted/20 rounded-lg p-4 h-full border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <BarChart2 className="mr-2 h-5 w-5 text-primary" />
                Multidimensional Bias Analysis
              </h3>
              
              <div className="flex justify-center">
                <RadarChart 
                  data={radarData} 
                  height={260} 
                  color={getBiasColor(biasScore)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Second row - Key findings and topics */}
        <div className="flex flex-wrap -mx-4 mb-8">
          {/* Key Findings */}
          <div className="w-full md:w-2/3 px-4 mb-6">
            <div className="bg-muted/20 rounded-lg p-4 h-full border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-primary" />
                Key Findings
              </h3>
              
              <ul className="text-sm text-muted-foreground space-y-3">
                {keyFindings && keyFindings.length > 0 ? keyFindings.map((finding, index) => (
                  <li key={index} className="flex items-start">
                    <ArrowRight className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                    <span>{finding}</span>
                  </li>
                )) : (
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                    <span>No key findings available</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
          
          {/* Article Topics */}
          <div className="w-full md:w-1/3 px-4 mb-6">
            <div className="bg-muted/20 rounded-lg p-4 h-full border border-border flex flex-col">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Tag className="mr-2 h-5 w-5 text-primary" />
                Article Topics
              </h3>
              
              {topics && topics.length > 0 ? (
                <>
                  <div className="mb-4">
                    <span className="text-sm text-muted-foreground mb-2 block">Main topic:</span>
                    {mainTopic && (
                      <span className="inline-block mt-1">
                        <TopicList topics={[mainTopic]} mainTopic={mainTopic} />
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground mb-2 block">Related topics:</span>
                    <TopicList 
                      topics={topics.filter(t => t !== mainTopic)} 
                      className="mt-1" 
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No topic classifications available</p>
              )}
            </div>
          </div>
        </div>

        {/* Removed biased phrases section as requested by user */}
      </div>
    </div>
  );
};

export default BiasAnalysisResult;
