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
        handler("CONFIRM");
    };

    const handleCancel = () => {
        handler("CANCEL");
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Confirm Ticket Creation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <span className="font-semibold text-sm text-gray-700">Issue:</span>
                    <p className="mt-1 text-sm text-gray-900">{issue || "No issue specified"}</p>
                </div>
                <div>
                    <span className="font-semibold text-sm text-gray-700">Description:</span>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{description || "No description provided"}</p>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={status === "complete" || status === "inProgress"}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={handleConfirm}
                    disabled={status === "complete" || status === "inProgress"}
                >
                    Confirm
                </Button>
            </CardFooter>
        </Card>
    );
}
