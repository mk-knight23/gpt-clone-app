import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SparklesIcon,
  PlusIcon,
  EditIcon,
  Trash2Icon,
  CopyIcon,
  StarIcon,
  ClockIcon,
  TagIcon,
  SearchIcon,
  FilterIcon,
  BookOpenIcon,
  CodeIcon,
  MessageSquareIcon,
  BrainIcon,
  ZapIcon,
  SaveIcon,
  XIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: string;
  tags: string[];
  isDefault: boolean;
  isFavorite: boolean;
  usageCount: number;
  lastUsed?: Date;
  createdAt: Date;
  author?: string;
  variables?: string[]; // Dynamic variables like {{topic}}, {{language}}, etc.
}

interface PromptLibraryProps {
  currentPrompt: string;
  onPromptSelect: (prompt: string) => void;
  onPromptUpdate: (prompt: string) => void;
  className?: string;
}

const defaultPrompts: PromptTemplate[] = [
  // Creative Writing
  {
    id: 'creative-writer',
    name: 'Creative Writer',
    description: 'Helps with brainstorming, storytelling, and creative writing projects',
    prompt: 'You are a creative writing assistant. Help users with brainstorming ideas, developing characters, plotting stories, and improving their creative writing. Be imaginative, encouraging, and provide constructive feedback.',
    category: 'Creative',
    tags: ['writing', 'creativity', 'brainstorming', 'stories'],
    isDefault: true,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01'),
    author: 'System'
  },
  {
    id: 'poet',
    name: 'Poet & Lyricist',
    description: 'Specialized in poetry, lyrics, and rhythmic language',
    prompt: 'You are a master poet and lyricist. Help users create beautiful poetry, song lyrics, and rhythmic prose. Focus on imagery, metaphor, rhythm, and emotional depth.',
    category: 'Creative',
    tags: ['poetry', 'lyrics', 'rhythm', 'artistic'],
    isDefault: true,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01'),
    author: 'System'
  },

  // Technical & Programming
  {
    id: 'code-expert',
    name: 'Code Expert',
    description: 'Expert programmer for code review, debugging, and development',
    prompt: 'You are an expert software developer with deep knowledge of multiple programming languages and frameworks. Help with code review, debugging, architecture design, best practices, and explaining complex programming concepts. Always provide clear, actionable advice.',
    category: 'Technical',
    tags: ['programming', 'code', 'debugging', 'development'],
    isDefault: true,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01'),
    author: 'System'
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    description: 'Specialized in data analysis, machine learning, and statistics',
    prompt: 'You are a data science expert. Help users with data analysis, statistical modeling, machine learning algorithms, data visualization, and interpreting complex datasets. Explain concepts clearly and provide practical guidance.',
    category: 'Technical',
    tags: ['data', 'analytics', 'machine-learning', 'statistics'],
    isDefault: true,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01'),
    author: 'System'
  },

  // Business & Professional
  {
    id: 'business-consultant',
    name: 'Business Consultant',
    description: 'Strategic business advice and professional guidance',
    prompt: 'You are a seasoned business consultant. Provide strategic advice on business development, marketing, operations, finance, and leadership. Help users think through business challenges and opportunities with practical, actionable insights.',
    category: 'Business',
    tags: ['business', 'strategy', 'consulting', 'leadership'],
    isDefault: true,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01'),
    author: 'System'
  },
  {
    id: 'career-coach',
    name: 'Career Coach',
    description: 'Career development, job search, and professional growth',
    prompt: 'You are a career development coach. Help users with resume writing, job search strategies, interview preparation, career transitions, skill development, and professional growth. Provide encouraging, practical advice.',
    category: 'Business',
    tags: ['career', 'jobs', 'interview', 'professional'],
    isDefault: true,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01'),
    author: 'System'
  },

  // Educational & Learning
  {
    id: 'tutor',
    name: 'Academic Tutor',
    description: 'Educational support across various subjects and learning levels',
    prompt: 'You are an experienced academic tutor. Help students understand complex concepts, solve problems, prepare for exams, and develop effective study strategies. Explain ideas clearly and adapt to different learning styles.',
    category: 'Education',
    tags: ['teaching', 'learning', 'education', 'academic'],
    isDefault: true,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01'),
    author: 'System'
  },
  {
    id: 'language-teacher',
    name: 'Language Teacher',
    description: 'Language learning and communication skills',
    prompt: 'You are a skilled language teacher. Help users learn new languages, improve communication skills, practice conversations, understand grammar, and develop cultural awareness. Be patient and encouraging.',
    category: 'Education',
    tags: ['language', 'communication', 'grammar', 'culture'],
    isDefault: true,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01'),
    author: 'System'
  },

  // Personal & Lifestyle
  {
    id: 'life-coach',
    name: 'Life Coach',
    description: 'Personal development, motivation, and life guidance',
    prompt: 'You are a compassionate life coach. Help users with personal growth, goal setting, motivation, overcoming challenges, and finding meaning and purpose. Provide supportive, empathetic guidance.',
    category: 'Personal',
    tags: ['life', 'motivation', 'goals', 'personal-growth'],
    isDefault: true,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01'),
    author: 'System'
  },
  {
    id: 'health-wellness',
    name: 'Health & Wellness Advisor',
    description: 'General health information and wellness guidance',
    prompt: 'You are a health and wellness advisor. Provide general information about health, nutrition, fitness, and wellness. Always recommend consulting healthcare professionals for medical advice and personal health concerns.',
    category: 'Personal',
    tags: ['health', 'wellness', 'fitness', 'nutrition'],
    isDefault: true,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date('2024-01-01'),
    author: 'System'
  }
];

const categories = [
  { id: 'all', label: 'All Prompts', icon: BookOpenIcon },
  { id: 'Creative', label: 'Creative', icon: SparklesIcon },
  { id: 'Technical', label: 'Technical', icon: CodeIcon },
  { id: 'Business', label: 'Business', icon: MessageSquareIcon },
  { id: 'Education', label: 'Education', icon: BrainIcon },
  { id: 'Personal', label: 'Personal', icon: ZapIcon }
];

export function PromptLibrary({
  currentPrompt,
  onPromptSelect,
  onPromptUpdate,
  className
}: PromptLibraryProps) {
  const [prompts, setPrompts] = useState<PromptTemplate[]>(defaultPrompts);
  const [customPrompts, setCustomPrompts] = useState<PromptTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null);

  // Load custom prompts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chutes-custom-prompts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((p: Record<string, unknown>) => ({
          ...p,
          createdAt: new Date(p.createdAt as string | number | Date),
          lastUsed: p.lastUsed ? new Date(p.lastUsed as string | number | Date) : undefined
        }));
        setCustomPrompts(parsed);
      } catch (error) {
        console.error('Error loading custom prompts:', error);
      }
    }
  }, []);

  // Save custom prompts to localStorage
  useEffect(() => {
    localStorage.setItem('chutes-custom-prompts', JSON.stringify(customPrompts));
  }, [customPrompts]);

  const allPrompts = [...prompts, ...customPrompts];

  const filteredPrompts = allPrompts.filter(prompt => {
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handlePromptSelect = (prompt: PromptTemplate) => {
    onPromptSelect(prompt.prompt);

    // Update usage statistics
    if (prompt.id.startsWith('custom-')) {
      setCustomPrompts(prev => prev.map(p =>
        p.id === prompt.id
          ? { ...p, usageCount: p.usageCount + 1, lastUsed: new Date() }
          : p
      ));
    } else {
      setPrompts(prev => prev.map(p =>
        p.id === prompt.id
          ? { ...p, usageCount: p.usageCount + 1, lastUsed: new Date() }
          : p
      ));
    }

    toast({
      title: "Prompt Applied",
      description: `"${prompt.name}" has been set as your system prompt.`,
    });
  };

  const handleToggleFavorite = (promptId: string) => {
    if (promptId.startsWith('custom-')) {
      setCustomPrompts(prev => prev.map(p =>
        p.id === promptId ? { ...p, isFavorite: !p.isFavorite } : p
      ));
    } else {
      setPrompts(prev => prev.map(p =>
        p.id === promptId ? { ...p, isFavorite: !p.isFavorite } : p
      ));
    }
  };

  const handleDeleteCustomPrompt = (promptId: string) => {
    setCustomPrompts(prev => prev.filter(p => p.id !== promptId));
    toast({
      title: "Prompt Deleted",
      description: "Custom prompt has been removed.",
    });
  };

  const handleCopyPrompt = (prompt: PromptTemplate) => {
    navigator.clipboard.writeText(prompt.prompt);
    toast({
      title: "Prompt Copied",
      description: "Prompt text has been copied to clipboard.",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || BookOpenIcon;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Prompt Library</h3>
          <p className="text-sm text-muted-foreground">
            Choose from preset prompts or create your own
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="btn-primary">
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Custom Prompt</DialogTitle>
              <DialogDescription>
                Create a custom system prompt for specific use cases.
              </DialogDescription>
            </DialogHeader>
            <PromptEditor
              onSave={(prompt) => {
                const newPrompt: PromptTemplate = {
                  ...prompt,
                  id: `custom-${Date.now()}`,
                  isDefault: false,
                  usageCount: 0,
                  createdAt: new Date(),
                  author: 'User'
                };
                setCustomPrompts(prev => [newPrompt, ...prev]);
                setShowCreateDialog(false);
                toast({
                  title: "Prompt Created",
                  description: "Your custom prompt has been saved.",
                });
              }}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center">
                    <Icon className="w-4 h-4 mr-2" />
                    {category.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Current Prompt Display */}
      {currentPrompt && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <SparklesIcon className="w-4 h-4 mr-2 text-primary" />
              Current System Prompt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {currentPrompt}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Prompts Grid */}
      <ScrollArea className="h-96">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
          {filteredPrompts.map((prompt) => {
            const Icon = getCategoryIcon(prompt.category);
            const isCustom = prompt.id.startsWith('custom-');

            return (
              <Card
                key={prompt.id}
                className={cn(
                  "relative cursor-pointer transition-all duration-200 hover:shadow-md",
                  "border-border/50 hover:border-primary/30"
                )}
                onClick={() => handlePromptSelect(prompt)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4 text-primary" />
                      <CardTitle className="text-base">{prompt.name}</CardTitle>
                      {prompt.isFavorite && (
                        <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      {isCustom && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPrompt(prompt);
                            }}
                          >
                            <EditIcon className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCustomPrompt(prompt.id);
                            }}
                          >
                            <Trash2Icon className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(prompt.id);
                        }}
                      >
                        <StarIcon className={cn(
                          "w-3 h-3",
                          prompt.isFavorite ? "text-yellow-500 fill-current" : "text-muted-foreground"
                        )} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyPrompt(prompt);
                        }}
                      >
                        <CopyIcon className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <CardDescription className="line-clamp-2">
                    {prompt.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {prompt.category}
                      </Badge>
                      {prompt.usageCount > 0 && (
                        <span>{prompt.usageCount} uses</span>
                      )}
                    </div>

                    {prompt.lastUsed && (
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-3 h-3" />
                        <span>{formatDate(prompt.lastUsed)}</span>
                      </div>
                    )}
                  </div>

                  {prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {prompt.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {prompt.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{prompt.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Edit Dialog */}
      {editingPrompt && (
        <Dialog open={!!editingPrompt} onOpenChange={() => setEditingPrompt(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Prompt</DialogTitle>
              <DialogDescription>
                Modify your custom prompt.
              </DialogDescription>
            </DialogHeader>
            <PromptEditor
              initialPrompt={editingPrompt}
              onSave={(updatedPrompt) => {
                setCustomPrompts(prev => prev.map(p =>
                  p.id === editingPrompt.id ? { ...p, ...updatedPrompt } : p
                ));
                setEditingPrompt(null);
                toast({
                  title: "Prompt Updated",
                  description: "Your custom prompt has been updated.",
                });
              }}
              onCancel={() => setEditingPrompt(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Prompt Editor Component
interface PromptEditorProps {
  initialPrompt?: Partial<PromptTemplate>;
  onSave: (prompt: Omit<PromptTemplate, 'id' | 'isDefault' | 'usageCount' | 'createdAt' | 'author'>) => void;
  onCancel: () => void;
}

function PromptEditor({ initialPrompt, onSave, onCancel }: PromptEditorProps) {
  const [formData, setFormData] = useState({
    name: initialPrompt?.name || '',
    description: initialPrompt?.description || '',
    prompt: initialPrompt?.prompt || '',
    category: initialPrompt?.category || 'Personal',
    tags: initialPrompt?.tags?.join(', ') || ''
  });

  const handleSave = () => {
    if (!formData.name.trim() || !formData.prompt.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and prompt are required.",
        variant: "destructive",
      });
      return;
    }

    onSave({
      name: formData.name.trim(),
      description: formData.description.trim(),
      prompt: formData.prompt.trim(),
      category: formData.category,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      isFavorite: initialPrompt?.isFavorite || false,
      lastUsed: initialPrompt?.lastUsed
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Prompt name"
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Creative">Creative</SelectItem>
              <SelectItem value="Technical">Technical</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Personal">Personal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description of what this prompt does"
        />
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
          placeholder="writing, creative, brainstorming"
        />
      </div>

      <div>
        <Label htmlFor="prompt">System Prompt</Label>
        <Textarea
          id="prompt"
          value={formData.prompt}
          onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
          placeholder="Enter your system prompt here..."
          className="min-h-[200px]"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="btn-primary">
          <SaveIcon className="w-4 h-4 mr-2" />
          Save Prompt
        </Button>
      </div>
    </div>
  );
}
