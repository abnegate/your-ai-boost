import type { ReactNode } from 'react';
import { Card } from '~/components/ui/Card';

type EmptyStateProps = {
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="text-center py-12">
      <h2 className="text-lg font-semibold text-[var(--color-text-strong)]">{title}</h2>
      {description && (
        <p className="text-sm text-[var(--color-muted)] mt-2 max-w-md mx-auto">{description}</p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </Card>
  );
}
