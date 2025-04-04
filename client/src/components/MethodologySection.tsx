import { File, BarChart2, RefreshCw, BookOpen } from 'lucide-react';

const MethodologySection = () => {
  return (
    <section className="mb-12" id="how-it-works">
      <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-border">
        <div className="px-6 py-4 bg-muted/20 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground flex items-center">
            <BookOpen className="mr-2 h-5 w-5 text-primary" />
            How It Works
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <File className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">NLP Analysis</h3>
              <p className="text-sm text-muted-foreground">Our AI analyzes the text for emotionally charged language, political framing, and unbalanced perspectives.</p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Bias Scoring</h3>
              <p className="text-sm text-muted-foreground">We quantify bias across multiple dimensions to provide an objective measurement of media bias in the content.</p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Neutralization</h3>
              <p className="text-sm text-muted-foreground">Our system rewrites content to remove bias while preserving key facts and information.</p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <button className="text-primary font-medium hover:text-primary/80 transition-colors">
              Learn more about our methodology
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MethodologySection;
