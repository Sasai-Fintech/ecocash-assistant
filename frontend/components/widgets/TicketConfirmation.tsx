import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RenderFunctionStatus } from "@copilotkit/react-core";

export type TicketConfirmationProps = {
  issue: string;
  description: string;
  status: RenderFunctionStatus;
  handler: (response: string) => void;
};

export function TicketConfirmation({ issue, description, status, handler }: TicketConfirmationProps) {
    const handleConfirm = () => {
        if (status === "complete" || status === "inProgress") {
            return; // Prevent double submission
        }
        handler("CONFIRM");
    };

    const handleCancel = () => {
        if (status === "complete" || status === "inProgress") {
            return;
        }
        handler("CANCEL");
    };
    
    // Show loading state when processing
    const isProcessing = status === "complete" || status === "inProgress";

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Confirm Ticket Creation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Issue:</span>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{issue}</p>
                </div>
                <div>
                    <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Description:</span>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{description}</p>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={isProcessing}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={handleConfirm}
                    disabled={isProcessing}
                    className={isProcessing ? "opacity-50 cursor-not-allowed" : ""}
                >
                    {isProcessing ? "Processing..." : "Confirm"}
                </Button>
            </CardFooter>
        </Card>
    );
}
