import React, { useRef, useState } from 'react';
import { Upload, Video, Image as ImageIcon, Sparkles, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { MediaType, SampleMediaItem } from '../types/detection';
import { DUMMY_SAMPLES } from '../utils/sampleData';

interface UploadDropzoneProps {
  currentMediaType: MediaType;
  onChangeMediaType: (type: MediaType) => void;
  onMediaLoaded: (file: { name: string; type: MediaType; url: string; sizeFormatted: string }) => void;
  onSelectSample: (sample: SampleMediaItem) => void;
  isAnalyzing: boolean;
  hasLoadedMedia: boolean;
  onTriggerAnalysis: () => void;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  currentMediaType,
  onChangeMediaType,
  onMediaLoaded,
  onSelectSample,
  isAnalyzing,
  hasLoadedMedia,
  onTriggerAnalysis
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    const isVideo = file.type.startsWith('video/') || file.name.match(/\.(mp4|mov|webm|avi|mkv)$/i);
    const mediaType: MediaType = isVideo ? 'video' : 'image';
    const url = URL.createObjectURL(file);
    const sizeFormatted = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

    onChangeMediaType(mediaType);
    onMediaLoaded({
      name: file.name,
      type: mediaType,
      url,
      sizeFormatted
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div className="w-full">
      {/* Upload Box Container */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 p-8 text-center ${
          isDragOver
            ? 'border-rose-500 bg-rose-950/20'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/50 backdrop-blur-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={currentMediaType === 'video' ? 'video/mp4,video/webm,video/quicktime' : 'image/png,image/jpeg,image/webp'}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Media Type Selector Bar */}
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => onChangeMediaType('video')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentMediaType === 'video'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video Inspection</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeMediaType('image')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentMediaType === 'image'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Image Inspection</span>
            </button>
          </div>
        </div>

        {/* Upload Visual Area */}
        <div className="max-w-md mx-auto">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 shadow-inner">
            <Upload className="w-6 h-6 text-rose-400" />
          </div>

          <h3 className="text-base font-semibold text-slate-100 mb-1.5">
            Upload {currentMediaType === 'video' ? 'video footage' : 'still image'} for frame-by-frame forensic scan
          </h3>
          <p className="text-xs text-slate-400 mb-5 leading-relaxed">
            {currentMediaType === 'video'
              ? 'Videos are automatically decoded into still image frames to render localized heat maps across multiple frames on screen.'
              : 'Still images are analyzed across spatial frequency bands with localized anomaly heat maps.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-lg text-xs font-medium transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            >
              Select {currentMediaType === 'video' ? 'Video File' : 'Image File'}
            </button>

            {hasLoadedMedia && (
              <button
                type="button"
                onClick={onTriggerAnalysis}
                disabled={isAnalyzing}
                className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold tracking-wide transition-all shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                {isAnalyzing ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Extracting & Analyzing Frames...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Extract Image Frames & Render Heat Maps</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Quick Preloaded Dummy Samples Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-3">
            Or test instantly with pre-loaded forensic test sets:
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 max-w-2xl mx-auto">
            {DUMMY_SAMPLES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => onSelectSample(sample)}
                className={`p-2.5 rounded-lg border text-left transition-all group ${
                  sample.category === 'fake'
                    ? 'border-rose-950/80 bg-rose-950/20 hover:border-rose-700/60'
                    : 'border-emerald-950/80 bg-emerald-950/20 hover:border-emerald-700/60'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span
                    className={
                      sample.category === 'fake'
                        ? 'text-rose-400 font-semibold'
                        : 'text-emerald-400 font-semibold'
                    }
                  >
                    {sample.category === 'fake' ? 'FAKE' : 'REAL'}
                  </span>
                  <span className="text-slate-500 text-[10px] uppercase">{sample.type}</span>
                </div>
                <div className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                  {sample.title}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
