import React, { useState } from 'react';
import { UploadCloud, FileText, Image, Video, Music, Archive, CheckCircle, X, AlertTriangle } from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendFile: (fileInfo: { fileName: string; fileSize: string; mediaUrl: string; messageType: 'IMAGE' | 'FILE' | 'VOICE' }) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onSendFile
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Size check (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setError("File size exceeds the 50MB limit.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleUploadAndSend = () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(15);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            let msgType: 'IMAGE' | 'FILE' | 'VOICE' = 'FILE';
            if (selectedFile.type.startsWith('image/')) msgType = 'IMAGE';
            else if (selectedFile.type.startsWith('audio/')) msgType = 'VOICE';

            // Create object URL for local preview
            const mediaUrl = URL.createObjectURL(selectedFile);

            onSendFile({
              fileName: selectedFile.name,
              fileSize: formatFileSize(selectedFile.size),
              mediaUrl,
              messageType: msgType
            });

            setIsUploading(false);
            setSelectedFile(null);
            setUploadProgress(0);
            onClose();
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  const getFileIcon = (mime: string) => {
    if (mime.startsWith('image/')) return <Image className="w-8 h-8 text-cyan-400" />;
    if (mime.startsWith('video/')) return <Video className="w-8 h-8 text-pink-400" />;
    if (mime.startsWith('audio/')) return <Music className="w-8 h-8 text-emerald-400" />;
    if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar')) return <Archive className="w-8 h-8 text-yellow-400" />;
    return <FileText className="w-8 h-8 text-indigo-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#0A0F1D] border border-[#00E5FF]/30 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-[#00E5FF]" />
            <span>Secure File & Media Sharing</span>
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!selectedFile ? (
          <label className="border-2 border-dashed border-white/15 hover:border-[#00E5FF]/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#050811]/60 group">
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.tar"
            />
            <div className="w-12 h-12 rounded-2xl bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-white mb-1">Click or drag file to share</p>
            <p className="text-[11px] text-slate-400 text-center">
              Supports Images, Videos, PDF, DOCX, XLSX, PPTX, and ZIP up to 50MB
            </p>
          </label>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-[#050811] rounded-2xl border border-white/10 flex items-center gap-3">
              {getFileIcon(selectedFile.type)}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">{selectedFile.name}</div>
                <div className="text-[11px] text-slate-400">{formatFileSize(selectedFile.size)}</div>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isUploading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>Uploading securely...</span>
                  <span className="font-mono text-[#00E5FF]">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    style={{ width: `${uploadProgress}%` }}
                    className="bg-gradient-to-r from-[#0066FF] to-[#00E5FF] h-full transition-all duration-150"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleUploadAndSend}
                disabled={isUploading}
                className="flex-1 py-2.5 bg-gradient-to-r from-[#0066FF] to-[#00E5FF] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#00E5FF]/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isUploading ? 'Sending...' : 'Send File'}
              </button>
              <button
                onClick={onClose}
                disabled={isUploading}
                className="py-2.5 px-4 bg-white/5 hover:bg-white/10 text-slate-300 text-xs rounded-xl font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
