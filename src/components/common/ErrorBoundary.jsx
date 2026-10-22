import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 text-center space-y-6 shadow-xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                حدث خطأ غير متوقع
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                واجه النظام مشكلة أثناء معالجة الصفحة. يمكنك محاولة إعادة تحميل الصفحة.
              </p>
            </div>

            {this.state.error && (
              <pre className="p-3 bg-zinc-100 dark:bg-zinc-950 text-rose-500 rounded-xl text-[11px] text-left overflow-x-auto max-h-32 border border-zinc-200 dark:border-zinc-800">
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}

            <button
              onClick={this.handleReload}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-sm font-semibold rounded-2xl transition shadow"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة تحميل الصفحة</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

