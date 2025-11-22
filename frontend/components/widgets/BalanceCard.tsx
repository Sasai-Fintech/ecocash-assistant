"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Balance {
  currency: string;
  amount: number;
}

interface Account {
  id: string;
  label: string;
  balance: Balance;
}

interface BalanceCardProps {
  accounts: Account[];
}

export function BalanceCard({ accounts }: BalanceCardProps) {
  // Calculate total balance across all accounts
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance.amount, 0);
  const currency = accounts[0]?.balance.currency || "USD";

  return (
    <Card className="w-full max-w-md shadow-lg border-none bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
      <CardHeader>
        <CardTitle className="text-indigo-100">Wallet Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-4xl font-bold">
            {totalBalance.toLocaleString("en-US", { style: "currency", currency })}
          </p>
          <p className="text-sm text-indigo-200">Available Funds</p>
          {accounts.length > 1 && (
            <div className="mt-4 space-y-2">
              {accounts.map((account) => (
                <div key={account.id} className="flex justify-between text-sm">
                  <span className="text-indigo-200">{account.label}:</span>
                  <span className="font-semibold">
                    {account.balance.amount.toLocaleString("en-US", { style: "currency", currency: account.balance.currency })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
