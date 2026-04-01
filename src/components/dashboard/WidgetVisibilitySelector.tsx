'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { CheckSquare, LayoutGrid, RotateCcw, Settings2 } from 'lucide-react';
import {
  DASHBOARD_WIDGETS,
  type DashboardWidgetKey,
  type DashboardWidgetVisibility,
} from './widgetVisibility';

interface WidgetVisibilitySelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visibility: DashboardWidgetVisibility;
  onToggle: (key: DashboardWidgetKey) => void;
  onSelectAll: () => void;
  onResetDefaults: () => void;
}

export function WidgetVisibilitySelector({
  open,
  onOpenChange,
  visibility,
  onToggle,
  onSelectAll,
  onResetDefaults,
}: WidgetVisibilitySelectorProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const selectedCount = useMemo(
    () => DASHBOARD_WIDGETS.filter((widget) => visibility[widget.key]).length,
    [visibility]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (wrapperRef.current?.contains(event.target as Node)) {
        return;
      }
      onOpenChange(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`recruitment-secondary-button h-11 gap-2 px-3 text-xs transition-all ${
          open
            ? 'border-blue-200 bg-blue-50 text-blue-700'
            : 'text-slate-600'
        }`}
      >
        <LayoutGrid size={15} />
        <span className="hidden sm:inline">Customize Widgets</span>
        <span className="rounded-lg bg-white/80 px-1.5 py-0.5 text-[10px] font-black text-slate-500">
          {selectedCount}/{DASHBOARD_WIDGETS.length}
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-30 mt-3 flex w-[22rem] max-w-[92vw] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
          <div className="border-b border-slate-100 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Dashboard</p>
                <h3 className="mt-1 text-sm font-black text-slate-900">Widget visibility</h3>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                <Settings2 size={15} />
              </div>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Choose which widgets stay visible on your agency dashboard.
            </p>
          </div>

          <div className="space-y-0.5 px-3 py-2.5">
            {DASHBOARD_WIDGETS.map((widget) => (
              <label
                key={widget.key}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={visibility[widget.key]}
                  onChange={() => onToggle(widget.key)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">{widget.label}</span>
              </label>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3">
            <div className="text-[11px] font-semibold text-slate-500">{selectedCount} widget(s) selected</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onSelectAll}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-600 transition-colors hover:bg-slate-50"
              >
                <CheckSquare size={13} />
                Select All
              </button>
              <button
                type="button"
                onClick={onResetDefaults}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-600 transition-colors hover:bg-slate-50"
              >
                <RotateCcw size={13} />
                Reset Default
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
