import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCopilotChat } from "@copilotkit/react-core";

export function TicketConfirmation({ issue, description }: { issue: string, description: string }) {
    const { appendMessage } = useCopilotChat();

    const handleConfirm = () => {
        appendMessage({
            id: Math.random().toString(),
            role: "user",
            content: "Confirmed",
        } as any);
    };

    const handleCancel = () => {
        appendMessage({
            id: Math.random().toString(),
            role: "user",
            content: "Cancelled",
        } as any);
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Confirm Ticket Creation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div>
                    <span className="font-semibold">Issue:</span> {issue}
                </div>
                <div>
                    <span className="font-semibold">Description:</span> {description}
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                <Button onClick={handleConfirm}>Confirm</Button>
            </CardFooter>
        </Card>
    );
}
