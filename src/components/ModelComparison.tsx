import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  BrainIcon,
  ZapIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  CopyIcon,
  RefreshCwIcon,
  SplitIcon,
  XIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AIModel } from "./ModelSwitcher";

export interface ComparisonResult {
  id: string;
  modelId: string;
  modelName: string;
  response: string;
  timestamp: Date;
  tokensUsed?: number;
  responseTime: number; // in milliseconds
  status: 'loading' | 'completed' | 'error';
  error?: string;
  rating?: 'like' | 'dislike' | null;
}

interface ModelComparisonProps {
  prompt: string;
  models: AIModel[];
  onClose: () => void;
  onModelResponse?: (modelId: string, response: string) => void;
  className?: string;
}

export function ModelComparison({
  prompt,
  models,
  onClose,
  onModelResponse,
  className
}: ModelComparisonProps) {
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Initialize results for each model
  useEffect(() => {
    const initialResults: ComparisonResult[] = models.map(model => ({
      id: `result-${model.id}`,
      modelId: model.id,
      modelName: model.name,
      response: '',
      timestamp: new Date(),
      responseTime: 0,
      status: 'loading' as const
    }));

    setResults(initialResults);
    startComparison(initialResults);
  }, [models, prompt]);

  const startComparison = async (initialResults: ComparisonResult[]) => {
    setIsComparing(true);
    setProgress(0);

    // Simulate API calls for each model
    const promises = initialResults.map(async (result, index) => {
      const startTime = Date.now();

      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 3000));

        // Mock response based on model
        const mockResponses = {
          'zai-org/GLM-4.5-Air': `Based on your prompt "${prompt}", I can provide a comprehensive analysis. This model excels at reasoning and providing detailed explanations with strong contextual understanding.`,
          'microsoft/WizardLM-2-8x22B': `Regarding "${prompt}", here's my perspective: This advanced model offers excellent instruction following and conversational abilities, making it ideal for complex queries.`,
          'mistralai/Mistral-7B-Instruct-v0.1': `For "${prompt}", I suggest: This fast and efficient model provides quick responses while maintaining good quality and understanding.`
        };

        const response = mockResponses[result.modelId as keyof typeof mockResponses] ||
          `Response to: ${prompt}. This is a simulated response from ${result.modelName}.`;

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        // Update result
        setResults(prev => prev.map(r =>
          r.id === result.id
            ? {
                ...r,
                response,
                responseTime,
                tokensUsed: Math.floor(response.length / 4), // Rough token estimate
                status: 'completed' as const,
                timestamp: new Date()
              }
            : r
        ));

        // Notify parent
        onModelResponse?.(result.modelId, response);

        // Update progress
        setProgress(((index + 1) / initialResults.length) * 100);

      } catch (error) {
        setResults(prev => prev.map(r =>
          r.id === result.id
            ? {
                ...r,
                status: 'error' as const,
                error: 'Failed to get response',
                responseTime: Date.now() - startTime
              }
            : r
        ));
      }
    });

    await Promise.all(promises);
    setIsComparing(false);
    setProgress(100);
  };

  const handleRating = (resultId: string, rating: 'like' | 'dislike') => {
    setResults(prev => prev.map(r =>
      r.id === resultId
        ? { ...r, rating: r.rating === rating ? null : rating }
        : r
    ));
  };

  const handleCopyResponse = (response: string) => {
    navigator.clipboard.writeText(response);
  };

  const handleRetry = (resultId: string) => {
    setResults(prev => prev.map(r =>
      r.id === resultId
        ? { ...r, status: 'loading' as const, response: '', error: undefined }
        : r
    ));

    // Retry the specific model
    const result = results.find(r => r.id === resultId);
    if (result) {
      startComparison([result]);
    }
  };

  const getStatusIcon = (status: ComparisonResult['status']) => {
    switch (status) {
      case 'loading':
        return <RefreshCwIcon className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: ComparisonResult['status']) => {
    switch (status) {
      case 'loading':
        return 'border-blue-200 bg-blue-50';
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <SplitIcon className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Model Comparison</h2>
            <p className="text-sm text-muted-foreground">
              Comparing responses from {models.length} AI models
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isComparing && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <RefreshCwIcon className="w-4 h-4 animate-spin" />
              <span>Generating responses...</span>
            </div>
          )}

          <Button variant="ghost" size="icon" onClick={onClose}>
            <XIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {isComparing && (
        <div className="px-4 py-2 border-b border-border">
          <div className="flex items-center space-x-2 text-sm">
            <span>Progress:</span>
            <Progress value={progress} className="flex-1 h-2" />
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      )}

      {/* Prompt Display */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Prompt:</h3>
          <p className="text-sm bg-background p-3 rounded-lg border">{prompt}</p>
        </div>
      </div>

      {/* Results Grid */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 max-w-7xl mx-auto">
            {results.map((result) => (
              <Card
                key={result.id}
                className={cn(
                  "relative transition-all duration-300",
                  getStatusColor(result.status)
                )}
              >
                {/* Model Header */}
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BrainIcon className="w-4 h-4 text-primary" />
                      <CardTitle className="text-base">{result.modelName}</CardTitle>
                      {getStatusIcon(result.status)}
                    </div>

                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRating(result.id, 'like')}
                        className={cn(
                          "h-6 w-6 p-0",
                          result.rating === 'like' && "text-green-600"
                        )}
                      >
                        <ThumbsUpIcon className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRating(result.id, 'dislike')}
                        className={cn(
                          "h-6 w-6 p-0",
                          result.rating === 'dislike' && "text-red-600"
                        )}
                      >
                        <ThumbsDownIcon className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-3 h-3" />
                      <span>{result.responseTime}ms</span>
                    </div>
                    {result.tokensUsed && (
                      <>
                        <span>•</span>
                        <span>{result.tokensUsed} tokens</span>
                      </>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Status/Error Display */}
                  {result.status === 'loading' && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <RefreshCwIcon className="w-4 h-4 animate-spin" />
                      <span>Generating response...</span>
                    </div>
                  )}

                  {result.status === 'error' && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-red-600">
                        <XCircleIcon className="w-4 h-4" />
                        <span>{result.error || 'Failed to generate response'}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRetry(result.id)}
                        className="w-full"
                      >
                        <RefreshCwIcon className="w-3 h-3 mr-1" />
                        Retry
                      </Button>
                    </div>
                  )}

                  {/* Response Content */}
                  {result.status === 'completed' && result.response && (
                    <div className="space-y-3">
                      <ScrollArea className="h-48">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {result.response}
                        </p>
                      </ScrollArea>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {result.rating === 'like' && (
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              <ThumbsUpIcon className="w-3 h-3 mr-1" />
                              Preferred
                            </Badge>
                          )}
                          {result.rating === 'dislike' && (
                            <Badge variant="outline" className="text-red-600 border-red-200">
                              <ThumbsDownIcon className="w-3 h-3 mr-1" />
                              Not preferred
                            </Badge>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyResponse(result.response)}
                          className="h-6 w-6 p-0"
                        >
                          <CopyIcon className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="text-sm text-muted-foreground">
            Compare AI model responses side by side to find the best fit for your needs.
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close Comparison
            </Button>
            <Button
              onClick={() => startComparison(results)}
              disabled={isComparing}
              className="btn-primary"
            >
              <RefreshCwIcon className={cn("w-4 h-4 mr-2", isComparing && "animate-spin")} />
              Run Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
