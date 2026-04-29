import type { AssistantBreakdown as AssistantBreakdownData } from '~/domain/types';
import { formatNumber, formatPercent } from '~/lib/format';

type AssistantBreakdownProps = {
  readonly assistants: readonly AssistantBreakdownData[];
};

export function AssistantBreakdown({ assistants }: AssistantBreakdownProps) {
  const total = assistants.reduce((sum, a) => sum + a.count, 0);
  if (total === 0) {
    return <p className="text-sm text-[var(--color-muted)]">No AI-marker commits detected yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {assistants.map((assistant) => {
        const share = total > 0 ? assistant.count / total : 0;
        return (
          <li key={assistant.assistant} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-[var(--color-text)]">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: assistant.accent }}
                  aria-hidden
                />
                <span className="font-medium">{assistant.label}</span>
              </span>
              <span className="text-[var(--color-muted)] tabular-nums">
                {formatNumber(assistant.count)}{' '}
                <span className="text-[var(--color-muted)]/70">· {formatPercent(share)}</span>
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--color-surface-2)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${share * 100}%`, background: assistant.accent }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
