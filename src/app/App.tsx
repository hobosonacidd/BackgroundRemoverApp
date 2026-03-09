import { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { FilePanel } from './components/FilePanel';
import { PreviewPanel } from './components/PreviewPanel';
import { SettingsPanel, RemovalSettings } from './components/SettingsPanel';
import { StatusBar } from './components/StatusBar';

interface ImageFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  dateAdded: Date;
  status: 'pending' | 'processing' | 'completed' | 'error';
  processed?: boolean;
  processedUrl?: string;
  protectRegion?: { x: number; y: number; width: number; height: number };
}

interface LogEntry {
  type: 'info' | 'success' | 'error';
  message: string;
  timestamp: Date;
}

export default function App() {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentProcessingFile, setCurrentProcessingFile] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isDrawingProtectRegion, setIsDrawingProtectRegion] = useState(false);

  const [settings, setSettings] = useState<RemovalSettings>({
    mode: 'ai',
    color: '#00ff00',
    threshold: 30,
    aiModel: 'u2net',
    feather: 2,
    smoothEdges: true,
    decontaminateColors: false,
    outputMode: 'transparent',
    outputColor: '#ffffff',
    format: 'png'
  });

  // Load sample images on first render
  useEffect(() => {
    const sampleImages = [
      {
        id: '1',
        name: 'product-sample.jpg',
        url: 'https://images.unsplash.com/photo-1625860191460-10a66c7384fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9kdWN0JTIwcGhvdG9ncmFwaHklMjB3aGl0ZSUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzcyOTc1NjYyfDA&ixlib=rb-4.1.0&q=80&w=1080',
        type: 'image/jpeg',
        size: 2048000,
        dateAdded: new Date(),
        status: 'pending' as const,
        processed: false
      },
      {
        id: '2',
        name: 'portrait-sample.jpg',
        url: 'https://images.unsplash.com/photo-1580971739182-ccd8cfef3707?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHBlcnNvbiUyMHN0dWRpb3xlbnwxfHx8fDE3NzMwNjYyNjl8MA&ixlib=rb-4.1.0&q=80&w=1080',
        type: 'image/jpeg',
        size: 1536000,
        dateAdded: new Date(),
        status: 'pending' as const,
        processed: false
      },
      {
        id: '3',
        name: 'object-sample.jpg',
        url: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvYmplY3QlMjBpc29sYXRlZCUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc3MzA2NjI2OXww&ixlib=rb-4.1.0&q=80&w=1080',
        type: 'image/jpeg',
        size: 1843000,
        dateAdded: new Date(),
        status: 'pending' as const,
        processed: false
      }
    ];
    
    setFiles(sampleImages);
    setSelectedFileId(sampleImages[0].id);
    addLog('info', `Loaded ${sampleImages.length} sample images`);
  }, []);

  const addLog = (type: LogEntry['type'], message: string) => {
    setLogs(prev => [...prev, { type, message, timestamp: new Date() }]);
  };

  const handleFilesAdd = (newFiles: File[]) => {
    const imageFiles: ImageFile[] = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      size: file.size,
      dateAdded: new Date(),
      status: 'pending',
      processed: false
    }));

    setFiles(prev => [...prev, ...imageFiles]);
    addLog('info', `Added ${newFiles.length} file(s)`);

    // Auto-select first file if none selected
    if (!selectedFileId && imageFiles.length > 0) {
      setSelectedFileId(imageFiles[0].id);
    }
  };

  const handleFileRemove = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (selectedFileId === id) {
      setSelectedFileId(null);
    }
    addLog('info', 'Removed file');
  };

  const handleProtectRegionUpdate = (
    fileId: string,
    region: { x: number; y: number; width: number; height: number } | undefined
  ) => {
    setFiles(prev =>
      prev.map(f =>
        f.id === fileId ? { ...f, protectRegion: region } : f
      )
    );
    addLog('info', region ? 'Protection region set' : 'Protection region cleared');
  };

  const simulateBackgroundRemoval = (file: ImageFile): Promise<string> => {
    return new Promise((resolve) => {
      // In a real app, this would call an API endpoint
      // For demo purposes, we'll just return the original URL after a delay
      setTimeout(() => {
        resolve(file.url);
      }, 2000 + Math.random() * 1000);
    });
  };

  const handleStartProcessing = async () => {
    if (isProcessing) return;

    const filesToProcess = files.filter(f => !f.processed);
    if (filesToProcess.length === 0) {
      addLog('error', 'No files to process');
      return;
    }

    setIsProcessing(true);
    addLog('info', `Starting batch processing of ${filesToProcess.length} file(s)`);
    setProgress(0);

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      
      setCurrentProcessingFile(file.name);
      setFiles(prev =>
        prev.map(f => (f.id === file.id ? { ...f, status: 'processing' } : f))
      );

      addLog('info', `Processing ${file.name}...`);

      try {
        const processedUrl = await simulateBackgroundRemoval(file);
        
        setFiles(prev =>
          prev.map(f =>
            f.id === file.id
              ? { ...f, status: 'completed', processed: true, processedUrl }
              : f
          )
        );

        addLog('success', `Completed ${file.name}`);
      } catch (error) {
        setFiles(prev =>
          prev.map(f => (f.id === file.id ? { ...f, status: 'error' } : f))
        );
        addLog('error', `Failed to process ${file.name}`);
      }

      setProgress(((i + 1) / filesToProcess.length) * 100);
    }

    setIsProcessing(false);
    setCurrentProcessingFile(null);
    addLog('success', 'Batch processing completed!');
  };

  const handleCancelProcessing = () => {
    setIsProcessing(false);
    setCurrentProcessingFile(null);
    setProgress(0);
    addLog('info', 'Processing cancelled');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
            <div>
              <h1 className="text-lg font-semibold text-white">Batch Background Remover</h1>
              <p className="text-xs text-gray-400">Professional batch image processing</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              <span className="text-gray-300 font-medium">{files.length}</span> files loaded
            </div>
            <div className="text-sm text-gray-400">
              <span className="text-green-400 font-medium">{files.filter(f => f.processed).length}</span> processed
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Left Panel - File Management */}
          <Panel defaultSize={20} minSize={15} maxSize={30}>
            <FilePanel
              files={files}
              selectedFileId={selectedFileId}
              onFileSelect={setSelectedFileId}
              onFilesAdd={handleFilesAdd}
              onFileRemove={handleFileRemove}
            />
          </Panel>

          <PanelResizeHandle className="w-1 bg-gray-700 hover:bg-blue-500 transition-colors" />

          {/* Center Panel - Preview */}
          <Panel defaultSize={50} minSize={30}>
            <PreviewPanel
              files={files}
              selectedFileId={selectedFileId}
              onFileSelect={setSelectedFileId}
              onProtectRegionUpdate={handleProtectRegionUpdate}
              isDrawingProtectRegion={isDrawingProtectRegion}
            />
          </Panel>

          <PanelResizeHandle className="w-1 bg-gray-700 hover:bg-blue-500 transition-colors" />

          {/* Right Panel - Settings */}
          <Panel defaultSize={30} minSize={20} maxSize={35}>
            <SettingsPanel
              settings={settings}
              onSettingsChange={setSettings}
              onStartProcessing={handleStartProcessing}
              isProcessing={isProcessing}
              isDrawingProtectRegion={isDrawingProtectRegion}
              onDrawingProtectRegionChange={setIsDrawingProtectRegion}
            />
          </Panel>
        </PanelGroup>
      </div>

      {/* Status Bar */}
      <StatusBar
        isProcessing={isProcessing}
        progress={progress}
        currentFile={currentProcessingFile}
        totalFiles={files.length}
        processedFiles={files.filter(f => f.processed).length}
        logs={logs}
        onCancelProcessing={handleCancelProcessing}
      />
    </div>
  );
}