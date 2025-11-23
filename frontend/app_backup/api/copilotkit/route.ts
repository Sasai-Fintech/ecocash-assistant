import { NextRequest } from "next/server";
import {
    CopilotRuntime,
    OpenAIAdapter,
    copilotRuntimeNextJSAppRouterEndpoint,
    copilotKitEndpoint,
} from "@copilotkit/runtime";
import OpenAI from "openai";

const openai = new OpenAI();
const llmAdapter = new OpenAIAdapter({ openai } as any);

export const POST = async (req: NextRequest) => {
    const remoteEndpoint = copilotKitEndpoint({
        url: process.env.REMOTE_ACTION_URL || "http://localhost:8000/copilotkit",
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
