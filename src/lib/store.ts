import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppSettings {
  // General Settings
  general: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    soundEnabled: boolean;
    hapticFeedback: boolean;
    autoSave: boolean;
    compactMode: boolean;
  };

  // Appearance Settings
  appearance: {
    primaryColor: string;
    accentColor: string;
    glassmorphism: boolean;
    glowEffects: boolean;
    animations: boolean;
    fontSize: 'small' | 'medium' | 'large';
    density: 'compact' | 'comfortable' | 'cozy';
    sidebarPosition: 'left' | 'right';
    messageBubbles: boolean;
  };

  // AI Models Settings
  models: {
    defaultModel: string;
    availableModels: string[];
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
    streaming: boolean;
    autoSwitchModel: boolean;
    modelComparison: boolean;
  };

  // Chat Behavior Settings
  chat: {
    systemPrompt: string;
    memoryEnabled: boolean;
    contextWindow: number;
    autoComplete: boolean;
    spellCheck: boolean;
    messageHistory: number;
    typingIndicators: boolean;
    readReceipts: boolean;
    messageReactions: boolean;
  };

  // System Prompts Library
  prompts: {
    presets: Array<{
      id: string;
      name: string;
      description: string;
      prompt: string;
      category: string;
      tags: string[];
      isDefault: boolean;
    }>;
    custom: Array<{
      id: string;
      name: string;
      prompt: string;
      category: string;
      createdAt: Date;
      lastUsed?: Date;
    }>;
  };

  // Data & Storage Settings
  data: {
    localStorage: boolean;
    indexedDB: boolean;
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    exportFormat: 'json' | 'markdown' | 'html';
    dataRetention: number; // days
    compression: boolean;
    encryption: boolean;
  };

  // Security & Privacy Settings
  security: {
    rateLimiting: boolean;
    contentFiltering: boolean;
    dataEncryption: boolean;
    sessionTimeout: number;
    twoFactorAuth: boolean;
    biometricAuth: boolean;
    analyticsEnabled: boolean;
    errorReporting: boolean;
    ipLogging: boolean;
  };

  // Developer Tools
  developer: {
    debugMode: boolean;
    performanceMonitoring: boolean;
    apiLogging: boolean;
    featureFlags: Record<string, boolean>;
    experimentalFeatures: boolean;
    consoleLogging: boolean;
    networkInspector: boolean;
  };
}

export interface ChatState {
  chats: Array<{
    id: string;
    title: string;
    messages: Array<{
      id: string;
      content: string;
      isUser: boolean;
      timestamp: Date;
      reactions?: Record<string, number>;
      attachments?: Array<{
        id: string;
        type: 'image' | 'document' | 'code' | 'other';
        url?: string;
        name: string;
        size?: number;
      }>;
      isStreaming?: boolean;
      metadata?: Record<string, any>;
    }>;
    timestamp: Date;
    messageCount: number;
    isStarred: boolean;
    branchFrom?: string;
    tags: string[];
    model: string;
    category?: string;
    folder?: string;
    isPinned: boolean;
    lastActivity: Date;
  }>;
  activeChat: string | null;
  searchQuery: string;
  isLoading: boolean;
  chatSettings: {
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
    streamResponses: boolean;
  };
}

export interface UIState {
  sidebarOpen: boolean;
  settingsOpen: boolean;
  commandPaletteOpen: boolean;
  modelComparisonOpen: boolean;
  promptLibraryOpen: boolean;
  voiceInputActive: boolean;
  isFullscreen: boolean;
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }>;
  modals: Record<string, boolean>;
  drawers: Record<string, boolean>;
}

const defaultSettings: AppSettings = {
  general: {
    theme: 'system',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
    soundEnabled: true,
    hapticFeedback: true,
    autoSave: true,
    compactMode: false,
  },
  appearance: {
    primaryColor: '#3b82f6',
    accentColor: '#10b981',
    glassmorphism: true,
    glowEffects: true,
    animations: true,
    fontSize: 'medium',
    density: 'comfortable',
    sidebarPosition: 'left',
    messageBubbles: true,
  },
  models: {
    defaultModel: 'zai-org/GLM-4.5-Air',
    availableModels: ['zai-org/GLM-4.5-Air', 'microsoft/WizardLM-2-8x22B', 'mistralai/Mistral-7B-Instruct-v0.1'],
    temperature: 0.7,
    maxTokens: 1024,
    topP: 0.9,
    frequencyPenalty: 0,
    presencePenalty: 0,
    streaming: true,
    autoSwitchModel: false,
    modelComparison: false,
  },
  chat: {
    systemPrompt: '',
    memoryEnabled: true,
    contextWindow: 4096,
    autoComplete: true,
    spellCheck: true,
    messageHistory: 100,
    typingIndicators: true,
    readReceipts: false,
    messageReactions: true,
  },
  prompts: {
    presets: [
      {
        id: 'creative',
        name: 'Creative Assistant',
        description: 'Helps with brainstorming and creative tasks',
        prompt: 'You are a creative and imaginative assistant. Help users with brainstorming, storytelling, and creative projects.',
        category: 'Creative',
        tags: ['creative', 'brainstorming'],
        isDefault: false,
      },
      {
        id: 'coding',
        name: 'Code Expert',
        description: 'Specialized in programming and development',
        prompt: 'You are an expert programmer. Help with code review, debugging, and explaining programming concepts.',
        category: 'Technical',
        tags: ['programming', 'code'],
        isDefault: false,
      },
    ],
    custom: [],
  },
  data: {
    localStorage: true,
    indexedDB: true,
    autoBackup: true,
    backupFrequency: 'weekly',
    exportFormat: 'json',
    dataRetention: 365,
    compression: true,
    encryption: false,
  },
  security: {
    rateLimiting: true,
    contentFiltering: true,
    dataEncryption: false,
    sessionTimeout: 60,
    twoFactorAuth: false,
    biometricAuth: false,
    analyticsEnabled: true,
    errorReporting: true,
    ipLogging: false,
  },
  developer: {
    debugMode: false,
    performanceMonitoring: true,
    apiLogging: false,
    featureFlags: {},
    experimentalFeatures: false,
    consoleLogging: true,
    networkInspector: false,
  },
};

interface SettingsStore extends AppSettings {
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      updateSettings: (updates) =>
        set((state) => ({
          ...state,
          ...updates,
          general: { ...state.general, ...updates.general },
          appearance: { ...state.appearance, ...updates.appearance },
          models: { ...state.models, ...updates.models },
          chat: { ...state.chat, ...updates.chat },
          prompts: { ...state.prompts, ...updates.prompts },
          data: { ...state.data, ...updates.data },
          security: { ...state.security, ...updates.security },
          developer: { ...state.developer, ...updates.developer },
        })),
      resetSettings: () =>
        set(() => ({ ...defaultSettings })),
    }),
    {
      name: 'ai-chat-settings',
    }
  )
);

interface ChatStore extends ChatState {
  createChat: (branchFrom?: string) => string;
  deleteChat: (chatId: string) => void;
  selectChat: (chatId: string) => void;
  updateChat: (chatId: string, updates: Partial<ChatState['chats'][0]>) => void;
  addMessage: (chatId: string, message: ChatState['chats'][0]['messages'][0]) => void;
  updateMessage: (chatId: string, messageId: string, updates: Partial<ChatState['chats'][0]['messages'][0]>) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  searchChats: (query: string) => ChatState['chats'];
  exportChat: (chatId: string) => string;
  importChat: (chatData: string) => void;
  starChat: (chatId: string) => void;
  pinChat: (chatId: string) => void;
  tagChat: (chatId: string, tags: string[]) => void;
  moveChatToFolder: (chatId: string, folder: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      activeChat: null,
      searchQuery: '',
      isLoading: false,
      chatSettings: {
        temperature: 0.7,
        maxTokens: 1024,
        systemPrompt: '',
        streamResponses: true,
      },

      createChat: (branchFrom) => {
        const newChat = {
          id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: 'New Chat',
          messages: [],
          timestamp: new Date(),
          messageCount: 0,
          isStarred: false,
          branchFrom,
          tags: [],
          model: 'openai/gpt-3.5-turbo',
          category: 'general',
          folder: 'default',
          isPinned: false,
          lastActivity: new Date(),
        };

        set((state) => ({
          ...state,
          chats: [newChat, ...state.chats],
          activeChat: newChat.id,
        }));

        return newChat.id;
      },

      deleteChat: (chatId) =>
        set((state) => {
          const newChats = state.chats.filter(chat => chat.id !== chatId);
          return {
            ...state,
            chats: newChats,
            activeChat: state.activeChat === chatId ? (newChats[0]?.id || null) : state.activeChat,
          };
        }),

      selectChat: (chatId) =>
        set((state) => {
          const newChats = state.chats.map(chat =>
            chat.id === chatId ? { ...chat, lastActivity: new Date() } : chat
          );
          return {
            ...state,
            chats: newChats,
            activeChat: chatId,
          };
        }),

      updateChat: (chatId, updates) =>
        set((state) => ({
          ...state,
          chats: state.chats.map(chat =>
            chat.id === chatId ? { ...chat, ...updates } : chat
          ),
        })),

      addMessage: (chatId, message) =>
        set((state) => {
          const newChats = state.chats.map(chat => {
            if (chat.id === chatId) {
              const newMessages = [...chat.messages, message];
              return {
                ...chat,
                messages: newMessages,
                messageCount: chat.messageCount + 1,
                lastActivity: new Date(),
                title: newMessages.length === 1 && message.isUser ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '') : chat.title,
              };
            }
            return chat;
          });
          return {
            ...state,
            chats: newChats,
          };
        }),

      updateMessage: (chatId, messageId, updates) =>
        set((state) => ({
          ...state,
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.map(msg =>
                    msg.id === messageId ? { ...msg, ...updates } : msg
                  ),
                }
              : chat
          ),
        })),

      deleteMessage: (chatId, messageId) =>
        set((state) => ({
          ...state,
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.filter(m => m.id !== messageId),
                  messageCount: Math.max(0, chat.messageCount - 1),
                }
              : chat
          ),
        })),

      searchChats: (query) => {
        const chats = get().chats;
        if (!query.trim()) return chats;

        return chats.filter(chat =>
          chat.title.toLowerCase().includes(query.toLowerCase()) ||
          chat.messages.some(msg =>
            msg.content.toLowerCase().includes(query.toLowerCase())
          ) ||
          chat.tags.some(tag =>
            tag.toLowerCase().includes(query.toLowerCase())
          )
        );
      },

      exportChat: (chatId) => {
        const chat = get().chats.find(c => c.id === chatId);
        if (!chat) throw new Error('Chat not found');

        const exportData = {
          ...chat,
          exportedAt: new Date().toISOString(),
          version: '4.0',
          app: 'AI Chat'
        };

        return JSON.stringify(exportData, null, 2);
      },

      importChat: (chatData) => {
        try {
          const imported = JSON.parse(chatData);
          const newChat = {
            ...imported,
            id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(imported.timestamp),
            messages: imported.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            })),
            lastActivity: new Date(),
          };

          set((state) => ({
            ...state,
            chats: [newChat, ...state.chats],
          }));
        } catch (error) {
          throw new Error('Invalid chat data format');
        }
      },

      starChat: (chatId) =>
        set((state) => ({
          ...state,
          chats: state.chats.map(chat =>
            chat.id === chatId ? { ...chat, isStarred: !chat.isStarred } : chat
          ),
        })),

      pinChat: (chatId) =>
        set((state) => ({
          ...state,
          chats: state.chats.map(chat =>
            chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
          ),
        })),

      tagChat: (chatId, tags) =>
        set((state) => ({
          ...state,
          chats: state.chats.map(chat =>
            chat.id === chatId ? { ...chat, tags } : chat
          ),
        })),

      moveChatToFolder: (chatId, folder) =>
        set((state) => ({
          ...state,
          chats: state.chats.map(chat =>
            chat.id === chatId ? { ...chat, folder } : chat
          ),
        })),
    }),
    {
      name: 'ai-chat-store',
    }
  )
);

interface UIStore extends UIState {
  toggleSidebar: () => void;
  toggleSettings: () => void;
  toggleCommandPalette: () => void;
  toggleModelComparison: () => void;
  togglePromptLibrary: () => void;
  setVoiceInputActive: (active: boolean) => void;
  toggleFullscreen: () => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  openDrawer: (drawerId: string) => void;
  closeDrawer: (drawerId: string) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      settingsOpen: false,
      commandPaletteOpen: false,
      modelComparisonOpen: false,
      promptLibraryOpen: false,
      voiceInputActive: false,
      isFullscreen: false,
      notifications: [],
      modals: {},
      drawers: {},

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleSettings: () => set((state) => ({ settingsOpen: !state.settingsOpen })),
      toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
      toggleModelComparison: () => set((state) => ({ modelComparisonOpen: !state.modelComparisonOpen })),
      togglePromptLibrary: () => set((state) => ({ promptLibraryOpen: !state.promptLibraryOpen })),
      setVoiceInputActive: (active) => set((state) => ({ voiceInputActive: active })),
      toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
      
      addNotification: (notification) =>
        set((state) => {
          const newNotification = {
            ...notification,
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            read: false,
          };
          return {
            ...state,
            notifications: [newNotification, ...state.notifications],
          };
        }),

      removeNotification: (id) =>
        set((state) => ({
          ...state,
          notifications: state.notifications.filter(n => n.id !== id),
        })),

      markNotificationRead: (id) =>
        set((state) => ({
          ...state,
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      openModal: (modalId) =>
        set((state) => ({
          ...state,
          modals: { ...state.modals, [modalId]: true },
        })),

      closeModal: (modalId) =>
        set((state) => ({
          ...state,
          modals: { ...state.modals, [modalId]: false },
        })),

      openDrawer: (drawerId) =>
        set((state) => ({
          ...state,
          drawers: { ...state.drawers, [drawerId]: true },
        })),

      closeDrawer: (drawerId) =>
        set((state) => ({
          ...state,
          drawers: { ...state.drawers, [drawerId]: false },
        })),
    }),
    {
      name: 'ai-chat-ui',
    }
  )
);
