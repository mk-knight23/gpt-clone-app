import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  PlusIcon,
  MessageSquareIcon,
  PenToolIcon,
  Trash2Icon,
  SearchIcon,
  SettingsIcon,
  DownloadIcon,
  UploadIcon,
  MoreHorizontalIcon,
  SparklesIcon
} from "lucide-react";
import { ModelSelector } from "@/components/ModelSelector";
import { cn } from "@/lib/utils";

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  messageCount?: number;
  isStarred?: boolean;
}

interface ChatSidebarProps {
  chats: Chat[];
  activeChat: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onEditChat?: (chatId: string, newTitle: string) => void;
  onStarChat?: (chatId: string) => void;
  onExportChat?: (chatId: string) => void;
  onImportChats?: (file: File) => void;
}

export function ChatSidebar({
  chats,
  activeChat,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onEditChat,
  onStarChat,
  onExportChat,
  onImportChats
}: ChatSidebarProps) {
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingChat, setEditingChat] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter chats based on search query
  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditStart = (chat: Chat) => {
    setEditingChat(chat.id);
    setEditTitle(chat.title);
  };

  const handleEditSave = () => {
    if (editingChat && editTitle.trim() && onEditChat) {
      onEditChat(editingChat, editTitle.trim());
    }
    setEditingChat(null);
    setEditTitle("");
  };

  const handleEditCancel = () => {
    setEditingChat(null);
    setEditTitle("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEditSave();
    } else if (e.key === "Escape") {
      handleEditCancel();
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportChats) {
      onImportChats(file);
    }
  };

  // Auto-focus edit input
  useEffect(() => {
    if (editingChat) {
      const input = document.getElementById(`edit-${editingChat}`);
      input?.focus();
    }
  }, [editingChat]);

  return (
    <div className="w-80 h-screen sidebar-glass flex flex-col animate-slide-in-left">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold gradient-text">CHUTES AI</h1>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8 glass-hover"
            onClick={() => setShowSettings(!showSettings)}
          >
            <SettingsIcon className="w-4 h-4" />
          </Button>
        </div>
        
        <Button
          onClick={onNewChat}
          className="w-full btn-primary"
          size="lg"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 input-glass"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2 pb-4">
          {filteredChats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </div>
          ) : (
            filteredChats.map((chat, index) => (
              <div
                key={chat.id}
                className={cn(
                  "group sidebar-item relative flex items-center p-3 rounded-xl cursor-pointer glass-hover",
                  "animate-slide-in-up",
                  activeChat === chat.id && "active bg-sidebar-accent/50"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => onSelectChat(chat.id)}
                onMouseEnter={() => setHoveredChat(chat.id)}
                onMouseLeave={() => setHoveredChat(null)}
              >
                <MessageSquareIcon className="w-4 h-4 mr-3 text-sidebar-foreground/60 flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  {editingChat === chat.id ? (
                    <Input
                      id={`edit-${chat.id}`}
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={handleKeyPress}
                      onBlur={handleEditSave}
                      className="h-6 text-sm bg-transparent border-0 p-0 focus-visible:ring-0"
                    />
                  ) : (
                    <>
                      <p className="text-sm text-sidebar-foreground truncate font-medium">
                        {chat.title}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-sidebar-foreground/50">
                        <span>{chat.timestamp.toLocaleDateString()}</span>
                        {chat.messageCount && (
                          <>
                            <span>•</span>
                            <span>{chat.messageCount} messages</span>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Action buttons */}
                <div className={cn(
                  "flex items-center space-x-1 ml-2 transition-opacity",
                  hoveredChat === chat.id || editingChat === chat.id ? "opacity-100" : "opacity-0"
                )}>
                  {editingChat !== chat.id && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-7 h-7 p-0 glass-hover"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditStart(chat);
                        }}
                      >
                        <PenToolIcon className="w-3 h-3" />
                      </Button>
                      
                      {onStarChat && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className={cn(
                            "w-7 h-7 p-0 glass-hover",
                            chat.isStarred && "text-yellow-400"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            onStarChat(chat.id);
                          }}
                        >
                          <SparklesIcon className="w-3 h-3" />
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-7 h-7 p-0 text-destructive hover:bg-destructive/10 glass-hover"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(chat.id);
                        }}
                      >
                        <Trash2Icon className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-t border-sidebar-border/30 p-4 glass-card mx-4 mb-4 animate-scale-in">
          <h3 className="text-sm font-medium mb-3">Settings</h3>
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start glass-hover"
              onClick={handleImportClick}
            >
              <UploadIcon className="w-4 h-4 mr-2" />
              Import Chats
            </Button>
            
            {onExportChat && activeChat && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start glass-hover"
                onClick={() => onExportChat(activeChat)}
              >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Export Chat
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border/30 space-y-3">
        <ModelSelector />
        <div className="text-xs text-sidebar-foreground/50 text-center">
          CHUTES AI Chat v2.0
        </div>
      </div>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
