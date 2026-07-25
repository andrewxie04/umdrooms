import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled UI render error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-neutral-950 text-neutral-100 p-6 font-sans">
          <div className="max-w-md w-full rounded-2xl bg-neutral-900/90 border border-neutral-800 p-8 shadow-2xl backdrop-blur-xl space-y-6 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 text-2xl font-bold">
              !
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight">Something went wrong</h2>
              <p className="text-sm text-neutral-400">
                The map or application interface encountered an unexpected rendering error.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-850 text-left overflow-auto max-h-32 text-xs font-mono text-neutral-400">
                {this.state.error.message}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-750 text-neutral-200 text-sm font-medium transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-sm font-medium transition-colors shadow-lg shadow-red-950/40"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
