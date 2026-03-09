import { X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import * as Progress from '@radix-ui/react-progress';

interface StatusBarProps {
  isProcessing: boolean;
  progress: number;
  currentFile: string | null;
  totalFiles: number;
  processedFiles: number;
  logs: Array<{ type: 'info' | 'success' | 'error'; message: string; timestamp: Date }>;
  onCancelProcessing: () => void;
}

export function StatusBar({
  isProcessing,
  progress,
  currentFile,
  totalFiles,
  processedFiles,
  logs,
  onCancelProcessing
}: StatusBarProps) {
  const recentLogs = logs.slice(-5).reverse();

  return (
    <div className="bg-gray-900 border-t border-gray-700">
      {/* Progress Bar */}
      {isProcessing && (
        <div className="px-4 pt-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span>
                Processing: {processedFiles} / {totalFiles}
              </span>
              {currentFile && (
                <span className="text-gray-500">— {currentFile}</span>
              )}
            </div>
            <button
              onClick={onCancelProcessing}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Cancel
            </button>
          </div>
          <Progress.Root
            value={progress}
            className="relative overflow-hidden bg-gray-800 rounded-full w-full h-2"
          >
            <Progress.Indicator
              className="bg-blue-600 h-full transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${100 - progress}%)` }}
            />
          </Progress.Root>
        </div>
      )}

      {/* Status Logs */}
      <div className="px-4 py-2">
        <div className="flex items-start gap-2 text-xs">
          <span className="text-gray-500 font-medium pt-1">Status:</span>
          <div className="flex-1 space-y-1">
            {recentLogs.length > 0 ? (
              recentLogs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-gray-400"
                >
                  {log.type === 'success' && (
                    <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                  )}
                  {log.type === 'error' && (
                    <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                  )}
                  {log.type === 'info' && (
                    <div className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  )}
                  <span className="text-gray-500 flex-shrink-0">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  <span className={`
                    ${log.type === 'success' ? 'text-green-400' : ''}
                    ${log.type === 'error' ? 'text-red-400' : ''}
                    ${log.type === 'info' ? 'text-gray-400' : ''}
                  `}>
                    {log.message}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-gray-500">Ready to process images</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
