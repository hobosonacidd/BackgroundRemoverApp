import { useState } from 'react';
import { Upload, Search, SortAsc, Filter, Grid3x3, Grid2x2 } from 'lucide-react';
import { ScrollArea } from '@radix-ui/react-scroll-area';

interface ImageFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  dateAdded: Date;
  status: 'pending' | 'processing' | 'completed' | 'error';
  processed?: boolean;
}

interface FilePanelProps {
  files: ImageFile[];
  selectedFileId: string | null;
  onFileSelect: (id: string) => void;
  onFilesAdd: (files: File[]) => void;
  onFileRemove: (id: string) => void;
}

export function FilePanel({ files, selectedFileId, onFileSelect, onFilesAdd, onFileRemove }: FilePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'type'>('name');
  const [filterType, setFilterType] = useState<'all' | 'png' | 'jpg' | 'webp'>('all');
  const [thumbnailSize, setThumbnailSize] = useState<'small' | 'large'>('small');
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    onFilesAdd(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesAdd(Array.from(e.target.files));
    }
  };

  const filteredFiles = files
    .filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'all' || file.type.includes(filterType);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return b.dateAdded.getTime() - a.dateAdded.getTime();
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

  const getStatusColor = (status: ImageFile['status']) => {
    switch (status) {
      case 'completed': return 'border-green-500';
      case 'processing': return 'border-blue-500';
      case 'error': return 'border-red-500';
      default: return 'border-gray-600';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 border-r border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-gray-200 mb-3">File Management</h2>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Controls */}
        <div className="flex gap-2 mb-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="flex-1 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Date</option>
            <option value="type">Sort by Type</option>
          </select>
          
          <button
            onClick={() => setThumbnailSize(thumbnailSize === 'small' ? 'large' : 'small')}
            className="p-1.5 bg-gray-800 border border-gray-700 rounded hover:bg-gray-750 transition-colors"
            title="Toggle thumbnail size"
          >
            {thumbnailSize === 'small' ? (
              <Grid3x3 className="h-4 w-4 text-gray-400" />
            ) : (
              <Grid2x2 className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-1">
          {['all', 'png', 'jpg', 'webp'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                filterType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mx-4 mt-4 p-6 border-2 border-dashed rounded-lg transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-800/50'
        }`}
      >
        <input
          type="file"
          id="file-input"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        <label
          htmlFor="file-input"
          className="flex flex-col items-center cursor-pointer"
        >
          <Upload className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-xs text-gray-400 text-center">
            Drop images here or click to browse
          </p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP</p>
        </label>
      </div>

      {/* File List */}
      <ScrollArea className="flex-1 px-4 py-3 overflow-y-auto">
        <div className={`grid gap-2 ${thumbnailSize === 'small' ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => onFileSelect(file.id)}
              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                selectedFileId === file.id
                  ? 'border-blue-500 ring-2 ring-blue-500/50'
                  : getStatusColor(file.status)
              } hover:border-blue-400`}
            >
              <div className={`aspect-square bg-gray-800`}>
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <p className="text-xs text-white truncate">{file.name}</p>
                {file.status === 'processing' && (
                  <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 animate-pulse w-2/3"></div>
                  </div>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFileRemove(file.id);
                }}
                className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-600 rounded text-white text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        {filteredFiles.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            {files.length === 0 ? 'No files loaded' : 'No files match your filters'}
          </div>
        )}
      </ScrollArea>

      {/* Footer Stats */}
      <div className="p-3 border-t border-gray-700 text-xs text-gray-400">
        <div className="flex justify-between">
          <span>Total: {files.length}</span>
          <span>Processed: {files.filter(f => f.processed).length}</span>
        </div>
      </div>
    </div>
  );
}
