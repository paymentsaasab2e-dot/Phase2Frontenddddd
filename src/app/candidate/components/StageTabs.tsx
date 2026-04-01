import React, { useCallback, useEffect, useState } from 'react';
import { apiGetCandidateStats } from '../../../lib/api';
import { cx } from '../../../components/recruitment-ui';

const stages = [
  { id: 'all', label: 'All', countKey: 'all' as const },
  { id: 'applied', label: 'Applied', countKey: 'applied' as const },
  { id: 'longlist', label: 'Longlist', countKey: 'longlist' as const },
  { id: 'shortlist', label: 'Shortlist', countKey: 'shortlist' as const },
  { id: 'screening', label: 'Screening', countKey: 'screening' as const },
  { id: 'submitted', label: 'Submitted', countKey: 'submitted' as const },
  { id: 'interviewing', label: 'Interviewing', countKey: 'interviewing' as const },
  { id: 'offered', label: 'Offered', countKey: 'offered' as const },
  { id: 'hired', label: 'Hired', countKey: 'hired' as const },
  { id: 'rejected', label: 'Rejected', countKey: 'rejected' as const },
];

interface StageTabsProps {
  activeStage: string;
  onStageChange: (id: string) => void;
  refreshTrigger?: number; // Optional trigger to refresh stats
  /** When true, counts only candidates you created or who applied / are in pipeline on jobs you created */
  statsMine?: boolean;
}

export const StageTabs: React.FC<StageTabsProps> = ({
  activeStage,
  onStageChange,
  refreshTrigger,
  statsMine = false,
}) => {
  const [stats, setStats] = useState<{
    all: number;
    applied: number;
    longlist: number;
    shortlist: number;
    screening: number;
    submitted: number;
    interviewing: number;
    offered: number;
    hired: number;
    rejected: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGetCandidateStats(statsMine ? { mine: true } : undefined);
      const raw = res.data as typeof stats | { data?: typeof stats } | undefined;
      const statsData =
        raw && typeof raw === 'object' && 'data' in raw && raw.data && typeof raw.data === 'object'
          ? (raw.data as typeof stats)
          : (raw as typeof stats);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch candidate stats:', error);
      // Fallback to default counts
      setStats({
        all: 0,
        applied: 0,
        longlist: 0,
        shortlist: 0,
        screening: 0,
        submitted: 0,
        interviewing: 0,
        offered: 0,
        hired: 0,
        rejected: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [statsMine]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats, refreshTrigger]);
  return (
    <div className="overflow-x-auto no-scrollbar">
      <div className="recruitment-tabs-bar px-2 py-1">
        {stages.map((stage) => {
          const count = stats ? stats[stage.countKey] : 0;
          return (
            <button
              key={stage.id}
              onClick={() => onStageChange(stage.id)}
              className={cx(
                'recruitment-tab whitespace-nowrap',
                activeStage === stage.id && 'recruitment-tab-active'
              )}
            >
              {stage.label}
              <span className={cx(
                'recruitment-tab-count',
                activeStage === stage.id && 'recruitment-tab-count-active'
              )}>
                {loading ? '...' : count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
