import type { AssistantBreakdown as AssistantBreakdownData } from '~/domain/types';
import { formatNumber, formatPercent } from '~/lib/format';

type AssistantBreakdownProps = {
  readonly assistants: readonly AssistantBreakdownData[];
};

export function AssistantBreakdown({ assistants }: AssistantBreakdownProps) {
  const total = assistants.reduce((sum, a) => sum + a.count, 0);
  if (total === 0) {
    return (
      <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--color-muted)]">
        No AI-marker commits detected yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col">
      {assistants.map((assistant) => {
        const share = total > 0 ? assistant.count / total : 0;
        return (
          <li
            key={assistant.assistant}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-2.5 border-b border-dashed border-[var(--color-border)] last:border-b-0"
          >
            <span
              className="size-2 rotate-45"
              style={{ background: assistant.accent }}
              aria-hidden
            />
            <div className="flex items-baseline gap-3 min-w-0">
              <span className="text-[14px] text-[var(--color-paper)] truncate">
                {assistant.label}
              </span>
              <span className="flex-1 border-b border-dotted border-[var(--color-border)] translate-y-[-3px]" />
            </div>
            <span className="font-mono text-[11px] tabular-nums text-[var(--color-muted)] flex items-baseline gap-2">
              <span className="text-[var(--color-text)]">{formatNumber(assistant.count)}</span>
              <span>{formatPercent(share)}</span>
            </span>
            <span className="col-span-3 h-px relative -mt-0.5" aria-hidden>
              <span
                className="absolute left-0 top-0 bottom-0"
                style={{ width: `${share * 100}%`, background: assistant.accent, opacity: 0.4 }}
              />
            </span>
          </li>
        );
      })}
    </ul>
  );
}
