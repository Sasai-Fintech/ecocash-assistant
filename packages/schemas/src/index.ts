import { z } from "zod";

export const BalanceSchema = z.object({
    currency: z.string(),
    amount: z.number(),
});

export const BalanceCardSchema = z.object({
    accounts: z.array(
        z.object({
            id: z.string(),
            label: z.string(),
            balance: BalanceSchema,
        })
    ),
});

export const TransactionSchema = z.object({
    id: z.string(),
    date: z.string(),
    merchant: z.string(),
    amount: z.number(),
    currency: z.string(),
});

export const TransactionTableSchema = z.object({
    transactions: z.array(TransactionSchema),
});

export const TicketFormSchema = z.object({
    issue: z.string().min(1, "Issue is required"),
    description: z.string().min(1, "Description is required"),
});

export const ConfirmationDialogSchema = z.object({
    title: z.string(),
    message: z.string(),
    confirmLabel: z.string(),
    cancelLabel: z.string(),
});

export type BalanceCard = z.infer<typeof BalanceCardSchema>;
export type TransactionTable = z.infer<typeof TransactionTableSchema>;
export type TicketForm = z.infer<typeof TicketFormSchema>;
export type ConfirmationDialog = z.infer<typeof ConfirmationDialogSchema>;
