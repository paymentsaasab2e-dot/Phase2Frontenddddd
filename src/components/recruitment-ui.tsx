import React from 'react';

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
  className,
  contentClassName,
}: PageHeaderProps) {
  return (
    <div className={cx('recruitment-page-header', className)}>
      <div className={cx('min-w-0 space-y-2', contentClassName)}>
        {eyebrow ? <div className="recruitment-eyebrow">{eyebrow}</div> : null}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="recruitment-header-title">{title}</h1>
            {meta}
          </div>
          {description ? <p className="recruitment-header-description">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="recruitment-actions">{actions}</div> : null}
    </div>
  );
}

interface CountPillProps {
  children: React.ReactNode;
  className?: string;
}

export function CountPill({ children, className }: CountPillProps) {
  return <span className={cx('recruitment-count-pill', className)}>{children}</span>;
}

interface EmptyStateCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actions?: React.ReactNode;
  className?: string;
}

export function EmptyStateCard({
  icon,
  title,
  description,
  actions,
  className,
}: EmptyStateCardProps) {
  return (
    <div className={cx('recruitment-empty-state', className)}>
      {icon ? <div className="recruitment-empty-state-icon">{icon}</div> : null}
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="mx-auto max-w-xl text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center justify-center gap-3">{actions}</div> : null}
    </div>
  );
}
