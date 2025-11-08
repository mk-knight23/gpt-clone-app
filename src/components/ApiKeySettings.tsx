import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SettingsIcon, EyeIcon, EyeOffIcon, KeyIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function ApiKeySettings() {
  const [apiToken, setApiToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load API token from localStorage on component mount
    const savedToken = localStorage.getItem('chutes-api-token');
    if (savedToken) {
      setApiToken(savedToken);
    }
  }, []);

  const handleSave = () => {
    if (!apiToken.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API token.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('chutes-api-token', apiToken);
    setIsOpen(false);
    toast({
      title: "Success",
      description: "CHUTES API token saved successfully!",
    });
  };

  const handleClear = () => {
    localStorage.removeItem('chutes-api-token');
    setApiToken("");
    toast({
      title: "API Token Cleared",
      description: "Your CHUTES API token has been removed.",
    });
  };

  const hasLocalToken = localStorage.getItem('chutes-api-token');
  const hasEnvToken = import.meta.env.VITE_CHUTES_API_TOKEN;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center space-x-2 ${
            (hasLocalToken || hasEnvToken) ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <KeyIcon className="w-4 h-4" />
          <span>
            {hasLocalToken ? 'API Token Set' : hasEnvToken ? 'Using Server Token' : 'Set API Token'}
          </span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5" />
            <span>CHUTES API Settings</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Status Display */}
          <div className="bg-muted/50 p-3 rounded-lg space-y-2">
            <h4 className="text-sm font-medium">Current Configuration:</h4>
            <div className="text-xs space-y-1">
              {hasLocalToken && (
                <div className="flex items-center space-x-2 text-green-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Local browser storage (active)</span>
                </div>
              )}
              {hasEnvToken && !hasLocalToken && (
                <div className="flex items-center space-x-2 text-blue-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Server environment (active)</span>
                </div>
              )}
              {!hasLocalToken && !hasEnvToken && (
                <div className="flex items-center space-x-2 text-red-700">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>No API token configured</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-token">CHUTES API Token (Local Storage)</Label>
            <div className="relative">
              <Input
                id="api-token"
                type={showToken ? "text" : "password"}
                placeholder="Enter your CHUTES API token..."
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Stored locally in your browser. Takes priority over server environment.
            </p>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg space-y-2">
            <h4 className="text-sm font-medium text-amber-900">Server Deployment:</h4>
            <p className="text-xs text-amber-800">
              For server-side deployment, set <code className="bg-amber-200 px-1 rounded">VITE_CHUTES_API_TOKEN</code> 
              in your <code className="bg-amber-200 px-1 rounded">.env</code> file.
            </p>
            <p className="text-xs text-amber-800">
              Local storage takes precedence over environment variables.
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="text-sm font-medium">How to get your CHUTES API Token:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Visit <a href="https://chutes.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">chutes.ai</a></li>
              <li>Create a free account or sign in</li>
              <li>Navigate to your API settings or dashboard</li>
              <li>Copy your API token and paste it above</li>
            </ol>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <h4 className="text-sm font-medium text-blue-900">Available Free Models:</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li><strong>GLM 4.5 Air</strong> (zai-org) - Most popular</li>
              <li><strong>Gemma 3 4B</strong> - Google model</li>
              <li><strong>LongCat Flash Chat</strong> - Meituan</li>
              <li><strong>GPT OSS 20B</strong> - OpenAI compatible</li>
              <li><strong>Tongyi DeepResearch 30B</strong> - Alibaba</li>
            </ul>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleSave} className="flex-1">
              Save API Token
            </Button>
            {hasLocalToken && (
              <Button onClick={handleClear} variant="outline">
                Clear
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
