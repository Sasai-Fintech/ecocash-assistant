import { NextRequest } from "next/server";
import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
  langGraphPlatformEndpoint,
  copilotKitEndpoint,
} from "@copilotkit/runtime";
import OpenAI from "openai";

const openai = new OpenAI();
const llmAdapter = new OpenAIAdapter({ 
  openai,
  model: "gpt-4o-mini"
} as any);
const langsmithApiKey = process.env.LANGSMITH_API_KEY as string;

export const POST = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const deploymentUrl = searchParams.get("lgcDeploymentUrl");

  // Extract headers from request (including Authorization header from CopilotKit properties)
  const headers: Record<string, string> = {};
  const authHeader = req.headers.get("authorization");
  const userIdHeader = req.headers.get("x-user-id");
  
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }
  if (userIdHeader) {
    headers["X-User-Id"] = userIdHeader;
  }

  const remoteEndpoint = deploymentUrl
    ? langGraphPlatformEndpoint({
      deploymentUrl,
      langsmithApiKey,
      agents: [
        {
          name: "ecocash_agent",
          description:
            "Ecocash Relationship Manager",
        },
      ],
      headers, // Forward headers to LangGraph Cloud
    })
    : copilotKitEndpoint({
      url:
        process.env.REMOTE_ACTION_URL || "http://localhost:8000/api/copilotkit",
      headers, // Forward headers to self-hosted backend
    });

  const runtime = new CopilotRuntime({
    remoteEndpoints: [remoteEndpoint],
  });

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter: llmAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
