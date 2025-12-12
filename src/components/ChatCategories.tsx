import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  FolderIcon,
  PlusIcon,
  EditIcon,
  Trash2Icon,
  TagIcon,
  MessageSquareIcon,
  CodeIcon,
  SearchIcon,
  BrainIcon,
  PaletteIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  HeartIcon,
  ZapIcon,
  SaveIcon,
  XIcon,
  CheckIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export interface ChatCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  isDefault: boolean;
  chatCount: number;
  createdAt: Date;
  systemPrompt?: string;
  model?: string;
}

interface ChatCategoriesProps {
  categories: ChatCategory[];
  selectedCategory?: string;
  onCategorySelect: (categoryId: string | null) => void;
  onCategoryCreate: (category: Omit<ChatCategory, 'id' | 'chatCount' | 'createdAt'>) => void;
  onCategoryUpdate: (categoryId: string, updates: Partial<ChatCategory>) => void;
  onCategoryDelete: (categoryId: string) => void;
  className?: string;
}

const defaultCategories: ChatCategory[] = [
  {
    id: 'general',
    name: 'General',
    description: 'General conversations and everyday chat',
    color: '#3b82f6',
    icon: 'MessageSquareIcon',
    isDefault: true,
    chatCount: 0,
    createdAt: new Date('2024-01-01'),
    systemPrompt: 'You are a helpful and friendly AI assistant. Provide clear, accurate, and engaging responses to user questions and requests.'
  },
  {
    id: 'coding',
    name: 'Coding',
    description: 'Programming, development, and technical discussions',
    color: '#10b981',
    icon: 'CodeIcon',
    isDefault: true,
    chatCount: 0,
    createdAt: new Date('2024-01-01'),
    systemPrompt: 'You are an expert software developer with deep knowledge of multiple programming languages and frameworks. Help with code review, debugging, architecture design, best practices, and explaining complex programming concepts. Always provide clear, actionable advice.',
    model: 'zai-org/GLM-4.5-Air'
  },
  {
    id: 'research',
    name: 'Research',
    description: 'Academic research, analysis, and information gathering',
    color: '#8b5cf6',
    icon: 'BrainIcon',
    isDefault: true,
    chatCount: 0,
    createdAt: new Date('2024-01-01'),
    systemPrompt: 'You are a research analyst and academic expert. Provide detailed, factual information and help analyze complex topics. Cite sources when possible and maintain academic rigor in your responses.',
    model: 'microsoft/WizardLM-2-8x22B'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Writing, art, design, and creative projects',
    color: '#f59e0b',
    icon: 'PaletteIcon',
    isDefault: true,
    chatCount: 0,
    createdAt: new Date('2024-01-01'),
    systemPrompt: 'You are a creative writing and artistic assistant. Help users with brainstorming, storytelling, character development, poetry, and creative projects. Be imaginative and encouraging.'
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Business strategy, marketing, and professional advice',
    color: '#ef4444',
    icon: 'BriefcaseIcon',
    isDefault: true,
    chatCount: 0,
    createdAt: new Date('2024-01-01'),
    systemPrompt: 'You are a seasoned business consultant. Provide strategic advice on business development, marketing, operations, finance, and leadership. Help users think through business challenges and opportunities with practical, actionable insights.'
  },
  {
    id: 'education',
    name: 'Education',
    description: 'Learning, teaching, and educational content',
    color: '#06b6d4',
    icon: 'GraduationCapIcon',
    isDefault: true,
    chatCount: 0,
    createdAt: new Date('2024-01-01'),
    systemPrompt: 'You are an experienced educator and tutor. Help students understand complex concepts, solve problems, prepare for exams, and develop effective study strategies. Explain ideas clearly and adapt to different learning styles.'
  },
  {
    id: 'personal',
    name: 'Personal',
    description: 'Personal development, lifestyle, and self-improvement',
    color: '#ec4899',
    icon: 'HeartIcon',
    isDefault: true,
    chatCount: 0,
    createdAt: new Date('2024-01-01'),
    systemPrompt: 'You are a compassionate life coach and personal development advisor. Help users with personal growth, goal setting, motivation, overcoming challenges, and finding meaning and purpose. Provide supportive, empathetic guidance.'
  }
];

const categoryIcons = {
  MessageSquareIcon,
  CodeIcon,
  BrainIcon,
  PaletteIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  HeartIcon,
  ZapIcon,
  FolderIcon
};

const categoryColors = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#84cc16', // lime
  '#f97316', // orange
  '#6366f1', // indigo
];

export function ChatCategories({
  categories,
  selectedCategory,
  onCategorySelect,
  onCategoryCreate,
  onCategoryUpdate,
  onCategoryDelete,
  className
}: ChatCategoriesProps) {
  const [localCategories, setLocalCategories] = useState<ChatCategory[]>(categories);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ChatCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  const filteredCategories = localCategories.filter(category =>
    !searchQuery ||
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategorySelect = (categoryId: string | null) => {
    onCategorySelect(categoryId);
  };

  const handleCreateCategory = (categoryData: Omit<ChatCategory, 'id' | 'chatCount' | 'createdAt'>) => {
    const newCategory: ChatCategory = {
      ...categoryData,
      id: `category-${Date.now()}`,
      chatCount: 0,
      createdAt: new Date()
    };

    onCategoryCreate(categoryData);
    setLocalCategories(prev => [...prev, newCategory]);
    setShowCreateDialog(false);

    toast({
      title: "Category Created",
      description: `"${newCategory.name}" category has been created.`,
    });
  };

  const handleUpdateCategory = (categoryId: string, updates: Partial<ChatCategory>) => {
    onCategoryUpdate(categoryId, updates);
    setLocalCategories(prev => prev.map(cat =>
      cat.id === categoryId ? { ...cat, ...updates } : cat
    ));
    setEditingCategory(null);

    toast({
      title: "Category Updated",
      description: "Category has been updated successfully.",
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = localCategories.find(c => c.id === categoryId);
    if (category?.isDefault) {
      toast({
        title: "Cannot Delete",
        description: "Default categories cannot be deleted.",
        variant: "destructive",
      });
      return;
    }

    onCategoryDelete(categoryId);
    setLocalCategories(prev => prev.filter(cat => cat.id !== categoryId));

    if (selectedCategory === categoryId) {
      onCategorySelect(null);
    }

    toast({
      title: "Category Deleted",
      description: "Category has been removed.",
    });
  };

  const getCategoryIcon = (iconName: string) => {
    return categoryIcons[iconName as keyof typeof categoryIcons] || FolderIcon;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Chat Categories</h3>
          <p className="text-sm text-muted-foreground">
            Organize your conversations by topic
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="btn-primary">
              <PlusIcon className="w-4 h-4 mr-2" />
              New Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Category</DialogTitle>
              <DialogDescription>
                Create a new category to organize your chats.
              </DialogDescription>
            </DialogHeader>
            <CategoryEditor
              onSave={handleCreateCategory}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* All Categories Button */}
      <Button
        variant={selectedCategory === null ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start",
          selectedCategory === null && "bg-primary/10 text-primary"
        )}
        onClick={() => handleCategorySelect(null)}
      >
        <FolderIcon className="w-4 h-4 mr-2" />
        All Chats
        <Badge variant="outline" className="ml-auto">
          {localCategories.reduce((sum, cat) => sum + cat.chatCount, 0)}
        </Badge>
      </Button>

      {/* Categories List */}
      <ScrollArea className="h-96">
        <div className="space-y-2 pr-4">
          {filteredCategories.map((category) => {
            const Icon = getCategoryIcon(category.icon);

            return (
              <Card
                key={category.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md",
                  selectedCategory === category.id && "ring-2 ring-primary border-primary"
                )}
                onClick={() => handleCategorySelect(category.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: category.color + '20' }}
                      >
                        <Icon
                          className="w-4 h-4"
                          style={{ color: category.color }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-sm truncate">
                            {category.name}
                          </h4>
                          {category.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {category.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {category.chatCount}
                      </Badge>

                      {!category.isDefault && (
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCategory(category);
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
                              handleDeleteCategory(category.id);
                            }}
                          >
                            <Trash2Icon className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Edit Dialog */}
      {editingCategory && (
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>
                Modify the category settings.
              </DialogDescription>
            </DialogHeader>
            <CategoryEditor
              initialCategory={editingCategory}
              onSave={(updates) => handleUpdateCategory(editingCategory.id, updates)}
              onCancel={() => setEditingCategory(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Category Editor Component
interface CategoryEditorProps {
  initialCategory?: Partial<ChatCategory>;
  onSave: (category: Omit<ChatCategory, 'id' | 'chatCount' | 'createdAt'>) => void;
  onCancel: () => void;
}

function CategoryEditor({ initialCategory, onSave, onCancel }: CategoryEditorProps) {
  const [formData, setFormData] = useState({
    name: initialCategory?.name || '',
    description: initialCategory?.description || '',
    color: initialCategory?.color || categoryColors[0],
    icon: initialCategory?.icon || 'FolderIcon',
    systemPrompt: initialCategory?.systemPrompt || '',
    model: initialCategory?.model || ''
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required.",
        variant: "destructive",
      });
      return;
    }

    onSave({
      name: formData.name.trim(),
      description: formData.description.trim(),
      color: formData.color,
      icon: formData.icon,
      isDefault: false,
      systemPrompt: formData.systemPrompt.trim() || undefined,
      model: formData.model.trim() || undefined
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Category name"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Color</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {categoryColors.map((color) => (
              <button
                key={color}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-all",
                  formData.color === color ? "border-foreground scale-110" : "border-border"
                )}
                style={{ backgroundColor: color }}
                onClick={() => setFormData(prev => ({ ...prev, color }))}
              />
            ))}
          </div>
        </div>

        <div>
          <Label>Icon</Label>
          <Select
            value={formData.icon}
            onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(categoryIcons).map((iconName) => {
                const Icon = categoryIcons[iconName as keyof typeof categoryIcons];
                return (
                  <SelectItem key={iconName} value={iconName}>
                    <div className="flex items-center">
                      <Icon className="w-4 h-4 mr-2" />
                      {iconName.replace('Icon', '')}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="systemPrompt">Default System Prompt (Optional)</Label>
        <textarea
          id="systemPrompt"
          value={formData.systemPrompt}
          onChange={(e) => setFormData(prev => ({ ...prev, systemPrompt: e.target.value }))}
          placeholder="System prompt to use for chats in this category..."
          className="w-full min-h-[80px] px-3 py-2 text-sm border border-input rounded-md bg-background resize-none"
        />
      </div>

      <div>
        <Label htmlFor="model">Default Model (Optional)</Label>
        <Select
          value={formData.model}
          onValueChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Use default model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Use default model</SelectItem>
            <SelectItem value="zai-org/GLM-4.5-Air">GLM-4.5 Air</SelectItem>
            <SelectItem value="microsoft/WizardLM-2-8x22B">WizardLM-2 8x22B</SelectItem>
            <SelectItem value="mistralai/Mistral-7B-Instruct-v0.1">Mistral 7B</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="btn-primary">
          <SaveIcon className="w-4 h-4 mr-2" />
          Save Category
        </Button>
      </div>
    </div>
  );
}

// Export default categories for use in other components
export { defaultCategories };
