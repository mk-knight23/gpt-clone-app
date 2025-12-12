import { useState, useEffect } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { AdvancedSettings } from "@/components/AdvancedSettings";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useChat } from "@/hooks/useChat";
import {
  SparklesIcon,
  SettingsIcon,
  SearchIcon,
  DownloadIcon,
  ShareIcon,
  MoreHorizontalIcon,
  ZapIcon,
  BrainIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const {
    chats,
    activeChat,
    isLoading,
    searchQuery,
    chatSettings,
    createNewChat,
    branchChat,
    sendMessage,
    editMessage,
    reactToMessage,
    deleteChat,
    selectChat,
    getCurrentChat,
    searchChats,
    exportChat,
    importChats,
    starChat,
    updateChatSettings,
  } = useChat();

  const [showSettings, setShowSettings] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const currentChat = getCurrentChat();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for new chat
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        createNewChat();
      }
      
      // Cmd/Ctrl + / for search
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
        searchInput?.focus();
      }
      
      // Escape to close settings
      if (e.key === 'Escape') {
        setShowSettings(false);
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createNewChat]);

  const handleSendMessage = async (content: string, attachments?: any[]) => {
    await sendMessage(content, attachments);
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    editMessage(messageId, newContent);
  };

  const handleReactToMessage = (messageId: string, reaction: 'like' | 'dislike') => {
    reactToMessage(messageId, reaction);
  };

  const handleShareChat = (chatId: string) => {
    if (navigator.share) {
      navigator.share({
        title: `Chat: ${chats.find(c => c.id === chatId)?.title}`,
        text: 'Check out this AI conversation',
        url: window.location.href
      });
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleCopyMessage = (messageId: string) => {
    const message = currentChat?.messages.find(m => m.id === messageId);
    if (message) {
      navigator.clipboard.writeText(message.content);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <ChatSidebar
          chats={chats}
          activeChat={activeChat}
          onNewChat={createNewChat}
          onSelectChat={selectChat}
          onDeleteChat={deleteChat}
          onEditChat={(chatId, newTitle) => {
            // Update chat title logic would go here
            console.log('Edit chat:', chatId, newTitle);
          }}
          onStarChat={starChat}
          onExportChat={exportChat}
          onImportChats={importChats}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-80">
          <ChatSidebar
            chats={chats}
            activeChat={activeChat}
            onNewChat={() => {
              createNewChat();
              setIsMobileMenuOpen(false);
            }}
            onSelectChat={(chatId) => {
              selectChat(chatId);
              setIsMobileMenuOpen(false);
            }}
            onDeleteChat={deleteChat}
            onEditChat={(chatId, newTitle) => {
              console.log('Edit chat:', chatId, newTitle);
            }}
            onStarChat={starChat}
            onExportChat={exportChat}
            onImportChats={importChats}
          />
        </SheetContent>
      </Sheet>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            {/* Enhanced Chat Header */}
            <div className="border-b border-border/30 glass-card backdrop-blur-sm p-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setIsMobileMenuOpen(true)}
                      >
                        <MoreHorizontalIcon className="w-5 h-5" />
                      </Button>
                      
                      <div className="flex items-center space-x-2">
                        <BrainIcon className="w-5 h-5 text-primary" />
                        <h1 className="text-lg font-semibold text-foreground truncate">
                          {currentChat.title}
                        </h1>
                        {currentChat.isStarred && (
                          <SparklesIcon className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                      <span>{currentChat.messages.length} messages</span>
                      {currentChat.model && (
                        <>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <ZapIcon className="w-3 h-3" />
                            <span>{currentChat.model}</span>
                          </span>
                        </>
                      )}
                      {currentChat.branchFrom && (
                        <>
                          <span>•</span>
                          <span className="text-primary">Branched chat</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Quick Actions */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => branchChat(currentChat.id)}
                      className="glass-hover"
                      title="Branch conversation"
                    >
                      <ShareIcon className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => exportChat(currentChat.id)}
                      className="glass-hover"
                      title="Export chat"
                    >
                      <DownloadIcon className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSettings(!showSettings)}
                      className={cn(
                        "glass-hover",
                        showSettings && "bg-primary/10 text-primary"
                      )}
                      title="Settings"
                    >
                      <SettingsIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="border-b border-border/30 glass-card backdrop-blur-sm p-4 animate-slide-in-down">
                <AdvancedSettings
                  settings={chatSettings}
                  onUpdate={updateChatSettings}
                  onClose={() => setShowSettings(false)}
                />
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1">
              <div className="max-w-4xl mx-auto">
                {currentChat.messages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    message={message.content}
                    isUser={message.isUser}
                    timestamp={message.timestamp}
                    messageId={message.id}
                    onEdit={handleEditMessage}
                    onReact={handleReactToMessage}
                    onShare={handleShareChat}
                    onCopy={handleCopyMessage}
                    isStreaming={message.isStreaming}
                    attachments={message.attachments}
                  />
                ))}
                {isLoading && (
                  <TypingIndicator
                    modelName={currentChat.model}
                    isStreaming={chatSettings.streamResponses}
                  />
                )}
              </div>
            </ScrollArea>

            {/* Enhanced Input */}
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              onFileUpload={(files) => {
                console.log('Files uploaded:', files);
              }}
            />
          </>
        ) : (
          /* Enhanced Welcome Screen */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-8 max-w-lg mx-auto p-8 animate-fade-in">
              <div className="relative">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-primary flex items-center justify-center shadow-2xl animate-bounce-in">
                  <SparklesIcon className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                  <ZapIcon className="w-3 h-3 text-yellow-900" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-3xl font-bold gradient-text">
                  Welcome to CHUTES AI Chat
                </h1>
                <p className="text-muted-foreground text-lg">
                  Experience the future of AI conversations with our enhanced chat interface
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="glass-card p-4 rounded-xl space-y-2">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center mx-auto">
                    <BrainIcon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-medium">5 Free AI Models</h3>
                  <p className="text-muted-foreground text-xs">Access to Gemma, GLM, LongCat, GPT OSS, and Tongyi models</p>
                </div>
                
                <div className="glass-card p-4 rounded-xl space-y-2">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center mx-auto">
                    <SparklesIcon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-medium">Advanced Features</h3>
                  <p className="text-muted-foreground text-xs">File uploads, streaming, editing, and more</p>
                </div>
                
                <div className="glass-card p-4 rounded-xl space-y-2">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center mx-auto">
                    <ZapIcon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-medium">Real-time Streaming</h3>
                  <p className="text-muted-foreground text-xs">See responses as they're generated</p>
                </div>
                
                <div className="glass-card p-4 rounded-xl space-y-2">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center mx-auto">
                    <SettingsIcon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-medium">Customizable</h3>
                  <p className="text-muted-foreground text-xs">Adjust temperature, tokens, and prompts</p>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={() => createNewChat()}
                  className="btn-primary text-lg px-8 py-3"
                  size="lg"
                >
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Start New Conversation
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  Press <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘K</kbd> for new chat,
                  <kbd className="px-2 py-1 bg-muted rounded text-xs ml-1">⌘/</kbd> for search
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
