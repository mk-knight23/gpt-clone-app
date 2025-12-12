/**
 * CHUTES AI Chat v4 - Model Registry
 *
 * Centralized registry of all available models across providers
 * with health monitoring, fallback chains, and provider management
 */

import {
  ModelRegistryEntry,
  ProviderId,
  ProviderHealth,
  ModelAdapter,
} from './index';
import { OpenRouterAdapter } from './adapters/openrouter';
import { MegaLLMAdapter } from './adapters/megallm';
import { AgentRouterAdapter } from './adapters/agentrouter';
import { RoutewayAdapter } from './adapters/routeway';

// Model registry with all available models
export const MODEL_REGISTRY: ModelRegistryEntry[] = [
  // OpenRouter Models
  {
    id: 'x-ai/grok-4.1-fast',
    name: 'Grok 4.1 Fast',
    provider: 'OpenRouter',
    providerId: 'openrouter',
    description: 'xAI\'s Grok model - fast and helpful',
    contextWindow: 128000,
    maxTokens: 4096,
    capabilities: ['text', 'reasoning', 'coding'],
    status: 'available',
    icon: 'Bot',
    tags: ['xai', 'grok', 'fast'],
    priority: 1,
  },
  {
    id: 'z-ai/glm-4.5-air',
    name: 'GLM-4.5 Air',
    provider: 'OpenRouter',
    providerId: 'openrouter',
    description: 'Zhipu AI\'s GLM model - balanced performance',
    contextWindow: 128000,
    maxTokens: 4096,
    capabilities: ['text', 'multilingual', 'reasoning'],
    status: 'available',
    icon: 'Brain',
    tags: ['zhipu', 'glm', 'balanced'],
    priority: 1,
  },
  {
    id: 'deepseek/deepseek-chat-v3-0324',
    name: 'DeepSeek Chat v3',
    provider: 'OpenRouter',
    providerId: 'openrouter',
    description: 'DeepSeek\'s advanced conversational AI',
    contextWindow: 32768,
    maxTokens: 4096,
    capabilities: ['text', 'coding', 'analysis'],
    status: 'available',
    icon: 'MessageSquare',
    tags: ['deepseek', 'chat', 'advanced'],
    priority: 1,
  },
  {
    id: 'qwen/qwen3-coder',
    name: 'Qwen3 Coder',
    provider: 'OpenRouter',
    providerId: 'openrouter',
    description: 'Alibaba\'s Qwen model specialized for coding',
    contextWindow: 32768,
    maxTokens: 4096,
    capabilities: ['text', 'coding', 'debugging'],
    status: 'available',
    icon: 'Code',
    tags: ['alibaba', 'qwen', 'coding'],
    priority: 1,
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT OSS 20B',
    provider: 'OpenRouter',
    providerId: 'openrouter',
    description: 'Open-source GPT model with 20B parameters',
    contextWindow: 8192,
    maxTokens: 4096,
    capabilities: ['text', 'reasoning'],
    status: 'available',
    icon: 'Zap',
    tags: ['openai', 'gpt', 'open-source'],
    priority: 1,
  },
  {
    id: 'google/gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash',
    provider: 'OpenRouter',
    providerId: 'openrouter',
    description: 'Google\'s experimental Gemini model - fast and capable',
    contextWindow: 1048576,
    maxTokens: 4096,
    capabilities: ['text', 'vision', 'multimodal'],
    status: 'available',
    icon: 'Sparkles',
    tags: ['google', 'gemini', 'experimental', 'vision'],
    priority: 1,
  },

  // MegaLLM Models (placeholder - would be populated dynamically)
  {
    id: 'megallm-gpt-4',
    name: 'MegaLLM GPT-4',
    provider: 'MegaLLM',
    providerId: 'megallm',
    description: 'GPT-4 through MegaLLM',
    contextWindow: 8192,
    maxTokens: 4096,
    capabilities: ['text', 'reasoning'],
    status: 'available',
    icon: 'Brain',
    tags: ['megallm', 'gpt-4'],
    priority: 2,
  },

  // Agent Router Models (placeholder)
  {
    id: 'agentrouter-claude',
    name: 'Agent Router Claude',
    provider: 'Agent Router',
    providerId: 'agentrouter',
    description: 'Claude through Agent Router',
    contextWindow: 100000,
    maxTokens: 4096,
    capabilities: ['text', 'analysis'],
    status: 'available',
    icon: 'Bot',
    tags: ['agentrouter', 'claude'],
    priority: 2,
  },

  // Routeway Models (placeholder)
  {
    id: 'routeway-gemini',
    name: 'Routeway Gemini',
    provider: 'Routeway',
    providerId: 'routeway',
    description: 'Gemini through Routeway',
    contextWindow: 32768,
    maxTokens: 4096,
    capabilities: ['text', 'multimodal'],
    status: 'available',
    icon: 'Sparkles',
    tags: ['routeway', 'gemini'],
    priority: 2,
  },
];

// Provider configurations
export const PROVIDER_CONFIGS = {
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKeyEnvVar: 'VITE_OPENROUTER_API_KEY',
    models: MODEL_REGISTRY.filter(m => m.providerId === 'openrouter'),
    features: {
      streaming: true,
      attachments: true,
      functionCalling: false,
      vision: true,
    },
    rateLimits: {
      requestsPerMinute: 50,
      requestsPerHour: 1000,
      tokensPerMinute: 10000,
    },
  },
  megallm: {
    id: 'megallm',
    name: 'MegaLLM',
    baseUrl: 'https://ai.megallm.io/v1',
    apiKeyEnvVar: 'VITE_MEGA_LLM_API_KEY',
    models: MODEL_REGISTRY.filter(m => m.providerId === 'megallm'),
    features: {
      streaming: true,
      attachments: false,
      functionCalling: false,
      vision: false,
    },
    rateLimits: {
      requestsPerMinute: 60,
      requestsPerHour: 1000,
      tokensPerMinute: 15000,
    },
  },
  agentrouter: {
    id: 'agentrouter',
    name: 'Agent Router',
    baseUrl: 'https://agentrouter.org/v1',
    apiKeyEnvVar: 'VITE_AGENT_ROUTER_API_KEY',
    models: MODEL_REGISTRY.filter(m => m.providerId === 'agentrouter'),
    features: {
      streaming: true,
      attachments: false,
      functionCalling: false,
      vision: false,
    },
    rateLimits: {
      requestsPerMinute: 30,
      requestsPerHour: 500,
      tokensPerMinute: 8000,
    },
  },
  routeway: {
    id: 'routeway',
    name: 'Routeway',
    baseUrl: 'https://api.routeway.ai/v1',
    apiKeyEnvVar: 'VITE_ROUTEWAY_API_KEY',
    models: MODEL_REGISTRY.filter(m => m.providerId === 'routeway'),
    features: {
      streaming: true,
      attachments: false,
      functionCalling: false,
      vision: false,
    },
    rateLimits: {
      requestsPerMinute: 40,
      requestsPerHour: 800,
      tokensPerMinute: 12000,
    },
  },
} as const;

// Provider factory
export function createProviderAdapter(providerId: ProviderId): ModelAdapter {
  switch (providerId) {
    case 'openrouter':
      return new OpenRouterAdapter();
    case 'megallm':
      return new MegaLLMAdapter();
    case 'agentrouter':
      return new AgentRouterAdapter();
    case 'routeway':
      return new RoutewayAdapter();
    default:
      throw new Error(`Unknown provider: ${providerId}`);
  }
}

// Model lookup functions
export function getModelById(modelId: string): ModelRegistryEntry | undefined {
  return MODEL_REGISTRY.find(model => model.id === modelId);
}

export function getModelsByProvider(providerId: ProviderId): ModelRegistryEntry[] {
  return MODEL_REGISTRY.filter(model => model.providerId === providerId);
}

export function getAvailableModels(): ModelRegistryEntry[] {
  return MODEL_REGISTRY.filter(model => model.status === 'available');
}

export function getModelsByCapability(capability: string): ModelRegistryEntry[] {
  return MODEL_REGISTRY.filter(model =>
    model.capabilities.includes(capability) && model.status === 'available'
  );
}

// Fallback chain utilities
export interface FallbackChain {
  primary: string; // model ID
  fallbacks: string[]; // model IDs
}

export const DEFAULT_FALLBACK_CHAINS: Record<string, FallbackChain> = {
  'fast-chat': {
    primary: 'x-ai/grok-4.1-fast',
    fallbacks: ['z-ai/glm-4.5-air', 'openai/gpt-oss-20b'],
  },
  'coding': {
    primary: 'qwen/qwen3-coder',
    fallbacks: ['deepseek/deepseek-chat-v3-0324', 'z-ai/glm-4.5-air'],
  },
  'vision': {
    primary: 'google/gemini-2.0-flash-exp',
    fallbacks: ['openai/gpt-oss-20b'],
  },
  'reasoning': {
    primary: 'z-ai/glm-4.5-air',
    fallbacks: ['deepseek/deepseek-chat-v3-0324', 'x-ai/grok-4.1-fast'],
  },
};

// Health monitoring
export class ProviderHealthMonitor {
  private healthCache = new Map<ProviderId, ProviderHealth>();
  private lastCheck = new Map<ProviderId, number>();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  async getProviderHealth(providerId: ProviderId): Promise<ProviderHealth> {
    const now = Date.now();
    const lastCheck = this.lastCheck.get(providerId) || 0;

    // Return cached result if still fresh
    if (now - lastCheck < this.CACHE_DURATION) {
      const cached = this.healthCache.get(providerId);
      if (cached) return cached;
    }

    try {
      const adapter = createProviderAdapter(providerId);
      const health = await adapter.healthCheck();

      this.healthCache.set(providerId, health);
      this.lastCheck.set(providerId, now);

      return health;
    } catch (error) {
      const unhealthyHealth: ProviderHealth = {
        status: 'unknown',
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      this.healthCache.set(providerId, unhealthyHealth);
      this.lastCheck.set(providerId, now);

      return unhealthyHealth;
    }
  }

  async getAllProviderHealth(): Promise<Record<ProviderId, ProviderHealth>> {
    const results: Partial<Record<ProviderId, ProviderHealth>> = {};

    const providers: ProviderId[] = ['openrouter', 'megallm', 'agentrouter', 'routeway'];

    await Promise.allSettled(
      providers.map(async (providerId) => {
        try {
          results[providerId] = await this.getProviderHealth(providerId);
        } catch (error) {
          results[providerId] = {
            status: 'unknown',
            lastChecked: new Date(),
            error: error instanceof Error ? error.message : 'Health check failed',
          };
        }
      })
    );

    return results as Record<ProviderId, ProviderHealth>;
  }

  clearCache(): void {
    this.healthCache.clear();
    this.lastCheck.clear();
  }
}

// Export singleton instance
export const providerHealthMonitor = new ProviderHealthMonitor();
