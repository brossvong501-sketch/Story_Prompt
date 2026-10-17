import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
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
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0f0a1c',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: "'Battambang', system-ui, sans-serif",
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '560px',
            width: '100%',
            backgroundColor: '#1b122e',
            border: '1px solid rgba(168, 85, 247, 0.35)',
            borderRadius: '20px',
            padding: '32px 24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h1 style={{
              fontFamily: "'Moul', cursive",
              fontSize: '20px',
              color: '#facc15',
              marginBottom: '12px',
              lineHeight: 1.5
            }}>
              មានបញ្ហាបច្ចេកទេសបន្តិចបន្តួច
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '20px', lineHeight: 1.6 }}>
              កម្មវិធីមិនអាចដំណើរការបានជាធម្មតា។ សូមចុចប៊ូតុងខាងក្រោមដើម្បីផ្ទុកទំព័រឡើងវិញ ឬសម្អាត Cache។
            </p>

            {this.state.error?.message && (
              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '12px',
                color: '#fca5a5',
                fontFamily: 'monospace',
                marginBottom: '24px',
                textAlign: 'left',
                overflowX: 'auto',
                wordBreak: 'break-all'
              }}>
                {this.state.error.message}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)'
                }}
              >
                🔄 ផ្ទុកឡើងវិញ (Reload)
              </button>
              <button
                onClick={this.handleClearAndReload}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '10px 18px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                🧹 សម្អាត Cache & ចូលសារជាថ្មី
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
