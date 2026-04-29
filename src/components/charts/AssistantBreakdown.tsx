import type { AssistantBreakdown as AssistantBreakdownData } from '~/domain/types';
import { formatNumber, formatPercent } from '~/lib/format';

type AssistantBreakdownProps = {
  readonly assistants: readonly AssistantBreakdownData[];
};

export function AssistantBreakdown({ assistants }: AssistantBreakdownProps) {
  const total = assistants.reduce((sum, a) => sum + a.count, 0);
  if (total === 0) {
    return (
      <p className="text-[12px] text-[var(--color-muted)]">No AI-marker commits detected yet.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {assistants.map((assistant) => {
        const share = total > 0 ? assistant.count / total : 0;
        return (
          <li key={assistant.assistant} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ background: assistant.accent }}
                  aria-hidden
                />
                <span className="text-[13px] text-[var(--color-text-strong)] truncate">
                  {assistant.label}
                </span>
              </div>
              <span className="text-[12px] tabular-nums text-[var(--color-muted-2)] flex items-baseline gap-2 shrink-0">
                <span className="text-[var(--color-text)]">{formatNumber(assistant.count)}</span>
                <span className="text-[var(--color-muted)]">{formatPercent(share)}</span>
              </span>
            </div>
            <div className="h-1 rounded-full bg-[var(--color-bg-elev)] overflow-hidden" aria-hidden>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.max(2, share * 100)}%`,
                  background: assistant.accent,
                  opacity: 0.85,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
