import type { Meta, StoryObj } from "@storybook/react";
import type { WidgetPayload } from "@ecocash/schemas";

import { AguiRenderer } from "./agui-renderer";

const meta: Meta<typeof AguiRenderer> = {
  title: "AG-UI/Renderer",
  component: AguiRenderer,
  args: {
    widgets: [
      {
        type: "balance_card",
        title: "Wallet Balances",
        accounts: [
          {
            id: "wallet-primary",
            label: "EcoCash Wallet",
            balance: { currency: "USD", amount: 212.45 },
            available: { currency: "USD", amount: 200.12 },
            deeplink: "ecocash://wallet",
          },
        ],
      },
      {
        type: "transaction_table",
        title: "Recent transactions",
        transactions: [
          {
            id: "txn-1",
            description: "Merchant payment",
            postedAt: new Date().toISOString(),
            direction: "outflow",
            status: "completed",
            amount: { currency: "USD", amount: 23.5 },
          },
        ],
      },
    ] as WidgetPayload[],
  },
};

export default meta;

type Story = StoryObj<typeof AguiRenderer>;

export const Default: Story = {};
