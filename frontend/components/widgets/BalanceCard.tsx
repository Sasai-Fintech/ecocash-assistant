"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BalanceCard() {
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    // Define the action so the agent can call it to update the UI
    // Note: In a real app, you might use useCopilotReadable to provide context to the agent,
    // and useCopilotAction for the agent to take actions. 
    // Here we use useCopilotAction to let the agent "push" the balance to us, 
    // or we can just call the tool directly if we want to pull it.
    // For this demo, let's pull it on mount to show data immediately.

    const getBalance = useCopilotAction({
        name: "get_balance",
        description: "Fetch the current wallet balance for the user",
        handler: async () => {
            // This handler is called when the AGENT decides to call get_balance.
            // We can update our UI state here.
            // However, since our backend tool also returns the value, we can also just
            // invoke it manually.
            console.log("Agent requested balance");
            return "1234.56"; // The agent will receive this string
        }
    });

    // In a real app you would pull the user ID from auth context.
    const dummyUserId = "demo_user";

    useEffect(() => {
        async function fetchBalance() {
            setLoading(true);
            try {
                // We can invoke the backend tool directly via the CopilotKit SDK if we had a direct client,
                // but typically we interact via the agent. 
                // For this simple widget, we'll simulate a fetch or just wait for the agent interaction.
                // BUT, to make the UI look good immediately, let's set a dummy initial state 
                // or trigger an agent interaction.

                // For now, let's just show a placeholder that updates when the agent interacts.
                setBalance(1234.56);
            } catch (e) {
                console.error("Failed to fetch balance:", e);
            } finally {
                setLoading(false);
            }
        }
        fetchBalance();
    }, []);

    return (
        <Card className="w-full shadow-lg border-none bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
            <CardHeader>
                <CardTitle className="text-indigo-100">Wallet Balance</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="animate-pulse h-10 w-32 bg-white/20 rounded"></div>
                ) : (
                    <div className="space-y-1">
                        <p className="text-4xl font-bold">
                            {balance !== null
                                ? balance.toLocaleString("en-US", { style: "currency", currency: "USD" })
                                : "$0.00"}
                        </p>
                        <p className="text-sm text-indigo-200">Available Funds</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
