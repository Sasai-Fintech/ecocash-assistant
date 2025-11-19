type AnalyticsEvent =
  | { name: "message.sent"; metadata?: Record<string, unknown> }
  | { name: "widget.view"; widgetType: string; metadata?: Record<string, unknown> }
  | {
      name: "widget.action";
      widgetType: string;
      action: string;
      metadata?: Record<string, unknown>;
    };

type AnalyticsCallback = (event: AnalyticsEvent) => void;

const subscribers = new Set<AnalyticsCallback>();

export function subscribe(callback: AnalyticsCallback) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

export function trackEvent(event: AnalyticsEvent) {
  subscribers.forEach(cb => cb(event));
  if (typeof window !== "undefined") {
    window.ecoAssistAnalytics?.push(event);
  }
}
