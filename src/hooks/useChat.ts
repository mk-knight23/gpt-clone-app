import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
}

// CHUTES API integration
const callChutesAPI = async (message: string, apiToken: string, model: string = "zai-org/GLM-4.5-Air"): Promise<string> => {
  if (!apiToken) {
    throw new Error("CHUTES API token is required");
  }

  console.log('🔧 Making API call with:', { model, apiToken: apiToken.substring(0, 20) + '...' });

  const response = await fetch("https://llm.chutes.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: "user",
          content: message
        }
      ],
      stream: false,
      max_tokens: 1024,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('❌ API Error:', error);
    throw new Error(error.error?.message || 'Failed to get response from CHUTES API');
  }

  const data = await response.json();
  console.log('✅ API Success:', { model, response: data.choices[0]?.message?.content?.substring(0, 50) + '...' });
  return data.choices[0]?.message?.content || 'No response received';
};

export function useChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      title: "New Chat",
      messages: [],
      timestamp: new Date(),
    };
    
    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat.id);
    
    return newChat.id;
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!activeChat) {
      createNewChat();
      return;
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      isUser: true,
      timestamp: new Date(),
    };

    // Add user message
    setChats(prev => prev.map(chat => 
      chat.id === activeChat 
        ? { 
            ...chat, 
            messages: [...chat.messages, userMessage],
            title: chat.messages.length === 0 ? content.slice(0, 30) : chat.title
          }
        : chat
    ));

    setIsLoading(true);

    try {
      // Get API token from environment variable (Vercel/Netlify) or fall back to .env for local
      const apiToken = import.meta.env.VITE_CHUTES_API_TOKEN;
      
      if (!apiToken || apiToken === 'your_chutes_api_token_here') {
        toast({
          title: "Configuration Required",
          description: "Please set your CHUTES API token in environment variables or .env file.",
          variant: "destructive",
        });
        return;
      }

      // Get selected model from localStorage with fallback
      const selectedModel = localStorage.getItem('selected-model') || "zai-org/GLM-4.5-Air";
      
      console.log('🚀 Sending message with model:', selectedModel);
      console.log('📝 Message content:', content);

      // Call CHUTES API with environment token and selected model
      const response = await callChutesAPI(content, apiToken, selectedModel);
      
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        content: response,
        isUser: false,
        timestamp: new Date(),
      };

      // Add assistant response
      setChats(prev => prev.map(chat => 
        chat.id === activeChat 
          ? { ...chat, messages: [...chat.messages, assistantMessage] }
          : chat
      ));
    } catch (error) {
      console.error('💥 Chat Error:', error);
      toast({
        title: "Error",
        description: "Failed to get response from CHUTES API. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeChat, createNewChat]);

  const deleteChat = useCallback((chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (activeChat === chatId) {
      setActiveChat(null);
    }
  }, [activeChat]);

  const selectChat = useCallback((chatId: string) => {
    setActiveChat(chatId);
  }, []);

  const getCurrentChat = useCallback(() => {
    return chats.find(chat => chat.id === activeChat) || null;
  }, [chats, activeChat]);

  return {
    chats,
    activeChat,
    isLoading,
    createNewChat,
    sendMessage,
    deleteChat,
    selectChat,
    getCurrentChat,
  };
}
