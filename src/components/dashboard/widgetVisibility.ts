export const DASHBOARD_WIDGET_STORAGE_KEY = 'phase2.dashboard.visibleWidgets';

export const DASHBOARD_WIDGETS = [
  { key: 'candidatePipeline', label: 'Candidate pipeline (stages)' },
  { key: 'openJobsByClient', label: 'Open jobs by client' },
  { key: 'jobStatus', label: 'Job status (sample)' },
  { key: 'myPendingTasks', label: 'My pending tasks' },
  { key: 'teamPlacements', label: 'Team placements (sample)' },
  { key: 'todaysInterviews', label: "Today's interviews" },
  { key: 'alerts', label: 'Alerts' },
  { key: 'recentActivity', label: 'Recent activity' },
  { key: 'revenueSnapshot', label: 'Revenue snapshot' },
] as const;

export type DashboardWidgetKey = (typeof DASHBOARD_WIDGETS)[number]['key'];

export type DashboardWidgetVisibility = Record<DashboardWidgetKey, boolean>;

export function createDefaultDashboardWidgetVisibility(): DashboardWidgetVisibility {
  return DASHBOARD_WIDGETS.reduce((acc, widget) => {
    acc[widget.key] = true;
    return acc;
  }, {} as DashboardWidgetVisibility);
}

export function sanitizeDashboardWidgetVisibility(raw: unknown): DashboardWidgetVisibility {
  const defaults = createDefaultDashboardWidgetVisibility();

  if (!raw || typeof raw !== 'object') {
    return defaults;
  }

  for (const widget of DASHBOARD_WIDGETS) {
    const nextValue = (raw as Record<string, unknown>)[widget.key];
    defaults[widget.key] = typeof nextValue === 'boolean' ? nextValue : true;
  }

  return defaults;
}

export function loadDashboardWidgetVisibility(): DashboardWidgetVisibility {
  if (typeof window === 'undefined') {
    return createDefaultDashboardWidgetVisibility();
  }

  try {
    const raw = window.localStorage.getItem(DASHBOARD_WIDGET_STORAGE_KEY);
    if (!raw) {
      return createDefaultDashboardWidgetVisibility();
    }

    return sanitizeDashboardWidgetVisibility(JSON.parse(raw));
  } catch {
    return createDefaultDashboardWidgetVisibility();
  }
}

export function saveDashboardWidgetVisibility(visibility: DashboardWidgetVisibility) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(DASHBOARD_WIDGET_STORAGE_KEY, JSON.stringify(visibility));
  } catch {
    // Ignore storage write failures and keep the dashboard usable.
  }
}
