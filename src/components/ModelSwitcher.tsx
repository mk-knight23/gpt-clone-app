import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BrainIcon,
  ZapIcon,
  ThermometerIcon,
  SettingsIcon,
  ShuffleIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  SparklesIcon,
  CpuIcon,
  GlobeIcon,
  SplitIcon,
  ServerIcon,
  ActivityIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MODEL_REGISTRY,
  PROVIDER_CONFIGS,
  providerHealthMonitor
} from "@/features/models/modelRegistry";
import { ModelRegistryEntry, ProviderId } from "@/features/models";
import { getRateLimitStatus, getCircuitBreakerStatus } from "@/lib/rateLimiter";

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  contextWindow: number;
  maxTokens: number;
  capabilities: string[];
  status: 'available' | 'maintenance' | 'deprecated';
  pricing?: {
    input: number; // per 1K tokens
    output: number; // per 1K tokens
  };
  icon: React.ComponentType<{ className?: string }>;
}

interface ModelSwitcherProps {
  currentModel: string;
  availableModels: AIModel[];
  onModelChange: (modelId: string) => void;
  onParameterChange?: (parameter: string, value: number) => void;
  onComparisonRequest?: () => void;
  temperature?: number;
  maxTokens?: number;
  showParameters?: boolean;
  showComparison?: boolean;
  compact?: boolean;
  className?: string;
}

const modelIcons = {
  'zai-org/GLM-4.5-Air': BrainIcon,
  'microsoft/WizardLM-2-8x22B': SparklesIcon,
  'mistralai/Mistral-7B-Instruct-v0.1': CpuIcon,
  'anthropic/claude-3-sonnet': GlobeIcon,
  'openai/gpt-4': ZapIcon,
  'google/gemini-pro': SparklesIcon,
} as const;

export function ModelSwitcher({
  currentModel,
  availableModels,
  onModelChange,
  onParameterChange,
  onComparisonRequest,
  temperature = 0.7,
  maxTokens = 1024,
  showParameters = false,
  compact = false,
  className
}: ModelSwitcherProps) {
  const [selectedModel, setSelectedModel] = useState(currentModel);
  const [isOpen, setIsOpen] = useState(false);
  const [localTemperature, setLocalTemperature] = useState(temperature);
  const [localMaxTokens, setLocalMaxTokens] = useState(maxTokens);

  const currentModelData = availableModels.find(m => m.id === selectedModel);

  useEffect(() => {
    setSelectedModel(currentModel);
  }, [currentModel]);

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    onModelChange(modelId);
    setIsOpen(false);
  };

  const handleParameterChange = (parameter: string, value: number) => {
    if (parameter === 'temperature') {
      setLocalTemperature(value);
    } else if (parameter === 'maxTokens') {
      setLocalMaxTokens(value);
    }

    onParameterChange?.(parameter, value);
  };

  const getStatusIcon = (status: AIModel['status']) => {
    switch (status) {
      case 'available':
        return <CheckCircleIcon className="w-3 h-3 text-green-500" />;
      case 'maintenance':
        return <AlertCircleIcon className="w-3 h-3 text-yellow-500" />;
      case 'deprecated':
        return <AlertCircleIcon className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: AIModel['status']) => {
    switch (status) {
      case 'available':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'deprecated':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (compact) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <Select value={selectedModel} onValueChange={handleModelSelect}>
          <SelectTrigger className="w-48 h-8">
            <SelectValue>
              <div className="flex items-center space-x-2">
                {currentModelData && (
                  <>
                    <currentModelData.icon className="w-3 h-3" />
                    <span className="text-xs font-medium truncate">
                      {currentModelData.name}
                    </span>
                  </>
                )}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {availableModels.map((model) => {
              const Icon = model.icon;
              return (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{model.name}</span>
                        {getStatusIcon(model.status)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {model.provider} • {model.contextWindow}K context
                      </div>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {showParameters && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <SettingsIcon className="w-3 h-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Temperature: {localTemperature}</Label>
                  <Slider
                    value={[localTemperature]}
                    onValueChange={([value]) => handleParameterChange('temperature', value)}
                    max={2}
                    min={0}
                    step={0.1}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Focused</span>
                    <span>Creative</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Max Tokens: {localMaxTokens}</Label>
                  <Slider
                    value={[localMaxTokens]}
                    onValueChange={([value]) => handleParameterChange('maxTokens', value)}
                    max={4096}
                    min={128}
                    step={128}
                    className="mt-2"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {onComparisonRequest && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onComparisonRequest}
            title="Compare models"
          >
            <SplitIcon className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start h-auto p-3 glass-hover",
            className
          )}
        >
          <div className="flex items-center space-x-3 w-full">
            {currentModelData && (
              <>
                <currentModelData.icon className="w-5 h-5 text-primary" />
                <div className="flex-1 text-left">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{currentModelData.name}</span>
                    {getStatusIcon(currentModelData.status)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {currentModelData.provider} • {currentModelData.contextWindow}K context
                  </div>
                </div>
                <ShuffleIcon className="w-4 h-4 text-muted-foreground" />
              </>
            )}
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-0" align="start">
        <div className="p-4 border-b border-border/50">
          <h3 className="font-semibold text-sm">Choose AI Model</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Select a model for this conversation
          </p>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {availableModels.map((model) => {
            const Icon = model.icon;
            const isSelected = model.id === selectedModel;

            return (
              <div
                key={model.id}
                className={cn(
                  "p-3 border-b border-border/30 last:border-b-0 cursor-pointer transition-colors",
                  isSelected && "bg-primary/5 border-primary/20",
                  "hover:bg-muted/50"
                )}
                onClick={() => handleModelSelect(model.id)}
              >
                <div className="flex items-start space-x-3">
                  <Icon className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{model.name}</span>
                      {isSelected && <CheckCircleIcon className="w-4 h-4 text-primary" />}
                      {getStatusIcon(model.status)}
                    </div>

                    <p className="text-xs text-muted-foreground mt-1">
                      {model.description}
                    </p>

                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {model.contextWindow}K context
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {model.provider}
                      </Badge>
                      {model.status !== 'available' && (
                        <Badge
                          variant="outline"
                          className={cn("text-xs", getStatusColor(model.status))}
                        >
                          {model.status}
                        </Badge>
                      )}
                    </div>

                    {model.capabilities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {model.capabilities.slice(0, 3).map((capability) => (
                          <Badge key={capability} variant="secondary" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                        {model.capabilities.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{model.capabilities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {showParameters && (
          <>
            <Separator />
            <div className="p-4 space-y-4">
              <h4 className="font-medium text-sm">Model Parameters</h4>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm">Temperature</Label>
                  <Badge variant="outline" className="text-xs">{localTemperature}</Badge>
                </div>
                <Slider
                  value={[localTemperature]}
                  onValueChange={([value]) => handleParameterChange('temperature', value)}
                  max={2}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Focused (0.0)</span>
                  <span>Balanced (0.7)</span>
                  <span>Creative (2.0)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm">Max Tokens</Label>
                  <Badge variant="outline" className="text-xs">{localMaxTokens}</Badge>
                </div>
                <Slider
                  value={[localMaxTokens]}
                  onValueChange={([value]) => handleParameterChange('maxTokens', value)}
                  max={currentModelData?.maxTokens || 4096}
                  min={128}
                  step={128}
                  className="w-full"
                />
              </div>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Default models data
export const defaultModels: AIModel[] = [
  {
    id: 'zai-org/GLM-4.5-Air',
    name: 'GLM-4.5 Air',
    provider: 'Zhipu AI',
    description: 'Balanced model with strong reasoning capabilities',
    contextWindow: 128,
    maxTokens: 4096,
    capabilities: ['text', 'code', 'reasoning'],
    status: 'available',
    icon: BrainIcon
  },
  {
    id: 'microsoft/WizardLM-2-8x22B',
    name: 'WizardLM-2 8x22B',
    provider: 'Microsoft',
    description: 'Advanced conversational AI with excellent instruction following',
    contextWindow: 128,
    maxTokens: 4096,
    capabilities: ['text', 'code', 'conversation', 'analysis'],
    status: 'available',
    icon: SparklesIcon
  },
  {
    id: 'mistralai/Mistral-7B-Instruct-v0.1',
    name: 'Mistral 7B Instruct',
    provider: 'Mistral AI',
    description: 'Fast and efficient open-source model',
    contextWindow: 32,
    maxTokens: 4096,
    capabilities: ['text', 'code', 'fast'],
    status: 'available',
    icon: CpuIcon
  }
];
