import { BotIcon, SparklesIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  modelName?: string;
  isStreaming?: boolean;
}

export function TypingIndicator({ modelName = "CHUTES AI", isStreaming = false }: TypingIndicatorProps) {
  return (
    <div className="flex w-full py-6 px-4 animate-slide-in-up">
      <div className="flex max-w-[85%] space-x-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg animate-pulse">
            <BotIcon className="w-5 h-5 text-white" />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="chat-message assistant">
            <div className="flex items-center space-x-3">
              {/* Enhanced Typing Animation */}
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
              
              {/* Status Text */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {isStreaming ? "Generating response..." : `${modelName} is thinking`}
                </span>
                
                {/* Sparkle Effect */}
                <div className="flex items-center space-x-1">
                  <SparklesIcon className="w-3 h-3 text-primary animate-pulse" />
                  <SparklesIcon className="w-2 h-2 text-primary/60 animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>
              </div>
            </div>
            
            {/* Progress Bar for Streaming */}
            {isStreaming && (
              <div className="mt-3 space-y-2">
                <div className="w-full bg-muted/30 rounded-full h-1">
                  <div className="bg-gradient-primary h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Processing your request</span>
                  <span className="flex items-center space-x-1">
                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
                    <span>Live</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}