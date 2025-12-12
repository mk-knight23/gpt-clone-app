/**
 * Unified Settings Store for CHUTES AI Chat v3.0
 *
 * Centralized state management using Zustand with:
 * - Encrypted persistence
 * - Compression
 * - Migration support
 * - Type-safe settings
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import CryptoJS from 'crypto-js';

// Types for comprehensive settings
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
    animations: boolean;
    reducedMotion: boolean;
  };

  // Appearance Settings
  appearance: {
    primaryColor: string;
    accentColor: string;
    glassmorphism: boolean;
    glowEffects: boolean;
    neoGlass: boolean;
    fontSize: 'small' | 'medium' | 'large';
    density: 'compact' | 'comfortable' | 'cozy';
    sidebarPosition: 'left' | 'right';
    messageBubbles: boolean;
    gradientBackgrounds: boolean;
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
    multiModelChat: boolean;
    modelRouting: boolean;
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
    autoSave: boolean;
    messageContinuation: boolean;
    promptOptimization: boolean;
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
      usageCount: number;
      lastUsed?: Date;
    }>;
    custom: Array<{
      id: string;
      name: string;
      prompt: string;
      category: string;
      createdAt: Date;
      lastUsed?: Date;
      usageCount: number;
    }>;
    favorites: string[];
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
    syncEnabled: boolean;
    cloudBackup: boolean;
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
    auditLogging: boolean;
    secureDelete: boolean;
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
    devTools: boolean;
    hotReload: boolean;
  };

  // Accessibility Settings
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    screenReader: boolean;
    keyboardNavigation: boolean;
    focusIndicators: boolean;
    colorBlindFriendly: boolean;
    reducedMotion: boolean;
    skipLinks: boolean;
  };

  // PWA Settings
  pwa: {
    installPrompt: boolean;
    offlineMode: boolean;
    pushNotifications: boolean;
    backgroundSync: boolean;
    cacheStrategy: 'network-first' | 'cache-first' | 'stale-while-revalidate';
    updateStrategy: 'prompt' | 'auto' | 'manual';
  };

  // Voice & Audio Settings
  voice: {
    voiceInput: boolean;
    voiceOutput: boolean;
    voiceLanguage: string;
    voiceSpeed: number;
    voicePitch: number;
    voiceVolume: number;
    autoVoice: boolean;
  };

  // Advanced Features
  advanced: {
    multiTabSync: boolean;
    sessionPresence: boolean;
    autoTagging: boolean;
    imageGeneration: boolean;
    pluginSystem: boolean;
    apiAdapters: boolean;
    customModels: boolean;
    modelBenchmarking: boolean;
  };
}

// Chat State Types
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

// UI State Types
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

// Performance State Types
export interface PerformanceState {
  metrics: {
    loadTime: number;
    firstPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
  };
  cache: {
    hits: number;
    misses: number;
    size: number;
  };
  errors: Array<{
    id: string;
    message: string;
    stack?: string;
    timestamp: Date;
    resolved: boolean;
  }>;
}

// Default settings
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
    animations: true,
    reducedMotion: false,
  },
  appearance: {
    primaryColor: '#3b82f6',
    accentColor: '#10b981',
    glassmorphism: true,
    glowEffects: true,
    neoGlass: true,
    fontSize: 'medium',
    density: 'comfortable',
    sidebarPosition: 'left',
    messageBubbles: true,
    gradientBackgrounds: true,
  },
  models: {
    defaultModel: 'zai-org/GLM-4.5-Air',
    availableModels: [
      'zai-org/GLM-4.5-Air',
      'microsoft/WizardLM-2-8x22B',
      'mistralai/Mistral-7B-Instruct-v0.1',
      'google/gemma-3-4b-it',
      'alibaba/Tongyi'
    ],
    temperature: 0.7,
    maxTokens: 1024,
    topP: 0.9,
    frequencyPenalty: 0,
    presencePenalty: 0,
    streaming: true,
    autoSwitchModel: false,
    modelComparison: true,
    multiModelChat: true,
    modelRouting: true,
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
    autoSave: true,
    messageContinuation: true,
    promptOptimization: true,
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
        usageCount: 0,
      },
      {
        id: 'coding',
        name: 'Code Expert',
        description: 'Specialized in programming and development',
        prompt: 'You are an expert programmer. Help with code review, debugging, and explaining programming concepts.',
        category: 'Technical',
        tags: ['programming', 'code'],
        isDefault: false,
        usageCount: 0,
      },
      {
        id: 'research',
        name: 'Research Assistant',
        description: 'Specialized in research and analysis',
        prompt: 'You are a research assistant. Help with gathering information, analysis, and providing comprehensive answers.',
        category: 'Research',
        tags: ['research', 'analysis'],
        isDefault: false,
        usageCount: 0,
      }
    ],
    custom: [],
    favorites: [],
  },
  data: {
    localStorage: true,
    indexedDB: true,
    autoBackup: true,
    backupFrequency: 'weekly',
    exportFormat: 'json',
    dataRetention: 365,
    compression: true,
    encryption: true,
    syncEnabled: false,
    cloudBackup: false,
  },
  security: {
    rateLimiting: true,
    contentFiltering: true,
    dataEncryption: true,
    sessionTimeout: 60,
    twoFactorAuth: false,
    biometricAuth: false,
    analyticsEnabled: true,
    errorReporting: true,
    ipLogging: false,
    auditLogging: true,
    secureDelete: true,
  },
  developer: {
    debugMode: false,
    performanceMonitoring: true,
    apiLogging: false,
    featureFlags: {
      voiceInput: true,
      multiModel: true,
      advancedMarkdown: true,
      pluginSystem: false,
    },
    experimentalFeatures: false,
    consoleLogging: true,
    networkInspector: false,
    devTools: false,
    hotReload: true,
  },
  accessibility: {
    highContrast: false,
    largeText: false,
    screenReader: true,
    keyboardNavigation: true,
    focusIndicators: true,
    colorBlindFriendly: false,
    reducedMotion: false,
    skipLinks: true,
  },
  pwa: {
    installPrompt: true,
    offlineMode: true,
    pushNotifications: false,
    backgroundSync: true,
    cacheStrategy: 'stale-while-revalidate',
    updateStrategy: 'prompt',
  },
  voice: {
    voiceInput: false,
    voiceOutput: false,
    voiceLanguage: 'en-US',
    voiceSpeed: 1.0,
    voicePitch: 1.0,
    voiceVolume: 0.8,
    autoVoice: false,
  },
  advanced: {
    multiTabSync: true,
    sessionPresence: true,
    autoTagging: true,
    imageGeneration: false,
    pluginSystem: false,
    apiAdapters: true,
    customModels: false,
    modelBenchmarking: true,
  },
};

// Custom storage with encryption
const encryptedStorage = {
  getItem: (name: string) => {
    const item = localStorage.getItem(name);
    if (!item) return null;

    try {
      const decrypted = CryptoJS.AES.decrypt(item, 'chutes-ai-encryption-key').toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
    } catch {
      // Fallback to unencrypted data for backward compatibility
      return JSON.parse(item);
    }
  },
  setItem: (name: string, value: any) => {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(value), 'chutes-ai-encryption-key').toString();
    localStorage.setItem(name, encrypted);
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};

// Settings Store
interface SettingsStore extends AppSettings {
  // Actions
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (settings: string) => void;
  migrateSettings: (oldVersion: string, newVersion: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    immer((set, get) => ({
      ...defaultSettings,

      updateSettings: (updates) =>
        set((state) => {
          Object.assign(state, updates);
        }),

      resetSettings: () =>
        set(() => ({ ...defaultSettings })),

      exportSettings: () => {
        const settings = get();
        return JSON.stringify(settings, null, 2);
      },

      importSettings: (settingsString) => {
        try {
          const imported = JSON.parse(settingsString);
          // Validate imported settings
          if (typeof imported === 'object' && imported !== null) {
            set(() => ({ ...defaultSettings, ...imported }));
          }
        } catch (error) {
          console.error('Failed to import settings:', error);
          throw new Error('Invalid settings format');
        }
      },

      migrateSettings: (oldVersion, newVersion) => {
        // Handle version migrations
        console.log(`Migrating settings from ${oldVersion} to ${newVersion}`);
        // Add migration logic here as needed
      },
    })),
    {
      name: 'chutes-settings-v3',
      storage: createJSONStorage(() => encryptedStorage),
      version: 3,
      migrate: (persistedState: any, version) => {
        if (version < 3) {
          // Migration logic for older versions
          return { ...defaultSettings, ...persistedState };
        }
        return persistedState;
      },
    }
  )
);

// Chat Store
interface ChatStore extends ChatState {
  // Actions
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
    immer((set, get) => ({
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
          model: 'zai-org/GLM-4.5-Air',
          category: 'general',
          folder: 'default',
          isPinned: false,
          lastActivity: new Date(),
        };

        set((state) => {
          state.chats.unshift(newChat);
          state.activeChat = newChat.id;
        });

        return newChat.id;
      },

      deleteChat: (chatId) =>
        set((state) => {
          state.chats = state.chats.filter(chat => chat.id !== chatId);
          if (state.activeChat === chatId) {
            state.activeChat = state.chats[0]?.id || null;
          }
        }),

      selectChat: (chatId) =>
        set((state) => {
          state.activeChat = chatId;
          // Update last activity
          const chat = state.chats.find(c => c.id === chatId);
          if (chat) {
            chat.lastActivity = new Date();
          }
        }),

      updateChat: (chatId, updates) =>
        set((state) => {
          const chat = state.chats.find(c => c.id === chatId);
          if (chat) {
            Object.assign(chat, updates);
          }
        }),

      addMessage: (chatId, message) =>
        set((state) => {
          const chat = state.chats.find(c => c.id === chatId);
          if (chat) {
            chat.messages.push(message);
            chat.messageCount++;
            chat.lastActivity = new Date();
            // Update title if it's the first user message
            if (chat.messages.length === 1 && message.isUser) {
              chat.title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
            }
          }
        }),

      updateMessage: (chatId, messageId, updates) =>
        set((state) => {
          const chat = state.chats.find(c => c.id === chatId);
          if (chat) {
            const message = chat.messages.find(m => m.id === messageId);
            if (message) {
              Object.assign(message, updates);
            }
          }
        }),

      deleteMessage: (chatId, messageId) =>
        set((state) => {
          const chat = state.chats.find(c => c.id === chatId);
          if (chat) {
            chat.messages = chat.messages.filter(m => m.id !== messageId);
            chat.messageCount = Math.max(0, chat.messageCount - 1);
          }
        }),

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
          version: '3.0',
          app: 'CHUTES AI Chat v3.0'
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

          set((state) => {
            state.chats.unshift(newChat);
          });
        } catch (error) {
          throw new Error('Invalid chat data format');
        }
      },

      starChat: (chatId) =>
        set((state) => {
          const chat = state.chats.find(c => c.id === chatId);
          if (chat) {
            chat.isStarred = !chat.isStarred;
          }
        }),

      pinChat: (chatId) =>
        set((state) => {
          const chat = state.chats.find(c => c.id === chatId);
          if (chat) {
            chat.isPinned = !chat.isPinned;
          }
        }),

      tagChat: (chatId, tags) =>
        set((state) => {
          const chat = state.chats.find(c => c.id === chatId);
          if (chat) {
            chat.tags = tags;
          }
        }),

      moveChatToFolder: (chatId, folder) =>
        set((state) => {
          const chat = state.chats.find(c => c.id === chatId);
          if (chat) {
            chat.folder = folder;
          }
        }),
    })),
    {
      name: 'chutes-chats-v3',
      storage: createJSONStorage(() => encryptedStorage),
      version: 3,
    }
  )
);

// UI Store
interface UIStore extends UIState {
  // Actions
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
    immer((set, get) => ({
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

      toggleSidebar: () =>
        set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        }),

      toggleSettings: () =>
        set((state) => {
          state.settingsOpen = !state.settingsOpen;
        }),

      toggleCommandPalette: () =>
        set((state) => {
          state.commandPaletteOpen = !state.commandPaletteOpen;
        }),

      toggleModelComparison: () =>
        set((state) => {
          state.modelComparisonOpen = !state.modelComparisonOpen;
        }),

      togglePromptLibrary: () =>
        set((state) => {
          state.promptLibraryOpen = !state.promptLibraryOpen;
        }),

      setVoiceInputActive: (active) =>
        set((state) => {
          state.voiceInputActive = active;
        }),

      toggleFullscreen: () =>
        set((state) => {
          state.isFullscreen = !state.isFullscreen;
        }),

      addNotification: (notification) =>
        set((state) => {
          const newNotification = {
            ...notification,
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            read: false,
          };
          state.notifications.unshift(newNotification);
        }),

      removeNotification: (id) =>
        set((state) => {
          state.notifications = state.notifications.filter(n => n.id !== id);
        }),

      markNotificationRead: (id) =>
        set((state) => {
          const notification = state.notifications.find(n => n.id === id);
          if (notification) {
            notification.read = true;
          }
        }),

      openModal: (modalId) =>
        set((state) => {
          state.modals[modalId] = true;
        }),

      closeModal: (modalId) =>
        set((state) => {
          state.modals[modalId] = false;
        }),

      openDrawer: (drawerId) =>
        set((state) => {
          state.drawers[drawerId] = true;
        }),

      closeDrawer: (drawerId) =>
        set((state) => {
          state.drawers[drawerId] = false;
        }),
    })),
    {
      name: 'chutes-ui-v3',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

// Performance Store
interface PerformanceStore extends PerformanceState {
  // Actions
  recordMetric: (metric: keyof PerformanceState['metrics'], value: number) => void;
  recordCacheHit: () => void;
  recordCacheMiss: () => void;
  updateCacheSize: (size: number) => void;
  recordError: (error: Omit<PerformanceState['errors'][0], 'id' | 'timestamp' | 'resolved'>) => void;
  resolveError: (id: string) => void;
  clearErrors: () => void;
  getPerformanceReport: () => PerformanceState;
}

export const usePerformanceStore = create<PerformanceStore>()(
  persist(
    immer((set, get) => ({
      metrics: {
        loadTime: 0,
        firstPaint: 0,
        largestContentfulPaint: 0,
        firstInputDelay: 0,
        cumulativeLayoutShift: 0,
      },
      cache: {
        hits: 0,
        misses: 0,
        size: 0,
      },
      errors: [],

      recordMetric: (metric, value) =>
        set((state) => {
          state.metrics[metric] = value;
        }),

      recordCacheHit: () =>
        set((state) => {
          state.cache.hits++;
        }),

      recordCacheMiss: () =>
        set((state) => {
          state.cache.misses++;
        }),

      updateCacheSize: (size) =>
        set((state) => {
          state.cache.size = size;
        }),

      recordError: (error) =>
        set((state) => {
          const newError = {
            ...error,
            id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            resolved: false,
          };
          state.errors.unshift(newError);
        }),

      resolveError: (id) =>
        set((state) => {
          const error = state.errors.find(e => e.id === id);
          if (error) {
            error.resolved = true;
          }
        }),

      clearErrors: () =>
        set((state) => {
          state.errors = [];
        }),

      getPerformanceReport: () => get(),
    })),
    {
      name: 'chutes-performance-v3',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

// Export types for use in components
export type { SettingsStore, ChatStore, UIStore, PerformanceStore };
