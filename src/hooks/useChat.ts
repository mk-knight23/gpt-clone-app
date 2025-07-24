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

// OpenAI API integration
const callOpenAI = async (message: string, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("OpenAI API key is required");
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get response from OpenAI');
  }

  const data = await response.json();
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
      // Get API key from localStorage
      const apiKey = localStorage.getItem('openai-api-key');
      if (!apiKey) {
        toast({
          title: "API Key Required",
          description: "Please set your OpenAI API key in the settings.",
          variant: "destructive",
        });
        return;
      }

      // Call OpenAI API
      const response = await callOpenAI(content, apiKey);
      
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
      toast({
        title: "Error",
        description: "Failed to get response from API. Please try again.",
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