import { z } from "zod";

const EnvSchema = z.object({
  NEXT_PUBLIC_BACKEND_URL: z.string().url(),
  NEXT_PUBLIC_AGENT_ID: z.string().default("agno_agent"),
  NEXT_PUBLIC_COPILOTKIT_RUNTIME_URL: z.string().default("/api/copilotkit"),
});

export type FrontendEnv = z.infer<typeof EnvSchema>;

export const env: FrontendEnv = EnvSchema.parse({
  NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  NEXT_PUBLIC_AGENT_ID: process.env.NEXT_PUBLIC_AGENT_ID,
  NEXT_PUBLIC_COPILOTKIT_RUNTIME_URL: process.env.NEXT_PUBLIC_COPILOTKIT_RUNTIME_URL,
});
