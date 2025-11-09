import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { generateWellbeingAnalysis } from "@/lib/api";
import { toast } from "sonner";
import { useSimulation } from "@/contexts/SimulationContext";

interface WellbeingResource {
  title: string;
  description: string;
  url: string;
}

interface WellbeingAnalysis {
  summary: string;
  concerns: string[];
  resources: WellbeingResource[];
  riskLevel: 'low' | 'moderate' | 'high';
}

export const WellbeingAICard = () => {
  const { payments } = useSimulation();
  const [analysis, setAnalysis] = useState<WellbeingAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleAnalyze = useCallback(async () => {
    setIsLoading(true);
    setHasAnalyzed(false);
    
    try {
      // Get all recent transactions with dates
      const transactions = payments.map(p => ({
        merchant: p.description,
        amount: p.amount,
        date: p.date,
        type: p.type
      }));

      const data = await generateWellbeingAnalysis({ transactions });

      setAnalysis(data);
      setHasAnalyzed(true);
      
      if (data.riskLevel === 'high' || data.riskLevel === 'moderate') {
        toast.warning('Wellbeing check complete', {
          description: 'We found some patterns that might need attention. Please review the resources below.',
        });
      } else {
        toast.success('Wellbeing check complete', {
          description: 'Your spending patterns look healthy!',
        });
      }

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('429')) {
        toast.error('Rate limit exceeded. Please try again in a moment!');
      } else if (errorMessage.includes('402')) {
        toast.error('AI credits exhausted. Time to top up your workspace!');
      } else {
        toast.error('Failed to analyze wellbeing. Try again!');
      }
    } finally {
      setIsLoading(false);
    }
  }, [payments]);

  // Auto-analyze when payments change significantly (only if we have enough transactions)
  useEffect(() => {
    if (payments.length >= 3 && !hasAnalyzed && !isLoading) {
      // Auto-analyze after a short delay when component mounts with sufficient data
      const timer = setTimeout(() => {
        handleAnalyze();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [payments.length, hasAnalyzed, isLoading, handleAnalyze]);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-500';
      case 'moderate':
        return 'bg-orange-500';
      default:
        return 'bg-green-500';
    }
  };

  const getRiskText = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'HIGH PRIORITY';
      case 'moderate':
        return 'MODERATE CONCERN';
      default:
        return 'HEALTHY PATTERNS';
    }
  };

  return (
    <Card className="brutal p-6 transform rotate-[-0.5deg] bg-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Heart className="w-7 h-7 text-pink-500" />
          <h3 className="text-2xl font-black uppercase">
            WELLBEING AI
          </h3>
        </div>
      </div>
      
      {!hasAnalyzed ? (
        <div className="space-y-3">
          <p className="text-sm font-bold uppercase">
            MENTAL HEALTH & WELLBEING CHECK
          </p>
          <p className="text-xs text-muted-foreground">
            We analyze your transaction patterns to identify potential stress indicators or concerning spending habits related to substance use, and connect you with helpful resources.
          </p>
          <Button
            onClick={handleAnalyze}
            disabled={isLoading || payments.length === 0}
            className="w-full bg-pink-500 hover:bg-pink-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 mr-2" />
                {payments.length === 0 ? 'No Transactions Yet' : 'Check My Wellbeing'}
              </>
            )}
          </Button>
        </div>
      ) : analysis ? (
        <div className="space-y-4">
          {/* Risk Level Badge */}
          <div className={`p-3 rounded-lg ${getRiskColor(analysis.riskLevel)} text-white text-center`}>
            <p className="text-xs font-black uppercase mb-1">
              {getRiskText(analysis.riskLevel)}
            </p>
          </div>

          {/* Summary */}
          <div className="prose prose-sm max-w-none">
            <div 
              className="whitespace-pre-wrap text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: analysis.summary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
              }}
            />
          </div>

          {/* Concerns */}
          {analysis.concerns.length > 0 && (
            <div className="p-4 bg-accent border-4 border-black dark:border-white">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black uppercase mb-2 text-black dark:text-white">
                    PATTERNS DETECTED
                  </p>
                  <ul className="text-xs space-y-1 text-black dark:text-white">
                    {analysis.concerns.map((concern, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="font-bold">•</span>
                        <span>{concern}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Resources */}
          {analysis.resources.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-black uppercase mb-2">
                HELPFUL RESOURCES
              </p>
              <div className="space-y-2">
                {analysis.resources.map((resource, idx) => (
                  <a
                    key={idx}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-accent border-4 border-black dark:border-white hover:bg-accent/80 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-xs font-black uppercase text-black dark:text-white mb-1">
                          {resource.title}
                        </p>
                        <p className="text-xs text-black/70 dark:text-white/70">
                          {resource.description}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-black dark:text-white flex-shrink-0 mt-0.5" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 mr-2" />
                Re-analyze Wellbeing
              </>
            )}
          </Button>
        </div>
      ) : null}
    </Card>
  );
};

