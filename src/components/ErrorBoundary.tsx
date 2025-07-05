import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  isChunkError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { 
    hasError: false, 
    error: null,
    isChunkError: false
  };
  
  static getDerivedStateFromError(error: Error) {
    // Detect if this is a chunk loading error (module loading failure)
    const errorMessage = error.message.toLowerCase();
    const isChunkError = 
      errorMessage.includes('loading chunk') || 
      errorMessage.includes('loading module') || 
      errorMessage.includes('failed to fetch') || 
      errorMessage.includes('unexpected token') || 
      errorMessage.includes('cannot find module');
    
    return { 
      hasError: true, 
      error, 
      isChunkError 
    };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Report to analytics or error monitoring service if available
    // Example: errorReportingService.captureError(error, errorInfo);
  }
  
  handleRetry = () => {
    // Force a reload of the current page to try again
    window.location.reload();
  };
  
  handleGoHome = () => {
    // Navigate to the home page
    window.location.href = '/';
  };
  
  render() {
    if (this.state.hasError) {
      // Special handling for chunk/module loading errors
      if (this.state.isChunkError) {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A] text-light p-4">
            <h2 className="text-2xl font-bold text-[#CCFF00] mb-4">Module Loading Error</h2>
            <p className="mb-4">There was a problem loading this page component.</p>
            <p className="text-sm mb-6 text-light/70">
              This could be due to a network issue or a recent deployment.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={this.handleRetry} 
                className="px-4 py-2 bg-[#CCFF00] text-[#0A0A0A] font-medium rounded hover:bg-[#CCFF00]/80"
              >
                Retry
              </button>
              <button 
                onClick={this.handleGoHome}
                className="px-4 py-2 border border-[#CCFF00] text-[#CCFF00] font-medium rounded hover:bg-[#CCFF00]/10"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        );
      }
      
      // For other types of errors
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A] text-light p-4">
          <h2 className="text-2xl font-bold text-[#CCFF00] mb-4">Something went wrong</h2>
          <p className="mb-4">We're sorry, but there was an error loading this page.</p>
          <pre className="bg-black/30 p-4 rounded mb-4 max-w-full overflow-auto text-sm text-red-400 w-full max-w-2xl">
            {this.state.error ? this.state.error.message : 'An unknown error occurred'}
          </pre>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={this.handleRetry} 
              className="px-4 py-2 bg-[#CCFF00] text-[#0A0A0A] font-medium rounded hover:bg-[#CCFF00]/80"
            >
              Retry
            </button>
            <button 
              onClick={this.handleGoHome}
              className="px-4 py-2 border border-[#CCFF00] text-[#CCFF00] font-medium rounded hover:bg-[#CCFF00]/10"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}

export default ErrorBoundary;
