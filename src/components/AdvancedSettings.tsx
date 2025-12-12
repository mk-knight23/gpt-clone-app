import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  SettingsIcon, 
  ThermometerIcon, 
  TypeIcon, 
  MessageSquareIcon, 
  ZapIcon,
  XIcon,
  RotateCcwIcon,
  SaveIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatSettings {
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  streamResponses: boolean;
}

interface AdvancedSettingsProps {
  settings: ChatSettings;
  onUpdate: (settings: Partial<ChatSettings>) => void;
  onClose: () => void;
}

export function AdvancedSettings({ settings, onUpdate, onClose }: AdvancedSettingsProps) {
  const [localSettings, setLocalSettings] = useState<ChatSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (key: keyof ChatSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate(localSettings);
    setHasChanges(false);
  };

  const handleReset = () => {
    const defaultSettings: ChatSettings = {
      temperature: 0.7,
      maxTokens: 1024,
      systemPrompt: "",
      streamResponses: true
    };
    setLocalSettings(defaultSettings);
    setHasChanges(true);
  };

  const presetPrompts = [
    {
      name: "Creative Assistant",
      prompt: "You are a creative and imaginative assistant. Help users with brainstorming, storytelling, and creative projects.",
      tags: ["creative", "brainstorming"]
    },
    {
      name: "Code Expert",
      prompt: "You are an expert programmer. Help with code review, debugging, and explaining programming concepts.",
      tags: ["programming", "code"]
    },
    {
      name: "Research Analyst",
      prompt: "You are a research analyst. Provide detailed, factual information and help analyze complex topics.",
      tags: ["research", "analysis"]
    },
    {
      name: "Friendly Helper",
      prompt: "You are a friendly and helpful assistant. Be conversational, supportive, and encouraging.",
      tags: ["friendly", "support"]
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SettingsIcon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Advanced Settings</h3>
          {hasChanges && (
            <Badge variant="outline" className="text-orange-400 border-orange-400">
              Unsaved changes
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="glass-hover"
          >
            <RotateCcwIcon className="w-4 h-4 mr-1" />
            Reset
          </Button>
          
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges}
            className="btn-primary"
          >
            <SaveIcon className="w-4 h-4 mr-1" />
            Save
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="glass-hover"
          >
            <XIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 glass-card">
          <TabsTrigger value="general" className="flex items-center space-x-1">
            <SettingsIcon className="w-4 h-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="model" className="flex items-center space-x-1">
            <TypeIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Model</span>
          </TabsTrigger>
          <TabsTrigger value="prompt" className="flex items-center space-x-1">
            <MessageSquareIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Prompt</span>
          </TabsTrigger>
          <TabsTrigger value="presets" className="flex items-center space-x-1">
            <ZapIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Presets</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ZapIcon className="w-5 h-5 text-primary" />
                <span>Response Settings</span>
              </CardTitle>
              <CardDescription>
                Configure how the AI generates responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Streaming Responses */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Streaming Responses</Label>
                  <p className="text-xs text-muted-foreground">
                    Show responses as they're generated in real-time
                  </p>
                </div>
                <Switch
                  checked={localSettings.streamResponses}
                  onCheckedChange={(checked) => 
                    handleSettingChange('streamResponses', checked)
                  }
                />
              </div>

              {/* Max Tokens */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Max Tokens</Label>
                  <Badge variant="outline">{localSettings.maxTokens}</Badge>
                </div>
                <Slider
                  value={[localSettings.maxTokens]}
                  onValueChange={([value]) => handleSettingChange('maxTokens', value)}
                  max={4096}
                  min={128}
                  step={128}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum length of AI responses (higher = longer responses)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="model" className="space-y-4 mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ThermometerIcon className="w-5 h-5 text-primary" />
                <span>Model Parameters</span>
              </CardTitle>
              <CardDescription>
                Fine-tune AI behavior and creativity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Temperature */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Temperature</Label>
                  <Badge variant="outline">{localSettings.temperature}</Badge>
                </div>
                <Slider
                  value={[localSettings.temperature]}
                  onValueChange={([value]) => handleSettingChange('temperature', value)}
                  max={2}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Focused (0.0)</span>
                  <span>Balanced (0.7)</span>
                  <span>Creative (2.0)</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Controls randomness in responses (lower = more focused, higher = more creative)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompt" className="space-y-4 mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquareIcon className="w-5 h-5 text-primary" />
                <span>System Prompt</span>
              </CardTitle>
              <CardDescription>
                Define how the AI should behave and respond
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter a system prompt to guide the AI's behavior..."
                value={localSettings.systemPrompt}
                onChange={(e) => handleSettingChange('systemPrompt', e.target.value)}
                className="min-h-[120px] input-glass"
              />
              <p className="text-xs text-muted-foreground">
                This prompt will be sent before each conversation to set the AI's personality and behavior.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presets" className="space-y-4 mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ZapIcon className="w-5 h-5 text-primary" />
                <span>Prompt Presets</span>
              </CardTitle>
              <CardDescription>
                Quick-start prompts for different use cases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {presetPrompts.map((preset, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer glass-hover"
                  onClick={() => handleSettingChange('systemPrompt', preset.prompt)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">{preset.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {preset.prompt}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {preset.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}