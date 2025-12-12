import { useState, useEffect } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { EnhancedChatMessage } from "@/components/EnhancedChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { SettingsDashboard } from "@/components/SettingsDashboard";
import { ModelSwitcher, defaultModels } from "@/components/ModelSwitcher";
import { ModelComparison } from "@/components/ModelComparison";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useChatStore, useSettingsStore, useUIStore } from "@/lib/store";
import { useChat } from "@/hooks/useChat";
import {
  SparklesIcon,
  SettingsIcon,
  DownloadIcon,
  ShareIcon,
  ZapIcon,
  BrainIcon,
  MenuIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  console.log('CHUTES AI Chat v4.0 - Loading application...');

  // Zustand stores
  const chatStore = useChatStore();
  const settingsStore = useSettingsStore();
  const uiStore = useUIStore();

  // State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showModelComparison, setShowModelComparison] = useState(false);
  const [comparisonPrompt, setComparisonPrompt] = useState("");

  // Chat hook
  const { sendMessage, isLoading, streamingMessage } = useChat();

  // Destructure store values
  const {
    chats,
    activeChat,
    createChat,
    deleteChat,
    selectChat,
    addMessage,
    updateMessage,
    exportChat,
    starChat
  } = chatStore;

  const { updateSettings } = settingsStore;
  const { toggleSettings, settingsOpen } = uiStore;

  // Get current chat
  const currentChat = chats.find(chat => chat.id === activeChat) || null;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowModelComparison(false);
        if (settingsOpen) toggleSettings();
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settingsOpen, toggleSettings]);

  // Handle sending messages
  const handleSendMessage = async (content: string, attachments?: Array<{ file: File; type: string }>) => {
    if (!activeChat) {
      const newChatId = createChat();
      selectChat(newChatId);
    }

    const chatId = activeChat || createChat();

    // Add user message
    const userMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      isUser: true,
      timestamp: new Date(),
      reactions: {},
      attachments: attachments?.map(att => ({
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: att.type as 'image' | 'document' | 'code' | 'other',
        name: att.file.name,
        size: att.file.size,
        url: undefined
      })) || [],
      isStreaming: false,
      metadata: {}
    };

    addMessage(chatId, userMessage);

    // Send to AI
    try {
      await sendMessage(content, {
        chatId,
        model: settingsStore.models.defaultModel,
        temperature: settingsStore.models.temperature,
        maxTokens: settingsStore.models.maxTokens,
        systemPrompt: settingsStore.models.systemPrompt
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    if (!activeChat) return;
    updateMessage(activeChat, messageId, { content: newContent });
  };

  const handleReactToMessage = (messageId: string, reaction: string) => {
    if (!activeChat) return;
    const message = currentChat?.messages.find(m => m.id === messageId);
    if (message) {
      const reactions = { ...message.reactions };
      reactions[reaction] = (reactions[reaction] || 0) + 1;
      updateMessage(activeChat, messageId, { reactions });
    }
  };

  return (
    <div className="flex h-screen bg-gradient-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <ChatSidebar
          chats={chats}
          activeChat={activeChat}
          onNewChat={createChat}
          onSelectChat={selectChat}
          onDeleteChat={deleteChat}
          onEditChat={(chatId, newTitle) => {
            console.log('Edit chat:', chatId, newTitle);
          }}
          onStarChat={starChat}
          onExportChat={exportChat}
          onImportChats={() => {
            console.log('Import chats');
          }}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-80">
          <ChatSidebar
            chats={chats}
            activeChat={activeChat}
            onNewChat={() => {
              createChat();
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
            onImportChats={() => {
              console.log('Import chats');
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            {/* v4 Header with Features */}
            <div className="border-b border-border/30 glass-card backdrop-blur-sm p-4">
              <div className="max-w-4xl mx-auto">
                {/* Main Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden"
                      onClick={() => setIsMobileMenuOpen(true)}
                    >
                      <MenuIcon className="w-5 h-5" />
                    </Button>
                    
                    <div className="flex items-center space-x-2">
                      <SparklesIcon className="w-6 h-6 text-blue-400" />
                      <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                          CHUTES AI Chat v4.0
                        </h1>
                        <p className="text-xs text-muted-foreground">Multi-Provider AI Platform</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigator.share?.({ title: currentChat.title })}
                      className="glass-hover"
                      title="Share chat"
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
                      onClick={toggleSettings}
                      className={cn(
                        "glass-hover",
                        settingsOpen && "bg-primary/20 text-primary border border-primary/30"
                      )}
                      title="Settings"
                    >
                      <SettingsIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* v4 Features Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-muted-foreground">4 Providers</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BrainIcon className="w-3 h-3 text-blue-400" />
                      <span className="text-muted-foreground">10+ Models</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ZapIcon className="w-3 h-3 text-purple-400" />
                      <span className="text-muted-foreground">AES Encryption</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>Chat: {currentChat.title}</span>
                    {currentChat.isStarred && (
                      <SparklesIcon className="w-3 h-3 text-yellow-400" />
                    )}
                    <span>•</span>
                    <span>{currentChat.messages.length} messages</span>
                  </div>
                </div>

                
                {/* Model Switcher Section */}
                <div className="mt-4 pt-4 border-t border-border/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BrainIcon className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">AI Model</span>
                    </div>
                    <ModelSwitcher
                      currentModel={settingsStore.models.defaultModel}
                      availableModels={defaultModels}
                      onModelChange={(modelId) => {
                        updateSettings({ models: { ...settingsStore.models, defaultModel: modelId } });
                      }}
                      onParameterChange={(parameter, value) => {
                        updateSettings({ 
                          models: { 
                            ...settingsStore.models, 
                            [parameter]: value 
                          } 
                        });
                      }}
                      onComparisonRequest={() => {
                        const lastUserMessage = currentChat?.messages
                          .filter(m => m.isUser)
                          .pop();
                        setComparisonPrompt(lastUserMessage?.content || "Compare AI model responses");
                        setShowModelComparison(true);
                      }}
                      temperature={settingsStore.models.temperature}
                      maxTokens={settingsStore.models.maxTokens}
                      showParameters={false}
                      compact={true}
                      className="w-auto"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Settings Panel */}
            {settingsOpen && (
              <div className="border-b border-border/30 bg-slate-800/95 backdrop-blur-sm animate-slide-in-down">
                <div className="max-w-4xl mx-auto p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <SettingsIcon className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-semibold text-white">Settings & Configuration</h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleSettings}
                      className="text-muted-foreground hover:text-white"
                    >
                      ✕ Close
                    </Button>
                  </div>
                  
                  <SettingsDashboard
                    settings={settingsStore}
                    onUpdate={(updatedSettings) => {
                      updateSettings(updatedSettings);
                    }}
                    onClose={toggleSettings}
                  />
                </div>
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1">
              <div className="max-w-4xl mx-auto">
                {currentChat.messages.map((message) => (
                  <EnhancedChatMessage
                    key={message.id}
                    message={message.content}
                    isUser={message.isUser}
                    timestamp={message.timestamp}
                    messageId={message.id}
                    onEdit={handleEditMessage}
                    onReact={handleReactToMessage}
                    onShare={() => navigator.share?.({ text: message.content })}
                    onCopy={() => navigator.clipboard.writeText(message.content)}
                    onReply={() => {}}
                    onBookmark={() => {}}
                    onPin={() => {}}
                    onDelete={() => {}}
                    onRegenerate={() => {}}
                    isStreaming={message.isStreaming}
                    reactions={message.reactions}
                    attachments={message.attachments}
                  />
                ))}
                
                {streamingMessage && (
                  <EnhancedChatMessage
                    message={streamingMessage}
                    isUser={false}
                    timestamp={new Date()}
                    messageId="streaming"
                    isStreaming={true}
                    onEdit={() => {}}
                    onReact={() => {}}
                    onShare={() => {}}
                    onCopy={() => {}}
                    onReply={() => {}}
                    onBookmark={() => {}}
                    onPin={() => {}}
                    onDelete={() => {}}
                    onRegenerate={() => {}}
                  />
                )}
                
                {isLoading && !streamingMessage && (
                  <TypingIndicator
                    modelName={settingsStore.models.defaultModel}
                    isStreaming={settingsStore.models.streaming}
                  />
                )}
              </div>
            </ScrollArea>

            {/* Input */}
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
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="text-center space-y-8 max-w-2xl mx-auto p-8">
              {/* v4 Logo */}
              <div className="relative">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 flex items-center justify-center shadow-2xl animate-pulse">
                  <SparklesIcon className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center animate-bounce">
                  <ZapIcon className="w-4 h-4 text-green-900" />
                </div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-900">v4</span>
                </div>
              </div>

              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
                  CHUTES AI Chat v4.0
                </h1>
                <p className="text-xl text-slate-300">
                  🚀 Multi-Provider AI Platform with Enterprise Features
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-slate-400">
                  <span>✨ 4 Providers</span>
                  <span>•</span>
                  <span>🧠 10+ Models</span>
                  <span>•</span>
                  <span>🔒 AES Encryption</span>
                  <span>•</span>
                  <span>⚡ Real-time Streaming</span>
                </div>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="glass-card p-4 rounded-xl space-y-3 hover:scale-105 transition-transform">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto">
                    <BrainIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-white">AI Models</h3>
                  <p className="text-slate-400 text-xs">xAI Grok, Google Gemini, OpenAI GPT, DeepSeek, Alibaba Tongyi</p>
                </div>

                <div className="glass-card p-4 rounded-xl space-y-3 hover:scale-105 transition-transform">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto">
                    <SparklesIcon className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-white">Providers</h3>
                  <p className="text-slate-400 text-xs">OpenRouter, MegaLLM, AgentRouter, Routeway with auto-fallback</p>
                </div>

                <div className="glass-card p-4 rounded-xl space-y-3 hover:scale-105 transition-transform">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto">
                    <ZapIcon className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-white">Security</h3>
                  <p className="text-slate-400 text-xs">AES-GCM encryption, rate limiting, circuit breakers</p>
                </div>

                <div className="glass-card p-4 rounded-xl space-y-3 hover:scale-105 transition-transform">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto">
                    <SettingsIcon className="w-5 h-5 text-orange-400" />
                  </div>
                  <h3 className="font-semibold text-white">Features</h3>
                  <p className="text-slate-400 text-xs">Model comparison, file upload, PWA, offline support</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="space-y-4">
                <Button
                  onClick={() => createChat()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  size="lg"
                >
                  <SparklesIcon className="w-6 h-6 mr-2" />
                  Start AI Conversation
                </Button>

                <p className="text-xs text-slate-500">
                  Press <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">⌘K</kbd> for command palette • 
                  <kbd className="px-2 py-1 bg-slate-700 rounded text-xs ml-1">Escape</kbd> to close panels
                </p>
              </div>

              {/* Provider Status */}
              <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
                <h3 className="text-sm font-semibold text-white mb-3">Provider Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['OpenRouter', 'MegaLLM', 'AgentRouter', 'Routeway'].map((provider) => (
                    <div key={provider} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-slate-300">{provider}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Model Comparison Modal */}
      {showModelComparison && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen p-4">
            <ModelComparison
              prompt={comparisonPrompt}
              models={defaultModels}
              onClose={() => setShowModelComparison(false)}
              onModelResponse={(modelId, response) => {
                console.log(`Model ${modelId} responded:`, response);
              }}
              className="w-full max-w-6xl h-[90vh]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
