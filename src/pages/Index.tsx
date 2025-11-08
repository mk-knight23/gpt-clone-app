import { useState } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/hooks/useChat";
import { SparklesIcon } from "lucide-react";

const Index = () => {
  const {
    chats,
    activeChat,
    isLoading,
    createNewChat,
    sendMessage,
    deleteChat,
    selectChat,
    getCurrentChat,
  } = useChat();

  const currentChat = getCurrentChat();

  return (
    <div className="flex h-screen bg-gradient-background">
      {/* Sidebar */}
      <ChatSidebar
        chats={chats}
        activeChat={activeChat}
        onNewChat={createNewChat}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-border bg-card/50 backdrop-blur-sm p-4">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-lg font-semibold text-foreground">
                  {currentChat.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {currentChat.messages.length} messages
                </p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1">
              <div className="max-w-4xl mx-auto">
                {currentChat.messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message.content}
                    isUser={message.isUser}
                    timestamp={message.timestamp}
                  />
                ))}
                {isLoading && <TypingIndicator />}
              </div>
            </ScrollArea>

            {/* Input */}
            <ChatInput
              onSendMessage={sendMessage}
              isLoading={isLoading}
            />
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-6 max-w-md mx-auto p-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center">
                <SparklesIcon className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Welcome to CHUTES AI Chat
                </h1>
                <p className="text-muted-foreground">
                  Start a conversation by creating a new chat or select an existing one from the sidebar.
                </p>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Powered by CHUTES AI</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Free AI models</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Beautiful interface</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
