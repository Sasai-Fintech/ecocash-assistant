"use client";

import {
  BalanceCard,
  ConfirmationDialog,
  TicketForm,
  TicketStatusBoard,
  TransactionTable,
  WidgetPayload,
} from "@ecocash/schemas";
import { clsx } from "clsx";
import { useEffect } from "react";

import { trackEvent } from "../lib/analytics";

type AguiRendererProps = {
  widgets: WidgetPayload[];
  onPostback?: (payload: Record<string, unknown>) => void;
};

function openDeeplink(url?: string) {
  if (!url) {
    return;
  }
  trackEvent({ name: "widget.action", widgetType: "deeplink", action: "open", metadata: { url } });
  if (window.EcocashBridge?.openDeepLink) {
    window.EcocashBridge.openDeepLink(url);
  } else {
    window.open(url, "_blank");
  }
}

const ActionButton = ({
  label,
  variant,
  onClick = () => {},
}: {
  label: string;
  variant?: "primary" | "secondary" | "danger";
  onClick: () => void;
}) => (
  <button
    className={clsx(
      "rounded-md px-4 py-2 text-sm font-semibold transition-colors",
      variant === "secondary" && "bg-white/10 text-white hover:bg-white/20",
      variant === "danger" && "bg-red-500/80 text-white hover:bg-red-500",
      (!variant || variant === "primary") && "bg-primary text-white hover:bg-primary/80",
    )}
    onClick={onClick}
  >
    {label}
  </button>
);

function renderBalanceCard(
  widget: BalanceCard,
  onPostback?: (payload: Record<string, unknown>) => void,
) {
  return (
    <div className="rounded-2xl bg-white/5 p-4 backdrop-blur">
      <div className="mb-2">
        <p className="text-xs uppercase tracking-wide text-white/60">{widget.title}</p>
        {widget.subtitle && <p className="text-sm text-white/80">{widget.subtitle}</p>}
      </div>
      <div className="space-y-3">
        {widget.accounts.map(account => (
          <div key={account.id} className="rounded-xl border border-white/10 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">{account.label}</p>
                <p className="text-2xl font-semibold text-white">
                  {account.balance.currency} {account.balance.amount.toLocaleString()}
                </p>
              </div>
              {account.available && (
                <div className="text-right">
                  <p className="text-xs text-white/60">Available</p>
                  <p className="text-base text-white">
                    {account.available.currency} {account.available.amount.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
            {account.limit && (
              <p className="text-xs text-white/50">
                Limit {account.limit.currency} {account.limit.amount.toLocaleString()}
              </p>
            )}
            {account.deeplink && (
              <button
                className="mt-2 text-sm text-primary underline"
                onClick={() => openDeeplink(account.deeplink)}
              >
                Manage account
              </button>
            )}
          </div>
        ))}
      </div>
      {widget.actions && widget.actions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {widget.actions.map(action => (
            <ActionButton
              key={action.id ?? action.label}
              label={action.label}
              variant={action.variant}
              onClick={() => {
                if (action.action === "deeplink") {
                  openDeeplink(action.deeplink);
                } else if (onPostback) {
                  onPostback({
                    __label: action.label,
                    __id: action.id,
                    ...(action.payload || {}),
                  });
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function renderTransactionTable(
  widget: TransactionTable,
  onPostback?: (payload: Record<string, unknown>) => void,
) {
  return (
    <div className="rounded-2xl bg-white/5 p-4 backdrop-blur">
      <div className="mb-4">
        <p className="text-sm font-semibold text-white">{widget.title}</p>
        {widget.filterChips && (
          <div className="mt-3 flex flex-wrap gap-2">
            {widget.filterChips.map(chip => (
              <span
                key={chip.id}
                className={clsx(
                  "rounded-full px-3 py-1 text-xs",
                  chip.selected ? "bg-primary text-white" : "bg-white/10 text-white/70",
                )}
              >
                {chip.label}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-3">
        {widget.transactions.map(transaction => (
          <div
            key={transaction.id}
            className="flex items-center justify-between rounded-xl border border-white/10 p-3"
          >
            <div>
              <p className="text-sm text-white/80">{transaction.description}</p>
              <p className="text-xs text-white/50">
                {new Date(transaction.postedAt).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p
                className={clsx(
                  "text-lg font-semibold",
                  transaction.direction === "inflow" ? "text-emerald-400" : "text-red-400",
                )}
              >
                {transaction.amount.currency} {transaction.amount.amount.toLocaleString()}
              </p>
              <p className="text-xs text-white/50">{transaction.status}</p>
            </div>
            {transaction.deeplink && (
              <button
                className="text-xs text-primary underline"
                onClick={() => openDeeplink(transaction.deeplink)}
              >
                View
              </button>
            )}
          </div>
        ))}
      </div>
      {widget.actions && (
        <div className="mt-4 flex flex-wrap gap-2">
          {widget.actions.map(action => (
            <ActionButton
              key={action.id ?? action.label}
              label={action.label}
              variant={action.variant}
              onClick={() => {
                if (action.action === "deeplink") {
                  openDeeplink(action.deeplink);
                } else if (action.payload && onPostback) {
                  onPostback(action.payload);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function renderTicketForm(widget: TicketForm) {
  return (
    <div className="rounded-2xl bg-white/5 p-4 backdrop-blur">
      <h3 className="text-lg font-semibold text-white">{widget.title}</h3>
      {widget.description && <p className="text-sm text-white/70">{widget.description}</p>}
      <form className="mt-4 space-y-4">
        {widget.fields.map(field => {
          if (field.kind === "select") {
            return (
              <label key={field.name} className="block text-sm">
                <span className="text-white/70">{field.label}</span>
                <select className="mt-1 w-full rounded-lg bg-white/10 p-2 text-white">
                  {field.options.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            );
          }
          if (field.kind === "textarea") {
            return (
              <label key={field.name} className="block text-sm">
                <span className="text-white/70">{field.label}</span>
                <textarea
                  className="mt-1 w-full rounded-lg bg-white/10 p-2 text-white"
                  rows={4}
                  placeholder={field.placeholder}
                />
              </label>
            );
          }
          return (
            <div
              key={field.name}
              className="rounded-lg border border-dashed border-white/30 p-4 text-center text-white/70"
            >
              Attachment placeholder (max {field.maxItems})
            </div>
          );
        })}
        <div className="flex gap-2">
          <ActionButton label={widget.submitLabel} />
          {widget.cancelLabel && <ActionButton label={widget.cancelLabel} variant="secondary" />}
        </div>
      </form>
    </div>
  );
}

function renderConfirmationDialog(
  widget: ConfirmationDialog,
  onPostback?: (payload: Record<string, unknown>) => void,
) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <p className="text-sm font-semibold text-white">{widget.title}</p>
      <p className="mt-2 text-sm text-white/80">{widget.body}</p>
      <div className="mt-4 flex gap-2">
        {widget.actions?.map(action => (
          <ActionButton
            key={action.id ?? action.label}
            label={action.label}
            variant={action.variant}
            onClick={() => {
              if (action.action === "deeplink") {
                openDeeplink(action.deeplink);
              } else if (action.payload && onPostback) {
                onPostback(action.payload);
              }
            }}
          />
        )) ?? (
          <>
            <ActionButton
              label={widget.confirmLabel}
              variant="primary"
              onClick={() => onPostback?.({ confirmed: true })}
            />
            <ActionButton
              label={widget.cancelLabel}
              variant="secondary"
              onClick={() => onPostback?.({ confirmed: false })}
            />
          </>
        )}
      </div>
    </div>
  );
}

function renderTicketStatusBoard(widget: TicketStatusBoard) {
  return (
    <div className="rounded-2xl bg-white/5 p-4 backdrop-blur">
      <h3 className="text-lg font-semibold text-white">{widget.title}</h3>
      <div className="mt-3 space-y-3">
        {widget.tickets.map(ticket => (
          <div key={ticket.id} className="rounded-xl border border-white/10 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/80">Ticket #{ticket.id}</p>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase text-white/70">
                {ticket.status.replace("_", " ")}
              </span>
            </div>
            <p className="mt-1 text-sm text-white/60">{ticket.summary}</p>
            <p className="text-xs text-white/40">
              Updated {new Date(ticket.updatedAt).toLocaleString()}
            </p>
            {ticket.deeplink && (
              <button
                className="mt-2 text-xs text-primary underline"
                onClick={() => openDeeplink(ticket.deeplink)}
              >
                View details
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AguiRenderer({ widgets, onPostback }: AguiRendererProps) {
  useEffect(() => {
    widgets.forEach(widget => {
      trackEvent({ name: "widget.view", widgetType: widget.type });
    });
  }, [widgets]);

  if (!widgets.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      {widgets.map(widget => {
        switch (widget.type) {
          case "balance_card":
            return <div key={widget.title}>{renderBalanceCard(widget, onPostback)}</div>;
          case "transaction_table":
            return <div key={widget.title}>{renderTransactionTable(widget, onPostback)}</div>;
          case "ticket_form":
            return <div key={widget.title}>{renderTicketForm(widget)}</div>;
          case "confirmation_dialog":
            return <div key={widget.title}>{renderConfirmationDialog(widget, onPostback)}</div>;
          case "ticket_status_board":
            return <div key={widget.title}>{renderTicketStatusBoard(widget)}</div>;
          default:
            return (
              <div
                key={widget.type}
                className="rounded-lg border border-dashed border-white/20 p-4 text-sm text-white/70"
              >
                Unsupported widget: {widget.type}
              </div>
            );
        }
      })}
    </div>
  );
}
