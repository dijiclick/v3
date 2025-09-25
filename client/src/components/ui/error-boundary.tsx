import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BlogErrorHandler } from "@/lib/error-utils";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  context?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class BlogErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const context = this.props.context || 'BlogErrorBoundary';
    
    this.setState({
      error,
      errorInfo
    });

    // Log the error using our error handler
    BlogErrorHandler.logError(error, `${context}:error_boundary`, {
      errorInfo,
      retryCount: this.retryCount,
      componentStack: errorInfo.componentStack
    });
  }

  handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.retryCount < this.maxRetries;
      const errorMessage = this.state.error?.message || 'خطای غیرمنتظره';

      return (
        <div 
          className="flex items-center justify-center min-h-[200px] p-6" 
          dir="rtl"
          data-testid="error-boundary"
        >
          <div className="max-w-md w-full">
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="font-vazir">خطا در نمایش محتوا</AlertTitle>
              <AlertDescription className="font-vazir mt-2">
                {BlogErrorHandler.getErrorMessage(this.state.error, 'general')}
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-3">
              {canRetry && (
                <Button 
                  onClick={this.handleRetry}
                  variant="outline"
                  className="w-full font-vazir"
                  data-testid="error-boundary-retry"
                >
                  <RefreshCw className="w-4 h-4 ml-2" />
                  تلاش مجدد ({this.maxRetries - this.retryCount} بار باقی‌مانده)
                </Button>
              )}

              <Button 
                onClick={this.handleGoHome}
                variant="default"
                className="w-full font-vazir"
                data-testid="error-boundary-home"
              >
                <Home className="w-4 h-4 ml-2" />
                بازگشت به صفحه اصلی
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 p-3 bg-gray-100 rounded text-sm">
                <summary className="cursor-pointer font-bold">جزئیات خطا (فقط در حالت توسعه)</summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {this.state.error.message}
                  {this.state.error.stack && '\n\nStack trace:\n' + this.state.error.stack}
                  {this.state.errorInfo?.componentStack && '\n\nComponent stack:\n' + this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Wrapper component for easier usage
 */
interface BlogErrorBoundaryWrapperProps {
  children: ReactNode;
  context?: string;
  fallback?: ReactNode;
  className?: string;
}

export function BlogErrorBoundaryWrapper({ 
  children, 
  context, 
  fallback, 
  className 
}: BlogErrorBoundaryWrapperProps) {
  return (
    <div className={className}>
      <BlogErrorBoundary context={context} fallback={fallback}>
        {children}
      </BlogErrorBoundary>
    </div>
  );
}