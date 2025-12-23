import { z } from 'zod';

export const envSchema = z.object({
  // Core API Token
  VITE_CHUTES_API_TOKEN: z.string().min(1, "VITE_CHUTES_API_TOKEN is required"),
  
  // Optional Provider Keys
  VITE_OPENROUTER_API_KEY: z.string().optional(),
  VITE_MEGA_LLM_API_KEY: z.string().optional(),
  VITE_AGENT_ROUTER_API_KEY: z.string().optional(),
  VITE_ROUTEWAY_API_KEY: z.string().optional(),
  
  // Analytics & Monitoring
  VITE_ANALYTICS_ENDPOINT: z.string().url().optional(),
  VITE_ERROR_MONITORING_ENDPOINT: z.string().url().optional(),
});

const envVars = {
  VITE_CHUTES_API_TOKEN: import.meta.env.VITE_CHUTES_API_TOKEN,
  VITE_OPENROUTER_API_KEY: import.meta.env.VITE_OPENROUTER_API_KEY,
  VITE_MEGA_LLM_API_KEY: import.meta.env.VITE_MEGA_LLM_API_KEY,
  VITE_AGENT_ROUTER_API_KEY: import.meta.env.VITE_AGENT_ROUTER_API_KEY,
  VITE_ROUTEWAY_API_KEY: import.meta.env.VITE_ROUTEWAY_API_KEY,
  VITE_ANALYTICS_ENDPOINT: import.meta.env.VITE_ANALYTICS_ENDPOINT,
  VITE_ERROR_MONITORING_ENDPOINT: import.meta.env.VITE_ERROR_MONITORING_ENDPOINT,
};

// Will throw an error if validation fails, preventing the app from starting with bad config
export const env = envSchema.parse(envVars);
export type Env = z.infer<typeof envSchema>;
