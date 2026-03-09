import { useState } from 'react';
import { ChevronDown, ChevronRight, Droplet, Eraser, Sparkles, Settings2 } from 'lucide-react';
import * as Collapsible from '@radix-ui/react-collapsible';
import * as Switch from '@radix-ui/react-switch';

export interface RemovalSettings {
  mode: 'ai' | 'color';
  color: string;
  threshold: number;
  aiModel: string;
  feather: number;
  smoothEdges: boolean;
  decontaminateColors: boolean;
  outputMode: 'transparent' | 'solid' | 'image';
  outputColor: string;
  format: 'png' | 'jpg' | 'webp';
}

interface SettingsPanelProps {
  settings: RemovalSettings;
  onSettingsChange: (settings: RemovalSettings) => void;
  onStartProcessing: () => void;
  isProcessing: boolean;
  isDrawingProtectRegion: boolean;
  onDrawingProtectRegionChange: (value: boolean) => void;
}

export function SettingsPanel({ 
  settings, 
  onSettingsChange, 
  onStartProcessing, 
  isProcessing,
  isDrawingProtectRegion,
  onDrawingProtectRegionChange
}: SettingsPanelProps) {
  const [openSections, setOpenSections] = useState<string[]>([
    'removal',
    'protection',
    'output'
  ]);

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const updateSetting = <K extends keyof RemovalSettings>(
    key: K,
    value: RemovalSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const CollapsibleSection = ({ 
    id, 
    title, 
    icon: Icon, 
    children 
  }: { 
    id: string; 
    title: string; 
    icon: any; 
    children: React.ReactNode 
  }) => (
    <Collapsible.Root
      open={openSections.includes(id)}
      onOpenChange={() => toggleSection(id)}
      className="border-b border-gray-700"
    >
      <Collapsible.Trigger className="w-full p-3 flex items-center justify-between hover:bg-gray-800 transition-colors">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-200">{title}</span>
        </div>
        {openSections.includes(id) ? (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400" />
        )}
      </Collapsible.Trigger>
      <Collapsible.Content className="p-4 pt-0 space-y-4">
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  );

  return (
    <div className="h-full flex flex-col bg-gray-900 border-l border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          Processing Settings
        </h2>
      </div>

      {/* Scrollable Settings */}
      <div className="flex-1 overflow-y-auto">
        {/* Removal Settings */}
        <CollapsibleSection id="removal" title="Removal Settings" icon={Sparkles}>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Removal Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateSetting('mode', 'ai')}
                  className={`px-3 py-2 text-xs rounded transition-colors ${
                    settings.mode === 'ai'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
                  }`}
                >
                  AI Removal
                </button>
                <button
                  onClick={() => updateSetting('mode', 'color')}
                  className={`px-3 py-2 text-xs rounded transition-colors ${
                    settings.mode === 'color'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
                  }`}
                >
                  Color-based
                </button>
              </div>
            </div>

            {settings.mode === 'ai' && (
              <div>
                <label className="text-xs text-gray-400 mb-2 block">AI Model</label>
                <select
                  value={settings.aiModel}
                  onChange={(e) => updateSetting('aiModel', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="u2net">U2Net (Balanced)</option>
                  <option value="u2netp">U2Net-P (Fast)</option>
                  <option value="isnet">ISNet (High Quality)</option>
                  <option value="sam">SAM Segmentation</option>
                </select>
              </div>
            )}

            {settings.mode === 'color' && (
              <>
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Background Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.color}
                      onChange={(e) => updateSetting('color', e.target.value)}
                      className="h-10 w-16 bg-gray-800 border border-gray-700 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.color}
                      onChange={(e) => updateSetting('color', e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-2 block">
                    Tolerance: {settings.threshold}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.threshold}
                    onChange={(e) => updateSetting('threshold', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </>
            )}
          </div>
        </CollapsibleSection>

        {/* Subject Protection */}
        <CollapsibleSection id="protection" title="Subject Protection" icon={Droplet}>
          <div className="space-y-3">
            <button
              onClick={() => onDrawingProtectRegionChange(!isDrawingProtectRegion)}
              className={`w-full px-3 py-2 text-sm rounded flex items-center justify-center gap-2 transition-colors ${
                isDrawingProtectRegion
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
              }`}
            >
              <Droplet className="h-4 w-4" />
              {isDrawingProtectRegion ? 'Drawing Enabled' : 'Enable Protect Region'}
            </button>
            <p className="text-xs text-gray-500">
              Draw a rectangle on the preview to protect areas from removal
            </p>
          </div>
        </CollapsibleSection>

        {/* Manual Editing Tools */}
        <CollapsibleSection id="editing" title="Manual Editing" icon={Eraser}>
          <div className="space-y-2">
            <button className="w-full px-3 py-2 bg-gray-800 text-gray-400 hover:bg-gray-750 rounded text-sm flex items-center gap-2 transition-colors">
              <Eraser className="h-4 w-4" />
              Erase Brush
            </button>
            <button className="w-full px-3 py-2 bg-gray-800 text-gray-400 hover:bg-gray-750 rounded text-sm flex items-center gap-2 transition-colors">
              <Sparkles className="h-4 w-4" />
              Restore Brush
            </button>
            <button className="w-full px-3 py-2 bg-gray-800 text-gray-400 hover:bg-gray-750 rounded text-sm flex items-center gap-2 transition-colors">
              <Sparkles className="h-4 w-4" />
              Edge Refinement
            </button>
          </div>
        </CollapsibleSection>

        {/* Edge & Quality */}
        <CollapsibleSection id="quality" title="Edge & Quality" icon={Settings2}>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Feather: {settings.feather}px
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={settings.feather}
                onChange={(e) => updateSetting('feather', Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">Smooth Edges</label>
              <Switch.Root
                checked={settings.smoothEdges}
                onCheckedChange={(checked) => updateSetting('smoothEdges', checked)}
                className="w-11 h-6 bg-gray-700 rounded-full relative data-[state=checked]:bg-blue-600 transition-colors"
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
              </Switch.Root>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">Decontaminate Colors</label>
              <Switch.Root
                checked={settings.decontaminateColors}
                onCheckedChange={(checked) => updateSetting('decontaminateColors', checked)}
                className="w-11 h-6 bg-gray-700 rounded-full relative data-[state=checked]:bg-blue-600 transition-colors"
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
              </Switch.Root>
            </div>
          </div>
        </CollapsibleSection>

        {/* Background Output */}
        <CollapsibleSection id="output" title="Background Output" icon={Droplet}>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Output Mode</label>
              <div className="space-y-2">
                <button
                  onClick={() => updateSetting('outputMode', 'transparent')}
                  className={`w-full px-3 py-2 text-sm rounded text-left transition-colors ${
                    settings.outputMode === 'transparent'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
                  }`}
                >
                  Transparent (PNG)
                </button>
                <button
                  onClick={() => updateSetting('outputMode', 'solid')}
                  className={`w-full px-3 py-2 text-sm rounded text-left transition-colors ${
                    settings.outputMode === 'solid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
                  }`}
                >
                  Solid Color
                </button>
                <button
                  onClick={() => updateSetting('outputMode', 'image')}
                  className={`w-full px-3 py-2 text-sm rounded text-left transition-colors ${
                    settings.outputMode === 'image'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
                  }`}
                >
                  Image Background
                </button>
              </div>
            </div>

            {settings.outputMode === 'solid' && (
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Background Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.outputColor}
                    onChange={(e) => updateSetting('outputColor', e.target.value)}
                    className="h-10 w-16 bg-gray-800 border border-gray-700 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.outputColor}
                    onChange={(e) => updateSetting('outputColor', e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Output Format</label>
              <select
                value={settings.format}
                onChange={(e) => updateSetting('format', e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
                <option value="webp">WEBP</option>
              </select>
            </div>
          </div>
        </CollapsibleSection>

        {/* Performance */}
        <CollapsibleSection id="performance" title="Performance" icon={Settings2}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">Parallel Processing</label>
              <Switch.Root
                defaultChecked
                className="w-11 h-6 bg-gray-700 rounded-full relative data-[state=checked]:bg-blue-600 transition-colors"
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
              </Switch.Root>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">Memory-Safe Mode</label>
              <Switch.Root
                className="w-11 h-6 bg-gray-700 rounded-full relative data-[state=checked]:bg-blue-600 transition-colors"
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
              </Switch.Root>
            </div>
          </div>
        </CollapsibleSection>
      </div>

      {/* Process Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onStartProcessing}
          disabled={isProcessing}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors font-medium"
        >
          {isProcessing ? 'Processing...' : 'Start Batch Processing'}
        </button>
      </div>
    </div>
  );
}
