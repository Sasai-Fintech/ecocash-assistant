import { useEffect, useRef } from "react";
import { useCopilotAction } from "@copilotkit/react-core";
import { WidgetPayload, WidgetSchema } from "@ecocash/schemas";

import { AguiRenderer } from "../components/agui-renderer";

type Props = {
  onPostback: (payload: Record<string, unknown>) => void;
};

function parseWidget(input: unknown): WidgetPayload | null {
  const parsed = WidgetSchema.safeParse(input);
  if (parsed.success) {
    return parsed.data;
  }
  console.warn("Invalid widget payload", parsed.error);
  return null;
}

function WidgetRenderer({
  widget,
  respond,
  onPostback,
}: {
  widget: WidgetPayload;
  respond?: (payload: Record<string, unknown>) => void;
  onPostback: (payload: Record<string, unknown>) => void;
}) {
  const hasRespondedRef = useRef(false);

  useEffect(() => {
    if (hasRespondedRef.current) return;
    respond?.({ status: "rendered", widgetType: widget.type });
    hasRespondedRef.current = true;
  }, [respond, widget.type]);

  return <AguiRenderer widgets={[widget]} onPostback={onPostback} />;
}

export function useWidgetActions({ onPostback }: Props) {
  useCopilotAction(
    {
      name: "render_widget",
      description: "Render an AG-UI widget inside the EcoCash assistant timeline.",
      parameters: [
        {
          name: "widget",
          type: "object",
          description: "Widget payload encoded using the AG-UI schema.",
          required: true,
        },
      ],
      handler: async ({ widget }) => {
        console.info("[EcoAssist] render_widget handler invoked", widget);
        const parsed = parseWidget(widget);
        if (!parsed) {
          throw new Error("Invalid widget payload");
        }
        return parsed;
      },
      renderAndWaitForResponse: ({ args, respond }) => {
        console.info("[EcoAssist] render_widget render invoked", args);
        const widget = parseWidget(args.widget);
        if (!widget) {
          respond?.({ status: "invalid_widget_payload" });
          return <div className="text-sm text-red-400">Widget payload was invalid.</div>;
        }
        return <WidgetRenderer widget={widget} respond={respond} onPostback={onPostback} />;
      },
    },
    [onPostback],
  );

  useCopilotAction(
    {
      name: "request_confirmation",
      description: "Display a confirmation dialog and wait for the user decision.",
      parameters: [
        {
          name: "dialog",
          type: "object",
          description: "Confirmation dialog widget payload.",
          required: true,
        },
      ],
      renderAndWaitForResponse: ({ args, respond }) => {
        console.info("[EcoAssist] request_confirmation render invoked", args);
        const widget = parseWidget(args.dialog);
        if (!widget) {
          respond?.({ confirmed: false, reason: "invalid_dialog_payload" });
          return <div className="text-sm text-red-400">Confirmation dialog is invalid.</div>;
        }
        return (
          <AguiRenderer
            widgets={[widget]}
            onPostback={payload => {
              onPostback(payload);
              respond?.(payload ?? { confirmed: true });
            }}
          />
        );
      },
    },
    [onPostback],
  );
}
