import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle className="w-6 h-6" />
        <p className="text-lg font-medium">Error</p>
      </div>
      <p className="text-gray-700 text-center max-w-md">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          Try Again
        </button>
      )}
    </div>
  );
};
