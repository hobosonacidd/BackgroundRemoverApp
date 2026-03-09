import { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Grid3x3 } from 'lucide-react';

interface ImageFile {
  id: string;
  name: string;
  url: string;
  processedUrl?: string;
  protectRegion?: { x: number; y: number; width: number; height: number };
}

interface PreviewPanelProps {
  files: ImageFile[];
  selectedFileId: string | null;
  onFileSelect: (id: string) => void;
  onProtectRegionUpdate: (fileId: string, region: { x: number; y: number; width: number; height: number } | undefined) => void;
  isDrawingProtectRegion: boolean;
}

export function PreviewPanel({ files, selectedFileId, onFileSelect, onProtectRegionUpdate, isDrawingProtectRegion }: PreviewPanelProps) {
  const [zoom, setZoom] = useState(100);
  const [viewMode, setViewMode] = useState<'grid' | 'single'>('single');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentRegion, setCurrentRegion] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedFile = files.find(f => f.id === selectedFileId);

  useEffect(() => {
    if (selectedFile && imageRef.current && canvasRef.current) {
      drawCanvas();
    }
  }, [selectedFile, zoom, selectedFile?.protectRegion]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !selectedFile) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image display size
    const rect = image.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw protect region if exists
    if (selectedFile.protectRegion) {
      const region = selectedFile.protectRegion;
      ctx.strokeStyle = '#3b82f6';
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      ctx.fillRect(region.x, region.y, region.width, region.height);
      ctx.strokeRect(region.x, region.y, region.width, region.height);
      
      ctx.setLineDash([]);
    }

    // Draw current drawing region
    if (currentRegion) {
      ctx.strokeStyle = '#3b82f6';
      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      ctx.fillRect(currentRegion.x, currentRegion.y, currentRegion.width, currentRegion.height);
      ctx.strokeRect(currentRegion.x, currentRegion.y, currentRegion.width, currentRegion.height);
      
      ctx.setLineDash([]);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingProtectRegion || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPoint({ x, y });
    setCurrentRegion(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = x - startPoint.x;
    const height = y - startPoint.y;

    setCurrentRegion({
      x: width < 0 ? x : startPoint.x,
      y: height < 0 ? y : startPoint.y,
      width: Math.abs(width),
      height: Math.abs(height)
    });

    drawCanvas();
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentRegion || !selectedFileId) return;

    setIsDrawing(false);
    setStartPoint(null);
    
    onProtectRegionUpdate(selectedFileId, currentRegion);
    setCurrentRegion(null);
  };

  const handleZoomIn = () => setZoom(Math.min(zoom + 25, 200));
  const handleZoomOut = () => setZoom(Math.max(zoom - 25, 50));
  const handleZoomReset = () => setZoom(100);

  return (
    <div className="h-full flex flex-col bg-gray-850">
      {/* Toolbar */}
      <div className="p-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('single')}
            className={`px-3 py-1.5 text-xs rounded transition-colors ${
              viewMode === 'single'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
            }`}
          >
            Single View
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 text-xs rounded flex items-center gap-1 transition-colors ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
            }`}
          >
            <Grid3x3 className="h-3 w-3" />
            Grid View
          </button>
        </div>

        {viewMode === 'single' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-1.5 bg-gray-800 hover:bg-gray-750 rounded transition-colors"
              disabled={zoom <= 50}
            >
              <ZoomOut className="h-4 w-4 text-gray-400" />
            </button>
            <span className="text-xs text-gray-400 w-12 text-center">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 bg-gray-800 hover:bg-gray-750 rounded transition-colors"
              disabled={zoom >= 200}
            >
              <ZoomIn className="h-4 w-4 text-gray-400" />
            </button>
            <button
              onClick={handleZoomReset}
              className="p-1.5 bg-gray-800 hover:bg-gray-750 rounded transition-colors ml-1"
            >
              <Maximize2 className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        )}
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto bg-gray-900" ref={containerRef}>
        {viewMode === 'grid' ? (
          <div className="p-4 grid grid-cols-3 gap-3">
            {files.map((file) => (
              <div
                key={file.id}
                onClick={() => onFileSelect(file.id)}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  selectedFileId === file.id
                    ? 'border-blue-500 ring-2 ring-blue-500/50'
                    : 'border-gray-700'
                } hover:border-blue-400`}
              >
                <div className="aspect-square bg-gray-800 flex items-center justify-center">
                  <img
                    src={file.processedUrl || file.url}
                    alt={file.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-xs text-white truncate">{file.name}</p>
                </div>
                {file.processedUrl && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 rounded text-xs text-white">
                    Processed
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-full p-8">
            {selectedFile ? (
              <div className="relative" style={{ transform: `scale(${zoom / 100})` }}>
                <img
                  ref={imageRef}
                  src={selectedFile.processedUrl || selectedFile.url}
                  alt={selectedFile.name}
                  className="max-w-full max-h-full object-contain shadow-2xl"
                  style={{ 
                    maxWidth: '800px',
                    maxHeight: '600px',
                    background: 'repeating-conic-gradient(#808080 0% 25%, #ffffff 0% 50%) 50% / 20px 20px'
                  }}
                  onLoad={drawCanvas}
                />
                <canvas
                  ref={canvasRef}
                  className={`absolute top-0 left-0 ${isDrawingProtectRegion ? 'cursor-crosshair' : 'pointer-events-none'}`}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={() => {
                    if (isDrawing) {
                      setIsDrawing(false);
                      setCurrentRegion(null);
                      setStartPoint(null);
                    }
                  }}
                />
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p className="text-lg mb-2">No image selected</p>
                <p className="text-sm">Select an image from the file panel to preview</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Bar */}
      {selectedFile && viewMode === 'single' && (
        <div className="p-3 border-t border-gray-700 text-xs text-gray-400 flex justify-between">
          <span>{selectedFile.name}</span>
          <span>{selectedFile.processedUrl ? 'Processed' : 'Original'}</span>
        </div>
      )}
    </div>
  );
}
