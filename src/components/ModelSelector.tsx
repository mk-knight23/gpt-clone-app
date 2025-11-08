import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SettingsIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Model {
  id: string;
  name: string;
  provider: string;
  description: string;
  runs: string;
  status: string;
}

const AVAILABLE_MODELS: Model[] = [
  {
    id: "unsloth/gemma-3-4b-it",
    name: "Gemma 3 4B It",
    provider: "Unsloth",
    description: "Google's latest Gemma model optimized for instruction following",
    runs: "2.65M",
    status: "Free"
  },
  {
    id: "zai-org/GLM-4.5-Air",
    name: "GLM 4.5 Air",
    provider: "Zai Org",
    description: "Most popular model, high performance and reliability",
    runs: "3.22M",
    status: "Free"
  },
  {
    id: "meituan-longcat/LongCat-Flash-Chat-FP8",
    name: "LongCat Flash Chat FP8",
    provider: "Meituan Longcat",
    description: "Fast inference with excellent performance",
    runs: "603.88K",
    status: "Free"
  },
  {
    id: "openai/gpt-oss-20b",
    name: "GPT OSS 20B",
    provider: "OpenAI",
    description: "OpenAI compatible model, familiar API structure",
    runs: "267.86K",
    status: "Free"
  },
  {
    id: "alibaba-nlp/Tongyi-DeepResearch-30B-A3B",
    name: "Tongyi DeepResearch 30B A3B",
    provider: "Alibaba NLP",
    description: "Research-focused model with deep analysis capabilities",
    runs: "144.13K",
    status: "Free"
  }
];

export function ModelSelector() {
  const [selectedModel, setSelectedModel] = useState<string>("zai-org/GLM-4.5-Air");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedModel = localStorage.getItem('selected-model');
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);

  const handleModelChange = (modelId: string) => {
    console.log('Model changed to:', modelId); // Debug log
    setSelectedModel(modelId);
    localStorage.setItem('selected-model', modelId);
    
    // Force a page reload to ensure the change takes effect
    // This ensures the new model is used in API calls
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const currentModel = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[1];

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Label className="text-sm font-medium text-sidebar-foreground">Model</Label>
        <div className="w-2 h-2 bg-primary rounded-full"></div>
      </div>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between h-8 text-xs bg-sidebar-accent border-sidebar-border"
          >
            <span className="truncate">{currentModel.name}</span>
            <SettingsIcon className="w-3 h-3 ml-2 flex-shrink-0" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <SettingsIcon className="w-5 h-5" />
              <span>Select AI Model</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="model-select">Available Free Models</Label>
              <Select value={selectedModel} onValueChange={handleModelChange}>
                <SelectTrigger id="model-select" className="w-full">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col w-full">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{model.name}</span>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-600">{model.status}</span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {model.provider} • {model.runs} runs
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current Model Info */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h4 className="text-sm font-medium">Current Model</h4>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{currentModel.name}</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {currentModel.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{currentModel.description}</p>
                <div className="text-xs text-muted-foreground">
                  Provider: {currentModel.provider} • {currentModel.runs} total runs
                </div>
                <div className="text-xs font-mono bg-gray-100 p-2 rounded mt-2">
                  Model ID: {currentModel.id}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <h4 className="text-sm font-medium text-blue-900">About Free Models</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• All models are completely free to use</li>
                <li>• No usage limits or restrictions</li>
                <li>• Different models excel at different tasks</li>
                <li>• You can switch models anytime</li>
                <li>• Page will reload after selection to apply changes</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { AVAILABLE_MODELS };
export type { Model };
