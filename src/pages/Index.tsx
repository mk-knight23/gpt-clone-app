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
import { useChatStore, useSettingsStore, useUIStore } from "@/lib/store";
import { useChat } from "@/hooks/useChat";
import {
  SparklesIcon,
  SettingsIcon,
  DownloadIcon,
  ShareIcon,
  ZapIcon,
  BrainIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  // Zustand stores
  const chatStore = useChatStore();
  const settingsStore = useSettingsStore();
  const uiStore = useUIStore();

  // State
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
        systemPrompt: ""
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
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border">
        <ChatSidebar
          chats={chats}
          activeChat={activeChat}
          onNewChat={createChat}
          onSelectChat={selectChat}
          onDeleteChat={deleteChat}
          onEditChat={() => {}}
          onStarChat={starChat}
          onExportChat={exportChat}
          onImportChats={() => {}}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            {/* Header */}
            <div className="border-b border-border p-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <SparklesIcon className="w-6 h-6 text-primary" />
                    <div>
                      <h1 className="text-xl font-bold">AI Chat</h1>
                      <p className="text-xs text-muted-foreground">Multi-Provider Platform</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigator.share?.({ title: currentChat.title })}
                    >
                      <ShareIcon className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => exportChat(currentChat.id)}
                    >
                      <DownloadIcon className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleSettings}
                      className={cn(
                        settingsOpen && "bg-primary/20 text-primary"
                      )}
                    >
                      <SettingsIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Model Switcher */}
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

            {/* Settings Panel */}
            {settingsOpen && (
              <div className="border-b border-border bg-muted/50">
                <div className="max-w-4xl mx-auto p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <SettingsIcon className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-semibold">Settings</h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleSettings}
                    >
                      ✕ Close
                    </Button>
                  </div>
                  
                  <SettingsDashboard
                    settings={settingsStore}
                    onUpdate={updateSettings}
                    onClose={toggleSettings}
                  />
                </div>
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1">
              <div className="max-w-4xl mx-auto p-4">
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
              onFileUpload={() => {}}
            />
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-8 max-w-2xl mx-auto p-8">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <SparklesIcon className="w-12 h-12 text-white" />
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl font-bold">AI Chat</h1>
                <p className="text-xl text-muted-foreground">
                  Multi-Provider AI Platform
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                  <span>✨ Multiple Providers</span>
                  <span>•</span>
                  <span>🧠 AI Models</span>
                  <span>•</span>
                  <span>⚡ Real-time</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto">
                    <BrainIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="font-semibold">AI Models</h3>
                  <p className="text-muted-foreground text-xs">Access to multiple AI providers and models</p>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto">
                    <SparklesIcon className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="font-semibold">Features</h3>
                  <p className="text-muted-foreground text-xs">Real-time chat, file upload, model comparison</p>
                </div>
              </div>

              <Button
                onClick={() => createChat()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold"
                size="lg"
              >
                <SparklesIcon className="w-6 h-6 mr-2" />
                Start Conversation
              </Button>
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
              onModelResponse={() => {}}
              className="w-full max-w-6xl h-[90vh]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
