import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '~/components/ui/Button';
import { Card, CardHeader } from '~/components/ui/Card';

type Props = { readonly children: ReactNode };
type State = { readonly error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Render error', error, info);
  }

  override render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-2xl p-6">
          <Card>
            <CardHeader
              title="Something went sideways"
              description="The app hit an unexpected error. Try reloading."
            />
            <pre className="text-xs text-[var(--color-muted)] whitespace-pre-wrap font-mono">
              {this.state.error.message}
            </pre>
            <div className="mt-4">
              <Button onClick={() => window.location.reload()}>Reload</Button>
            </div>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}
