import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { PromptLibrary } from "@/components/PromptLibrary";
import { ChatCategories, defaultCategories } from "@/components/ChatCategories";
import { FolderIcon } from "lucide-react";
import {
  SettingsIcon,
  PaletteIcon,
  BrainIcon,
  MessageSquareIcon,
  ZapIcon,
  ShieldIcon,
  DatabaseIcon,
  KeyIcon,
  MonitorIcon,
  SaveIcon,
  RotateCcwIcon,
  DownloadIcon,
  UploadIcon,
  Trash2Icon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  UnlockIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XIcon,
  SparklesIcon,
  MoonIcon,
  SunIcon,
  MonitorSpeakerIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

// Comprehensive Settings Interface
export interface AppSettings {
  // General Settings
  general: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    soundEnabled: boolean;
    hapticFeedback: boolean;
    autoSave: boolean;
    compactMode: boolean;
  };

  // Appearance Settings
  appearance: {
    primaryColor: string;
    accentColor: string;
    glassmorphism: boolean;
    glowEffects: boolean;
    animations: boolean;
    fontSize: 'small' | 'medium' | 'large';
    density: 'compact' | 'comfortable' | 'cozy';
    sidebarPosition: 'left' | 'right';
    messageBubbles: boolean;
  };

  // AI Models Settings
  models: {
    defaultModel: string;
    availableModels: string[];
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
    streaming: boolean;
    autoSwitchModel: boolean;
    modelComparison: boolean;
  };

  // Chat Behavior Settings
  chat: {
    systemPrompt: string;
    memoryEnabled: boolean;
    contextWindow: number;
    autoComplete: boolean;
    spellCheck: boolean;
    messageHistory: number;
    typingIndicators: boolean;
    readReceipts: boolean;
    messageReactions: boolean;
  };

  // System Prompts Library
  prompts: {
    presets: Array<{
      id: string;
      name: string;
      description: string;
      prompt: string;
      category: string;
      tags: string[];
      isDefault: boolean;
    }>;
    custom: Array<{
      id: string;
      name: string;
      prompt: string;
      category: string;
      createdAt: Date;
      lastUsed?: Date;
    }>;
  };

  // Data & Storage Settings
  data: {
    localStorage: boolean;
    indexedDB: boolean;
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    exportFormat: 'json' | 'markdown' | 'html';
    dataRetention: number; // days
    compression: boolean;
    encryption: boolean;
  };

  // Security & Privacy Settings
  security: {
    rateLimiting: boolean;
    contentFiltering: boolean;
    dataEncryption: boolean;
    sessionTimeout: number;
    twoFactorAuth: boolean;
    biometricAuth: boolean;
    analyticsEnabled: boolean;
    errorReporting: boolean;
    ipLogging: boolean;
  };

  // Developer Tools
  developer: {
    debugMode: boolean;
    performanceMonitoring: boolean;
    apiLogging: boolean;
    featureFlags: Record<string, boolean>;
    experimentalFeatures: boolean;
    consoleLogging: boolean;
    networkInspector: boolean;
  };
}

interface SettingsDashboardProps {
  settings: AppSettings;
  onUpdate: (settings: Partial<AppSettings>) => void;
  onClose: () => void;
  onExport?: () => void;
  onImport?: (file: File) => void;
  onReset?: () => void;
}

export function SettingsDashboard({
  settings,
  onUpdate,
  onClose,
  onExport,
  onImport,
  onReset
}: SettingsDashboardProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  // Track changes
  useEffect(() => {
    const hasUnsavedChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);
    setHasChanges(hasUnsavedChanges);
  }, [localSettings, settings]);

  const updateSetting = (category: keyof AppSettings, key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    onUpdate(localSettings);
    setHasChanges(false);
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleReset = () => {
    const defaultSettings: AppSettings = {
      general: {
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/dd/yyyy',
        timeFormat: '12h',
        soundEnabled: true,
        hapticFeedback: true,
        autoSave: true,
        compactMode: false
      },
      appearance: {
        primaryColor: '#3b82f6',
        accentColor: '#10b981',
        glassmorphism: true,
        glowEffects: true,
        animations: true,
        fontSize: 'medium',
        density: 'comfortable',
        sidebarPosition: 'left',
        messageBubbles: true
      },
      models: {
        defaultModel: 'zai-org/GLM-4.5-Air',
        availableModels: ['zai-org/GLM-4.5-Air', 'microsoft/WizardLM-2-8x22B', 'mistralai/Mistral-7B-Instruct-v0.1'],
        temperature: 0.7,
        maxTokens: 1024,
        topP: 0.9,
        frequencyPenalty: 0,
        presencePenalty: 0,
        streaming: true,
        autoSwitchModel: false,
        modelComparison: false
      },
      chat: {
        systemPrompt: '',
        memoryEnabled: true,
        contextWindow: 4096,
        autoComplete: true,
        spellCheck: true,
        messageHistory: 100,
        typingIndicators: true,
        readReceipts: false,
        messageReactions: true
      },
      prompts: {
        presets: [
          {
            id: 'creative',
            name: 'Creative Assistant',
            description: 'Helps with brainstorming and creative tasks',
            prompt: 'You are a creative and imaginative assistant. Help users with brainstorming, storytelling, and creative projects.',
            category: 'Creative',
            tags: ['creative', 'brainstorming'],
            isDefault: false
          },
          {
            id: 'coding',
            name: 'Code Expert',
            description: 'Specialized in programming and development',
            prompt: 'You are an expert programmer. Help with code review, debugging, and explaining programming concepts.',
            category: 'Technical',
            tags: ['programming', 'code'],
            isDefault: false
          }
        ],
        custom: []
      },
      data: {
        localStorage: true,
        indexedDB: true,
        autoBackup: true,
        backupFrequency: 'weekly',
        exportFormat: 'json',
        dataRetention: 365,
        compression: true,
        encryption: false
      },
      security: {
        rateLimiting: true,
        contentFiltering: true,
        dataEncryption: false,
        sessionTimeout: 60,
        twoFactorAuth: false,
        biometricAuth: false,
        analyticsEnabled: true,
        errorReporting: true,
        ipLogging: false
      },
      developer: {
        debugMode: false,
        performanceMonitoring: true,
        apiLogging: false,
        featureFlags: {},
        experimentalFeatures: false,
        consoleLogging: true,
        networkInspector: false
      }
    };

    setLocalSettings(defaultSettings);
    setHasChanges(true);
    setShowResetDialog(false);
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      const dataStr = JSON.stringify(localSettings, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = 'chutes-settings.json';

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
    setShowExportDialog(false);
  };

  const handleImport = () => {
    if (importFile && onImport) {
      onImport(importFile);
    }
    setImportFile(null);
  };

  const categories = [
    { id: 'general', label: 'General', icon: SettingsIcon, color: 'text-blue-500' },
    { id: 'appearance', label: 'Appearance', icon: PaletteIcon, color: 'text-purple-500' },
    { id: 'models', label: 'AI Models', icon: BrainIcon, color: 'text-green-500' },
    { id: 'chat', label: 'Chat Behavior', icon: MessageSquareIcon, color: 'text-orange-500' },
    { id: 'prompts', label: 'Prompt Library', icon: SparklesIcon, color: 'text-pink-500' },
    { id: 'categories', label: 'Chat Categories', icon: FolderIcon, color: 'text-indigo-500' },
    { id: 'data', label: 'Data & Storage', icon: DatabaseIcon, color: 'text-cyan-500' },
    { id: 'security', label: 'Security', icon: ShieldIcon, color: 'text-red-500' },
    { id: 'developer', label: 'Developer', icon: MonitorIcon, color: 'text-gray-500' }
  ];

  return (
    <div className="flex h-[80vh] max-h-[800px] bg-background/95 backdrop-blur-sm border rounded-xl shadow-2xl">
      {/* Sidebar */}
      <div className="w-64 border-r border-border/50 bg-muted/30">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Settings</h2>
            {hasChanges && (
              <Badge variant="outline" className="text-orange-400 border-orange-400">
                Unsaved
              </Badge>
            )}
          </div>
        </div>

        <ScrollArea className="h-full">
          <div className="p-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={activeTab === category.id ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start mb-1",
                    activeTab === category.id && "bg-primary/10 text-primary"
                  )}
                  onClick={() => setActiveTab(category.id)}
                >
                  <Icon className={cn("w-4 h-4 mr-2", category.color)} />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="p-4 border-t border-border/50 space-y-2">
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            className="w-full btn-primary"
          >
            <SaveIcon className="w-4 h-4 mr-2" />
            Save Changes
          </Button>

          <div className="flex space-x-2">
            <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <RotateCcwIcon className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset Settings</DialogTitle>
                  <DialogDescription>
                    This will reset all settings to their default values. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowResetDialog(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleReset}>
                    Reset All
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <DownloadIcon className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export Settings</DialogTitle>
                  <DialogDescription>
                    Download your current settings as a JSON file for backup or sharing.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end">
                  <Button onClick={handleExport}>
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Button variant="outline" onClick={onClose} className="w-full">
            <XIcon className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">General Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Theme</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Select
                          value={localSettings.general.theme}
                          onValueChange={(value: 'light' | 'dark' | 'system') =>
                            updateSetting('general', 'theme', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">
                              <div className="flex items-center">
                                <SunIcon className="w-4 h-4 mr-2" />
                                Light
                              </div>
                            </SelectItem>
                            <SelectItem value="dark">
                              <div className="flex items-center">
                                <MoonIcon className="w-4 h-4 mr-2" />
                                Dark
                              </div>
                            </SelectItem>
                            <SelectItem value="system">
                              <div className="flex items-center">
                                <MonitorSpeakerIcon className="w-4 h-4 mr-2" />
                                System
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Interface</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Compact Mode</Label>
                          <Switch
                            checked={localSettings.general.compactMode}
                            onCheckedChange={(checked) =>
                              updateSetting('general', 'compactMode', checked)
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Auto-save</Label>
                          <Switch
                            checked={localSettings.general.autoSave}
                            onCheckedChange={(checked) =>
                              updateSetting('general', 'autoSave', checked)
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Appearance & Styling</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Visual Effects</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Glassmorphism</Label>
                          <Switch
                            checked={localSettings.appearance.glassmorphism}
                            onCheckedChange={(checked) =>
                              updateSetting('appearance', 'glassmorphism', checked)
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Glow Effects</Label>
                          <Switch
                            checked={localSettings.appearance.glowEffects}
                            onCheckedChange={(checked) =>
                              updateSetting('appearance', 'glowEffects', checked)
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Animations</Label>
                          <Switch
                            checked={localSettings.appearance.animations}
                            onCheckedChange={(checked) =>
                              updateSetting('appearance', 'animations', checked)
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Layout</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Density</Label>
                          <Select
                            value={localSettings.appearance.density}
                            onValueChange={(value: 'compact' | 'comfortable' | 'cozy') =>
                              updateSetting('appearance', 'density', value)
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="compact">Compact</SelectItem>
                              <SelectItem value="comfortable">Comfortable</SelectItem>
                              <SelectItem value="cozy">Cozy</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Font Size</Label>
                          <Select
                            value={localSettings.appearance.fontSize}
                            onValueChange={(value: 'small' | 'medium' | 'large') =>
                              updateSetting('appearance', 'fontSize', value)
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* AI Models Settings */}
            {activeTab === 'models' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">AI Model Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Model Selection</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Default Model</Label>
                          <Select
                            value={localSettings.models.defaultModel}
                            onValueChange={(value) =>
                              updateSetting('models', 'defaultModel', value)
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {localSettings.models.availableModels.map((model) => (
                                <SelectItem key={model} value={model}>
                                  {model}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Model Comparison Mode</Label>
                          <Switch
                            checked={localSettings.models.modelComparison}
                            onCheckedChange={(checked) =>
                              updateSetting('models', 'modelComparison', checked)
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Model Parameters</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label className="text-sm font-medium">Temperature</Label>
                            <Badge variant="outline">{localSettings.models.temperature}</Badge>
                          </div>
                          <Slider
                            value={[localSettings.models.temperature]}
                            onValueChange={([value]) =>
                              updateSetting('models', 'temperature', value)
                            }
                            max={2}
                            min={0}
                            step={0.1}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label className="text-sm font-medium">Max Tokens</Label>
                            <Badge variant="outline">{localSettings.models.maxTokens}</Badge>
                          </div>
                          <Slider
                            value={[localSettings.models.maxTokens]}
                            onValueChange={([value]) =>
                              updateSetting('models', 'maxTokens', value)
                            }
                            max={4096}
                            min={128}
                            step={128}
                            className="w-full"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Behavior Settings */}
            {activeTab === 'chat' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Chat Behavior</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">System Prompt</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          placeholder="Enter a system prompt to guide AI behavior..."
                          value={localSettings.chat.systemPrompt}
                          onChange={(e) =>
                            updateSetting('chat', 'systemPrompt', e.target.value)
                          }
                          className="min-h-[100px]"
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Chat Features</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Memory Enabled</Label>
                          <Switch
                            checked={localSettings.chat.memoryEnabled}
                            onCheckedChange={(checked) =>
                              updateSetting('chat', 'memoryEnabled', checked)
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Typing Indicators</Label>
                          <Switch
                            checked={localSettings.chat.typingIndicators}
                            onCheckedChange={(checked) =>
                              updateSetting('chat', 'typingIndicators', checked)
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Message Reactions</Label>
                          <Switch
                            checked={localSettings.chat.messageReactions}
                            onCheckedChange={(checked) =>
                              updateSetting('chat', 'messageReactions', checked)
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Prompt Library */}
            {activeTab === 'prompts' && (
              <div className="space-y-6">
                <PromptLibrary
                  currentPrompt={localSettings.chat.systemPrompt}
                  onPromptSelect={(prompt) => updateSetting('chat', 'systemPrompt', prompt)}
                  onPromptUpdate={(prompt) => updateSetting('chat', 'systemPrompt', prompt)}
                />
              </div>
            )}

            {/* Chat Categories */}
            {activeTab === 'categories' && (
              <div className="space-y-6">
                <ChatCategories
                  categories={defaultCategories}
                  selectedCategory={null}
                  onCategorySelect={(categoryId: string | null) => {
                    // Handle category selection
                    console.log('Selected category:', categoryId);
                  }}
                  onCategoryCreate={(category) => {
                    // Handle category creation
                    console.log('Creating category:', category);
                  }}
                  onCategoryUpdate={(categoryId, updates) => {
                    // Handle category updates
                    console.log('Updating category:', categoryId, updates);
                  }}
                  onCategoryDelete={(categoryId) => {
                    // Handle category deletion
                    console.log('Deleting category:', categoryId);
                  }}
                />
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Security & Privacy</h3>
                  <Alert>
                    <ShieldIcon className="h-4 w-4" />
                    <AlertDescription>
                      These settings help protect your data and ensure secure communication.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Data Protection</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Rate Limiting</Label>
                          <Switch
                            checked={localSettings.security.rateLimiting}
                            onCheckedChange={(checked) =>
                              updateSetting('security', 'rateLimiting', checked)
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Content Filtering</Label>
                          <Switch
                            checked={localSettings.security.contentFiltering}
                            onCheckedChange={(checked) =>
                              updateSetting('security', 'contentFiltering', checked)
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Data Encryption</Label>
                          <Switch
                            checked={localSettings.security.dataEncryption}
                            onCheckedChange={(checked) =>
                              updateSetting('security', 'dataEncryption', checked)
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Privacy</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Analytics</Label>
                          <Switch
                            checked={localSettings.security.analyticsEnabled}
                            onCheckedChange={(checked) =>
                              updateSetting('security', 'analyticsEnabled', checked)
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Error Reporting</Label>
                          <Switch
                            checked={localSettings.security.errorReporting}
                            onCheckedChange={(checked) =>
                              updateSetting('security', 'errorReporting', checked)
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>IP Logging</Label>
                          <Switch
                            checked={localSettings.security.ipLogging}
                            onCheckedChange={(checked) =>
                              updateSetting('security', 'ipLogging', checked)
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Developer Settings */}
            {activeTab === 'developer' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Developer Tools</h3>
                  <Alert>
                    <AlertTriangleIcon className="h-4 w-4" />
                    <AlertDescription>
                      These settings are intended for developers and may affect app stability.
                    </AlertDescription>
                  </Alert>

                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="text-base">Debug Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Debug Mode</Label>
                        <Switch
                          checked={localSettings.developer.debugMode}
                          onCheckedChange={(checked) =>
                            updateSetting('developer', 'debugMode', checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>API Logging</Label>
                        <Switch
                          checked={localSettings.developer.apiLogging}
                          onCheckedChange={(checked) =>
                            updateSetting('developer', 'apiLogging', checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Performance Monitoring</Label>
                        <Switch
                          checked={localSettings.developer.performanceMonitoring}
                          onCheckedChange={(checked) =>
                            updateSetting('developer', 'performanceMonitoring', checked)
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
