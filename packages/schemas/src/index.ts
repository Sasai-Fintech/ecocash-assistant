import { z } from "zod";

const MonetaryValueSchema = z.object({
  currency: z.string().min(3).max(3),
  amount: z.number(),
});

const ActionButtonSchema = z.object({
  id: z.string().optional(),
  label: z.string(),
  action: z.enum(["deeplink", "postback"]),
  deeplink: z.string().url().optional(),
  payload: z.record(z.unknown()).optional(),
  variant: z.enum(["primary", "secondary", "danger"]).optional(),
});

export const BalanceCardSchema = z.object({
  type: z.literal("balance_card"),
  title: z.string(),
  subtitle: z.string().optional(),
  accounts: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        balance: MonetaryValueSchema,
        available: MonetaryValueSchema.optional(),
        limit: MonetaryValueSchema.optional(),
        deeplink: z.string().url().optional(),
      }),
    )
    .min(1),
  actions: z.array(ActionButtonSchema).optional(),
});

const TransactionEntrySchema = z.object({
  id: z.string(),
  postedAt: z.string(),
  description: z.string(),
  amount: MonetaryValueSchema,
  direction: z.enum(["inflow", "outflow"]),
  status: z.enum(["completed", "pending", "failed"]),
  category: z.string().optional(),
  deeplink: z.string().url().optional(),
});

export const TransactionTableSchema = z.object({
  type: z.literal("transaction_table"),
  title: z.string(),
  filterChips: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        selected: z.boolean().default(false),
      }),
    )
    .optional(),
  transactions: z.array(TransactionEntrySchema),
  pagination: z
    .object({
      cursor: z.string().nullable(),
      hasNextPage: z.boolean(),
    })
    .optional(),
  actions: z.array(ActionButtonSchema).optional(),
});

const TicketFormFieldSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("select"),
    name: z.string(),
    label: z.string(),
    options: z.array(
      z.object({
        value: z.string(),
        label: z.string(),
      }),
    ),
    required: z.boolean().default(true),
  }),
  z.object({
    kind: z.literal("textarea"),
    name: z.string(),
    label: z.string(),
    placeholder: z.string().optional(),
    required: z.boolean().default(true),
    maxLength: z.number().optional(),
  }),
  z.object({
    kind: z.literal("attachment"),
    name: z.string(),
    label: z.string(),
    maxItems: z.number().default(3),
  }),
]);

export const TicketFormSchema = z.object({
  type: z.literal("ticket_form"),
  title: z.string(),
  description: z.string().optional(),
  fields: z.array(TicketFormFieldSchema).min(1),
  submitLabel: z.string().default("Submit"),
  cancelLabel: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const ConfirmationDialogSchema = z.object({
  type: z.literal("confirmation_dialog"),
  title: z.string(),
  body: z.string(),
  severity: z.enum(["info", "warning", "critical"]).default("info"),
  confirmLabel: z.string().default("Confirm"),
  cancelLabel: z.string().default("Cancel"),
  actions: z.array(ActionButtonSchema).optional(),
});

export const TicketStatusBoardSchema = z.object({
  type: z.literal("ticket_status_board"),
  title: z.string(),
  tickets: z.array(
    z.object({
      id: z.string(),
      status: z.enum(["new", "in_progress", "pending_customer", "resolved", "closed"]),
      updatedAt: z.string(),
      summary: z.string(),
      deeplink: z.string().url().optional(),
    }),
  ),
  actions: z.array(ActionButtonSchema).optional(),
});

export const WidgetSchema = z.discriminatedUnion("type", [
  BalanceCardSchema,
  TransactionTableSchema,
  TicketFormSchema,
  ConfirmationDialogSchema,
  TicketStatusBoardSchema,
]);

export type BalanceCard = z.infer<typeof BalanceCardSchema>;
export type TransactionTable = z.infer<typeof TransactionTableSchema>;
export type TicketForm = z.infer<typeof TicketFormSchema>;
export type ConfirmationDialog = z.infer<typeof ConfirmationDialogSchema>;
export type TicketStatusBoard = z.infer<typeof TicketStatusBoardSchema>;
export type WidgetPayload = z.infer<typeof WidgetSchema>;
