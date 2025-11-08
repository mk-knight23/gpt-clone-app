import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusIcon, MessageSquareIcon, PenToolIcon, Trash2Icon } from "lucide-react";
import { ModelSelector } from "@/components/ModelSelector";
import { cn } from "@/lib/utils";

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
}

interface ChatSidebarProps {
  chats: Chat[];
  activeChat: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export function ChatSidebar({ chats, activeChat, onNewChat, onSelectChat, onDeleteChat }: ChatSidebarProps) {
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);

  return (
    <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <Button
          onClick={onNewChat}
          className="w-full bg-gradient-primary text-sidebar-primary-foreground hover:opacity-90 transition-opacity"
          size="lg"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "group relative flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200",
                "hover:bg-sidebar-accent",
                activeChat === chat.id && "bg-sidebar-accent"
              )}
              onClick={() => onSelectChat(chat.id)}
              onMouseEnter={() => setHoveredChat(chat.id)}
              onMouseLeave={() => setHoveredChat(null)}
            >
              <MessageSquareIcon className="w-4 h-4 mr-3 text-sidebar-foreground/60" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-sidebar-foreground truncate">
                  {chat.title}
                </p>
                <p className="text-xs text-sidebar-foreground/50">
                  {chat.timestamp.toLocaleDateString()}
                </p>
              </div>
              
              {/* Action buttons */}
              {hoveredChat === chat.id && (
                <div className="flex items-center space-x-1 ml-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-6 h-6 p-0 hover:bg-sidebar-accent-foreground/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Edit functionality would go here
                    }}
                  >
                    <PenToolIcon className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-6 h-6 p-0 text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                  >
                    <Trash2Icon className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <ModelSelector />
        <div className="text-xs text-sidebar-foreground/50 text-center">
          CHUTES AI Chat v1.0
        </div>
      </div>
    </div>
  );
}
